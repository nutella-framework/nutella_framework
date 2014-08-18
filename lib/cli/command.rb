# CLI command
class Command 
  class << self; attr_accessor :description end
  @prj_dir = Dir.pwd  #Current directory
  
  # Check that the current directory is actually a nutella project
  def nutellaPrj?
    @prj_dir = Dir.pwd
    if File.exist?("#{@prj_dir}/conf/project.json")
      conf = JSON.parse( IO.read("#{@prj_dir}/conf/project.json") )
      if conf["nutella_version"].nil?
        puts ANSI.yellow + "The current directory is not a Nutella project" + ANSI.reset 
        return false
      end
    else
      puts ANSI.yellow + "The current directory is not a Nutella project" + ANSI.reset 
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
  
  # Commands overload this method to execute
  # Returns 0 if the execution is successful
  def run (args=nil)
    puts "Running a generic command! POOP!"
  end
  
end
