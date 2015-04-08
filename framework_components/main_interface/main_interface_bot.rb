require 'json'
require 'sinatra'
require 'nokogiri'

require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'


# Set Sinatra to run in production mode
set :environment, :production

# Set Sinatra's port to nutella's main_interface_port
set :port, Nutella.config['main_interface_port']


# Routes -------------------------------------------------------------------------


# Display the form to input the app_id and run_id
get '/' do
  send_file File.join(File.dirname(__FILE__), 'public/index.html')
end


# Redirect if there is no slash after the run_id
get '/:app_id/:run_id' do
  redirect "#{request.url}/"
end

# Renders the interfaces summary page for the run
get '/:app_id/:run_id/' do
  # Parse the app_id and run_id from URL and extract the run path from runlist.json
  @app_id = params[:app_id]
  @run_id = params[:run_id]
  @app_path = Nutella.runlist.app_path @app_id
  # If there is no app with this name, render error page
  return erb( :not_found_404, :locals => {:not_found_type => 'run'} ) if @app_path.nil?
  # To generate the 'index.erb' we need to load a bunch of details
  # (folder, title/name, description) for each interface
  @interfaces = load_interfaces_details @app_path
  @framework_interfaces = load_framework_interfaces
  # Render the interfaces summary page
  erb :index
end


# Redirect if there is a slash after the interface
get '/:app_id/:run_id/:interface/' do
  redirect "#{request.url[0..-2]}"
end

# Serves the index.html file for each individual interface augmented with nutella query string parameters
get '/:app_id/:run_id/runs/:interface' do
  # Parse the app_id and run_id from URL and extract the run path from runlist.json
  app_id = params[:app_id]
  run_id = params[:run_id]
  interface = params[:interface]
  app_path = Nutella.runlist.app_path app_id
  # Compose the path of interface index file passing the nutella parameters
  index_file_path = "#{app_path}/interfaces/#{interface}/index.html"
  # If the index file doesn't exist, render error page
  return erb( :not_found_404, :locals => {:not_found_type => 'idx'} ) unless File.exist? index_file_path
  # If the index file exists, compose query string and redirect
  index_with_query_url = "#{request.path}/index.html?broker=#{Nutella.config['broker']}&app_id=#{app_id}&run_id=#{run_id}"
  redirect index_with_query_url
end

# Serves the files contained in each interface folder
get '/:app_id/:run_id/runs/:interface/*' do
  # Parse the run_id, the interface name and the file_path from URL
  app_id = params[:app_id]
  interface = params[:interface]
  relative_file_path = params[:splat][0]
  app_path = Nutella.runlist.app_path app_id
  # Compose the path of the file we are trying to serve
  file_path = "#{app_path}/interfaces/#{interface}/#{relative_file_path}"
  # If the file we are trying to serve doesn't exist, render error page
  return erb( :not_found_404, :locals => {:not_found_type => 'file'} ) unless File.exist? file_path
  # If the file exists, render it
  send_file file_path
end


# Serve the index file for a framework interface passing the nutella parameters
get '/:app_id/:run_id/framework/:interface' do
  app_id = params[:app_id]
  run_id = params[:run_id]
  # Filesystem path to the index file
  index_file_path = "#{File.dirname(__FILE__)}/../#{params[:interface]}/index.html"
  # If the index file doesn't exist, render error page
  return erb( :not_found_404, :locals => {:not_found_type => 'idx'} ) unless File.exist? index_file_path
  # If the index file exists, compose query string and redirect
  index_with_query_url = "#{request.path}/index.html?broker=#{Nutella.config['broker']}&app_id=#{app_id}&run_id=#{run_id}"
  redirect index_with_query_url
end

# Serves the files contained in each framework interface folder
get '/:app_id/:run_id/framework/:interface/*' do
  # Fetch the relative file path
  relative_file_path = params[:splat][0]
  # Compose the path of the file we are trying to serve
  file_path = "#{File.dirname(__FILE__)}/../#{params[:interface]}/#{relative_file_path}"
  # If the file we are trying to serve doesn't exist, render error page
  return erb( :not_found_404, :locals => {:not_found_type => 'file'} ) unless File.exist? file_path
  # If the file exists, render it
  send_file file_path
end


# Utility functions -------------------------------------------------------------------------


# Loads all the details for all run interfaces and stores them into an array of hashes
def load_interfaces_details( app_path )
  interfaces = Array.new
  interfaces_path = "#{app_path}/interfaces/"
  Dir.entries(interfaces_path).select {|entry| File.directory?(File.join(interfaces_path, entry)) && !(entry =='.' || entry == '..') }.each do |iface_dir|
    interfaces.push extract_interface_info( interfaces_path, iface_dir )
  end
  interfaces
end


# Loads all the details for all framework interfaces and stores them into an array of hashes
def load_framework_interfaces
  interfaces = Array.new
  components_directory = "#{File.dirname(__FILE__)}/../"
  Dir.entries(components_directory).select {|entry| File.directory?(File.join(components_directory, entry)) && !(entry =='.' || entry == '..') }.each do |iface_dir|
    interfaces.push(extract_interface_info( components_directory, iface_dir)) if File.exist?("#{components_directory}#{iface_dir}/index.html")
  end
  interfaces
end


# Extracts name, description and folder for a single interface from it's index.html
def extract_interface_info( interfaces_path, iface_dir )
  iface_properties = Hash.new
  index_path = "#{interfaces_path}#{iface_dir}/index.html"
  unless File.exist? index_path
    iface_properties[:name] = iface_dir
    iface_properties[:description] = 'My designer was a bit lazy and didn\'t include an index.html file in the main interface directory :('
    return iface_properties
  end

  # If file exists, parse it and extract info
  f = File.open index_path
  doc = Nokogiri::HTML f
  f.close
  # Extract interface name from title
  iface_properties[:name] = (doc.css('title').empty? || doc.css('title').text.empty? ) ? iface_dir : doc.css('title').text
  # Extract description from meta description tag
  if doc.css("meta[name='description']").empty?
    iface_properties[:description] = 'My designer was a bit lazy and didn\'t include a &lt;meta name="description" content="Description of this interface"&gt; tag in the index.html file :('
  else
    if doc.css("meta[name='description']").attribute('content').nil?
      iface_properties[:description] = 'There was no attribute content in &lt;meta name="description" content="Description of this interface"&gt; tag in the index.html file :('
    else
      iface_properties[:description] = doc.css("meta[name='description']").attribute('content').text
    end
  end
  # Extract URL from interface dir
  iface_properties[:url] = iface_dir
  iface_properties
end
