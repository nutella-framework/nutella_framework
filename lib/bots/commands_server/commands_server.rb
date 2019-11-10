# Command server
# Connects to MQTT broker and listens for commands over (RPC)
# Executes the commands and returns the output
require 'nutella_lib'
Dir["#{File.dirname(__FILE__)}/commands/*.rb"].each do |file|
  require_relative "commands/#{File.basename(file, File.extname(file))}"
end

$stdout.sync = true ## nutella woudl do this
# $stdout.sync = true 
puts "Hi, I'm a basic ruby bot and all I do is idle and print stuff"
$stderr.puts "certainly first param is set #{ARGV[0]}"


begin
  i = 0
  while i < 10
    puts "#{i} A log line!"
    i = i + 1
    sleep 1
  end
  raise StandardError, "Puttana merda!!!"
rescue SignalException => e
  puts "HEY I WAS KILLED!!!"
  $stderr.puts "AND I COMPLAIN IN STDERR"
  puts e
end


# docker run -d --restart=unless-stopped -v "$PWD":/app --name <container_name> nutella:1.0.0 ruby <script.rb>
# docker kill <container_name>
# docker rm 4e77e5964bd8