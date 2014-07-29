# This handles the configuration files of Nutella, it uses configatron but customizes it
require 'configatron/version'

require 'configatron/deep_clone'
require 'configatron/errors'
require 'configatron/integrations'
require 'configatron/root_store'
require 'configatron/store'
require_relative 'nutella_config_store'

# Proc *must* load before dynamic/delayed, or else Configatron::Proc
# will refer to the global ::Proc
require 'configatron/proc'
require 'configatron/delayed'
require 'configatron/dynamic'

class Configatron
end

module Kernel
  def nutella
    NutellaConfigStore.instance
  end
end
