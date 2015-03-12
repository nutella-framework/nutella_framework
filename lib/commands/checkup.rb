require 'commands/meta/command'
require 'semantic'

module Nutella
  class Checkup < Command
    @description = 'Checks that all the framework dependencies are installed'
  
    def run( args=nil )

      # First check that we have all the tools we need to run nutella
      return unless all_dependencies_installed?
      
      # Check if we have a local broker installed
      # and install one if we don't
      if File.directory? Nutella.config['broker_dir']
        console.info 'You have a local broker installed. Yay!'
      else
        console.warn 'You don\'t seem to have a local broker installed so we are going to go ahead and install one for you. This might take some time...'
        unless install_local_broker
          console.error 'Whoops...something went wrong while installing the broker'
          return
        end
      end
          
      # Set ready flag in config.json
      Nutella.config['ready'] = true

      # Output success message
      console.success 'All systems go! You are ready to use nutella!'
    end
    
  
    private 
    
  
    def install_local_broker
      # Clone, cd and npm install
      broker_version = 'v0.28.1'
      out1 = system "git clone -b #{broker_version} --depth 1 git://github.com/mcollina/mosca.git #{Nutella.config['broker_dir']} > /dev/null 2>&1"
      Dir.chdir(Nutella.config['broker_dir'])
      out2 = system 'npm install > /dev/null 2>&1'
    
      # Add startup script and make it executable
      File.open('startup', 'w') { |file| file.write("#!/bin/sh\n\nBASEDIR=$(dirname $0)\n$BASEDIR/bin/mosca --http-port 1884 > /dev/null 2>&1 &\necho $! > $BASEDIR/bin/.pid\n") }
      File.chmod( 0755, 'startup' )
    
      # Write configuration into config.json
      Nutella.config['broker'] = 'localhost'
      out1 && out2
    end
    
    
    def all_dependencies_installed?
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
      # Tmux version lambda
      tmux_semver = lambda do
        out = `tmux -V`
        out.slice!(0,5)
        Semantic::Version.new "#{out[0..2]}.0"
      end
      # Check versions
      return true if check_version?('node', '0.10.0', node_semver) && check_version?('git', '1.8.0', git_semver) && check_version?('tmux', '1.8.0', tmux_semver)
      # If even one of the checks fails, return false
      false
    end
    
    
    def check_version?(dep, req_version, lambda)
      begin
        actual_version = lambda.call
      rescue
        console.warn "Doesn't look like #{dep} is installed in your system. " +
          "Unfortunately nutella can't do much unless all the dependencies are installed :("
          return
      end
      required_version = Semantic::Version.new req_version 
      if actual_version < required_version
        console.warn "Your version of #{dep} is a little old (#{actual_version}). Nutella requires #{required_version}. Please upgrade!"
        false
      else
        console.info "Your #{dep} version is #{actual_version}. Yay!"
        true
      end
    end

  end

end

