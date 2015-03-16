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

      begin
        run_id, params = parse_cli args
      rescue StandardError => e
        console.error e.message
        return
      end

      app_id, app_path = fetch_app_details

      if no_bot_to_start(app_id, app_path, params)
        console.warn "Run #{run} not created: your application bots are already started and you specified no regular bots exclusively for this run"
        return
      end

      return unless add_to_run_list( app_id, run_id, app_path )

      return unless start_all_components(app_id, app_path, run_id, params)

      # Output messages
      print_confirmation(run_id, params, app_id, app_path)
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


    # Returns true if both the list of run level bots is empty and the app bots
    # have been started already
    def no_bot_to_start(app_id, app_path, params)
      return run_level_bots_list(app_path, params).empty? && app_bots_started?(app_id)
    end


    # Returns the list of run-level bots for this run
    # Depending on the mode we are in, we want to start only some bots, exclude only some bots or start all bots
    def run_level_bots_list( app_path, params )
      # Fetch the list of all components in the bots dir
      all_bots = components_in_dir "#{app_path}/bots/"
      # Fetch the list of app bots
      app_bots = Nutella.current_app.config['app_bots']
      # Return correct list based on the mode we are in
      case start_mode(params)
        when :WITH
          return  get_with_bots_list params[:with], app_bots
        when :WO
          return get_wo_bots_list all_bots, app_bots, params[:without]
        when :ALL
          return get_all_bots_list all_bots, app_bots
        else
          # If we get here it means we are both in with and without mode and something went very wrong...
          raise 'You are using simultaneously with and without modes. This should not happen. Please contact developers.'
      end
    end

    def start_mode(params)
      return :WITH unless params[:with].empty?
      return :WO unless params[:without].empty?
      :ALL if params[:with].empty? && params[:without].empty?
    end

    # If we are in "with mode", we want to run only the bots in the "with list" (minus the ones in app_bots_list)
    def get_with_bots_list( incl_bots, app_bots)
      return app_bots.nil? ? incl_bots : incl_bots - app_bots
    end

    # If we are in "without mode", we want to run all the bots in the bots_list minus the ones in the "without list" and in the "app bots list"
    def get_wo_bots_list( all_bots, app_bots, excl_bots )
      return app_bots.nil? ? all_bots - excl_bots : all_bots - excl_bots - app_bots
    end

    # If we are in "all mode", we want to run all the bots minus the ones in the "app bots list"
    def get_all_bots_list( all_bots, app_bots )
      return app_bots.nil? ? all_bots : all_bots - app_bots
    end



    # Returns true if the app bots have been started already
    def app_bots_started?( app_id )
      Tmux.session_exist? Tmux.app_bot_session_name app_id
    end


    # Check that the run is unique and add it to the list of runs
    # If it's not, return (without adding the run to the list of course)
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


    # Starts all the components at all levels for this run
    def start_all_components( app_id, app_path, run_id, params )
      # Start the internal broker
      return false unless start_internal_broker
      # Start all framework-level components (if needed)
      return false unless start_framework_components
      # Start all app-level bots (if any, if needed)
      return false unless start_app_bots(app_id, app_path)
      # Start all run-level bots
      false unless start_run_bots( app_path, app_id, run_id, params )
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


    def start_framework_components
      nutella_components_dir = "#{Nutella::NUTELLA_HOME}framework_components"
      if File.exist? "#{nutella_components_dir}/order.json"
        components_list = JSON.parse IO.read "#{nutella_components_dir}/order.json"
      else
        components_list = components_in_dir(nutella_components_dir)
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
      # Give it a second so they can start properly
      sleep 1
      # All went well so we return true
      true
    end


    def start_app_bots( app_id, app_path )
      app_bots_list = Nutella.current_app.config['app_bots']
      bots_dir = "#{app_path}/bots/"
      # If app bots have been started already, then do nothing
      unless Tmux.session_exist? Tmux.app_bot_session_name app_id
        # Start all app bots in the list into a new tmux session
        tmux = Tmux.new app_id, nil
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


    def start_run_bots( app_path, app_id, run_id, params )
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


    def print_confirmation( run_id, params, app_id, app_path )
      # If there are no run-level bots to start, do not create the run and error out
      if run_level_bots_list(app_path, params).empty?
        console.warn 'This run doesn\'t seem to have any components. No run was created.'
        return
      end
      print_success_message(app_id, run_id, 'started')
      print_monitoring_details(app_id, run_id)
    end


    def print_monitoring_details( app_id, run_id )
      # Output broker info
      console.success "Application is running on broker: #{Nutella.config['broker']}"
      # If some application bots were started, say it
      app_bots_list = Nutella.current_app.config['app_bots']
      unless app_bots_list.nil? || app_bots_list.empty?
        console.success "Do `tmux attach-session -t #{Tmux.app_bot_session_name(app_id)}` to monitor your app bots."
      end
      # Output rest of monitoring info
      console.success "Do `tmux attach-session -t #{Tmux.session_name(app_id,run_id)}` to monitor your bots."
      console.success "Go to http://localhost:#{Nutella.config['main_interface_port']}/#{app_id}/#{run_id} to access your interfaces"
    end


  end
  
end

