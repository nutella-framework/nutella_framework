require 'json'
require 'sinatra'
require 'nokogiri'

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

# Set Sinatra to run in production mode
set :environment, :production

# Set Sinatra's port to nutella's main_interface_port
set :port, config_h['main_interface_port']


# Display the form to input the run_id
get '/' do
  send_file 'public/index.html'
end


# Redirect if there is no slash after the run_id
get '/:run_id' do
  redirect "#{request.url}/"
end


# Renders the run template
get '/:run_id/' do

  # Parse the run_id from URL and extract the run path from runlist.json
  @run_id = params[:run_id]
  @run_path = get_run_path @run_id
  @project_name = @run_path[@run_path.rindex('/')+1..@run_path.length] unless @run_path.nil?

  # If there is no run with this name, render error page
  return erb( :not_found_404, :locals => {:not_found_type => 'run'} ) if @run_path.nil?

  # If there is an 'index.erb' file inside the 'interfaces' folder, render it
  custom_index_file = "#{@run_path}/interfaces/index.erb"
  return erb(File.read( custom_index_file )) if File.exist? custom_index_file

  # If no 'index.erb' is provided we need to generate one
  # In order to do so we need to load a bunch of details
  # (folder, title/name, description) for each interface
  @interfaces = load_interfaces_details

  # Finally render the interfaces summary page
  erb :index
end


# Redirect if there is a slash after the interface
get '/:run_id/:interface/' do
  redirect "#{request.url[0..-2]}"
end


# Serves the index.html file for each individual interface augmented with nutella query string parameters
get '/:run_id/:interface' do

  # Parse the run_id and the interface name from URL
  run_id = params[:run_id]
  interface = params[:interface]

  # Extract the run path from runlist.json
  run_path = get_run_path run_id

  # Compose the path of interface index file
  index_file_path = "#{run_path}/interfaces/#{interface}/index.html"

  # If the index file doesn't exist, render error page
  return erb( :not_found_404, :locals => {:not_found_type => 'idx'} ) unless File.exist? index_file_path

  # If the index file exists, compose query string and redirect
  index_with_query_url = "#{request.path}/index.html?run_id=#{run_id}&broker=#{config_h['broker']}"
  redirect index_with_query_url
end


# Serves the files contained in each interface folder
get '/:run_id/:interface/*' do

  # Parse the run_id, the interface name and the file_path from URL
  run_id = params[:run_id]
  interface = params[:interface]
  relative_file_path = params[:splat][0]

  # Extract the run path from runlist.json
  run_path = get_run_path run_id

  # Compose the path of the file we are trying to serve
  file_path = "#{run_path}/interfaces/#{interface}/#{relative_file_path}"

  # If the file we are trying to serve doesn't exist, render error page
  return erb( :not_found_404, :locals => {:not_found_type => 'file'} ) unless File.exist? file_path

  # If the file exists, render it
  send_file file_path
end


# Utility function:
# Gets the path associated with a certain run
def get_run_path (run_id)
  begin
    runs_h = JSON.parse(IO.read($runlist_file))
    runs_h[run_id]
  rescue
    nil
  end
end

# Utility function:
# Loads all the details for all interfaces and stores them into an array of hashes
def load_interfaces_details
  interfaces = Array.new
  interfaces_path = "#{@run_path}/interfaces/"
  Dir.entries(interfaces_path).select {|entry| File.directory?(File.join(interfaces_path, entry)) && !(entry =='.' || entry == '..') }.each do |iface_dir|
    interfaces.push extract_interface_info( interfaces_path, iface_dir )
  end
  interfaces
end

# Utility function:
# Extracts name, description and folder for a single interface
def extract_interface_info( interfaces_path, iface_dir )
  iface_props = Hash.new

  index_path = "#{interfaces_path}#{iface_dir}/index.html"

  unless File.exist? index_path
    iface_props[:name] = iface_dir
    iface_props[:description] = 'My designer was a bit lazy and didn\'t include an index.html file in the main interface directory :('
    return iface_props
  end

  # If file exists, parse it and extract info
  f = File.open index_path
  doc = Nokogiri::HTML f
  f.close
  iface_props[:name] = doc.css('title').empty? ? iface_dir : doc.css('title').text
  if doc.css("meta[name='description']").empty?
    iface_props[:description] = 'My designer was a bit lazy and didn\'t include a &lt;meta name="description" content="Description of this interface"&gt; tag in the index.html file :('
  else
    if doc.css("meta[name='description']").attribute('content').nil?
      iface_props[:description] = 'There was no attribute content in &lt;meta name="description" content="Description of this interface"&gt; tag in the index.html file :('
    else
      iface_props[:description] = doc.css("meta[name='description']").attribute('content').text
    end
  end
  iface_props[:url] = "#{iface_dir}"
  iface_props
end
