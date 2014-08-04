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
        pid = fork
        exec("#{@prj_dir}/bots/#{file}/startup #{args[0].to_s.empty? ? prj_config("name") : args[0]}") if pid.nil?    
        puts "Started bot #{file}"
        # puts pid
      end
    end
    puts "Started X of Y bots"
    return 0
  end
end

