require 'singleton'
require 'logging/nutella_logger'
require 'logging/nutella_logger-remote'

module Nutella

  class NutellaLogging
    include Singleton
    
    def initialize
      console = NutellaLogger.new("console")
      log = NutellaLoggerRemote.new("log")
      @loggers = {"log" => log, "console" => console}
    end
    
    def logger(name)
      @loggers[name]
    end 
    
  end
  
end


module Kernel
  
  def console
    Nutella::NutellaLogging.instance.logger('console')
  end
  
  def log
    Nutella::NutellaLogging.instance.logger('log')
  end
  
end
