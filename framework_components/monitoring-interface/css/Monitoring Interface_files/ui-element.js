/*
// palette 1
var defaultPalette = {
    primary: {
        dark: "#0288D1",
        normal: "#19BB9B",
        bright: "#B3E5FC"
    },
    text: {
        dark: "#000000",
        bright: "#FFFFFF"
    },
    accent1: {
        dark: "#16a689",
        normal: "#19BB9B",
        bright: "#1dd9b4"
    },
    accent2: {
        dark: "#F57C00",
        normal: "#FF9800",
        bright: "#FFFFFF"
    },
    accent3: {
        dark: "#F57C00",
        normal: "#FF9800",
        bright: "#FFE0B2"
    },
    background: {
        dark: "#D2D7D3",
        normal: "#EEEEEE"

    },
    state: {
        red: "#C0392B",
        //red: "#96281B",
        //red: "#F26A4B",
        green: "#019875"
    }
};
*/

/*
// palette 2
var defaultPalette = {
    primary: {
        dark: "#0288D1",
        normal: "#19BB9B",
        bright: "#B3E5FC"
    },
    text: {
        dark: "#FFFFFF",
        bright: "#FFFFFF"
    },
    accent1: {
        dark: "#16a689",
        normal: "#19BB9B",
        bright: "#1dd9b4"
    },
    accent2: {
        dark: "#F57C00",
        normal: "#FF9800",
        bright: "#FFFFFF"
    },
    accent3: {
        dark: "#F57C00",
        normal: "#FF9800",
        bright: "#FFE0B2"
    },
    background: {
        dark: "#534f59",
        normal: "#39363D"

    },
    state: {
        red: "#C0392B",
        //red: "#96281B",
        //red: "#F26A4B",
        green: "#019875"
    }
};
*/

// palette 3
var defaultPalette = {
    primary: {
        dark: "#0288D1",
        normal: "#425266",
        bright: "#B3E5FC"
    },
    text: {
        dark: "#FFFFFF",
        bright: "#FFFFFF"
    },
    accent1: {
        dark: "#323e4d",
        normal: "#425266",
        bright: "#536780"
    },
    accent2: {
        dark: "#FFFFFF",
        normal: "#FF9800",
        bright: "#FFFFFF"
    },
    accent3: {
        dark: "#F57C00",
        normal: "#FF9800",
        bright: "#FFE0B2"
    },
    background: {
        dark: "#637b99",
        normal: "#323e4d"

    },
    state: {
        red: "#D24D57",
        //red: "#E74C3C",
        //red: "#C0392B",
        //red: "#96281B",
        //red: "#F26A4B",
        green: "#26A65B"
    }
};

var UIElement = function(delegate) {
    var self = {};

    // Public variables
    self.delegate = undefined;

    // Private variables
    var view = undefined;
    var x = 0;
    var y = 0;
    var show = true;

    // Protected variables
    self.palette = defaultPalette;

    // Getter and setter
    self.__defineGetter__("x", function() {
        return x;
    });

    self.__defineGetter__("y", function() {
        return y;
    });

    self.__defineGetter__("view", function() {
        return view;
    });

    self.__defineGetter__("show", function() {
        return show;
    });


    self.__defineSetter__("x", function(newX) {
        x = newX;
        self.updateViewPosition();
    });

    self.__defineSetter__("y", function(newY) {
        y = newY;
        self.updateViewPosition();
    });

    self.__defineSetter__("view", function(newView) {
        view = newView;
        self.updateViewPosition();
        self.updateViewOpacity();
    });

    self.__defineSetter__("show", function(newShow) {
        if(show != newShow) {
            show = newShow;
            self.updateViewOpacity();
        }
    });

    self.updateViewPosition = function() {
        if(view != undefined) {
            view.attr("transform", "translate(" + x + ", " + y + ")");
        }
    };

    self.updateViewOpacity = function() {
        if(view != undefined) {
            view.opacity(show?1:0);
        }
    };

    // Constructor
    self.init = function() {
        self.delegate = delegate;
        view = self.delegate.newView();
    }();

    // Destructor
    self.deinit = function() {
        view.remove();
    };

    return self;

};