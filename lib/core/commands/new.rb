require 'core/command'
require 'fileutils'

module Nutella
  class New < Command
    @description = 'Creates a new project'
  
    def run(args=nil)
      cur_prj_dir = args[0]
    
      # If no other arguments, show help and quit here
      if args.empty?
        console.warn 'You need to specify a name for your new project'
        return
      end
    
      # Check that a directory (i.e. project) with the same name doesn't already exist
      # If it does it looks into it to see if there is a nutella.json file and displays
      # the proper error message
      if File.directory? cur_prj_dir
        if File.exist? "#{cur_prj_dir}/nutella.json"
          console.warn "A project named #{cur_prj_dir} already exists"
          return
        else
          console.warn "A directory named #{cur_prj_dir} already exists"
          return
        end
      end
    
      # If all seems good, generate the project structure
      create_dir_structure cur_prj_dir

      # Display a nice success message and return
      console.success "Your new project #{cur_prj_dir} is ready!"
    end
    
    
    private 
  
  
    def create_dir_structure( cur_prj_dir )
      # Create directories
      FileUtils.mkdir_p("#{cur_prj_dir}/bots")
      FileUtils.mkdir_p("#{cur_prj_dir}/interfaces")
      # Create nutella.json hash
      config_file_hash = {
        'name' => cur_prj_dir,
        'version' => '0.1.0',
        'nutella_version' => File.open("#{NUTELLA_HOME}VERSION", 'rb').read,
        'type' => 'project',
        'description' => 'A quick description of your project'
      }
      # Write nutella.json hash
      File.open("#{cur_prj_dir}/nutella.json", 'w') do |f|
        f.write(JSON.pretty_generate(config_file_hash))
      end
    end
  
  end
end
