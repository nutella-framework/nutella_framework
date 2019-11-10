require 'docker-api'
require 'socket'
require 'config/config'

module Nutella
  class FrameworkBots

    def self.start
      FrameworkBots.new.start
    end

    def self.stop
      FrameworkBots.new.stop
    end

    # Starts all framework bots. 
    # @return [boolean] true if all bots are started correctly, false otherwise
    def start
      result = true
      framework_bots.each do |bot|
        unless bot_started?(bot)
          result && start_bot(bot)
        end
      end
      result
    end

    def stop
      result = true
      # Find docker images of the bots and terminate them
      # Compound results and return
      result
    end

    private

    def bot_started?(bot_name)
      begin
        c = Docker::Container.get("nutella_f_#{bot_name}")
        return c.info['State']['Running']
      rescue Docker::Error::NotFoundError
        return false
      end
      true
    end

    def start_bot(bot_name)
      bot_container_name = "nutella_f_#{bot_name}"
      bot_dir = "#{Nutella::NUTELLA_SRC}lib/bots/#{bot_name}"
      # Remove any other containers with the same name to avoid conflicts
      begin
        old_c = Docker::Container.get(bot_container_name)
        old_c.delete(force: true)
      rescue Docker::Error::NotFoundError
        # If the container is not there we just proceed
      end
      # Try to create and start the container for the bot
      begin
        Docker::Container.create(
          'Cmd': [
            'ruby',
            'startup.rb',
            Config.file['broker']
          ],
          'Image': 'nutella:1.0.0',
          'name': bot_container_name,
          'Detach': true,
          'HostConfig': {
            'Binds': ["#{bot_dir}:/app"],
            'RestartPolicy': {'Name': 'unless-stopped'}
          }
        ).start
      rescue => e
        console.error "Failed to start #{bot_name}!"
        puts e
        return false
      end
      true
    end

    # Finds the framework level bots
    def framework_bots
      d = "#{Nutella::NUTELLA_SRC}lib/bots"
      Dir.entries(d)
        .select {|entry| File.directory?(File.join(d, entry)) && !(entry =='.' || entry == '..') }
        .select { |c| File.exist? "#{d}/#{c}/startup.rb" }
    end
  
  end
end

  
