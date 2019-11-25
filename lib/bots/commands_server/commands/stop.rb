# frozen_string_literal: true

require_relative 'meta/run_command'

module CommandsServer
  class Stop < RunCommand
    @description = 'Stops all the bots in the current application'

    def run(_opts = nil)
      # If the current directory is not a nutella application, return
      unless Nutella.current_app.exist?
        console.warn 'The current directory is not a nutella application'
        return
      end

      # Extract run (passed run name) and run_id
      run_id = parse_run_id_from args
      app_id = Nutella.current_app.config['name']

      # Check that the specified run exists in the list and, if it doesn't, return
      return unless remove_from_run_list app_id, run_id

      # Stops all run-level bots
      Tmux.kill_run_session app_id, run_id

      # Stop all app-level bots (if any, if needed)
      stop_app_bots app_id

      # Stop all framework-level components (if needed)
      stop_framework_components if Nutella.runlist.empty?

      # If running on the internal broker, stop it if needed
      if Nutella.runlist.empty?
        stop_internal_broker
        stop_mongo
      end

      # Output success message
      print_success_message(app_id, run_id, 'stopped')
    end

    private

    def remove_from_run_list(app_id, run_id)
      unless Nutella.runlist.delete? app_id, run_id
        console.warn "Run #{run_id} doesn't exist. Impossible to stop it."
        return false
      end
      true
    end

    def stop_app_bots(app_id)
      tmux_session_name = Tmux.app_bot_session_name app_id
      if Tmux.session_exist? tmux_session_name
        # Are there any run of this app hinging on the app bots?
        if Nutella.runlist.runs_for_app(app_id).empty?
          Tmux.kill_app_session app_id
        end
      end
      true
    end

    def stop_framework_components
      nutella_components_dir = "#{Nutella::NUTELLA_SRC}framework_components"
      ComponentsList.for_each_component_in_dir nutella_components_dir do |component|
        pid_file_path = "#{nutella_components_dir}/#{component}/.pid"
        kill_process_with_pid pid_file_path
      end
    end

    def stop_internal_broker
      cid = `docker ps --filter ancestor=matteocollina/mosca:v2.3.0 --format "{{.ID}}"`
      `docker kill #{cid}`
    end

    def stop_mongo
      pid_file_path = "#{Nutella.config['home_dir']}.mongo_pid"
      kill_process_with_pid pid_file_path
    end

    # Does the process pid file exist?
    # If it does we send a SIGKILL to the process with that pid
    # to stop the process and delete the pid file
    def kill_process_with_pid(pid_file_path)
      if File.exist? pid_file_path
        pid_file = File.open(pid_file_path, 'rb')
        pid = pid_file.read.to_i
        pid_file.close
        begin
          Process.kill('SIGKILL', pid)
        rescue StandardError
          # Pid file exists but process is dead. Do nothing
        end
        File.delete pid_file_path
      end
    end
  end
end
