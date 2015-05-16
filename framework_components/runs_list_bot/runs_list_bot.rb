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
nutella.f.init(Nutella.config['broker'], 'app_runs_list_bot')


# Listen for runs_list requests (done by app components when they connect)
nutella.f.net.handle_requests_on_all_apps('app_runs_list', lambda do |req, app_id, from|
  Nutella.runlist.runs_for_app app_id
end)

# Listen for runs_list requests (done by framework interfaces when they connect)
nutella.f.net.handle_requests('runs_list', lambda do |req, from|
  Nutella.runlist.all_runs
end)

# Listen for runs_list requests at run level (done by Roomcast iPad interface)
nutella.f.net.handle_requests_on_all_runs('runs_list', lambda do |req, app_id, run_id, from|
  Nutella.runlist.all_runs
end)

# Whenever the runs list is updated, fire an updated runlist to all the apps and all framework components
p = Nutella.runlist.all_runs
while sleep 0.25
  n = Nutella.runlist.all_runs
  if p!=n
    Nutella.runlist.all_apps.each do |app_id, _|
      nutella.f.net.publish_to_app(app_id, 'app_runs_list', Nutella.runlist.runs_for_app(app_id))
    end
    nutella.f.net.publish 'runs_list', Nutella.runlist.all_runs
    p = n
  end
end
