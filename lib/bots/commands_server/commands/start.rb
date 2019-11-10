require_relative 'meta/run_command'

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

      if no_app_bot_to_start app_id, app_path, params
        console.warn "Run #{run} not created: your application bots are already started and you specified no regular bots exclusively for this run"
        return
      end

      return if run_exist?( app_id, run_id)

      return unless start_all_components(app_id, app_path, run_id, params)

      return unless Nutella.runlist.add?(app_id, run_id, app_path)

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
    def no_app_bot_to_start(app_id, app_path, params)
      ComponentsList.run_level_bots_list(app_path, params).empty? && app_bots_started?(app_id)
    end


    # Returns true if the app bots have been started already
    def app_bots_started?( app_id )
      Tmux.session_exist? Tmux.app_bot_session_name app_id
    end


    # Check that the run_id we are trying to start has not been started already
    def run_exist?( app_id, run_id)
      if Nutella.runlist.include?(app_id, run_id)
        # If the run_id is already in the list, check that it is actually live
        if Tmux.session_exist? Tmux.session_name(app_id, run_id)
          console.error 'Impossible to start nutella app: an instance of this app with the same run_id is already running!'
          console.error "You might want to kill it with 'nutella stop #{run_id}'"
          return true
        end
      end
      false
    end


    # Starts all the components at all levels for this run
    def start_all_components( app_id, app_path, run_id, params )
      # Start the internal broker
      return false unless ComponentsStarter.start_internal_broker
      # Start mongo db
      return false unless ComponentsStarter.start_mongo_db
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
      if ComponentsList.run_level_bots_list(app_path, params).empty? && !Nutella.runlist.app_has_no_bots(app_id)
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
      # Only print bots monitoring info if there bots in the run
      unless Nutella.runlist.app_has_no_bots app_id
        console.success "Do `tmux attach-session -t #{Tmux.session_name(app_id,run_id)}` to monitor your bots."
      end
      # Main interface is always available
      console.success "Go to http://localhost:#{Nutella.config['main_interface_port']}/#{app_id}/#{run_id} to access your interfaces"
    end



  end
end

# # Starts the application level bots
    # # @return [boolean] true if all bots are started correctly, false otherwise
    # def self.start_app_bots( app_id, app_path )
    #   app_bots_list = Nutella.current_app.config['app_bots']
    #   bots_dir = "#{app_path}/bots/"
    #   # If app bots have been started already, then do nothing
    #   unless Nutella::Tmux.session_exist? Nutella::Tmux.app_bot_session_name app_id
    #     # Start all app bots in the list into a new tmux session
    #     tmux = Nutella::Tmux.new app_id, nil
    #     ComponentsList.for_each_component_in_dir bots_dir do |bot|
    #       unless app_bots_list.nil? || !app_bots_list.include?( bot )
    #         # If there is no 'startup' script output a warning (because
    #         # startup is mandatory) and skip the bot
    #         unless File.exist?("#{bots_dir}#{bot}/startup")
    #           console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
    #           next
    #         end
    #         # Create a new window in the session for this run
    #         tmux.new_app_bot_window bot
    #       end
    #     end
    #   end
    #   true
    # end


    # def self.start_run_bots( bots_list, app_path, app_id, run_id )
    #   # Create a new tmux instance for this run
    #   tmux = Nutella::Tmux.new app_id, run_id
    #   # Fetch bots dir
    #   bots_dir = "#{app_path}/bots/"
    #   # Start the appropriate bots
    #   bots_list.each { |bot| start_run_level_bot(bots_dir, bot, tmux) }
    #   true
    # end


    # #--- Private class methods --------------

    # # Starts a run level bot
    # def self.start_run_level_bot( bots_dir, bot, tmux )
    #   # If there is no 'startup' script output a warning (because
    #   # startup is mandatory) and skip the bot
    #   unless File.exist?("#{bots_dir}#{bot}/startup")
    #     console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
    #     return
    #   end
    #   # Create a new window in the session for this run
    #   tmux.new_bot_window bot
    # end
    # private_class_method :start_run_level_bot