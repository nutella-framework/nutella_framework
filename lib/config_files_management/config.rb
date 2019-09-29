require 'config/persisted_hash'

module Nutella
  class Config
    # Calling this method returns a PersistedHash instance
    # "linked" to the config.json file in the nutella home directory
    def self.file
      PersistedHash.new( "#{ENV['HOME']}/.nutella/config.json" )
    end

    # This method initializes the nutella configuration file (config.json) with:
    # - config_dir: directory where the configuration files are stored in
    # - broker_dir: directory where the local broker is installed in
    # - main_interface_port: the port used to serve interfaces
    def self.init
      file['config_dir'] = "#{ENV['HOME']}/.nutella/"
      file['broker_dir'] = "#{file['config_dir']}broker/"
      file['main_interface_port'] = 57880
    end
  end
end
