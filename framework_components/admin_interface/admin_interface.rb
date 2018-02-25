require 'json'
require 'sinatra'
require 'nokogiri'

require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'

# Set Sinatra to run in production mode
set :environment, :production

# Set Sinatra's port to nutella's main_interface_port
set :port, 57881 #Nutella.config['admin_interface_port']
# Disable X-Frame-Options header to allow iframes
set :protection, :except => :frame_options

# Basic auth
use Rack::Auth::Basic, "Protected Area" do |username, password|
  username == 'admin' && password == 'admin'
end

# Routes -------------------------------------------------------------------------


# Load admin interface with nutella parameters
get '/' do
  if params[:broker].nil?
    redirect "/?broker=127.0.0.1"
  else
    send_file File.join(File.dirname(__FILE__), 'app/build/index.html')
  end
end

# Serves all interface files
get '/*' do
  # Fetch the relative file path
  relative_file_path = params[:splat][0]
  # Compose the path of the file we are trying to serve
  file_path = "#{File.dirname(__FILE__)}/app/build/#{relative_file_path}"
  # If the file we are trying to serve doesn't exist, render error page
  unless File.exist? file_path
    status 404
    return erb( :not_found_404, :locals => {:not_found_type => 'file'} )
  end
  # If the file exists, render it
  send_file file_path
end


# Handle all the nutella commands via JSON APIs

