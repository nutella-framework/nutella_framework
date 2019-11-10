require 'spec_helper'
require 'nutella_framework'

module Nutella
  describe Checkup do
    # Skipping because this command relies heavily on shelling out
    it 'executes correctly' do
      NutellaCLI.execute_command('checkup')
    end
  end
end