require 'socket'
require 'util/pid'

module Nutella
  class Mongo
    include PidFile

    def self.start
      Mongo.new.start_mongo_db
    end
    
    # Starts mongodb if it's not started already.
    # This operation is only necessary on mac because Ubuntu automatically
    # installs mongo as a service and runs it.
    # @return [boolean] true if mongo has been correctly started, false otherwise
    def start_mongo_db
      pid_file_path = "#{Config.file['config_dir']}.mongo_pid"
      # Check if the process with pid indicated in the pidfile is alive
      return true if PidFile.sanitize pid_file_path
      # Check that mongo is not running 'unsupervised' (i.e. check port 27017), if it is, return
      return true unless mongo_port_free?
      # Mongo is not running and there is no pid file so we try to start it and create a new pid file.
      # Note that the pid file is created by the `startup` script, not here.
      pid = fork
      exec("mongod --config /usr/local/etc/mongod.conf > /dev/null 2>&1 & \necho $! > #{pid_file_path}") if pid.nil?
      # Wait until mongo is up
      wait_for_mongo
      # All went well so we return true
      true
    end
  
    private

    # Checks if port 27017 (MongoDB standard port) is free
    # or some other service is already listening on it
    # @return [boolean] true if there is no mongo listening on port 27017, false otherwise
    def mongo_port_free?
      begin
        s = TCPServer.new('0.0.0.0', 27017)
        s.close
      rescue
        return false
      end
      true
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
