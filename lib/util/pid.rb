module PidFile
  
  # Cleans the pid file of a given process
  # @param [String] pid_file_path the file storing the pid file of the process
  # @return [Boolean] true if the pid file exists AND the process with that pid is still alive
  def PidFile.sanitize( pid_file_path )
    # Does the pid file exist?
    # If it does we try to see if the process with that pid is still alive
    if File.exist? pid_file_path
      pid_file = File.open(pid_file_path, 'rb')
      pid = pid_file.read.to_i
      pid_file.close
      begin
        # If this statement doesn't throw an exception then a process with
        # this pid is still alive so we do nothing and just return true
        Process.getpgid pid
        return true
      rescue
        # If there is an exception, there is no process with this pid
        # so we have a stale pid file that we need to remove
        File.delete pid_file_path
        return false
      end
    end
    # If there is no pid file, there is no process running
    false
  end

end