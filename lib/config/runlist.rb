require 'config/persisted_hash'

module Nutella
  
  class RunListHash < PersistedHash

    # Returns the +run_id+ names for a certain project
    # If no project is specified, +run_id+s for all projects are returned
    # @param [String] project_name the name of the project we want to find run names for
    # @return [Array<String>] list of +run_id+s associated to the specified project
    def runs_by_project( project_name=nil )
      (project_name == nil) ? keys : keys.select { |run| run.start_with?(project_name) }
    end

    # Extracts the +run_id+ from the run name (specified at command line)
    # @param [String] run_name
    # @return [String] the +run_id+ which is either the +project_name+ (if no +run_name+
    # was specified) or the concatenation of +project_name+ and +run_name+
    def extract_run_id( run_name )
      run_name.to_s.empty? ? Nutella.current_project.config['name'] : "#{Nutella.current_project.config['name']}_#{run_name}"
    end
    

  end

  # Calling this method (Nutella.runlist) simply returns and instance of
  # RunListHash linked to file runlist.json in the nutella home directory
  def Nutella.runlist
    RunListHash.new( "#{File.dirname(__FILE__)}/../../runlist.json" )
  end
  
end



