require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'
require_relative '../../lib/commands/util/components_list'
require 'nutella_lib'
require 'net/http'
require 'net/https'
require 'uri'
require 'json'

# Initialize this bot as framework component
nutella.f.init(Nutella.config['broker'], 'room_places_bot')

# Buffer object that caches all the updates
class RoomPlacesCachePublish

  @@cache_list = {}

  def initialize(app_id, run_id)
    @app_id = app_id
    @run_id = run_id

    @resource_updated = {}
    @resource_added = []
    @resource_removed = []
    @resource_entered = {}
    @resource_exited = {}

    # Semaphores for threads safety
    @s1 = Mutex.new
    @s2 = Mutex.new
    @s3 = Mutex.new
    @s4 = Mutex.new
    @s5 = Mutex.new
    @s6 = Mutex.new
    @s7 = Mutex.new
    @s8 = Mutex.new
    @s9 = Mutex.new
    @s10 = Mutex.new
  end

  def resources_update(resources)
    @s1.synchronize {
      resources.each do |resource|
        @resource_updated[resource['rid']] = resource
      end
    }
  end

  def resources_add(resources)
    @s2.synchronize {
      @resource_added += resources
    }
  end

  def resources_remove(resources)
    @s3.synchronize {
      @resource_removed += resources
    }
  end

  def resources_enter(resources, baseStationRid)
    @s4.synchronize {
      if @resource_entered[baseStationRid] == nil
        @resource_entered[baseStationRid] = []
      end
      @resource_entered[baseStationRid] += resources
    }
  end

  def resources_exit(resources, baseStationRid)
    @s5.synchronize {
      if @resource_exited[baseStationRid] == nil
        @resource_exited[baseStationRid] = []
      end
      @resource_exited[baseStationRid] += resources
    }
  end

  def publish_update()
    @s6.synchronize {
      if @resource_updated.length > 0
        nutella.f.net.publish_to_run(@app_id, @run_id, 'location/resources/updated', {:resources => @resource_updated.values})
        @resource_updated = {}
      end
    }
  end

  def publish_add()
    @s7.synchronize {
      if @resource_added.length > 0
        nutella.f.net.publish_to_run(@app_id, @run_id, 'location/resources/added', {:resources => @resource_added})
        @resource_added = []
      end
    }
  end

  def publish_remove()
    @s8.synchronize {
      if @resource_removed.length > 0
        nutella.f.net.publish_to_run(@app_id, @run_id, 'location/resources/removed', {:resources => @resource_removed})
        @resource_removed = []
      end
    }
  end

  def publish_enter()
    @s9.synchronize {
      @resource_entered.each do |baseStationRid, resources|
        nutella.f.net.publish_to_run(@app_id, @run_id, "location/resource/static/#{baseStationRid}/enter", {'resources' => resources})
      end
      @resource_entered = {}
    }
  end

  def publish_exit()
    @s10.synchronize {
      @resource_exited.each do |baseStationRid, resources|
        nutella.f.net.publish_to_run(@app_id, @run_id, "location/resource/static/#{baseStationRid}/exit", {'resources' => resources})
      end
      @resource_exited = {}
    }
  end

  def self.get_cache(app_id, run_id)
    unless @@cache_list.has_key? [app_id, run_id]
      @@cache_list[[app_id, run_id]] = RoomPlacesCachePublish.new(app_id, run_id)
    end
    @@cache_list[[app_id, run_id]]
  end

end

puts 'Room places initialization'

# Open the resources database
#$resources = nutella.f.persist.get_mongo_object_store('resources')
#$groups = nutella.f.persist.get_mongo_object_store('groups')
#$room = nutella.f.persist.get_mongo_object_store('room')
#$discrete_tracking = nutella.f.persist.get_mongo_object_store('discrete_tracking')

