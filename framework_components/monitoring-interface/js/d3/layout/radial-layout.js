(function() {
    d3.layout.radial = function() {

        // Private variables
        this._numChannels = undefined;
        this._numComponents = undefined;

        this._margin = 0;            // Margin between components in %
        this._radius = undefined;
        this._linkRadius = undefined;

        // Public variables
        this.components = undefined;
        this.channels = undefined;
        this.links = undefined;

        this.publishChannels = undefined;
        this.subscribeChannels = undefined;
        this.requestChannels = undefined;
        this.handleRequestChannels = undefined;


        this.data = function(components) {
            var self = this;

            this.components = [];
            this.channels = [];
            this.links = [];

            this.publishChannels = [];
            this.subscribeChannels = [];
            this.requestChannels = [];
            this.handleRequestChannels = [];

            this._numComponents = components.length;
            var numChannels = 0;

            // Clone components and calculate number of channels
            components.forEach(function(component) {
                numChannels += component.publish.length;
                numChannels += component.subscribe.length;
                numChannels += component.request.length;
                numChannels += component.handle_request.length;

                self.components.push(component);
            });

            this._numChannels = numChannels;

            // Calculate angle of components
            var angle = 0;
            this.components.forEach(function(component) {
                var numChannels = 0;
                numChannels += component.publish.length;
                numChannels += component.subscribe.length;
                numChannels += component.request.length;
                numChannels += component.handle_request.length;

                var angleMargin = 2 * Math.PI * self._margin / self._numComponents;

                component.startAngle = angle;
                component.endAngle = angle + numChannels * 2 * Math.PI * (1.0 - self._margin) / self._numChannels;

                angle = component.endAngle + angleMargin;

                // Calculate angle for every channel
                var deltaAngle = (component.endAngle - component.startAngle) / numChannels;
                var channelAngle = component.startAngle + deltaAngle / 2.0;
                component.publish.forEach(function(publish) {
                    publish.angle = channelAngle;
                    publish.radius = self._radius;
                    channelAngle += deltaAngle;

                    self.channels.push(publish);
                    self.publishChannels.push(publish);
                });
                component.subscribe.forEach(function(subscribe) {
                    subscribe.angle = channelAngle;
                    subscribe.radius = self._radius;
                    channelAngle += deltaAngle;

                    self.channels.push(subscribe);
                    self.subscribeChannels.push(subscribe);
                });
                component.request.forEach(function(request) {
                    request.angle = channelAngle;
                    request.radius = self._radius;
                    channelAngle += deltaAngle;

                    self.channels.push(request);
                    self.requestChannels.push(request);
                });
                component.handle_request.forEach(function(handleRequest) {
                    handleRequest.angle = channelAngle;
                    handleRequest.radius = self._radius;
                    channelAngle += deltaAngle;

                    self.channels.push(handleRequest);
                    self.handleRequestChannels.push(handleRequest);
                });
            });

            // Calculate links
            self.components.forEach(function(component1) {

                // Publish - Subscribe
                component1.publish.forEach(function(publish) {
                    self.components.forEach(function(component2) {
                        component2.subscribe.forEach(function(subscribe) {
                            if(publish.channel == subscribe.channel) {
                                publish.component = component1.name;
                                subscribe.component = component2.name;
                                var link = {
                                    type: "publish",
                                    channel: publish.channel,
                                    source: publish,
                                    destination: subscribe,
                                    coordinates: [
                                        {angle: publish.angle, radius: self._linkRadius},
                                        {angle: (publish.angle + subscribe.angle) / 2.0, radius: 0},
                                        {angle: subscribe.angle, radius: self._linkRadius}
                                    ]
                                };
                                self.links.push(link);
                            }
                        });
                    });
                });

                // Request - Response
                component1.request.forEach(function(request) {
                    self.components.forEach(function(component2) {
                        component2.handle_request.forEach(function(handle_request) {
                            if(request.channel == handle_request.channel) {
                                request.component = component1.name;
                                handle_request.component = component2.name;
                                var link = {
                                    type: "request",
                                    channel: request.channel,
                                    source: request,
                                    destination: handle_request,
                                    coordinates: [
                                        {angle: request.angle, radius: self._linkRadius},
                                        {angle: (request.angle + handle_request.angle) / 2.0, radius: 0},
                                        {angle: handle_request.angle, radius: self._linkRadius}
                                    ]
                                };
                                self.links.push(link);
                            }
                        });
                    });
                });
            });

            return this;
        };

        this.margin = function(margin) {
            if(margin == undefined)
                return this._margin;

            this._margin = margin;
            return this;
        };

        this.radius = function(radius) {
            if(radius == undefined)
                return this._radius;

            this._radius = radius;
            return this;
        };

        this.linkRadius = function(radius) {
            if(radius == undefined)
                return this._linkRadius;

            this._linkRadius = radius;
            return this;
        };

        return this;
    };
})();