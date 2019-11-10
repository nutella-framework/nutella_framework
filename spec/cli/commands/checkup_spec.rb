require 'spec_helper'
require 'nutella_framework'

module Nutella
  describe Checkup do
    it 'executes correctly' do
      expect { NutellaCLI.execute_command('checkup') }.not_to raise_error
    end
  end
end