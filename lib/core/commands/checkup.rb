require 'core/command'
require 'semantic'

module Nutella
  class Checkup < Command
    @description = "Checks that all the dependencies are installed and prepares nutella to run"
  
    def run(args=nil)
      # First check that we have all the tools we need to run nutella
      checkDependencies
      
      # Check if we have a broker and install one if not
      # TODO Change this is wrong!!!!
      if Nutella.config.has_key? "broker"
        installBroker
      end
    
      # Output message
      puts ANSI.green + "All systems go! You are ready to use nutella!" + ANSI.reset
      
      return 0
    end
  
    def installBroker    
      # Clone, cd and npm install
      system "git clone git://github.com/mcollina/mosca.git #{Nutella.config["broker_dir"]}"
      Dir.chdir(install_dir)
      system "npm install"
    
      # Add startup script
      File.open("startup", 'w') { |file| file.write("#!/bin/sh\n\nBASEDIR=$(dirname $0)\n$BASEDIR/bin/mosca --http-port 1884 &\necho $! > $BASEDIR/bin/.pid\n") }
      File.chmod(0755, "startup")
    
      # Add configuration
      Nutella.config["broker"] = "localhost"
    end
    
    
    def checkDependencies
      checkNode
    end
    
    def checkGit
      git_version = "git version 1.8.5.2"
      out = `git --version`
      out[0] = ''
      begin
        actual_version = Semantic::Version.new out
      rescue
        raise CommandException.new(:warn), "Doesn't look like node is installed in your system." + 
          "Unfotunately nutella can't do much unless all the dependencies are installed. :("
      end
      required_version = Semantic::Version.new "0.10.0" 
      if actual_version < required_version
        raise CommandException.new(:warn), "Your version of node is a little old. Nutella requires #{node_version}. Please upgrade!"
      else
        raise CommandException.new(:success), "Your node version is #{actual_version}. Yay!"
      end
    end
    
    def checkNode
      node_version = "0.10.0"
      out = `node --version`
      out[0] = ''
      begin
        actual_version = Semantic::Version.new out
      rescue
        raise CommandException.new(:warn), "Doesn't look like node is installed in your system." + 
          "Unfotunately nutella can't do much unless all the dependencies are installed. :("
      end
      required_version = Semantic::Version.new "0.10.0" 
      if actual_version < required_version
        raise CommandException.new(:warn), "Your version of node is a little old. Nutella requires #{node_version}. Please upgrade!"
      else
        raise CommandException.new(:success), "Your node version is #{actual_version}. Yay!"
      end
    end
  end
end

