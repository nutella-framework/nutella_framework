require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'
require_relative '../../lib/commands/util/components_list'
require 'active_support/core_ext/object/deep_dup'


# Framework bots can access all the parameters they need directly
# from the configuration file and the runlist,
# to which they have full access to.

# Access the config file like so:
# Nutella.config['broker']

# Access the runs list like so:
# Nutella.runlist.all_runs


# Initialize this bot as framework component
nutella.f.init(Nutella.config['broker'], 'monitoring_bot')

# Open the resources database
$messages = nutella.f.persist.get_json_object_store('messages')

# Application structure
$applications = {}

puts 'Monitoring bot initialization'

# Add an alert on a specific application/instance/component
nutella.f.net.subscribe_to_all_runs('monitoring/alert/add', lambda do |message, appId, runId, from|
  application = message['application']
  instance = message['instance']
  component = message['component']
  mail = message['mail']

  create_if_not_present(application, instance, component)

  if application != nil
    puts "Subscribed to #{application} with mail #{mail}";
  end

  if application != nil && instance != nil && component != nil
    a = $applications[application]
    if a['instances'][instance]['components'][component]['alert'] == nil
      a['instances'][instance]['components'][component]['alert'] = []
    end
    if !a['instances'][instance]['components'][component]['alert'].include? mail
      a['instances'][instance]['components'][component]['alert'].push(mail)
    end
    $applications[application] = a
  elsif application != nil && instance != nil
    a = $applications[application]
    if a['instances'][instance]['alert'] == nil
      a['instances'][instance]['alert'] = []
    end
    if !a['instances'][instance]['alert'].include? mail
      a['instances'][instance]['alert'].push(mail)
    end
    $applications[application] = a
  elsif application != nil
    a = $applications[application]
    if a['alert'] == nil
      a['alert'] = []
    end
    emails = a['alert']
    if !emails.include? mail
      emails.push(mail)
    end
    $applications[application] = a
  end

end)

# Listen for published messages
=begin
nutella.net.subscribe('#', lambda do |message, channel, from|
  puts message
  puts channel
  #application = from['app_id']
  #instance = from['run_id']
  #component = from['component_id']
  puts from
  #puts application, instance, component

  #create_if_not_present(application, instance, component)

  #if !($applications[application]['instances'][instance]['components'][component]['publish'].include? channel)
  #  $applications[application]['instances'][instance]['components'][component]['publish'].push(channel)
  #end

end)
=end

# Add an alert on a specific application/instance/component
nutella.f.net.subscribe_to_all_runs('monitoring/alert/remove', lambda do |message, appId, runId, from|
  puts "Delete alert"
  puts message
  application = message['application']
  instance = message['instance']
  component = message['component']
  mail = message['mail']

  if application != nil && instance != nil && component != nil
    a = $applications[application]
    a['instances'][instance]['components'][component]['alert'] -=[mail]
    $applications[application] = a
  elsif application != nil && instance != nil
    a = $applications[application]
    a['instances'][instance]['alert'] -= [mail]
    $applications[application] = a
  elsif application != nil
    a = $applications[application]
    a['alert'] -= [mail]
    puts a['alert']
    $applications[application] = a
  end
end)

# Listen for subscribe
# Listen for request
# Listen for handle_request

# Request the list of alert for an application/instance/component
nutella.f.net.handle_requests_on_all_runs('monitoring/alert', lambda do |request, appId, runId, from|
  puts 'Sending alert list'
  application = request['application']
  instance = request['instance']
  component = request['component']

  alert = nil

  begin
    if application != nil && instance != nil && component != nil
      a = $applications[application]
      alert = a['instances'][instance]['components'][component]['alert']
    elsif application != nil && instance != nil
      a = $applications[application]
      alert = a['instances'][instance]['alert']
    elsif application != nil
      a = $applications[application]
      alert = a['alert']
    end
  rescue
  end

  if alert == nil
    alert = []
  end

  {:emails => alert}
end)

# Create the application structure if it is not present
def create_if_not_present(application, instance=nil, component=nil)

  a = $applications[application]

  if a == nil
    a = {
        'name' => application,
        'instances' => {}
    }
  end

  begin
    if instance != nil && a['instances'][instance] == nil
      a['instances'][instance] = {
          'name' => instance,
          'components' => {}
      }
    end
  rescue
    a['instances'][instance] = {
        'name' => instance,
        'components' => {}
    }
  end

  begin
    if component != nil && instance != nil && a['instances'][instance]['components'][component] == nil
      a['instances'][instance]['components'][component] = {
          'name' => component,
          'publish' => [],
          'subscribe' => [],
          'request' => [],
          'handle_request' => []
      }
    end
  rescue
    a['instances'][instance]['components'][component] = {
        'name' => component,
        'publish' => [],
        'subscribe' => [],
        'request' => [],
        'handle_request' => []
    }
  end

  $applications[application] = a

