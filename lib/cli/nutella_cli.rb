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
      # Read parameters
      args = ARGV.dup
      args.shift

      # Check that the command is not empty, if so, simply print the nutella logo
      command = ARGV.first
      if command == nil
        print_nutella_logo
        exit 0
      end

      # If nutella is not ready to be used (i.e. nobody has invoked the "nutella checkup" command yet),
      # append warning/reminder message
      if Nutella.config['ready'].nil? && command!='checkup'
        console.warn 'Looks like this is a fresh installation of nutella. Please run \'nutella checkup\' to check all dependencies are installed.'
      end

      # Execute the appropriate command
      Nutella.execute_command command, args
      exit 0
    end


    # Print nutella logo
    def self.print_nutella_logo
      console.info(NUTELLA_LOGO)
      nutella_version = File.open("#{Nutella.config['nutella_home']}VERSION", 'rb').read
      console.info("Welcome to nutella version #{nutella_version}! For a complete lists of available commands type 'nutella help'\n")
      # If nutella is not ready to be used (i.e. nobody has invoked the "nutella checkup" command yet),
      # append warning/reminder message
      if  Nutella.config['ready'].nil?
        console.warn 'Looks like this is a fresh installation of nutella. Please run \'nutella checkup\' to check all dependencies are installed.'
      end
    end
  end

end
