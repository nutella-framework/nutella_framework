module Nutella
  
  class NutellaLoggerRemote < NutellaLogger
    
    def debug(message, code=nil)
      @log.debug(message)
      code
    end
    
    def info(message, code=nil)
      @log.info(message)
      code
    end
    
    def success(message, code=nil)
      @log.info(ANSI.green + message + ANSI.reset)
      code
    end
    
    def warn(message, code=nil)
      @log.warn(ANSI.yellow + message + ANSI.reset)
      code
    end
    
    def error(message, code=nil)
      @log.error(ANSI.red + message + ANSI.reset)
      code
    end
    
  end
end