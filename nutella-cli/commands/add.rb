require 'json'
require_relative '../command'

class Install < Command
  @description = "Copies an arbitrary template (from central DB, directory or URL) into the current project"
  
  def run(args=nil)
    # Is current directory a nutella prj?
    if !nutellaPrj?
      return 1
    end
    
    # Check args
    if args.empty?
      puts ANSI.yellow + "You need to specify a template name, directory or URL" + ANSI.reset
      return 0
    end
    @template = args[0]
    if args.length==2
      @destinationFolder = args[1]
    end
    
    
    
    # What kind of template are we handling?
    if isTemplateInCentralDB?
      return addCentralTemplate
    elsif isTemplateALocalDir?
      return addLocalTemplate
    elsif isTemplateAGitRepo?
      return addRemoteTemplate
    else
      puts ANSI.yellow + "The specified template is not a valid nutella template" + ANSI.reset
      return 1
    end
  
    return 0
  end
  
  
  def isTemplateInCentralDB?
    # Download first!
    false
  end  
  
  def isTemplateALocalDir?
    # Does the specified directory exist?
    if !File.directory?(@template)
      return false
    end
    return validateTemplate
  end
  
  def isTemplateAGitRepo?
    # Download first!
    false
  end
  
  def addCentralTemplate
    return 0
  end
  
  def addLocalTemplate
    templateNutellaFileJson = JSON.parse(IO.read("#{@template}/nutella.json"))
    
    # If destination is not specified, set it to the template name
    if @destinationFolder==nil
      @destinationFolder = templateNutellaFileJson["name"]
    end
    
    # Am I trying to copy onto a template that already exists?
    if templateNutellaFileJson["type"]=="bot"
      # Look into bots folder
      dir = "#{@prj_dir}/bots/#{@destinationFolder}"
    else
      # Look into interfaces folder
      dir = "#{@prj_dir}/interfaces/#{@destinationFolder}"
    end
    if File.directory?(dir)
      puts ANSI.red + "Folder #{dir} aready exists! Can't add template #{@template}" + ANSI.reset
      return 1
    end
    FileUtils.copy_entry @template, dir
    dir.slice!(@prj_dir)
    puts ANSI.green + "Installed template: #{@template} as #{dir}" + ANSI.reset
    return 0
  end
  
  def addRemoteTemplate
    return 0
  end
    
  def validateTemplate
    # Parse the template's nutella.json file
    begin
      templateNutellaFileJson = JSON.parse(IO.read("#{@template}/nutella.json"))
    rescue
      return false
    end
    # If template is a bot, check for the mandatory startup script and make sure it's executable
    if templateNutellaFileJson["type"]=="bot"
      if !File.executable?("#{@template}/startup")
        return false
      end
    end 
    true
  end
  
end
