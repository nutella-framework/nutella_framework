require_relative '../command'

class Help < Command
  @description = "Displays what every command does and how to use it"
  
  def run(args=nil)
    puts "Running command 'help' - NOT YET IMPLEMENTED"
  end
end

