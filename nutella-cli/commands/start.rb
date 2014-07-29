require_relative '../command'

class Start < Command
  @description = "Starts all or some of the bots in the current project"
  
  def run(args=nil)
    # Is current directory a nutella prj?
    unless nutellaPrj?
      return 1
    end
    # Start all the bots
    Dir.entries("#{@prj_dir}/bots").each do |file|
      if File.exist?("#{@prj_dir}/bots/#{file}/startup")
        exec("#{@prj_dir}/bots/#{file}/startup") if fork.nil?
        puts "Started bot #{file}"
      end
    end
    puts "Started X of Y bots"
    return 0
  end
end

