# Nutella main script
require 'logging/nutella_logging'
require 'core/nutella_core'
require 'cli/nutella_cli'
require 'config/config'
require 'config/runlist'
require 'config/project'

module Nutella
  home_dir = File.dirname(__FILE__)
  NUTELLA_HOME = home_dir[0..-4]

  # Store some constants and defaults in the configuration file
  if Nutella.config.empty?
    Nutella.init
  end
  
end
