# Super-simple process supervisor

require_relative 'supervisor_services_pb'

# Defines the gRPC server
class SupervisorServer < Supervisor::Service
  # start_process implements the StartProcess rpc method.
  def start_process(start_process_req, _unused_call)
    puts "Someone requested to start a process!!! #{start_process_req}"
    res = StartProcessResponse.new(success: true)
    puts "Responding with: #{res}"
    raise "ALE IS AN ASS"
    res
  end
end

# Runs the gRPC server
s = GRPC::RpcServer.new
s.add_http2_port('0.0.0.0:50051', :this_port_is_insecure)
s.handle(SupervisorServer)
s.run_till_terminated_or_interrupted([1, 'int', 'SIGQUIT'])