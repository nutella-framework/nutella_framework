require 'config/persisted_hash'

module Nutella

  # Manages the list of nutella applications and runs handled by the framework.
  # The list has a structure similar this one:
  # {
  #   "app_a": {
  #     "runs": [ "default", "run_1", "run_2" ],
  #     "path": "/path/to/app/a/files/"
  #   },
  #   "app_b": {
  #     "runs": [ "run_1", "run_3" ],
  #     "path": "/path/to/app/b/files/"
  #   }
  # }
  class RunListHash < PersistedHash

    # TODO not sure I need this method anymore
    # Extracts the +run_id+ from the run name (specified at command line)
    # @param [String] run_name the run name passed
    # @return [String] the +run_id+ which is either the +project_name+ (if no +run_name+
    # was specified) or the concatenation of +project_name+ and +run_name+
    def extract_run_id( run_name )
      run_name.to_s.empty? ? Nutella.current_project.config['name'] : "#{Nutella.current_project.config['name']}_#{run_name}"
    end


    # Returns all the +run_id+s for ALL applications
    #
    # @return [Array<String>] list of +run_id+s associated to the specified app_id
    def all_runs
      self.to_h
    end


    # Returns all the +run_id+s for a certain application
    #
    # @param [String] app_id the id of the application we want to find run_ids for
    # @return [Array<String>] list of +run_id+s associated to the specified app_id
    def runs_for_app( app_id )
      runs = self[app_id]['runs']
      runs.nil? ? [] : runs
    end


    # Adds a run_id to the runlist
    #
    # @param [String] app_id the app_id the run_id belongs to
    # @param [String] run_id the run_id we are trying to add to the runs list
    # @param [String] path_to_app_files the path to the application files
    # @return [Boolean] true if the run_id is added to the list (i.e. there is no other
    #   run_id with for the same app_id)
    def add?( app_id, run_id, path_to_app_files )
      # If no run_id is specified, we are adding the "default" run
      run_id = 'default' if run_id.nil?
      # Check if we are adding the first run for a certain application
      if add_key_value?(app_id, Hash.new)
        t = self[app_id]
        # Add path and initialize runs
        t['path'] = path_to_app_files
        t['runs'] = [run_id]
      else
        t = self[app_id]
        # Check a run with this name doesn't already exist
        return false if t['runs'].include? run_id
        # Add the run_id to list of runs
        t['runs'].push(run_id)
      end
      self[app_id] = t
      true
    end


    # Remove a run_id from the list
    #
    # @param [String] app_id the app_id the run_id belongs to
    # @param [String] run_id the run_if we are trying to remove from the runs list
    # @return [Boolean] true if the run_id is removed from the list (i.e. a run_id with that name exists
    #   and is successfully removed)
    def delete?( app_id, run_id )
      # If there is no app, then return false and do nothing
      return false if self[app_id].nil?
      t = self[app_id]
      result = t['runs'].delete run_id
      if t['runs'].empty?
        # If run_id was the last run for this app, remove the app as well
        delete_key_value? app_id
      else
        # otherwise write the hash back
        self[app_id] = t
      end
      result.nil? ? false : true
    end


  end

  # Calling this method (Nutella.runlist) simply returns and instance of
  # RunListHash linked to file runlist.json in the nutella home directory
  def Nutella.runlist
    RunListHash.new( "#{ENV['HOME']}/.nutella/runlist.json" )
  end
  
end



