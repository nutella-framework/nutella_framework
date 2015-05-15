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
        labelFieldSize: 120,
        toolBoxHeight: 50


    };

    // Private variables
    self._innerRadius = undefined;
    self._outerRadius = undefined;

    // Render the element
    self.render = function() {

        var layer = self.view;

        // Take the width of the screen
        self._innerRadius = Math.min(windowViewController.height, windowViewController.width) / 2 - UIConnectionView.style.margin
                            - UIConnectionView.style.labelLinkLength;
        self._outerRadius = self._innerRadius + UIConnectionView.style.componentThickness;

        var links = layer.layerWithName("links");
        var components = layer.layerWithName("components");
        var componentNames = layer.layerWithName("componentNames");
        var channelTexts = layer.layerWithName("channelTexts");
        var componentLabels = layer.layerWithName("componentLabels");
        var componentToolBoxes = layer.layerWithName("componentToolBoxes")

        var componentsData = self.delegate.instanceComponentData;  // applicationModel.getInstanceData("application6","instance1").components;

        if(self.delegate.expanded == false ||
            componentsData == undefined) {
            components.remove();
            channelTexts.remove();
            links.remove();
            componentNames.remove();
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
            .each(function(component) {
                componentToolBoxes.append("rect")
                    .class("toolBox")
                    .attr("id", function() {
                        return component.name;
                    })
                    .margin(undefined)
                    .width(UIConnectionView.style.labelFieldSize)
                    .height(0)


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
            .each(function(component) {

                var origin = {
                    x: Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength),
                    y: Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength)
                };

                componentToolBoxes.select("#"+component.name)
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
                        return Math.sin(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength);
                    })
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
            .radius(function(d) { return d.radius; })
            .angle(function(d) { return d.angle; });

        // Create new links between channels
        links.selectAll(".link")
            .data(radialLayout.links.map(function(link) {
                    return link.coordinates;
                }))
            .enter()
            .append("path")
            .class("link")
            .class("pointer")
            .opacity(0)
            .attr("stroke", self.palette.accent2.bright)
            .attr("d", lineGenerator)
            .on("mouseover", function(link) {
                d3.select(this).attr("stroke", "#000000");
                //d3.select(link.source.name).attr("font-size", UIConnectionView.style.linkTextSizeHold);
            })
            .on("mouseout", function(link) {
                d3.select(this).attr("stroke", "#FFFFFF");
                //d3.select(link.source.name).attr("font-size", UIConnectionView.style.linkTextSize);
            })
            .on("click", function() {
                // Display the modal view
                $('#messageDisplay').modal({ show: true});
            });

        // Update already present links between
        links.selectAll(".link")
            .data(radialLayout.links.map(function(link) {
                return link.coordinates;
            }))
            .transition()
            .delay(Animations.connectionView.LINK_FADE_IN.delay)
            .duration(Animations.connectionView.LINK_FADE_IN.duration)
            .opacity(1)
            .attr("d", lineGenerator);

        // Remove links no more present
        links.selectAll(".link")
            .data(radialLayout.links.map(function(link) {
                return link.coordinates;
            }))
            .exit()
            .transition()
            .duration(Animations.connectionView.LINK_FADE_IN.duration)
            .opacity(0)
            .remove();

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

        components.selectAll(".subscribeTriangle")
            .data(radialLayout.publishChannels)
            .enter()
            .append("path")
            .class("subscribeTriangle")
            .attr("d", lineFunction(arrowData))
            .attr("fill", self.palette.accent1.dark)
            .rotateLayer()
            .opacity(0);

        components.selectAll(".subscribeTriangle")
            .data(radialLayout.publishChannels)
            .transition()
            .duration(Animations.connectionView.ARROW_EXPANSION.duration)
            .rotateLayer()
            .opacity(1);

        components.selectAll(".subscribeTriangle")
            .data(radialLayout.publishChannels)
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
            .fill(defaultPalette.text.dark)
            .opacity(0)
            .on("mouseover", function(d) {
                componentToolBoxes
                    .select("#"+d.name)
                    .height(UIConnectionView.style.toolBoxHeight);

            })
            .on("mouseout", function(d) {
                componentToolBoxes
                    .select("#"+d.name)
                    .height(0);
            });

        componentNames.selectAll(".componentName")
            .data(radialLayout.components)
            .transition()
            .duration(Animations.connectionView.LINK_FADE_IN.duration)
            .delay(Animations.connectionView.LINK_FADE_IN.delay)
            .attr("text-anchor", function(component) {
                if(component.endAngle % (2*Math.PI) < Math.PI) {
                    // 0 <= angle < 180
                    return "start";
                }
                else {
                    // 180 <= angle < 360
                    return "end";
                }
            })
            .x(function(component) {
                return Math.cos(component.endAngle - Math.PI / 2) * (self._innerRadius + UIConnectionView.style.labelLinkLength + 10)
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