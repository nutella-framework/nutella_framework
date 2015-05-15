var UINotification = function(delegate) {
    var self = UIElement(delegate);

    // Static attributes
    UINotification.style = {
        notificationRadius: 10,
        notificationFontSize: 14,
        margin: {x: 0, y: 10}
    };

    // Public attributes
    self.name = undefined;   // Name of the notification

    // Private variables
    var notificationGroup = undefined;
    var notificationCircle = undefined;
    var notificationText = undefined;

    self.render = function() {

        console.log("Render: notification");

        var layer = self.view;

        if(notificationGroup == undefined)
            notificationGroup = layer.layerWithName("notificationGroup");

        if(self.show == false) {
            notificationGroup
                .transition()
                .duration(Animations.notification.NOTIFICATION_FADE_OUT.duration)
                .delay(Animations.notification.NOTIFICATION_FADE_OUT.delay)
                .opacity(0);

            notificationCircle
                .transition()
                .cx(0)
                .cy(0)
                .r(0);

            notificationText
                .transition()
                .x(1000);
        }
        else {
            notificationGroup
                .transition()
                .duration(Animations.notification.NOTIFICATION_FADE_IN.duration)
                .delay(Animations.notification.NOTIFICATION_FADE_IN.delay)
                .opacity(1);

            notificationCircle
                .cx(0)
                .cy(0)
                .r(UINotification.style.notificationRadius);
        }

        if(notificationCircle == undefined) {
            notificationCircle = notificationGroup
                .append("circle")
                .class("notificationCircle")
                .cx(0)
                .cy(0)
                .r(UINotification.style.notificationRadius)
                .fill(self.palette.accent2.normal);
        }

        if(notificationText == undefined) {
            notificationText = notificationGroup
                .append("text")
                .class("no_interaction")
                .class("notificationText")
                .attr("text-anchor", "middle")
                .attr("font-size", UINotification.style.notificationFontSize);
        }

        notificationText
            .y(UINotification.style.notificationFontSize/3)
            .text(delegate.notification(self.name));
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