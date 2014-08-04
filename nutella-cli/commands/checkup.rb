require_relative '../command'

class Checkup < Command
  @description = "Checks that all the dependencies are installed and prepares nutella to run"
  
  def run(args=nil)
    # TODO Whenever we install a dependency we need to write in the config file
    # TODO check all the dependencies before installing anything, git, ruby, npm,
    # TODO and all the associated configurations
    # TODO Execute this command from Travis to verify installation
    
    # Check if we have a broker and installs one if not
    if !nutella.dependencies.broker.has_key?(:exist)
      installBroker
    end
    
    # TODO Copy mqtt.js library where it belongs  
    return 0
  end
  
  def installBroker    
    # Clone, cd and npm install
    install_dir = "#{nutella.home_dir}/deps/broker"
    system "git clone git://github.com/mcollina/mosca.git #{install_dir}"
    Dir.chdir(install_dir)
    system "npm install"
    
    # Add startup script
    File.open("startup", 'w') { |file| file.write("#!/bin/sh\n\nBASEDIR=$(dirname $0)\n$BASEDIR/bin/mosca --http-port 1884 -v\n") }
    File.chmod(0755, "startup")
  end
  
end
