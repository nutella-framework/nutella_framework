require_relative '../command'
require_relative '../nutella-cli'
require 'fileutils'
require 'json'


class New < Command
  def run(args=nil)
    @prj_dir = args[0]
    # If no other arguments, show help and quit here
    if args.empty?
      puts "You need to specify a name for your new project"
      return
    end

    # Create the directory structure for a new nutella project
    createDirStructure
    
    # Download, compile, configure and instantiate the broker
    if !instantiateBroker
      return
    end

    # Run createbot command to create bots
    # NutellaCLI.executeCommand("createbot", )

    puts "Your new project #{@prj_dir} is ready!" 
  end
  
  
  def createDirStructure
    # bots dir
    unless File.directory?("#{@prj_dir}/bots")
      FileUtils.mkdir_p("#{@prj_dir}/bots")
    end
    
    # conf dir
    unless File.directory?("#{@prj_dir}/conf")
      FileUtils.mkdir_p("#{@prj_dir}/conf")
    end

    # create configuration file
    config_file_hash = {
        "broker" => "internal"
    }
    File.open("#{@prj_dir}/conf/project.json","w") do |f|
      f.write(JSON.pretty_generate(config_file_hash))
    end
  end
  
  def instantiateBroker 
    # Check if node/npm is installed correctly
    # if ???
#       puts "Node and npm are not installed and they are required to run the MQTT broker"
#       return false
#     end

    # Clone, cd and npm install
    system "git clone git://github.com/mcollina/mosca.git #{@prj_dir}/bots/broker"
    Dir.chdir("#{@prj_dir}/bots/broker")
    system "npm install"
    
    # Add startup script like all other bots
    File.open("startup", 'w') { |file| file.write("
      #!/bin/sh
      
      BASEDIR=$(dirname $0)
      ./$BASEDIR/bin/mosca --http-port 1884 -v"
      ) 
    }
    File.chmod(0755, "startup")
  end
end