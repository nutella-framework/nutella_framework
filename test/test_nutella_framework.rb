require 'helper'

module Nutella
  class TestNutellaFramework < MiniTest::Test
        
    should "find help command" do
      assert NutellaCLI.commandExists? "help" 
    end
    
    should "read the broker parameter correctly" do
      Nutella.store_constants
      # Now we have the printing problem... "Currently using broker: localhost"
      assert_equal 0, NutellaCLI.executeCommand("broker")
    end
  end
end
  

