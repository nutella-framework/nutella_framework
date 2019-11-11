require_relative 'meta/command'
require 'nutella_lib'

module Nutella
  class New < Command
    @description = 'Creates a new nutella application'
  
    def run(args=nil)
      nutella.f.init(Config.file['broker'], 'nutella_cli')
      response = nutella.f.net.sync_request( 'commands', { 'command': 'new', 'opts': {'current_dir': Dir.pwd, 'args': args}} )
      if response['success']
        console.success response['message']
      else
        console.error response['message']
        if response['exception'] != nil
          console.error response['exception']
        end
      end
    end

  end
end


