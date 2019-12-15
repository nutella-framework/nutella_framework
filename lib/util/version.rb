# frozen_string_literal: true

module Nutella
  class Version
    def self.get
      File.open("#{Config.file['src_dir']}VERSION", 'rb').read
    end
  end
end
