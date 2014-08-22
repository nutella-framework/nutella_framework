require 'core/command'
require 'socket'

module Nutella
  class Broker < Command
    @description = "Displays information about the current broker and allows us to change it"
  
    def run(args=nil)
      # If no argument then we jsut display info about the broker
      if args==nil || args.empty?
        raise CommandException.new(:info), "Currently using broker: #{Nutella.config["broker"]}"
      else
        if !Nutella.runlist.empty?
          raise CommandException.new(:warn), "You are currently running some projects on this broker. You can't change the broker while running."
        end
        begin
          IPSocket.getaddress(args[0])
        rescue
          raise CommandException.new(:warn), "Not a valid hostname"
        end
        Nutella.config["broker"] = args[0]
        raise CommandException.new(:success), "Now using broker: #{Nutella.config["broker"]}"
      end
    end
  end
end


