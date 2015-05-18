var UIConnectionView = function(delegate) {
    var self = UIElement(delegate);

    // Protected variables
    self._components = undefined;

    // Static attributes
    UIConnectionView.style = {
        margin: 100,
        linkTension: 0.6,
        componentThickness: 10,
        arrow_thick: 11,
        arrow_ratio: 1.5,
        square_side: 10.0,
        componentNameFontSize: 15.0,
        linkTextSize: 10,
        linkTextSizeHold: 13,
        labelLinkLength: 80,
        labelLinkWidth: 1,
        labelLinkColor: defaultPalette.text.dark,
        labelFieldSize: 200,
        toolBoxesWidth: 100,
        toolBoxHeight: 20,
        toolBoxTextTopMargin: 15
    };

    // Private variables
    self._innerRadius = undefined;
    self._outerRadius = undefined;

    // Render the element
    self.render = function() {

        var layer = self.view;

        var componentsData = self.delegate.instanceComponentData;

        var noDataLayer = layer.layerWithName("no_data");
        var links = layer.layerWithName("links");
        var components = layer.layerWithName("components");
        var componentNames = layer.layerWithName("componentNames");
        var channelTexts = layer.layerWithName("channelTexts");
        var componentLabels = layer.layerWithName("componentLabels");
        var componentToolBoxes = layer.layerWithName("componentToolBoxes");

        var noComponentLabel = noDataLayer.selectAll(".no_data_text")
            .data([{}])
            .enter()
            .append("text")
            .class("no_data_text")
            .fill(defaultPalette.text.dark)
            .attr("text-anchor", "middle")
            .class("no_interaction")
            .text("No components or channels present");

        var noChannels = true;  // True when all components don't have channels
        if(componentsData != undefined) {
            componentsData.forEach(function (component) {
                if ((component.publish != undefined && component.publish.length > 0) ||
                    (component.subscribe != undefined && component.subscribe.length > 0) ||
                    (component.handle_request != undefined && component.handle_request.length > 0) ||
                    (component.request != undefined && component.request.length > 0)) {
                    noChannels = false;
                }

                component.publish.forEach(function(publish) {
                    if(publish.channel == "pings") {
                        publish.channel = "";
                    }
                });

                component.publish.sort();
            });
        }
        else {
            noChannels = false;
        }

        if((componentsData == undefined ||
            componentsData.length == 0 ||
            noChannels == true) &&
                self.delegate.expanded == true) {
            noDataLayer.selectAll(".no_data_text").opacity(1);
            components.remove();
            channelTexts.remove();
            links.remove();
            componentNames.remove();
            componentLabels.remove();
            componentToolBoxes.remove();
            return;
        }
        else {
            noDataLayer.selectAll(".no_data_text").opacity(0);
        }

        // Create triangles for the subscribed channels
        var arrowData = [
            { "x":  0.0, "y": 0.0},
            { "x":  1*UIConnectionView.style.arrow_thick/UIConnectionView.style.arrow_ratio, "y": 1*UIConnectionView.style.arrow_thick},
            { "x": -1*UIConnectionView.style.arrow_thick/UIConnectionView.style.arrow_ratio, "y": 1*UIConnectionView.style.arrow_thick}
        ];

        var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("linear");

        // Take the width of the screen
        self._innerRadius = Math.min(windowViewController.height, windowViewController.width) / 2 - UIConnectionView.style.margin
                            - UIConnectionView.style.labelLinkLength;
        self._outerRadius = self._innerRadius + UIConnectionView.style.componentThickness;

        var openOptionRect = function(component, index){
          d3.select("#SubscribeBox"+index)
              .transition()
            .height(UIConnectionView.style.toolBoxHeight);
            d3.select("#MessageBox"+index)
                .transition()
                .height(UIConnectionView.style.toolBoxHeight);
            d3.select("#SubscribeText"+index)
                .transition()
                .delay(250)
                .opacity(1);
            d3.select("#SendMessageText"+index)
                .transition()
                .delay(250)
                .opacity(1);
        };

        var closeOptionRect = function(component, index){
            d3.select("#SubscribeBox"+index)
                .transition()
                .delay(250)
                .height(0);
            d3.select("#SubscribeText"+index)
                .transition()
                .duration(100)
                .delay(250)
                .opacity(0);
            d3.select("#SendMessageText"+index)
                .transition()
                .duration(100)
                .delay(250)
                .opacity(0);
            d3.select("#MessageBox"+index)
                .transition()
                .delay(250)
                .height(0);
        };

        var rotateArrowDown = function(component,index){
            var origin = {
                x: Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength),
                y: Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength)
            };

            d3.select("#signifier"+index)
                .transition()
                .attr("transform","translate("+
                function() {
                    if(component.endAngle % (2*Math.PI) < Math.PI) {
                        // 0 <= angle < 180
                        return origin.x + 10;
                    }
                    else {
                        // 180 <= angle < 360
                        return origin.x - UIConnectionView.style.labelFieldSize + 10;
                    }
                }()
                +","+
                function() {
                    return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) - 10;
                }()
                +") rotate(180)");
        };

        var rotateArrowRight = function(component,index){
            var origin = {
                x: Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength),
                y: Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength)
            };

            d3.select("#signifier"+index)
                .transition()
                .attr("transform","translate("+
                function() {
                    if(component.endAngle % (2*Math.PI) < Math.PI) {
                        // 0 <= angle < 180
                        return origin.x + 10;
                    }
                    else {
                        // 180 <= angle < 360
                        return origin.x - UIConnectionView.style.labelFieldSize + 10;
                    }
                }()
                +","+
                function() {
                    return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) - 10;
                }()
                +") rotate(90)");
        };

        if(self.delegate.expanded == false ||
            componentsData == undefined) {
            components.remove();
            channelTexts.remove();
            links.remove();
            componentNames.remove();
            componentLabels.remove();
            componentToolBoxes.remove();
            noDataLayer.remove();
            return;
        }

        var radialLayout = d3.layout.radial()
            .margin(0.2)
            .radius(self._outerRadius)
            .linkRadius(self._innerRadius)
            .data(componentsData);

        // Create component arc generator
        var arc = d3.svg.arc()
            .innerRadius(self._innerRadius)
            .outerRadius(self._outerRadius)
            .startAngle(function(d){return d.startAngle;})
            .endAngle(function(d){return d.endAngle;});

        // Create component arc generator zero radius
        var arcZeroRadius = d3.svg.arc()
            .innerRadius(0.1)
            .outerRadius(0.1)
            .startAngle(function(d){return d.startAngle;})
            .endAngle(function(d){return d.endAngle;});

        // Create new component arcs
        components.selectAll(".componentArc")
            .data(radialLayout.components)
            .enter()
            .append("path")
            .class("componentArc")
            .style("fill", function(d){
                if(d.problem == true)
                    return defaultPalette.state.red;
                else
                    return defaultPalette.state.green;
            })
            .attr("d", arcZeroRadius)
            .each(function(component, index) {
                componentToolBoxesGroup = componentToolBoxes.append("g")
                    .class("toolBoxGroup")
                    .class("pointer")
                    .width(UIConnectionView.style.labelFieldSize);

                componentToolBoxesGroup
                    .append("rect")
                    .class("toolBox")
                    .class("pointer")
                    .margin(undefined)
                    .width(UIConnectionView.style.toolBoxesWidth)
                    .height(0)
                    .fill(self.palette.accent1.normal)
                    .attr("id", function() {
                        return "SubscribeBox"+index;
                    });

                componentToolBoxesGroup.selectAll(".toolBox")
                    /*
                    .on("mouseover", function() {
                        openOptionRect(component);
                        rotateArrowDown(component);
                    })
                    .on("mouseout", function () {
                        closeOptionRect(component);
                        rotateArrowRight(component);
                    });
                    */

                componentToolBoxesGroup
                    .append("rect")
                    .class("toolBox")
                    .class("pointer")
                    .margin(undefined)
                    .width(UIConnectionView.style.toolBoxesWidth)
                    .height(0)
                    .fill(self.palette.accent1.normal)
                    .attr("id", function() {
                        return "MessageBox"+index;
                    })
                ;

                componentToolBoxesGroup
                    .append("text")
                    .fill(defaultPalette.text.bright)
                    .text("subscribe")
                    .opacity(0)
                    .attr("text-anchor", "middle")
                    .class("no_interaction")
                    .attr("id", function() {
                        return "SubscribeText"+index;
                    });

                componentToolBoxesGroup
                    .append("text")
                    .opacity(0)
                    .fill(defaultPalette.text.bright)
                    .text("message")
                    .class("no_interaction")
                    .attr("text-anchor", "middle")
                    .class("no_interaction")
                    .attr("id", function() {
                        return "SendMessageText"+index;
                    });

                // Add signifier

                componentToolBoxesGroup.append("path")
                    .attr("d", lineFunction(arrowData))
                    .attr("fill", self.palette.text.dark)
                    .attr("id", function() {
                        return "signifier"+index;
                    })
                    .attr("transform","translate("+
                    function() {
                        var origin = {
                            x: Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength),
                            y: Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength)
                        };
                        
                        if(component.endAngle % (2*Math.PI) < Math.PI) {
                            // 0 <= angle < 180
                            return origin.x + 10;
                        }
                        else {
                            // 180 <= angle < 360
                            return origin.x - UIConnectionView.style.labelFieldSize + 10;
                        }
                    }()
                    +","+
                    function() {
                        return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) - 10;
                    }()
                    +") rotate(90)"
                )
                    .opacity(0);

                // rect to create a muoseover sensitive area on the component name
                // TODO: The problem is here!
                componentToolBoxesGroup.append("rect")
                    .fill("white")
                    .width(UIConnectionView.style.labelFieldSize)
                    .height(20)
                    .class("transparent-rect")
                    .attr("id", function() {
                        return "mouseoverRect"+index;
                    })
                    .opacity(0);

            });

        // Update component arcs
        components.selectAll(".componentArc")
            .data(radialLayout.components)
            .transition()
            .delay(Animations.connectionView.CIRCLE_EXPANSION.delay)
            .duration(Animations.connectionView.CIRCLE_EXPANSION.duration)
            .attr("d", arc)
            .style("fill", function(d){
                if(d.problem == true)
                    return defaultPalette.state.red;
                else
                    return defaultPalette.state.green;
            })
            .each(function(component, index) {

                var origin = {
                    x: Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength),
                    y: Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength)
                };

                componentToolBoxes.select("#signifier"+index)
                    .transition()
                    .duration(1000)
                    .delay(500)
                    .attr("transform","translate("+
                        function() {
                            if(component.endAngle % (2*Math.PI) < Math.PI) {
                                // 0 <= angle < 180
                                return origin.x + 10;
                            }
                            else {
                                // 180 <= angle < 360
                                return origin.x - UIConnectionView.style.labelFieldSize + 10;
                            }
                        }()
                        +","+
                        function() {
                            return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) - 10;
                        }()
                        +") rotate(90)"
                    )
                    //.delay(Animations.application.APPLICATION_EXPANSION.delay)
                    .opacity(1);

                componentToolBoxes.select("#mouseoverRect"+index)
                    .on("mouseover", function() {
                        openOptionRect(component, index);
                        rotateArrowDown(component, index);
                    })
                    .on("mouseout", function () {
                        closeOptionRect(component, index);
                        rotateArrowRight(component, index);
                    })
                    .x(function() {
                        if(component.endAngle % (2*Math.PI) < Math.PI) {
                            // 0 <= angle < 180
                            return origin.x;
                        }
                        else {
                            // 180 <= angle < 360
                            return origin.x - UIConnectionView.style.labelFieldSize;
                        }
                    })
                    .y(function() {
                        return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) - 20;
                    });

                componentToolBoxes.select("#SubscribeBox"+index)
                    .on("mouseover", function() {
                        openOptionRect(component, index);
                        rotateArrowDown(component, index);
                    })
                    .on("mouseout", function () {
                        closeOptionRect(component, index);
                        rotateArrowRight(component, index);
                    })
                    .on("click", function() {
                        alertsModel.application = applicationModel.viewControllerApplicationSelected.name;
                        alertsModel.instance = applicationModel.viewControllerInstanceSelected.name;
                        alertsModel.component = component.name;
                        $('#mailDisplay').modal({ show: true});
                        alertsModel.fetchData();
                    })
                    //.transition()
                    .x(function() {
                        if(component.endAngle % (2*Math.PI) < Math.PI) {
                            // 0 <= angle < 180
                            return origin.x;
                        }
                        else {
                            // 180 <= angle < 360
                            return origin.x - UIConnectionView.style.labelFieldSize;
                        }
                    })
                    .y(function() {
                        return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) -1;
                    });

                componentToolBoxes.select("#MessageBox"+index)
                    .on("mouseover", function() {
                        openOptionRect(component, index);
                        rotateArrowDown(component, index);
                    })
                    .on("mouseout", function () {
                        closeOptionRect(component, index);
                        rotateArrowRight(component, index);
                    })
                    .on("click", function() {
                        alertsModel.application = applicationModel.viewControllerApplicationSelected.name;
                        alertsModel.instance = applicationModel.viewControllerInstanceSelected.name;
                        alertsModel.component = component.name;
                        $('#messageSend').modal({ show: true});
                    })
                    //.transition()
                    .x(function() {
                        if(component.endAngle % (2*Math.PI) < Math.PI) {
                            // 0 <= angle < 180
                            return origin.x + UIConnectionView.style.toolBoxesWidth;
                        }
                        else {
                            // 180 <= angle < 360
                            return origin.x - UIConnectionView.style.labelFieldSize + UIConnectionView.style.toolBoxesWidth;
                        }
                    })
                    .y(function() {
                        return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) -1;
                    });

                componentToolBoxes.select("#SubscribeText"+index)
                    //.transition()
                    .x(function() {
                        if(component.endAngle % (2*Math.PI) < Math.PI) {
                            // 0 <= angle < 180
                            return origin.x + (UIConnectionView.style.labelFieldSize/4);
                        }
                        else {
                            // 180 <= angle < 360
                            return origin.x - UIConnectionView.style.labelFieldSize + (UIConnectionView.style.labelFieldSize/4);
                        }
                    })
                    .y(function() {
                        return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) + UIConnectionView.style.toolBoxTextTopMargin;
                    });

                componentToolBoxes.select("#SendMessageText"+index)
                    //.transition()
                    .x(function() {
                        if(component.endAngle % (2*Math.PI) < Math.PI) {
                            // 0 <= angle < 180
                            return origin.x + (UIConnectionView.style.labelFieldSize/4*3);
                        }
                        else {
                            // 180 <= angle < 360
                            return origin.x - UIConnectionView.style.labelFieldSize + (UIConnectionView.style.labelFieldSize/4*3);
                        }
                    })
                    .y(function() {
                        return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) + UIConnectionView.style.toolBoxTextTopMargin;
                    });

            });

        // Delete component arcs
        components.selectAll(".componentArc")
            .data(radialLayout.components)
            .exit()
            .each(function(component, index) {

                componentToolBoxes.select("#signifier"+index)
                    .transition()
                    .opacity(0)
                    .remove();

                componentToolBoxes.select("#mouseoverRect"+index)
                    .transition()
                    .opacity(0)
                    .remove();

                componentToolBoxes.select("#SubscribeBox"+index)
                    .transition()
                    .opacity(0)
                    .remove();

                componentToolBoxes.select("#MessageBox"+index)
                    .transition()
                    .opacity(0)
                    .remove();

                componentToolBoxes.select("#SubscribeText"+index)
                    .transition()
                    .opacity(0)
                    .remove();

                componentToolBoxes.select("#SendMessageText"+index)
                    .transition()
                    .opacity(0)
                    .remove();

            });




        // Remove component arcs
        components.selectAll(".componentArc")
            .data(radialLayout.components)
            .exit()
            .each(function(component) {
                componentToolBoxes.select("#"+component.name)
                    .remove();
            })
            .remove();

        // Create new publish channels
        channelTexts.selectAll(".channel")
            .data(radialLayout.channels)
            .enter()
            .append("text")
            .class("channel")
            .fill(self.palette.text.dark)
            .attr("font-size", UIConnectionView.style.linkTextSize)
            .opacity(0);

        // Update already present text
        channelTexts.selectAll(".channel")
            .data(radialLayout.channels)
            .transition()
            .delay(Animations.connectionView.CIRCLE_EXPANSION.delay)
            .duration(Animations.connectionView.CIRCLE_EXPANSION.duration)
            .rotateText()
            .text(function(channel) {return channel.channel;})
            .opacity(1);

        // Delete old text
        channelTexts.selectAll(".channel")
            .data(radialLayout.channels)
            .exit()
            .transition()
            .opacity(0)
            .remove();

        // Create arg generator utility
        var lineGenerator = d3.svg.line.radial()
            .interpolate("bundle")
            .tension(UIConnectionView.style.linkTension)
            .radius(function(d) { return  d.radius; })
            .angle(function(d) { return d.angle; });

        // Create new links between channels
        links.selectAll(".link")
            .data(radialLayout.links.map(function(link) {
                    var points = link.coordinates;
                    points.forEach(function(p) {p.link = link});
                    return points;
                }))
            .enter()
            .append("path")
            .class("link")
            .class("pointer")
            .opacity(0)
            .attr("stroke", self.palette.accent2.bright)
            .attr("d", lineGenerator)
            .on("mouseover", function() {
                d3.select(this).attr("stroke", "#000000");
                //d3.select(link.source.name).attr("font-size", UIConnectionView.style.linkTextSizeHold);
            })
            .on("mouseout", function() {
                d3.select(this).attr("stroke", "#FFFFFF");
                //d3.select(link.source.name).attr("font-size", UIConnectionView.style.linkTextSize);
            });

        // Update already present links between
        links.selectAll(".link")
            .data(radialLayout.links.map(function(link) {
                var points = link.coordinates;
                points.forEach(function(p) {p.link = link});
                return points;
            }))
            .on("click", function(points) {
                // Insert the data in the messages model
                messageModel.channel = points[0].link.channel;
                messageModel.from = points[0].link.source.component;
                messageModel.to = points[0].link.destination.component;
                messageModel.type = points[0].link.type;
                messageModel.app_id = applicationModel.viewControllerApplicationSelected.name;
                messageModel.run_id = applicationModel.viewControllerInstanceSelected.name;

                messageModel.downloadMessages();

                // Display the modal view
                $('#messageDisplay').modal({ show: true});
            })
            .transition()
            .delay(Animations.connectionView.LINK_FADE_IN.delay)
            .duration(Animations.connectionView.LINK_FADE_IN.duration)
            .opacity(1)
            .attr("d", lineGenerator);


        // Remove links no more present
        links.selectAll(".link")
            .data(radialLayout.links.map(function(link) {
                var points = link.coordinates;
                points.forEach(function(p) {p.link = link});
                return points;
            }))
            .exit()
            .transition()
            .duration(Animations.connectionView.LINK_FADE_IN.duration)
            .opacity(0)
            .remove();



        components.selectAll(".subscribeTriangle")
            .data(radialLayout.subscribeChannels)
            .enter()
            .append("path")
            .class("subscribeTriangle")
            .attr("d", lineFunction(arrowData))
            .attr("fill", self.palette.accent1.dark)
            .rotateLayer()
            .opacity(0);

        components.selectAll(".subscribeTriangle")
            .data(radialLayout.subscribeChannels)
            .transition()
            .duration(Animations.connectionView.ARROW_EXPANSION.duration)
            .rotateLayer()
            .opacity(1);

        components.selectAll(".subscribeTriangle")
            .data(radialLayout.subscribeChannels)
            .exit()
            .transition()
            .opacity(0)
            .remove();

        // Create circles for the handle_requests channels
        var squareData = [
            { "x":  -1*UIConnectionView.style.square_side/2, "y": 0.0},
            { "x":  1*UIConnectionView.style.square_side/2, "y": 0.0},
            { "x":  1*UIConnectionView.style.square_side/2, "y": 1*UIConnectionView.style.square_side},
            { "x":  -1*UIConnectionView.style.square_side/2, "y": 1*UIConnectionView.style.square_side},
        ];

        components.selectAll(".handleRequestsaCircle")
            .data(radialLayout.handleRequestChannels)
            .enter()
            .append("path")
            .class("handleRequestsaCircle")
            .attr("d", lineFunction(squareData))
            .attr("fill", self.palette.accent1.dark)
            .rotateLayer()
            .opacity(0);

        components.selectAll(".handleRequestsaCircle")
            .data(radialLayout.handleRequestChannels)
            .transition()
            .duration(Animations.connectionView.ARROW_EXPANSION.duration)
            .rotateLayer()
            .opacity(1);

        components.selectAll(".handleRequestsaCircle")
            .data(radialLayout.handleRequestChannels)
            .exit()
            .transition()
            .opacity(0)
            .remove();

        // Create new component name
        componentNames.selectAll(".componentName")
            .data(radialLayout.components)
            .enter()
            .append("text")
            .class("componentName")
            .class("pointer")
            .fill(defaultPalette.text.dark)
            .opacity(0);

        componentNames.selectAll(".componentName")
            .data(radialLayout.components)
            .transition()
            .duration(Animations.connectionView.LINK_FADE_IN.duration)
            .delay(Animations.connectionView.LINK_FADE_IN.delay)
            .attr("text-anchor", function(component) {
                if(component.endAngle % (2*Math.PI) < Math.PI) {
                    // 0 <= angle < 180
                    //return "start";
                    return "middle";
                }
                else {
                    // 180 <= angle < 360
                    //return "end";
                    return "middle";
                }
            })
            .x(function(component) {
                if(component.endAngle % (2*Math.PI) < Math.PI) {
                    // 0 <= angle < 180
                    //return "start";
                    return Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength + 10) + (UIConnectionView.style.labelFieldSize/2)
                }
                else {
                    // 180 <= angle < 360
                    //return "end";
                    return Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength + 10) - (UIConnectionView.style.labelFieldSize/2)

                }
            })
            .y(function(component) {
                return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength) - 5
            })
            .attr("font-size", UIConnectionView.style.componentNameFontSize)
            .text(function(component) {return component.name; })
            .opacity(1);

        componentNames.selectAll(".componentName")
            .data(radialLayout.components)
            .exit()
            .transition()
            .opacity(0)
            .remove();


        // Create new component label
        componentLabels.selectAll(".componentLabel")
            .data(radialLayout.components)
            .enter()
            .append("polyline")
            .class("componentLabel")
            .fill("none")
            .attr("stroke-width", UIConnectionView.style.labelLinkWidth)
            .attr("stroke", UIConnectionView.style.labelLinkColor)
            .opacity(0);


        componentLabels.selectAll(".componentLabel")
            .data(radialLayout.components)
            .transition()
            .duration(Animations.connectionView.LINK_FADE_IN.duration)
            .delay(Animations.connectionView.LINK_FADE_IN.delay)
            .attr("points", function(component) {

                var point0 = {
                    x: Math.cos(component.endAngle - Math.PI / 2) * self._innerRadius,
                    y: Math.sin(component.endAngle - Math.PI / 2) * self._innerRadius
                };

                var point1 = {
                    x: Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength),
                    y: Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength)
                };


                var direction;
                if(Math.sin(component.endAngle) >= 0) {
                    direction = 1;
                }
                else {
                    direction = -1;
                }
                //Math.sign(Math.sin(component.startAngle))
                var point2 = {
                    x: point1.x + direction * UIConnectionView.style.labelFieldSize,
                    y: point1.y
                };

                return[
                    point0.x, point0.y,
                    point1.x, point1.y,
                    point2.x, point2.y

                ];
            })
            .opacity(1);

        componentLabels.selectAll(".componentLabel")
            .data(radialLayout.components)
            .exit()
            .transition()
            .opacity(0)
            .remove();

    };

    // Constructor
    self.init = function() {
    }();

    // Destructor
    self.deinit = function() {
    };

    return self;
};