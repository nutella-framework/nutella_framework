# This handles the configuration files of Nutella
# It's basically a hash overload that stores into a file
require 'singleton'
require 'json'

module Nutella
  
  class JSONFileHash < Hash
    
    CONFIG_FILE=File.dirname(__FILE__)+"/../../config.json"
    
    include Singleton
    
    def []=(key,val)
      result = super(key,val)
      storeConfigToFile
      result
    end
    
    def [](key)
      loadConfigFromFile
      super(key)
    end
    
    def clear
      result = super
      storeConfigToFile
      result
    end
    
    private
    
    def storeConfigToFile
      File.open(CONFIG_FILE, "w") do |f|
        f.write(JSON.pretty_generate(self))
      end
    end
    
    def loadConfigFromFile
      begin
        self.merge! JSON.parse IO.read CONFIG_FILE
      rescue
        # File doesn't exist... do nothing
      end
    end
    
    def removeConfigFile
      File.delete(CONFIG_FILE) if File.exist?(CONFIG_FILE)
    end
    
  end
  
  def Nutella.config
    JSONFileHash.instance
  end
  
end
