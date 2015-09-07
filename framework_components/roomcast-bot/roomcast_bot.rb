require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'
require 'json'

nutella.f.init(Nutella.config['broker'], 'roomcast-bot')

puts 'Initializing RoomCast...'

# Open the database
#configs_db = nutella.persist.get_json_object_store('configs')
#channels_db = nutella.persist.get_json_object_store('channels')
#channelsData_db = nutella.persist.get_json_object_store('channels-data')

nutella.f.net.subscribe_to_all_runs('configs/update', lambda do |message, app_id, run_id, from|
                                                      new_configs = message

                                                      # Update
                                                      configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                      if new_configs != nil
                                                        configs_db['configs'] = new_configs
                                                      end

                                                      # Notify change of all configs
                                                      publish_configs_update(app_id, run_id, new_configs)

                                                      # Notify possible change of current config
                                                      configs = configs_db['configs']
                                                      id = '%d' % configs_db['currentConfig']
                                                      if id == nil
                                                        id = 1
                                                      end
                                                      config = configs[id]
                                                      publish_mapping_update(app_id, run_id, config['mapping'])
                                                    end)

nutella.f.net.handle_requests_on_all_runs('configs/retrieve', lambda do |request, app_id, run_id, from|
                                                              reply = {}
                                                              if request == {}
                                                                reply
                                                              elsif request == 'all'
                                                                configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                                reply = configs_db['configs']
                                                                if reply == nil
                                                                  reply = {
                                                                      "1"=> {
                                                                          "name"=> "Default activity",
                                                                          "mapping"=> [{
                                                                                           "family"=> "iPad",
                                                                                           "items"=> [{
                                                                                                          "name"=> "",
                                                                                                          "channels"=> []
                                                                                                      }]
                                                                                       }, {
                                                                                           "family"=> "Mac",
                                                                                           "items"=> [{
                                                                                                          "name"=> "",
                                                                                                          "channels"=> []
                                                                                                      }]
                                                                                       }]
                                                                      }
                                                                  }
                                                                  configs_db['currentConfig'] = 1
                                                                end
                                                                reply
                                                              end
                                                            end)

# 'mapping' is the current running configuration
nutella.f.net.handle_requests_on_all_runs('mapping/retrieve', lambda do |request, app_id, run_id, from|
                                                              reply = {}
                                                              if request == {}
                                                                reply
                                                              elsif request == 'all'
                                                                configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                                if configs_db == nil
                                                                  reply = []
                                                                else
                                                                  configs = configs_db['configs']
                                                                  id = '%d' % configs_db['currentConfig']
                                                                  config = configs[id]
                                                                  reply = config['mapping']
                                                                end
                                                                reply
                                                              end
                                                            end)

nutella.f.net.subscribe_to_all_runs('currentConfig/update', lambda do |message, app_id, run_id, from|
                                                            new_config = message

                                                            # Update
                                                            if new_config != nil
                                                              configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                              configs_db['currentConfig'] = new_config
                                                            end

                                                            # Notify Update
                                                            publish_current_config_update(app_id, run_id, new_config)
                                                          end)

# Reacts to updates to config id by publishing the updated mapping
nutella.f.net.subscribe_to_all_runs('currentConfig/ack_updated', lambda do |message, app_id, run_id, from|
                                                                 configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                                 configs = configs_db['configs']
                                                                 id = '%d' % configs_db['currentConfig']
                                                                 config = configs[id]
                                                                 publish_switch_config(app_id, run_id, config['mapping'])

                                                                 # Publish activity name on RoomCast API
                                                                 activity_name = config['name']
                                                                 publish_activity_update(app_id, run_id, activity_name)
                                                               end)

nutella.f.net.handle_requests_on_all_runs('currentConfig/retrieve', lambda do |request, app_id, run_id, from|
                                                                    configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                                    reply = configs_db['currentConfig']
                                                                    if reply == nil
                                                                      reply = 1
                                                                    end
                                                                    reply
                                                                  end)

nutella.f.net.subscribe_to_all_runs('channels/update', lambda do |message, app_id, run_id, from|
                                                       new_channels = message

                                                       # Update
                                                       if new_channels != nil
                                                         channels_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'channels')
                                                         channels_db['channels'] = new_channels
                                                       end

                                                       # Clean configs to remove deleted channels + Notify configs update
                                                       clean_configs(app_id, run_id)

                                                       # Notify channels Update
                                                       publish_channels_update(app_id, run_id, new_channels)
                                                     end)

nutella.f.net.handle_requests_on_all_runs('channels/retrieve', lambda do |request, app_id, run_id, from|
                                                               reply = {}
                                                               if request == {}
                                                                 reply
                                                               elsif request == 'all'
                                                                 channels_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'channels')
                                                                 reply = channels_db['channels']
                                                                 if reply == nil
                                                                   reply = {}
                                                                 end
                                                                 reply
                                                               end
                                                             end)

def publish_configs_update(app_id, run_id, configs)
  nutella.f.net.publish_to_run(app_id, run_id, 'configs/updated', configs)
end

# Sends the updated config id
def publish_current_config_update(app_id, run_id, config_id)
  nutella.f.net.publish_to_run(app_id, run_id, 'currentConfig/ack_updated', config_id)
end

# Sends the whole new current configuration
def publish_switch_config(app_id, run_id, mapping)
  nutella.f.net.publish_to_run(app_id, run_id, 'currentConfig/switched', mapping)
end

# Sends the current config (mapping), which might have been updated
def publish_mapping_update(app_id, run_id, mapping)
  nutella.f.net.publish_to_run(app_id, run_id, 'mapping/updated', mapping)
end

def publish_channels_update(app_id, run_id, channels)
  nutella.f.net.publish_to_run(app_id, run_id, 'channels/updated', channels)
end

# Removes deleted channels ids from configs and notifies
def clean_configs(app_id, run_id)
  configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
  channels_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'channels')
  if configs_db['configs'] == nil || channels_db['channels'] == nil
    return
  end

  new_configs = configs_db.dup

  ids = []
  channels_db['channels'].each do |k, channel|
    ids << k
  end

  o = {}
  new_configs['configs'].each do |key, config|
    config = new_configs['configs'][key]
    config['mapping'].each do |mapping|
      mapping['items'].each do |item|
        item['channels'] = item['channels'] & ids   # intersection of channels
        #p item['channels']
      end
    end
    o[key] = config
  end
  #new_configs['configs'] = c
  configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
  configs_db['configs'] = o.dup
  publish_configs_update(app_id, run_id, o.dup)
end

################ RoomCast API ################

# Returns the name of the current running activity
nutella.f.net.handle_requests_on_all_runs('roomcast/activity', lambda do |request, app_id, run_id, from|
                                                               reply = {}
                                                               configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                               id = '%d' % configs_db['currentConfig']
                                                               if id != nil
                                                                 configs = configs_db['configs']
                                                                 if configs != nil
                                                                   config = configs[id]
                                                                   reply = config['name']
                                                                 end
                                                               end
                                                               reply
                                                             end)

# Notifies a change of current running activity
def publish_activity_update(app_id, run_id, activity_name)
  nutella.f.net.publish_to_run(app_id, run_id, 'roomcast/new_activity', activity_name)
end

##############################################

puts 'Initialization complete.'

# Just sit there waiting for messages to come
nutella.net.listen