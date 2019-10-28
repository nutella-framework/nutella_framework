# Super-simple process supervisor

require_relative 'supervisor_services_pb'

class SupervisorServer < Supervisor::Service
  # say_hello implements the SayHello rpc method.
  def start_process(start_process_req, _unused_call)
    puts "Someone requested to start a process!!! #{start_process_req}"
    res = StartProcessResponse.new(success: true)
    puts "Responding with: #{res}"
    res
  end
end

# Everything that is not an SIGINT (2), SIGTERM (15), 
# or a hard SIGKILL (9) (and a SIGSTOP(19) I guess...)
# will trigger a process restart
begin
  # Listen for commands over GRPC
  # Start and stop processes
  # Persist after each operation
  s = GRPC::RpcServer.new
  s.add_http2_port('0.0.0.0:50051', :this_port_is_insecure)
  s.handle(SupervisorServer)
  s.run_till_terminated_or_interrupted([1, 'int', 'SIGQUIT'])
rescue SignalException => e
  # Legit termination, exit
rescue
  # everything else... restart
end