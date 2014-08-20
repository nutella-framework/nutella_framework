# Nutella main script

require 'cli/nutella_cli'
require 'config/config'
# require_relative 'nutella-config/runlist'

module Nutella
  # Store some constants and defaults in the configuration file
  NUTELLA_HOME = File.dirname(__FILE__)+"/../"
  Nutella.config["nutella_home"] = NUTELLA_HOME
  Nutella.config["broker"] = "localhost"
  Nutella.config["tmp_dir"] = "/Users/tebemis/Code/nutella/.tmp"
end
