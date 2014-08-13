require_relative '../command'

class Stop < Command
  @description = "Stops all or some of the bots in the current project"
  
  def run(args=nil)
    # Extract runid
    runid = args[0].to_s.empty? ? prj_config("name") : prj_config("name") + "_" + args[0]
    
    # Is current directory a nutella prj?
    unless nutellaPrj?
      return 1
    end
    
    # Remove from the list of runs and if running on internal broker, stop it
    if removeFromRunsList(runid)
      if nutella.broker == "internal-mosca" # Are we using the internal broker
        stopBroker
      end
    end
    
    # Stops all the bots
    # TODO
    
    # Output success message
    if runid == prj_config("name")
      puts ANSI.green + "Project " + prj_config("name") + " stopped" + ANSI.reset
    else
      puts ANSI.green + "Project " + prj_config("name") + ", run " + args[0] + " stopped" + ANSI.reset 
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

