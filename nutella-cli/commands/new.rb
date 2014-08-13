require_relative '../command'
require_relative '../nutella-cli'
require 'fileutils'

class New < Command
  @description = "Creates a new project"
  
  def run(args=nil)
    @prj_dir = args[0]
    
    # If no other arguments, show help and quit here
    if args.empty?
      puts ANSI.yellow + "You need to specify a name for your new project" + ANSI.reset
      return 64
    end
    
    # Does a project/directory with the same name exist already?
    if File.directory?(@prj_dir)
      if File.exist?("#{@prj_dir}/conf/project.json")
        puts "A project named #{@prj_dir} already exists"
        return 0
      else
        puts "A directory named #{@prj_dir} already exists, impossible to create a new project in the same directory"
        return 1
      end
    end
    
    # Generate project structure
    print "Generating project structure..."
    @cur_dir = Dir.pwd  # Store current directory
    createDirStructure  # Create project directory structure
    Dir.chdir @prj_dir  # CD into the project
    puts " DONE"
    
    # Add templates
    # puts "Adding templates..."
#     ret_val = NutellaCLI.executeCommand("add", ["#{nutella.home_dir}/deps/broker", "bots"])
#     if ret_val != 0
#       puts "Couldn't add template #{nutella.home_dir}/deps/broker"
#       removeDirStructure
#       return ret_val
#     end
    
    puts ANSI.green + "Your new project #{@prj_dir} is ready!" + ANSI.reset   # Display a nice success message and return
    return 0 
  end
  
  
  def createDirStructure
    FileUtils.mkdir_p("#{@prj_dir}/bots")       # bots dir
    FileUtils.mkdir_p("#{@prj_dir}/interfaces") # interfaces dir
    FileUtils.mkdir_p("#{@prj_dir}/conf")       # conf dir
    # create base configuration file
    config_file_hash = {
      "nutella_version" => "#{nutella.version}",
      "name" => @prj_dir,
      "version" => "0.1.0-SNAPSHOT"
    }
    File.open("#{@prj_dir}/conf/project.json","w") do |f|
      f.write(JSON.pretty_generate(config_file_hash))
    end
  end
  
  def removeDirStructure
    Dir.chdir @cur_dir
    puts "Removing project #{@prj_dir}"
    FileUtils.rm_rf(@prj_dir)
  end
  
end