# Nutella main script

require_relative 'nutella-cli'

NUTELLA_VERSION = "0.0.1"
NUTELLA_HOME = ENV['NUTELLA_HOME']


NutellaCLI.printPrompt
args = ARGV.dup
args.shift
NutellaCLI.executeCommand(ARGV.first, args)
puts ""

