require_relative '../command'

class Unseal < Command
  @description = "Checks that all the dependencies are installed and prepares nutella to run"
  
  def run(args=nil)
    # Check if we have a broker and installs one if not
    if !nutella.broker.has_key?(:exist)
      installBroker
    end  
  end
  
  def installBroker
    puts "broker not installed"
  end
  
end
