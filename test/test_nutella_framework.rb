require 'helper'

module Nutella
  class TestNutellaFramework < MiniTest::Test
    
    should "set constants correctly" do
      require 'nutella_framework'
      assert '{"nutella_home"=>"/Users/tebemis/Code/nutella_framework/lib/../", "broker"=>"localhost", "tmp_dir"=>"/Users/tebemis/Code/nutella/.tmp"}', 
        Nutella.config
    end
    
    should "find help command" do
      assert(NutellaCLI.commandExists?("help"))
      #ARGV << "help"
      #NutellaCLI.run
    end
  end
end
  

