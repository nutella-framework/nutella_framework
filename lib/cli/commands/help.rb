require_relative 'meta/command'

module Nutella
    
  class Help < Command
    @description = 'Displays what every command does'
  
    def run(args=nil)
      message=''
      Dir["#{File.dirname(__FILE__)}/*.rb"].sort.each do |file|
        message += add_cmd_help(file)
      end
      console.info message
      console.info 'For more details on individual commands, see http://nutella-framework.github.io'
    end

    private

    def add_cmd_help(file)
      command = File.basename(file, File.extname(file))
      if command.length > 7
        message = "#{command}\t"
      else
        message = "#{command}\t\t"
      end
      message += Object::const_get("Nutella::#{command.capitalize}").description
      message += "\n"
      message
    end

  end
  
end


