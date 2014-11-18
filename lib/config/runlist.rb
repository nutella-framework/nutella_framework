# This handles the list of running instances of Nutella
# The list is uniquely maintained inside a file
require 'singleton'
require 'json'

module Nutella
  
  class RunList
    
    RUN_LIST_FILE=File.dirname(__FILE__)+"/../../runlist.json"
    
    include Singleton

    # Adds a run to the list
    # Returns false if the run already exists
    def add?(run_id, prj_path)
      begin
        file_h = JSON.parse(IO.read(RUN_LIST_FILE))
        return false if file_h.key? run_id
        file_h[run_id] = prj_path
      rescue
        # No file, create one
        file_h = Hash[run_id, prj_path]
      end
      write_hash_to_file file_h
    end

    def delete?(run_id)
      begin
        file_h = JSON.parse(IO.read(RUN_LIST_FILE))
        return false if file_h.delete(run_id).nil?
        write_hash_to_file file_h
      rescue
        # No file or empty file, so delete is never successful
        removeRunListFile
        false
      end
    end

    def include?(run_id)
      begin
        file_h = JSON.parse(IO.read(RUN_LIST_FILE))
        file_h.key? run_id
      rescue
        # No file, so doesn't include anything
        false
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
          return list.keys
        else
          return list.keys.select { |run| run.start_with?(projectName) }
        end
      rescue
        Array.new # There is no file or something went wrong
      end
    end

    def length
      to_a.length
    end
    
    def extractRunId(run)
      run.to_s.empty? ? Nutella.currentProject.config['name'] : "#{Nutella.currentProject.config['name']}_#{run}"
    end
    
    private 
    
    def removeRunListFile
      File.delete(RUN_LIST_FILE) if File.exist?(RUN_LIST_FILE)
    end
    
    def write_hash_to_file(result)
      if result!=nil
        File.open(RUN_LIST_FILE, "w+") do |f|
          f.write(JSON.pretty_generate(result))
        end
        File.chmod(0777, RUN_LIST_FILE)
      end
      true
    end
    
  end
  
  
  def Nutella.runlist
    RunList.instance
  end
  
end



