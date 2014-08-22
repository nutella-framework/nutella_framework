require 'core/command'

module Nutella
  
  class HelpOutException < CommandException
  end
  
  class Help < Command
    @description = "Displays what every command does and how to use it"
  
    def run(args=nil)
      message=""
      Dir[File.dirname(__FILE__)+"/*.rb"].each do |file|
        message += "#{File.basename(file, File.extname(file))}\t\t"
        message += Object::const_get("Nutella::#{File.basename(file, File.extname(file)).capitalize}").description
        message += "\n"
      end
      raise HelpOutException.new(:info), message
    end
    
  end
  
end


