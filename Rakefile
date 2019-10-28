# encoding: utf-8

require 'rubygems'
require 'bundler'
begin
  Bundler.setup(:default, :development)
rescue Bundler::BundlerError => e
  $stderr.puts e.message
  $stderr.puts "Run `bundle install` to install missing gems"
  exit e.status_code
end
require 'rake'

require 'jeweler'
Jeweler::Tasks.new do |gem|
  # gem is a Gem::Specification... see http://guides.rubygems.org/specification-reference/ for more options
  gem.name = "nutella_framework"
  gem.homepage = "https://github.com/nutella-framework/nutella_framework"
  gem.license = "MIT"
  gem.summary = %Q{A rails-inspired framework for RoomApps}
  gem.description = %Q{utella is a framework to create and run RoomApps}
  gem.email = "tebemis@gmail.com"
  gem.authors = ["Alessandro Gnoli"]
  gem.required_ruby_version = "~> 2.0"
  # dependencies defined in Gemfile
end
Jeweler::RubygemsDotOrgTasks.new

require 'rspec/core'
require 'rspec/core/rake_task'
RSpec::Core::RakeTask.new(:spec) do |spec|
  spec.pattern = FileList['spec/**/*_spec.rb']
end

task :default => :spec

require 'yard'
YARD::Rake::YardocTask.new