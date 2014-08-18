# Nutella main script

#require_relative 'nutella-cli/nutella-cli'
# require_relative 'nutella-config/config'
# require_relative 'nutella-config/runlist'

module Nutella
  class CommandLineInterface 
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
  end
  
end
