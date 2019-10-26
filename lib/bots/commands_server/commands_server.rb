$stdout.sync = true ## nutella woudl do this
# $stdout.sync = true 
puts "Hi, I'm a basic ruby bot and all I do is idle and print stuff"
$stderr.puts "certainly first param is set #{ARGV[0]}"


begin
  i = 0
  while true
    puts "#{i} A log line!"
    i = i + 1
    sleep 1
  end
rescue SignalException => e
  puts "HEY I WAS KILLED!!!"
  $stderr.puts "AND I COMPLAIN IN STDERR"
  puts e
end
