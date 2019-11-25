# frozen_string_literal: true

require_relative 'meta/run_command'

module CommandsServer
  class Compile < RunCommand
    @description = 'Compiles all the components that need compilation in the application'

    def run(_args = nil)
      compile_and_dependencies 'compile', 'Compiling', 'components compiled'
    end
  end
end