end

nutella.f.net.handle_requests_on_all_runs('monitoring/application', lambda do |request, appId, runId, from|
  apps = []

  $applications.each do |_, application|
    app = application.deep_dup
    app['instances'] = []
    if application['instances'] != nil
      application['instances'].each do |_, instance|
        inst = instance.deep_dup

        app['instances'].push(inst)

        inst['components'] = []
        if instance['components'] != nil
          instance['components'].each do |_, component|
            comp = component.deep_dup
            inst['components'].push(comp)
          end
        end
      end
    end
    apps.push(app)
  end
  {:applications => apps}
end)

nutella.f.net.handle_requests_on_all_runs('monitoring/message', lambda do |request, appId, runId, from|
  reply = $messages['messages']
  {:messages => reply}
                                                              end)

# Catch publish messages
nutella.f.net.subscribe_to_all_runs("#", lambda do |channel, payload, app_id, run_id, from|

  component_id = from['component_id']

  if component_id != nil
    create_if_not_present(app_id, run_id, component_id)

    publish = $applications[app_id]['instances'][run_id]['components'][component_id]['publish']

    if not publish.include? ({'channel' => channel})
      publish.push({'channel' => channel})
    end

    $applications[app_id]['instances'][run_id]['components'][component_id]['publish'] = publish

  end

end)

# Catch subscribe / handle_request messages
nutella.f.net.subscribe_to_all_runs("subscriptions", lambda do |payload, app_id, run_id, from|

  component_id = from['component_id']
  type = payload['type']
  channel = nutella.net.un_pad_channel(payload['channel'], app_id, run_id)

  if type == 'subscribe'
    create_if_not_present(app_id, run_id, component_id)

    subscribe = $applications[app_id]['instances'][run_id]['components'][component_id]['subscribe']

    if not subscribe.include? ({'channel' => channel})
      subscribe.push({'channel' => channel})
    end

    $applications[app_id]['instances'][run_id]['components'][component_id]['subscribe'] = subscribe

  end

  if type == 'handle_requests'
    create_if_not_present(app_id, run_id, component_id)

    handle_request = $applications[app_id]['instances'][run_id]['components'][component_id]['handle_request']

    if not handle_request.include? ({'channel' => channel})
      handle_request.push({'channel' => channel})
    end

    $applications[app_id]['instances'][run_id]['components'][component_id]['handle_request'] = handle_request

  end

end)

# Catch subscribe / handle_request messages
nutella.f.net.catch_requests_on_all_runs_wildcard(lambda do |channel, payload, app_id, run_id, from|

 component_id = from['component_id']

 create_if_not_present(app_id, run_id, component_id)

 request = $applications[app_id]['instances'][run_id]['components'][component_id]['request']

 unless request.include? ({'channel' => channel})
   request.push({'channel' => channel})
 end

 $applications[app_id]['instances'][run_id]['components'][component_id]['request'] = request


end)


nutella.f.net.subscribe_to_all_runs("pings", lambda do |payload, app_id, run_id, from|

 component_id = from['component_id']

 puts " #{payload}, #{app_id}, #{run_id}, #{from}"

 create_if_not_present(app_id, run_id, component_id)

 $applications[app_id]['instances'][run_id]['components'][component_id]['timestamp'] = Time.now.to_f

end)

puts 'Initialization completed'

while sleep 0.25
  n = Nutella.runlist.all_runs
  Nutella.runlist.all_apps.each do |app_id, _|
    Nutella.runlist.runs_for_app(app_id).each do |run_id|
      pathBots = "#{Nutella.runlist.app_path(app_id)}/bots"
      pathInterfaces = "#{Nutella.runlist.app_path(app_id)}/interfaces"

      create_if_not_present(app_id, run_id)

      ComponentsList.for_each_component_in_dir(pathBots) do |comp_name|
        create_if_not_present(app_id, run_id, comp_name)
      end

      ComponentsList.for_each_component_in_dir(pathInterfaces) do |comp_name|
        create_if_not_present(app_id, run_id, comp_name)
      end
    end
  end

  $applications.each do |_, application|
    appProblems = 0
    application['instances'].each do |_, instance|
      instanceProblems = 0
      instance['components'].each do |_, component|
        if component['timestamp'] == nil || Time.now.to_f - component['timestamp'] > 16.0
          appProblems += 1
          instanceProblems += 1
          component['problem'] = true
        else
          component['problem'] = false
        end
      end
      instance['problems'] = instanceProblems
    end
    application['problems'] = appProblems
  end
end
