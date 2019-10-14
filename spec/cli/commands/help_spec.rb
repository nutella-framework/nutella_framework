require 'spec_helper'
require 'cli/cli'

module Nutella
  describe Help do
    it 'outputs the commands description' do
      expect{ NutellaCLI.execute_command('help') }.to output.to_stdout
    end
  end
end