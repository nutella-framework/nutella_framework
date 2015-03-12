require 'commands/meta/run_command'
require 'tmux/tmux'

module Nutella
  class Compile < RunCommand
    @description = 'Compiles all the components that need compilation in the application'
    
    def run(args=nil)

      # If the current directory is not a nutella application, return
      unless Nutella.current_app.exist?
        console.warn 'The current directory is not a nutella application'
        return
      end
      
      # Compile all components
      return unless run_script_for_all_bots_in( Dir.pwd, 'compile', 'Compiling' )
      
      # Output success message
      console.success "All components compiled for #{Nutella.current_app.config['name']}"
    end
    
  end
end