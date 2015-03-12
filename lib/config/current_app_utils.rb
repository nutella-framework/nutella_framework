require 'json'

module Nutella

  # This module contains a series of utilities methods to handle the nutella
  # application contained in the directory we are at this moment
  module CurrentAppUtils
    
    # Checks that the current directory is actually a nutella application
    # @return [Boolean] true if the current directory is a nutella application, false otherwise
    def CurrentAppUtils.exist?
      cur_app_dir = Dir.pwd
      nutella_json_file = "#{cur_app_dir}/nutella.json"
      # Check that there is a nutella.json file in the main directory of the application
      if File.exist? nutella_json_file
        conf = JSON.parse( IO.read(nutella_json_file) )
        if conf['nutella_version'].nil?
          return false
        end
      else
        return false
      end
      true
    end

    # Builds a PersistedHash of the application nutella.json file and returns it.
    # This method is used to ease access to the app nutella.json file.
    # @return [PersistedHash] the PersistedHash of the app nutella.json file
    def CurrentAppUtils.config
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