# Create new resource
nutella.f.net.subscribe_to_all_runs('location/resource/add', lambda do |message, app_id, run_id, from|
  # Persistent data
  resources = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'resources')

  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  rid = message['rid']
  type = message['type']
  model = message['model']
  proximity_range = message['proximity_range']

  if proximity_range == nil
    proximity_range = 0
  end

  if rid != nil && type != nil && model != nil
    if resources[rid] == nil
      if type == 'STATIC'
        resources[rid]={:rid => rid,
            :type => type,
            :model => model,
            :proximity_range => proximity_range,
            :parameters => {}
          };
      elsif type == 'DYNAMIC'
        resources[rid]={:rid => rid,
            :type => type,
            :model => model,
            :parameters => {}
          }
      end
      publishResourceAdd(app_id, run_id, resources[rid])
      cache.publish_add
    end

  end
end)

# Remove resource
nutella.f.net.subscribe_to_all_runs('location/resource/remove', lambda do |message, app_id, run_id, from|
  # Persistent data
  resources = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'resources')

  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  rid = message['rid']
  if rid != nil

    resourceCopy = resources[rid]
    resources.delete(rid)
    publishResourceRemove(app_id, run_id, resourceCopy)
    cache.publish_remove

  end
end)


# Update the location of the resources
nutella.f.net.subscribe_to_all_runs('location/resource/update', lambda do |message, app_id, run_id, from|
  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  updateResource(app_id, run_id, message)

  cache.publish_update
  cache.publish_exit
  cache.publish_enter
end)

# Update the location of the resources
nutella.f.net.subscribe_to_all_runs('location/resources/update', lambda do |message, app_id, run_id, from|
  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  resources = message['resources']
  if resources != nil
    resources.each do |resource|
      updateResource(app_id, run_id, resource)
    end
  end

  cache.publish_update
  cache.publish_exit
  cache.publish_enter
end)

def updateResource(app_id, run_id, updatedResource)
  # Persistent data
  resources = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'resources')
  room = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'room')
  discrete_tracking = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'discrete_tracking')

  rid = updatedResource['rid']
  type = updatedResource['type']
  proximity = updatedResource['proximity']
  discrete = updatedResource['discrete']
  continuous = updatedResource['continuous']
  parameters = updatedResource['parameters']
  proximity_range = updatedResource['proximity_range']
  resource = nil

  # Retrieve $room data
  r = {}

  if room['x'] == nil || room['y'] == nil
    r['x'] = 10
    r['y'] = 7
  else
    r['x'] = room['x']
    r['y'] = room['y']
  end

  if room['z'] != nil
    r['z'] = room['z']
  end


  resource = resources[rid]

  if resource == nil
    return
  end

  if proximity != nil && proximity['rid'] != nil && proximity['distance'] != nil
    baseStation = resources[proximity['rid']]

    if baseStation != nil && baseStation['proximity_range'] != nil

      if baseStation['proximity_range'] >= proximity['distance']
        if resource['proximity'] != nil && resource['proximity']['rid'] && resource['proximity']['distance']
          oldBaseStationRid = resource['proximity']['rid']
          if resource['proximity']['rid'] != proximity['rid']
            resource['proximity'] = proximity
            resource['proximity']['timestamp'] = Time.now.to_f
            publishResourceExit(app_id, run_id, resource, oldBaseStationRid)
            publishResourceEnter(app_id, run_id, resource, resource['proximity']['rid'])
          else
            resource['proximity'] = proximity
            resource['proximity']['timestamp'] = Time.now.to_f
          end
          computeResourceUpdate(app_id, run_id, oldBaseStationRid)
        else
          resource['proximity'] = proximity
          resource['proximity']['timestamp'] = Time.now.to_f
          publishResourceEnter(app_id, run_id, resource, resource['proximity']['rid'])
        end
      end
    end
  elsif proximity == nil
    resource.delete('proximity')
  else
    resource['proximity'] = {}
  end

  if continuous != nil
    if continuous['x'] > r['x']
      continuous['x'] = r['x']
    end
    if continuous['x'] < 0
      continuous['x'] = 0
    end
    if continuous['y'] > r['y']
      continuous['y'] = r['y']
    end
    if continuous['y'] < 0
      continuous['y'] = 0
    end

    resource['continuous'] = continuous
  else
    if resource != nil && resource['continuous'] != nil
      resource.delete('continuous');
    end
  end

  if discrete_tracking['x'] != nil
    if discrete != nil

      # Translate all coordinates in numbers
      if discrete['x'].instance_of? String
        discrete['x'] = discrete['x'].downcase.ord - 'a'.ord
      end
      if discrete['y'].instance_of? String
        discrete['y'] = discrete['y'].downcase.ord - 'a'.ord
      end


      if discrete['x'] > discrete_tracking['n_x'] - 1
        discrete['x'] = discrete_tracking['n_x'] - 1
      end
      if discrete['x'] < 0
        discrete['x'] = 0
      end
      if discrete['y'] > discrete_tracking['n_y'] - 1
        discrete['y'] = discrete_tracking['n_y'] - 1
      end
      if discrete['y'] < 0
        discrete['y'] = 0
      end

      resource['discrete'] = discrete
    else
      if resource != nil && resource['discrete'] != nil
        resource.delete('discrete');
      end
    end
  end

  if parameters != nil
    ps = resource['parameters']
    for parameter in parameters
      if parameter['delete'] != nil
        ps.delete(parameter['key'])
      else
        ps[parameter['key']] = parameter['value']
      end
    end
    resource['parameters'] = ps
  end

  if type != nil
    if type == 'STATIC'
      resource['type'] = type
      resource.delete('proximity')
      if proximity_range == nil
        resource['proximity_range'] = 1;
      end
    end

    if type == 'DYNAMIC'
      resource['type'] = type
      resource.delete('proximity_range')
    end
  end

  if proximity_range != nil
    if resource['type'] == 'STATIC'
      resource['proximity_range']	= proximity_range
    end
  end

  if proximity == nil && discrete == nil && continuous == nil && parameters == nil
    resource.delete('proximity')
    resource.delete('continuous')
    resource.delete('discrete')
  end

  resources[rid]=resource
  computeResourceUpdate(app_id, run_id, rid)

