require 'core/command'
require 'core/tmux'

module Nutella
  class Start < Command
    @description = 'Starts all or some of the bots in the current project'
  
    def run(args=nil)
      # Is current directory a nutella prj?
      return unless Nutella.currentProject.exist?
      run_id = Nutella.runlist.extractRunId args[0]
      # Check the runId is unique and add to the list of runs
      return unless addToRunsList run_id
      # Extract project directory
      @prj_dir = Nutella.currentProject.dir
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
      startBots(run_id)
      # Start all interfaces
      ports = start_interfaces
      # Start all "hidden bots"
      start_hidden_bots
      # Output success message
      outputSuccessMessage(run_id, args[0])
    end
    
    
    private
    
    
    def addToRunsList(runid)
      if !Nutella.runlist.add?(runid)
        console.error 'Impossible to start project: an instance of this project with the same name is already running!'
        console.error "You might want to kill it with 'nutella stop "+ runid + "'"
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
      ports = Hash.new
      Dir.entries("#{@prj_dir}/interfaces").select {|entry| File.directory?(File.join("#{@prj_dir}/interfaces",entry)) and !(entry =='.' || entry == '..') }.each do |iface|
        if !File.exist?("#{@prj_dir}/interfaces/#{iface}/index.html")
          console.warn "Impossible to start interface #{iface}. Couldn't locate 'index.html' file."
          next
        end
        ports[iface] = @tmux.new_interface_window(iface)
      end
      ports
    end

    def start_hidden_bots
      # p ports
      # puts run_id
      # Nutella.runlist.length
      # Nutella.config['broker']
      # Create the webpage for all interfaces
      # Start the web_server serving the whole interfaces directory
      # Output message that shows the port where we are connecting
    end
    
    def outputSuccessMessage(runid, run)
      if runid == Nutella.currentProject.config["name"]
        console.success "Project " + Nutella.currentProject.config["name"] + " started. Do `tmux attach-session -t #{Nutella.currentProject.config["name"]}` to monitor your bots."
      else
        console.success "Project " + Nutella.currentProject.config["name"] + ", run " + run + " started"
      end
    end
   
  end
  
end

