require_relative '../../lib/nutella_framework'
require_relative '../../nutella_lib/framework_core'


# Initialize this bot as framework component
nutella.f.init(Nutella.config['broker'], 'nutella_server_bot')

# Responds to nutella commands
nutella.f.net.handle_requests_on_all_runs('execute_command', lambda do |req, app_id, run_id, from|
  # Process request
  req_hash = JSON.parse req
  params = req_hash['params'].dup
  # Change Directory
  Dir.chdir(Nutella.runlist.app_path(app_id)) do
    # Execute command
    Nutella.execute_command req_hash['command'], req_hash['params']
  end
  #TODO collect command output, for now return confirmation message
  "Executed command #{req_hash['command']} with parameters #{params} on #{'app_id'}"
end)

# Listen and process messages as they come
nutella.f.net.listen
