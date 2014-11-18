module Nutella
  
  class Tmux
  
    def initialize(runId)
      @runId = runId
    end
  
    def new_bot_window(bot)
      if !defined?(@sessions)
        # If there is no sessions, let's create one and, at the same time, create a new window for the bot
        `tmux new-session -d -s #{@runId} -n #{bot} &> /dev/null`
        @sessions = [bot]
      else
        # Create new window for `bot`
        # -k destroys it if it can't be created
        # Pring info about creation of window
      	`tmux new-window -kP -n #{bot} &> /dev/null` 
        @sessions.push(bot)
      end
      # Select window
    	`tmux select-window -t #{@runId}:#{@sessions.length-1} &> /dev/null`
      # Start bot
      `tmux send-keys "cd bots/#{bot};./startup #{@runId} #{Nutella.config["broker"]}" C-m`
    end

    def new_interface_window( iface )
      # Create new window for `iface`
      # note: -k option destroys it if it can't be created
      # hide window creation info
      `tmux new-window -kP -n #{iface} &> /dev/null`
      @sessions.push(iface)
      # Select window
      `tmux select-window -t #{@runId}:#{@sessions.length-1} &> /dev/null`
      port = Nutella.config['main_interface_port'] + @sessions.length
      url = "http://localhost:#{port}/index.html"
      # Start serving interface
      `tmux send-keys "cd interfaces/#{iface};thin -R #{Nutella.config['nutella_home']}/lib/extra/config.ru -p #{port.to_s} start" C-m`
      url
    end

    def self.killSession(runId)
      `tmux kill-session -t #{runId} &> /dev/null`
    end
      
  end
  
end
