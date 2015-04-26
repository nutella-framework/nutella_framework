require 'sinatra'
require 'sinatra/cross_origin'
require 'fileutils'

require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'


# Set Sinatra to run in production mode
set :environment, :production

# Set Sinatra's port to nutella's main_interface_port
pt = Nutella.config['main_interface_port'] + 2
set :port, pt

# Enable Sinatra to process CORS requests
set :allow_origin, :any
set :allow_methods, [:get, :post, :options]

configure do
  enable :cross_origin
end



# Set data folder
data_folder = "#{ENV['HOME']}/.nutella/data/binary-files-manager"

# If data folder doesn't exist, create it
unless Dir.exists? data_folder
  FileUtils::mkdir_p data_folder
end



# Serve all files in the data folder
get "/:filename" do |fn|
  send_file "#{data_folder}/#{fn}"
end


# Handle file upload
post "/upload" do
  file_name = params[:filename]
  file_path = "#{data_folder}/#{file_name}"

  # If the file already exists, just reply with the file url
  return {url: url(file_path)}.to_json if File.exist? file_path

  # Otherwise, write the file and reply with URL
  File.open(file_path, 'w') do |f|
    f.write(params['file'][:tempfile].read)
  end
  {url: url(file_name)}.to_json
end


# Tests if a particular file exists
get "/test/:filename" do |fn|
  if File.exist? "#{data_folder}/#{fn}"
    {url: url("/#{fn}")}.to_json
  else
    {error: 404}.to_json
  end
end

