# frozen_string_literal: true

require_relative 'meta/command'
require 'fileutils'
require 'json'

module CommandsServer
  class New < Command
    @description = 'Creates a new nutella application'

    def run(opts = nil)
      # If no app name is provided, return an error
      if opts['args'].nil? || opts['args'].empty?
        return failure('You need to specify a name for your new application')
      end

      # Parse the name of the app from the CLI parameters
      app_id = opts['args'][0]
      # Checks that a directory (i.e. an app) with the same name doesn't already exist
      # If it does, we looks into it to see if there is a nutella.json file and display
      # the proper error message
      app_dir = "#{opts['current_dir']}/#{app_id}"
      if File.directory? app_dir
        if File.file? "#{app_dir}/nutella.json"
          return failure("An application named #{app_id} already exists")
        end
      end
      # If all seems good, generate the application skeleton
      create_app(app_id, app_dir)
      # Display a success message and return
      success("Your new nutella application #{app_id} is ready!")
    end

    private

    def create_app(app_id, app_dir)
      # Create directories
      FileUtils.mkdir_p("#{app_dir}/bots")
      FileUtils.mkdir_p("#{app_dir}/interfaces")
      # Create nutella.json hash
      config_file_hash = {
        name: app_id,
        version: '0.1.0',
        # TODO: figure out how to do make this dynamic
        # :nutella_version => File.open("#{Nutella::NUTELLA_SRC}VERSION", 'rb').read,
        nutella_version: '2.0.0',
        type: 'application',
        description: 'A quick description of your application'
      }
      # Write nutella.json hash
      File.open("#{app_dir}/nutella.json", 'w') do |f|
        f.write(JSON.pretty_generate(config_file_hash))
      end
    end
  end
end
