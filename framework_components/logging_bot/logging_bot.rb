# Logger bot
# ----------
#
# This bot is in charge of recording all the messages that are sent by
# all components in all runs. It records all info sent to channels:
# - `/nutella/logging`
# - `/nutella/apps/<app_id>/logging`
# - `/nutella/apps/<app_id>/runs/<run_id>/logging`
# All logs are appended to a MongoDB collection called `logs`, inside the
# `nutella` database.
#
# -----------------------------------------------------------------------------

require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'

require_relative 'utils'

# Initialize this bot as framework component
nutella.f.init(Nutella.config['broker'], 'example_framework_bot')

# Get a mongo persisted collection
logs = nutella.f.persist.get_mongo_collection_store 'logs'

# Listen for run-level log messages
nutella.f.net.subscribe_to_all_runs('logging', lambda do |payload, app_id, run_id, from|
  logs.push assemble_log(payload, from)
end)

# Listen for app-level log messages
nutella.f.net.subscribe_to_all_apps('logging', lambda do |payload, app_id, from|
  logs.push assemble_log(payload, from)
end)

# Listen for framework-level log messages
nutella.f.net.subscribe('logging', lambda do |payload, from|
  logs.push assemble_log(payload, from)
end)

# Listen and process messages as they come
nutella.f.net.listen