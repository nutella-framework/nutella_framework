require_relative 'command'
require 'json'

module Nutella
  # This class describes a template command which can be either install or template
  # It is mostly a commodity class for code reuse.

  class TemplateCommand < Command

    def run(args=nil)
      console.error 'Running generic TemplateCommand!!! WAT?'
    end


    # Validates a template in a certain folder
    # @param [String]  dir the directory where the template is stored
    def validate_template( dir )
      # Parse and validate the template's nutella.json file
      begin
        template_nutella_file_json = JSON.parse(IO.read("#{dir}/nutella.json"))
      rescue
        return false
      end
      return false unless validate_nutella_file_json template_nutella_file_json
      # If template is a bot, perform the appropriate checks
      if template_nutella_file_json['type']=='bot'
        # Is there a mandatory 'startup' script and is it executable
        return false unless File.executable? "#{dir}/startup"
      end
      # If template is an interface, perform the appropriate checks
      if template_nutella_file_json['type']=='interface'
        # Is there the mandatory index.html file
        return false unless File.exist? "#{dir}/index.html"
      end
      true
    end


    def validate_nutella_file_json( json )
      !json['name'].nil? && !json['version'].nil? && !json['type'].nil? && (json['type']=='bot' || json['type']=='interface')
    end


  end

end