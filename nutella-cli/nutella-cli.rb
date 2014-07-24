# Nutella Command Line Interface
# by Alessandro Gnoli

NUTELLA_VERSION = "0.0.1"
NUTELLA_HOME = ENV['NUTELLA_HOME']

puts "              _       _ _
             | |     | | |
  _ __  _   _| |_ ___| | | __ _
 |  _ \\| | | | __/ _ \\ | |/ _  |
 | | | | |_| | ||  __/ | | (_| |
 |_| |_|\\__,_|\\__\\___|_|_|\\__,_|

"

if ARGV.first == '--version'
  puts "Version " + nutella_version
  exit 0
elsif ARGV.first == '-v'
  puts "Version " + nutella_version
  # Shift the -v to the end of the parameter list
  ARGV << ARGV.shift
  # If no other arguments, just quit here.
  exit 0 if ARGV.length == 1
end

puts "Welcome to the Nutella shell right now there are no commands that are supported yet."
puts "So, yes, all this program does for now is show a nice rendering of the word Nutella."
puts ""
