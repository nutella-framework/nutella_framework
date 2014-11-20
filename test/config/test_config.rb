require 'helper'

module Nutella
  
  class TestNutellaConfig < MiniTest::Test
    
    def setup
      Nutella.config.send(:remove_file)
    end
  
    should 'set a key value' do
      assert_equal 'value1', Nutella.config['key1']='value1'
    end
  
    should 'return \'nil\' if a key doesn\'t exist' do
      assert_nil Nutella.config['fakekey']
    end

    should 'return the value associated with a key whenever that key exists' do
      Nutella.config['key2']='value2'
      assert_equal 'value2', Nutella.config['key2']
    end

    should 'retun true if a key exists' do
      Nutella.config['key3']='value3'
      assert Nutella.config.has_key?('key3')
    end

    should 'retun false if a key doens\'t exist' do
      refute Nutella.config.has_key?('key4')
    end
  
    should 'access nested hashes' do
      Nutella.config['key5']={'k55' => 'v55'}
      assert_equal 'v55', Nutella.config['key5']['k55']
    end
  
    def teardown
      Nutella.config.send(:remove_file)
    end
  
  end
  
  
end


