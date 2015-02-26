require 'config/persisted_hash'

module Nutella

  # Calling this method (Nutella.config) simply returns and instance of
  # PersistedHash linked to file config.json in nutella home directory
  def Nutella.config
    PersistedHash.new( "#{ENV['HOME']}/.nutella/config.json" )
  end
  
end
