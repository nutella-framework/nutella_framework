require 'core/command'
require 'socket'

module Nutella
  class Broker < Command
    @description = "Displays information about the current broker and allows us to change it"
  
    def run(args=nil)
      # If no argument then we jsut display info about the broker
      if args==nil || args.empty?
        puts "Currently using broker: #{Nutella.config["broker"]}"
      else
        if !isRunsListEmpty?
          puts ANSI.yellow + "You are currently running some projects on this broker. You can't change the broker while running." + ANSI.reset
          return 0;
        end
        begin
          IPSocket.getaddress(args[0])
        rescue
          puts ANSI.yellow + "Not a valid hostname" + ANSI.reset
          return 1
        end
        Nutella.config["broker"] = args[0]
        puts ANSI.green + "Now using broker: #{Nutella.config["broker"]}" + ANSI.reset
      end
      return 0
    end
  end
end


