# frozen_string_literal: true

require_relative 'meta/run_command'

module CommandsServer
  class Dependencies < RunCommand
    @description = 'Installs the dependencies for all components in the application'

    def run(_args = nil)
      compile_and_dependencies 'dependencies', 'Installing dependencies for', 'dependencies installed'
    end
  end
end
