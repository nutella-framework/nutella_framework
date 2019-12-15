# frozen_string_literal: true

require_relative 'meta/command'
require 'util/mqtt_broker'
require 'util/mongo'
require 'util/framework_bots'

module Nutella
  class Server < Command
    @description = 'Starts the MQTT broker and the framework level bots'

    def run(args = nil)
      if args.nil? || (args[0] != 'start' && args[0] != 'stop')
        console.error('You need to specify either start or stop')
        return
      end
      if args[0] == 'start'
        if MQTTBroker.start
          console.success('MQTT broker started')
        else
          console.error('Failed to start MQTT broker')
          return
        end
        if Mongo.start
          console.success('Mongo started')
        else
          console.error('Failed to start Mongo')
          return
        end
        if FrameworkBots.start
          console.success('Framework-level bots started')
        else
          console.error('Failed to start Framework-level bots')
          return
        end
      else
        FrameworkBots.stop
        console.success('Framework-level bots stopped')
        Mongo.stop
        console.success('Mongo stopped')
        MQTTBroker.stop
        console.success('MQTT broker stopped')
      end
    end
  end
end
