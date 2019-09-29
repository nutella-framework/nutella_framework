# This is the entry point to the gem. The code here gets executed BEFORE
# anything else. For this reason, this is a great place to import all the
# nutella modules.
require 'config_files_management/config'
require 'cli/nutella_cli'
# require 'logging/nutella_logging'
# require 'cli/nutella_core'

# require 'config/runlist'
# require 'config/current_app_utils'

module Nutella

  # Initialize nutella home and temporary folder constants
  NUTELLA_HOME = File.dirname(__FILE__)[0..-4]
  NUTELLA_TMP = "#{NUTELLA_HOME}.tmp/"

  # If the nutella configuration file (config.json) is empty (or doesn't exist) we're going to initialize it
  # with nutella constants and defaults
  if Config.file.empty?
    Config.init
  end
  
end
