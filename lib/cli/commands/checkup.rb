require_relative 'meta/command'
require 'config/config'
require 'semantic'

module Nutella
  class Checkup < Command
    @description = 'Checks that all the framework dependencies are installed'
  
    def run( args=nil )

      # First check that we have all the tools we need to run nutella
      return unless all_dependencies_installed?
      
      # Check if we have a local broker installed
      # and install one if we don't
      if broker_exists
        console.info 'You have a local broker installed. Yay!'
      else
        console.warn 'You don\'t seem to have a local broker installed so we are going to go ahead and install one for you. This might take some time...'
        unless install_local_broker
          console.error 'Whoops...something went wrong while installing the broker'
          return
        end
      end
          
      # Set ready flag in config.json
      Config.file['ready'] = true

      # Output success message
      console.success 'All systems go! You are ready to use nutella!'
    end
    
  
    private 
    
  
    def broker_exists
      # Check if Docker image for the broker was already pulled
      if `docker images matteocollina/mosca:v2.3.0 --format "{{.ID}}"` != ""
        # If so, check that a broker configuration exists and create one if it doesn't
        Config.file['broker'] = '127.0.0.1' if Config.file['broker'].nil? 
        true
      else
        false
      end
    end


    def install_local_broker
      # Docker pull to install
      system "docker pull matteocollina/mosca:v2.3.0 > /dev/null 2>&1"
      # Write broker setting inside config.json
      Config.file['broker'] = '127.0.0.1'
    end
    
    
    def all_dependencies_installed?
      # Docker version lambda
      docker_semver = lambda do
        out = `docker --version`
        token = out.split(' ')
        token[2].slice(0..1)
        Semantic::Version.new token[2].slice(0..1).concat('.0.0')
      end
      # Git version lambda
      git_semver = lambda do
        out = `git --version`
        out.slice!(0,12)
        begin  
          semver = Semantic::Version.new(out[0..4]) 
        rescue
          semver = Semantic::Version.new(out[0..5])
        end
        semver
      end
      # Immortal version lambda
      immortal_semver = lambda do
        out = `immortal -v`
        out.gsub("\n",'')
        Semantic::Version.new out
      end
      # Mongo version lambda
      mongo_semver = lambda do
        out = `mongod --version`
        out.slice!(0,12)
        Semantic::Version.new out[0..4]
      end
      # Check versions
      return true if check_version?('docker', '17.0.0', docker_semver) && check_version?('git', '1.8.0', git_semver) && check_version?('immortal', '0.23.0', immortal_semver) && check_version?('mongodb', '2.6.9', mongo_semver)
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

