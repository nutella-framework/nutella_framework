# frozen_string_literal: true

# Models a nutella application
module Nutella
  class App
    attr_reader :path
    attr_reader :id
    attr_reader :config

    def initialize(app_path)
      @path = app_path
      # Build a PersistedHash of the application nutella.json file
      # to ease access to the nutella.json file inside the app
      @config = Nutella::PersistedHash.new("#{@path}/nutella.json")
      @id = @config['name']
    end

    # Returns an array of run-level bots
    def run_level_bots
      all_bots = components_in_dir("#{@path}/bots/")
      # Run-level bots are all the bots minus app-level ones
      all_bots - app_level_bots
    end

    # Returns an array of app-level bots
    def app_level_bots
      config['app_bots'].nil? ? [] : config['app_bots']
    end

    # Checks that the provided directory is actually a nutella application
    # @return [Boolean] true if the directory is a nutella application, false otherwise
    def self.exist?(dir)
      nutella_json_file_path = "#{dir}/nutella.json"
      # Check that there is a nutella.json file in the main directory of the application
      return false unless File.exist? nutella_json_file_path

      # If there is a file, try to parse it
      begin
        conf = JSON.parse(IO.read(nutella_json_file_path))
      rescue StandardError
        # Not valid JSON, returning false
        return false
      end
      # No nutella version in the file, return false
      return false if conf['nutella_version'].nil?

      true
    end

    private

    # Returns all the components in a certain directory
    def components_in_dir(dir)
      Dir.entries(dir).select { |entry| File.directory?(File.join(dir, entry)) && !(entry == '.' || entry == '..') }
    end
  end
end
