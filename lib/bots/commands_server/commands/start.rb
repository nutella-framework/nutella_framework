# frozen_string_literal: true

require 'docker-api'
require 'config/config'
require 'config/runlist'
require 'config/app'
require_relative 'meta/run_command'

module CommandsServer
  class Start < RunCommand
    @description = 'Starts all or some of the bots in the current application'

    def run(opts = nil)
      # If opts['current_dir'] is not a nutella application, return and error
      unless Nutella::App.exist?(opts['current_dir'])
        return failure('The current directory is not a nutella application', 'error')
      end

      # Extract app path and id (i.e. name)
      app = Nutella::App.new(opts['current_dir'])
      # If there is an error parsing the run_id, return an error
      begin
        run_id = parse_run_id_from_args(opts['args'])
      rescue StandardError => e
        return failure(e.message, 'error')
      end
      # Check if there are actully bots that need to be started...
      if app_bots_running_already?(app) && app.run_level_bots.empty?
        return failure("Run #{run_id} not created!\n
          Your app bots are running already and your application has no run bots.\n
          No run was created. Are you sure that's what you wanted to do?", 'warn')
      end
      if run_exist?(app.id, run_id)
        return failure("Impossible to start nutella app!\n
          An instance of this app with the same run_id is already running!\n
          You might want to kill it with 'nutella stop #{run_id}'", 'warn')
      end
      # Start bots and create run
      begin
        start_app_level_bots(app)
        start_run_level_bots(app, run_id)
        runlist.add?(app.path, app.id, run_id)
      rescue StandardError => e
        return failure(e.message, 'error')
      end
      success(success_message(app, run_id))
    end

    private

    # Returns true if the app bots have been started already
    def app_bots_running_already?(_app)
      # TODO: look a what the app level bots are (via app.app_level_bots)
      # Fetch the list of running app bots for app.id from docker
      # If eq, all app bots are running, return true
      false
    end

    # Check that the run_id we are trying to start has not been started already
    def run_exist?(app_id, run_id)
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

    # Starts app level bots
    def start_run_level_bots(app)
      # TODO: implement
    end

    # Starts run level bots
    def start_run_level_bots(app, run_id)
      # TODO: implement
    end

    def success_message(app, run_id)
      # Initialized the message with the broker
      message = "Application is running on broker: #{Nutella::Config.file['broker']}\n"
      # If some app-level bots were started, say it
      # app_bots_list = Nutella.current_app.config['app_bots']
      # unless app_bots_list.nil? || app_bots_list.empty?
      #   console.success "Do `tmux attach-session -t #{Tmux.app_bot_session_name(app_id)}` to monitor your app bots."
      # end
      # Only print bots monitoring info if there bots in the run
      # unless Nutella.runlist.app_has_no_bots app_id
      #   console.success "Do `tmux attach-session -t #{Tmux.session_name(app_id, run_id)}` to monitor your bots."
      # end
      # Main interface is always available
      message += "Go to http://localhost:#{Nutella::Config.file['main_interface_port']}/#{app.id}/#{run_id} to access your interfaces\n"
    end

    def runlist
      @runlist ||= Nutella::RunList.new("#{Nutella::Config.file['home_dir']}/runlist.json")
    end
  end
end

# Executes a code block for each component in a certain directory
# @param [String] dir directory where we are iterating
# @yield [component] Passes the component name to the block
# def self.for_each_component_in_dir(dir, &block)
#   components_in_dir(dir).each { |component| block.call component }
# end

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
