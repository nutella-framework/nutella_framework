require 'cli/command'

module Nutella
  
  class Help < Command
    @description = "Displays what every command does and how to use it"
  
    def run(args=nil)
      NutellaCLI.printPrompt
      Dir[File.dirname(__FILE__)+"/*.rb"].each do |file|
        print "#{File.basename(file, File.extname(file))}\t\t"
        puts Object::const_get("Nutella::#{File.basename(file, File.extname(file)).capitalize}").description
      end
      return 0
    end
    
  end
  
end


