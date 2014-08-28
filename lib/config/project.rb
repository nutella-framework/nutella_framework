# handles current project files

require 'singleton'
require 'json'

module Nutella
  
  class Project
    
    include Singleton
    
    # Check that the current directory is actually a nutella project
    def nutellaPrj?
      @prj_dir = Dir.pwd
      if File.exist?("#{@prj_dir}/conf/project.json")
        conf = JSON.parse( IO.read("#{@prj_dir}/conf/project.json") )
        if conf["nutella_version"].nil?
          console.warn("The current directory is not a Nutella project") 
          return false
        end
      else
        console.warn("The current directory is not a Nutella project")
        return false
      end
      return true
    end
  
    # Returns the value for an entry in the project configuration file
    def prj_config(entry)
      @prj_dir = Dir.pwd
      if File.exist?("#{@prj_dir}/conf/project.json")
        conf = JSON.parse( IO.read("#{@prj_dir}/conf/project.json") )
        return conf["name"]
      end
    end
    
  end
  
  
  def Nutella.currentProject
    Project.instance
  end
  
end



