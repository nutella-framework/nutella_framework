class CommandException < RuntimeError 
  attr_reader :log_level
  
  def initialize(log_level=nil)
      @log_level = log_level
  end
  
end
