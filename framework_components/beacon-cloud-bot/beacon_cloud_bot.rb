require 'nutella_lib'
require 'json'


# Parse command line arguments
broker, app_id, run_id = nutella.parse_args ARGV
# Extract the component_id
component_id = nutella.extract_component_id
# Initialize nutella
nutella.init(broker, app_id, run_id, component_id)

puts "Beacon cloud initialization"

# Open the resources database
beacons = nutella.persist.get_json_object_store("beacons.json")

# Contains virtual beacon codes that are created for iPads
virtualBeacons = {}
major = 0
minor = 0
uuid = '00000000-0000-0000-0000-000000000000'

# Create new beacon
nutella.net.subscribe("beacon/beacon/add", lambda do |message, from|
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
nutella.net.subscribe("beacon/beacon/remove", lambda do |message, from|
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
	nutella.net.publish("beacon/beacons/added", {:beacons => [beacon]});
end

# Publish an remove beacon
def publishBeaconRemove(beacon)
	puts beacon
	nutella.net.publish("beacon/beacons/removed", {:beacons => [beacon]});
end

# Request all the beacons
nutella.net.handle_requests("beacon/beacons", lambda do |request, from|
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
nutella.net.handle_requests("beacon/uuids", lambda do |request, from|
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
nutella.net.handle_requests("beacon/virtual_beacon", lambda do |request, from|
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

puts "Initialization completed"

# Just sit there waiting for messages to come
nutella.net.listen
