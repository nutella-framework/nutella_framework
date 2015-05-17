var Map = function(mapId, room) {
    var self = {};

    // The size measure are in meters
    self.size = {
        margin_left: 1,
        margin_right: 1,
        margin_top: 1,
        margin_bottom: 1
    };

    self._style = {
        stroke: 0.01,
        arrow_thick: 0.06,
        _arrow_ratio: 2.0,
        font: 0.12,
        resource_name_font: 0.1,
        discrete_symbol_font: 0.1,
        discrete_symbol_font_offset: 0.1,
        quotation_excess: 1.2,
        _quotation_room_offset: 0.4,
        discrete_tracking_dash_length: 0.02,
        discrete_tracking_color: "#777777",
        quotation_color: "#056CF2",
        resource_radius: 0.06,
        resource_radius_hover: 0.2,
        resource_range_stroke: 0.05,
        proximity_range_stroke: 0.01,
        location_range_color: "rgba(216, 242, 242, 0.5)",
        location_range_stroke_color: "#056CF2",
        proximity_range_stroke_color: "#056CF2",
        location_range_stroke_color_overlapped: "#c0392b",
        location_range_color_overlapped: "rgba(231, 76, 60, 0.5)",
        resource_name_offset: 0.07,
        discrete_square_side: 0.07,
        discrete_square_stroke: 0.01
    };

    self.constant = {
        position: {
            top_right: "position.top_right",
            top_left: "position.top_left",
            bottom_right: "position.bottom_right",
            bottom_left: "position.bottom_left"
        }
    };

    self.updateStyle = function(k) {
        self.style = {};
        for(var key in self._style) {
            if(typeof self._style[key] == "string") {
                self.style[key] = self._style[key];
            }
            else {
                if(key[0] == "_")
                    self.style[key.slice(1)] = self._style[key];
                else
                    self.style[key] = self._style[key] * k;
            }

        }
    };

    // Room model
    self.roomManager = room;

    // D3 group containing the room objects
    self.room = null;

    // Contains all the resources data indexed with the RID
    self.resources = {};

    // Contains the discrete tracking system or undefined if not enabled
    self.discreteTracking = undefined;

    // Contains all the graphical resources indexed with the RID
    self.graphicResources = {};

    // Tells if it is during dragging procedure
    self.dragging = false;

    // Render the resources and keep track of them
    self.renderResources = function() {
        self.renderResources();
    };

    // Private variables
    var proximityResourceRangeGroup = undefined;
    var proximityResourceRangeTextGroup = undefined;
    var staticResourceLocationGroup = undefined;
    var staticResourceLocationRangeGroup = undefined;
    var staticResourceLocationRangeBackgroundGroup = undefined;
    var resourceLocationNameGroup = undefined;
    var resourceLocationNumberGroup = undefined;
    var discreteTrackingSystemGroup = undefined;
    var discreteTrackingSystemSquareGroup = undefined;

    // Render the static resources with D3 and keep track of them
    self.renderResources = function() {

        // Check for possible overlap in ranges
        self.checkOverlap();

        var continuousResources = [];
        var discreteResources = [];
        var proximityResources = [];

        for(var r in self.resources) {
            if(self.resources[r].continuous != undefined) {
                continuousResources.push(self.resources[r]);
            }
            else if(self.resources[r].discrete != undefined) {
                if(self.discreteTracking != undefined) {
                    discreteResources.push(self.resources[r]);
                }
            }
            else if(self.resources[r].proximity != undefined &&
                self.resources[r].proximity.rid != undefined &&
                self.resources[r].proximity.distance != undefined) {
                if(self.resources[r].proximity.continuous != undefined) {
                    proximityResources.push(self.resources[r]);
                }
                else if(self.resources[r].proximity.discrete != undefined && self.discreteTracking != undefined) {
                    proximityResources.push(self.resources[r]);
                }
            }
        }

        // Drag & drop behavior for resources
        var drag = d3.behavior.drag()
            //.origin(function(d) { return d; })
            .on("dragstart", function(d){
                d3.select(this)
                    .classed({"dragged": true});

                d.dragged = true;
                self.dragging = true;

                self.renderResources();
            })
            .on("drag", function(d) {

                var x, y;

                d3.select(this)
                    .attr("cx", x = d3.event.x)
                    .attr("cy", y = d3.event.y);

                // Add quotations
                if(d.quotation != undefined)
                    d.quotation.remove();

                // X on the left
                d.quotation = self.drawQuotation(
                    0,
                    y,
                    x,
                    y,
                    Position.bottom,
                    0,
                    x.toPrecision(3),
                    self.style.quotation_color);

                // X on the right
                d.quotation = self.drawQuotation(
                    x,
                    y,
                    self.roomManager.x,
                    y,
                    Position.bottom,
                    0,
                    (self.roomManager.x-x).toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                // Y on the top
                d.quotation = self.drawQuotation(
                    x,
                    0,
                    x,
                    y,
                    Position.left,
                    0,
                    y.toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                // Y on the bottom
                d.quotation = self.drawQuotation(
                    x,
                    y,
                    x,
                    self.roomManager.y,
                    Position.left,
                    0,
                    (self.roomManager.y-y).toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                // Recalculate y
                y = self.roomManager.y - y;


                 if(d.continuous != undefined) {
                    d.continuous = {x: x, y: y};
                 }
                 else if(d.discrete != undefined) {
                    d.discrete = self.continuousToDiscrete({x: x, y: y});
                 }

            })
            .on("dragend", function(d){
                //var x = parseFloat(d3.select(this).attr("cx"));
                //var y = self.roomManager.y - parseFloat(d3.select(this).attr("cy"));

                d3.select(this)
                    .classed({"dragged": false});

                //d.continuous.y = y;

                //var continuous = {x: x, y: y};

                d.dragged = false;
                self.dragging = false;

                // Remove quotation
                if(d.quotation != undefined) {
                    d.quotation.remove();
                }

                // Rend all resources
                self.renderResources();

                if(d.continuous != undefined) {
                    // Update the resource on the server
                    nutella.net.publish("location/resource/update", {rid: d.rid, continuous: d.continuous});
                }
                else if(d.discrete != undefined) {
                    // Update the resource on the server
                    nutella.net.publish("location/resource/update", {rid: d.rid, discrete: d.discrete});
                }
            });

        // Drag & drop behavior for proximity range
        var dragRange = d3.behavior.drag()
            .on("dragstart", function(d){
                self.dragging = true;
            })
            .on("drag", function(d) {

                var x = 0;
                var y = 0;

                if(d.continuous != undefined) {
                    x = d.continuous.x;
                    y = d.continuous.y;
                }
                else if(d.discrete != undefined) {
                    x = self.discreteToContinuous(d.discrete).x;
                    y = self.discreteToContinuous(d.discrete).y;
                }

                // Calculate the new range
                if(d.proximity_range != undefined)
                    d.proximity_range = Math.sqrt(
                            Math.pow(d3.event.x - x, 2)+
                            Math.pow(d3.event.y - (self.roomManager.y - y), 2)
                        );

                // Update graphically the range
                d3.select(this)
                    .attr("r", function(d) {
                        if(d.proximity_range != null) {
                            if(d.dragged == true)
                                return 0;
                            else
                                return d.proximity_range;
                        }
                        else {
                            return 0;
                        }
                    });
            })
            .on("dragend", function(d) {

                self.dragging = false;

                if(d.proximity_range != undefined && d.continuous != undefined) {
                    nutella.net.publish("location/resource/update", {
                        rid: d.rid,
                        proximity_range: d.proximity_range,
                        continuous: d.continuous
                    });
                }
                else if(d.proximity_range != undefined && d.discrete != undefined) {
                    nutella.net.publish("location/resource/update", {
                        rid: d.rid,
                        proximity_range: d.proximity_range,
                        discrete: d.discrete
                    });
                }
            });

        // Continuous resources

        function rid(d) {
            return d.rid;
        }

        // Resource D3 object
        var resourceLocation = staticResourceLocationGroup.selectAll(".resource_location")
            .data(continuousResources.concat(discreteResources), rid);

        // Resource range D3 object
        var resourceLocationRange = staticResourceLocationRangeGroup.selectAll(".resource_location_range")
            .data(continuousResources.concat(discreteResources), rid);

        // Resource range background D3 object
        var resourceLocationRangeBackground = staticResourceLocationRangeBackgroundGroup.selectAll(".resource_location_range_background")
            .data(continuousResources.concat(discreteResources), rid);

        // Resource name (RID)
        resourceLocationNameGroup.selectAll(".resource_location_name").remove();
        var resourceLocationName = resourceLocationNameGroup.selectAll(".resource_location_name")
            .data(continuousResources.concat(discreteResources), rid);

        resourceLocationRangeBackground
            .enter()
            .append("circle")
            .attr("class", "resource_location_range_background")
            .attr("r", function(d) {
                if(d.proximity_range != null) {
                    if(d.dragged == true)
                        return 0;
                    else
                        return d.proximity_range;
                }
                else {
                    return 0;
                }
            })
            .attr("fill", self.style.location_range_color);

        // Update resources that are already there
        resourceLocationRangeBackground
            .attr("cx", function(d) {
                var x = 0;

                if(d.continuous != undefined) {
                    x = d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    x = self.discreteToContinuous(d.discrete).x;
                }

                return x;
            })
            .attr("cy", function(d) {
                var y = 0;

                if(d.continuous != undefined) {
                    y = d.continuous.y;
                }
                else if(d.discrete != undefined) {
                    y = self.discreteToContinuous(d.discrete).y;
                }

                return self.roomManager.y - y;
            })
            .attr("fill", function(d) {
                if(d.overlapped == true) {
                    return self.style.location_range_color_overlapped;
                }
                else
                    return self.style.location_range_color;
            })
            .transition()
            .attr("r", function(d) {
                if(d.proximity_range != null) {
                    if(d.dragged == true)
                        return 0;
                    else
                        return d.proximity_range;
                }
                else {
                    return 0;
                }
            });

        resourceLocationRangeBackground.exit().remove();


        resourceLocationRange
            .enter()
            .append("circle")
            .attr("class", "resource_location_range pointer")
            .attr("r", function(d) {
                if(d.proximity_range != null) {
                    if(d.dragged == true)
                        return 0;
                    else
                        return d.proximity_range;
                }
                else {
                    return 0;
                }
            })
            .attr("fill", "none")
            .attr("stroke", function() {
                return self.style.location_range_stroke_color;
            } )
            .attr("stroke-width", self.style.resource_range_stroke)
            .attr("cx", function(d) {
                var x = 0;

                if(d.continuous != undefined) {
                    x = d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    x = self.discreteToContinuous(d.discrete).x;
                }

                return x;
            })
            .attr("cy", function(d) {
                var y = 0;

                if(d.continuous != undefined) {
                    y = d.continuous.y;
                }
                else if(d.discrete != undefined) {
                    y = self.discreteToContinuous(d.discrete).y;
                }

                return self.roomManager.y - y;
            })
            .call(dragRange);

        // Update resources that are already there
        resourceLocationRange
            .attr("cx", function(d) {
                var x = 0;

                if(d.continuous != undefined) {
                    x = d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    x = self.discreteToContinuous(d.discrete).x;
                }

                return x;
            })
            .attr("cy", function(d) {
                var y = 0;

                if(d.continuous != undefined) {
                    y = d.continuous.y;
                }
                else if(d.discrete != undefined) {
                    y = self.discreteToContinuous(d.discrete).y;
                }

                return self.roomManager.y - y;
            })
            .attr("stroke", function(d) {
                if(d.overlapped == true) {
                    return self.style.location_range_stroke_color_overlapped;
                }
                else {
                    return self.style.location_range_stroke_color;
                }
            } )
            .transition()
            .attr("r", function(d) {
                if(d.proximity_range != null) {
                    if(d.dragged == true)
                        return 0;
                    else
                        return d.proximity_range;
                }
                else {
                    return 0;
                }
            });

        resourceLocationRange.exit().remove();

        resourceLocationName
            .enter()
            .append("text")
            .attr("x", function(d) {
                var x = 0;

                if(d.continuous != undefined) {
                    x = d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    x = self.discreteToContinuous(d.discrete).x;
                }

                return x;
            })
            .attr("y", function(d) {
                var y = 0;

                if(d.continuous != undefined) {
                    y = d.continuous.y;
                }
                else if(d.discrete != undefined) {
                    y = self.discreteToContinuous(d.discrete).y;
                }

                return (self.roomManager.y - y)- self.style.resource_name_offset;
            })
            .attr("class", "resource_location_name no_interaction")
            .attr("text-anchor", "middle")
            .attr("fill", function(d) { if(d.dragged == true) return "none"; else return "black";})
            .attr("font-size", self.style.resource_name_font)
            .text(function(d) { return d.rid; });

        resourceLocationName
            .attr("x", function(d) {
                var x = 0;

                if(d.continuous != undefined) {
                    x = d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    x = self.discreteToContinuous(d.discrete).x;
                }

                return x;
            })
            .attr("y", function(d) {
                var y = 0;

                if(d.continuous != undefined) {
                    y = d.continuous.y;
                }
                else if(d.discrete != undefined) {
                    y = self.discreteToContinuous(d.discrete).y;
                }

                return (self.roomManager.y - y)- self.style.resource_name_offset;
            })
            .attr("fill", function(d) { if(d.dragged == true) return "none"; else return "black";})
            .text(function(d) { return d.rid; });

        resourceLocationName.exit().remove();

        //resourceLocationName.order();

        resourceLocation
            .enter()
            .append("circle")
            .attr("class", "resource_location pointer")
            .attr("r", self.style.resource_radius)
            .attr("fill", "black")
            .attr("cx", function(d) {
                var x = 0;

                if(d.continuous != undefined) {
                    x = d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    x = self.discreteToContinuous(d.discrete).x;
                }

                return x;
            })
            .attr("cy", function(d) {
                var y = 0;

                if(d.continuous != undefined) {
                    y = d.continuous.y;
                }
                else if(d.discrete != undefined) {
                    y = self.discreteToContinuous(d.discrete).y;
                }

                return self.roomManager.y - y;
            })
            .call(drag);

        // Update resources that are already there
        resourceLocation
            .transition()
            .attr("r", self.style.resource_radius)
            .attr("cx", function(d) {
                var x = 0;

                if(d.continuous != undefined) {
                    x = d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    x = self.discreteToContinuous(d.discrete).x;
                }

                return x;
            })
            .attr("cy", function(d) {
                var y = 0;

                if(d.continuous != undefined) {
                    y = d.continuous.y;
                }
                else if(d.discrete != undefined) {
                    y = self.discreteToContinuous(d.discrete).y;
                }

                return self.roomManager.y - y;
            });

        resourceLocation.exit().remove();

        resourceLocation.order();

        // Proximity resources

        // Resource
        var proximityResourceRange = proximityResourceRangeGroup.selectAll(".proximity_resource_range")
            .data(proximityResources, rid);

        proximityResourceRangeTextGroup.selectAll(".proximity_resource_text").remove();
        var proximityResourceText = proximityResourceRangeTextGroup.selectAll(".proximity_resource_text")
            .data(proximityResources, rid);

        proximityResourceRange
            .enter()
            .append("circle")
            .attr("class", "proximity_resource_range")
            .attr("r", function(d) { return d.proximity.distance; })
            .attr("fill", "none")
            .attr("stroke", function() {
                return self.style.proximity_range_stroke_color;
            } )
            .attr("stroke-width", self.style.proximity_range_stroke)
            .attr("cx", function(d) {
                if(d.proximity.continuous != undefined) {
                    return d.proximity.continuous.x;
                }
                else if(d.proximity.discrete != undefined) {
                    return self.discreteToContinuous(d.proximity.discrete).x;
                }
            })
            .attr("cy", function(d) {
                if(d.proximity.continuous != undefined) {
                    return self.roomManager.y - d.proximity.continuous.y;
                }
                else if(d.proximity.discrete != undefined) {
                    return self.roomManager.y - self.discreteToContinuous(d.proximity.discrete).y;
                }
            });

        // Update resources that are already there
        proximityResourceRange
            .attr("cx", function(d) {
                if(d.proximity.continuous != undefined) {
                    return d.proximity.continuous.x;
                }
                else if(d.proximity.discrete != undefined) {
                    return self.discreteToContinuous(d.proximity.discrete).x;
                }
            })
            .attr("cy", function(d) {
                if(d.proximity.continuous != undefined) {
                    return self.roomManager.y - d.proximity.continuous.y;
                }
                else if(d.proximity.discrete != undefined) {
                    return self.roomManager.y - self.discreteToContinuous(d.proximity.discrete).y;
                }
            })
            .transition()
            .attr("r", function(d) { return d.proximity.distance; });

        proximityResourceRange.exit().remove();

        proximityResourceText
            .enter()
            .append("text")
            .attr("class", "proximity_resource_text")
            .attr("x", function(d) {
                if(d.proximity.continuous != undefined) {
                    return d.proximity.continuous.x;
                }
                else if(d.proximity.discrete != undefined) {
                    return self.discreteToContinuous(d.proximity.discrete).x;
                }
            })
            .attr("y", function(d) {
                if(d.proximity.continuous != undefined) {
                    return self.roomManager.y - d.proximity.continuous.y;
                }
                else if(d.proximity.discrete != undefined) {
                    return self.roomManager.y - self.discreteToContinuous(d.proximity.discrete).y;
                }
            })
            .attr("text-anchor", "middle")
            .attr("font-size", self.style.resource_name_font)
            .attr("fill", "black")
            .text(function(d) { return d.rid; });

        // Update resources that are already there
        proximityResourceText
            //.transition()
            .attr("x", function(d) {
                if(d.proximity.continuous != undefined) {
                    return d.proximity.continuous.x;
                }
                else if(d.proximity.discrete != undefined) {
                    return self.discreteToContinuous(d.proximity.discrete).x;
                }
            })
            .attr("y", function(d) {
                if(d.proximity.continuous != undefined) {
                    return self.roomManager.y - d.proximity.continuous.y - d.proximity.distance;
                }
                else if(d.proximity.discrete != undefined) {
                    return self.roomManager.y - self.discreteToContinuous(d.proximity.discrete).y - d.proximity.distance;
                }
            })
            .text(function(d) { return d.rid; });

        proximityResourceText.exit().remove();

        // Number of beacons tracked for every base station
        resourceLocationNumberGroup.selectAll(".resource_location_number").remove();
        var resourceLocationNumber = resourceLocationNumberGroup.selectAll(".resource_location_number")
            .data(continuousResources.concat(discreteResources), rid);
        
        resourceLocationNumber
            .enter()
            .append("text")
            .attr("x", function(d) {
                if(d.continuous != undefined) {
                    return d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    return self.discreteToContinuous(d.discrete).x;
                }
            })
            .attr("y", function(d) {
                if(d.continuous != undefined) {
                    return self.roomManager.y - d.continuous.y + self.style.resource_name_font/3;
                }
                else if(d.discrete != undefined) {
                    return self.roomManager.y - self.discreteToContinuous(d.discrete).y + self.style.resource_name_font/3;
                }
            })
            .attr("class", "resource_location_number no_interaction")
            .attr("text-anchor", "middle")
            .attr("fill", function(d) {
                if(d.dragged == true ||
                    d.number_resources == undefined ||
                    d.number_resources == 0)
                    return "none";
                else
                    return "white";})
            .attr("font-size", self.style.resource_name_font);

        // Update resources that are already there
        resourceLocationNumber
            .attr("x", function(d) {
                if(d.continuous != undefined) {
                    return d.continuous.x;
                }
                else if(d.discrete != undefined) {
                    return self.discreteToContinuous(d.discrete).x;
                }
            })
            .attr("y", function(d) {
                if(d.continuous != undefined) {
                    return self.roomManager.y - d.continuous.y + self.style.resource_name_font/3;
                }
                else if(d.discrete != undefined) {
                    return self.roomManager.y - self.discreteToContinuous(d.discrete).y + self.style.resource_name_font/3;
                }
            })
            .text(function(d) {return d.number_resources; })
            .attr("fill", function(d) {
                if(d.dragged == true ||
                    d.number_resources == undefined ||
                    d.number_resources == 0)
                    return "none";
                else
                    return "white";})
            //.attr("fill", function(d) { return d.number_resources > 0 ? "black" : "none" });

        resourceLocationNumber.exit().remove();

    };

    self.renderDiscreteTrackingSystem = function() {

        if (self.discreteTracking == undefined) {
            discreteTrackingSystemGroup.selectAll(".discreteTrackingSystemGroup").remove();
            return;
        }

        // Drag & drop behavior for discrete tracking system squares
        var squareDrag = d3.behavior.drag()
            .on("dragstart", function(d){
                d3.select(this)
                    .classed({"dragged": true});

                d.dragged = true;

                self.renderResources();
            })
            .on("drag", function(d) {


                // Add quotations
                if(d.quotation != undefined)
                    d.quotation.remove();

                // X on the left
                d.quotation = self.drawQuotation(
                    0,
                    d3.event.y,
                    d3.event.x,
                    d3.event.y,
                    Position.bottom,
                    0,
                    d3.event.x.toPrecision(3),
                    self.style.quotation_color);

                // X on the right
                d.quotation = self.drawQuotation(
                    d3.event.x,
                    d3.event.y,
                    self.roomManager.x,
                    d3.event.y,
                    Position.bottom,
                    0,
                    (self.roomManager.x-d3.event.x).toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                // Y on the top
                d.quotation = self.drawQuotation(
                    d3.event.x,
                    0,
                    d3.event.x,
                    d3.event.y,
                    Position.left,
                    0,
                    d3.event.y.toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                // Y on the bottom
                d.quotation = self.drawQuotation(
                    d3.event.x,
                    d3.event.y,
                    d3.event.x,
                    self.roomManager.y,
                    Position.left,
                    0,
                    (self.roomManager.y - d3.event.y).toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                switch(d.position) {
                    case self.constant.position.bottom_left:
                        self.discreteTracking.width += self.discreteTracking.x - d3.event.x;
                        self.discreteTracking.height += d3.event.y - (self.roomManager.y - self.discreteTracking.y);
                        self.discreteTracking.x = d3.event.x;
                        self.discreteTracking.y = self.roomManager.y - d3.event.y;
                        break;
                    case self.constant.position.bottom_right:
                        self.discreteTracking.width -= self.discreteTracking.x + self.discreteTracking.width - d3.event.x;
                        self.discreteTracking.height += d3.event.y - (self.roomManager.y - self.discreteTracking.y);
                        self.discreteTracking.y = self.roomManager.y - d3.event.y;
                        break;
                    case self.constant.position.top_left:
                        self.discreteTracking.width += self.discreteTracking.x - d3.event.x;
                        self.discreteTracking.height -= d3.event.y - (self.roomManager.y - (self.discreteTracking.y + self.discreteTracking.height));
                        self.discreteTracking.x = d3.event.x;
                        break;
                    case self.constant.position.top_right:
                        self.discreteTracking.width -= self.discreteTracking.x + self.discreteTracking.width - d3.event.x;
                        self.discreteTracking.height -= d3.event.y - (self.roomManager.y - (self.discreteTracking.y + self.discreteTracking.height));
                        break;
                }

                if(self.discreteTracking.width < 0){
                    self.discreteTracking.width = 0;
                }

                if(self.discreteTracking.height < 0){
                    self.discreteTracking.height = 0;
                }

                self.renderDiscreteTrackingSystem();

            })
            .on("dragend", function(d){
                var x = parseFloat(d3.select(this).attr("x"));
                var y = self.roomManager.y - parseFloat(d3.select(this).attr("y"));

                d3.select(this)
                    .classed({"dragged": false});

                self.dragging = false;

                nutella.net.publish("location/tracking/discrete/update", {
                    tracking: self.discreteTracking
                });

                // Remove quotation
                if(d.quotation != undefined) {
                    d.quotation.remove();
                }

            });

        // Draw the lines of the discrete tracking system
        var lines = [];
        var squares = [];

        // Calculate the coordinates for the horizontal lines
        for (i = 0; i <= self.discreteTracking.n_y; i++) {
            lines.push({
                source: {
                    x: self.discreteTracking.x,
                    y: self.discreteTracking.y +
                    self.discreteTracking.height / self.discreteTracking.n_y * i
                },
                destination: {
                    x: self.discreteTracking.x + self.discreteTracking.width,
                    y: self.discreteTracking.y +
                    self.discreteTracking.height / self.discreteTracking.n_y * i
                }
            });
        }

        // Calculate the coordinates for the vertical lines
        for (i = 0; i <= self.discreteTracking.n_x; i++) {
            lines.push({
                source: {
                    x: self.discreteTracking.x +
                    self.discreteTracking.width / self.discreteTracking.n_x * i,
                    y: self.discreteTracking.y
                },
                destination: {
                    x: self.discreteTracking.x +
                    self.discreteTracking.width / self.discreteTracking.n_x * i,
                    y: self.discreteTracking.y +
                    self.discreteTracking.height
                }
            });
        }

        // Calculate the coordinates for the corners
        squares.push({
            x: self.discreteTracking.x,
            y: self.discreteTracking.y,
            position: self.constant.position.bottom_left
        });
        squares.push({
            x: self.discreteTracking.x + self.discreteTracking.width,
            y: self.discreteTracking.y,
            position: self.constant.position.bottom_right
        });
        squares.push({
            x: self.discreteTracking.x,
            y: self.discreteTracking.y + self.discreteTracking.height,
            position: self.constant.position.top_left
        });
        squares.push({
            x: self.discreteTracking.x + self.discreteTracking.width,
            y: self.discreteTracking.y + self.discreteTracking.height,
            position: self.constant.position.top_right
        });

        // Lines
        var linesSelection = discreteTrackingSystemGroup.selectAll("line")
            .data(lines);

        linesSelection.enter()
            .append("line")
            .attr("x1", function (d) {
                return d.source.x
            })
            .attr("y1", function (d) {
                return self.roomManager.y - d.source.y
            })
            .attr("x2", function (d) {
                return d.destination.x
            })
            .attr("y2", function (d) {
                return self.roomManager.y - d.destination.y
            })
            .attr("class", "no_interaction")
            .style("stroke", self.style.discrete_tracking_color)
            .style("stroke-dasharray", ("" + self.style.discrete_tracking_dash_length + "," + self.style.discrete_tracking_dash_length))
            .style("stroke-width", self.style.stroke);

        linesSelection
            .attr("x1", function (d) {
                return d.source.x
            })
            .attr("y1", function (d) {
                return self.roomManager.y - d.source.y
            })
            .attr("x2", function (d) {
                return d.destination.x
            })
            .attr("y2", function (d) {
                return self.roomManager.y - d.destination.y
            });

        linesSelection
            .exit()
            .remove();

        // Squares
        var squareSelection = discreteTrackingSystemSquareGroup.selectAll(".square")
            .data(squares);

        squareSelection.enter()
            .append("rect")
            .classed({"square": true, "pointer": true})
            .attr("x", function (square) {
                return square.x - self.style.discrete_square_side / 2;
            })
            .attr("y", function (square) {
                return self.roomManager.y - (square.y + self.style.discrete_square_side / 2);
            })
            .attr("width", function (square) {
                return self.style.discrete_square_side;
            })
            .attr("height", function (square) {
                return self.style.discrete_square_side;
            })
            .attr("stroke-width", this.style.discrete_square_stroke)
            .attr("stroke", "#000")
            .attr("fill", "#fff")
            .call(squareDrag);

        squareSelection
            .attr("x", function (square) {
                return square.x - self.style.discrete_square_side / 2;
            })
            .attr("y", function (square) {
                return self.roomManager.y - (square.y + self.style.discrete_square_side / 2);
            })
            .attr("width", function (square) {
                return self.style.discrete_square_side;
            })
            .attr("height", function (square) {
                return self.style.discrete_square_side;
            });

        squareSelection.exit()
            .remove();

        var symbols = [];

        // Horizontal numbers or letters
        for(var i = 0; i < self.discreteTracking.n_x; i++) {
            symbol = {};
            symbol.x = self.discreteTracking.x +
                self.discreteTracking.width / self.discreteTracking.n_x * (i + 1/2);
            symbol.y = self.discreteTracking.y -
                self.style.discrete_symbol_font_offset;

            switch(self.discreteTracking.t_x) {
                case "NUMBER":
                    symbol.symbol = i;
                    break;
                case "LETTER":
                    symbol.symbol = String.fromCharCode(97 + i);
                    break;
            }

            symbols.push(symbol);
        }

        // Vertical numbers or letters
        for(var i = 0; i < self.discreteTracking.n_y; i++) {
            symbol = {};
            symbol.x = self.discreteTracking.x -
                self.style.discrete_symbol_font_offset;
            symbol.y = self.discreteTracking.y +
                self.discreteTracking.height / self.discreteTracking.n_y * (i + 1/2);
            ;

            switch(self.discreteTracking.t_y) {
                case "NUMBER":
                    symbol.symbol = i;
                    break;
                case "LETTER":
                    symbol.symbol = String.fromCharCode(97 + i);
                    break;
            }

            symbols.push(symbol);
        }

        // Symbols
        var symbolsSelection = discreteTrackingSystemGroup.selectAll(".symbol")
            .data(symbols);

        symbolsSelection.enter()
            .append("text")
            .classed({"symbol": true, "no_interaction": true})
            .attr("x", function(symbol) {return symbol.x})
            .attr("y", function(symbol) {return self.roomManager.y - symbol.y})
            .attr("font-size", this.style.discrete_symbol_font)
            .text(function(symbol) { return symbol.symbol;});

        symbolsSelection
            .transition()
            .attr("x", function(symbol) {return symbol.x})
            .attr("y", function(symbol) {return self.roomManager.y - symbol.y})
            .text(function(symbol) { return symbol.symbol;});

        symbolsSelection.exit()
            .remove();
    };

    // Render the map from the beginning
    self.render = function() {

        var height = self.roomManager.y + self.size.margin_top  + self.size.margin_bottom;
        var width  = self.roomManager.x + self.size.margin_left + self.size.margin_right;

        self.svg.attr("viewBox", "0 0 " + width + " " + height);

        if(self.room != null) {
            self.room.remove();
        }

        // Group that contains all the elements of the room
        self.room = self.svg.append("g")
            .attr("transform", "translate("+ self.size.margin_left +","+ self.size.margin_top +")");

        // Clip path used in order to crop elements outside the room
        var defs = self.room.append("defs");

        defs.append("rect")
            .attr("id", "rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", self.roomManager.x)
            .attr("height", self.roomManager.y)
            .attr("fill", "black")
            .attr("stroke", "blue");

        defs.append("clipPath")
            .attr("id", "clip")
                .append("use")
                .attr({"xlink:href": "#rect"});

        self.room.clip = self.room.append("g")
            .attr("clip-path", "url(#clip)");

        self.room.unclip = self.room.append("g");

        // Rectangle that represent the room
        self.rect = self.room.unclip.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", self.roomManager.x)
            .attr("height", self.roomManager.y)
            .style("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", self.style.stroke);

        // Vertical room quotation
        self.drawQuotation(0, 0,                   0,                  self.roomManager.y, Position.left,   0.5, self.roomManager.y, self.style.quotation_color, function() {
            var newHeight = prompt("Insert new height", self.roomManager.y);
            var y = parseFloat(newHeight);

            if(newHeight != undefined) {
                self.roomManager.y = y;
                self.render();
            }
        });

        // Horizontal room quotation
        self.drawQuotation(0, self.roomManager.y,  self.roomManager.x, self.roomManager.y, Position.bottom, 0.5, self.roomManager.x, self.style.quotation_color, function() {
            var newWidth = prompt("Insert new width", self.roomManager.x);
            var x = parseFloat(newWidth);

            if(newWidth != undefined) {
                self.roomManager.x = x;
                self.render();
            }
        });

        // Create all the groups
        staticResourceLocationRangeBackgroundGroup = self.room.clip.append("g").attr("class", "staticResourceLocationRangeBackgroundGroup");
        resourceLocationNameGroup = self.room.unclip.append("g").attr("class", "resourceLocationNameGroup");
        proximityResourceRangeGroup = self.room.clip.append("g").attr("class", "proximityResourceRangeGroup");
        proximityResourceRangeTextGroup = self.room.clip.append("g").attr("class", "proximityResourceRangeTextGroup");
        discreteTrackingSystemGroup = self.room.unclip.append("g").attr("class", "discreteTrackingSystemGroup");
        staticResourceLocationRangeGroup = self.room.clip.append("g").attr("class", "staticResourceLocationRangeGroup");
        staticResourceLocationGroup = self.room.unclip.append("g").attr("class", "staticResourceLocationGroup");
        discreteTrackingSystemSquareGroup = self.room.unclip.append("g").attr("class", "discreteTrackingSystemSquareGroup");
        resourceLocationNumberGroup = self.room.unclip.append("g").attr("class", "resourceLocationNumberGroup");

        self.renderDiscreteTrackingSystem();
        self.renderResources();
    };

    self.drawArrow = function(x, y, color, position, element) {

        if(element == null)
            element = self.svg;

        var lineData = [
            { "x":  0.0, "y": 0.0},
            { "x":  1*self.style.arrow_thick/self.style.arrow_ratio, "y": 1*self.style.arrow_thick*self.style.arrow_ratio},
            { "x": -1*self.style.arrow_thick/self.style.arrow_ratio, "y": 1*self.style.arrow_thick*self.style.arrow_ratio}
        ];

        var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("linear");

        // calculate rotation
        var angle;
        switch(position) {
            case Position.top:    angle = 0;   break;
            case Position.bottom: angle = 180; break;
            case Position.right:  angle = 90;  break;
            case Position.left:   angle = 270; break;
            default:              angle = 0;
        }

        var arrow = element.append("g")
            .attr("transform", "translate(" + x + "," + y + ")")
                .append("path")
            .attr("d", lineFunction(lineData))
            .attr("fill", color)
            .attr("transform", "rotate("+angle+")");

        return arrow;
    };

    self.drawQuotation = function(x1, y1, x2, y2, position, offset, quotationText, color, onClick, quotationObject) {

        var quotation;
        if(quotationObject == undefined) {
            quotation = self.room.unclip.append("g");
        }
        else {
            quotation = quotationObject;
        }

        // Calculate the offsets in two dimensions
        var ox, oy;

        switch(position) {
            case Position.bottom:
                ox = 0;
                oy = offset;

                break;
            case Position.top:
                ox = 0;
                oy = -offset;

                break;
            case Position.left:
                ox = -offset;
                oy = 0;

                break;
            case Position.right:
                ox = offset;
                oy = 0;
                break;
        }

        var text = quotation.append("text")
            .text(quotationText)
            .attr("x", (x1+x2)/2 + ox)
            .attr("y", (y1+y2)/2 + oy + self.style.font / 3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .attr("fill", color);


        if(onClick != null) {
            text.on("click", onClick);
            text.classed("pointer",true);
        }

        // Get the text length
        var textWidth = quotation.select("text").node().getBBox().width;
        var textHeight = quotation.select("text").node().getBBox().height;

        var sx, sy;

        switch(position) {
            case Position.bottom:
            case Position.top:
                sx = textWidth / 2;
                sy = 0;

                quotation.append("line")
                    .attr("x1", x1 + ox)
                    .attr("x2", (x1+x2)/2 + ox - sx)
                    .attr("y1", y1 + oy)
                    .attr("y2", y2 + oy)
                    .style("stroke", color)
                    .style("stroke-width", self.style.stroke);

                quotation.append("line")
                    .attr("x1", (x1+x2)/2 + ox + sx)
                    .attr("x2", x2 + ox)
                    .attr("y1", y1 + oy)
                    .attr("y2", y2 + oy)
                    .style("stroke", color)
                    .style("stroke-width", self.style.stroke);

                self.drawArrow(x1+ox, y1+oy, color, Position.left, quotation);
                self.drawArrow(x2+ox, y2+oy, color, Position.right, quotation);

                break;

            case Position.left:
            case Position.right:
                sx = 0;
                sy = textHeight / 2;

                quotation.append("line")
                    .attr("x1", x1 + ox)
                    .attr("x2", x2 + ox)
                    .attr("y1", y1 + oy)
                    .attr("y2", (y1+y2)/2 + oy - sy/2)
                    .style("stroke", color)
                    .style("stroke-width", self.style.stroke);

                quotation.append("line")
                    .attr("x1", x1 + ox)
                    .attr("x2", x2 + ox)
                    .attr("y1", (y1+y2)/2 + oy + sy/2)
                    .attr("y2", y2 + oy)
                    .style("stroke", color)
                    .style("stroke-width", self.style.stroke);

                self.drawArrow(x1+ox, y1+oy, color, Position.top, quotation);
                self.drawArrow(x2+ox, y2+oy, color, Position.bottom, quotation);

                break;
        }


        quotation.append("line")
            .attr("x1", x1)
            .attr("x2", x1+ox*self.style.quotation_excess)
            .attr("y1", y1)
            .attr("y2", y1+oy*self.style.quotation_excess)
            .style("stroke", color)
            .style("stroke-width", self.style.stroke);

        quotation.append("line")
            .attr("x1", x2)
            .attr("x2", x2+ox*self.style.quotation_excess)
            .attr("y1", y2)
            .attr("y2", y2+oy*self.style.quotation_excess)
            .style("stroke", color)
            .style("stroke-width", self.style.stroke);

        return quotation;
    };

    // Check if two static resources are overlapped and ser overlapped=true in case
    self.checkOverlap = function() {
        for(r1 in self.resources) {
            self.resources[r1].overlapped = false;
            for(r2 in self.resources) {
                if( r1 != r2 ) {
                    var resource1 = self.resources[r1];
                    var resource2 = self.resources[r2];

                    var continuous1, continuous2;

                    if(resource1.continuous != undefined) {
                        continuous1 = resource1.continuous;
                    }
                    else if(resource1.discrete != undefined) {
                        continuous1 = self.discreteToContinuous(resource1.discrete);
                    }

                    if(resource2.continuous != undefined) {
                        continuous2 = resource2.continuous;
                    }
                    else if(resource2.discrete != undefined) {
                        continuous2 = self.discreteToContinuous(resource2.discrete);
                    }

                    if(continuous1 != undefined &&
                        continuous2 != undefined &&
                        resource1.proximity_range != null &&
                        resource2.proximity_range != null) {

                        // Check if the distance is less than the sum of proximity ranges
                        var distance = Math.sqrt(
                                        Math.pow(continuous1.x - continuous2.x,2)
                                      + Math.pow(continuous1.y - continuous2.y,2));

                        var sumRange = parseFloat(resource1.proximity_range) + parseFloat(resource2.proximity_range);

                        if(distance < sumRange) {
                            resource1.overlapped = true;
                        }
                    }
                }
            }
        }
    };

    self.discreteToContinuous = function(discrete) {

        if(self.discreteTracking == undefined) {
            return undefined;
        }

        var x = discrete.x;
        var y = discrete.y;

        var continuous = {x: undefined, y: undefined};

        if(typeof discrete.x == "string") {
            x = x.charCodeAt(0) - "a".charCodeAt(0);
        }
        if(typeof discrete.y == "string") {
            y = y.charCodeAt(0) - "a".charCodeAt(0);
        }

        continuous.x = self.discreteTracking.x +
            (self.discreteTracking.width / self.discreteTracking.n_x) * x +
            (self.discreteTracking.width / self.discreteTracking.n_x) / 2;

        continuous.y = self.discreteTracking.y +
            (self.discreteTracking.height / self.discreteTracking.n_y) * y +
            (self.discreteTracking.height / self.discreteTracking.n_y) / 2;

        return continuous;

    };

    self.continuousToDiscrete = function(continuous) {

        if(self.discreteTracking == undefined) {
            return undefined;
        }

        var x = continuous.x;
        var y = continuous.y;

        var discrete = {x: undefined, y: undefined};

        discrete.x = Math.floor(
            (continuous.x - self.discreteTracking.x) /
            (self.discreteTracking.width / self.discreteTracking.n_x)
        );

        discrete.y = Math.floor(
            (continuous.y - self.discreteTracking.y) /
            (self.discreteTracking.height / self.discreteTracking.n_y)
        );

        // Translate in letters if necessary
        if(self.discreteTracking.t_x == "LETTER") {
            discrete.x = String.fromCharCode("a".charCodeAt(0) + discrete.x);
        }
        if(self.discreteTracking.t_y == "LETTER") {
            discrete.y = String.fromCharCode("a".charCodeAt(0) + discrete.y);
        }


        return discrete;
    };


    self.init = function() {

        self.svg = d3.select(mapId);

        self.updateStyle(1);

        self.render();

        // Download all resources
        nutella.net.request("location/resources", {}, function(reply) {
            for(var r in reply.resources) {
                var resource = reply.resources[r];
                if(resource["continuous"] != null ||
                    resource["discrete"] != null  ||
                    resource["proximity"] != null) {
                    self.resources[resource.rid] = resource;
                }
            }

            //self.renderResources();
        });

        var updateResource = function(message) {
            var resources = message.resources;
            var changed = false;

            for(var r in resources) {
                var resource = resources[r];
                if(resource["continuous"] != null ||
                    resource["discrete"] != null  ||
                    resource["proximity"] != null) {
                    self.resources[resource.rid] = resource;
                    changed = true;
                }
                else {
                    delete self.resources[resource.rid];
                    changed = true;
                }
            }

            if(changed) {
                //self.renderResources();
            }
        };

        // Update resources
        nutella.net.subscribe("location/resources/updated", updateResource);

        // Add resources
        nutella.net.subscribe("location/resources/added", updateResource);

        // Delete resources
        nutella.net.subscribe("location/resources/removed", function(message) {
            var resources = message.resources;

            for(var r in resources) {
                delete self.resources[resources[r].rid];
            }

            //self.renderResources();
        });

        // Update disctete tracking system
        nutella.net.subscribe("location/tracking/discrete/updated", function(message) {
            var tracking = message["tracking"];
            if(_.isEmpty(tracking)) {
                tracking = undefined;
            }
            self.discreteTracking = tracking;
            self.render();
        });


        // Download discrete tracking system if present
        nutella.net.request("location/tracking/discrete", {}, function(reply) {
            var tracking = reply["tracking"];
            if(_.isEmpty(tracking)){
                tracking = undefined;
            }
            self.discreteTracking = tracking;
            self.render();
        });

        // Update the whole map
        room.observers.push(function() {

            // Update the look and feel
            var d = Math.max(room.x, room.y);
            self.updateStyle(d/7.0);

            self.render();
        });

        // Update resources position once a second
        setInterval( function() {
            if(self.dragging == false) {
                self.renderResources();
            }
        }, 200);

    }();

    return self;
}