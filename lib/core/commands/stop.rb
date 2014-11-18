require 'core/command'
require 'core/tmux'

module Nutella
  class Stop < Command
    @description = "Stops all or some of the bots in the current project"
    # Is current directory a nutella prj?
    def run(args=nil)
      if !Nutella.currentProject.exist? 
        return
      end
      runid = Nutella.runlist.extractRunId args[0]
      # Removes the run from the list of runs if it exists
      return unless removeRunfromList(runid, args[0])
      # Stop broker if needed
      if Nutella.runlist.empty? and Nutella.config['broker'] == "localhost" 
        stopBroker
      end
      # Stops all the bots
      Tmux.killSession(runid) 
      # Deletes bots config file if it exists
      deleteBotsConfigFile
      # Delete .actors_list file if it exists
      delete_actors_list_file
      # Output success message
      outputSuccessMessage(runid, args[0])
    end
  
    
    private
    
    
    
    def removeRunfromList(runid, run) 
      unless Nutella.runlist.delete?(runid)
        if runid == Nutella.currentProject.config['name']
          console.warn "Run #{runid} doesn't exist. Impossible to stop it."
        else
          console.warn "Run #{run} doesn't exist. Impossible to stop it."
        end
        return false
      end
      return true
    end
  
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
    
    def deleteBotsConfigFile
      prj_dir = Nutella.currentProject.dir 
      if File.exist?("#{prj_dir}/.botsconfig.json")
        File.delete("#{prj_dir}/.botsconfig.json") 
      end
    end

    def delete_actors_list_file
      prj_dir = Nutella.currentProject.dir
      actors_config_file = "#{prj_dir}/.actors_config.json"
      File.delete(actors_config_file) if File.exist?(actors_config_file)
    end
    
    def outputSuccessMessage(runid, run)
      if runid == Nutella.currentProject.config["name"]
        console.success "Project #{Nutella.currentProject.config["name"]} stopped"
      else
        console.success "Project #{Nutella.currentProject.config["name"]}, run #{run} stopped"
      end
    end
  
  end
end
