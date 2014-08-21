require 'helper'

module Nutella
  
  class TestRunList < MiniTest::Test
    
    def setup
      Nutella.runlist.send(:removeRunListFile)
    end
    
    should "return true if the list is empty" do
      assert Nutella.runlist.empty?
    end

    should "return false if the list is not empty" do
      refute_nil Nutella.runlist.add? "run1"
      refute Nutella.runlist.empty?
    end

    should "return empty array if the list is empty" do
      assert_empty Nutella.runlist.to_a
    end

    should "return an array of runs in the list if not empty" do
      refute_nil Nutella.runlist.add? "run1"
      refute_nil Nutella.runlist.add? "run2"
      assert_equal ["run1", "run2"], Nutella.runlist.to_a
    end
    
    should "return nil if trying to add the same element twice" do
      refute_nil Nutella.runlist.add? "run1"
      assert_nil Nutella.runlist.add? "run1"
    end
    
    should "return properly when deleting an item" do
      refute_nil Nutella.runlist.add? "run1"
      refute_nil Nutella.runlist.delete? "run1"
      assert_nil Nutella.runlist.delete? "run1"
    end
    
    def teardown
      Nutella.runlist.send(:removeRunListFile)
    end
    
  end
end