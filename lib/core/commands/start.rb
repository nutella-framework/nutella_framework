require 'core/command'
require 'core/tmux'

module Nutella
  class Start < Command
    @description = 'Starts all or some of the bots in the current project'
  
    def run(args=nil)
      # Is current directory a nutella prj?
      return unless Nutella.currentProject.exist?
      # Extract project directory
      @prj_dir = Nutella.currentProject.dir
      run_id = Nutella.runlist.extractRunId args[0]
      # Check the runId is unique and add to the list of runs
      return unless addToRunsList( run_id, @prj_dir)
      # If running on internal broker, start it
      if Nutella.config['broker'] == 'localhost' # Are we using the internal broker
        startBroker
      end
      # Create .botsconfig file
      deleteBotsConfig
      createBotsConfig
      # Start all the bots
      installBotsDependencies(run_id)
      compileBots(run_id)
      pids = startBots run_id
      # Start all interfaces
      urls = start_interfaces
      # Create .actors_list file
      delete_actors_list_file
      create_actors_list_file( pids, urls )
      # Start all nutella actors
      start_nutella_actors
      # Output success message
      outputSuccessMessage(run_id, args[0])
    end
    
    
    private
    
    
    def addToRunsList(runid, prj_dir)
      unless Nutella.runlist.add?( runid, prj_dir )
        console.error 'Impossible to start project: an instance of this project with the same name is already running!'
        console.error "You might want to kill it with 'nutella stop #{runid}'"
        return false
      end
      return true
    end
  
  
    def startBroker
      pidFile = "#{Nutella.config["broker_dir"]}/bin/.pid"
      if File.exist?(pidFile) # Does the broker pid file exist?
        pidF = File.open(pidFile, "rb")
        pid = pidF.read.to_i
        pidF.close()
        begin
          Process.getpgid(pid) #PID is still alive
          # broker is already started and I do nothing
        rescue
          # broker is dead but we have a stale pid file
          File.delete(pidFile)
          startAndCreatePid()
        end
      else
        # Broker is not running and there is no file
        startAndCreatePid()
      end
      sleep(0.5)
    end


    def startAndCreatePid()
      pid = fork
      exec("#{Nutella.config["broker_dir"]}/startup") if pid.nil?
    end


    def createBotsConfig
      botsconfig = Nutella.config.to_h
      botsconfig.delete(:runs)
      botsconfig[:prj_name] = Nutella.currentProject.config["name"]
      File.open("#{@prj_dir}/.botsconfig.json", "w") do |f|
        f.write(JSON.pretty_generate(botsconfig))
      end
    end


    def deleteBotsConfig
      File.delete("#{@prj_dir}/.botsconfig.json") if File.exist?("#{@prj_dir}/.botsconfig.json")
    end


    def create_actors_list_file(pids_hash, interfaces_hash )
      actors_config_file = "#{@prj_dir}/.actors_config.json"
      actors_hash = interfaces_hash
      File.open(actors_config_file, 'w') do |f|
        f.write(JSON.pretty_generate(actors_hash))
      end
    end


    def delete_actors_list_file
      actors_config_file = "#{@prj_dir}/.actors_config.json"
      File.delete(actors_config_file) if File.exist?(actors_config_file)
    end



    def installBotsDependencies(runid)
      Dir.entries("#{@prj_dir}/bots").select {|entry| File.directory?(File.join("#{@prj_dir}/bots",entry)) and !(entry =='.' || entry == '..') }.each do |bot|
        if !File.exist?("#{@prj_dir}/bots/#{bot}/dependencies")
          next
        end
        console.info "Installing dependencies for bot #{bot}."
        cur_dir = Dir.pwd
        Dir.chdir "#{@prj_dir}/bots/#{bot}"
        system "./dependencies"
        Dir.chdir cur_dir
      end
    end


    def compileBots(runid)
      Dir.entries("#{@prj_dir}/bots").select {|entry| File.directory?(File.join("#{@prj_dir}/bots",entry)) and !(entry =='.' || entry == '..') }.each do |bot|
        if !File.exist?("#{@prj_dir}/bots/#{bot}/compile")
          next
        end
        console.info "Compiling bot #{bot}."
        cur_dir = Dir.pwd
        Dir.chdir "#{@prj_dir}/bots/#{bot}"
        system "./compile"
        Dir.chdir cur_dir
      end
    end


    def startBots(runid)
      @tmux = Tmux.new(runid)
      Dir.entries("#{@prj_dir}/bots").select {|entry| File.directory?(File.join("#{@prj_dir}/bots",entry)) and !(entry =='.' || entry == '..') }.each do |bot|
        if !File.exist?("#{@prj_dir}/bots/#{bot}/startup")
          console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
          next
        end
        @tmux.new_bot_window(bot)
      end
    end


    def start_interfaces
      urls = Hash.new
      Dir.entries("#{@prj_dir}/interfaces").select {|entry| File.directory?(File.join("#{@prj_dir}/interfaces",entry)) and !(entry =='.' || entry == '..') }.each do |iface|
        if !File.exist?("#{@prj_dir}/interfaces/#{iface}/index.html")
          console.warn "Impossible to start interface #{iface}. Couldn't locate 'index.html' file."
          next
        end
        urls[iface] = @tmux.new_interface_window iface
      end
      urls
    end


    def start_nutella_actors
      nutella_actors_dir = "#{Nutella.config['nutella_home']}actors"
      Dir.entries(nutella_actors_dir).select {|entry| File.directory?(File.join(nutella_actors_dir,entry)) && !(entry =='.' || entry == '..') }.each do |actor|
        if File.exist?("#{nutella_actors_dir}/#{actor}/startup")
          start_actor "#{nutella_actors_dir}/#{actor}"
        end
      end
    end

    def start_actor( actor_dir )
      pid_file = "#{actor_dir}/.pid"
      if File.exist?(pid_file) # Does the actor pid file exist?
        pid_f = File.open(pid_file, "rb")
        pid = pid_f.read.to_i
        pid_f.close()
        begin
          Process.getpgid pid #PID is still alive
            # actor is already started and we don't need to do anything
        rescue
          # actor is dead but we have a stale pid file
          File.delete(pid_file)
          start_actor_and_create_pid actor_dir
        end
      else
        # actor is not running and there is no file
        start_actor_and_create_pid actor_dir
      end
    end

    def start_actor_and_create_pid( actor_dir )
      nutella_config_file = "#{Nutella.config['nutella_home']}config.json"
      runs_list_file = "#{Nutella.config['nutella_home']}runlist.json"
      command = "#{actor_dir}/startup #{nutella_config_file} #{runs_list_file}"
      pid = fork
      exec(command) if pid.nil?
      # pid file is created by the startup script!
    end


    def outputSuccessMessage(run_id, run)
      if run_id == Nutella.currentProject.config['name']
        console.success "Project #{Nutella.currentProject.config['name']} started!"
      else
        console.success "Project #{Nutella.currentProject.config['name']}, run #{run} started!"
      end
      console.success "Do `tmux attach-session -t #{run_id}` to monitor your bots."
      console.success "Go to http://localhost:#{Nutella.config['main_interface_port']}/#{run_id} to access your interfaces"
    end
   
  end
  
end

