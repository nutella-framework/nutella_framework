# Utility functions for logging bot

def assemble_log(payload, from)
  h = Hash.new
  h.merge! payload
  h['from'] = from
  h
end

def assemble_dump(message, channel)
  {'channel' => channel, 'message' => message}
end