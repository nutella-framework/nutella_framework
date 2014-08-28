require 'helper'

module Nutella
  class TestNutellaLogger < MiniTest::Test
    
    should "log to console and other appenders with color and error code" do
      assert_equal(453, console.error("This is the message that needs to be logged", 453))
    end
    
    # shuold "log to appenders and not console" do
#       log.error("This is an error message that needs to be logged", 354)
#     end
    
  end
end  

