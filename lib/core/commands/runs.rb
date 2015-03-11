require 'core/command'


module Nutella
  class Runs < Command
    @description = 'Displays list of runs for current project or all projects'
  
    def run(args=nil)

      # If invoked with "all" it will show all the runs under this instance of nutella
      if args[0]=='--all' || args[0]=='-a'
        display_all_runs
      else
        # If current dir is not a nutella project, return
        return unless Nutella.current_project.exist?
        # Display list of runs for current nutella project
        display_project_runs
      end
    end
    
    
    private 
    
    
    def display_all_runs
      if Nutella.runlist.empty?
        console.info 'You are not running any projects'
      else
        console.info 'Currently running:'
        Nutella.runlist.runs_for_app.each { |run| console.info " #{run}" }
      end
    end
    
    def display_project_runs
      project_name = Nutella.current_project.config['name']
      runs = Nutella.runlist.runs_for_app project_name
      console.info "Currently running #{runs.length} instances of project #{project_name}:"
      runs.each do |run|
        run_id = run.dup
        run_id.slice! "#{project_name}_"
        if run==project_name
          console.info " #{project_name} (default instance)"
        else
          console.info " #{run_id}"
        end
      end
    end
    
    
  end
end

