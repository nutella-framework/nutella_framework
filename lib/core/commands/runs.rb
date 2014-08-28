require 'core/command'


module Nutella
  class Runs < Command
    @description = "Displays list of all the runs, you can filter by passing a project id"
  
    def run(args=nil)
      # If invoked with "--all" it will show all the runs under this instance of nutella
      if args[0]=="--all"
        if Nutella.runlist.empty?
          console.info "You are not running any projects"
        else
          console.info "Currently running:"
          Nutella.runlist.to_a.each { |run| console.info " #{run}" }   
        end
      else # Just show the runs associated with this project
        # Is current directory a nutella prj?
        if !Nutella.currentProject.exist?
          return
        end
        project_name = Nutella.currentProject.config["name"]
        runs = Nutella.runlist.to_a project_name
        if runs.empty?
          console.info "Currently running #{runs.length} instances of project #{project_name}"
          return
        end
        console.info "Currently running #{runs.length} instances of project #{project_name}:"
        runs.to_a.each { |run| 
          run.slice! "#{project_name}_"
          if run.empty? 
            console.info "progetto (default)"
          else
            console.info " #{run}" 
          end
        }   
      end
    end
  end
  
end

