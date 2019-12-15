# frozen_string_literal: true

require 'spec_helper'
require 'nutella_framework'

module Nutella
  describe Version do
    describe '.get' do
      subject { Version.get }
      it { is_expected.to be_a(String) }
    end
  end
end
