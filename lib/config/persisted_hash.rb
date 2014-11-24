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
      hash = load_hash
      hash[key]
    end

    def []=( key, val )
      hash = load_hash
      hash[key]=val
      store_hash hash
    end

    def delete( key )
      hash = load_hash
      return_value = hash.delete key
      store_hash hash
      return_value
    end

    def empty?
      hash = load_hash
      hash.empty?
    end

    def has_key?( key )
      hash = load_hash
      hash.has_key? key
    end

    def include?( key )
      has_key? key
    end

    def to_s
      hash = load_hash
      hash.to_s
    end

    def to_h
      load_hash
    end

    def keys
      hash = load_hash
      hash.keys
    end

    def length
      hash = load_hash
      hash.length
    end

    # PersistedHash-only public methods

    # Adds a <key, value> pair to the PersistedHash _only if_
    # there is currently no value associated with the specified key.
    # @return [Boolean] false if the key already exists, true if the
    # <key, value> pair was added successfully
    def add?(key, val)
      hash = load_hash
      return false if hash.key? key
      hash[key] = val
      store_hash hash
      true
    end

    # Removes a <key, value> pair from the PersistedHash _only if_
    # there is currently a value associated with the specified key.
    # @return [Boolean] false if there is no value associated with
    # the specified key, true otherwise
    def delete?( key )
      hash = load_hash
      return false if hash.delete(key).nil?
      store_hash hash
      true
    end

    private

    def store_hash(hash)
      File.open(@config_file, 'w+') do |f|
        f.write(JSON.pretty_generate(hash))
      end
      File.chmod(0777, @config_file)
    end

    def load_hash
      begin
        return JSON.parse IO.read @config_file
      rescue
        # File doesn't exist, return new empty Hash
        Hash.new
      end
    end

    def remove_file
      File.delete(@config_file) if File.exist?(@config_file)
    end

  end

end
