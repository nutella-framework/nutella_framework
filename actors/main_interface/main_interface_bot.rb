require 'json'
require 'sinatra'

# Configuration file and runlist (runlist as global)
config_file = ARGV[0]
$runlist_file = ARGV[1]

# Try to parse the both config file and runlist and terminate if we can't
begin
  config_h = JSON.parse(IO.read(config_file))
  JSON.parse(IO.read($runlist_file))
rescue
  # something went wrong
  abort 'Impossible to parse configuration and/or runlist files!'
end

# Set Sinatra's port to nutella's main_interface_port
set :port, config_h['main_interface_port']


# Display the form to input the run_id
get '/' do
  File.read(File.join("#{config_h['nutella_home']}/actors/main_interface/public", 'index.html'))
end


# Renders the run template
get '/:run_id' do

  # Parse the run_id from URL
  @run_id = params[:run_id]

  # Check inside the runlist, if there is no run with this name display error page
  @run_path = get_run_path(@run_id)
  if @run_path.nil?
    # render error page:
    # File.read(File.join("#{config_h['nutella_home']}/actors/main_interface/public", 'index.html'))
    # something like, no run_id like this
    File.read(File.join("#{config_h['nutella_home']}/actors/main_interface/public", '404.html'))
  end

  # TODO # 2. If there is a run with that run_id we need to load the run filepath and check if there is an index.erb inside the interfaces folder and if there is, render that
  # 3. If there is no erb template, we need to generate one. We need to load, for all interfaces in the run, name, description, id, port/address
  # 4. This info (id, port/address) is stored inside the .interfaces_config file inside the run folder.
  # 5. Finally we need to load the broker name and compose the interfaces links as such.
  # http://localhost:57883/index.html?run_id=roomquake&broker=ltg.evl.uic.edu
  # Makes sure we sanitize the parameters with sensible defaults and humor (e.g. no description)
  # This should be the only instance variable
  @interfaces = Array.new
  @interfaces.push({ 'name' => 'Seismograph', 'description' => 'Draws the seismograph continuously', 'url' => 'http://localhost:myport/index.html?run_id=roomquake&broker=ltg.evl.uic.edu' })
  @interfaces.push({ 'name' => 'Teacher administration panel', 'description' => 'Administration panel for the teacher that allows them to configure the room, schedule quakes and manag the run', 'url' => 'http://localhost:my_other_port/index.html?run_id=roomquake&broker=ltg.evl.uic.edu' })
  erb :index
end

# Utility functions

# Gets the path associated with a certain run
def get_run_path (run_id)
  begin
    runs_h = JSON.parse(IO.read($runlist_file))
    runs_h[run_id]
  rescue
    nil
  end
end