require 'sinatra'

set :port, 57880

# Display the form to input the run_id
get '/' do
  File.read(File.join('public', 'index.html'))
end

# Render the run template
get '/:run_id' do 
  @run_id = params[:run_id]
  # 1. Check inside the runlist, if there is no run with this name we're gonna render a fun picture
  # 2. If there is a run with that run_id we need to load the run filepath and check if there is an index.erb inside the interfaces folder and if there is, render that
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


# Outside of the previous method, in nutella, we need to add support for global bots and start the ruby script like we start the bot.
# We also need to output to terminal the URL for this run, such as http://localhost:57880/run_id, that will be used to connect