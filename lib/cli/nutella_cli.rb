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
      command = ARGV.first
      if command == nil
        printPrompt
        exit 0
      end
      # Prepend warning if nutella is not ready
      if (Nutella.config["ready"].nil? && command!="checkup")
        console.warn "Looks like this is a fresh installation of nutella. Please run `nutella checkup` to check all dependencies are installed."
      end
      Nutella.executeCommand command, args
      exit 0
    end
  
    # Print Nutella logo
    def self.printPrompt
      console.info(NUTELLA_LOGO)
      nutella_version = File.open(NUTELLA_HOME+"VERSION", "rb").read
      console.info("Welcome to nutella version #{nutella_version}! For a complete lists of available commands type `nutella help`\n")
      # Append warning if nutella is not ready
      if (Nutella.config["ready"].nil?)
        console.warn "Looks like this is a fresh installation of nutella. Please run `nutella checkup` to check all dependencies are installed."
      end
    end
  end

end
