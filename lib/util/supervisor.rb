require 'xmlrpc/client'
require 'singleton'

module Nutella
  MAC_CONFIG_FILE="/usr/local/etc/supervisord.ini"
  MAC_CONFIG_DIR="/usr/local/etc/supervisor.d"

  # This class wraps supervisor and makes it easier to interact with
  # Important note. The `reloadConfig` RPC is actually a `reread` which
  # does NOT stop the supervisor
  class Supervisor
    include Singleton

    def initialize
      # TODO need to wrap all @rpc calls in exceptions!!!!
      @rpc = XMLRPC::Client.new2("http://localhost:9001/RPC2")
    end

    # Adds a process to supervision
    def add(name, command)
      write_config_file(name, command)
      begin
        @rpc.call("supervisor.addProcessGroup", name)  
      rescue => exception
        # Yup, we're swallowing this one because it returns true if it adds it and
        # exceptions out if it can't... ^___^
      end
    end

    # Adds a group of process to supervision
    def add_group(processes)
      processes.each { |name, command| write_config_file(name, command) }
      @rpc.call("supervisor.reloadConfig")
      processes.each { |name, _| @rpc.call("supervisor.addProcessGroup", name) }
    end

    # Removes a process from supervision
    def remove(name)
      @rpc.call("supervisor.removeProcessGroup", name)
      delete_config_file(name)
      @rpc.call("supervisor.reloadConfig")
    end

    # Removes a group of processes from supervision
    def remove_group(processes)
      @rpc.call("supervisor.removeProcessGroup", name)
      processes.each do |name| 
        delete_config_file(name)
      end
      @rpc.call("supervisor.reloadConfig")
    end

    # Starts a process, retuns false if error
    def start(name)
      @rpc.call("supervisor.startProcess", name)
    end

    # Stops a process, retuns false if error
    def stop(name)
      @rpc.call("supervisor.stopProcess", name)
    end

    # Gets all the info about a process
    def getInfo(name)
      @rpc.call("supervisor.getProcessInfo", name)
    end


    private

    def write_config_file(name, command)
      file = "#{MAC_CONFIG_DIR}/#{name}.ini"
      File.open(file, 'w') do |f|
        f.puts "[program:#{name}]"
        f.puts "command=#{command}"
        f.puts "stdout_logfile=#{command[0..-8]+'stdout.log'}"
        f.puts "autostart=false"
        f.puts "redirect_stderr=true"
      end
    end

    def delete_config_file(name)
      File.delete("#{MAC_CONFIG_DIR}/#{name}.ini")
    end
    
  end
end