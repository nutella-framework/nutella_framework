require 'core/command'
require 'socket'

module Nutella
  class Broker < Command
    @description = "Displays information about the current broker and allows us to change it"
  
    def run(args=nil)
      # If no argument then we jsut display info about the broker
      if args==nil || args.empty?
        if Nutella.config["broker"].nil?
          console.warn "No broker has been specified yet. Please, run `nutella broker` to specify a broker."
        else
          console.info"Currently using broker: #{Nutella.config["broker"]}"
        end
      else
        if !Nutella.runlist.empty?
          console.warn "You are currently running some projects on this broker. You can't change the broker while running."
        end
        begin
          IPSocket.getaddress(args[0])
        rescue
          console.warn "Not a valid hostname"
        end
        Nutella.config["broker"] = args[0]
        console.success "Now using broker: #{Nutella.config["broker"]}"
      end
    end
  end
end


