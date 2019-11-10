require_relative 'meta/command'
require 'nutella_lib'

module Nutella
  class Stop < Command
    @description = 'Stops runs and nutella applications'
  
    def run(args=nil)
      nutella.f.init(Config.file['broker'], 'nutella_cli')
      response = nutella.f.net.sync_request( 'commands', { 'command': 'start', 'opts': {'current_dir': Dir.pwd, 'args': args}} )
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


