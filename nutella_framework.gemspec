# Generated by jeweler
# DO NOT EDIT THIS FILE DIRECTLY
# Instead, edit Jeweler::Tasks in Rakefile, and run 'rake gemspec'
# -*- encoding: utf-8 -*-
# stub: nutella_framework 2.0.0.alpha1 ruby lib

Gem::Specification.new do |s|
  s.name = "nutella_framework".freeze
  s.version = "2.0.0.alpha1"

  s.required_rubygems_version = Gem::Requirement.new("> 1.3.1".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Alessandro Gnoli".freeze]
  s.date = "2019-11-11"
  s.description = "utella is a framework to create and run RoomApps".freeze
  s.email = "tebemis@gmail.com".freeze
  s.executables = ["nutella".freeze]
  s.extra_rdoc_files = [
    "LICENSE",
    "README.md"
  ]
  s.files = [
    ".document",
    ".rspec",
    ".travis.yml",
    "Dockerfile.rubyimage",
    "Gemfile",
    "LICENSE",
    "README.md",
    "Rakefile",
    "VERSION",
    "bin/nutella",
    "lib/bots/binary_files_manager/bin_files_mngr.rb",
    "lib/bots/commands_server/commands/broker.rb",
    "lib/bots/commands_server/commands/compile.rb",
    "lib/bots/commands_server/commands/dependencies.rb",
    "lib/bots/commands_server/commands/install.rb",
    "lib/bots/commands_server/commands/meta/command.rb",
    "lib/bots/commands_server/commands/meta/run_command.rb",
    "lib/bots/commands_server/commands/meta/template_command.rb",
    "lib/bots/commands_server/commands/new.rb",
    "lib/bots/commands_server/commands/reset.rb",
    "lib/bots/commands_server/commands/runs.rb",
    "lib/bots/commands_server/commands/start.rb",
    "lib/bots/commands_server/commands/stop.rb",
    "lib/bots/commands_server/commands/template.rb",
    "lib/bots/commands_server/startup.rb",
    "lib/bots/commands_server/util/components_list.rb",
    "lib/bots/commands_server/util/current_app_utils.rb",
    "lib/bots/commands_server/util/runlist.rb",
    "lib/bots/main_interface/main_interface_bot.rb",
    "lib/bots/main_interface/public/index.html",
    "lib/bots/main_interface/views/index.erb",
    "lib/bots/main_interface/views/not_found_404.erb",
    "lib/bots/room_debugger/README.md",
    "lib/bots/room_debugger/css/bootstrap-theme.css",
    "lib/bots/room_debugger/css/bootstrap-theme.css.map",
    "lib/bots/room_debugger/css/bootstrap-theme.min.css",
    "lib/bots/room_debugger/css/bootstrap.css",
    "lib/bots/room_debugger/css/bootstrap.css.map",
    "lib/bots/room_debugger/css/bootstrap.min.css",
    "lib/bots/room_debugger/fonts/glyphicons-halflings-regular.eot",
    "lib/bots/room_debugger/fonts/glyphicons-halflings-regular.svg",
    "lib/bots/room_debugger/fonts/glyphicons-halflings-regular.ttf",
    "lib/bots/room_debugger/fonts/glyphicons-halflings-regular.woff",
    "lib/bots/room_debugger/fonts/glyphicons-halflings-regular.woff2",
    "lib/bots/room_debugger/index.html",
    "lib/bots/room_debugger/js/bootstrap.js",
    "lib/bots/room_debugger/js/bootstrap.min.js",
    "lib/bots/room_debugger/js/jquery.min.js",
    "lib/bots/room_debugger/js/npm.js",
    "lib/bots/room_debugger/js/nutella_lib.js",
    "lib/bots/room_debugger/main.css",
    "lib/bots/room_debugger/main.js",
    "lib/bots/room_debugger/nutella.json",
    "lib/bots/room_debugger/package.json",
    "lib/bots/room_debugger/room_places_simulator.js",
    "lib/bots/runs_list_bot/runs_list_bot.rb",
    "lib/cli/cli.rb",
    "lib/cli/commands/checkup.rb",
    "lib/cli/commands/help.rb",
    "lib/cli/commands/meta/command.rb",
    "lib/cli/commands/new.rb",
    "lib/cli/commands/server.rb",
    "lib/cli/commands/server/framework_bots.rb",
    "lib/cli/commands/server/mongo.rb",
    "lib/cli/commands/server/mqtt_broker.rb",
    "lib/cli/commands/start.rb",
    "lib/cli/commands/stop.rb",
    "lib/cli/logger.rb",
    "lib/config/config.rb",
    "lib/config/persisted_hash.rb",
    "lib/nutella_framework.rb",
    "lib/templates/index.html",
    "lib/templates/startup",
    "nutella_framework.gemspec",
    "spec/cli/commands/checkup_spec.rb",
    "spec/cli/commands/help_spec.rb",
    "spec/cli/commands/server_spec.rb",
    "spec/config/config_spec.rb",
    "spec/config/persisted_hash_spec.rb",
    "spec/spec_helper.rb"
  ]
  s.homepage = "https://github.com/nutella-framework/nutella_framework".freeze
  s.licenses = ["MIT".freeze]
  s.required_ruby_version = Gem::Requirement.new("~> 2.0".freeze)
  s.rubygems_version = "3.0.6".freeze
  s.summary = "A rails-inspired framework for RoomApps".freeze

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<ansi>.freeze, ["~> 1.5"])
      s.add_runtime_dependency(%q<bson>.freeze, ["~> 3.0"])
      s.add_runtime_dependency(%q<docker-api>.freeze, ["~> 1.34"])
      s.add_runtime_dependency(%q<git>.freeze, ["~> 1.2"])
      s.add_runtime_dependency(%q<nutella_lib>.freeze, ["~> 0.6"])
      s.add_runtime_dependency(%q<nokogiri>.freeze, ["~> 1.6"])
      s.add_runtime_dependency(%q<semantic>.freeze, ["~> 1.4"])
      s.add_runtime_dependency(%q<sinatra>.freeze, ["~> 1.4"])
      s.add_runtime_dependency(%q<sinatra-cross_origin>.freeze, ["~> 0.3.2"])
      s.add_runtime_dependency(%q<thin>.freeze, ["~> 1.6"])
      s.add_development_dependency(%q<yard>.freeze, ["~> 0.9.11"])
      s.add_development_dependency(%q<rdoc>.freeze, ["~> 4.0"])
      s.add_development_dependency(%q<bundler>.freeze, ["~> 2.0"])
      s.add_development_dependency(%q<jeweler>.freeze, ["~> 2.3"])
    else
      s.add_dependency(%q<ansi>.freeze, ["~> 1.5"])
      s.add_dependency(%q<bson>.freeze, ["~> 3.0"])
      s.add_dependency(%q<docker-api>.freeze, ["~> 1.34"])
      s.add_dependency(%q<git>.freeze, ["~> 1.2"])
      s.add_dependency(%q<nutella_lib>.freeze, ["~> 0.6"])
      s.add_dependency(%q<nokogiri>.freeze, ["~> 1.6"])
      s.add_dependency(%q<semantic>.freeze, ["~> 1.4"])
      s.add_dependency(%q<sinatra>.freeze, ["~> 1.4"])
      s.add_dependency(%q<sinatra-cross_origin>.freeze, ["~> 0.3.2"])
      s.add_dependency(%q<thin>.freeze, ["~> 1.6"])
      s.add_dependency(%q<yard>.freeze, ["~> 0.9.11"])
      s.add_dependency(%q<rdoc>.freeze, ["~> 4.0"])
      s.add_dependency(%q<bundler>.freeze, ["~> 2.0"])
      s.add_dependency(%q<jeweler>.freeze, ["~> 2.3"])
    end
  else
    s.add_dependency(%q<ansi>.freeze, ["~> 1.5"])
    s.add_dependency(%q<bson>.freeze, ["~> 3.0"])
    s.add_dependency(%q<docker-api>.freeze, ["~> 1.34"])
    s.add_dependency(%q<git>.freeze, ["~> 1.2"])
    s.add_dependency(%q<nutella_lib>.freeze, ["~> 0.6"])
    s.add_dependency(%q<nokogiri>.freeze, ["~> 1.6"])
    s.add_dependency(%q<semantic>.freeze, ["~> 1.4"])
    s.add_dependency(%q<sinatra>.freeze, ["~> 1.4"])
    s.add_dependency(%q<sinatra-cross_origin>.freeze, ["~> 0.3.2"])
    s.add_dependency(%q<thin>.freeze, ["~> 1.6"])
    s.add_dependency(%q<yard>.freeze, ["~> 0.9.11"])
    s.add_dependency(%q<rdoc>.freeze, ["~> 4.0"])
    s.add_dependency(%q<bundler>.freeze, ["~> 2.0"])
    s.add_dependency(%q<jeweler>.freeze, ["~> 2.3"])
  end
end

