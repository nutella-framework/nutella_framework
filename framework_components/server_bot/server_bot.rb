require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'

# Framework bots can access all the parameters they need directly
# from the configuration file and the runlist,
# to which they have full access to.

# Access the config file like so:
# Nutella.config['broker']

# Access the runs list like so:
# Nutella.runlist.all_runs


# Initialize this bot as framework component
nutella.f.init(Nutella.config['broker'], 'nutella_server_bot')


nutella.f.net.handle_requests_on_all_runs('start_run', lambda do |req, app_id, run_id, from|
  "Executing command #{req} on #{app_id} run #{run_id}"
end)

# Listen and process messages as they come
nutella.f.net.listen
