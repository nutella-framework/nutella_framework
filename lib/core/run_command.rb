require 'core/command'
require 'slop'

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

      # Simple `nutella start`
      if args.nil? || args.empty?
        run = nil
        run_id = Nutella.runlist.extract_run_id( '' )
        return run, run_id
      end

      # Check if the first argument is a parameter or a run name
      if args[0].start_with? '-'
        run = nil
        run_id = Nutella.runlist.extract_run_id( '' )
      else
        # If it's a run name, store the run name and shift so we are left with only
        # the parameters in args
        run = args[0]
        run_id = Nutella.runlist.extract_run_id( args[0] )
        # It
        args.shift
      end

      # Extract parameters
      params = extract_parameters args

      return run, run_id, params
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
    
    
    def prepare_bot( cur_prj_dir, script, message )
      for_each_actor_in_dir cur_prj_dir do |bot|
        # Skip bot if there is no script
        next unless File.exist? "#{cur_prj_dir}/bots/#{bot}/#{script}"
        # Output message
        console.info "#{message} bot #{bot}."
        # Execute 'dependencies' script
        cur_dir = Dir.pwd
        Dir.chdir "#{cur_prj_dir}/bots/#{bot}"
        system "./#{script}"
        Dir.chdir cur_dir
      end
      true
    end


    private


    def extract_parameters( args )
      opts = Slop::Options.new
      opts.array '-a', '--app', 'A list of application level actors'
      opts.array '-wo', '--without', 'A list of actors NOT to start'
      opts.array '-w', '--with', 'A list of actors that needs to be started'
      parser = Slop::Parser.new(opts)
      result = parser.parse(args)
      result.to_hash
    end


  end

end