# Include all commands
Dir[File.dirname(__FILE__)+"/commands/*.rb"].each do |file|
  require "core/commands/#{File.basename(file, File.extname(file))}"
end

module Nutella
      
    # Execute command. Returns nil if all is good, otherwise it exceptions out
    def Nutella.executeCommand (command, args=nil) 
      # Check that the command exists
      if commandExists?(command)
        return Object::const_get("Nutella::#{command.capitalize}").new.run(args)
      else
        raise CommandException.new(:error), "Unknown command #{command}"
      end
    end
    
    # Check that a command exists
    def Nutella.commandExists?(command)
      return Nutella.const_get("Nutella::#{command.capitalize}").is_a?(Class)
    rescue NameError
      return false
    end

end