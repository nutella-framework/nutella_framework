# CLI command

module Nutella  
  class Command 
    class << self; attr_accessor :description end
  
    # Commands overload this method to execute
    def run (args=nil)
      console.error('Running the generic command!!! WAT?')
    end
  end
end
