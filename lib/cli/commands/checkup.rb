# frozen_string_literal: true

require_relative 'meta/command'
require 'config/config'
require 'semantic'
require 'docker-api'

module Nutella
  class Checkup < Command
    @description = 'Checks that all the framework dependencies are installed'

    def run(_args = nil)
      # First check that we have all the tools we need to run nutella
      return unless all_dependencies_installed?

      # Check if we have a local broker installed
      # and installs one if we don't
      return unless broker_docker_image_ready?

      # Check if we have a mongo installed locally
      # and installs one if we don't
      return unless mongo_docker_image_ready?

      # Check that we have a nutella ruby image built
      # if not, build one
      return unless nutella_docker_images_ready?

      # Set ready flag in config.json
      Config.file['ready'] = true

      # Output success message
      console.success 'All systems go! You are ready to use nutella!'
    end

    private

    def all_dependencies_installed?
      # Docker version lambda
      docker_semver = lambda do
        Semantic::Version.new(Docker.version['Version'].slice(0..1).concat('.0.0'))
      end
      # Git version lambda
      git_semver = lambda do
        out = `git --version`
        out.slice!(0, 12)
        begin
          semver = Semantic::Version.new(out[0..4])
        rescue StandardError
          semver = Semantic::Version.new(out[0..5])
        end
        semver
      end
      # Check versions
      if check_version?('docker', '17.0.0', docker_semver) && check_version?('git', '1.8.0', git_semver)
        return true
      end

      # If any of the checks fail, return false instead
      false
    end

    def check_version?(dep, req_version, lambda)
      begin
        actual_version = lambda.call
      rescue StandardError
        console.warn "Doesn't look like #{dep} is installed in your system. " \
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

    # Checks that the broker image has been pulled and pulls it if not
    def broker_docker_image_ready?
      if broker_image_exists?
        console.info 'You have a local broker installed. Yay!'
      else
        console.warn 'You don\'t seem to have a local broker installed so we are going to go ahead and install one for you. This might take some time...'
        begin
          install_local_broker
        rescue StandardError => e
          puts e
          console.error 'Whoops...something went wrong while installing the broker, try running \'nutella checkup\' again'
          false
        end
        console.info 'Broker installed successfully!'
      end
      true
    end

    # Checks that: 1. The Docker image for the broker has been pulled and
    # 2. config.json has been correctly configured
    def broker_image_exists?
      Docker::Image.exist?('matteocollina/mosca:v2.3.0') && !Config.file['broker'].nil?
    end

    def install_local_broker
      # Docker pull to install
      Docker::Image.create('fromImage': 'matteocollina/mosca:v2.3.0')
      # Write broker setting inside config.json
      Config.file['broker'] = '127.0.0.1'
      # Create data directory for the broker
      unless File.directory?("#{NUTELLA_HOME}broker")
        Dir.mkdir("#{NUTELLA_HOME}broker")
      end
    end

    # Checks that the mongo image has been pulled and pulls it if not
    def mongo_docker_image_ready?
      if mongo_image_exists?
        console.info 'You have mongo installed locally. Yay!'
      else
        console.warn 'You don\'t seem to have a mongo installed locally so we are going to go ahead and install it for you. This might take some time...'
        begin
          install_local_mongo
        rescue StandardError => e
          puts e
          console.error 'Whoops...something went wrong while installing mongo, try running \'nutella checkup\' again'
          return false
        end
        console.info 'Mongo installed successfully!'
      end
      true
    end

    # Checks that: 1. The Docker image for mongo has been pulled and
    # 2. config.json has been correctly configured
    def mongo_image_exists?
      Docker::Image.exist?('mongo:3.2.21') && !Config.file['mongo'].nil?
    end

    def install_local_mongo
      # Docker pull to install
      Docker::Image.create('fromImage': 'mongo:3.2.21')
      # Write mongo setting inside config.json
      Config.file['mongo'] = '127.0.0.1'
      # Create data directory for mongo
      unless File.directory?("#{NUTELLA_HOME}mongodb")
        Dir.mkdir("#{NUTELLA_HOME}mongodb")
      end
    end

    def nutella_docker_images_ready?
      if nutella_images_exist?
        console.info 'You have a nutella docker image ready. Yay!'
      else
        console.warn 'You don\'t seem to have a nutella docker image ready. We\'re gonna go ahead and build one for you. This might take some time...'
        begin
          build_nutella_docker_images
        rescue StandardError => e
          puts e
          console.error 'Whoops...something went wrong while building the nutella docker image, try running \'nutella checkup\' again'
          return false
        end
        console.info 'nutella docker image built successfully!'
      end
      true
    end

    # Checks that the nutella image exists and if not tries to build it
    def nutella_images_exist?
      version = File.open("#{Config.file['src_dir']}VERSION", 'rb').read
      Docker::Image.exist?("nutella_rb:#{version}") && Docker::Image.exist?("nutella_js:#{version}")
    end

    # Builds a docker image that we can use to run framework level bots in a dockerized way
    def build_nutella_docker_images
      version = File.open("#{Config.file['src_dir']}VERSION", 'rb').read
      img = Docker::Image.build_from_dir(Config.file['src_dir'], 'dockerfile': 'Dockerfile.rubyimage')
      img.tag('repo': 'nutella_rb', 'tag': version, force: true)
      img = Docker::Image.build_from_dir(Config.file['src_dir'], 'dockerfile': 'Dockerfile.jsimage')
      img.tag('repo': 'nutella_js', 'tag': version, force: true)
    end
  end
end
