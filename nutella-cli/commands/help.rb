require_relative '../command'

class Help < Command
  @description = "Displays what every command does and how to use it"
  
  def run(args=nil)
    Dir["#{nutella.home_dir}/nutella-cli/commands/*.rb"].each do |file|
      print "#{File.basename(file, File.extname(file))}\t\t"
      puts Object::const_get("#{File.basename(file, File.extname(file))}".capitalize).description
    end
    return 0
  end
end

