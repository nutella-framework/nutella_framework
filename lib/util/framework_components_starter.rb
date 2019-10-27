require 'util/supervisor'

module Nutella
  # Utility functions to deal with framework components
  class FrameworkComponents

    def self.start
      FrameworkComponents.new.start
    end

    # Starts all framework components. 
    # @return [boolean] true if all components are started correctly, false otherwise
    def start
      nutella_components_dir = "#{Nutella::NUTELLA_HOME}lib/bots"
      # Todo, refactor so we don't reload 20 times
      framework_components.each do |c|
        Supervisor.instance.add("nutella_f_#{c}", "#{nutella_components_dir}/#{c}/startup")
      end
      framework_components.each do |c|
        puts Supervisor.instance.start("nutella_f_#{c}")
      end
      true
    end

    private

    # Finds the framework level components
    def framework_components
      d = "#{Nutella::NUTELLA_HOME}lib/bots"
      Dir.entries(d)
        .select {|entry| File.directory?(File.join(d, entry)) && !(entry =='.' || entry == '..') }
        .select { |c| File.exist? "#{d}/#{c}/startup" }
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

  
