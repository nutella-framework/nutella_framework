require 'helper'

module Nutella
  class TestNutellaFramework < MiniTest::Test
    
    def setup
      Nutella.init
    end
    
    # The test works but it takes to long to run it all the time
    # should "install remote interface template correctly" do
#       Dir.chdir NUTELLA_HOME
#       prj_dir = "#{Dir.pwd}/test_prj"
#       # create new project and cs into it
#       Nutella.executeCommand "new", ["test_prj"]
#       Dir.chdir prj_dir
#       Nutella.executeCommand "install", ["basic-web-interface"]
#       # Cleanup
#       Dir.chdir NUTELLA_HOME
#       FileUtils.rm_rf prj_dir
#     end    
    
    
    def teardown
      Nutella.config.send(:removeConfigFile)
    end
    
  end
end
  

