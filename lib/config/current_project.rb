# handles current project files
require 'json'

module Nutella
  
  module CurrentProjectUtils
    
    # Checks that the current directory is actually a nutella project
    # @return [Boolean] true if the current directory is a nutella project, false otherwise
    def CurrentProjectUtils.exist?
      cur_prj_dir = Dir.pwd
      nutella_json_file = "#{cur_prj_dir}/nutella.json"
      # Check that there is a nutella.json file in the main directory of the project
      if File.exist? nutella_json_file
        conf = JSON.parse( IO.read(nutella_json_file) )
        if conf['nutella_version'].nil?
          console.warn 'The current directory is not a nutella project: nutella_version unspecified in nutella.json file'
          return false
        end
      else
        console.warn 'The current directory is not a nutella project: impossible to read nutella.json file'
        return false
      end
      true
    end

    # Builds a PersistedHash of the project nutella.json file and returns it.
    # This method is used to ease access to the project nutella.json file.
    # @return [PersistedHash] the PersistedHash of the project nutella.json file
    def CurrentProjectUtils.config
      cur_prj_dir = Dir.pwd
      nutella_json_file = "#{cur_prj_dir}/nutella.json"
      if File.exist? nutella_json_file
        return PersistedHash.new nutella_json_file
        else
          console.error 'The current directory is not a nutella project: impossible to read nutella.json file'
        end
    end

    # Retrieves the current project directory
    # @return [String] the current project home
    def CurrentProjectUtils.dir
      Dir.pwd
    end
    
  end


  # Calling this method (Nutella.current_project) simply returns
  # a reference to the CurrentProjectUtils module
  def Nutella.current_project
    CurrentProjectUtils
  end
  
end



