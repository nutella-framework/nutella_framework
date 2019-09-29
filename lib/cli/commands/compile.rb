require 'commands/meta/run_command'
require 'tmux/tmux'

module Nutella
  class Compile < RunCommand
    @description = 'Compiles all the components that need compilation in the application'
    
    def run(args=nil)
      compile_and_dependencies 'compile', 'Compiling', 'components compiled'
    end
    
  end
end