end

# Request the position of a single resource
nutella.f.net.handle_requests_on_all_runs('location/resources', lambda do |request, app_id, run_id, from|
  # Persistent data
  resources = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'resources')
  groups = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'groups')

	rid = request['rid']
	group = request['group']
	reply = nil
	if rid != nil
    reply = resources[rid]

		reply
	elsif group != nil
		rs = []
		reply = []
    for resource in groups[group]['resources']
      rs.push(resource)
    end

		for r in rs
      resource = resources[resource]
      # Translate discrete coordinate
      if resource['discrete'] != nil
        resource['discrete'] = translateDiscreteCoordinates(app_id, run_id, resource['discrete'])
      end
      reply.push(resource)

		end
		{:resources => reply}
	else
		resourceList = []

    resources.to_h.each do |_, resource|
      # Translate discrete coordinate
      if resource['discrete'] != nil
        resource['discrete'] = translateDiscreteCoordinates(app_id, run_id, resource['discrete'])
      end
      resourceList.push(resource)
    end

		{:resources => resourceList}
	end
end)

# Update the room size
nutella.f.net.subscribe_to_all_runs('location/room/update', lambda do |message, app_id, run_id, from|
  # Persistent data
  room = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'room')

  x = message['x']
  y = message['y']

  if x != nil && y != nil
    r = {}
    room['x'] = x
    r['x'] = x

    room['y'] = y
    r['y'] = y

    publishRoomUpdate(app_id, run_id, r)
  end
end)

# Compute and publish resource
def computeResourceUpdate(app_id, run_id, rid)
  resources = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'resources')

  resource = resources[rid]

  if resource != nil
    if resource['proximity'] != nil
      if resource['proximity']['rid'] != nil
        baseStation = resources[resource['proximity']['rid']]

        if baseStation != nil && baseStation['continuous'] != nil
          resource['proximity']['continuous'] = baseStation['continuous']

          # Update basic station
          computeResourceUpdate(app_id, run_id, resource['proximity']['rid'])
        end

        if baseStation != nil && baseStation['discrete'] != nil
          resource['proximity']['discrete'] = baseStation['discrete']
        end
      end
    end

    resources[rid] = resource

