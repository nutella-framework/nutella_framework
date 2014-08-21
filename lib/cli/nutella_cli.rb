require 'ansi/code'

module Nutella

  class NutellaCLI
    
    NUTELLA_LOGO = "                   _       _ _
                  | |     | | |
       _ __  _   _| |_ ___| | | __ _
      |  _ \\| | | | __/ _ \\ | |/ _  |
      | | | | |_| | ||  __/ | | (_| |
      |_| |_|\\__,_|\\__\\___|_|_|\\__,_|
      "
    
    # Reads the parameters and executes commands
    def self.run
      # Read parameters
      args = ARGV.dup
      args.shift
      # Check that the command is not empty, if so, print the prompt
      if ARGV.first == nil
        printPrompt
        exit 0
      end
      begin
        Nutella.executeCommand ARGV.first, args
      rescue CommandException => e 
        if e.log_level==:error
          puts ANSI.red + e.message + ANSI.reset
        elsif e.log_level==:warn
          puts ANSI.yellow + e.message + ANSI.reset
        elsif e.log_level==:info
          puts e.message
        elsif e.log_level==:success
          puts ANSI.green + e.message + ANSI.reset
        end
        exitStatus = 1
      end
      exitStatus = 0
      puts ""
      exit exitStatus
    end
  
    # Print Nutella logo
    def self.printPrompt
      puts NUTELLA_LOGO
      nutella_version = File.open(NUTELLA_HOME+"VERSION", "rb").read
      puts "Welcome to nutella version #{nutella_version}! For a complete lists of available commands type `nutella help`\n\n"
    end
  end

end
