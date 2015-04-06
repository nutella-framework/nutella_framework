module Nutella

  module Framework

    module Net

      # @!group Framework-level communication APIs

      # Subscribes to a channel or to a set of channels at the framework-level.
      #
      # @param [String] channel the framework-level channel or filter we are subscribing to. Can contain wildcard(s)
      # @param [Proc] callback a lambda expression that is fired whenever a message is received.
      #   The passed callback takes the following parameters:
      #   - [String] message: the received message. Messages that are not JSON are discarded.
      #   - [String] channel: the framework-level channel the message was received on (optional, only for wildcard subscriptions)
      #   - [Hash] from: the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
      def self.subscribe (channel, callback)
        Nutella::Net.subscribe_to(channel, callback, nil, nil)
      end


      # Un-subscribes from a framework-level channel
      #
      # @param [String] channel the framework-level channel we want to unsubscribe from. Can contain wildcard(s).
      def self.unsubscribe( channel )
        Nutella::Net.unsubscribe_to(channel, nil, nil)
      end


      # Publishes a message to an framework-level channel
      #
      # @param [String] channel the framework-level channel we want to publish the message to. *CANNOT* contain wildcard(s)!
      # @param [Object] message the message we are publishing. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      def self.publish(channel, message=nil)
        Nutella::Net.publish_to(channel, message, nil, nil)
      end


      # Performs a synchronous request at the framework-level
      #
      # @param [String] channel the framework-level channel we want to make the request to. *CANNOT* contain wildcard(s)!
      # @param [Object] message the body of request. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      def self.sync_request ( channel, message=nil )
        Nutella::Net.sync_request_to(channel, message, nil, nil)
      end


      # Performs an asynchronous request at the framework-level
      #
      # @param [String] channel the framework-level channel we want to make the request to. *CANNOT* contain wildcard(s)!
      # @param [Object] message the body of request. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      # @param [Proc] callback the callback that is fired whenever a response is received. It takes one parameter (response).
      def self.async_request ( channel, message=nil, callback )
        Nutella::Net.async_request_to(channel, message, callback, nil, nil)
      end


      # Handles requests on a certain framework-level channel
      #
      # @param [String] channel tha framework-level channel we want to listen for requests on. Can contain wildcard(s).
      # @param [Proc] callback a lambda expression that is fired whenever a message is received.
      #   The passed callback takes the following parameters:
      #   - [String] the received message (payload). Messages that are not JSON are discarded.
      #   - [Hash] the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
      #   - [*returns* Hash] The response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
      def self.handle_requests( channel, callback )
        Nutella::Net.handle_requests_on(channel, callback, nil, nil)
      end

      # @!endgroup

      # ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

      # @!group Framework-level APIs to communicate at the run-level

      # Allows framework-level APIs to subscribe to a run-level channel within a specific run
      #
      # @param [String] app_id the specific application we are subscribing to
      # @param [String] run_id the specific run we are subscribing to
      # @param [String] channel the run-level channel we are subscribing to. Can be wildcard.
      # @param [Proc] callback the callback that is fired whenever a message is received on the channel.
      #   The passed callback takes the following parameters:
      #   - [String] message: the received message. Messages that are not JSON are discarded.
      #   - [String] channel: the framework-level channel the message was received on (optional, only for wildcard subscriptions)
      #   - [Hash] from: the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
      def self.subscribe_to_run( app_id, run_id, channel, callback )
        Nutella::Net.subscribe_to(channel, callback, app_id, run_id)
      end


      # Allows framework-level APIs to unsubscribe from a run-level channel within a specific run
      #
      # @param [String] app_id the specific application we are un-subscribing from
      # @param [String] run_id the specific run we are un-subscribing from
      # @param [String] channel the run-level channel we want to unsubscribe from. Can contain wildcard(s).
      def self.unsubscribe_to_run( app_id, run_id, channel )
        Nutella::Net.unsubscribe_to(channel, app_id, run_id)
      end


      # Allows framework-level APIs to publish to a run-level channel within a specific run
      #
      # @param [String] app_id the specific application we are publishing to
      # @param [String] run_id the specific run we are publishing to
      # @param [String] channel the run-level channel we want to publish the message to. *CANNOT* contain wildcard(s)!
      # @param [String] message the message we are publishing. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      def self.publish_to_run( app_id, run_id, channel, message )
        Nutella::Net.publish_to(channel, message, app_id, run_id)
      end


      # Allows framework-level APIs to make a synchronous request to a run-level channel within a specific run
      #
      # @param [String] app_id the specific application we are making the request to
      # @param [String] run_id the specific run we are making the request to
      # @param [String] channel the channel we want to make the request to. *CANNOT* contain wildcard(s)!
      # @param [Object] request the body of request. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      def self.sync_request_to_run( app_id, run_id, channel, request)
        Nutella::Net.sync_request_to(channel, request, app_id, run_id)
      end


      # Allows framework-level APIs to make an asynchronous request to a run-level channel within a specific run
      #
      # @param [String] app_id the specific application we are making the request to
      # @param [String] run_id the specific run we are making the request to
      # @param [String] channel the channel we want to make the request to. *CANNOT* contain wildcard(s)!
      # @param [Object] request the body of request. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      # @param [Proc] callback the callback that is fired whenever a response is received. It takes one parameter (response).
      def self.async_request_to_run( app_id, run_id, channel, request, callback)
        Nutella::Net.async_request_to(channel, request, callback, app_id, run_id)
      end


      # Allows framework-level APIs to handle requests on a run-level channel within a specific run
      #
      # @param [String] app_id the specific application requests are coming from
      # @param [String] run_id the specific run requests are coming from
      # @param [String] channel we want to listen for requests on. Can contain wildcard(s).
      # @param [Proc] callback a lambda expression that is fired whenever a message is received.
      #   The passed callback takes the following parameters:
      #   - [String] the received message (payload). Messages that are not JSON are discarded.
      #   - [Hash] the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
      #   - [*returns* Hash] The response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
      def self.handle_requests_on_run( app_id, run_id, channel, callback )
        Nutella::Net.handle_requests_on(channel, callback, app_id, run_id)
      end

      # @!endgroup

      # ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

      # @!group Framework-level APIs to communicate at the run-level (broadcast)

      # Allows framework-level APIs to subscribe to a run-level channel *for ALL runs*
      #
      # @param [String] channel the run-level channel we are subscribing to. Can be wildcard.
      # @param [Proc] callback the callback that is fired whenever a message is received on the channel.
      #   The passed callback takes the following parameters:
      #   - [String] message: the received message. Messages that are not JSON are discarded.
      #   - [String] app_id: the app_id of the channel the message was sent on
      #   - [String] run_id: the run_id of the channel the message was sent on
      #   - [Hash] from: the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
      def self.subscribe_to_all_runs( channel, callback )
        # Check the passed callback has the right number of arguments
        raise 'You need to pass a callback with 4 parameters (payload, app_id, run_id, from) when subscribing to all runs!' if callback.parameters.length!=4
        # Pad channel
        padded_channel = Nutella::Net.pad_channel(channel, '+', '+')
        mqtt_cb = lambda do |mqtt_message, mqtt_channel|
          begin
            type, from, payload, _ = Nutella::Net.extract_fields_from_message mqtt_message
            app_id, run_id = self.extract_run_id_and_app_id mqtt_channel
            callback.call(payload, app_id, run_id, from) if type=='publish'
          rescue JSON::ParserError
            # Make sure the message is JSON, if not drop the message
            return
          rescue ArgumentError
            # Check the passed callback has the right number of arguments
            STDERR.puts "The callback you passed to subscribe has the #{$!}: it needs 'payload', 'app_id', 'run_id' and 'from'"
          end
        end
        # Add to subscriptions, save mqtt callback and subscribe
        Nutella::Net.subscriptions.push padded_channel
        Nutella::Net.callbacks.push mqtt_cb
        Nutella.mqtt.subscribe( padded_channel, mqtt_cb )
        # Notify subscriptions bot
        Nutella::Net.publish_to('subscriptions', {'channel' => padded_channel}, nil, nil)
      end


      # Allows framework-level APIs to unsubscribe from a run-level channel *for ALL runs*
      #
      # @param [String] channel the run-level channel we want to unsubscribe from. Can contain wildcard(s).
      def self.unsubscribe_from_all_runs( channel )
        Nutella::Net.unsubscribe_to(channel, '+', '+')
      end


      # Allows framework-level APIs to publish a message to a run-level channel *for ALL runs*
      #
      # @param [String] channel the run-level channel we want to publish the message to. *CANNOT* contain wildcard(s)!
      # @param [Object] message the message we are publishing. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      def self.publish_to_all_runs( channel, message )
        Nutella.runlist.all_runs.each do |app_id, _|
          Nutella.runlist.runs_for_app(app_id).each do |run_id|
            Nutella::Net.publish_to(channel, message, app_id, run_id)
          end
        end
      end


      # Allows framework-level APIs to send a request to a run-level channel *for ALL runs*
      #
      # @param [String] channel the run-level channel we want to make the request to. *CANNOT* contain wildcard(s)!
      # @param [Object] request the body of request. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      # @param [Proc] callback the callback that is fired whenever a response is received. It takes one parameter (response).
      def self.async_request_to_all_runs(channel, request, callback)
        Nutella.runlist.all_runs.each do |app_id, _|
          Nutella.runlist.runs_for_app(app_id).each do |run_id|
            Nutella::Net.async_request_to(channel, request, callback, app_id, run_id)
          end
        end
      end


      # Allows framework-level APIs to handle requests to a run-level channel *for ALL runs*
      #
      # @param [String] channel tha run-level channel we want to listen for requests on. Can contain wildcard(s).
      # @param [Proc] callback a lambda expression that is fired whenever a message is received.
      #   The passed callback takes the following parameters:
      #   - [String] the received message (request). Messages that are not JSON are discarded.
      #   - [String] app_id: the app_id of the channel the request was sent on
      #   - [String] run_id: the run_id of the channel the request was sent on
      #   - [Hash] the sender's identifiers (from containing, run_id, app_id, component_id and optionally resource_id)
      #   - [*returns* Hash] The response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
      def self.handle_requests_on_all_runs(channel, callback)
        # Check the passed callback has the right number of arguments
        raise 'You need to pass a callback with 4 parameters (request, run_id, from) when handling requests!' if callback.parameters.length!=4
        # Pad channel
        padded_channel = Nutella::Net.pad_channel(channel, '+', '+')
        mqtt_cb = lambda do |request, mqtt_channel|
          begin
            # Extract nutella fields
            type, from, payload, id = Nutella::Net.extract_fields_from_message request
            app_id, run_id = self.extract_run_id_and_app_id mqtt_channel
            # Only handle requests that have proper id set
            return if type!='request' || id.nil?
            # Execute callback and send response
            m = Nutella::Net.prepare_message_for_response( callback.call( payload, app_id, run_id, from), id )
            Nutella.mqtt.publish( mqtt_channel, m )
          rescue JSON::ParserError
            # Make sure that request contains JSON, if not drop the message
            return
          rescue ArgumentError
            # Check the passed callback has the right number of arguments
            STDERR.puts "The callback you passed to subscribe has the #{$!}: it needs 'request', 'app_id', 'run_id' and 'from'"
          end
        end
        # Subscribe to the channel
        Nutella.mqtt.subscribe( padded_channel, mqtt_cb )
      end

      # @!endgroup

      # ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

      # @!group Framework-level APIs to communicate at the application-level


      # Allows framework-level APIs to subscribe to an app-level channel within a specific run
      #
      # @param [String] app_id the specific application we are subscribing to
      # @param [String] channel the run-level channel we are subscribing to. Can be wildcard.
      # @param [Proc] callback the callback that is fired whenever a message is received on the channel.
      #   The passed callback takes the following parameters:
      #   - [String] message: the received message. Messages that are not JSON are discarded.
      #   - [String] channel: the framework-level channel the message was received on (optional, only for wildcard subscriptions)
      #   - [Hash] from: the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
      def self.subscribe_to_app(app_id, channel, callback)
        Nutella::Net.subscribe_to(channel, callback, app_id, nil)
      end


      # Allows framework-level APIs to unsubscribe from an app-level channel within a specific run
      #
      # @param [String] app_id the specific application we are un-subscribing from
      # @param [String] run_id the specific run we are un-subscribing from
      # @param [String] channel the run-level channel we want to unsubscribe from. Can contain wildcard(s).
      def self.unsubscribe_to_app( app_id, channel )
        Nutella::Net.unsubscribe_to(channel, app_id, nil)
      end


      # Allows framework-level APIs to publish to an app-level channel within a specific run
      #
      # @param [String] app_id the specific application we are publishing to
      # @param [String] channel the run-level channel we want to publish the message to. *CANNOT* contain wildcard(s)!
      # @param [String] message the message we are publishing. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      def self.publish_to_app(app_id, channel, message)
        Nutella::Net.publish_to(channel, message, app_id, nil)
      end


      # Allows framework-level APIs to make a synchronous request to a run-level channel within a specific run
      #
      # @param [String] app_id the specific application we are making the request to
      # @param [String] run_id the specific run we are making the request to
      # @param [String] channel the channel we want to make the request to. *CANNOT* contain wildcard(s)!
      # @param [Object] request the body of request. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      def self.sync_request_to_app( app_id, channel, request)
        Nutella::Net.sync_request_to(channel, request, app_id, nil)
      end


      # Allows framework-level APIs to make an asynchronous request to a run-level channel within a specific run
      #
      # @param [String] app_id the specific application we are making the request to
      # @param [String] run_id the specific run we are making the request to
      # @param [String] channel the channel we want to make the request to. *CANNOT* contain wildcard(s)!
      # @param [Object] request the body of request. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      # @param [Proc] callback the callback that is fired whenever a response is received. It takes one parameter (response).
      def self.async_request_to_app( app_id, channel, request, callback)
        Nutella::Net.async_request_to(channel, request, callback, app_id, nil)
      end


      # Allows framework-level APIs to handle requests on a run-level channel within a specific run
      #
      # @param [String] app_id the specific application requests are coming from
      # @param [String] run_id the specific run requests are coming from
      # @param [String] channel we want to listen for requests on. Can contain wildcard(s).
      # @param [Proc] callback a lambda expression that is fired whenever a message is received.
      #   The passed callback takes the following parameters:
      #   - [String] the received message (payload). Messages that are not JSON are discarded.
      #   - [Hash] the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
      #   - [*returns* Hash] The response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
      def self.handle_requests_on_app(app_id, channel, callback)
        Nutella::Net.handle_requests_on(channel, callback, app_id, nil)
      end




      # @!endgroup

      # ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

      # @!group Framework-level APIs to communicate at the application-level (broadcast)


      # Allows framework-level APIs to subscribe to an app-level channel *for ALL apps*
      #
      # @param [String] channel the app-level channel we are subscribing to. Can be wildcard.
      # @param [Proc] callback the callback that is fired whenever a message is received on the channel.
      #   The passed callback takes the following parameters:
      #   - [String] message: the received message. Messages that are not JSON are discarded.
      #   - [String] app_id: the app_id of the channel the message was sent on
      #   - [Hash] from: the sender's identifiers (run_id, app_id, component_id and optionally resource_id)
      def self.subscribe_to_all_apps(channel, callback)
        # Check the passed callback has the right number of arguments
        raise 'You need to pass a callback with 3 parameters (payload, app_id, from) when subscribing to all apps!' if callback.parameters.length!=3
        # Pad channel
        padded_channel = Nutella::Net.pad_channel(channel, '+', nil)
        mqtt_cb = lambda do |mqtt_message, mqtt_channel|
          begin
            type, from, payload, _ = Nutella::Net.extract_fields_from_message mqtt_message
            app_id = self.extract_app_id mqtt_channel
            callback.call(payload, app_id, from) if type=='publish'
          rescue JSON::ParserError
            # Make sure the message is JSON, if not drop the message
            return
          rescue ArgumentError
            # Check the passed callback has the right number of arguments
            STDERR.puts "The callback you passed to subscribe has the #{$!}: it needs 'payload', 'app_id' and 'from'"
          end
        end
        # Add to subscriptions, save mqtt callback and subscribe
        Nutella::Net.subscriptions.push padded_channel
        Nutella::Net.callbacks.push mqtt_cb
        Nutella.mqtt.subscribe( padded_channel, mqtt_cb )
        # Notify subscriptions bot
        Nutella::Net.publish_to('subscriptions', {'channel' => padded_channel}, nil, nil)
      end


      # Allows framework-level APIs to unsubscribe from an app-level channel *for ALL apps*
      #
      # @param [String] channel the run-level channel we want to unsubscribe from. Can contain wildcard(s).
      def self.unsubscribe_from_all_apps( channel )
        Nutella::Net.unsubscribe_to(channel, '+', nil)
      end


      # Allows framework-level APIs to publish a message to an app-level channel *for ALL apps*
      #
      # @param [String] channel the app-level channel we want to publish the message to. *CANNOT* contain wildcard(s)!
      # @param [Object] message the message we are publishing. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      def self.publish_to_all_apps(channel, message)
        Nutella.runlist.all_runs.each do |app_id, _|
          Nutella::Net.publish_to(channel, message, app_id, nil)
        end
      end


      # Allows framework-level APIs to send a request to a run-level channel *for ALL runs*
      #
      # @param [String] channel the app-level channel we want to make the request to. *CANNOT* contain wildcard(s)!
      # @param [Object] request the body of request. This can be,
      #   nil/empty (default), a string, a hash and, in general, anything with a .to_json method.
      # @param [Proc] callback the callback that is fired whenever a response is received. It takes one parameter (response).
      def self.async_request_to_all_apps(channel, request, callback)
        Nutella.runlist.all_runs.each do |app_id, _|
          Nutella::Net.async_request_to(channel, request, callback, app_id, nil)
        end
      end


      # Allows framework-level APIs to handle requests to a run-level channel *for ALL runs*
      #
      # @param [String] channel tha app-level channel we want to listen for requests on. Can contain wildcard(s).
      # @param [Proc] callback a lambda expression that is fired whenever a message is received.
      #   The passed callback takes the following parameters:
      #   - [String] the received message (request). Messages that are not JSON are discarded.
      #   - [String] app_id: the app_id of the channel the request was sent on
      #   - [Hash] the sender's identifiers (from containing, run_id, app_id, component_id and optionally resource_id)
      #   - [*returns* Hash] The response sent back to the client that performed the request. Whatever is returned by the callback is marshaled into a JSON string and sent via MQTT.
      def self.handle_requests_on_all_apps(channel, callback)
        # Check the passed callback has the right number of arguments
        raise 'You need to pass a callback with 3 parameters (request, run_id, from) when handling requests!' if callback.parameters.length!=3
        # Pad channel
        padded_channel = Nutella::Net.pad_channel(channel, '+', nil)
        mqtt_cb = lambda do |request, mqtt_channel|
          begin
            # Extract nutella fields
            type, from, payload, id = Nutella::Net.extract_fields_from_message request
            app_id  = self.extract_app_id mqtt_channel
            # Only handle requests that have proper id set
            return if type!='request' || id.nil?
            # Execute callback and send response
            m = Nutella::Net.prepare_message_for_response( callback.call( payload, app_id, from), id )
            Nutella.mqtt.publish( mqtt_channel, m )
          rescue JSON::ParserError
            # Make sure that request contains JSON, if not drop the message
            return
          rescue ArgumentError
            # Check the passed callback has the right number of arguments
            STDERR.puts "The callback you passed to subscribe has the #{$!}: it needs 'request', 'app_id' and 'from'"
          end
        end
        # Subscribe to the channel
        Nutella.mqtt.subscribe( padded_channel, mqtt_cb )
      end

      # @!endgroup


      # ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------


      # Listens for incoming messages. All this function
      # does is to put the thread to sleep and wait for something to
      # happen over the network to wake up.
      def self.listen
        Nutella::Net.listen
      end


      private


      def self.extract_run_id_and_app_id( mqtt_channel )
        sp =  mqtt_channel.sub('/nutella/apps/', '').split('/')
        return sp[0], sp[2]
      end


      def self.extract_app_id( mqtt_channel )
        sp =  mqtt_channel.sub('/nutella/apps/', '').split('/')
        return sp[0]
      end

    end # net

  end # framework

end # nutella