=begin
    if resource['continuous'] != nil
      counter = 0 # Number of proximity beacons tracked from this station
      for r in $resources.keys()
        resource2 = $resources[r]
        if resource2['proximity'] != nil && resource2['proximity']['rid'] == resource['rid']
          counter += 1
          resource2['proximity']['continuous'] = resource['continuous']
          $resources[r] = resource2
          publishResourceUpdate(resource2)
        end
      end
      puts counter
      resource['number_resources'] = counter
    end
=end

    # Translate discrete coordinate
    if resource['discrete'] != nil
      resource['discrete'] = translateDiscreteCoordinates(app_id, run_id, resource['discrete'])
    end

    # Send update
    publishResourceUpdate(app_id, run_id, resource)

  end
end

def translateDiscreteCoordinates(app_id, run_id, discrete)
  discrete_tracking = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'discrete_tracking')

  if discrete != nil && discrete_tracking['t_x'] != nil && discrete_tracking['t_y'] != nil
    if discrete_tracking['t_x'] == 'LETTER'
      discrete['x'] = (discrete['x'] + 'a'.ord).chr
    end
    if discrete_tracking['t_y'] == 'LETTER'
      discrete['y'] = (discrete['y'] + 'a'.ord).chr
    end
  end
  discrete
end

# Update the room size
nutella.f.net.subscribe_to_all_runs('location/tracking/discrete/update', lambda do |message, app_id, run_id, from|

 discrete_tracking = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'discrete_tracking')
 tracking = message['tracking']

 if tracking != nil
   x = tracking['x']
   y = tracking['y']
   width = tracking['width']
   height = tracking['height']
   n_x = tracking['n_x']
   n_y = tracking['n_y']
   t_x = tracking['t_x']
   t_y = tracking['t_y']

   if x != nil && y != nil && width != nil && height != nil && n_x != nil && n_y != nil && t_x != nil && t_y != nil
     discrete_tracking['x'] = x
     discrete_tracking['y'] = y
     discrete_tracking['width'] = width
     discrete_tracking['height'] = height
     discrete_tracking['n_x'] = n_x
     discrete_tracking['n_y'] = n_y
     discrete_tracking['t_x'] = t_x
     discrete_tracking['t_y'] = t_y
   else
     discrete_tracking['x'] = nil
     discrete_tracking['y'] = nil
     discrete_tracking['width'] = nil
     discrete_tracking['height'] = nil
     discrete_tracking['n_x'] = nil
     discrete_tracking['n_y'] = nil
     discrete_tracking['t_x'] = nil
     discrete_tracking['t_y'] = nil
   end

   publishDiscreteUpdate(app_id, run_id)
 end

end)


# Publish an added resource
def publishResourceAdd(app_id, run_id, resource)
  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  cache.resources_add([resource])
	#nutella.net.publish('location/resources/added', {:resources => [resource]})
end

# Publish a removed resource
def publishResourceRemove(app_id, run_id, resource)
  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  cache.resources_remove([resource])
	#nutella.net.publish('location/resources/removed', {:resources => [resource]})
end

# Publish an updated resource
def publishResourceUpdate(app_id, run_id, resource)
  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  cache.resources_update([resource])
	#nutella.net.publish('location/resources/updated', {:resources => [resource]})
end

# Publish an updated room
def publishRoomUpdate(app_id, run_id, room)
	nutella.f.net.publish_to_run(app_id, run_id, 'location/room/updated', room)
end

# Publish resources enter base station proximity area
def publishResourcesEnter(app_id, run_id, resources, baseStationRid)
  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  cache.resources_enter(resources, baseStationRid)
end

# Publish resources exit base station proximity area
def publishResourcesExit(app_id, run_id, resources, baseStationRid)
  # Cache
  cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

  cache.resources_exit(resources, baseStationRid)
end

# Publish resource enter base station proximity area
def publishResourceEnter(app_id, run_id, resource, baseStationRid)
  publishResourcesEnter(app_id, run_id, [resource], baseStationRid)
end

