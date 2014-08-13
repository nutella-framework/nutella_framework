require_relative '../command'

class Checkup < Command
  @description = "Checks that all the dependencies are installed and prepares nutella to run"
  
  def run(args=nil)
    # TODO Whenever we install a dependency we need to write in the config file
    # TODO check all the dependencies before installing anything, git, ruby, npm,
    # TODO and all the associated configurations
    # TODO Execute this command from Travis to verify installation
    
    # Check if we have a broker and install one if not
    nutella.loadConfig
    begin
      nutella.broker!  
    rescue
      installBroker
    end
    
    # Output message
    puts ANSI.green + "All systems go! You are ready to use nutella!" + ANSI.reset
      
    return 0
  end
  
  def installBroker    
    # Clone, cd and npm install
    install_dir = "#{nutella.home_dir}/broker"
    system "git clone git://github.com/mcollina/mosca.git #{install_dir}"
    Dir.chdir(install_dir)
    system "npm install"
    
    # Add startup script
    File.open("startup", 'w') { |file| file.write("#!/bin/sh\n\nBASEDIR=$(dirname $0)\n$BASEDIR/bin/mosca --http-port 1884 &\necho $! > $BASEDIR/bin/.pid\n") }
    File.chmod(0755, "startup")
    
    # Add configuration
    nutella.loadConfig
    nutella.broker = "localhost"
    nutella.storeConfig
  end
  
end
