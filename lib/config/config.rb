# This handles the configuration files of Nutella
# It's basically a hash overload that stores into a file
require 'singleton'
require 'json'

module Nutella
  
  class ConfigHash
    
    CONFIG_FILE=File.dirname(__FILE__)+"/../../config.json"
    
    include Singleton
    
    def []=(key,val)
      hash = loadConfig
      hash[key]=val
      storeConfig hash
    end
    
    def [](key)
      hash = loadConfig
      hash[key]
    end
    
    def empty?
      hash = loadConfig
      hash.empty?
    end
    
    def has_key?(key)
      hash = loadConfig
      hash.has_key? key
    end
    
    def to_s
      hash = loadConfig
      hash.to_s
    end
    
    private
    
    def storeConfig(hash)
      File.open(CONFIG_FILE, "w+") do |f|
        f.write(JSON.pretty_generate(hash))
      end
    end
    
    def loadConfig   
      begin
        return JSON.parse IO.read CONFIG_FILE
      rescue
        # File doesn't exist... do nothing
        Hash.new
      end
    end
    
    def removeConfigFile
      File.delete(CONFIG_FILE) if File.exist?(CONFIG_FILE)
    end
    
  end
  
  def Nutella.config
    ConfigHash.instance
  end
  
end
