# frozen_string_literal: true

require 'json'

module CommandsServer
  # This module contains a series of utilities methods to handle the nutella
  # application contained in the directory we are at this moment
  module CurrentAppUtils
    # Checks that the current directory is actually a nutella application
    # @return [Boolean] true if the current directory is a nutella application, false otherwise
    def self.exist?
      cur_app_dir = Dir.pwd
      nutella_json_file = "#{cur_app_dir}/nutella.json"
      # Check that there is a nutella.json file in the main directory of the application
      if File.exist? nutella_json_file
        begin
          conf = JSON.parse(IO.read(nutella_json_file))
        rescue StandardError
          console.warn 'The nutella.json file for this application does not contain properly formatted JSON'
          return false
        end

        return false if conf['nutella_version'].nil?
      else
        return false
      end
      true
    end

    # Builds a PersistedHash of the application nutella.json file and returns it.
    # This method is used to ease access to the app nutella.json file.
    # @return [PersistedHash] the PersistedHash of the app nutella.json file
    def self.config
      cur_app_dir = Dir.pwd
      nutella_json_file = "#{cur_app_dir}/nutella.json"
      if File.exist? nutella_json_file
        return PersistedHash.new(nutella_json_file)
      else
        raise 'The current directory is not a nutella app: impossible to read nutella.json file'
      end
    end
  end

  # Calling this method (Nutella.current_app) simply returns
  # a reference to the CurrentAppUtils module
  def Nutella.current_app
    CurrentAppUtils
  end
end

# Returns true if the app has no bots
# def app_has_no_bots(app_id)
#   Dir.entries("#{app_path(app_id)}/bots").select { |entry| File.directory?(File.join("#{app_path(app_id)}/bots", entry)) && !(entry == '.' || entry == '..') }.empty?
# end
