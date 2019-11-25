# frozen_string_literal: true

require_relative 'command'
require_relative '../../util/components_list'

module CommandsServer
  # This class describes a run command which can be either start or stop.
  # It is mostly a commodity class for code reuse.
  class RunCommand < Command
    def run(_args = nil)
      console.error 'Running the generic RunCommand!!! WAT? https://www.destroyallsoftware.com/talks/wat'
    end

    # Extracts the run_id from the parameters passed to the command line
    # @param [Array<String>] args command line arguments passed to the command
    # @return [String, String ] the run_id
    def parse_run_id_from_args(args)
      # Simple `nutella start/stop` (no args)
      return 'default' if args.nil? || args.empty?

      # Check that the run_id is not 'default' and return it
      run_id = args[0]
      if run_id == 'default'
        raise StandardError, 'Unfortunately you can\'t use `default` as a run_id because it is reserved :('
      end

      run_id
    end

    #  Prints a success message if the command completes correctly
    def print_success_message(app_id, run_id, action)
      if run_id == 'default'
        console.success "Application #{app_id} #{action}!"
      else
        console.success "Application #{app_id}, run #{run_id} #{action}!"
      end
    end

    def compile_and_dependencies(script, in_progress_message, complete_message)
      # If the current directory is not a nutella application, return
      unless Nutella.current_app.exist?
        console.warn 'The current directory is not a nutella application'
        return
      end
      # Run script for all bots
      unless run_script_for_components_in("#{Dir.pwd}/bots", script, in_progress_message)
        return
      end
      # Run script for all interfaces
      unless run_script_for_components_in("#{Dir.pwd}/interfaces", script, in_progress_message)
        return
      end

      # Output success message
      console.success "All #{complete_message} for #{Nutella.current_app.config['name']}"
    end

    private

    # Runs a script for each component in a certain directory.
    # Message is displayed in case something goes wrong
    def run_script_for_components_in(dir, script, message)
      ComponentsList.for_each_component_in_dir dir do |component|
        # Skip component if there is no script
        next unless File.exist? "#{dir}/#{component}/#{script}"

        # Output message
        console.info "#{message} #{component}."
        # Execute 'script' script
        cur_dir = Dir.pwd
        Dir.chdir "#{dir}/#{component}"
        system "./#{script}"
        Dir.chdir cur_dir
      end
      true
    end
  end
end
