require 'commands/meta/run_command'
require 'tmux/tmux'

module Nutella
  class Start < RunCommand
    @description = 'Starts all or some of the bots in the current application'

    def run(args=nil)

      # If the current directory is not a nutella application, return
      unless Nutella.current_app.exist?
        console.warn 'The current directory is not a nutella application'
        return
      end

      # Parse the run_id and parameters from the command line
      begin
        run_id, params = parse_cli args
      rescue StandardError => e
        console.error e.message
        return
      end

      # Extract the app_id and the path to the current app
      app_id, app_path = fetch_app_details

      # Check that there is at least a regular bot that will be started,
      # otherwise it makes no sense to create a run
      if run_level_bots_list(app_path, params).empty? && app_bots_started?(app_id)
        console.warn "Run #{run} not created: your application bots are already started and you specified no regular bots exclusively for this run"
        return
      end

      # Check that the run_id is unique and add it to the list of runs
      # If it's not, return (without adding the run_id to the list of course)
      return unless add_to_run_list( app_id, run_id, app_path )

      # Start the internal broker
      return unless start_internal_broker

      # Start all framework-level components (if needed)
      return unless start_nutella_actors

      # Start all app-level bots (if any)
      return unless start_app_bots(app_id, app_path)

      # Start all run-level bots
      return unless start_bots( app_path, app_id, run_id, params )

      # Output messages
      output_success_message(app_id, run_id, 'started' )
      output_monitoring_details(run_id, params, app_id, app_path)
    end


    private


    # Parses command line arguments
    def parse_cli( args )
      # Parse run_id
      run_id = parse_run_id_from args
      # Extract parameters
      params = parse_cli_parameters args
      # Check that we are not using 'with' and 'without' options at the same time
      unless params[:with].empty? || params[:without].empty?
        raise StandardError.new 'You can\'t use both --with and --without at the same time'
      end
      return run_id, params
    end


    # Fetches the app_id and app_path
    def fetch_app_details
      # Extract app_id
      app_id = Nutella.current_app.config['name']
      return app_id, Dir.pwd
    end


    # Returns the list of run-level bots
    def run_level_bots_list( app_path, params )
      # Fetch the list of app bots
      app_bots_list = Nutella.current_app.config['app_bots']
      # Fetch the list of all components in the bots dir
      bots_list = components_in_dir "#{app_path}/bots/"
      # Depending on the mode we are in, we want to start only some bots, exclude only some bots or start all bots
      # If we are in "with mode", we want to run only the bots in the "with list" (minus the ones in app_bots_list)
      unless params[:with].empty?
        return app_bots_list.nil? ? params[:with] : params[:with] - app_bots_list
      end
      # If we are in "without mode", we want to run all the bots in the bots_list minus the ones in the "without list and in the app_bots_list
      unless params[:without].empty?
        return app_bots_list.nil? ? bots_list - params[:without] : bots_list - params[:without] - app_bots_list
      end
      # If we are in "all mode", we want to run all the bots in the bots_list (minus the ones in the app_bots_list)
      if params[:with].empty? && params[:without].empty?
        return app_bots_list.nil? ? bots_list : bots_list - app_bots_list
      end
      # If we get here it means we are both in with and without mode and something went very wrong...
      raise 'You are using simultaneously with and without modes. This should not happen. Please contact developers.'
    end


    # Returns true if the app bots have been started already
    def app_bots_started?( app_id )
      Tmux.session_exist? Tmux.app_bot_session_name app_id
    end


    def add_to_run_list( app_id, run_id, prj_dir )
      unless Nutella.runlist.add?(app_id, run_id, prj_dir)
        # If the run_id is already in the list, check that it's actually live
        if Tmux.session_exist? Tmux.session_name(app_id, run_id)
          console.error 'Impossible to start nutella app: an instance of this app with the same run_id is already running!'
          console.error "You might want to kill it with 'nutella stop #{run_id}'"
          return false
        end
      end
      true
    end


    def start_internal_broker
      pid_file_path = "#{Nutella.config['broker_dir']}bin/.pid"
      # Check if the process with pid indicated in the pidfile is alive
      return true if sanitize_pid_file pid_file_path
      # Check that broker is not running 'unsupervised' (i.e. check port 1883), if it is, return
      return true unless broker_port_free?
      # Broker is not running and there is no pid file so we try to start
      # the internal broker and create a new pid file. Note that the pid file is created by
      # the `startup` script, not here.
      pid = fork
      exec("#{Nutella.config['broker_dir']}/startup") if pid.nil?
      # Wait a bit to give the chance to the broker to actually start up
      sleep 1
      # All went well so we return true
      true
    end


    # Cleans the pid file of a given process
    # @param [String] pid_file_path the file storing the pid file of the process
    # @return [Boolean] true if the pid file exists AND the process with that pid is still alive
    def sanitize_pid_file( pid_file_path )
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


    # Checks if port 1883 (MQTT broker port) is free
    # or some other service is already listening on it
    def broker_port_free?
      begin
        s = TCPServer.new('0.0.0.0', 1883)
        s.close
      rescue
        return false
      end
      true
    end


    def start_nutella_actors
      nutella_actors_dir = "#{Nutella::NUTELLA_HOME}framework_components"
      for_each_component_in_dir nutella_actors_dir do |actor|
        if File.exist? "#{nutella_actors_dir}/#{actor}/startup"
          unless start_framework_component "#{nutella_actors_dir}/#{actor}"
            return false
          end
        end
      end
      true
    end


    def start_framework_component( component_dir )
      pid_file_path = "#{component_dir}/.pid"
      return true if sanitize_pid_file pid_file_path
      # Component is not running and there is no pid file so we try to start it
      # and create a new pid file. Note that the pid file is created by
      # the startup script!
      nutella_config_file = "#{Nutella.config['config_dir']}config.json"
      runs_list_file = "#{Nutella.config['config_dir']}runlist.json"
      if nutella_config_file==nil || runs_list_file==nil
        return false
      end
      # We are passing the configuration file and the run list files paths to the framework components
      command = "#{component_dir}/startup #{nutella_config_file} #{runs_list_file}"
      pid = fork
      exec(command) if pid.nil?
      # All went well so we return true
      true
    end


    def start_app_bots( app_id, app_path )
      app_bots_list = Nutella.current_app.config['app_bots']
      bots_dir = "#{app_path}/bots/"
      # If app bots have been started already, then do nothing
      unless Tmux.session_exist? Tmux.app_bot_session_name app_id
        # Start all app bots in the list into a new tmux session
        tmux = Tmux.new app_id, _
        for_each_component_in_dir bots_dir do |bot|
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


    def start_bots( app_path, app_id, run_id, params )
      # Create a new tmux instance for this run
      tmux = Tmux.new app_id, run_id
      # Fetch bots dir
      bots_dir = "#{app_path}/bots/"
      # Start the appropriate bots
      run_level_bots_list( app_path, params ).each { |bot| start_run_level_bot(bots_dir, bot, tmux) }
      true
    end

    # Starts a run level bot
    def start_run_level_bot( bots_dir, bot, tmux )
      # If there is no 'startup' script output a warning (because
      # startup is mandatory) and skip the bot
      unless File.exist?("#{bots_dir}#{bot}/startup")
        console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
        return
      end
      # Create a new window in the session for this run
      tmux.new_bot_window bot
    end


    def output_monitoring_details( run_id, params, app_id, app_path )
      app_bots_list = Nutella.current_app.config['app_bots']
      unless app_bots_list.nil? || app_bots_list.empty?
        console.success "Do `tmux attach-session -t #{Tmux.app_bot_session_name(app_id)}` to monitor your app bots."
      end
      if run_level_bots_list(app_path, params).empty?
        console.success 'No tmux session was created for this run because you specified no regular bots for it'
      else
        console.success "Do `tmux attach-session -t #{Tmux.session_name(app_id,run_id)}` to monitor your bots."
      end
      console.success "Go to http://localhost:#{Nutella.config['main_interface_port']}/#{run_id} to access your interfaces"

    end


  end
  
end

