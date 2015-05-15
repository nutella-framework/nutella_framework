var UITab = function(delegate, name) {
    var self = UIElement(delegate);

    UITab.style = {
        height: 100,
        width: 200,
        optionRectWidth: 100
    };

    // Public variables
    self.name = undefined;

    // Private variables
    var instanceTab = undefined;
    var instanceTabText = undefined;
    var optionGroup = undefined;
    var optionRect = undefined;
    var optionMessage = undefined;
    var signifier = undefined;

    self.openOptionRect = function (optionGroup) {
        optionGroup
            .transition()
            .attr("transform", "translate(" + UITab.style.optionRectWidth + ",0)");
    };

    self.closeOptionRect = function (optionGroup) {
        optionGroup
            .transition()
            .attr("transform", "translate(" + (- UITab.style.optionRectWidth) + ", 0)");
    };



    self.render = function() {

        var layer = self.view;


        // function for the rendering of the triangle and square
        var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("linear");
        // Triangle data
        var arrowData = [
            { "x":  0.0, "y": -UIApplication.style.applicationBackgroundHeightNotExpanded/2 + UIApplication.style.arrow_bottom_margin},
            { "x":  1*UIApplication.style.applicationBackgroundWidthNotExpanded/2 - UIApplication.style.arrow_width, "y": -UIApplication.style.applicationBackgroundHeightNotExpanded/2+10},
            { "x":  1*UIApplication.style.applicationBackgroundWidthNotExpanded/2 - UIApplication.style.arrow_width - UIApplication.style.arrow_thick, "y": -UIApplication.style.applicationBackgroundHeightNotExpanded/2+10},
            { "x":  0.0, "y": -UIApplication.style.applicationBackgroundHeightNotExpanded/2 + UIApplication.style.arrow_bottom_margin + 2},
            { "x":  -1*UIApplication.style.applicationBackgroundWidthNotExpanded/2 + UIApplication.style.arrow_width + UIApplication.style.arrow_thick, "y": -UIApplication.style.applicationBackgroundHeightNotExpanded/2+10},
            { "x": -1*UIApplication.style.applicationBackgroundWidthNotExpanded/2 + UIApplication.style.arrow_width, "y": -UIApplication.style.applicationBackgroundHeightNotExpanded/2+10}
        ];

        if(optionGroup == undefined) {
            optionGroup = layer.append("g")
                .class("optionGroup");
        }

        if(optionRect == undefined) {
            optionRect = optionGroup.append("rect")
                .class("optionRect")
                .class("pointer")
                .width(UITab.style.optionRectWidth)
                .height(UITab.style.height)
                .x(UITab.style.width / 2 - UITab.style.optionRectWidth)
                .y(-UITab.style.height/2)
                .fill(self.palette.accent1.normal)
                .on("mouseover", function() {
                    signifier
                        .attr("d", null)
                        .opacity(0);
                    self.openOptionRect(optionGroup);
                    if (!delegate.selected) {
                        instanceTab.fill(self.palette.accent1.bright);
                    }
                })
                .on("mouseout", function () {
                    self.closeOptionRect(optionGroup);
                    signifier
                        .attr("d", lineFunction(arrowData))
                        .transition()
                        .delay(UIApplication.style.optionRectCloseDelay)
                        .opacity(1);
                    if (!delegate.selected) {
                        instanceTab.fill(self.palette.accent1.normal);
                    }
                })
                .on("click", function() {
                    self.delegate.subscribeButtonClicked();
                    //alert("ciao simona")
                })
                .opacity(0);
        }

        // add mail text to the option group
        if(optionMessage == undefined) {
            optionMessage = optionGroup.append("text")
                .x(UITab.style.width / 2 - UITab.style.optionRectWidth + 50)
                .y(0)
                .class("mailIcon")
                .class("pointer")
                .class("no_interaction")
                .attr("text-anchor", "middle")
                .fill(self.palette.text.bright)
                .text("subscribe")
                .opacity(0);
        }

        // Tab background
        if(instanceTab == undefined) {
            instanceTab = layer.append("rect")
                .class("instanceTab")
                .class("pointer")
                .x(-UITab.style.width / 2)
                .y(-UITab.style.height / 2)
                .margin(undefined)
                .width(0)
                .height(UITab.style.height)
                .on("mouseover", function () {
                    if (!delegate.selected) {
                        d3.select(this).fill(self.palette.accent1.bright);
                    }
                    self.openOptionRect(optionGroup);
                    signifier
                        .attr("d", null)
                        .opacity(0);
                })
                .on("mouseout", function () {
                    d3.select(this).fill(self.getTabColor());
                    self.closeOptionRect(optionGroup);
                    signifier
                        .attr("d", lineFunction(arrowData))
                        .transition()
                        .delay(UIApplication.style.optionRectCloseDelay)
                        .opacity(1);
                })
                .on("click", function () {
                    self.delegate.clicked();
                })
                .fill(self.getTabColor());
        }

        // Tab text
        if(instanceTabText == undefined) {

            instanceTabText = layer
                .append("text")
                .class("pointer")
                .class("instanceTabText")
                .class("no_interaction")
                .attr("text-anchor", "middle")
                .x(-UITab.style.width / 2)
                .fill(self.palette.text.bright);
        }

        if(signifier == undefined) {
            signifier = layer.append("svg:image")
                .attr('width', 20)
                .attr('height', 20)
                .x(80)
                .y(-10)
                .class("no_interaction")
                .attr("xlink:href", "img/arrow_white_right.svg")
                .class("pointer")
                .style("opacity", 0);

            /*layer
                .append("path")
                .attr("d", lineFunction(arrowData))
                .attr("fill", self.palette.text.bright)
                //.attr("transform", "rotate(90) translate(0,-20)");*/
        }

        if(self.delegate.parentApplicationViewController.expanded) {

            // Tab background
            instanceTab
                .transition()
                .duration(Animations.instance.INSTANCE_ENTER.duration)
                .delay(Animations.instance.INSTANCE_ENTER.delay)
                .margin(undefined)
                .x(-UITab.style.width / 2)
                .y(-UITab.style.height / 2)
                .height(UITab.style.height)
                .width(UITab.style.width)
                .fill(self.getTabColor())
                .opacity(1);

            // Tab text
            instanceTabText
                .transition()
                .duration(Animations.instance.INSTANCE_ENTER.duration)
                .delay(Animations.instance.INSTANCE_ENTER.delay)
                .x(0)
                .opacity(1)
                .text(name);

            signifier
                .transition()
                .delay(Animations.instance.INSTANCE_ENTER.delay + 400)
                .duration(Animations.instance.INSTANCE_ENTER.duration)
                .opacity(1);

            // Option rect
            optionRect
                .opacity(1)
                .transition()
                .width(UITab.style.optionRectWidth)
                .height(UITab.style.height)
                .x(UITab.style.width / 2 - UITab.style.optionRectWidth)
                .y(-UITab.style.height/2)
                .duration(Animations.optionRect.INSTANCE_ENTER.duration)
                .delay(Animations.optionRect.INSTANCE_ENTER.delay)
                .width(UITab.style.optionRectWidth);

            // Option message
            optionMessage
                .transition()
                .x(UITab.style.width / 2 - UITab.style.optionRectWidth + 50)
                .y(0)
                .duration(Animations.optionRect.INSTANCE_ENTER.duration)
                .delay(Animations.optionRect.INSTANCE_ENTER.delay)
                .opacity(1);

        }
        else {

            // Tab background
            instanceTab
                .transition()
                .duration(Animations.instance.INSTANCE_EXIT.duration)
                .delay(Animations.instance.INSTANCE_EXIT.delay)
                .margin(undefined)
                .opacity(0)
                .x(0)
                .y(0)
                .width(0)
                .height(0);

            // Tab text
            instanceTabText
                .data([{}])
                .x(-UITab.style.width / 2)
                .opacity(0).x(0)
                .y(0)
                .width(0)
                .height(0);

            // Option rect
            optionRect
                .opacity(0)
                .x(0)
                .y(0)
                .width(0)
                .height(0);

            // Option message
            optionMessage
                .opacity(0)
                .x(0)
                .y(0)
                .width(0)
                .height(0);
        }
    };

    self.getTabHeight = function() {
        return Math.min(UITab.style.maxHeight, self.getParentHeight()/delegate.getTabsNumber());
    };

    self.getTabColor = function() {
        var color;
        if(delegate.selected) {
            color = self.palette.accent1.dark;
        }
        else {
            color = self.palette.accent1.normal;
        }
        return color;
    };

    self.getTopParent = function() {
        return -windowViewController.height / 2 + UIApplication.style.margin;
    };

    self.getLeftParent = function() {
        return -windowViewController.width / 2 + UIApplication.style.margin;
    };

    self.getParentHeight = function() {
        return windowViewController.height - 2 * UIApplication.style.margin - UIApplication.style.titleBarHeight;
    };
    self.getParentWidth = function() {
        return windowViewController.width - 2 * UIApplication.style.margin;
    };

    // Constructor
    self.init = function() {
        self.name = name;
    }();

    // Destructor
    self.deinit = function() {
    };

    return self;

};