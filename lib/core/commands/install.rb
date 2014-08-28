require 'core/command'
require 'json'
require 'git'
require 'net/http'

module Nutella
  
  class Install < Command
    @description = "Copies an arbitrary template (from central DB, directory or URL) into the current project"
  
    def run(args=nil)
      # Is current directory a nutella prj?
      if !Nutella.currentProject.exist?
        return
      end
    
      # Check args
      if args.empty?
        console.warn "You need to specify a template name, directory or URL"
        return
      end
      @template = args[0]
      if args.length==2
        @destinationFolder = args[1]
      end
      
      # Extract project directory
      @prj_dir = Nutella.currentProject.dir
    
      # What kind of template are we handling?
      if isTemplateALocalDir?
        addLocalTemplate
      elsif isTemplateAGitRepo?
        addRemoteTemplate
      elsif isTemplateInCentralDB?
        addCentralTemplate
      else
        console.warn "The specified template is not a valid nutella template"
      end
      
    end
    
    
    private
  
  
    def isTemplateALocalDir?
      # Does the specified directory exist?
      if !File.directory?(@template)
        return false
      end
      return validateTemplate @template
    end
  
  
    def isTemplateAGitRepo?
      begin
        dest_dir = @template[@template.rindex("/")+1 .. @template.length-5]
        cloneTemplateFromRemoteTo(dest_dir)
        return validateTemplate("#{Nutella.config["tmp_dir"]}/#{dest_dir}")
      rescue
        return false 
      end
      false
    end
  
  
    def isTemplateInCentralDB?
      uri = URI.parse("https://raw.githubusercontent.com/ltg-uic/nutella/templates-database/" + @template + ".json")
      begin
        nutella_json = JSON.parse(Net::HTTP.get(uri))
        if nutella_json["name"]==@template
          @template = nutella_json["repo"]
          return isTemplateAGitRepo?
        end
      rescue
        return false
      end
      false
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
        dest_dir = "#{@prj_dir}/bots/#{@destinationFolder}"
      else
        # Look into interfaces folder
        dest_dir = "#{@prj_dir}/interfaces/#{@destinationFolder}"
      end
      if File.directory?(dest_dir)
        console.error("Folder #{dest_dir} aready exists! Can't add template #{@template}")
        return
      end
      FileUtils.copy_entry @template, dest_dir
      console.success("Installed template: #{@template} as #{dest_dir}")
    end
  
  
    def addRemoteTemplate
      templ_name = @template[@template.rindex("/")+1 .. @template.length-5]
      addLocalTemplate "#{Nutella.config["tmp_dir"]}/#{templ_name}"
    end
  
  
    def addCentralTemplate
      return addRemoteTemplate
    end
  
  
    def cloneTemplateFromRemoteTo(dest_dir)
      cleanTmpDir
      if !Dir.exists?(Nutella.config["tmp_dir"])
        Dir.mkdir(Nutella.config["tmp_dir"])
      end
      Git.clone(@template, dest_dir, :path => Nutella.config["tmp_dir"])
    end
    
    
    def validateTemplate(dir)
      # Parse the template's nutella.json file
      begin
        templateNutellaFileJson = JSON.parse(IO.read("#{dir}/nutella.json"))
      rescue
        return false
      end
      # If template is a bot, perform additional checks
      if templateNutellaFileJson["type"]=="bot"
        # Is there a andatory 'startup' script and is it executable
        if !File.executable?("#{dir}/startup")
          return false
        end
      end 
      true
    end
  
  
    def cleanTmpDir
      FileUtils.rm_rf Nutella.config["tmp_dir"]
    end
  
  end
  
end

