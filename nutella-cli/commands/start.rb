require_relative '../command'
require_relative '../tmux/tmux'

class Start < Command
  @description = "Starts all or some of the bots in the current project"
  
  def run(args=nil)
    # Extract runid
    runid = args[0].to_s.empty? ? prj_config("name") : prj_config("name") + "_" + args[0]
    
    # Is current directory a nutella prj?
    unless nutellaPrj?
      return 1
    end
    
    # Add to the list of runs
    if !addToRunsList(runid)
      puts ANSI.red + "Impossible to start project: an instance of this project with the same name is already running!
You might want to kill it with 'nutella stop "+ runid + "'" + ANSI.reset
      return 0;
    end
    
    # If running on internal broker, start it
    if nutella.broker == "localhost" # Are we using the internal broker
      startBroker
    end
    
    # Start all the bots
    tmux = Tmux.new(runid)
    Dir.entries("#{@prj_dir}/bots").select {|entry| File.directory?(File.join("#{@prj_dir}/bots",entry)) and !(entry =='.' || entry == '..') }.each do |bot|
      if !File.exist?("#{@prj_dir}/bots/#{bot}/startup")
        puts ANSI.yellow + "Impossible to start bot #{bot}. Couldn't locate 'startup' script." + ANSI.reset
        next
      end    
      tmux.newWindow(bot)
    end
    
    # Output success message
    if runid == prj_config("name")
      puts ANSI.green + "Project " + prj_config("name") + " started" + ANSI.reset
    else
      puts ANSI.green + "Project " + prj_config("name") + ", run " + args[0] + " started" + ANSI.reset 
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
   
end

