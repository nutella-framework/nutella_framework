require 'spec_helper'

require 'config/persisted_hash'
require 'securerandom'

module Nutella
  describe PersistedHash do
    before(:each) do
      @ph = PersistedHash.new(SecureRandom.uuid)
    end

    describe '#[]' do
      context 'uninialized' do
        it { expect(@ph['any_key']).to be_nil }
      end
      
      context 'initialized' do
        before(:example) do
          allow(@ph).to receive(:load_hash).and_return({test_key: 'test_value'})
        end
        it {expect(@ph[:test_key]).to eq('test_value')}
      end
    end

    describe '#[]=' do
      context 'key is a string' do
        it 'sets the value' do
          @ph['key1']='value1'
          expect(@ph['key1']).to eq('value1')
        end
      end
      # uncomment when https://github.com/nutella-framework/nutella_framework/issues/101 is fixed
      # context 'key is not a string' do
      #   it {expect {@ph[:key1]='value1'}.to raise_error(KeyError)}
      # end
    end

    describe '#delete' do
      let (:key) {'a key'}
      let (:value) {'a value'}
      it 'deletes the key and returns the value' do
        @ph[key]=value
        v = @ph.delete(key)
        expect(v).to eq(value)
        expect(@ph['key']).to be_nil
      end
    end

    describe '#empty?' do
      context 'is empty' do
        it {expect(@ph.empty?).to be true}
      end
      context 'is not empty' do
        it 'returns false' do
          @ph['key']='value'
          expect(@ph.empty?).to be false
        end
      end
    end

    # Same as #has_key?
    describe "#include?" do
      let (:key) {'a key'}
      context 'has the key' do
        it {expect(@ph.include?(key)).to be false}
      end
      context 'doesn\'t have the key' do
        it 'returns true' do
          @ph[key]='value'
          expect(@ph.include?(key)).to be true
        end
      end
    end

    after(:each) do
      @ph.remove_file
    end
  end
end