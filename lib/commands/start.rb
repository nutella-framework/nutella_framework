require 'commands/meta/run_command'
require 'commands/util/components_starter'

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
        run_id, params = parse_cli_arguments args
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
    def parse_cli_arguments( args )
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
      ComponentsList.run_level_bots_list(app_path, params).empty? && app_bots_started?(app_id)
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
      return false unless ComponentsStarter.start_internal_broker
      # Start all framework-level components (if needed)
      return false unless ComponentsStarter.start_framework_components
      # Start all app-level bots (if any, if needed)
      return false unless ComponentsStarter.start_app_bots(app_id, app_path)
      # Start all run-level bots
      false unless ComponentsStarter.start_run_bots(ComponentsList.run_level_bots_list(app_path, params), app_path, app_id, run_id)
      true
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

