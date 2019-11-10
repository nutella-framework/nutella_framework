require 'docker-api'
require 'socket'
require 'util/config'

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

    # # Starts the application level bots
    # # @return [boolean] true if all bots are started correctly, false otherwise
    # def self.start_app_bots( app_id, app_path )
    #   app_bots_list = Nutella.current_app.config['app_bots']
    #   bots_dir = "#{app_path}/bots/"
    #   # If app bots have been started already, then do nothing
    #   unless Nutella::Tmux.session_exist? Nutella::Tmux.app_bot_session_name app_id
    #     # Start all app bots in the list into a new tmux session
    #     tmux = Nutella::Tmux.new app_id, nil
    #     ComponentsList.for_each_component_in_dir bots_dir do |bot|
    #       unless app_bots_list.nil? || !app_bots_list.include?( bot )
    #         # If there is no 'startup' script output a warning (because
    #         # startup is mandatory) and skip the bot
    #         unless File.exist?("#{bots_dir}#{bot}/startup")
    #           console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
    #           next
    #         end
    #         # Create a new window in the session for this run
    #         tmux.new_app_bot_window bot
    #       end
    #     end
    #   end
    #   true
    # end


    # def self.start_run_bots( bots_list, app_path, app_id, run_id )
    #   # Create a new tmux instance for this run
    #   tmux = Nutella::Tmux.new app_id, run_id
    #   # Fetch bots dir
    #   bots_dir = "#{app_path}/bots/"
    #   # Start the appropriate bots
    #   bots_list.each { |bot| start_run_level_bot(bots_dir, bot, tmux) }
    #   true
    # end


    # #--- Private class methods --------------

    # # Starts a run level bot
    # def self.start_run_level_bot( bots_dir, bot, tmux )
    #   # If there is no 'startup' script output a warning (because
    #   # startup is mandatory) and skip the bot
    #   unless File.exist?("#{bots_dir}#{bot}/startup")
    #     console.warn "Impossible to start bot #{bot}. Couldn't locate 'startup' script."
    #     return
    #   end
    #   # Create a new window in the session for this run
    #   tmux.new_bot_window bot
    # end
    # private_class_method :start_run_level_bot

  
