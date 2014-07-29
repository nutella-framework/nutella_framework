require_relative '../command'

class Stop < Command
  @description = "Stops all or some of the bots in the current project"
  
  def run(args=nil)
    # Is current directory a nutella prj?
    unless nutellaPrj?
      return 1
    end
    # Stops all the bots
    return 0
  end
end

