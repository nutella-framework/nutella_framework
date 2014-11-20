require 'helper'

module Nutella
  
  class TestRunList < MiniTest::Test
    
    def setup
      Nutella.runlist.send(:remove_file)
    end
    
    should 'return true if the list is empty' do
      assert Nutella.runlist.empty?
    end

    should 'return false if the list is not empty' do
      refute_nil Nutella.runlist.add?( 'run1', '/path/to/my/run1')
      refute Nutella.runlist.empty?
    end

    should 'return empty array if the list is empty' do
      assert_empty Nutella.runlist.runs_by_project
    end

    should 'return an array of runs in the list if not empty' do
      refute_nil Nutella.runlist.add?( 'run1', '/path/to/my/run1' )
      refute_nil Nutella.runlist.add?( 'run2', '/path/to/my/run2' )
      assert_equal %w{run1 run2}, Nutella.runlist.runs_by_project
    end

    should 'return false if trying to add the same element twice' do
      assert Nutella.runlist.add?( 'run1', '/path/to/my/run1' )
      refute Nutella.runlist.add?( 'run1', '/path/to/my/run1' )
    end

    should 'return properly when deleting an item' do
      assert Nutella.runlist.add?( 'run1', '/path/to/my/run1' )
      assert Nutella.runlist.delete? 'run1'
      refute Nutella.runlist.delete? 'run1'
    end

    should 'properly indicate if an item is in the list' do
      refute Nutella.runlist.include? 'run1'
      assert Nutella.runlist.add?( 'run1', '/path/to/my/run1' )
      assert Nutella.runlist.include? 'run1'
      assert Nutella.runlist.delete? 'run1'
      refute Nutella.runlist.include? 'run1'
    end
    
    def teardown
      Nutella.runlist.send(:remove_file)
    end
    
  end
end