# Nutella Command Line Interface
# by Alessandro Gnoli
require 'pathname'

NUTELLA_VERSION = "0.0.1"
NUTELLA_HOME = ENV['NUTELLA_HOME']

# Print Nutella logo
puts "              _       _ _
             | |     | | |
  _ __  _   _| |_ ___| | | __ _
 |  _ \\| | | | __/ _ \\ | |/ _  |
 | | | | |_| | ||  __/ | | (_| |
 |_| |_|\\__,_|\\__\\___|_|_|\\__,_|

Welcome to nutella version #{NUTELLA_VERSION}! For a complete lists of available commands type `nutella help`.

"
# If no other arguments, just quit here.
if ARGV.empty?
  exit 0
end

# Parse command
def getCommand (command)
  Dir["#{NUTELLA_HOME}/nutella-cli/commands/*.rb"].each do |file|
    if command == Pathname.new(file).basename.to_s[0..-4]
      return file
    end
  end
  nil
end

command = getCommand(ARGV.first)
if !command.nil?
  exec "ruby #{command} #{ARGV[1]}"
else
  puts "Unknown command #{ARGV.first}"
end
