require 'core/command'
require 'core/tmux'

module Nutella
  class Start < Command
    @description = "Starts all or some of the bots in the current project"
  
    def run(args=nil)
      # Is current directory a nutella prj?
      if !nutellaPrj?
        return 1
      end
    
      # Extract runid
      runid = args[0].to_s.empty? ? prj_config("name") : prj_config("name") + "_" + args[0]
    
      # Add to the list of runs and check the runId is unique
      if !addToRunsList(runid)
        console.error "Impossible to start project: an instance of this project with the same name is already running!
  You might want to kill it with 'nutella stop "+ runid + "'"
        return 0;
      end
    
      # If running on internal broker, start it
      if nutella.broker == "localhost" # Are we using the internal broker
        startBroker
      end
    
      # Create .botsconfig file
      deleteBotsConfig
      createBotsConfig
    
    
      # Start all the bots
      tmux = Tmux.new(runid)
      Dir.entries("#{@prj_dir}/bots").select {|entry| File.directory?(File.join("#{@prj_dir}/bots",entry)) and !(entry =='.' || entry == '..') }.each do |bot|
        if !File.exist?("#{@prj_dir}/bots/#{bot}/startup")
          console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
          next
        end
        tmux.newWindow(bot)
      end
    
      # Output success message
      if runid == prj_config("name")
        console.success "Project " + prj_config("name") + " started"
      else
        console.success "Project " + prj_config("name") + ", run " + args[0] + " started"
      end

      # Return 0 for success
      return 0
    end
  
    def startBroker
      pidFile = "#{nutella.home_dir}/broker/bin/.pid";
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
      exec("#{nutella.home_dir}/broker/startup") if pid.nil?  
    end
  
    def createBotsConfig
      nutella.loadConfig
      botsconfig = nutella.to_h
      botsconfig.delete(:runs)
      botsconfig[:prj_name] = prj_config("name")
      File.open("#{@prj_dir}/.botsconfig.json", "w") do |f|
        f.write(JSON.pretty_generate(botsconfig))
      end
    end
  
    def deleteBotsConfig
      File.delete("#{@prj_dir}/.botsconfig.json") if File.exist?("#{@prj_dir}/.botsconfig.json")
    end
  
   
  end
  
end

