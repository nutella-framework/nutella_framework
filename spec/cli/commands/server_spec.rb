require 'spec_helper'
require 'nutella_framework'

module Nutella
  describe Server do
    skip 'Starts the MQTT broker' do
      NutellaCLI.execute_command('server')
    end
  end
end