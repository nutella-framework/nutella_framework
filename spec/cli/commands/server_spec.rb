# frozen_string_literal: true

require 'spec_helper'
require 'nutella_framework'

module Nutella
  describe Server do
    context 'no parameters' do
      it 'prints an error message' do
        expect { NutellaCLI.execute_command('server') }.to output(/need to specify either start or stop/).to_stdout
      end
    end

    context 'start parameter' do
      it 'starts all the things' do
        NutellaCLI.execute_command('server', ['start'])
      end
    end
  end
end
