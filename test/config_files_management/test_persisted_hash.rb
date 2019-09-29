require 'helper'

module Nutella
  
  class TestNutellaConfig < MiniTest::Test

    def setup
      @config = PersistedHash.new( 'runlist.json' )
    end


    should 'set a key value' do
      assert_equal 'value1', @config['key1']='value1'
    end

    should 'return \'nil\' if a key doesn\'t exist' do
      assert_nil @config['fakekey']
    end

    should 'return the value associated with a key whenever that key exists' do
      @config['key2']='value2'
      assert_equal 'value2', @config['key2']
    end

    should 'return true if a key exists' do
      @config['key3']='value3'
      assert @config.has_key?('key3')
    end

    should 'return false if a key doesn\'t exist' do
      refute @config.has_key?('key4')
    end

    should 'access nested hashes' do
      @config['key5']={'k55' => 'v55'}
      assert_equal 'v55', @config['key5']['k55']
    end


    def teardown
      @config.send(:remove_file)
    end
  
  end

end


