require_relative 'meta/run_command'

module Nutella
  class Start < RunCommand
    @description = 'Starts all or some of the bots in the current application'

    def run(opts=nil)
      # If opts['current_dir'] is not a nutella application, return and error
      unless is_nutella_app?(opts['current_dir'])
        return failure('The current directory is not a nutella application')
      end
      # Extract app path and id (i.e. name)
      app_path = opts['current_dir']
      app_id = app_config(app_path)['name']
      # If there is an error parsing the run_id, return an error
      begin
        run_id = parse_run_id_from_args(opts['args'])
      rescue StandardError => e
        return failure(e.message)
      end
      # TODO resume from here
      # Check if there are actully bots that need to be started...
      if app_bots_running_already(app_id)
        return success("Run #{run} not created: your app bots are running already and your application has no run bots)"
      end
      if run_exist?( app_id, run_id)
        return failure("Impossible to start nutella app: an instance of this app with the same run_id is already running!\nYou might want to kill it with 'nutella stop #{run_id}'")
      end
      # Start bots
      return unless start_all_components(app_id, app_path, run_id, params)
      return unless Nutella.runlist.add?(app_id, run_id, app_path)
      print_confirmation(run_id, params, app_id, app_path)
    end


    private


    # Checks that the provided directory is actually a nutella application
    # @return [Boolean] true if the directory is a nutella application, false otherwise
    def is_nutella_app?(dir)
      nutella_json_file_path = "#{dir}/nutella.json"
      # Check that there is a nutella.json file in the main directory of the application
      if !File.exist? nutella_json_file_path
        return false
      end
      # If there is a file, try to parse it
      begin
        conf = JSON.parse( IO.read(nutella_json_file_path) )
      rescue
        # Not valid JSON, returning false
        return false
      end
      # No nutella version in the file, return false
      if conf['nutella_version'].nil?
        return false
      end
      true
    end

    # Builds a PersistedHash of the application nutella.json file and returns it.
    # This method is used to ease access to the app nutella.json file.
    # @return [PersistedHash] the PersistedHash of the app nutella.json file
    def app_config(dir)
      PersistedHash.new("#{dir}/nutella.json")
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