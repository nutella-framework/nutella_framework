require_relative '../command'
require 'socket'

class Broker < Command
  @description = "Displays information about the current broker and allows us to change it"
  
  def run(args=nil)
    # If no argument then we jsut display info about the broker
    if args.empty?
      puts "Currently using broker: #{nutella.broker}"
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
      nutella.loadConfig
      nutella.broker = args[0]
      nutella.storeConfig
      puts ANSI.green + "Now using broker: #{nutella.broker}" + ANSI.reset
    end
    return 0
  end
end

