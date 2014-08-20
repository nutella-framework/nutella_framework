require 'helper'

class TestNutellaFramework < MiniTest::Test
  should "find help command" do
    # assert(Nutella::NutellaCLI.commandExists?("help"))
    ARGV << "help"
    Nutella::NutellaCLI.run
  end
end
  

