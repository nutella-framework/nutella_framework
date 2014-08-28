require 'core/command'


module Nutella
  class Runs < Command
    @description = "Displays list of all the runs, you can filter by passing a project id"
  
    def run(args=nil)
      # If no argument show the full runs list
      if args.empty?
        console.info "Currently running:"
        console.info getRunsList   
      else
        runs = getRunsList(args[0])
        console.info "Currently running #{runs.length} instances of project #{args[0]}:"
        console.info runs
      end
    
      return 0
    end
  end
  
end

