require_relative '../command'

class Start < Command
  def run(args=nil)
    @prj_dir = Dir.pwd
    # Check that the current directory is actually a nutella project
    if File.exist?("#{@prj_dir}/conf/project.json")
      conf = JSON.parse( IO.read("#{@prj_dir}/conf/project.json") )
      if conf["nutella_version"].nil?
        puts "The current directory is not a Nutella project"
        return
      end
    else
      puts "The current directory is not a Nutella project"
    end
    
    # Start all the bots
    Dir.entries("#{@prj_dir}/bots").each do |file|
      if File.exist?("#{@prj_dir}/bots/#{file}/startup")
        exec("#{@prj_dir}/bots/#{file}/startup") if fork.nil?
        puts "Started bot #{file}"
      end
    end
    puts "Started X of Y bots"
  end
end

