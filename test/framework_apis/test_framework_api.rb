require 'helper'

require_relative '../../lib/nutella_lib_framework/api'


module Nutella
  class TestFrameworkApi < MiniTest::Test

    # nutella.init_as_f_component('localhost', 'my_component_id')


    # should 'pub_sub_on_framework_channels' do
    #   cb_executed = false
    #   cb = lambda do |message, from|
    #     cb_executed = true
    #     puts "Received message from #{from['component_id']}/#{from['resource_id']}. Message: #{message}"
    #   end
    #   nutella.net.f.subscribe('demo0', cb)
    #   sleep 1
    #   nutella.net.f.publish('demo0', 'test_message')
    #   # Make sure we wait for the message to be delivered
    #   sleep 1
    #   assert cb_executed
    # end
    #
    #
    # should 'request_response_on_framework_channel' do
    #   nutella.set_resource_id 'my_resource_id_3'
    #   nutella.net.f.handle_requests('demo3', lambda do |message, from|
    #     puts "We received a request: message #{message}, from #{from['component_id']}/#{from['resource_id']}."
    #     #Then we are going to return some random JSON
    #     {my:'json'}
    #   end)
    #   response = nutella.net.f.sync_request('demo3', 'my request is a string')
    #   assert_equal({'my' => 'json'}, response)
    #   nutella.net.f.async_request( 'demo3', 'my request is a string', lambda do |response|
    #       assert_equal({'my' => 'json'}, response)
    #   end)
    #   sleep 2
    # end


    # Framework-to-run (broadcasting)

    # should 'test_app_run_pub_sub_all' do
    #   nutella.set_resource_id 'my_resource_id_5'
    #   cb = lambda do |message, app_id, run_id, from|
    #     puts "Received message from run_id #{from['run_id']} on #{app_id}/#{run_id}. Message: #{message}"
    #     nutella.net.f.unsubscribe_from_all_runs 'demo5'
    #   end
    #   nutella.net.f.subscribe_to_all_runs('demo5', cb)
    #   sleep 1
    #   nutella.net.f.publish_to_all_runs('demo5', 'test_message')
    #   # Make sure we wait for the message to be delivered
    #   sleep 2
    # end

    # def test_app_run_req_res_all
    #   nutella.set_resource_id 'my_resource_id_6'
    #   nutella.net.f.handle_requests_on_all_runs('demo6', lambda do |message, app_id, run_id, from|
    #     puts "We received a request: message '#{message}', on app_id/run_id #{app_id}/#{run_id} from #{from}."
    #     'response' # Return something
    #   end)
    #   sleep 1
    #   nutella.net.f.async_request_to_all_runs('demo6', 'my request is a string', lambda do |response|
    #      puts response
    #   end)
    #   # sleep 2
    #   nutella.net.listen
    # end
    
  end
end  

