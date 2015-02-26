require 'core/run_command'
require 'core/tmux'

module Nutella
  class Start < RunCommand
    @description = 'Starts all or some of the bots in the current project'

    def run(args=nil)

      # If the current directory is not a nutella project, return
      return unless Nutella.current_project.exist?

      # Extract run (passed run name) and run_id
      run, run_id = extract_names args

      # Check that the run name is different than the project name
      if run==Nutella.current_project.config['name']
        console.warn 'Your run name should be different than your project name'
        return
      end

      # Extract parameters
      begin
        params = extract_parameters args
      rescue
        console.warn 'The only supported parameters are --with (-w) and --without (-wo)'
        return
      end

      # Check that we are not using 'with' and 'without' options at the same time
      unless params[:with].empty? || params[:without].empty?
        console.warn 'You can\'t use both --with and --without at the same time'
        return
      end

      # Extract project directory
      cur_prj_dir = Nutella.current_project.dir

      # Check that there is at least a regular bot that will be started,
      # otherwise it makes no sense to create a run
      if bots_list_wo_project(cur_prj_dir, params).empty? && project_bots_started?
        console.warn "Run #{run} not created: your project bots are already started and you specified no regular bots exclusively for this run"
        return
      end

      # Check that the run_id is unique and add it to the list of runs
      # If it's not, return (without adding the run_id to the list of course)
      return unless add_to_run_list( run_id, cur_prj_dir )

      # If running on the internal broker, start it if needed
      if running_on_internal_broker?
        return unless start_internal_broker
      end

      # Start all nutella internal actors, if needed
      return unless start_nutella_actors

      # Start all project level actors, if any
      return unless start_project_bots cur_prj_dir

      # Start all bots
      return unless start_bots( cur_prj_dir, run_id, params )

      # Output success message
      output_success_message( run_id, run, 'started' )
      output_monitoring_details( run_id, cur_prj_dir, params)
    end


    private


    def bots_list_wo_project( cur_prj_dir, params )
      # Fetch the list of project bots
      project_bots_list = Nutella.current_project.config['project_bots']
      run_bots_list = run_actors_list("#{cur_prj_dir}/bots/")
      # Depending on the mode we are in we want to start only some bots, exclude only some bots, start all bots
      unless params[:with].empty?
        return project_bots_list.nil? ? params[:with] : params[:with] - project_bots_list
      end
      unless params[:without].empty?
        return project_bots_list.nil? ? run_bots_list - params[:without] : run_bots_list - params[:without] - project_bots_list
      end
      if params[:with].empty? && params[:without].empty?
        return project_bots_list.nil? ? run_bots_list : run_bots_list - project_bots_list
      end
    end


    def project_bots_started?
      project_name = Nutella.current_project.config['name']
      tmux_session_name = "#{project_name}-project-bots"
      Tmux.session_exist? tmux_session_name
    end


    def add_to_run_list(run_id, prj_dir)
      unless Nutella.runlist.add?( run_id, prj_dir )
        # If the run_id is already in the list, check that it's actually live
        if Tmux.session_exist? run_id
          console.error 'Impossible to start project: an instance of this project with the same run_id is already running!'
          console.error "You might want to kill it with 'nutella stop #{run_id}'"
          return false
        end
      end
      true
    end


    def start_internal_broker
      pid_file_path = "#{Nutella.config['broker_dir']}bin/.pid"
      return true if sanitize_pid_file pid_file_path
      # Check that broker is not running unsupervised (check port)
      unless broker_port_free?
        console.error 'Impossible to start project: looks like a broker is already running on port 1883. Stop it before trying to start the project again'
        return false
      end
      # Broker is not running and there is no file so we try to start
      # and create a new pid file. Note that the pid file is created by
      # the startup script!
      pid = fork
      exec("#{Nutella.config['broker_dir']}/startup") if pid.nil?
      # Sleep a bit to give the chance to the broker to actually start up
      sleep(1)
      # All went well so we return true
      true
    end


    # Cleans the pid file of a given process
    # @param [String] pid_file_path the file storing the pid file of the process
    # @return [Boolean] true if the pid file exists AND the process with that pid is still alive
    def sanitize_pid_file( pid_file_path )
      # Does the pid file exist?
      # If it does we try to see if the process with that pid is still alive
      if File.exist? pid_file_path
        pid_file = File.open(pid_file_path, 'rb')
        pid = pid_file.read.to_i
        pid_file.close
        begin
          # If this statement doesn't throw an exception then a process with
          # this pid is still alive so we do nothing and just return true
          Process.getpgid pid
          return true
        rescue
          # If there is an exception, there is no process with this pid
          # so we have a stale pid file that we need to remove
          File.delete pid_file_path
          return false
        end
      end
      # If there is no pid file, there is no process running
      false
    end


    # Checks if port 1883 (MQTT broker port) is free
    # or some other service is already listening on it
    def broker_port_free?
      begin
        s = TCPServer.new('0.0.0.0', 1883)
        s.close
      rescue
        return false
      end
      true
    end


    def start_nutella_actors
      nutella_actors_dir = "#{Nutella.config['nutella_home']}actors"
      for_each_actor_in_dir nutella_actors_dir do |actor|
        if File.exist? "#{nutella_actors_dir}/#{actor}/startup"
          unless start_nutella_actor "#{nutella_actors_dir}/#{actor}"
            return false
          end
        end
      end
      true
    end


    def start_nutella_actor( actor_dir )
      pid_file_path = "#{actor_dir}/.pid"
      return true if sanitize_pid_file pid_file_path
      # Actor is not running and there is no pid file so we try to start
      # the actor and create a new pid file. Note that the pid file is created by
      # the startup script!
      nutella_config_file = "#{Nutella.config['config_dir']}config.json"
      runs_list_file = "#{Nutella.config['config_dir']}runlist.json"
      if nutella_config_file==nil || runs_list_file==nil
        return false
      end
      command = "#{actor_dir}/startup #{nutella_config_file} #{runs_list_file}"
      pid = fork
      exec(command) if pid.nil?
      # All went well so we return true
      true
    end


    def start_project_bots( cur_prj_dir )
      project_bots_list = Nutella.current_project.config['project_bots']
      project_name = Nutella.current_project.config['name']
      tmux_session_name = "#{project_name}-project-bots"
      bots_dir = "#{cur_prj_dir}/bots/"
      # If project bots have been started already, then do nothing
      unless Tmux.session_exist? tmux_session_name
        # Start all project bots in the list into a new tmux session
        tmux = Tmux.new tmux_session_name
        for_each_actor_in_dir bots_dir do |bot|
          unless project_bots_list.nil? || !project_bots_list.include?( bot )
            # If there is no 'startup' script output a warning (because
            # startup is mandatory) and skip the bot
            unless File.exist?("#{bots_dir}#{bot}/startup")
              console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
              next
            end
            # Create a new window in the session for this run
            tmux.new_bot_window bot
          end
        end
      end
      true
    end


    def start_bots( cur_prj_dir, run_id, params )
      # Create a new tmux instance for this run
      tmux = Tmux.new run_id
      # Fetch bots dir
      bots_dir = "#{cur_prj_dir}/bots/"
      # Start the appropriate bots
      bots_list_wo_project( cur_prj_dir, params ).each { |bot| start_bot(bots_dir, bot, tmux) }
      true
    end


    def start_bot( bots_dir, bot, tmux )
      # If there is no 'startup' script output a warning (because
      # startup is mandatory) and skip the bot
      unless File.exist?("#{bots_dir}#{bot}/startup")
        console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
        return
      end
      # Create a new window in the session for this run
      tmux.new_bot_window bot
    end


    def output_monitoring_details( run_id, cur_prj_dir, params )
      project_bots_list = Nutella.current_project.config['project_bots']
      project_name = Nutella.current_project.config['name']
      tmux_session_name = "#{project_name}-project-bots"
      unless project_bots_list.nil? || project_bots_list.empty?
        console.success "Do `tmux attach-session -t #{tmux_session_name}` to monitor your project bots."
      end
      if bots_list_wo_project(cur_prj_dir, params).empty?
        console.success 'No tmux session was created for this run because you specified no regular bots exclusively for this run'
      else
        console.success "Do `tmux attach-session -t #{run_id}` to monitor your bots."
      end
      console.success "Go to http://localhost:#{Nutella.config['main_interface_port']}/#{run_id} to access your interfaces"

    end


  end
  
end

