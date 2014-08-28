require 'core/command'

module Nutella
  class Debug < Command
    @description = "Starts all or some of the bots in the current project in debug mode"

    def run(args=nil)
      # This is the blocking version of start, for coding purposes
      return 0
    end
  end
end
