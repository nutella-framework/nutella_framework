module Nutella

  # Nutella command
  class Command 

    class << self;
      attr_accessor :description
    end
  
    # Commands overload this method to execute
    def run( args=nil )
      console.error 'Running the generic command!!! WAT? https://www.destroyallsoftware.com/talks/wat'
    end

    def success(message)
      { success: true, message: message }
    end

    def failure(message, exception=nil)
      if exception.nil?
        { success: false, message: message }
      else
        { success: false, message: message, exception: exception }
      end
    end

  end

end
