require 'commands/meta/command'
require 'socket'

module Nutella
  class Broker < Command
    @description = 'Displays information about the broker and allows to change it'
  
    def run(args=nil)

      # If no argument then we just display info about the broker
      if args==nil || args.empty?
        print_broker_info
        return
      end
      # If there are arguments we are doing manipulations
      sub_command = args[0]
      sum_command_param = args[1]
      if sub_command=='set'
        change_broker sum_command_param
      else
        console.warn "Unknown 'nutella broker' option #{sub_command}. Try 'nutella broker' or 'nutella broker set <new_broker>' instead"
      end
    end
    
    private
    
    def print_broker_info
      if Nutella.config['broker'].nil?
        console.warn 'No broker has been specified yet. Please, run `nutella broker set <broker>` to specify a broker'
      else
        console.info "Currently using broker: #{Nutella.config['broker']}"
      end
    end
    
    
    def change_broker( new_broker )
      # Check that there are no runs hinging on this broker
      unless Nutella.runlist.empty?
        console.warn 'You are currently running some projects on this broker. You can\'t change the broker while running.'
        return
      end
      # Try to parse the hostname and switch to the new broker
      begin
        IPSocket.getaddress new_broker
      rescue
        console.warn "#{new_broker} is not a valid hostname for a broker"
        return
      end
      Nutella.config['broker'] = new_broker
      # Print a confirmation message
      console.success "Now using broker: #{Nutella.config['broker']}"
    end
    
  end
end


