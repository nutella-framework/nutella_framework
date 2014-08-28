require 'core/command'
require 'semantic'

module Nutella
  class Checkup < Command
    @description = "Checks that all the dependencies are installed and prepares nutella to run"
  
    def run(args=nil)
      # First check that we have all the tools we need to run nutella
      if !allDependenciesInstalled?
        return
      end
      
      # Check if we have a broker and install one if not
      if !File.directory? Nutella.config["broker_dir"]
        console.warn "You don't seem to have a local broker installed so we are going to go ahead and install one for you. This might take some time..."
        if !installBroker
          console.error "Whoops...something went wrong while installing the broker. "
          return
        end
      else
        console.info "You have a local broker installed. Yay!"
      end
          
      # Set config and output message
      Nutella.config["ready"] = true
      console.success("All systems go! You are ready to use nutella!")
    end
    
  
    private 
    
  
    def installBroker    
      # Clone, cd and npm install
      out1 = system "git clone git://github.com/mcollina/mosca.git #{Nutella.config["broker_dir"]} > /dev/null 2>&1"
      Dir.chdir(Nutella.config["broker_dir"])
      out2 = system "npm install > /dev/null 2>&1"
    
      # Add startup script
      File.open("startup", 'w') { |file| file.write("#!/bin/sh\n\nBASEDIR=$(dirname $0)\n$BASEDIR/bin/mosca --http-port 1884 &\necho $! > $BASEDIR/bin/.pid\n") }
      File.chmod(0755, "startup")
    
      # Add configuration
      Nutella.config["broker"] = "localhost"
      return out1 && out2
    end
    
    def allDependenciesInstalled?
      # Node version lambda
      node_semver = lambda do
        out = `node --version`
        out[0] = ''
        Semantic::Version.new out
      end
      # Git version lambda
      git_semver = lambda do
        out = `git --version`
        out.slice!(0,12)
        Semantic::Version.new out[0..4]
      end
      # Check versions
      if checkVersion?("node", "0.10.0", node_semver) && checkVersion?("git", "1.8.0", git_semver)
        return true
      end
      false
    end
    
    
    def checkVersion?(dep, req_version, lambda)
      begin
        actual_version = lambda.call
      rescue
        console.warn "Doesn't look like #{dep} is installed in your system. " + 
          "Unfotunately nutella can't do much unless all the dependencies are installed :("
          return
      end
      required_version = Semantic::Version.new req_version 
      if actual_version < required_version
        console.warn "Your version of #{dep} is a little old (#{actual_version}). Nutella requires #{required_version}. Please upgrade!"
        return
      else
        console.info "Your #{dep} version is #{actual_version}. Yay!"
        true
      end
    end
    
    
  end
end

