require 'core/command'
require 'core/tmux'

module Nutella
  class Stop < Command
    @description = "Stops all or some of the bots in the current project"
  
    def run(args=nil)
      # Is current directory a nutella prj?
      if !Nutella.currentProject.exist?
        return
      end
    
      # Extract runid
      runid = args[0].to_s.empty? ? Nutella.currentProject.config["name"] : Nutella.currentProject.config["name"] + "_" + args[0]
    
      # Remove from the list of runs
      if Nutella.runlist.delete?(runid).nil?
        console.warn "Run #{runid} doesn't exist. Impossible to stop it."
        return
      end
      # Are we using the internal broker? If yes, stop it
      if Nutella.runlist.empty? and Nutella.config['broker'] == "localhost" 
        stopBroker
      end
      
      # Extract project directory
      @prj_dir = Nutella.currentProject.dir
    
      # Stops all the bots
      Tmux.killSession(runid)
    
      # Deletes bots config file if it exists
      File.delete("#{@prj_dir}/.botsconfig.json") if File.exist?("#{@prj_dir}/.botsconfig.json")
    
      # Output success message
      if runid == Nutella.currentProject.config["name"]
        console.success "Project #{Nutella.currentProject.config["name"]} stopped"
      else
        console.success "Project #{Nutella.currentProject.config["name"]}, run #{args[0]} stopped"
      end
    end
  
    
    private
  
  
    def stopBroker
      pidFile = "#{Nutella.config["broker_dir"]}/bin/.pid"
      if File.exist?(pidFile) # Does the broker pid file exist?
        pidF = File.open(pidFile, "rb")
        pid = pidF.read.to_i
        pidF.close()
        Process.kill("SIGKILL", pid)
        File.delete(pidFile)
      end
    end
  
  end

  
end
