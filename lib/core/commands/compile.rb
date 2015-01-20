require 'core/run_command'
require 'core/tmux'

module Nutella
  class Compile < RunCommand
    @description = 'Compiles all the actors that need compilation in the project'
    
    def run(args=nil)

      # If the current directory is not a nutella project, return
      return unless Nutella.current_project.exist?
      
      # If there are any arguments, ignore them and output a message
      unless args.nil?
        console.info "`nutella compile` doesn't take any arguments. Ignoring..."
      end
      
      # Install all dependencies
      return unless prepare_bot( cur_prj_dir, 'compile', 'Compiling' )
      
      # Output success message
      console.success "All actors compiled for #{Nutella.current_project.config['name']}"
    end
    
  end
end