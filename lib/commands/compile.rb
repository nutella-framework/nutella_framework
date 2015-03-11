require 'commands/meta/run_command'
require 'tmux/tmux'

module Nutella
  class Compile < RunCommand
    @description = 'Compiles all the actors that need compilation in the project'
    
    def run(args=nil)

      # If the current directory is not a nutella project, return
      return unless Nutella.current_project.exist?
      
      # Compile all actors
      return unless prepare_bot( Nutella.current_project.dir, 'compile', 'Compiling' )
      
      # Output success message
      console.success "All actors compiled for #{Nutella.current_project.config['name']}"
    end
    
  end
end