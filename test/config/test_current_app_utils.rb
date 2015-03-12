require 'helper'

module Nutella
  
  class TestCurrentAppUtils < MiniTest::Test

    # def setup
    #   Dir.chdir NUTELLA_HOME
    #   Nutella.execute_command( 'new', ['test_app'] )
    #   Dir.chdir "#{NUTELLA_HOME}test_app"
    # end
    #
    #
    # should 'return true if the dir is a nutella app' do
    #   assert Nutella.current_app.exist?
    # end
    #
    # should 'return false if the dir is not a nutella app' do
    #   Dir.chdir NUTELLA_HOME
    #   refute Nutella.current_app.exist?
    # end
    #
    # should 'return the correct version of nutella as read from the app configuration file' do
    #   assert_equal File.open("#{NUTELLA_HOME}VERSION", "rb").read, Nutella.current_app.config['nutella_version']
    # end
    #
    #
    # def teardown
    #   FileUtils.rm_rf "#{NUTELLA_HOME}test_app"
    #   Dir.chdir NUTELLA_HOME
    # end

  end
end