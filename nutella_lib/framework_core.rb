require 'nutella_lib'
require 'config/runlist'

# APIs sub-modules
require_relative 'framework_net'
require_relative 'framework_log'
require_relative 'framework_persist'


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
      Nutella.mongo_host = broker_hostname
      Nutella.mqtt = SimpleMQTTClient.new broker_hostname
    end

    # Accessors for sub-modules
    def self.net; Nutella::Framework::Net; end
    def self.log; Nutella::Framework::Log; end
    def self.persist; Nutella::Framework::Persist; end


    # Utility functions

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
