# frozen_string_literal: true

require 'docker-api'

module Nutella
  class DockerBotStarter
    def start_framework_level_bot(name)
      container_name = "nutella_f_#{name}"
      dir = "#{Nutella::NUTELLA_SRC}lib/bots/#{bot_name}"
      start_bot(:framework, name, container_name, bot_dir, true)
    end

    def start_app_level_bot(app, bot_name, restart = false)
      container_name = "nutella_a_#{app.id}_#{bot_name}"
      dir = "#{app.path}/bots/#{bot_name}"
      start_bot(:app, bot_name, container_name, dir, restart, app.id)
    end

    def start_run_level_bot(app, run_id, bot_name, restart = false)
      container_name = "nutella_r_#{app.id}_#{run_id}_#{bot_name}"
      dir = "#{app.path}/bots/#{bot_name}"
      start_bot(:run, bot_name, container_name, dir, restart, app.id, run_id)
    end

    private

    def start_bot(level, _name, container_name, dir, restart, app_id = nil, run_id = nil)
      # Remove any other containers with the same name to avoid conflicts
      begin
        old_c = Docker::Container.get(container_name)
        old_c.delete(force: true)
      rescue Docker::Error::NotFoundError
        # If the container is not there we just proceed
      end
      # Select runtime
      # TODO error out on wrong runtime!!!
      runtime = parse_runtime(dir)
      cmd = build_cmd(runtime, level, app_id, run_id)
      image = parse_image(runtime)
      c = create_container(image, cmd, container_name, dir, restart)
      c.start
    end

    # Finds the runtime based on the suffix of startup script
    def parse_runtime(dir)
      return :ruby if File.file?("#{dir}/startup.rb")
      return :js if File.file?("#{dir}/startup.js")

      :shell
    end

    def parse_image(runtime)
      map = {
        ruby: 'nutella_ruby:1.0.0',
        js: 'nutella_js:1.0.0'
      }
      map[runtime]
    end

    # Builds the command based on the runtime and level of the bot
    def build_cmd(runtime, level, app_id = nil, run_id = nil)
      cmd = case runtime
            when :ruby then ['ruby', 'startup.rb']
            when :js then ['node', 'startup.js']
      end
      case level
      when :framework then cmd << Config.file['broker']

      when :app then cmd << [Config.file['broker'], app_id]

      when :run then cmd << [Config.file['broker'], app_id, run_id]

      end
    end

    # Creates the right container based on runtime
    def create_container(image, cmd, container_name, dir, restart)
      host_config = {
        'Binds' => ["#{dir}:/app"]
      }
      host_config['RestartPolicy'] = { 'Name' => 'unless-stopped' } if restart
      Docker::Container.create(
        'Cmd': cmd,
        'Image': image,
        'name': container_name,
        'Detach': true,
        'HostConfig': host_config
      )
    end
  end
end
