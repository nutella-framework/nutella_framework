require 'spec_helper'
require 'config_files_management/config'
require 'securerandom'

module Nutella
  describe Config do

    before(:each) do
      @ph = PersistedHash.new(SecureRandom.uuid)
      allow(Config).to receive(:file).and_return(@ph)
    end

    after(:each) do
      @ph.remove_file
    end


    describe '.init' do    
      context "invoked once" do
        it "initializes config correctly" do
          Config.init
          expect(@ph.length).to eq(3)
        end
      end
  
      context "invoked twice" do
        it "initializes config file correctly" do
          Config.init
          Config.init
          expect(@ph.length).to eq(3)
        end
      end
    end


    describe ".file" do
      context "invoked after init" do
        it "returns a valid persisted hash with configuration" do
          Config.init
          @ph = Config.file
          expect(@ph.length).to eq(3)
        end
      end

      context "invoked before init" do
        it "returns an empty hash" do
          @ph = Config.file
          expect(@ph.empty?).to be(true)
        end
      end
    end

  end
end