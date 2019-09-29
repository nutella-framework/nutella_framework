require 'helper'

module Nutella
  
  class TestRunList < MiniTest::Test

    def setup
      @runlist = RunListHash.new( 'runlist.json' )
    end

    should 'return true if the list is empty' do
      assert @runlist.empty?
    end

    should 'return false if the list is not empty' do
      assert @runlist.add?('app_id_a', 'run_id_1', '/just/a/random/path')
      refute @runlist.empty?
    end

    should 'return empty array if the list is empty' do
      assert_empty @runlist.all_runs
    end

    should 'return an array of runs in the list if not empty' do
      refute_nil @runlist.add?( 'app_a', 'run1', '/path/to/my/run1' )
      refute_nil @runlist.add?( 'app_a', 'run2', '/path/to/my/run2' )
      assert_equal %w{run1 run2}, @runlist.runs_for_app('app_a')
    end

    should 'return false if trying to add the same element twice' do
      assert @runlist.add?( 'app_a', 'run1', '/path/to/my/run1' )
      refute @runlist.add?( 'app_a', 'run1', '/path/to/my/run1' )
    end

    should 'return properly when deleting an item' do
      assert @runlist.add?('app_a', 'run1', '/path/to/my/run1' )
      assert @runlist.delete?('app_a', 'run1')
      refute @runlist.delete?('app_a', 'run1')
    end

    def teardown
      @runlist.remove_file
    end

  end
end