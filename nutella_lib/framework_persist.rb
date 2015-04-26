require 'util/mongo_persisted_collection'
require 'util/json_file_persisted_collection'
require 'util/mongo_persisted_hash'
require 'util/json_file_persisted_hash'
require 'fileutils'


module Nutella

  module Framework

    # Implements basic persistence for framework-level components
    module Persist

      # @!group Framework-level APIs

      # This method returns a MongoDB-backed store (i.e. persistence)
      # for a collection (i.e. an Array)
      # @param [String] name the name of the store
      # @return [MongoPersistedCollection] a MongoDB-backed collection store
      def self.get_mongo_collection_store( name )
        MongoPersistedCollection.new Nutella.mongo_host, 'nutella', name
      end

      # This method returns a MongoDB-backed store (i.e. persistence)
      # for a single object (i.e. an Hash)
      # @param [String] name the name of the store
      # @return [MongoPersistedHash] a MongoDB-backed Hash store
      def self.get_mongo_object_store( name )
        MongoPersistedHash.new Nutella.mongo_host, 'nutella', 'fr_persisted_hashes', name
      end

      # This method returns a JSON-file-backed store (i.e. persistence)
      # for a collection (i.e. an Array)
      # @param [String] name the name of the store
      # @return [JSONFilePersistedCollection] a JSON-file-backed collection store
      def self.get_json_collection_store( name )
        dir_path = "#{ENV['HOME']}/.nutella/data/#{Nutella.component_id}"
        file_path = "#{dir_path}/#{name}.json"
        FileUtils.mkdir_p dir_path
        JSONFilePersistedCollection.new file_path
      end

      # This method returns a JSON-file-backed store (i.e. persistence)
      # for a single object (i.e. an Hash)
      # @param [String] name the name of the store
      # @return [JSONFilePersistedHash] a JSON-file-backed Hash store
      def self.get_json_object_store( name )
        dir_path = "#{ENV['HOME']}/.nutella/data/#{Nutella.component_id}"
        file_path = "#{dir_path}/#{name}.json"
        FileUtils.mkdir_p dir_path
        JSONFilePersistedHash.new file_path
      end

      # @!endgroup

      # ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

      # @!group Run-level APIs

      # This method returns a MongoDB-backed store
      # for a collection at the run level
      # @param [String] app_id
      # @param [String] run_id
      # @param [String] name the name of the store
      # @return [MongoPersistedCollection] a MongoDB-backed collection store
      def self.get_run_mongo_collection_store( app_id, run_id, name )
        MongoPersistedCollection.new Nutella.mongo_host, app_id, "#{run_id}/#{name}"
      end

      # This method returns a MongoDB-backed store
      # for a single object at the run level
      # @param [String] app_id
      # @param [String] run_id
      # @param [String] name the name of the store
      # @return [MongoPersistedHash] a MongoDB-backed Hash store
      def self.get_run_mongo_object_store( app_id, run_id, name )
        MongoPersistedHash.new Nutella.mongo_host, app_id, 'run_persisted_hashes', "#{run_id}/#{name}"
      end

      # This method returns a JSON-file-backed store
      # for a collection at the run level
      # @param [String] app_id
      # @param [String] run_id
      # @param [String] name the name of the store
      # @return [JSONFilePersistedCollection] a JSON-file-backed collection store
      def self.get_run_json_collection_store( app_id, run_id, name )
        dir_path = "#{ENV['HOME']}/.nutella/data/#{Nutella.component_id}/#{app_id}/#{run_id}"
        file_path = "#{dir_path}/#{name}.json"
        FileUtils.mkdir_p dir_path
        JSONFilePersistedCollection.new file_path
      end

      # This method returns a JSON-file-backed store
      # for a single object at the run level
      # @param [String] app_id
      # @param [String] run_id
      # @param [String] name the name of the store
      # @return [JSONFilePersistedHash] a JSON-file-backed Hash store
      def self.get_run_json_object_store( app_id, run_id, name )
        dir_path = "#{ENV['HOME']}/.nutella/data/#{Nutella.component_id}/#{app_id}/#{run_id}"
        file_path = "#{dir_path}/#{name}.json"
        FileUtils.mkdir_p dir_path
        JSONFilePersistedHash.new file_path
      end


      # @!endgroup

    end
  end

end