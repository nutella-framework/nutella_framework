require 'xmlrpc/client'

module Nutella
  MAC_CONFIG_FILE="/usr/local/etc/supervisord.ini"
  MAC_CONFIG_DIR="/usr/local/etc/supervisor.d"

  # This class wraps supervisor and makes it easier to interact with
  class Supervisor

    def initialize
      @rpc = XMLRPC::Client.new2("http://localhost:9001/RPC2")
    end

    # Adds a process to supervision
    def add(name, command)
      write_config_file(name, command)
      # TODO validate that the reload config RPC actually does a reread operation...
      @rpc.call("supervisor.reloadConfig")
      # TODO Validate what was removed based on returned value?
    end

    # Adds a group of process to supervision
    def add_group(processes)
      processes.each { |name, command| write_config_file(name, command) }
      @rpc.call("supervisor.reloadConfig")
    end

    # Removes a process from supervision
    def remove(name)
      delete_config_file(name)
      @rpc.call("supervisor.reloadConfig")
    end

    # Removes a group of processes from supervision
    def remove_group(processes)
      processes.each { |name| delete_config_file(name) }
      @rpc.call("supervisor.reloadConfig")
    end

    # Starts a process, retuns false if error
    def start(name)
      res = @rpc.call("supervisor.startProcess", name)
      puts res
    end

    # Stops a process, retuns false if error
    def stop(name)
      @rpc.call("supervisor.stopProcess", name)
    end


    private

    def write_config_file(name, command)
      File.open("#{MAC_CONFIG_DIR}/#{name}.ini", 'w') do |f|
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