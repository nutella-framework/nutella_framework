require 'json'
require 'git'
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
    return validateTemplate @template
  end
  
  
  def isTemplateAGitRepo?
    # Download first! 
    nutella.loadConfig
    nutella.tmp_dir = "#{nutella.home_dir}/.tmp"
    nutella.storeConfig
    cleanTmpDir
    if !Dir.exists?(nutella.tmp_dir)
      Dir.mkdir(nutella.tmp_dir)
    end
    begin
      dest_dir = @template[@template.rindex("/")+1 .. @template.length-5]
      Git.clone(@template, dest_dir, :path => nutella.tmp_dir)
      return validateTemplate(nutella.tmp_dir+"/#{dest_dir}")
    rescue
      return false 
    end
    false
  end
  
  
  def addCentralTemplate
    return 0
  end
  
  
  def addLocalTemplate(dir)
    templateNutellaFileJson = JSON.parse(IO.read("#{dir}/nutella.json"))
    
    # If destination is not specified, set it to the template name
    if @destinationFolder==nil
      @destinationFolder = templateNutellaFileJson["name"]
    end
    
    # Am I trying to copy onto a template that already exists?
    if templateNutellaFileJson["type"]=="bot"
      # Look into bots folder
      dest_dir = "#{@prj_dir}/bots/#{@destinationFolder}"
    else
      # Look into interfaces folder
      dest_dir = "#{@prj_dir}/interfaces/#{@destinationFolder}"
    end
    if File.directory?(dest_dir)
      puts ANSI.red + "Folder #{dest_dir} aready exists! Can't add template #{@template}" + ANSI.reset
      return 1
    end
    FileUtils.copy_entry dir, dest_dir
    dir.slice!(@prj_dir)
    puts ANSI.green + "Installed template: #{@template} as #{dir}" + ANSI.reset
    return 0
  end
  
  
  def addRemoteTemplate
    dest_dir = @template[@template.rindex("/")+1 .. @template.length-5]
    addLocalTemplate dest_dir
    return 0
  end
    
    
  def validateTemplate(dir)
    # Parse the template's nutella.json file
    begin
      templateNutellaFileJson = JSON.parse(IO.read("#{dir}/nutella.json"))
    rescue
      return false
    end
    # If template is a bot, check for the mandatory startup script and make sure it's executable
    if templateNutellaFileJson["type"]=="bot"
      if !File.executable?("#{dir}/startup")
        return false
      end
    end 
    true
  end
  
  def cleanTmpDir
    nutella.loadConf
    FileUtils.rm_rf(nutella.tmp_dir)
  end
  
end
