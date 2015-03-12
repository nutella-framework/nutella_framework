require 'commands/meta/command'
require 'tmux/tmux'

module Nutella
  class Dependencies < RunCommand
    @description = 'Installs the dependencies for all components in the application'
    
    def run(args=nil)

      # If the current directory is not a nutella application, return
      unless Nutella.current_app.exist?
        console.warn 'The current directory is not a nutella application'
        return
      end
      
      # Install all dependencies
      return unless run_script_for_all_bots_in( Dir.pwd, 'dependencies', 'Installing dependencies for' )
      
      # Output success message
      console.success "All dependencies installed for #{Nutella.current_app.config['name']}"
    end
    
  end
end