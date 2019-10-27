require 'util/config'
require 'cli/cli'

module Nutella

  # Initialize nutella home to the folder where this source code is
  NUTELLA_HOME = File.dirname(__FILE__)[0..-4]
  NUTELLA_TMP = "#{NUTELLA_HOME}.tmp/"

  # If the nutella configuration file (config.json) is empty (or doesn't exist) we're going to initialize it
  # with nutella constants and defaults
  if Config.file.empty?
    Config.init
  end
  
end
