# Nutella main script

require 'cli/nutella_cli'
require 'config/config'
# require_relative 'nutella-config/runlist'

module Nutella
  NUTELLA_HOME = File.dirname(__FILE__)+"/../"
  
  # Store some constants and defaults in the configuration file
  def Nutella.store_constants
    Nutella.config.clear
    Nutella.config["nutella_home"] = NUTELLA_HOME
    Nutella.config["broker"] = "localhost"
    Nutella.config["tmp_dir"] = NUTELLA_HOME+".tmp"
  end
  
  Nutella.store_constants
  
end
