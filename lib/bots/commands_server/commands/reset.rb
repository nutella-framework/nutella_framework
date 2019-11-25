# frozen_string_literal: true

require_relative 'meta/command'

module CommandsServer
  class Reset < Command
    @description = 'Resets nutella to factory settings'

    def run(_args = nil)
      if system 'rm -rf $HOME/.nutella'
        console.success 'Successfully reset nutella to factory settings'
      else
        console.error 'Whoops...something went wrong while resetting nutella to factory settings'
      end
    end
  end
end
