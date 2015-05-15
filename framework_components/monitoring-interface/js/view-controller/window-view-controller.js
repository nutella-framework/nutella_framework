var WindowViewController = function(view) {
    var self = ViewController(view);

    // Static variables
    WindowViewController.style = {
        margin: 10
    };

    // Protected variables
    self._width = undefined;
    self._height = undefined;
    self._applicationViewControllers = {};   // UIApplication array
    self._center = undefined;


    // Private variables
    var rectGrid = undefined;

    self.updateViewBoxAnimated = function() {
        self._width  = window.innerWidth;
        self._height = window.innerHeight;
        if(self._center == undefined)
            self._view.transition().attr("viewBox", "0 0 " + self._width + " " + self._height);
        else
            self._view.transition().attr("viewBox", (-self._width/2 + self._center.x) + "  " + (-self._height/2 + self._center.y) + " " + self._width + " " + self._height);
    };

    self.updateViewBox = function() {
        self._width  = window.innerWidth;
        self._height = window.innerHeight;
        if(self._center == undefined)
            self._view.attr("viewBox", "0 0 " + self._width + " " + self._height);
        else
            self._view.attr("viewBox", (-self._width/2 + self._center.x) + "  " + (-self._height/2 + self._center.y) + " " + self._width + " " + self._height);
    };

    self.updateRectGrid = function() {
        rectGrid = d3.layout.grid()
            .bands()
            .size([window.innerWidth - WindowViewController.style.margin,
                window.innerHeight- WindowViewController.style.margin])
            .padding([0.1, 0.1]);
    };

    self.resizeWindow = function() {

        self.updateViewBox();

        self.updateRectGrid();

        if(applicationModel.data != undefined) {
            self.renderData(applicationModel.data.applications)
        }

        //TODO: Send notification
    };

    //#GETTER AND SETTER
    self.__defineGetter__("height", function(){
        return self._height;
    });

    self.__defineGetter__("width", function(){
        return self._width;
    });



    // Render function of the component
    self.renderData = function(data) {

        // Create application view controllers
        self._view.selectAll(".applicationView")
            .data(data)
            .enter()
            .append("g")
            .class("applicationView")
            .translate(self._width / 2, self._height / 2)
            .each(function(data) {
                var applicationViewController = ApplicationViewController(data.name, d3.select(this));
                this.applicationViewController = applicationViewController;
                self._applicationViewControllers[data.name] = applicationViewController;
            });

        // Update data in applications
        self._view.selectAll(".applicationView")
            .data(rectGrid(data))
            .transition()
            .duration(Animations.application.GRID_LAYOUT_REPOSITION.duration)
            //.attr("transform", function(d) { return "translate(" + (d.x + rectGrid.nodeSize()[0]/2) + "," + (d.y + rectGrid.nodeSize()[1]/2) + ")"; })
            .each(function(data) {
                var applicationViewController = this.applicationViewController;
                applicationViewController.name = data.name;
                applicationViewController.coordinates = {
                    x: data.x + rectGrid.nodeSize()[0] / 2,
                    y: data.y + rectGrid.nodeSize()[1] / 2
                };

                // Render the application
                applicationViewController.render();
            });

        // Update the application position
        if(applicationModel.viewControllerApplicationSelected == undefined) {
            // Update the position of all appllications
            self._view.selectAll(".applicationView")
                .data(rectGrid(data))
                .transition()
                .duration(Animations.application.GRID_LAYOUT_REPOSITION.duration)
                .attr("transform", function (d) {
                    return "translate(" + (d.x + rectGrid.nodeSize()[0] / 2) + "," + (d.y + rectGrid.nodeSize()[1] / 2) + ")";
                });
        }


        // Delete old applications
        self._view.selectAll(".applicationView")
            .data(data)
            .exit()
            .each(function(data) {
                var applicationViewController = this.applicationViewController;
                applicationViewController.deinit();
                delete self._applicationViewControllers[data.name];
            })
            .remove();
    };

    self.center = function(x, y) {
        self._center = {x: x, y: y};
        self.updateViewBoxAnimated();
    };

    self.resetCenter = function() {
        self._center = undefined;
        self.updateViewBoxAnimated();
    };

    // Constructor
    self.init = function() {

        // Subscribe to data notification
        notificationCenter.subscribe(Notifications.data.APPLICATION_DATA_CHANGE,
            function() {
                self.updateRectGrid();
                self.renderData(applicationModel.data.applications);
            });

        notificationCenter.subscribe(Notifications.ui.APPLICATION_REDUCTION_FINISHED,
            function() {
                self.updateRectGrid();
                self.renderData(applicationModel.data.applications);
        });

        window.addEventListener("resize", self.resizeWindow);

        // Init the grid layout
        self.updateRectGrid();
    }();

    // Destructor
    self.deinit = function() {
        // Place here the code for dealloc eventual objects
    };

    return self;

};

var windowViewController = WindowViewController();