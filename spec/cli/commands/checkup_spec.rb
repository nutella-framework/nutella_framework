require 'spec_helper'
require 'cli/cli'

module Nutella
  describe Checkup do
    # Skipping because this command relies heavily on shelling out
    skip 'executes correctly' do
      NutellaCLI.execute_command('checkup')
    end
  end
end