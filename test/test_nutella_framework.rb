require 'helper'

module Nutella
  class TestNutellaFramework < MiniTest::Test
    
    should "run command help correctly" do
      # Nutella.store_constants
      puts "OUT"
      p Nutella.executeCommand "help"
    end
    
    
    # should "read the broker parameter correctly" do
#       Nutella.store_constants
#       $stdout = StringIO.new
#       NutellaCLI.executeCommand("broker")
#       assert_equal "Currently using broker: localhost\n", $stdout.string
#     end
  end
end
  

