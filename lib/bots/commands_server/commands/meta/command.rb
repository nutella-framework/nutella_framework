# frozen_string_literal: true

module CommandsServer
  # Nutella command
  class Command
    class << self
      attr_accessor :description
    end

    # Commands overload this method to execute
    def run(_args = nil)
      console.error 'Running the generic command!!! WAT? https://www.destroyallsoftware.com/talks/wat'
    end

    def success(message)
      { success: true, message: message, message_level: 'success' }
    end

    def failure(message, level, exception = nil)
      if exception.nil?
        { success: false, message: message, message_level: level }
      else
        { success: false, message: message, message_level: level, exception: exception }
      end
    end
  end
end
