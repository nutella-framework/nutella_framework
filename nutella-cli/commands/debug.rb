require_relative '../command'

class Debug < Command
  @description = "Starts all or some of the bots in the current project in debug mode"
  
  def run(args=nil)
    puts "Running command 'debug' - NOT YET IMPLEMENTED"
    # This is the blocking version of start, for coding purposes
  end
end
