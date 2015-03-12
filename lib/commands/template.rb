require 'commands/meta/template_command'

module Nutella

  class Template < TemplateCommand
    @description = 'Helps create and validate templates'

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
      console.info 'You need to specify a sub command.'
      console.info 'create <template_name>    creates a template skeleton in the folder with the same name'
      console.info 'validate  <temple_dir>    validates a template that already exists'
    end


    def validate_template_sub_command( dir )
      if validate_template dir
        console.success 'This directory appears to be a valid nutella template'
      else
        console.warn 'Looks like this directory is not a valid nutella template'
      end
    end


    def create_template_sub_command( name_d )
      ver_d = '0.1.0'
      type_d = 'bot'

      # Name
      puts 'What is the name of your template?'
      print "(#{name_d}) "
      c = $stdin.gets.chomp!
      name = c.empty? ? name_d : c
      # Version
      puts 'What is the version of your template?'
      print "(#{ver_d}) "
      c = $stdin.gets.chomp!
      version = c.empty? ? ver_d : c
      # Type
      puts 'Are you creating a template for a "bot" or "interface"?'
      print "(#{type_d}) "
      c = $stdin.gets.chomp!
      type = c.empty? ? type_d : c
      # Description
      puts "Do you want to provide a short description for your #{type} template?"
      print '(optional, hit enter if no description) '
      description = $stdin.gets.chomp!
      # Repo
      puts 'Do you want to provide a git repository for your template?'
      print '(optional, hit enter if no repo) '
      repo = $stdin.gets.chomp!

      # Build JSON and show confirmation
      puts 'Looks good?'
      json = build_nutella_json( name, version, type, description, repo )
      puts JSON.pretty_generate json
      print '(yes/no) '

      # If user confirms, create template
      confirm = $stdin.gets.chomp!
      if confirm=='yes'
        create_template_files json
      else
        console.warn 'Template creation aborted'
      end

    end


    def create_template_files( json )
      # First validate the JSON
      unless validate_nutella_file_json json
        console.error 'Something was wrong with your nutella.json file. Template creation aborted'
        return
      end
      # Assemble destination directory
      template_dir = File.join( Dir.pwd, json['name'] )
      # Check that the directory doesn't exist already
      if File.directory?(template_dir)
        console.error("The directory #{template_dir} already exists! Can't create template #{json[:name]}")
        return
      end
      # Create directory
      Dir.mkdir template_dir
      # Create nutella.json file
      File.open("#{template_dir}/nutella.json", 'w') { |f| f.write(JSON.pretty_generate json) }
      # Add bot/interface specific files
      bot_specific_file = nil
      bot_specific_file = File.join( Nutella::NUTELLA_HOME, 'data/startup' ) if json['type']=='bot'
      bot_specific_file = File.join( Nutella::NUTELLA_HOME, 'data/index.html' ) if json['type']=='interface'
      FileUtils.copy( bot_specific_file, template_dir )
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
