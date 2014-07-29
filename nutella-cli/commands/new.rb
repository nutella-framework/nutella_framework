require_relative '../command'
require_relative '../nutella-cli'
require 'fileutils'


class New < Command
  @description = "Creates a new project"
  
  def run(args=nil)
    @prj_dir = args[0]
    # If no other arguments, show help and quit here
    if args.empty?
      puts "You need to specify a name for your new project"
      return
    end
    # Create the directory structure for a new nutella project
    createDirStructure
    # Instantiate broker and other basic templates using 'add' command
    # NutellaCLI.executeCommand("createbot", )
    puts "Your new project #{@prj_dir} is ready!" 
  end
  
  
  def createDirStructure
    # bots dir
    unless File.directory?("#{@prj_dir}/bots")
      FileUtils.mkdir_p("#{@prj_dir}/bots")
    end
    
    # interfaces dir
    unless File.directory?("#{@prj_dir}/interfaces")
      FileUtils.mkdir_p("#{@prj_dir}/interfaces")
    end
    
    # conf dir
    unless File.directory?("#{@prj_dir}/conf")
      FileUtils.mkdir_p("#{@prj_dir}/conf")
    end

    # create configuration file
    config_file_hash = {
      "nutella_version" => "#{nutella.version}",
      "broker" => "mosca-internal"
    }
    File.open("#{@prj_dir}/conf/project.json","w") do |f|
      f.write(JSON.pretty_generate(config_file_hash))
    end
  end
  
end