# frozen_string_literal: true

require 'spec_helper'
require 'nutella_framework'
require 'util/framework_bots'
module Nutella
  describe FrameworkBots do
    describe '.list' do
      it 'returns the list of framework level bots' do
        puts FrameworkBots.list
      end
    end
    describe '.running' do
      it 'returns the list of running framework level bots' do
        puts FrameworkBots.running
      end
    end
  end
end
