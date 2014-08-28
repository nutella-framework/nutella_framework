require 'core/command'
require 'fileutils'

module Nutella
  class New < Command
    @description = "Creates a new project"
  
    def run(args=nil)
      @prj_dir = args[0]
    
      # If no other arguments, show help and quit here
      if args.empty?
        console.warn "You need to specify a name for your new project"
        return 64
      end
    
      # Does a project/directory with the same name exist already?
      if File.directory?(@prj_dir)
        if File.exist?("#{@prj_dir}/conf/project.json")
          console.info "A project named #{@prj_dir} already exists"
          return 0
        else
          console.info "A directory named #{@prj_dir} already exists, impossible to create a new project in the same directory"
          return 1
        end
      end
    
      # Generate project structure
      @cur_dir = Dir.pwd  # Store current directory
      createDirStructure  # Create project directory structure
      Dir.chdir @prj_dir  # CD into the project
      console.log "Generated project structure"
    
      # Add templates
      # puts "Adding templates..."
  #     ret_val = NutellaCLI.executeCommand("add", ["#{nutella.home_dir}/deps/broker", "bots"])
  #     if ret_val != 0
  #       puts "Couldn't add template #{nutella.home_dir}/deps/broker"
  #       removeDirStructure
  #       return ret_val
  #     end
    
      console.succes "Your new project #{@prj_dir} is ready!" # Display a nice success message and return
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
      console.info "Removing project #{@prj_dir}"
      FileUtils.rm_rf(@prj_dir)
    end
  
  end
end
