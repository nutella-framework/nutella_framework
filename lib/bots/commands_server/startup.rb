# Commands server
# Connects to MQTT broker, listens for commands (basically RPC over MQTT),
# executes the commands, and returns the output to the client
require 'nutella_lib'
Dir["#{File.dirname(__FILE__)}/commands/*.rb"].each do |file|
  require_relative "commands/#{File.basename(file, File.extname(file))}"
end

## nutella shuold do this... we need this!
$stdout.sync = true 
puts "Hi, I'm a basic ruby bot and all I do is idle and print stuff"
puts "Certainly first param is set to: #{ARGV[0]}"

begin
  i = 0
  while i < 10
    puts "#{i} A log line!"
    i = i + 1
    sleep 1
  end
  raise StandardError, "Oh no! Standard error! Good thing someone will restart me..."
rescue SignalException => e
  puts "This is printed when I get SIGINT"
end

puts "This is the last line before I really die"