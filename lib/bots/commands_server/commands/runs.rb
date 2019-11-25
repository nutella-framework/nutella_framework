# frozen_string_literal: true

require_relative 'meta/command'

module CommandsServer
  class Runs < Command
    @description = 'Displays a list of runs for the current application or all applications'

    def run(args = nil)
      # If invoked with "all" it will show all the runs under this instance of nutella
      if args[0] == '--all' || args[0] == '-a'
        display_all_runs
      else
        # If the current directory is not a nutella application, return
        unless Nutella.current_app.exist?
          console.warn 'The current directory is not a nutella application'
          return
        end
        # Display list of runs for current nutella application
        display_app_runs
      end
    end

    private

    def display_all_runs
      if Nutella.runlist.empty?
        console.info 'You are not running any nutella apps'
      else
        console.info 'Currently running:'
        Nutella.runlist.all_runs.each do |app_id, _|
          console.info "#{app_id}:"
          Nutella.runlist.runs_for_app(app_id).each do |run_id|
            console.info "  #{run_id}"
          end
        end
      end
    end

    def display_app_runs
      app_id = Nutella.current_app.config['name']
      app_runs = Nutella.runlist.runs_for_app app_id
      console.info "Currently running #{app_runs.length} instances of app '#{app_id}':"
      app_runs.each do |run_id|
        console.info "  #{run_id}"
      end
    end
  end
end
