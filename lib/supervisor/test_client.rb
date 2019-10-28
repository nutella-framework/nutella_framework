require 'grpc'
require_relative 'supervisor_services_pb'

stub = Supervisor::Stub.new('localhost:50051', :this_channel_is_insecure)
res = stub.start_process(StartProcessRequest.new({process_name: "p123", process_log: "abc"}))
puts "Start process? #{res}"