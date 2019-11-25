# frozen_string_literal: true

require 'spec_helper'
require 'bots/commands_server/commands/start'

module CommandsServer
  describe Start do
    before(:each) do
      @start = Start.new
    end

    # after(:each) do
    #   @rl.remove_file
    # end

    describe '#run' do
      context 'outside nutella app' do
        let(:input) { { 'current_directory': 'whatever' } }
        it 'errors out' do
          expect(@start.run(:input)).to eq(failure('The current directory is not a nutella application', 'error'))
        end
      end
    end

    def failure(message, level, _exception = nil)
      c = Command.new
      c.failure(message, level, exception = nil)
    end

    def success(message)
      c = Command.new
      c.success(message)
    end
  end
end
