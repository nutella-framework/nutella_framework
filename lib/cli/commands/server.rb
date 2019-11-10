require_relative 'meta/command'
require_relative 'server/mqtt_broker'
require_relative 'server/mongo'
require_relative 'server/framework_bots'

module Nutella
  class Server < Command
    @description = 'Starts the MQTT broker and the framework level bots'

    def run(args=nil)
      if MQTTBroker.start
        console.success('MQTT broker started')
      else
        console.error('Failed to start MQTT broker')
      end 
      if Mongo.start
        console.success('Mongo started')
      else
        console.error('Failed to start Mongo')
      end 
      if FrameworkBots.start
        console.success('Framework-level bots started')
      else
        console.error('Failed to start Framework-level bots')
      end
    end
  end

end