# This handles the list of running instances of Nutella
# The list is uniquely maintained inside a file
require 'singleton'
require 'json'
require 'set'

module Nutella
  
  class RunList
    
    RUN_LIST_FILE=File.dirname(__FILE__)+"/../../runlist.json"
    
    include Singleton
    
    def add?(runid)
      begin
        result = JSON.parse(IO.read(RUN_LIST_FILE)).to_set.add? runid
      rescue
        # No file, create one
        result = [runid].to_set
      end
      if result!=nil
        File.open(RUN_LIST_FILE, "w") do |f|
          f.write(JSON.pretty_generate(result.to_a))
        end
      end
      result
    end

    def delete?(runid)
      begin
        result = JSON.parse(IO.read(RUN_LIST_FILE)).to_set.delete? runid
      rescue
        removeRunListFile
        result = nil # List is empty, so nil
      end
      if result!=nil
        File.open(RUN_LIST_FILE, "w") do |f|
          f.write(JSON.pretty_generate(result.to_a))
        end
      end
      result
    end

    def include?(runid)
      begin
        return JSON.parse(IO.read(RUN_LIST_FILE)).include? runid
      rescue
        false # There is no file so it doens't include runid
      end
    end

    def empty?
      begin
        return JSON.parse(IO.read(RUN_LIST_FILE)).empty?
      rescue
        true # There is no file so list is empty
      end
    end

    def to_a(projectName=nil)
      begin
        list = JSON.parse(IO.read(RUN_LIST_FILE))
        # filter by project
        if projectName == nil
          return list
        else
          return list.select { |run| run.start_with?(projectName) }
        end
      rescue
        Array.new # There is no file or something went wrong
      end
    end
    
    private 
    
    def removeRunListFile
      File.delete(RUN_LIST_FILE) if File.exist?(RUN_LIST_FILE)
    end
    
  end
  
  
  def Nutella.runlist
    RunList.instance
  end
  
end



