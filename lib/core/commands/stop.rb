require 'core/run_command'
require 'core/tmux'

module Nutella
  class Stop < RunCommand
    @description = 'Stops all or some of the bots in the current project'

    def run(args=nil)

      # If the current directory is not a nutella project, return
      return unless Nutella.current_project.exist?

      # Extract run (passed run name) and run_id
      run, run_id = extract_names args

      # Check that the run_id exists in the list and, if it is not,
      # return false
      return unless remove_from_run_list run_id

      # Stops all the bots
      Tmux.kill_session run_id

      # Stop all project level actors (if any) if needed
      stop_project_bots run_id

      # Stop all nutella internal actors, if needed
      if Nutella.runlist.empty?
        stop_nutella_actors
      end

      # If running on the internal broker, stop it if needed
      if Nutella.runlist.empty? and Nutella.config['broker'] == 'localhost'
        stop_broker
      end

      # Output success message
      output_success_message( run_id, run, 'stopped' )
    end
  
    
    private

    
    def remove_from_run_list( run_id )
      unless Nutella.runlist.delete? run_id
        console.warn "Run #{run_id} doesn't exist. Impossible to stop it."
        return false
      end
      true
    end


    def stop_project_bots( run_id )
      true
    end


    def stop_nutella_actors
      nutella_actors_dir = "#{Nutella.config['nutella_home']}actors"
      for_each_actor_in_dir nutella_actors_dir do |actor|
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

  
  end
end
