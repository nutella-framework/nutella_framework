require 'nutella_lib'
require 'json'

require_relative '../../lib/config/runlist'
require_relative '../../lib/config/config'
require_relative '../../nutella_lib/framework_core'

# Initialize nutella
nutella.f.init(Nutella.config['broker'], 'beacon-cloud-bot')

puts "Beacon cloud initialization"

# Open the resources database
beacons = nutella.f.persist.get_json_object_store("beacons")

# Contains virtual beacon codes that are created for iPads
virtualBeacons = {}
major = 0
minor = 0
uuid = '00000000-0000-0000-0000-000000000000'

# Create new beacon
nutella.f.net.subscribe("beacon/beacon/add", lambda do |message, from|
										puts message
										rid = message["rid"]
										uuid = message["uuid"]
										major = message["major"]
										minor = message["minor"]

										if rid != nil && uuid != nil && major != nil && minor != nil

                      if beacons[rid] == nil
                        beacons[rid] = {
                          :rid => rid,
                          :uuid => uuid,
                          :major => major,
                          :minor => minor
                        }

                        publishBeaconAdd(beacons[rid])
                        puts("Added beacon")
                      end
										end
									end)

# Create new beacon
nutella.f.net.subscribe("beacon/beacon/remove", lambda do |message, from|
										puts message
										rid = message["rid"]

										if rid != nil
                      if beacons[rid] != nil
                        beacon = beacons[rid]

                        beacons.delete(rid)

                        publishBeaconRemove(beacon)
                        puts("Removed resource")
                      end
										end
									end)

# Publish an added beacon
def publishBeaconAdd(beacon)
	puts beacon
	nutella.f.net.publish("beacon/beacons/added", {:beacons => [beacon]})
  nutella.f.net.publish_to_all_runs("beacon/beacons/added", {:beacons => [beacon]})
end

# Publish an remove beacon
def publishBeaconRemove(beacon)
	puts beacon
	nutella.f.net.publish("beacon/beacons/removed", {:beacons => [beacon]})
  nutella.f.net.publish_to_all_runs("beacon/beacons/removed", {:beacons => [beacon]})
end

# Request all the beacons
nutella.f.net.handle_requests("beacon/beacons", lambda do |request, from|
	puts "Send the beacon list"
	beaconList = []

  beacons.to_h.each do |key, beacon|
    beaconList.push(beacon)
  end

  virtualBeacons.each do |key, beacon|
    beaconList.push(beacon)
  end
	{:beacons => beaconList}
end)

# Request all the beacons
nutella.f.net.handle_requests_on_all_runs("beacon/beacons", lambda do |request, app_id, run_id, from|
  puts "Send the beacon list"
  beaconList = []

  beacons.to_h.each do |key, beacon|
    beaconList.push(beacon)
  end

  virtualBeacons.each do |key, beacon|
    beaconList.push(beacon)
  end
  {:beacons => beaconList}
end)

# Request all the UUIDs
nutella.f.net.handle_requests_on_all_runs("beacon/uuids", lambda do |request, app_id, run_id, from|
	puts "Send the uuid list"
	uuidList = []
  beacons.to_h.each do |key, beacon|
    if !uuidList.include? beacon["uuid"]
      uuidList.push(beacon["uuid"])
    end
  end

	{:uuids => uuidList}
end)

# Request virtual beacon codes
nutella.f.net.handle_requests_on_all_runs("beacon/virtual_beacon", lambda do |request, app_id, run_id, from|
  if request["rid"] != nil
    rid = request["rid"]
    virtualBeacon = virtualBeacons[rid]
    if virtualBeacon == nil
      puts "Create new virtual beacon major: #{major}, minor: #{minor}"
      virtualBeacons[rid] = {
          :rid => rid,
          :uuid => uuid,
          :major => "#{major}",
          :minor => "#{minor}",
          :virtual => true
      }
      minor += 1
      if minor != minor % 65536
        major += 1
      end
      minor = minor % 65536
      virtualBeacon = virtualBeacons[rid]
      publishBeaconAdd(virtualBeacon)
      puts("Added virtual-beacon")
    end
    virtualBeacon
  end
end)

puts "Beacon cloud Initialization completed"

# Just sit there waiting for messages to come
nutella.f.net.listen
