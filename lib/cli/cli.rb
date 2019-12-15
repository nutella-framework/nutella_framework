# frozen_string_literal: true

require_relative 'logger'
# Require all the commands
Dir["#{File.dirname(__FILE__)}/commands/*.rb"].each do |file|
  require_relative "commands/#{File.basename(file, File.extname(file))}"
end

module Nutella
  class NutellaCLI
    NUTELLA_LOGO = "                   _       _ _
                  | |     | | |
       _ __  _   _| |_ ___| | | __ _
      |  _ \\| | | | __/ _ \\ | |/ _  |
      | | | | |_| | ||  __/ | | (_| |
      |_| |_|\\__,_|\\__\\___|_|_|\\__,_|
      "

    # Nutella entry point. Every time the "nutella" command is invoked this is
    # the method that gets called.
    # It reads the command line parameters and it invokes the right sub-command
    def self.run
      # Flush output immediately
      $stdout.sync = true

      # Read parameters
      args = ARGV.dup
      args.shift

      # Check that the command is not empty, if so, simply print the nutella logo
      command = ARGV.first
      if command.nil?
        print_nutella_logo
        exit 0
      end

      # If nutella is not ready to be used (i.e. nobody has invoked the "nutella checkup" command yet),
      # append warning/reminder message
      if Config.file['ready'].nil? && command != 'checkup'
        console.warn 'Looks like this is a fresh installation of nutella. Please run \'nutella checkup\' to check all dependencies are installed.'
      end

      # Execute the appropriate command
      execute_command(command, args)
      exit 0
    end

    # This method executes a particular command
    # @param command [String] the name of the command
    # @param args [Array<String>] command line parameters passed to the command
    def self.execute_command(command, args = nil)
      # Check that the command exists and if it does,
      # execute its run method passing the args parameters
      if command_exists?(command)
        Object.const_get("Nutella::#{command.capitalize}").new.run(args)
      else
        console.error "Unknown command #{command}"
      end
    end

    # This method checks that a particular command exists
    # @return [Boolean] true if the command exists, false otherwise
    def self.command_exists?(command)
      Nutella.const_get("Nutella::#{command.capitalize}").is_a?(Class) &&
        Nutella.const_get("Nutella::#{command.capitalize}").method_defined?(:run)
    rescue NameError
      false
    end

    # Print nutella logo
    def self.print_nutella_logo
      console.info(NUTELLA_LOGO)
      console.info("Welcome to nutella version #{Version.get}! For a complete lists of available commands type 'nutella help'\n")
      # If nutella is not ready to be used (i.e. nobody has invoked the "nutella checkup" command yet),
      # append warning/reminder message
      if Config.file['ready'].nil?
        console.warn 'Looks like this is a fresh installation of nutella. Please run \'nutella checkup\' to check all dependencies are installed.'
      end
    end
  end
end
