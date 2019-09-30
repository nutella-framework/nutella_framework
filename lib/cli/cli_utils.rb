require 'singleton'
require 'ansi/code'

module Nutella

  class CLIUtils
    include Singleton

    def debug(message)
      puts(ANSI.cyan + message + ANSI.reset)
    end
    
    def info(message)
      puts(message)
    end
    
    def success(message)
      puts(ANSI.green + message + ANSI.reset)
      
    end
    
    def warn(message)
      puts(ANSI.yellow + message + ANSI.reset)
    end
    
    def error(message)
      puts(ANSI.red + message + ANSI.reset)
    end
    
  end
  
end


module Kernel
  
  def console
    Nutella::CLIUtils.instance
  end
  
end
