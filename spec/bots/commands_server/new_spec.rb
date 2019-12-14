# frozen_string_literal: true

require 'spec_helper'
require 'bots/commands_server/commands/new'
require 'fileutils'

module CommandsServer
  describe New do
    let(:app_name) { 'specs_test_app' }

    describe '#run' do
      before(:each) { @new = New.new }

      after(:each) { FileUtils.rm_rf(app_name) }

      context 'with empty args' do
        let(:opts) { {} }
        subject { @new.run(opts) }
        it { is_expected.to eq(Command.new.failure('You need to specify a name for your new application')) }
      end

      context 'with the right opts and args' do
        let(:opts) { { 'current_dir' => Dir.pwd, 'args' => [app_name] } }
        subject { @new.run(opts) }

        it { is_expected.to eq(Command.new.success("Your new nutella application #{app_name} is ready!")) }

        it 'creates the app skeleton' do
          @new.run(opts)
          expect(File.file?("#{opts['current_dir']}/#{app_name}/nutella.json")).to be true
        end
      end
    end
  end
end
