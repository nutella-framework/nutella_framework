require_relative '../../lib/nutella_framework'
require_relative '../../nutella_lib/framework_core'

# This bot allows you to execute nutella commands remotely
# You can submit payloads like this one:
# - { "command": "start", "params": ["run-1"]}
# or this one:
# - { "command": "stop", "params": ["run-1"]}

# Initialize this bot as framework component
nutella.f.init(Nutella.config['broker'], 'nutella_server_bot')

# Responds to nutella commands
nutella.f.net.handle_requests_on_all_runs('execute_command', lambda do |req, app_id, run_id, from|
  # Process request
  params = req['params'].dup
  # Change Directory
  Dir.chdir(Nutella.runlist.app_path(req['app_id'])) do
    # Execute command
    Nutella.execute_command req['command'], req['params']
  end
  #TODO collect command output, for now return confirmation message
  "Executed command #{req['command']} with parameters #{params} on #{'app_id'}"
end)

# Listen and process messages as they come
nutella.f.net.listen
