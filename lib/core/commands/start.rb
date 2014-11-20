require 'core/command'
require 'core/tmux'

module Nutella
  class Start < Command
    @description = 'Starts all or some of the bots in the current project'
  
    def run(args=nil)

      # If the current directory is not a nutella project, return
      return unless Nutella.current_project.exist?

      # Extract project directory and run_id
      cur_prj_dir = Nutella.current_project.dir
      run_id = Nutella.runlist.extract_run_id args[0]

      # Check that the run_id is unique and add it to the list of runs
      # If it's not, return (without adding the run_id to the list of course)
      return unless add_to_run_list( run_id, cur_prj_dir)

      # If running on the internal broker, start it
      if Nutella.config['broker'] == 'localhost'
        return unless start_internal_broker
      end

      # Start all nutella internal actors
      return unless start_nutella_actors

      # Install dependencies, compile and start all bots
      return unless install_bots_dependencies cur_prj_dir
      return unless compile_bots cur_prj_dir
      pids = start_bots( cur_prj_dir, run_id )
      return if pids.empty?

      # Output success message
      output_success_message( run_id, args[0] )
    end
    
    
    private
    
    
    def add_to_run_list(run_id, prj_dir)
      unless Nutella.runlist.add?( run_id, prj_dir )
        console.error 'Impossible to start project: an instance of this project with the same run_id is already running!'
        console.error "You might want to kill it with 'nutella stop #{run_id}'"
        return false
      end
      return true
    end
  
  
    def start_internal_broker
      pid_file_path = "#{Nutella.config['broker_dir']}/bin/.pid"
      # Does the broker pid file exist?
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
          # The process is dead but we have a stale pid file so we remove the pid
          File.delete pid_file_path
        end
        # Broker is not running and there is no file so we try to start
        # and create a new pid file. Note that the pid file is created by
        # the startup script!
        pid = fork
        exec("#{Nutella.config['broker_dir']}/startup") if pid.nil?
        sleep(0.5)
        # All went well so we return true
        true
      end
    end


    def start_nutella_actors
      nutella_actors_dir = "#{Nutella.config['nutella_home']}actors"
      Dir.entries(nutella_actors_dir).select {|entry| File.directory?(File.join(nutella_actors_dir, entry)) && !(entry =='.' || entry == '..') }.each do |actor|
        if File.exist? "#{nutella_actors_dir}/#{actor}/startup"
          unless start_actor "#{nutella_actors_dir}/#{actor}"
            return false
          end
        end
      end
      true
    end

    def start_actor( actor_dir )
      pid_file_path = "#{actor_dir}/.pid"
      # Does the actor pid file exist?
      # If it does we try to see if the process with that pid is still alive
      if File.exist? pid_file_path
        pid_file = File.open(pid_file_path, 'rb')
        pid = pid_file.read.to_i
        pid_file.close
        begin
          # If this statement doesn't throw an exception then a process with
          # this pid is still alive so we do nothing and just return true
          Process.getpgid pid #PID is still alive
          return true
        rescue
          # The process is dead but we have a stale pid file so we remove the pid
          File.delete pid_file_path
        end
      end
      # Actor is not running and there is no pid file so we try to start
      # the actor and create a new pid file. Note that the pid file is created by
      # the startup script!
      nutella_config_file = "#{Nutella.config['nutella_home']}config.json"
      runs_list_file = "#{Nutella.config['nutella_home']}runlist.json"
      if nutella_config_file==nil || runs_list_file==nil
        return false
      end
      command = "#{actor_dir}/startup #{nutella_config_file} #{runs_list_file}"
      pid = fork
      exec(command) if pid.nil?
      # All went well so we return true
      true
    end


    def install_bots_dependencies( cur_prj_dir )
      # Go through all the bots directories
      Dir.entries("#{cur_prj_dir}/bots").select {|entry| File.directory?(File.join("#{cur_prj_dir}/bots", entry)) and !(entry =='.' || entry == '..') }.each do |bot|
        # Skip bot if there is no 'dependencies' script
        next unless File.exist? "#{cur_prj_dir}/bots/#{bot}/dependencies"
        # Output message
        console.info "Installing dependencies for bot #{bot}."
        # Execute 'dependencies' script
        cur_dir = Dir.pwd
        Dir.chdir "#{cur_prj_dir}/bots/#{bot}"
        system './dependencies'
        Dir.chdir cur_dir
      end
      true
    end


    def compile_bots( cur_prj_dir )
      # Go through all the bots directories
      Dir.entries("#{cur_prj_dir}/bots").select {|entry| File.directory?(File.join("#{cur_prj_dir}/bots",entry)) and !(entry =='.' || entry == '..') }.each do |bot|
        # Skip bot if there is no 'compile' script
        next unless File.exist? "#{cur_prj_dir}/bots/#{bot}/compile"
        # Output message
        console.info "Compiling bot #{bot}."
        # Execute 'compile' script
        cur_dir = Dir.pwd
        Dir.chdir "#{cur_prj_dir}/bots/#{bot}"
        system './compile'
        Dir.chdir cur_dir
      end
      true
    end


    def start_bots( cur_prj_dir, run_id )
      # Create a new tmux instance for this run
      tmux = Tmux.new run_id
      # Go through all the bots directories
      Dir.entries("#{cur_prj_dir}/bots").select {|entry| File.directory?(File.join("#{cur_prj_dir}/bots",entry)) and !(entry =='.' || entry == '..') }.each do |bot|
        # If there is no 'startup' script output a warning (because
        # startup is mandatory) and skip the bot
        unless File.exist?("#{cur_prj_dir}/bots/#{bot}/startup")
          console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
          next
        end
        # Create a new window in the session for this run
        tmux.new_bot_window bot
      end
      true
    end


    def output_success_message(run_id, run)
      if run_id == Nutella.current_project.config['name']
        console.success "Project #{Nutella.current_project.config['name']} started!"
      else
        console.success "Project #{Nutella.current_project.config['name']}, run #{run} started!"
      end
      console.success "Do `tmux attach-session -t #{run_id}` to monitor your bots."
      console.success "Go to http://localhost:#{Nutella.config['main_interface_port']}/#{run_id} to access your interfaces"
    end


    # def createBotsConfig
    #   botsconfig = Nutella.config.to_h
    #   botsconfig.delete(:runs)
    #   botsconfig[:prj_name] = Nutella.current_project.config["name"]
    #   File.open("#{@cur_prj_dir}/.botsconfig.json", "w") do |f|
    #     f.write(JSON.pretty_generate(botsconfig))
    #   end
    # end
    #
    #
    # def deleteBotsConfig
    #   File.delete("#{@cur_prj_dir}/.botsconfig.json") if File.exist?("#{@cur_prj_dir}/.botsconfig.json")
    # end
    #
    #
    # def create_actors_list_file(pids_hash, interfaces_hash )
    #   actors_config_file = "#{@cur_prj_dir}/.actors_config.json"
    #   actors_hash = interfaces_hash
    #   File.open(actors_config_file, 'w') do |f|
    #     f.write(JSON.pretty_generate(actors_hash))
    #   end
    # end
    #
    #
    # def delete_actors_list_file
    #   actors_config_file = "#{@cur_prj_dir}/.actors_config.json"
    #   File.delete(actors_config_file) if File.exist?(actors_config_file)
    # end
    #
    #
    # def start_interfaces
    #   urls = Hash.new
    #   Dir.entries("#{@cur_prj_dir}/interfaces").select {|entry| File.directory?(File.join("#{@cur_prj_dir}/interfaces",entry)) and !(entry =='.' || entry == '..') }.each do |iface|
    #     if !File.exist?("#{@cur_prj_dir}/interfaces/#{iface}/index.html")
    #       console.warn "Impossible to start interface #{iface}. Couldn't locate 'index.html' file."
    #       next
    #     end
    #     urls[iface] = @tmux.new_interface_window iface
    #   end
    #   urls
    # end


  end
  
end

