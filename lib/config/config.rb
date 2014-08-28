# This handles the configuration files of Nutella
# It's basically a hash overload that stores into a file
require 'json'

module Nutella
  
  class ConfigHash
    
    def initialize(file)
      @config_file=file
    end
    
    
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
      File.open(@config_file, "w+") do |f|
        f.write(JSON.pretty_generate(hash))
      end
    end
    
    def loadConfig   
      begin
        return JSON.parse IO.read @config_file
      rescue
        # File doesn't exist... do nothing
        Hash.new
      end
    end
    
    def removeConfigFile
      File.delete(@config_file) if File.exist?(@config_file)
    end
    
  end
  
  def Nutella.config
    ConfigHash.new(File.dirname(__FILE__)+"/../../config.json")
  end
  
end
