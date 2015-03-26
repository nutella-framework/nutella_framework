require 'ansi'

module Nutella

  module Framework

    module Log

      def self.debug(message, code=nil)
        puts( ANSI.cyan + message + ANSI.reset )
        Nutella.f.net.publish( 'logging', log_to_json(message, code, __method__) )
        code
      end

      def self.info(message, code=nil)
        puts( message )
        Nutella.f.net.publish( 'logging', log_to_json(message, code, __method__) )
        code
      end

      def self.success(message, code=nil)
        puts( ANSI.green + message + ANSI.reset )
        Nutella.f.net.publish( 'logging', log_to_json(message, code, __method__) )
        code
      end

      def self.warn(message, code=nil)
        puts( ANSI.yellow + message + ANSI.reset )
        Nutella.f.net.publish( 'logging', log_to_json(message, code, __method__) )
        code
      end

      def self.error(message, code=nil)
        puts( ANSI.red + message + ANSI.reset )
        Nutella.f.net.publish( 'logging', log_to_json(message, code, __method__) )
        code
      end

      private

      def self.log_to_json( message, code, level)
        code.nil? ? {level: level, message: message} : {level: level, message: message, code: code}
      end

    end

  end

end