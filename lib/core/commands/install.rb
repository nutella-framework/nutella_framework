require 'core/template_command'
require 'git'
require 'net/http'

module Nutella
  
  class Install < TemplateCommand
    @description = 'Copies an arbitrary template (from central DB, directory or URL) into the current project'
  
    def run(args=nil)
      # Is current directory a nutella prj?
      return unless Nutella.current_project.exist?
    
      # Check args
      if args.empty?
        console.warn 'You need to specify a template name, directory or URL'
        return
      end
      template = args[0]
      destination_dir = args.length==2 ? args[1] : nil
      
      # Extract project directory
      prj_dir = Nutella.current_project.dir

      # What kind of template are we handling?
      if is_template_a_local_dir? template
        add_local_template( template, template, prj_dir, destination_dir )
      elsif is_template_a_git_repo? template
        add_remote_template( template, prj_dir, destination_dir)
      elsif is_template_in_db? template
        add_central_template( template, prj_dir, destination_dir)
      else
        console.warn 'The specified template is not a valid nutella template'
      end
      
    end
    
    
    private
  
  
    def is_template_a_local_dir?( template_path )
      # Does the specified directory exist?
      return false unless File.directory? template_path
      validate_template template_path
    end
  
  
    def is_template_a_git_repo?( template_git_url )
      begin
        tmp_dest_dir = template_git_url[template_git_url.rindex('/')+1 .. template_git_url.length-5]
        clone_template_from_repo_to( template_git_url, tmp_dest_dir )
        return validate_template "#{Nutella.config['tmp_dir']}/#{tmp_dest_dir}"
      rescue
        return false 
      end
    end
  
  
    def is_template_in_db?( template_name )
      begin
        repo = extract_remote_repo_url template_name
        return is_template_a_git_repo? repo
      rescue
        return false
      end
    end


    def add_local_template ( template, template_dir, prj_dir, dest_dir_name)
      template_nutella_file_json = JSON.parse(IO.read("#{template_dir}/nutella.json"))
    
      # If destination is not specified, set it to the template name
      if dest_dir_name.nil?
        dest_dir_name = template_nutella_file_json['name']
      end
      # Am I trying to copy onto a template that already exists?
      if template_nutella_file_json['type']=='bot'
        # Look into bots folder
        dest_dir = "#{prj_dir}/bots/#{dest_dir_name}"
      else
        # Look into interfaces folder
        dest_dir = "#{prj_dir}/interfaces/#{dest_dir_name}"
      end
      if File.directory?(dest_dir)
        console.error("Destination folder #{dest_dir} already exists! Can't add template #{template}")
        return
      end

      # If all is good, copy the template to dest_dir...
      FileUtils.copy_entry template_dir, dest_dir

      # ... and remove nutella.json and .git folder if they exist
      File.delete "#{dest_dir}/nutella.json" if File.exist? "#{dest_dir}/nutella.json"
      FileUtils.rm_rf "#{dest_dir}/.git"

      # Make the user feel happy and accomplished! :)
      console.success("Installed template: #{template} as #{dest_dir_name}")
    end
  
  
    def add_remote_template ( template, prj_dir, dest_dir)
      template_name = template[template.rindex('/')+1 .. template.length-5]
      template_dir = "#{Nutella.config['tmp_dir']}/#{template_name}"
      add_local_template( template, template_dir, prj_dir, dest_dir )
    end
  
  
    def add_central_template( template_name, prj_dir, dest_dir)
      template_dir = "#{Nutella.config['tmp_dir']}/#{template_name}"
      add_local_template( template_name, template_dir, prj_dir, dest_dir )
    end
  
  
    def clone_template_from_repo_to(template, dest_dir)
      clean_tmp_dir
      Dir.mkdir Nutella.config['tmp_dir']  unless Dir.exists? Nutella.config['tmp_dir']
      Git.clone(template, dest_dir, :path => Nutella.config['tmp_dir'])
    end


    def extract_remote_repo_url( template_name )
      uri = URI.parse "https://raw.githubusercontent.com/nutella-framework/nutella_framework/templates-database/#{template_name}.json"
      nutella_json = JSON.parse Net::HTTP.get uri
      nutella_json['repo']
    end
  
  
    def clean_tmp_dir
      FileUtils.rm_rf "#{Nutella.config['tmp_dir']}"
    end
  
  end
  
end

