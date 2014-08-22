# CLI command

module Nutella
  
  class CommandException < RuntimeError 
    attr_reader :log_level 
    def initialize(log_level)
      @log_level = log_level
    end
  end
  
  
  class Command 
    class << self; attr_accessor :description end
  
    # Commands overload this method to execute
    def run (args=nil)
      puts "Running a generic command! POOP!"
    end
  end
  
end
