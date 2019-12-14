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
        let(:opts) { { 'current_directory': 'whatever' } }
        it 'errors out' do
          expect(@start.run(opts)).to eq(failure('The current directory is not a nutella application', 'error'))
        end
      end

      context 'error parsing run_id' do
        before { allow(Nutella::NutellaApp).to receive(:exist?).and_return(true) }
        let(:opts) { { 'args' => ['default'] } }
        subject { @start.run(opts) }
        it { is_expected.to eq(failure('Unfortunately you can\'t use `default` as a run_id because it is reserved :(', 'error')) }
      end

      context 'app bots already running' do
        before do
          allow(Nutella::NutellaApp).to receive(:exist?).and_return(true)
          allow_any_instance_of(Nutella::NutellaApp).to receive(:components_in_dir).and_return([])
          allow(@start).to receive(:app_bots_running_already?).and_return(true)
        end
        let(:opts) { { 'current_directory': 'whatever' } }
        it 'should return a failure' do
          expect(@start.run(opts).to_s).to include('not created')
        end
      end

      # TODO: last part of start method
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
