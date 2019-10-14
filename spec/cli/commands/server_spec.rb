require 'spec_helper'
require 'cli/cli'

module Nutella
  describe Server do
    skip 'Starts the MQTT broker' do
      NutellaCLI.execute_command('server')
      # TODO resume from here... need to implement
      # framework components start using immortal...
    end
  end
end