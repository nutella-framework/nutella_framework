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
nutella.f.init(Nutella.config['broker'], 'example_framework_bot')


# Your code goes here! Go crazy!


# Does your bot die? If all your bot is doing is waiting for message on the network
# and responding to them, the main thread will terminate unless you call...
# nutella.f.net.listen