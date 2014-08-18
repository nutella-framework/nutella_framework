# Nutella CLI
require 'ansi/code'
#require 'command'

module Nutella
  class NutellaCLI
  
    def self.run
      puts "Running nutella"
      p ARGV
      # NUTELLA_HOME = ENV['NUTELLA_HOME']
      #   nutella.home_dir = ENV['NUTELLA_HOME']
      #   nutella.loadConfig
      #nutella.storeConfig

      # args = ARGV.dup
      # args.shift
      # exitStatus = NutellaCLI.executeCommand(ARGV.first, args)
      # puts ""
      #exit(exitStatus)
    end
  
  
    # Print Nutella logo
    def NutellaCLI.printPrompt
      puts "                  _       _ _
      | |     | | |
      _ __  _   _| |_ ___| | | __ _
      |  _ \\| | | | __/ _ \\ | |/ _  |
      | | | | |_| | ||  __/ | | (_| |
      |_| |_|\\__,_|\\__\\___|_|_|\\__,_|
      "
      # If no other arguments, show help and quit here
      if ARGV.empty?
        puts "Welcome to nutella version #{nutella.version}! For a complete lists of available commands type `nutella help`\n\n"
        exit 0
      end
    end
    
    # Check that command exists
    def NutellaCLI.commandExists?(commandName)
      klass = Module.const_get(commandName)
      return klass.is_a?(Class)
    rescue NameError
      return false
    end

    # Execute command
    def NutellaCLI.executeCommand (command, args=nil) 
      # Include all commands
      Dir["#{nutella.home_dir}/nutella-cli/commands/*.rb"].each do |file|
        require_relative "commands/#{File.basename(file, File.extname(file))}"
      end
      # Check that the command exists
      if command == nil
        NutellaCLI.printPrompt
      end
      if commandExists?(command.capitalize)
        return Object::const_get(command.capitalize).new.run(args)
      else
        puts ANSI.red + "Unknown command #{command}" + ANSI.reset
        return 1
      end
    end
  
  end

end