var UIApplication = function(delegate) {
    var self = UIElement(delegate);

    // Static attributes
    UIApplication.style = {
        margin: 10,
        titleBarHeight: 50,
        applicationBackgroundWidthNotExpanded: 100,
        applicationBackgroundHeightNotExpanded: 100,
        optionRectHeight: 20,
        headerRectHeightNotExpanded: 10,
        headerRectHeightExpanded: 30,
        activeStatusColor: defaultPalette.state.green,
        disabledStatusColor: defaultPalette.state.red,
        backTextYMargin: 20,
        backTextXMargin: 60,
        backIconXMargin: 10,
        backIconYMargin: 7,
        arrow_thick: 5,
        arrow_width: 30,
        arrow_bottom_margin: 2,
        optionRectCloseDelay: 250,
        closeButtonDelay: 750,
        backButtonSensitiveAreaWidth: 220
    };

    // Public variables
    self.data = undefined;
    self.expanded = false;

    self.statusColor = function() {
      if(self.delegate.status)
        return UIApplication.style.activeStatusColor;

        return UIApplication.style.disabledStatusColor;
    };

    self.openOptionRect = function (optionGroup) {
        optionGroup
            .transition()
            .attr("transform", "translate(0," + (UIApplication.style.optionRectHeight -1) + ")");
    };

    self.closeOptionRect = function (optionGroup) {
        optionGroup
            .transition()
            .delay(UIApplication.style.optionRectCloseDelay)
            .attr("transform", "translate(0," + (- UIApplication.style.optionRectHeight) + ")");
    };

    // Private variables
    var applicationBackground = undefined;
    var nameGroup = undefined;
    var optionGroup = undefined;
    var optionRect = undefined;
    var headerRect = undefined;
    var appName = undefined;
    var mailIcon = undefined;
    var closeIcon = undefined;
    var optionSignifier = undefined;
    var backButtonSensitiveArea = undefined;
    var backArrow = undefined;

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


        // Create option group
        // it must be created before the app bg to perform the slide
        if(optionGroup == undefined) {
            optionGroup = layer.append("g")
                .class("optionGroup");
        }

        // Background rect
        if(applicationBackground == undefined) {
            applicationBackground = layer.append("rect")
                .on("mouseover", function () {
                    delegate.mouseOverEffect(applicationBackground, self.palette.accent1.bright);
                    self.openOptionRect(optionGroup);
                })
                .on("mouseout", function () {
                    delegate.mouseOutEffect(applicationBackground, self.palette.accent1.normal);
                    self.closeOptionRect(optionGroup);
                })
                .fill(self.palette.primary.normal)
                .class("applicationBackground");
        }

        if(self.delegate.expanded) {
            applicationBackground
                .classRemove("pointer")
                .on("click", null)
                .on("mouseover", null)
                .on("mouseout", null)
                .transition()
                .fill(self.palette.background.dark)
                .margin(UIApplication.style.margin)
                .width(windowViewController.width)
                .height(windowViewController.height)
                .x(-windowViewController.width / 2 + UIApplication.style.margin)
                .y(-windowViewController.height / 2 + UIApplication.style.margin);
        }
        else {
            applicationBackground
                .class("pointer")
                .on("click", function() {
                    delegate.clicked();
                })
                .on("mouseover", function() {
                    d3.select(this).fill(self.palette.accent1.bright);
                    self.openOptionRect(optionGroup);
                    optionSignifier
                        .opacity(0)
                })
                .on("mouseout", function() {
                    d3.select(this).fill(self.palette.accent1.normal);
                    self.closeOptionRect(optionGroup);
                    optionSignifier
                        .attr("d", lineFunction(arrowData))
                        .transition()
                        .delay(UIApplication.style.optionRectCloseDelay)
                        .opacity(1);

                })
                .transition()
                .fill(self.palette.accent1.normal)
                .margin(undefined)
                .width(UIApplication.style.applicationBackgroundWidthNotExpanded)
                .height(UIApplication.style.applicationBackgroundHeightNotExpanded)
                .x(-50)
                .y(-50);
        }

        // Application name group
        if(nameGroup == undefined) {
            nameGroup = layer.append("g")
                .class("nameGroup");
        }

        // Create the status rect
        if(headerRect == undefined) {
            headerRect = nameGroup.append("rect")
                .class("no_interaction")
                .class("headerRect");
        }

        // Update the status rect
        headerRect
            .fill(self.statusColor());

        if(appName == undefined) {
            appName = nameGroup.append("text")
                .class("name")
                .class("pointer")
                .class("no_interaction")
                .attr("text-anchor", "middle")
                .fill(self.palette.text.bright);
        }

        appName.text(delegate.name);

        // add close button
        if(closeIcon == undefined) {
            closeIcon = nameGroup.append("text")
                .text("Back")
                .fill(self.palette.text.bright)
                .class("closeApp")
                .class("pointer")
                .style("opacity", 0)
                .attr("text-anchor", "middle")
                .on("click", function () {
                    delegate.closeButtonClicked();
                });

            /*
             closeIcon = nameGroup.append("svg:image")
             .attr('width', 20)
             .attr('height', 20)
             .attr("xlink:href", "img/cross_red_border_white.svg")
             .class("closeApp")
             .class("pointer")
             .style("opacity", 0)
             .on("click", function () {
             delegate.closeButtonClicked();
             });
            */
        }


        // add backButtonSensitiveArea
        if(backButtonSensitiveArea == undefined) {
            backButtonSensitiveArea = nameGroup.append("rect")
                .opacity(0)
                .class("pointer")
                .width(0)
                .height(0)
                .on("click", function () {
                    delegate.closeButtonClicked();
                })}
        ;

        if(optionRect == undefined) {
            optionRect = optionGroup.append("rect")
                .class("optionRect")
                .class("pointer")
                .on("click", function() {
                    delegate.subscribeButtonClicked();
                });
        }

        if(optionSignifier == undefined) {
            optionSignifier = layer.append("svg:image")
                .attr('width', 20)
                .attr('height', 6.5)
                .x(-10)
                .y(40)
                .class("no_interaction")
                .attr("xlink:href", "img/arrow_white.svg")
                .class("pointer")
                .style("opacity", 0);
        }

        if(backArrow == undefined) {
            backArrow = layer.append("svg:image")
                .attr('width', 0)
                .attr('height', 0)
                //.x(1000)
                //.y(0)
                .class("no_interaction")
                .attr("xlink:href", "img/back.svg")
                .class("pointer")
                .style("opacity", 1);
        }


        // add mail icon to the option group
        if(mailIcon == undefined) {
            mailIcon = optionGroup.append("text")
                .class("mailIcon")
                .class("pointer")
                .class("no_interaction")
                .attr("text-anchor", "middle")
                .fill(self.palette.text.bright)
                .on("mouseover", function() {
                    self.openOptionRect(optionGroup);
                    delegate.mouseOverEffect(applicationBackground, self.palette.accent1.bright);
                })
                .y(UIApplication.style.applicationBackgroundHeightNotExpanded / 2 - UIApplication.style.optionRectHeight + 15)
                .text("subscribe");

            /*mailIcon = optionGroup.append("svg:image")
                .on("mouseover", function() {
                    self.openOptionRect(optionGroup);
                    delegate.mouseOverEffect(applicationBackground, self.palette.accent1.bright);
                    d3.select(this).attr("xlink:href","img/email_highlighted.svg");
                })
                .on("mouseout", function() {
                    d3.select(this).attr("xlink:href","img/email.svg");
                })
                .on("click", function() {
                    alert("ciao simona");
                })
                .attr('width', 34)
                .attr('height', 24)
                .x(-17)
                .y(UIApplication.style.applicationBackgroundHeightNotExpanded / 2 - UIApplication.style.optionRectHeight +1)
                .attr("xlink:href", "img/email.svg")
                .class("mailIcon")
                .class("pointer");*/
        }

        // Application name
        if(self.delegate.expanded) {
            self.closeOptionRect(optionGroup);

            // move the name
            appName
                .transition()
                .duration(Animations.application.APPLICATION_EXPANSION.duration)
                .x(0)
                .y(-windowViewController.height / 2 + UIApplication.style.margin + 20);

            // move the rect
            headerRect
                .transition()
                .x(-windowViewController.width / 2 + UIApplication.style.margin )
                .y(-windowViewController.height / 2 + UIApplication.style.margin)
                .attr('width', windowViewController.width - UIApplication.style.margin * 2)
                .transition()
                .attr('height', UIApplication.style.headerRectHeightExpanded)
                .transition();


            // move close button

            closeIcon
                .text("Back")
                .on("mouseover", function(){
                    d3.select(this).fill("#bdc3c7");
                })
                .on("mouseout", function () {
                    d3.select(this).fill(self.palette.text.bright)
                })
                .transition()
                .x(-windowViewController.width / 2 + UIApplication.style.margin + UIApplication.style.backTextXMargin)
                .y(-windowViewController.height / 2 + UIApplication.style.margin + UIApplication.style.backTextYMargin)
                .transition()
                .delay(UIApplication.style.closeButtonDelay)
                .style("opacity", 1);

            /*
            * closeIcon
             .on("mouseover", function() {
             d3.select(this).attr("xlink:href","img/cross_red_border_white_mouseover.svg");
             })
             .on("mouseout", function() {
             d3.select(this).attr("xlink:href","img/cross_red_border_white.svg");
             })
             .transition()
             .x(windowViewController.width / 2 - UIApplication.style.margin - 25)
             .y(-windowViewController.height / 2 + UIApplication.style.margin + 5)
             .width(40)
             .height(40)
             .attr("xlink:href","img/cross_red_border_white.svg")
             .transition()
             .delay(750)
             .style("opacity", 1);*/


            backButtonSensitiveArea
                .width(UIApplication.style.backButtonSensitiveAreaWidth)
                .height(UIApplication.style.titleBarHeight)
                .on("mouseover", function(){
                    closeIcon.fill("#bdc3c7");
                })
                .on("mouseout", function () {
                    closeIcon.fill(self.palette.text.bright)
                })
                .x(-windowViewController.width / 2 + UIApplication.style.margin )
                .y(-windowViewController.height / 2 + UIApplication.style.margin );

            backArrow
                //.attr('width', 40)
                //.attr('height', 25)
                .attr('width', 30)
                .attr('height', 17.75)
                .x(-windowViewController.width / 2 + UIApplication.style.margin + UIApplication.style.backIconXMargin )
                .y(-windowViewController.height / 2 + UIApplication.style.margin + UIApplication.style.backIconYMargin)
                .transition()
                .delay(UIApplication.style.closeButtonDelay)
                .style("opacity", 1);

            optionSignifier
                .x(0)
                .y(0)
                .opacity(0);

        }
        else {

            backArrow
                .attr('width', 0)
                .attr('height', 0)
                .x(-windowViewController.width / 2 + UIApplication.style.margin )
                .y(-windowViewController.height / 2 + UIApplication.style.margin + 2)
                .opacity(0);
            appName
                .transition()
                .x(0)
                .y(0);

            headerRect
                .transition()
                .attr('width', UIApplication.style.applicationBackgroundWidthNotExpanded)
                .attr('height', UIApplication.style.headerRectHeightNotExpanded)
                .x(-UIApplication.style.applicationBackgroundWidthNotExpanded / 2)
                .y(-UIApplication.style.applicationBackgroundWidthNotExpanded / 2);

            closeIcon
                .text("")
                .opacity(0);

            optionRect
                .on("mouseover", function () {
                    self.openOptionRect(optionGroup);
                    delegate.mouseOverEffect(applicationBackground, self.palette.accent1.bright);
                })
                .on("mouseout", function () {
                    self.closeOptionRect(optionGroup);
                    delegate.mouseOverEffect(applicationBackground, self.palette.accent1.normal);
                })
                .width(UIApplication.style.applicationBackgroundWidthNotExpanded)
                .height(UIApplication.style.optionRectHeight)
                .x( - UIApplication.style.applicationBackgroundWidthNotExpanded / 2)
                .y( UIApplication.style.applicationBackgroundHeightNotExpanded / 2 - UIApplication.style.optionRectHeight)
                .fill(self.palette.accent1.normal);

            optionSignifier
                .x(-10)
                .y(40)
                .transition()
                .delay(UIApplication.style.optionRectCloseDelay)
                .opacity(1);

            backButtonSensitiveArea
                .width(0)
                .height(0)
                .on("mouseover", function(){
                    closeIcon.fill("#bdc3c7");
                })
                .on("mouseout", function () {
                    closeIcon.fill(self.palette.text.bright)
                })
        }

        appName
            .text(delegate.name);



    };

    self.instanceData = function(selectedInstance) {
        var d = self.data.instances.filter(function(d) {
            return d.name == selectedInstance
        });

        if(d.count == 0)
            return undefined;

        return d[0];
    };

    self.getWidth = function() {
        return width  - UIApplication.style.margin * 2;
    };

    self.getHeight = function() {
        return height - UIApplication.style.margin * 2;
    };

    // Constructor
    self.init = function() {

    }();

    // Destructor
    self.deinit = function() {
        // Place here the code for dealloc eventual objects

    };

    return self;
};