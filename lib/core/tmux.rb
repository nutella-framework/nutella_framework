module Nutella
  
  class Tmux
  
    def initialize( run_id )
      @run_id = run_id
    end
  
    def new_bot_window( bot )
      if defined? @sessions
        # If a session already exists,
        # simply create a new window for 'bot'.
        # -k destroys the window if it can't be created
        # Print info about creation of window
        `tmux new-window -kP -n #{bot} &> /dev/null`
        @sessions.push bot
      else
        # If there is no sessions, let's create one and, at the same time, create a new window for the bot
        `tmux new-session -d -s #{@run_id} -n #{bot} &> /dev/null`
        @sessions = [bot]
      end
      # Select window
    	`tmux select-window -t #{@run_id}:#{@sessions.length-1} &> /dev/null`
      # Start bot
      `tmux send-keys "cd bots/#{bot};./startup #{@run_id} #{Nutella.config['broker']}" C-m`
    end

    def self.kill_session( run_id )
      `tmux kill-session -t #{run_id} &> /dev/null`
    end

    def self.session_exists?( run_id )
      system( "tmux has-session -t #{run_id} &> /dev/null" )
    end
      
  end
  
end
