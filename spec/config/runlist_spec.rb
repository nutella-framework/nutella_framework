# frozen_string_literal: true

require 'spec_helper'

require 'config/runlist'
require 'securerandom'

module Nutella
  describe RunList do
    before(:each) do
      @rl = RunList.new(SecureRandom.uuid)
    end

    after(:each) do
      @rl.remove_file
    end

    describe '#add?' do
      subject { @rl.add?('app_id', 'run_id', 'path_(to_files') }
      context 'when list is empty' do
        it { is_expected.to be true }
      end
      context 'when list is not empty' do
        context 'and run exists' do
          before { @rl.add?('app_id', 'run_id', 'path/to/files') }
          it { is_expected.to be false }
        end
        context 'and run does not exist' do
          before { @rl.add?('app_id', 'different', 'path/to/files') }
          it { is_expected.to be true }
        end
      end
    end

    describe '#all_apps' do
      context 'when list is empty' do
        it { expect(@rl.all_apps).to be_empty }
      end
      context 'when list is not empty' do
        let(:want) { { 'app_id': { runs: ['run_id'], path: 'path/to/files' } } }
        before { @rl.add?('app_id', 'run_id', 'path/to/files') }
        it { expect(@rl.all_apps).to eq(['app_id']) }
      end
    end

    # TODO: finish writing tests for all the other methods... Yes, I am being lazy
  end
end
