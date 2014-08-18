class Tmux
  
  def initialize(runId)
    @runId = runId
  end
  
  def newWindow(bot)
    if !defined?(@sessions)
      # If I have no sessions I'm gonna create one and, at the same time, create a new window for the bot
      `tmux new-session -d -s #{@runId} -n #{bot}`
      @sessions = [bot]
    else
      # Create new window `bot`
      # -k destroys it if it can't be created
      # Pring info about creation of window
    	out = `tmux new-window -kP -n #{bot}` 
      @sessions.push(bot)
    end
    # Select window
  	`tmux select-window -t #{@runId}:#{@sessions.length-1}`
    # Start bot
    `tmux send-keys "cd bots/#{bot};./startup #{@runId}" C-m`
  end
      
end

