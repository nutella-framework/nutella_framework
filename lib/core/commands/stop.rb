require 'core/command'
require 'core/tmux'

module Nutella
  class Stop < Command
    @description = 'Stops all or some of the bots in the current project'

    def run(args=nil)

      # Check that the run name passed as parameter is not nil
      run = args.nil? ? nil : args[0]

      # If the current directory is not a nutella project, return
      return unless Nutella.current_project.exist?

      # Extract run_id
      run_id = args.nil? ? Nutella.runlist.extract_run_id( '' ) : Nutella.runlist.extract_run_id( args[0] )

      # Check that the run_id exists in the list and, if it is not,
      # return false
      return unless remove_from_run_list run_id

      # Stops all the bots
      Tmux.kill_session run_id

      # Stop all nutella internal actors, if needed
      if Nutella.runlist.empty?
        stop_nutella_actors
      end

      # If running on the internal broker, stop it if needed
      if Nutella.runlist.empty? and Nutella.config['broker'] == 'localhost'
        stop_broker
      end

      # Output success message
      output_success_message( run_id, run )
    end
  
    
    private
    
    
    
    def remove_from_run_list( run_id )
      unless Nutella.runlist.delete? run_id
        console.warn "Run #{run_id} doesn't exist. Impossible to stop it."
        return false
      end
      true
    end


    def stop_nutella_actors
      nutella_actors_dir = "#{Nutella.config['nutella_home']}actors"
      Dir.entries(nutella_actors_dir).select {|entry| File.directory?(File.join(nutella_actors_dir,entry)) && !(entry =='.' || entry == '..') }.each do |actor|
        pid_file_path = "#{nutella_actors_dir}/#{actor}/.pid"
        kill_process_with_pid pid_file_path
      end
    end


    def stop_broker
      pid_file_path = "#{Nutella.config['broker_dir']}/bin/.pid"
      kill_process_with_pid pid_file_path
    end


    # Does the process pid file exist?
    # If it does we send a SIGKILL to the process with that pid
    # to stop the process and delete the pid file
    def kill_process_with_pid( pid_file_path )
      if File.exist? pid_file_path
        pid_file = File.open( pid_file_path, 'rb' )
        pid = pid_file.read.to_i
        pid_file.close
        begin
          Process.kill( 'SIGKILL', pid )
        rescue
          # Pid file exists but process is dead. Do nothing
        end
        File.delete pid_file_path
      end
    end


    def output_success_message(run_id, run)
      if run_id == Nutella.current_project.config['name']
        console.success "Project #{Nutella.current_project.config['name']} stopped"
      else
        console.success "Project #{Nutella.current_project.config['name']}, run #{run} stopped"
      end
    end

  
  end
end
