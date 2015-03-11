require 'nutella_lib'

# This needs to be initialized as framework component like so:
# nutella.init_as_app_component('localhost', 'app_runs_list_bot')
nutella.init('localhost', 'my_app_id', 'no_run_id', 'app_runs_list_bot')

# Listen for runs_list requests (done by app components when they connect)
nutella.net.app.handle_requests('app_runs_list', lambda do |req, from|
  from['app_id'] # Use this info to fetch the appropriate runs
  ['run_1', 'run_2', 'run_3'] # Return an array of names!
end)

# Whenever the list is updated, fire an update to the right app

nutella.net.listen