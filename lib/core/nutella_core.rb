# Require all commands by iterating through all the files
# in the commands directory
Dir["#{File.dirname(__FILE__)}/commands/*.rb"].each do |file|
  require "core/commands/#{File.basename(file, File.extname(file))}"
end

module Nutella
      
    # This method executes a particular command
    # @param command [String] the name of the command
    # @param args [Array<String>] command line parameters passed to the command
    def Nutella.execute_command (command, args=nil)
      # Check that the command exists and if it does,
      # execute its run method passing the args parameters
      if command_exists?(command)
        Object::const_get("Nutella::#{command.capitalize}").new.run(args)
      else
        console.error "Unknown command #{command}"
      end
    end
    
    # This method checks that a particular command exists
    # @return [Boolean] true if the command exists, false otherwise
    def Nutella.command_exists?(command)
      return Nutella.const_get("Nutella::#{command.capitalize}").is_a?(Class)
    rescue NameError
      return false
    end
    
    # This method initializes the nutella configuration file (config.json) with:
    # - NUTELLA_HOME: the directory nutella is installed in
    # - tmp_dir: temporary directory used when installing remote templates
    # - broker_dir: directory where the local broker is installed in
    # - main_interface_port: the port used to serve interfaces
    def Nutella.init
      Nutella.config['nutella_home'] = NUTELLA_HOME
      Nutella.config['tmp_dir'] = "#{NUTELLA_HOME}.tmp/"
      Nutella.config['broker_dir'] = "#{NUTELLA_HOME}broker/"
      Nutella.config['main_interface_port'] = 57880
    end

end