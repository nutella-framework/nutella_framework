require 'helper'

module Nutella
  
  class TestNutellaConfig < MiniTest::Test
  
    should "set a key value" do
      assert_equal "value1", Nutella.config["key1"]="value1"
    end
  
    should "return 'nil' if a key doesn't exist" do   
      assert_nil Nutella.config["fakekey"]
    end

    should "return the value associated with a key whenever that key exists" do
      Nutella.config["key2"]="value2"
      assert_equal "value2", Nutella.config["key2"]
    end

    should "retun true if a key exists" do
      Nutella.config["key3"]="value3"
      assert Nutella.config.has_key?("key3")
    end

    should "retun false if a key doens't exist" do
      refute Nutella.config.has_key?("key4")
    end
  
    should "access nested hashes" do
      Nutella.config["key5"]={"k55" => "v55"}
      assert_equal "v55", Nutella.config["key5"]["k55"]
    end
  
    should "read and write correctly from/to file" do
      Nutella.config.clear
      Nutella.config["k_write1"]="v_write1"
      Nutella.config["k_write2"]=5
      Nutella.config["k_write5"]={"k_nest1" =>"v_nest1", "k_nest2" =>"v_nest2", "k_nest3" => {"k_nest4" =>"v_nest4"}}
      Nutella.config["k_write6"]=["arr_1",5, false]
      pre = Nutella.config.to_s
      Nutella.config.send(:storeConfigToFile)
      Nutella.config.send(:loadConfigFromFile)
      assert_equal pre, Nutella.config.to_s
    end
  
    def teardown
      Nutella.config.send(:removeConfigFile)
    end
  
  end
  
  
end


