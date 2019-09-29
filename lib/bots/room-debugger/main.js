var queryParams = NUTELLA.parseURLParameters();
var componentId = NUTELLA.parseComponentId();
var run_id = queryParams.run_id;
var app_id = queryParams.app_id;


// Initialize nutella and interface
var nutella = NUTELLA.init(queryParams.broker, app_id, run_id, componentId);
$('.navbar-right').append("<li><a>"+queryParams.app_id+"</a></li>")
    .append("<li><a>"+run_id+"</a></li>");

//$(window).scroll(function(){
//   console.log('this');
//});


// PUB/SUB -------------------------------------------------------


// Publish
$("#publish_frm").submit(function(e) {
    e.preventDefault();
    var inputs = $('#publish_frm :input');
    nutella.net.publish(inputs[0].value, inputs[1].value)
});


// Subscribe
$("#sub_frm").submit(function(e) {
    e.preventDefault();
    var channel = $('#sub_frm :input')[0];
    $("#sub_list").append('<span class="label label-default">' + channel.value + '</span>').append(" ");
    nutella.net.subscribe(channel.value, function(message, from){
        appendMessage(channel.value, message, from);
    });
});


// Unsubscribe
$("#sub_frm").on('click', ".label-default", function(e){
    this.remove();
    nutella.net.unsubscribe(this.innerText);
});


// Append messages to table
function appendMessage(channel, message, from) {
    $("#messages").prepend('<tr><td>' + channel + '</td><td>' + JSON.stringify(message)+ '</td><td>' + JSON.stringify(from) + '</td></tr>');
}


// Remove all messages
$("#remove_messages").click(function(){
   console.log("pippo");
    $("#messages tbody").empty();
});


// REQ/RES -------------------------------------------------------


// Request
$("#request_frm").submit(function(e) {
    e.preventDefault();
    var inputs = $('#request_frm :input');
    nutella.net.request(inputs[0].value, inputs[1].value, function(res){
        if (typeof res === 'object')
            $("#response").text(JSON.stringify(res));
        else
            $("#response").text(res);
    });
});


// Handle request
$("#handle_frm").submit(function(e) {
    e.preventDefault();
    if ($('#handle_btn').hasClass('btn-danger')) {
        $('#handle_req_ch').prop('disabled', false);
        $('#handle_req_cb').prop('disabled', false);
        $('#handle_btn').removeClass('btn-danger').text('Handle request');
    } else {
        $('#handle_req_ch').prop('disabled', true);
        $('#handle_req_cb').prop('disabled', true);
        $('#handle_btn').addClass('btn-danger').text('Stop handling request');
        var channel = $('#handle_req_ch').val();
        var response = $('#handle_req_cb').val();
        nutella.net.handle_requests(channel, function(req, from) {
            return response;
        });
    }
});



// SIM -------------------------------------------------------

var rp_sim = new RoomPlacesSimulator(nutella);


nutella.location.ready(function() {
    var resources = nutella.location.resources;
    var hotspots = resources.filter(function(el){
        return el.type==='STATIC';
    }).map(function(el){
        return el.rid;
    });
    var beacons = resources.filter(function(el){
        return el.model==='IBEACON';
    }).map(function(el){
        return el.rid;
    });
    var minDistance = resources.filter(function(el){
        return el.type==='STATIC';
    }).map(function(el){
        return el.proximity_range;
    }).reduce(function(prev, cur){
        return cur < prev ? cur : prev;
    }, Infinity);
    // Update UI
    $("#beacon_ls").val(beacons.join(', '));
    $("#hotsp_ls").val(hotspots.join(', '));
    $("#distance_fr").val(Math.floor(minDistance / 3 * 100) / 100);
});


// Start / stop simulator
$("#sim_frm").submit(function(e) {
    e.preventDefault();
    if ($('#start_sim_btn').hasClass('btn-danger')) {
        $("#beacon_ls").prop('disabled', false);
        $("#hotsp_ls").prop('disabled', false);
        $("#distance_fr").prop('disabled', false);
        $('#start_sim_btn').removeClass('btn-danger').addClass('btn-success').text('Start simulator');
        // Stop simulator
        rp_sim.stop();
    } else {
        $("#beacon_ls").prop('disabled', true);
        $("#hotsp_ls").prop('disabled', true);
        $("#distance_fr").prop('disabled', true);
        $('#start_sim_btn').removeClass('btn-success').addClass('btn-danger').text('Stop simulator');
        // Configure and start simulator
        rp_sim.setHotspots($("#hotsp_ls").val().split(", "));
        rp_sim.setBeacons($("#beacon_ls").val().split(", "));
        rp_sim.setDistance(parseFloat($("#distance_fr").val()));
        rp_sim.start();
    }
});
