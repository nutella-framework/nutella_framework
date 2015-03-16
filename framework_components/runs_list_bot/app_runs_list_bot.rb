require_relative '../../nutella_lib/framework_core'

# Define a couple of utility functions to better deal with the runs list
def all_apps( runlist_file )
  runlist_h = JSON.parse(IO.read(runlist_file))
  runlist_h.keys
end

def runs_for_app( runlist_file, app_id )
  runlist_h = JSON.parse(IO.read(runlist_file))
  # If there is no app with this id, then return false and do nothing
  return [] if runlist_h[app_id].nil?
  runs = runlist_h[app_id]['runs']
  runs.nil? ? [] : runs
end


# Parse configuration file and runlist from the command line
config_file = ARGV[0]
runlist_file = ARGV[1]

# Try to parse both config file and runlist and terminate if we can't
begin
  config_h = JSON.parse(IO.read(config_file))
  runlist_h = JSON.parse(IO.read(runlist_file))
rescue
  # something went wrong
  abort 'Impossible to parse configuration and/or runlist files!'
end

# Initialize this bot as framework component
nutella.f.init(config_h['broker'], 'app_runs_list_bot')


# Listen for runs_list requests (done by app components when they connect)
nutella.f.net.handle_requests_on_all_apps('app_runs_list', lambda do |req, app_id, from|
  runs_for_app(runlist_file, app_id)
end)


# Whenever the runs list is updated, fire an updated runlist to all the apps
p = JSON.parse(IO.read(runlist_file))
while sleep .5
  n = JSON.parse IO.read runlist_file
  if p!=n
    all_apps.each do |app_id, _|
      nutella.f.net.publish_to_app(app_id, 'app_runs_list', runs_for_app(app_id, runlist_h))
    end
    p = n
  end
end
