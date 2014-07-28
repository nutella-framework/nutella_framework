require_relative '../command'
require_relative '../nutella-cli'
require 'fileutils'


class New < Command
  def run(args=nil)
    # If no other arguments, show help and quit here
    if args.empty?
      puts "You need to specify a name for your new project"
      exit 0
    end

    # Create the directory structure for a new nutella project
    dirname = File.dirname("#{args[0]}/bots")
    unless File.directory?("#{args[0]}/bots")
      FileUtils.mkdir_p("#{args[0]}/bots")
    end

    # Run createbot command to create bots
    NutellaCLI.executeCommand("createbot")
    # p out

    puts "Your new project #{args[0]} is ready!" 
  end
end