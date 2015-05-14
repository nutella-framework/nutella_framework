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

                                        puts 'configs/update:'
                                        puts new_configs

                                        # Update
                                        configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                        if new_configs != nil
                                          configs_db['configs'] = new_configs
                                        end

                                        puts 'Updated DB'

                                        # Notify Update

                                        # Notify change of all configs
                                        publish_configs_update(new_configs)

                                        # Notify possible change of current config
                                        configs = configs_db['configs']
                                        id = '%d' % configs_db['currentConfig']
                                        config = configs[id]
                                        publish_mapping_update(config['mapping'])

                                      end)

nutella.f.net.handle_requests_on_all_runs('configs/retrieve', lambda do |request, app_id, run_id, from|
                                                puts 'request: ' + request
                                                reply = {}
                                                if request == {}
                                                  reply
                                                elsif request == 'all'
                                                  configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                  reply = configs_db['configs']
                                                  puts reply
                                                  reply
                                                end
                                              end)

# 'mapping' is the current running configuration
nutella.f.net.handle_requests_on_all_runs('mapping/retrieve', lambda do |request, app_id, run_id, from|
                                                puts 'request: ' + request
                                                reply = {}
                                                if request == {}
                                                  reply
                                                elsif request == 'all'
                                                  configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                  configs = configs_db['configs']
                                                  id = '%d' % configs_db['currentConfig']
                                                  config = configs[id]
                                                  reply = config['mapping']
                                                  puts reply
                                                  reply
                                                end
                                              end)

nutella.f.net.subscribe_to_all_runs('currentConfig/update', lambda do |message, app_id, run_id, from|

                                              new_config = message

                                              puts 'currentConfig/update:'
                                              puts new_config

                                              # Update
                                              if new_config != nil
                                                configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                configs_db['currentConfig'] = new_config
                                              end

                                              puts 'Updated DB'

                                              # Notify Update
                                              publish_current_config_update(new_config)

                                            end)

# Reacts to updates to config id by publishing the updated mapping
nutella.f.net.subscribe_to_all_runs('currentConfig/updated', lambda do |message, app_id, run_id, from|

                                               begin
                                                 configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                 configs = configs_db['configs']
                                                 id = '%d' % configs_db['currentConfig']
                                                 config = configs[id]
                                                 publish_switch_config(config['mapping'])
                                               rescue => exception
                                                 puts exception
                                                 puts exception.backtrace
                                                 raise exception
                                               end

                                             end)

nutella.f.net.handle_requests_on_all_runs('currentConfig/retrieve', lambda do |request, app_id, run_id, from|
                                                      puts 'request: ' + request
                                                      reply = {}
                                                      configs_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'configs')
                                                      reply = configs_db['currentConfig']
                                                      puts reply
                                                      reply
                                                    end)

nutella.f.net.subscribe_to_all_runs('channels/update', lambda do |message, app_id, run_id, from|

                                         new_channels = message

                                         # Update
                                         if new_channels != nil
                                           channels_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'channels')
                                           channels_db['channels'] = new_channels
                                         end

                                         # Notify Update
                                         publish_channels_update(new_channels)

                                       end)

nutella.f.net.handle_requests_on_all_runs('channels/retrieve', lambda do |request, app_id, run_id, from|
                                                 reply = {}
                                                 if request == {}
                                                   reply
                                                 elsif request == 'all'
                                                   puts 'requesting channels'
                                                   channels_db = nutella.f.persist.get_run_json_object_store(app_id, run_id, 'channels')
                                                   reply = channels_db['channels']
                                                   puts reply
                                                   reply
                                                 end
                                               end)

def publish_configs_update(configs)
  nutella.f.net.publish_to_all_runs('configs/updated', configs)
  puts 'Sent configs/updated'
end

# Sends the update config id
def publish_current_config_update(config_id)
  nutella.net.publish_to_all_runs('currentConfig/updated', config_id)
  puts 'Sent currentConfig/updated'
end

# Sends the whole new current configuration
def publish_switch_config(mapping)
  nutella.net.publish_to_all_runs('currentConfig/switched', mapping)
  puts 'Sent currentConfig/switched'
end

# Sends the current config (mapping), which might have been updated
def publish_mapping_update(mapping)
  nutella.net.publish_to_all_runs('mapping/updated', mapping)
  puts 'Sent mapping/updated'
end

def publish_channels_update(channels)
  nutella.net.publish_to_all_runs('channels/updated', channels)
  puts 'Sent channels/updated'
end

puts 'Initialization complete.'

# Just sit there waiting for messages to come
nutella.net.listen