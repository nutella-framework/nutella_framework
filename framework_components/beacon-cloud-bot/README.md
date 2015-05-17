# beacon-cloud-bot
This is a RoomPlaces bot, it keep tracks of information about beacons in order to decouple low level technical details with the resource name needed by RoomPlaces.

In order to interact with this bot you can use the library Nutella client library using the methods described below:

## Publish - Subscribe channels

| Channel                         | Function                   | Direction         | Content                                            |
| ------------------------------- | -------------------------- | ----------------- | -------------------------------------------------- |
| /beacon/beacon/add              | Add a new beacon           | client -> server  | \<beacon\>                                         |
| /beacon/beacon/remove           | Remove a beacon            | client -> server  | {rid: ''}                                          |
| /beacon/beacon/added            | Remove a beacon            | client -> server  | {beacons: [\<beacon\>*]}                           |
| /beacon/beacon/removed          | Remove a beacon            | client -> server  | {beacons: [\<beacon\>*]}                           |



## Request - Response channels

| Channel                    | Function                   | Request -> Response | Request           | Response                              |
| -------------------------- | -------------------------- | ------------------- | ----------------- | ------------------------------------- |
| /beacon/beacons            | Request all the beacons    | client -> server    | {}                | {beacons: [\<beacon\>*]}              |
| /beacon/uuids              | Request all the uuids      | client -> server    | {}                | {uuids: [''*]}                        |
| /beacon/virtual_beacon   | Request new iBeacon codes  | client -> server    | {rid:'\<string\>} | {major: \<int\>, minor: \<int\>}      |      |



\<beacon\> ::= {rid: '', major: '\<number\>', minor: '\<number\>'}
