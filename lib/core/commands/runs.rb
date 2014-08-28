require 'core/command'


module Nutella
  class Runs < Command
    @description = "Displays list of all the runs, you can filter by passing a project id"
  
    def run(args=nil)
      # If no argument show the full runs list
      if args.empty?
        if Nutella.runlist.empty?
          console.info "You are not running any projects."
        else
          console.info "Currently running:"
          console.info Nutella.runlist.to_a   
        end
      else
        runs = Nutella.runlist.to_a args[0]
        console.info "Currently running #{runs.length} instances of project #{args[0]}:"
        console.info runs
      end
    end
  end
  
end

