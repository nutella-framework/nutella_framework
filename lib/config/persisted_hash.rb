require 'json'

module Nutella

  # This class behaves *similarly* to a regular Hash but it persists every operation
  # to the json file passed in the constructor. Not all Hash operations are supported
  # and we added some of our own.
  class PersistedHash

    def initialize(file)
      @config_file=file
    end

    def []( key )
      hash = loadHash
      hash[key]
    end

    def []=( key, val )
      hash = loadHash
      hash[key]=val
      storeHash hash
    end

    def delete( key )
      hash = loadHash
      return_value = hash.delete key
      storeHash hash
      return_value
    end

    def empty?
      hash = loadHash
      hash.empty?
    end

    def has_key?( key )
      hash = loadHash
      hash.has_key? key
    end

    def include?( key )
      has_key? key
    end

    def to_s
      hash = loadHash
      hash.to_s
    end

    def to_h
      hash = loadHash
      hash
    end

    def keys
      hash = loadHash
      hash.keys
    end

    def length
      hash = loadHash
      hash.length
    end

    # PersistedHash-only public methods

    # Adds a <key, value> pair to the PersistedHash _only if_
    # there is currently no value associated with the specified key.
    # @return [Boolean] false if the key already exists, true if the
    # <key, value> pair was added successfully
    def add?(key, val)
      hash = loadHash
      return false if hash.key? key
      hash[key] = val
      storeHash hash
      true
    end

    # Removes a <key, value> pair from the PersistedHash _only if_
    # there is currently a value associated with the specified key.
    # @return [Boolean] false if there is no value associated with
    # the specified key, true otherwise
    def delete?( key )
      hash = loadHash
      return false if hash.delete(key).nil?
      storeHash hash
      true
    end

    private

    def storeHash(hash)
      File.open(@config_file, 'w+') do |f|
        f.write(JSON.pretty_generate(hash))
      end
      File.chmod(0777, @config_file)
    end

    def loadHash
      begin
        return JSON.parse IO.read @config_file
      rescue
        # File doesn't exist, return new empty Hash
        Hash.new
      end
    end

    def removeFile
      File.delete(@config_file) if File.exist?(@config_file)
    end

  end

end
