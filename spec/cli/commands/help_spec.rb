require 'spec_helper'
require 'cli/cli'

module Nutella
  describe Help do
    it 'outpurs the comends description' do
      expect{ NutellaCLI.execute_command('help') }.to output.to_stdout
    end
  end
end