class Tmux
  
  def initialize(runId)
    @runId = runId
  end
  
  def newWindow(bot)
    if !defined?(@sessions)
      # If I have no sessions I'm gonna create one and, at the same time, create a new window for the bot
      `tmux new-session -d -s #{@runId} -n #{bot} &> /dev/null`
      @sessions = [bot]
    else
      # Create new window `bot`
      # -k destroys it if it can't be created
      # Pring info about creation of window
    	`tmux new-window -kP -n #{bot} &> /dev/null` 
      @sessions.push(bot)
    end
    # Select window
  	`tmux select-window -t #{@runId}:#{@sessions.length-1} &> /dev/null`
    # Start bot
    `tmux send-keys "cd bots/#{bot};./startup #{@runId}" C-m`
  end
  
  def self.killSession(runId)
    `tmux kill-session -t #{runId} &> /dev/null`
  end
      
end

