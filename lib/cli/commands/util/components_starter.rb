require_relative 'components_list'
require 'tmux/tmux'

# Utility functions to start components
class ComponentsStarter

  # Starts the internal broker if it's not started already
  # @return [boolean] true if the broker is correctly started, false otherwise
  def self.start_internal_broker
    # Check if the broker has been started already, if it is, return
    return true if broker_started?
    # Check that broker is not running 'unsupervised' (i.e. check port 1883), if it is, return
    return true unless broker_port_free?
    # Broker is not running  so we try to start the internal broker
    cid = `docker run -p 1883:1883 -p 1884:80 -d -v #{Nutella.config['broker_dir']}:/db matteocollina/mosca:v2.3.0`
    # Wait a bit to give the chance to the broker to actually start up
    sleep 1
    # All went well so we return true
    true
  end


  # Starts mongodb if it's not started already.
  # This operation is only necessary on mac because Ubuntu automatically
  # installs mongo as a service and runs it.
  # @return [boolean] true if mongo has been correctly started, false otherwise
  def self.start_mongo_db
    pid_file_path = "#{Nutella.config['config_dir']}.mongo_pid"
    # Check if the process with pid indicated in the pidfile is alive
    return true if sanitize_pid_file pid_file_path
    # Check that mongo is not running 'unsupervised' (i.e. check port 27017), if it is, return
    return true unless mongo_port_free?
    # Mongo is not running and there is no pid file so we try to start it and create a new pid file.
    # Note that the pid file is created by the `startup` script, not here.
    pid = fork
    exec("mongod --config /usr/local/etc/mongod.conf > /dev/null 2>&1 & \necho $! > #{pid_file_path}") if pid.nil?
    # Wait a bit to give the chance to mongo to actually start up
    sleep 1
    # All went well so we return true
    true
  end


  # Starts all framework components. If order.json is present, components are started
  # in that order.
  # @return [boolean] true if all components are started correctly, false otherwise
  def self.start_framework_components
    nutella_components_dir = "#{Nutella::NUTELLA_HOME}framework_components"
    if File.exist? "#{nutella_components_dir}/order.json"
      components_list = JSON.parse IO.read "#{nutella_components_dir}/order.json"
    else
      components_list = ComponentsList.components_in_dir nutella_components_dir
    end
    components_list.each do |component|
      if File.exist? "#{nutella_components_dir}/#{component}/startup"
        unless start_framework_component "#{nutella_components_dir}/#{component}"
          return false
        end
      end
    end
    true
  end


  # Starts the application level bots
  # @return [boolean] true if all bots are started correctly, false otherwise
  def self.start_app_bots( app_id, app_path )
    app_bots_list = Nutella.current_app.config['app_bots']
    bots_dir = "#{app_path}/bots/"
    # If app bots have been started already, then do nothing
    unless Nutella::Tmux.session_exist? Nutella::Tmux.app_bot_session_name app_id
      # Start all app bots in the list into a new tmux session
      tmux = Nutella::Tmux.new app_id, nil
      ComponentsList.for_each_component_in_dir bots_dir do |bot|
        unless app_bots_list.nil? || !app_bots_list.include?( bot )
          # If there is no 'startup' script output a warning (because
          # startup is mandatory) and skip the bot
          unless File.exist?("#{bots_dir}#{bot}/startup")
            console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
            next
          end
          # Create a new window in the session for this run
          tmux.new_app_bot_window bot
        end
      end
    end
    true
  end


  def self.start_run_bots( bots_list, app_path, app_id, run_id )
    # Create a new tmux instance for this run
    tmux = Nutella::Tmux.new app_id, run_id
    # Fetch bots dir
    bots_dir = "#{app_path}/bots/"
    # Start the appropriate bots
    bots_list.each { |bot| start_run_level_bot(bots_dir, bot, tmux) }
    true
  end


  #--- Private class methods --------------


  # Cleans the pid file of a given process
  # @param [String] pid_file_path the file storing the pid file of the process
  # @return [Boolean] true if the pid file exists AND the process with that pid is still alive
  def self.sanitize_pid_file( pid_file_path )
    # Does the pid file exist?
    # If it does we try to see if the process with that pid is still alive
    if File.exist? pid_file_path
      pid_file = File.open(pid_file_path, 'rb')
      pid = pid_file.read.to_i
      pid_file.close
      begin
        # If this statement doesn't throw an exception then a process with
        # this pid is still alive so we do nothing and just return true
        Process.getpgid pid
        return true
      rescue
        # If there is an exception, there is no process with this pid
        # so we have a stale pid file that we need to remove
        File.delete pid_file_path
        return false
      end
    end
    # If there is no pid file, there is no process running
    false
  end
  private_class_method :sanitize_pid_file


  # Checks if the broker is running already
  # @return [boolean] true if there is a container for the broker running already
  def self.broker_started?
    `docker ps --filter ancestor=matteocollina/mosca:v2.3.0 --format "{{.ID}}"` != ""
  end
  private_class_method :broker_started?

  # Checks if port 1883 (MQTT broker port) is free
  # or some other service is already listening on it
  # @return [boolean] true if there is no broker listening on port 1883, false otherwise
  def self.broker_port_free?
    begin
      s = TCPServer.new('0.0.0.0', 1883)
      s.close
    rescue
      return false
    end
    true
  end
  private_class_method :broker_port_free?


  # Checks if port 27017 (MongoDB standard port) is free
  # or some other service is already listening on it
  # @return [boolean] true if there is no mongo listening on port 27017, false otherwise
  def self.mongo_port_free?
    begin
      s = TCPServer.new('0.0.0.0', 27017)
      s.close
    rescue
      return false
    end
    true
  end
  private_class_method :mongo_port_free?


  # Starts a single framework component
  # @return [boolean] true if the component has been started successfully, false otherwise
  def self.start_framework_component( component_dir )
    pid_file_path = "#{component_dir}/.pid"
    return true if sanitize_pid_file pid_file_path
    # Component is not running and there is no pid file so we try to start it
    # and create a new pid file. Note that the pid file is created by
    # the startup script!
    # Framework components are started without any parameters passed to them because they have
    # full access to config, runlist and framework APIs using 'require_relative'
    command = "#{component_dir}/startup"
    pid = fork
    exec(command) if pid.nil?
    # Give it a second so they can start properly
    sleep 1
    # All went well so we return true
    true
  end
  private_class_method :start_framework_component


  # Starts a run level bot
  def self.start_run_level_bot( bots_dir, bot, tmux )
    # If there is no 'startup' script output a warning (because
    # startup is mandatory) and skip the bot
    unless File.exist?("#{bots_dir}#{bot}/startup")
      console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
      return
    end
    # Create a new window in the session for this run
    tmux.new_bot_window bot
  end
  private_class_method :start_run_level_bot

end