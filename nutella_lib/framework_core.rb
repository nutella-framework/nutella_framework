require 'nutella_lib'
require 'config/runlist'

# APIs sub-modules
require_relative 'framework_net'


module Nutella

  # Accessor to the framework APIs sub-module
  def Nutella.f
    Nutella::Framework
  end



  #  Framework-level APIs sub-module
  module Framework

    # Initializes this component as a framework component
    # @param [String] broker_hostname
    # @param [String] component_id
    def self.init( broker_hostname, component_id )
      Nutella.app_id = nil
      Nutella.run_id = nil
      Nutella.component_id = component_id
      Nutella.resource_id = nil
      Nutella.mqtt = SimpleMQTTClient.new broker_hostname
    end

    # Accessors for sub-modules
    def self.net; Nutella::Framework::Net; end
    def self.log; Nutella::Framework::Log; end


    # Utility functions


    # Parse command line arguments for framework level components
    #
    # @param [Array] args command line arguments array
    # @return [String] broker
    def self.parse_args(args)
      if args.length < 1
        STDERR.puts 'Couldn\'t read broker address from the command line, impossible to initialize component!'
        return
      end
      return args[0]
    end

    # Extracts the component name from the folder where the code for this component is located
    #
    # @return [String] the component name
    def self.extract_component_id
      Nutella.extract_component_id
    end

    # Sets the resource id
    #
    # @param [String] resource_id the resource id (i.e. the particular instance of this component)
    def self.set_resource_id( resource_id )
      Nutella.set_resource_id resource_id
    end


  end

end
