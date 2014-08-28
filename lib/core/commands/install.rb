require 'core/command'
require 'json'
require 'git'
require 'net/http'

module Nutella
  
  class Install < Command
    @description = "Copies an arbitrary template (from central DB, directory or URL) into the current project"
  
    def run(args=nil)
      # Is current directory a nutella prj?
      if !nutellaPrj?
        return 1
      end
    
      # Check args
      if args.empty?
        console.warn("You need to specify a template name, directory or URL")
        return 0
      end
      @template = args[0]
      if args.length==2
        @destinationFolder = args[1]
      end
    
      # What kind of template are we handling?
      if isTemplateALocalDir?
        return addLocalTemplate
      elsif isTemplateAGitRepo?
        return addRemoteTemplate
      elsif isTemplateInCentralDB?
        return addCentralTemplate
      else
        console.warn("The specified template is not a valid nutella template")
        return 1
      end
  
      return 0
    end
  
  
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
        return validateTemplate(nutella.tmp_dir+"/#{dest_dir}")
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
        console.error("Folder #{dest_dir} aready exists! Can't add template #{@template}")
        return 1
      end
      FileUtils.copy_entry dir, dest_dir
      dir.slice!(@prj_dir)
      # TODO improve this message
      console.success("Installed template: #{@template} as #{dest_dir}")
      return 0
    end
  
  
    def addRemoteTemplate
      templ_name = @template[@template.rindex("/")+1 .. @template.length-5]
      addLocalTemplate nutella.tmp_dir+"/#{templ_name}"
      return 0
    end
  
  
    def addCentralTemplate
      return addRemoteTemplate
    end
  
  
    def cloneTemplateFromRemoteTo(dest_dir)
      nutella.loadConfig
      nutella.tmp_dir = "#{nutella.home_dir}/.tmp"
      nutella.storeConfig
      cleanTmpDir
      if !Dir.exists?(nutella.tmp_dir)
        Dir.mkdir(nutella.tmp_dir)
      end
      Git.clone(@template, dest_dir, :path => nutella.tmp_dir)
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
        # TODO if there is a dependencies script, make sure it's executable
        # TODO if there is a compile script, make usre it's executable
      end 
      true
    end
  
  
    def cleanTmpDir
      nutella.loadConf
      FileUtils.rm_rf(nutella.tmp_dir)
    end
  
  end
  
end

