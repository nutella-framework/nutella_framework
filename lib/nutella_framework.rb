# Nutella main script
require 'core/nutella_core'
require 'cli/nutella_cli'
require 'config/config'
require 'config/runlist'

module Nutella
  NUTELLA_HOME = File.dirname(__FILE__)+"/../"
  
  # Store some constants and defaults in the configuration file
  def Nutella.store_constants
    Nutella.config.clear
    Nutella.config["nutella_home"] = NUTELLA_HOME
    Nutella.config["tmp_dir"] = NUTELLA_HOME+".tmp"
    Nutella.config["broker_dir"] = NUTELLA_HOME+"/broker"
  end
  
  Nutella.store_constants
  
end
