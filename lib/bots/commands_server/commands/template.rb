require_relative 'meta/template_command'

module Nutella

  class Template < TemplateCommand
    @description = 'Creates and validates nutella components templates'

    def run(args=nil)

      # If no argument then we just display info about the command
      if args==nil || args.length < 2
        display_help
        return
      end

      # Extract sub command
      sub_command = args[0]
      param = args[1]

      if sub_command == 'validate'
        validate_template_sub_command param
      end

      if sub_command == 'create'
        create_template_sub_command param
      end

    end

    private

    def display_help
      console.warn 'You need to specify a sub command.'
      console.warn 'create <template_name>    creates a template skeleton in the folder with the same name'
      console.warn 'validate  <temple_dir>    validates a template that already exists'
    end


    def validate_template_sub_command( dir )
      if validate_template dir
        console.success 'This directory appears to be a valid nutella template'
      else
        console.warn 'Looks like this directory is not a valid nutella template'
      end
    end


    def create_template_sub_command( template_name )
      @default_version = '0.1.0'
      @default_type = 'bot'
      # Get template parameters from command line
      name = prompt_and_read_name template_name
      version = prompt_and_read_version
      type = prompt_and_read_type
      description = prompt_and_read_description type
      repo = prompt_and_read_repo
      # Build JSON
      json = build_nutella_json( name, version, type, description, repo )
      # Show confirmation and read
      prompt_and_read_confirm json

    end


    def prompt_and_read_name(template_name)
      puts 'What is the name of your template?'
      print "(#{template_name}) "
      c = $stdin.gets.chomp!
      c.empty? ? template_name : c
    end

    def prompt_and_read_version
      prompt_and_read 'What is the version of your template?', @default_version
    end

    def prompt_and_read_type
      prompt_and_read 'Are you creating a template for a "bot" or "interface"?', @default_type
    end

    def prompt_and_read( prompt, default )
      puts prompt
      print "(#{default}) "
      c = $stdin.gets.chomp!
      c.empty? ? default : c
    end

    def prompt_and_read_description(type)
      puts "Do you want to provide a short description for your #{type} template?"
      print '(optional, hit enter if no description) '
      $stdin.gets.chomp!
    end

    def prompt_and_read_repo
      puts 'Do you want to provide a git repository for your template?'
      print '(optional, hit enter if no repo) '
      $stdin.gets.chomp!
    end

    def prompt_and_read_confirm(json)
      puts 'Looks good?'
      puts JSON.pretty_generate json
      print '(yes/no) '
      confirm = $stdin.gets.chomp!
      if confirm=='yes'
        create_template json
      else
        console.warn 'Template creation aborted'
      end
    end

    def create_template( json )
      # First validate the JSON
      unless validate_nutella_file_json json
        console.error 'Something was wrong with your nutella.json file. Template creation aborted'
        return
      end
      # Check that the template directory doesn't already exist
      template_dir = File.join( Dir.pwd, json['name'] )
      if File.directory? template_dir
        console.error("The directory #{template_dir} already exists! Can't create template #{json[:name]}")
        return
      end
      # Create template directory and files
      create_template_files(json, template_dir)
    end

    def create_template_files(json, template_dir)
      # Create directory
      Dir.mkdir template_dir
      # Create nutella.json file
      File.open("#{template_dir}/nutella.json", 'w') { |f| f.write(JSON.pretty_generate json) }
      # Add bot/interface specific files
      FileUtils.copy(File.join(Nutella::NUTELLA_SRC, 'data/startup'), template_dir) if json['type']=='bot'
      FileUtils.copy(File.join(Nutella::NUTELLA_SRC, 'data/index.html'), template_dir) if json['type']=='interface'
      console.success "Template #{json['name']} created successfully!"
    end


    def build_nutella_json( name, version, type, description, repo )
      json = { 'name' => name, 'version' => version, 'type' => type}
      unless description.empty?
        json['description'] = description
      end
      unless repo.empty?
        json['repo'] = repo
      end
      json
    end

  end

end
