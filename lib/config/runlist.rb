require_relative 'config'



def addToRunsList(runid)
  nutella.loadConfig
  begin
    nutella.runs!  
    # we have a runs key, is there a runid key?
    if nutella.runs.include?(runid)
      return false;
    else
      nutella.runs.push(runid)
      nutella.storeConfig
    end
  rescue
    # There is no nutella.runs key
    nutella.runs = [runid]
    nutella.storeConfig
  end
end

def removeFromRunsList(runid)
  nutella.loadConfig
  begin
    nutella.runs!  
    # we have a runs key, is there a runid key?
    if nutella.runs.include?(runid)
      # If so remove it
      nutella.runs.delete(runid)
      nutella.storeConfig
      # Return removed element
      return runid
    end
    nil
  rescue
    # There is no nutella.runs key
    nil
  end
end

def isInRunsList?(runid)
  nutella.loadConfig
  begin
    nutella.runs!  
    # we have a runs key, is there a runid key?
    return nutella.runs.include?(runid)
  rescue
    # There is no nutella.runs key so the answer is false
  end
  false
end

def isRunsListEmpty?
  nutella.loadConfig
  begin
    nutella.runs!  
    # we have a runs key, is the list empty?
    return nutella.runs.empty?
  rescue
    # There is no nutella.runs key so the answer is true
  end
  true
end

def getRunsList(projectName=nil)
  nutella.loadConfig
  begin
    nutella.runs!  
    # we have a runs key, proceed
    if projectName == nil
      return nutella.runs
    else
      return nutella.runs.select { |run| run.start_with?(projectName) }
    end
    
  rescue
    # There is no nutella.runs key so return an empty list of runs
  end
end