require 'core/command'
require 'core/tmux'

module Nutella
  class Stop < Command
    @description = "Stops all or some of the bots in the current project"
  
    def run(args=nil)
      # Is current directory a nutella prj?
      if !nutellaPrj?
        return 1
      end
    
      # Extract runid
      runid = args[0].to_s.empty? ? prj_config("name") : prj_config("name") + "_" + args[0]
    
      # Remove from the list of runs and if running on internal broker, stop it
      if removeFromRunsList(runid)==runid
        if isRunsListEmpty? and nutella.broker == "localhost" # Are we using the internal broker
          stopBroker
        end
      else
        console.log "Run #{runid} doesn't exist. Impossible to stop it."
        return 0
      end
    
      # Stops all the bots
      Tmux.killSession(runid)
    
      # Deletes bots config file if it exists
      File.delete("#{@prj_dir}/.botsconfig.json") if File.exist?("#{@prj_dir}/.botsconfig.json")
    
      # Output success message
      if runid == prj_config("name")
        console.success + "Project " + prj_config("name") + " stopped"
      else
        console.success + "Project " + prj_config("name") + ", run " + args[0] + " stopped"
      end
    
      # Return 0 for success
      return 0
    end
  
    def stopBroker
      pidFile = "#{nutella.home_dir}/broker/bin/.pid";
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
