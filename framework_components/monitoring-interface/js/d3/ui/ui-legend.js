var UILegend = function(delegate, name) {
    var self = UIElement(delegate);

    // Static attributes
    UILegend.style = {
        legendBoxWidth: 100,
        legendRightMargin: 50,
        bottomMargin: 50,
        legendPositionYExpanded: -70,
        headerSpacing: 10,
        legendSpacing: 20,
        arrow_thick: 11,
        arrow_ratio: 1.5,
        square_side: 10.0
    };

    // Public variables

    // Private variables
    self._legendGroup = undefined;
    self._legendName = undefined;
    self._arrowGroup = undefined;
    self._squareGroup = undefined;
    self._expanded = false;

    self.legendAction = function(){
        self._expanded = !self._expanded;
        self.render();
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
            { "x":  0.0, "y": 0.0},
            { "x":  1*UILegend.style.arrow_thick/UILegend.style.arrow_ratio, "y": 1*UILegend.style.arrow_thick},
            { "x": -1*UILegend.style.arrow_thick/UILegend.style.arrow_ratio, "y": 1*UILegend.style.arrow_thick}
        ];

        if(self._legendGroup == undefined) {
            self._legendGroup = layer
                .append("g")
                .class("legendGroup")
                .attr("transform", "translate(" + (windowViewController.width / 2 - UILegend.style.legendBoxWidth - UILegend.style.legendRightMargin) + "," + (windowViewController.height / 2 - UILegend.style.bottomMargin) +")");
        }
        else {
            // Move during window resize
            self._legendGroup
                .attr("transform", "translate(" + (windowViewController.width / 2 - UILegend.style.legendBoxWidth - UILegend.style.legendRightMargin) + "," + (windowViewController.height / 2 - UILegend.style.bottomMargin) +")");
        }

        if(self._arrowGroup == undefined){
            self._arrowGroup = self._legendGroup
                .append("g")
                .class("arrowGroup")
                .opacity(0);

            self._arrowGroup
                .append("text")
                .class("explanation")
                .text("subscribed channel")
                .x(5)
                .y(3);

            self._arrowGroup
                .append("path")
                .class("subscribeTriangle")
                .attr("d", lineFunction(arrowData))
                .attr("fill", self.palette.accent1.dark)
                .attr("transform", "rotate(90)")
                .x(0)
                .y(0);
        }

        if(self._squareGroup == undefined){
            self._squareGroup = self._legendGroup
                .append("g")
                .class("arrowGroup")
                .opacity(0);

            self._squareGroup
                .append("text")
                .class("explanation")
                .text("handle-requests channel")
                .x(5);

            self._squareGroup
                .append("rect")
                .height(UILegend.style.square_side)
                .width(UILegend.style.square_side)
                .attr("fill", self.palette.accent1.dark)
                .x(-11)
                .y(-8);
        }

        if(self._legendName == undefined) {
            self._legendName = self._legendGroup
                .append("text")
                .class("legendName")
                .class("title")
                .fill(defaultPalette.text.dark)
                .on("mouseover", function() {
                    self._legendName.fill("black");
                })
                .on("mouseout", function() {
                    self._legendName.fill(defaultPalette.text.dark);
                })
                .text("Legend")
                .class("pointer")
                .y(0)
                .on("click", self.legendAction);
        }

        if(self._expanded){
            self._legendName
                .on("mouseout", null)
                .transition()
                .y(UILegend.style.legendPositionYExpanded)
                .fill("black");

            self._arrowGroup
                .attr("transform", "translate(0," + (UILegend.style.legendPositionYExpanded + UILegend.style.headerSpacing + UILegend.style.legendSpacing) +")")
                .transition()
                .delay(500)
                .opacity(1);

            self._squareGroup
                .attr("transform", "translate(0," + (UILegend.style.legendPositionYExpanded + UILegend.style.headerSpacing + UILegend.style.legendSpacing * 2) +")")
                .transition()
                .delay(500)
                .opacity(1);
        }

        if(!self._expanded){
            self._legendName
                .on("mouseout", function() {
                    self._legendName.fill(defaultPalette.text.dark);
                })
                .transition()
                .y(0)
                .fill(defaultPalette.text.dark);

            self._arrowGroup
                .attr("transform", "translate(0,0)")
                .opacity(0);

            self._squareGroup
                .attr("transform", "translate(0,0)")
                .opacity(0);
        }

        notificationCenter.subscribe(Notifications.ui.APPLICATION_REDUCTION_FINISHED, function() {
            self._expanded = false;
        });
    };

    // Constructor
    self.init = function() {
    }();

    // Destructor
    self.deinit = function() {
    };

    return self;

};