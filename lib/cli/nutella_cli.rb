require 'ansi/code'

# Include all commands
Dir[File.dirname(__FILE__)+"/commands/*.rb"].each do |file|
  require "cli/commands/#{File.basename(file, File.extname(file))}"
end

=begin
{
"home_dir": "/Users/tebemis/Code/nutella",
"version": "0.1.0",
"project_url": "http://ltg-uic.github.io/nutella/",
"broker": "localhost",
"tmp_dir": "/Users/tebemis/Code/nutella/.tmp",
"runs": [

]
}
=end

# NUTELLA_HOME = ENV['NUTELLA_HOME']
#   nutella.home_dir = ENV['NUTELLA_HOME']
#   nutella.loadConfig
#nutella.storeConfig


module Nutella

  class NutellaCLI
    
    # Reads the parameters and executes commands
    def self.run
      args = ARGV.dup
      args.shift
      exitStatus = executeCommand(ARGV.first, args)
      puts ""
      exit(exitStatus)
    end
  
    # Print Nutella logo
    def self.printPrompt
      puts "                  _       _ _
      | |     | | |
      _ __  _   _| |_ ___| | | __ _
      |  _ \\| | | | __/ _ \\ | |/ _  |
      | | | | |_| | ||  __/ | | (_| |
      |_| |_|\\__,_|\\__\\___|_|_|\\__,_|
      "
      # If no other arguments, show help and quit here
      if ARGV.empty?
        nutella_version = File.open(File.dirname(__FILE__)+"/../../VERSION", "rb").read
        puts "Welcome to nutella version #{nutella_version}! For a complete lists of available commands type `nutella help`\n\n"
        exit 0
      end
    end
    
    # Check that command exists
    def self.commandExists?(command)
      return Nutella.const_get("Nutella::#{command.capitalize}").is_a?(Class)
    rescue NameError
      return false
    end

    # Execute command
    def self.executeCommand (command, args=nil) 
      # Check that the command exists
      if command == nil
        printPrompt
      end
      if commandExists?(command)
        return Object::const_get("Nutella::#{command.capitalize}").new.run(args)
      else
        puts ANSI.red + "Unknown command #{command}" + ANSI.reset
        return 1
      end
    end
  
  end

end