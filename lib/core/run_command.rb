require 'core/command'

module Nutella
  # This class describes a run command which can be either start or stop.
  # It is mostly a commodity class for code reuse.
  class RunCommand < Command

    def run (args=nil)
      console.error 'Running generic RunCommand!!! WAT?'
    end

    # Extracts run name and run_id
    # @param [Array<String>] args command line arguments passed to the command
    # @return [String, String ]  the run name (cleaned of nils) and the run_id
    def extract_names( args )
      # Check that the run name passed as parameter is not nil
      run = args.nil? ? nil : args[0]
      # Extract run_id
      run_id = args.nil? ? Nutella.runlist.extract_run_id( '' ) : Nutella.runlist.extract_run_id( args[0] )
      return run, run_id
    end

    # Executes a code block for each actor in a certain directory
    # @param [String] actors_dir directory where we are iterating
    # @yield [actor_dir] Gives the actor directory to the block
    def for_each_actor_in_dir( actors_dir, &block )
      Dir.entries(actors_dir).select {|entry| File.directory?(File.join(actors_dir, entry)) && !(entry =='.' || entry == '..') }.each do |actor_dir|
        block.call actor_dir
      end
    end


    def output_success_message(run_id, run, action)
      if run_id == Nutella.current_project.config['name']
        console.success "Project #{Nutella.current_project.config['name']} #{action}!"
      else
        console.success "Project #{Nutella.current_project.config['name']}, run #{run} #{action}!"
      end
    end


  end

end