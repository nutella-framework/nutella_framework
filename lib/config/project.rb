# handles current project files

require 'singleton'
require 'json'

module Nutella
  
  class Project
    
    include Singleton
    
    # Check that the current directory is actually a nutella project
    def exist?
      @prj_dir = Dir.pwd
      if File.exist?("#{@prj_dir}/conf/project.json")
        conf = JSON.parse( IO.read("#{@prj_dir}/conf/project.json") )
        if conf["nutella_version"].nil?
          console.warn "The current directory is not a Nutella project"
          return false
        end
      else
        console.warn "The current directory is not a Nutella project"
        return false
      end
      return true
    end
  
    # Returns the value for an entry in the project configuration file
    def config
      @prj_dir = Dir.pwd
      if File.exist? "#{@prj_dir}/conf/project.json" 
        return ConfigHash.new "#{@prj_dir}/conf/project.json"
        else
          console.error "The current directory is not a Nutella project! Impossible to get project configuration file"
        end
    end
    
  end
  
  
  def Nutella.currentProject
    Project.instance
  end
  
end



