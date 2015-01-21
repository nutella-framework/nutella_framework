require 'core/command'

module Nutella

  class Template < Command
    @description = 'Helps create and validate templates'

    def run(args=nil)

      # If no argument then we just display info about the command
      if args==nil || args.empty?
        display_help
        return
      end

      # Extract sub command
      sub_command = args[0]

      if sub_command == "create"
        create_sub_command
      end

      if sub_command == "validate"
        validate_sub_command
      end

    end

    private

    def display_help
      console.info 'You need to specify a sub command.'
      console.info 'create    creates a template skeleton in the folder with the same name'
      console.info 'validate  validates a template that already exists'
    end


    def create_sub_command
      # TODO need to implement
      console.warn "We haven't implemented this command yet"
    end


    def validate_sub_command

      # Check an argument is provided
      if args.length < 2
        console.warn 'Which template would you like to validate?'
        return
      end

      # Extract template directory
      template = args[1]

      # TODO need to implement
      console.warn "We haven't implemented this command yet"
    end

  end

end
