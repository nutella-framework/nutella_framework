module Nutella
  
  class Tmux
  
    def initialize( app_id, run_id )
      @app_id = app_id
      @run_id = run_id
    end

    # Creates a new window (and session if necessary) to start a run-level bot
    def new_bot_window( bot )
      # Create session name
      sn = Tmux.session_name(@app_id, @run_id)
      # Create session
      create_tmux_window(sn, bot)
      # Start bot
      `tmux send-keys "cd bots/#{bot};./startup #{Nutella.config['broker']} #{@app_id} #{@run_id}" C-m`
    end

    # Creates a new window (and session if necessary) to start an app-level bot
    def new_app_bot_window( bot )
      # Create session name
      sn = Tmux.app_bot_session_name(@app_id)
      # Create session
      create_tmux_window(sn, bot)
      # Start bot
      `tmux send-keys "cd bots/#{bot};./startup #{Nutella.config['broker']} #{@app_id}" C-m`
    end

    # Removes a run-level session associated to a particular run
    def self.kill_run_session( app_id, run_id )
      `tmux kill-session -t #{session_name(app_id, run_id)} > /dev/null 2>&1`
    end

    # Removes the app-level session associated to a particular application
    def self.kill_app_session( app_id )
      `tmux kill-session -t #{app_bot_session_name( app_id )} > /dev/null 2>&1`
    end

    #  Returns true if a tmux session with a certain id exists
    def self.session_exist?( session_id )
      system( "tmux has-session -t #{session_id} > /dev/null 2>&1" )
    end

    # Builds a session name for run-level session
    def self.session_name( app_id, run_id )
      "#{app_id}/#{run_id}"
    end

    # Builds a session name for an app-level session
    def self.app_bot_session_name( app_id )
      "#{app_id}-app-bots"
    end


    private

    def create_tmux_window( session_name, bot )
      # If a session already exists, simply create a new window (-n) for 'bot'.
      # -k destroys the window if it can't be created
      # -P prints info about creation of window
      # If there is no sessions, let's create one (-s) and, at the same time, create a new window for the bot
      if defined? @windows
        `tmux new-window -kP -n #{bot} &> /dev/null`
        @windows.push bot
      else
        `tmux new-session -d -s #{session_name} -n #{bot} &> /dev/null`
        @windows = [bot]
      end
      # Select the last window we launched
      `tmux select-window -t #{session_name}:#{@windows.length-1} &> /dev/null`
    end
      
  end
  
end
