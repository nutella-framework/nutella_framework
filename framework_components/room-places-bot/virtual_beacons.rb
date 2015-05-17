require 'nutella_lib'
require 'net/http'
require 'net/https'
require 'uri'
require 'json'

# Parse command line arguments
run_id, broker = nutella.parse_args ARGV

baseStationRid = 'iPad2'
beaconRid = 'beacon1'

# Parse command line arguments
broker, app_id, run_id = nutella.parse_args ARGV
# Extract the component_id
component_id = nutella.extract_component_id
# Initialize nutella
nutella.init(broker, app_id, run_id, component_id)


puts 'Virtual beacon initialization'

# Publish an updated resource
def publishResourceUpdate(baseStationRid, beaconRid, distance)
		nutella.net.publish('location/resource/update', {
	    		'rid' => beaconRid,
	    		'proximity' => {
	    			'rid' => baseStationRid,
	    			'distance' => distance
	    		}
	    	})
end

def publishResourcesUpdate(baseStationsRid, beaconsRid, distance)
  resources = []

  baseStationsRid.each_with_index do |baseStationRid, i|
    resources << {
        'rid' =>  beaconsRid[i],
        'proximity' => {
            'rid' => baseStationRid,
            'distance' => distance
        }
    }
  end

  nutella.net.publish('location/resources/update', {'resources' => resources} )
end

d1 = ["vb1",
      "vb2",
      "vb3",
      "vb4",
      "vb5",
      "vb6",
      "vb7",
      "vb8",
      "vb9",
      "vb10"
      ]

d2 = ["vb11",
      "vb12",
      "vb13",
      "vb14",
      "vb15",
      "vb16",
      "vb17",
      "vb18",
      "vb19",
      "vb20"
]

d3 = ["vb21",
      "vb22",
      "vb23",
      "vb24",
      "vb25",
      "vb26",
      "vb27",
      "vb28",
      "vb29",
      "vb30"
]

d4 = ["vb31",
      "vb32",
      "vb33",
      "vb34",
      "vb35",
      "vb36",
      "vb37",
      "vb38",
      "vb39",
      "vb40"
]

# Routine that delete old proximity beacons
Thread.new do
  i = 0
  while true do
    #publishResourceUpdate("Table1", "beacon1", 1.0);
    puts ">"
    if i % 2 == 0
      puts "Table1"
      publishResourcesUpdate(["Table1"]*10, d1, 0.5)
    else
      puts "Table2"
      publishResourcesUpdate(["Table2"]*10, d1, 0.5)
    end

    i += 1

    #publishResourcesUpdate(["Table2"]*10, d2, rand(10...100)/60);
    #publishResourcesUpdate(["Table3"]*10, d3, rand(10...100)/60);
    #publishResourcesUpdate(["Table4"]*10, d4, rand(10...100)/60);
    sleep 1
  end
end

puts "Initialization completed"

# Just sit there waiting for messages to come
nutella.net.listen
