require 'sinatra'
require 'erubis'

#settings.root = "/Users/tebemis/Code/"
# set :views, settings.root + '/templates'

get '/' do
  erb :list
end