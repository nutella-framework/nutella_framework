# Generated by jeweler
# DO NOT EDIT THIS FILE DIRECTLY
# Instead, edit Jeweler::Tasks in Rakefile, and run 'rake gemspec'
# -*- encoding: utf-8 -*-
# stub: nutella_framework 0.2.1 ruby lib

Gem::Specification.new do |s|
  s.name = "nutella_framework"
  s.version = "0.2.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib"]
  s.authors = ["Alessandro Gnoli"]
  s.date = "2015-01-20"
  s.description = "Nutella is a framework to build and run \"Internet of Things\"-like learning applications"
  s.email = "tebemis@gmail.com"
  s.executables = ["nutella"]
  s.extra_rdoc_files = [
    "LICENSE",
    "README.md"
  ]
  s.files = [
    ".document",
    ".travis.yml",
    "Gemfile",
    "LICENSE",
    "README.md",
    "Rakefile",
    "VERSION",
    "actors/main_interface/main_interface_bot.rb",
    "actors/main_interface/public/index.html",
    "actors/main_interface/startup",
    "actors/main_interface/views/index.erb",
    "actors/main_interface/views/not_found_404.erb",
    "bin/nutella",
    "lib/cli/nutella_cli.rb",
    "lib/config/config.rb",
    "lib/config/current_project.rb",
    "lib/config/persisted_hash.rb",
    "lib/config/runlist.rb",
    "lib/core/command.rb",
    "lib/core/commands/broker.rb",
    "lib/core/commands/checkup.rb",
    "lib/core/commands/help.rb",
    "lib/core/commands/install.rb",
    "lib/core/commands/new.rb",
    "lib/core/commands/runs.rb",
    "lib/core/commands/start.rb",
    "lib/core/commands/stop.rb",
    "lib/core/nutella_core.rb",
    "lib/core/run_command.rb",
    "lib/core/tmux.rb",
    "lib/logging/nutella_logger-remote.rb",
    "lib/logging/nutella_logger.rb",
    "lib/logging/nutella_logging.rb",
    "lib/nutella_framework.rb",
    "nutella_framework.gemspec",
    "test/config/test_config.rb",
    "test/config/test_project.rb",
    "test/config/test_runlist.rb",
    "test/helper.rb",
    "test/logging/test_logging.rb"
  ]
  s.homepage = "https://github.com/nutella-framework/nutella_framework"
  s.licenses = ["MIT"]
  s.rubygems_version = "2.2.2"
  s.summary = "IoT-like learning applications framework"

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<ansi>, [">= 1.4.3", "~> 1.4"])
      s.add_runtime_dependency(%q<semantic>, [">= 1.3", "~> 1.3"])
      s.add_runtime_dependency(%q<logging>, [">= 1.8.2", "~> 1.8"])
      s.add_runtime_dependency(%q<git>, [">= 1.2.8", "~> 1.2"])
      s.add_runtime_dependency(%q<sinatra>, [">= 1.4.5", "~> 1.4.5"])
      s.add_runtime_dependency(%q<nokogiri>, [">= 1.6.3", "~> 1.6.3"])
      s.add_development_dependency(%q<shoulda>, [">= 3", "~> 3"])
      s.add_development_dependency(%q<yard>, [">= 0.8.7", "~> 0.8"])
      s.add_development_dependency(%q<rdoc>, [">= 4.0", "~> 4.0"])
      s.add_development_dependency(%q<bundler>, [">= 1.0", "~> 1.0"])
      s.add_development_dependency(%q<jeweler>, [">= 2.0.1", "~> 2.0.1"])
      s.add_development_dependency(%q<simplecov>, [">= 0", "~> 0"])
    else
      s.add_dependency(%q<ansi>, [">= 1.4.3", "~> 1.4"])
      s.add_dependency(%q<semantic>, [">= 1.3", "~> 1.3"])
      s.add_dependency(%q<logging>, [">= 1.8.2", "~> 1.8"])
      s.add_dependency(%q<git>, [">= 1.2.8", "~> 1.2"])
      s.add_dependency(%q<sinatra>, [">= 1.4.5", "~> 1.4.5"])
      s.add_dependency(%q<nokogiri>, [">= 1.6.3", "~> 1.6.3"])
      s.add_dependency(%q<shoulda>, [">= 3", "~> 3"])
      s.add_dependency(%q<yard>, [">= 0.8.7", "~> 0.8"])
      s.add_dependency(%q<rdoc>, [">= 4.0", "~> 4.0"])
      s.add_dependency(%q<bundler>, [">= 1.0", "~> 1.0"])
      s.add_dependency(%q<jeweler>, [">= 2.0.1", "~> 2.0.1"])
      s.add_dependency(%q<simplecov>, [">= 0", "~> 0"])
    end
  else
    s.add_dependency(%q<ansi>, [">= 1.4.3", "~> 1.4"])
    s.add_dependency(%q<semantic>, [">= 1.3", "~> 1.3"])
    s.add_dependency(%q<logging>, [">= 1.8.2", "~> 1.8"])
    s.add_dependency(%q<git>, [">= 1.2.8", "~> 1.2"])
    s.add_dependency(%q<sinatra>, [">= 1.4.5", "~> 1.4.5"])
    s.add_dependency(%q<nokogiri>, [">= 1.6.3", "~> 1.6.3"])
    s.add_dependency(%q<shoulda>, [">= 3", "~> 3"])
    s.add_dependency(%q<yard>, [">= 0.8.7", "~> 0.8"])
    s.add_dependency(%q<rdoc>, [">= 4.0", "~> 4.0"])
    s.add_dependency(%q<bundler>, [">= 1.0", "~> 1.0"])
    s.add_dependency(%q<jeweler>, [">= 2.0.1", "~> 2.0.1"])
    s.add_dependency(%q<simplecov>, [">= 0", "~> 0"])
  end
end