# Publish resource enter base station proximity area
def publishResourceExit(app_id, run_id, resource, baseStationRid)
  publishResourcesExit(app_id, run_id, [resource], baseStationRid)
end

# Publish tracking system update
def publishDiscreteUpdate(app_id, run_id)

  resources = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'resources')
  discrete_tracking = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'discrete_tracking')

  x = discrete_tracking['x']
  y = discrete_tracking['y']
  width = discrete_tracking['width']
  height = discrete_tracking['height']
  n_x = discrete_tracking['n_x']
  n_y = discrete_tracking['n_y']
  t_x = discrete_tracking['t_x']
  t_y = discrete_tracking['t_y']

  if x != nil && y != nil && width != nil && height != nil && n_x != nil && n_y != nil && t_x != nil && t_y != nil
    message = {
        :x => x,
        :y => y,
        :width => width,
        :height => height,
        :n_x => n_x,
        :n_y => n_y,
        :t_x => t_x,
        :t_y => t_y
    }
    nutella.f.net.publish_to_run(app_id, run_id, 'location/tracking/discrete/updated', {:tracking => message})

    # Update all the discrete resources
    resources.to_h.each do |_, resource|
      if resource['discrete'] != nil
        computeResourceUpdate(app_id, run_id, resource)
      end
    end

  else
    nutella.f.net.publish_to_run(app_id, run_id, 'location/tracking/discrete/updated', {:tracking => {}})
  end

end

# Request the size of the room
nutella.f.net.handle_requests_on_all_runs('location/room', lambda do |request, app_id, run_id, from|
  room = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'room')

	r = {}

  if room['x'] == nil || room['y'] == nil
    r['x'] = 10
    r['y'] = 7
  else
    r['x'] = room['x']
    r['y'] = room['y']
  end

  if room['z'] != nil
    r['z'] = room['z']
  end

	r
end)

# Request discrete tracking system
nutella.f.net.handle_requests_on_all_runs('location/tracking/discrete', lambda do |request, app_id, run_id, from|

  discrete_tracking = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'discrete_tracking')

  x = discrete_tracking['x']
  y = discrete_tracking['y']
  width = discrete_tracking['width']
  height = discrete_tracking['height']
  n_x = discrete_tracking['n_x']
  n_y = discrete_tracking['n_y']
  t_x = discrete_tracking['t_x']
  t_y = discrete_tracking['t_y']

  if x != nil && y != nil && width != nil && height != nil && n_x != nil && n_y != nil && t_x != nil && t_y != nil
    tracking = {
        :x => x,
        :y => y,
        :width => width,
        :height => height,
        :n_x => n_x,
        :n_y => n_y,
        :t_x => t_x,
        :t_y => t_y
    }
    {:tracking => tracking}
  else
    {:tracking => {}}
  end
end)

# Routine that delete old proximity beacons

while sleep 0.5

  Nutella.runlist.all_apps.each do |app_id|
    Nutella.runlist.runs_for_app(app_id).each do |run_id|
      baseStations = []
      resources = nutella.f.persist.get_run_mongo_object_store(app_id, run_id, 'resources')
      resources.set_auto_save(false)

      resources.to_h.each do |_, resource|
        if resource['proximity'] != nil && resource['proximity']['timestamp'] != nil
          if Time.now.to_f - resource['proximity']['timestamp'] > 5.0
            if resource['proximity']['rid'] != nil
              baseStations.push(resource['proximity']['rid'])
              publishResourceExit(app_id, run_id, resource, resource['proximity']['rid'])
            end
            resource['proximity'] = {}
            resources[resource['rid']] = resource
            publishResourceUpdate(app_id, run_id, resource)
          end
        end
      end

      # Update the counters of the base stations
      for baseStation in baseStations
        computeResourceUpdate(app_id, run_id, baseStation)
      end

      # Cache
      cache = RoomPlacesCachePublish.get_cache(app_id, run_id)

      cache.publish_update
      cache.publish_exit
      cache.publish_enter

      resources.save # Save the resource on the DB
    end
  end

end

# Just sit there waiting for messages to come
nutella.net.listen
