require 'spec_helper'
require 'cli/cli'

module Nutella
  describe Checkup do
    skip 'executes correctly' do
      NutellaCLI.execute_command('checkup')
    end
  end
end