require 'helper'
require 'nutella_framework'

class TestNutella < Test::Unit::TestCase
  
  def test_nutella_hello
    assert_equal  "Running nutella",
      NutellaCLI.run
  end
  
end
