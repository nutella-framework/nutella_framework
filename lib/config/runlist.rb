# frozen_string_literal: true

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
  class RunList
    def initialize(file)
      @ph = PersistedHash.new file
    end

    # Returns a list of all the apps in the runlist
    #
    # @return [Array<String>] an array containing the app_ids of all the apps in the runlist
    def all_apps
      @ph.to_h.keys
    end

    # Returns all the +run_id+s for ALL applications (i.e. the runslist)
    #
    # @return [Hash] the run list with all app_ids and run_ids
    def all_runs
      @ph.to_h
    end

    # Returns all the +run_id+s for a certain application
    #
    # @param [String] app_id of the application we want to find run_ids for
    # @return [Array<String>] list of +run_id+s associated to the specified app_id
    def runs_for_app(app_id)
      # If there is no app, then return false and do nothing
      return [] if @ph[app_id].nil?

      runs = @ph[app_id]['runs']
      runs.nil? ? [] : runs
    end

    # Returns the path for a certain application
    #
    # @param [String] app_id of the application we want to find the path of
    # @return [String] the path of the app or nil if the app doesn't exist
    def app_path(app_id)
      return nil if @ph[app_id].nil?

      @ph[app_id]['path']
    end

    # Adds a run_id to the runlist
    #
    # @param [String] path_to_app_files the path to the application files
    # @param [String] app_id the app_id the run_id belongs to
    # @param [String] run_id the run_id we are trying to add to the runs list
    # @return [Boolean] true if the run_id is added to the list (i.e. there is no other
    #   run_id with for the same app_id)
    def add?(path_to_app_files, app_id, run_id)
      # Check if we are adding the first run for a certain application
      if @ph.add_key_value?(app_id, {})
        t = @ph[app_id]
        # Add path and initialize runs
        t['path'] = path_to_app_files
        t['runs'] = [run_id]
      else
        t = @ph[app_id]
        # Check a run with this name doesn't already exist
        return false if t['runs'].include? run_id

        # Add the run_id to list of runs
        t['runs'].push(run_id)
      end
      @ph[app_id] = t
      true
    end

    # Remove a run_id from the list
    #
    # @param [String] app_id the app_id the run_id belongs to
    # @param [String] run_id the run_if we are trying to remove from the runs list
    # @return [Boolean] true if the run_id is removed from the list (i.e. a run_id with that name exists
    #   and is successfully removed)
    def delete?(app_id, run_id)
      # If there is no app, then return false and do nothing
      return false if @ph[app_id].nil?

      t = @ph[app_id]
      result = t['runs'].delete run_id
      if t['runs'].empty?
        # If run_id was the last run for this app, remove the app as well
        @ph.delete_key_value? app_id
      else
        # otherwise write the hash back
        @ph[app_id] = t
      end
      result.nil? ? false : true
    end

    # Checks if a certain run is contained in the list
    #
    # @param [String] app_id the app_id the run_id belongs to
    # @param [String] run_id the run_if we are checking
    # @return [Boolean] true if the run_id is in the list, false otherwise
    def include?(app_id, run_id)
      # If there is no app, then return false and do nothing
      return false if @ph[app_id].nil?

      # Otherwise check the runs array
      @ph[app_id]['runs'].include? run_id
    end

    # Returns true if the runs list is empty
    # @return [Boolean] true if the list is empty, false otherwise
    def empty?
      @ph.empty?
    end

    # Removes the runs list file
    def remove_file
      @ph.remove_file
    end
  end
end
