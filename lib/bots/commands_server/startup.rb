# frozen_string_literal: true

# Commands server
# Connects to the MQTT broker, listens for commands (basically RPC over MQTT),
# executes the commands, and returns the output to the client
# This is the heart of nutella and implements all the nutella logic really

require 'nutella_lib'

# Load all available commands
Dir["#{File.dirname(__FILE__)}/commands/*.rb"].each do |file|
  require_relative "commands/#{File.basename(file, File.extname(file))}"
end

# Parse command line arguments and initialize nutella
broker = nutella.f.parse_args ARGV
component_id = nutella.f.extract_component_id
nutella.f.init(broker, component_id)

# Commands handler
nutella.f.net.handle_requests('commands', lambda do |message, _component_id|
  nutella.log.info("[#{Time.now}] Command received: #{message}")
  execute_command(message['command'], message['opts'])
end)

# This function executes a particular command
# @param command [String] the name of the command
# @param opts [Hash] parameters passed to the command
def execute_command(command, opts = nil)
  if command_exists?(command)
    begin
      return Object.const_get("Nutella::#{command.capitalize}").new.run(opts)
    rescue StandardError => e
      puts e.backtrace
      return { success: false, message: "Unexpected failure of command #{command}", exception: e }
    end
  else
    { success: false, message: "Unknown command #{command}" }
  end
end

# This function checks that a particular command exists
# @return [Boolean] true if the command exists, false otherwise
def self.command_exists?(command)
  Nutella.const_get("Nutella::#{command.capitalize}").is_a?(Class) &&
    Nutella.const_get("Nutella::#{command.capitalize}").method_defined?(:run)
rescue NameError
  false
end

nutella.log.success 'Starting commands server...'
nutella.f.net.listen
