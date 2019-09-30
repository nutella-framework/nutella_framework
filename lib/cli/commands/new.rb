require_relative 'meta/command'
require 'fileutils'

module Nutella
  class New < Command
    @description = 'Creates a new nutella application'
  
    def run(args=nil)
      app_id = args[0]
    
      # If no other arguments, show help and quit here
      if args.empty?
        console.warn 'You need to specify a name for your new application'
        return
      end
    
      # Check that a directory (i.e. an app) with the same name doesn't already exist
      # If it does it looks into it to see if there is a nutella.json file and displays
      # the proper error message
      if File.directory? app_id
        if File.exist? "#{app_id}/nutella.json"
          console.warn "An application named #{app_id} already exists"
          return
        else
          console.warn "A directory named #{app_id} already exists"
          return
        end
      end
    
      # If all seems good, generate the application skeleton
      create_dir_structure app_id

      # Display a nice success message and return
      console.success "Your new nutella application #{app_id} is ready!"
    end
    
    
    private 
  
  
    def create_dir_structure( app_id )
      # Create directories
      FileUtils.mkdir_p("#{app_id}/bots")
      FileUtils.mkdir_p("#{app_id}/interfaces")
      # Create nutella.json hash
      config_file_hash = {
        :name => app_id,
        :version => '0.1.0',
        :nutella_version => File.open("#{Nutella::NUTELLA_HOME}VERSION", 'rb').read,
        :type => 'application',
        :description => 'A quick description of your application'
      }
      # Write nutella.json hash
      File.open("#{app_id}/nutella.json", 'w') do |f|
        f.write(JSON.pretty_generate(config_file_hash))
      end
    end
  
  end
end
