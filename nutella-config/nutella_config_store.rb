require 'json'

class NutellaConfigStore < Configatron::RootStore 

  def loadConfig
    configure_from_hash(::JSON.parse( ::IO.read("#{::NUTELLA_HOME}/config.json")))
  end

  def storeConfig
    ::File.open("#{::NUTELLA_HOME}/config.json", "w") do |f|
      f.write(::JSON.pretty_generate(to_h))
    end
  end
  
end