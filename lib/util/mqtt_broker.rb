require 'socket'
require 'util/config'

module Nutella
  class MQTTBroker

    def self.start
      MQTTBroker.new.start_internal_broker
    end
    
    def start_internal_broker
      # Check if the broker has been started already, if it is, return
      return true if broker_started?
      # Check that broker is not running 'unsupervised' (i.e. check port 1883), if it is, return
      return true unless broker_port_free?
      # Broker is not running so we try to start it broker
      # TODO need to check that this is actually successfull...
      `docker run -p 1883:1883 -p 1884:80 -d -v #{Config.file['home_dir']}broker/:/db matteocollina/mosca:v2.3.0`
      # Wait until the broker is up
      wait_for_broker
      # All went well so we return true
      true
    end
  
    private

    # Checks if the broker is running already
    # @return [boolean] true if there is a container for the broker running already
    def broker_started?
      `docker ps --filter ancestor=matteocollina/mosca:v2.3.0 --format "{{.ID}}"` != ""
    end

    # Checks if port 1883 (MQTT broker port) is free
    # or some other service is already listening on it
    # @return [boolean] true if there is no broker listening on port 1883, false otherwise
    def broker_port_free?
      begin
        s = TCPServer.new('0.0.0.0', 1883)
        s.close
      rescue
        return false
      end
      true
    end

    # Checks if there is connectivity to localhost:1883. If not,
    # it waits 1/4 second and then tries again
    def wait_for_broker
      begin
        s = TCPSocket.open('localhost', 1883)
        s.close
      rescue Errno::ECONNREFUSED
        sleep 0.25
        wait_for_broker
      end
    end

  end
end
