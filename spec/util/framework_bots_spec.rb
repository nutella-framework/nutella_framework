# frozen_string_literal: true

require 'spec_helper'
require 'nutella_framework'
require 'util/framework_bots'

module Nutella
  describe FrameworkBots do
    describe '.list' do
      subject { FrameworkBots.list }
      it { is_expected.to include('commands_server') }
    end

    describe '.running' do
      before do
        allow_any_instance_of(FrameworkBots).to receive(:framework_bots) { %w[bot1 bot2] }
        allow_any_instance_of(DockerClient).to receive(:container_running?).and_return(true, false)
      end
      subject { FrameworkBots.running }
      it { is_expected.to eq(['bot1']) }
    end
  end
end
