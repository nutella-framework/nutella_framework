require 'core/command'
require 'socket'

module Nutella
  class Broker < Command
    @description = "Displays information about the current broker and allows us to change it"
  
    def run(args=nil)
      # If no argument then we jsut display info about the broker
      if args==nil || args.empty?
        getBrokerInfo
        return
      end
      # If there are arguments we are doing manipulations
      case args[0]
      when "set"
        changeBroker args[1]
      # when "start"
      #   startBroker
      # when "stop"
      #   stopBroker
      else
        console.warn "Unknown `nutella broker` option #{args[0]}. Try `nutell broker`, ` nutella broker set <broker> instead"
      end
      
    end
    
    private
    
    def getBrokerInfo
      if Nutella.config["broker"].nil?
        console.warn "No broker has been specified yet. Please, run `nutella broker set <broker>` to specify a broker."
      else
        console.info"Currently using broker: #{Nutella.config["broker"]}"
      end
    end
    
    
    def changeBroker(broker)
      # Check that there are no runs hinging on this broker
      if !Nutella.runlist.empty?
        console.warn "You are currently running some projects on this broker. You can't change the broker while running."
        return
      end
      # Change it
      begin
        IPSocket.getaddress(broker)
      rescue
        console.warn "Not a valid hostname for a broker"
      end
      Nutella.config["broker"] = broker
      console.success "Now using broker: #{Nutella.config["broker"]}"
    end
    
  end
end


