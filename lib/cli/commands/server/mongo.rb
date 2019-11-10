require 'docker-api'
require 'socket'
require 'config/config'

module Nutella
  class Mongo

    def self.start
      Mongo.new.start_mongo_db
    end

    def self.stop
      Mongo.new.stop_mongo_db
    end
    
    def start_mongo_db
      # Check if mongo has been started already
      return true if mongo_started? || mongo_started_unsupervised?
      # Mongo is not running so we try to start it
      begin
        start_mongo  
      rescue
        return false
      end
      # Wait until mongo is up
      wait_for_mongo
      true
    end

    def stop_mongo_db
      # Find mongo's container
      begin
        c = Docker::Container.get(mongo_container_name)
      rescue Docker::Error::NotFoundError
        # There is no container so mongo
        # is definitely not runnning, we're done
        return true
      end
      # Try to stop mongo
      begin
        c.stop
        c.delete(force: true)
      rescue
        return false
      end
      true
    end
  
    private

    def mongo_container_name
      @mongo_container_name ||= 'mongodb'
    end

    # Checks if mongo is running already
    # @return [boolean] true if there is a container for mongo running already
    def mongo_started?
      begin
        c = Docker::Container.get(mongo_container_name)
        return c.info['State']['Running']
      rescue Docker::Error::NotFoundError
        return false
      end
    end

    # Checks if port 27017 (MongoDB standard port) is free
    # or some other service is already listening on it
    # @return [boolean] true if there is no mongo listening on port 27017, false otherwise
    def mongo_started_unsupervised?
      begin
        s = TCPServer.new('0.0.0.0', 27017)
        s.close
      rescue
        return true
      end
      false
    end

    # Starts mongo using docker
    def start_mongo
      # Remove any other containers with the same name to avoid conflicts
      begin
        old_c = Docker::Container.get(mongo_container_name)
        old_c.delete(force: true)
      rescue Docker::Error::NotFoundError
        # If the container is not there we just proceed
      end
      # Try to create and start the container for mongo
      Docker::Container.create(
        'Image': 'mongo:3.2.21',
        'name': mongo_container_name,
        'Detach': true,
        'HostConfig': {
          'PortBindings': { 
            '27017/tcp': [{ 'HostPort': '27017'}]
          },
          'Binds': ["#{Config.file['home_dir']}mongo:/data/db"],
          'RestartPolicy': {'Name': 'unless-stopped'}
        }
      ).start
    end

    # Checks if there is connectivity to localhost:27017. If not,
    # it waits 1/4 second and then tries again
    def wait_for_mongo
      begin
        s = TCPSocket.open('localhost', 27017)
        s.close
      rescue Errno::ECONNREFUSED
        sleep 0.25
        wait_for_mongo
      end
    end
    
  end
end
