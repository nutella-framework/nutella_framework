(function() {
    d3.selection.prototype.translate = d3.selection.enter.prototype.translate = d3.transition.prototype.translate = function(x, y) {
        var self = this;
        var marginX = self.margin.x || 0;
        var marginY = self.margin.y || 0;
        return this.attr("transform", function(d) { return "translate(" + (x + marginX) + "," + (y + marginY) + ")"});
    };

    d3.selection.prototype.rotate = d3.selection.enter.prototype.rotate = function(degree, x, y) {
        var self = this;
        if(x != undefined && y != undefined)
            this.attr("transform", function(d) { return "rotate(" + degree + ")"});
        else
            this.attr("transform", function(d) { return "rotate(" + degree + " " + x + "," + y + ")"});

        return this;
    };

    d3.selection.prototype.rotateText = d3.selection.enter.prototype.rotateText = d3.transition.prototype.rotateText = function() {

        function toDegrees (radians) {
            return radians * (180 / Math.PI);
        }

        var self = this;

        this.attr("transform", function(d) { return "translate(" + d.radius*Math.sin(d.angle) + ", " + (-d.radius*Math.cos(d.angle)) + ")" +
                                                    "rotate(" + toDegrees(-Math.PI/2+d.angle) + ")" +
                                                    (d.angle > Math.PI ? "rotate(180)" : "") +
                                                    (d.angle > Math.PI ? "translate(0, 4)" : "translate(0, 2)")})   // Text alignment
            .attr("text-anchor", function(d) { return d.angle < Math.PI ? "start" : "end"; });

        /*
        this.attr("transform", function(d) { return "translate(" + d.radius + ", 0)"})
            .attr("text-anchor", function(d) { return d.angle < 180 ? "start" : "end"; })
            .attr("transform", function(d) { return d.angle < 180 ? null : "rotate(180)"; });
        */

        return this;
    };

    d3.selection.prototype.width = d3.selection.enter.prototype.width = d3.transition.prototype.width = function(width) {
        var self = this;
        var margin = this.margin.x || 0;
        return this.attr("width", width - margin * 2);
    };

    d3.selection.prototype.height = d3.selection.enter.prototype.height = d3.transition.prototype.height = function(height) {
        var self = this;
        var margin = this.margin.y || 0;
        return this.attr("height", height - margin * 2);
    };

    d3.selection.prototype.x = d3.selection.enter.prototype.x = d3.transition.prototype.x = function(x) {
        var self = this;
        return this.attr("x", x);
    };

    d3.selection.prototype.y = d3.selection.enter.prototype.y = d3.transition.prototype.y = function(y) {
        var self = this;
        return this.attr("y", y);
    };

    d3.selection.prototype.cx = d3.selection.enter.prototype.cx = d3.transition.prototype.cx = function(x) {
        var self = this;
        return this.attr("cx", x);
    };

    d3.selection.prototype.cy = d3.selection.enter.prototype.cy = d3.transition.prototype.cy = function(y) {
        var self = this;
        return this.attr("cy", y);
    };

    d3.selection.prototype.fill = d3.selection.enter.prototype.fill = d3.transition.prototype.fill = function(fill) {
        var self = this;
        return this.attr("fill", fill);
    };


    d3.selection.prototype.margin = d3.selection.enter.prototype.margin = d3.transition.prototype.margin = function(margin) {
        this.margin.x = margin;
        this.margin.y = margin;
        return this;
    };

    d3.selection.prototype.newView = d3.selection.enter.prototype.newView = d3.transition.prototype.newView = function() {
        return this.append("g");
    };

    d3.selection.prototype.class = d3.selection.enter.prototype.class = d3.transition.prototype.class = function(className) {
        var cn = {};
        cn[className] = true;
        this.classed(cn);
        return this;
    };

    d3.selection.prototype.classRemove = d3.selection.enter.prototype.classRemove = d3.transition.prototype.classRemove = function(className) {
        var cn = {};
        cn[className] = false;
        this.classed(cn);
        return this;
    };

    d3.selection.prototype.opacity = d3.selection.enter.prototype.opacity = d3.transition.prototype.opacity = function(opacity) {
        this.style("opacity", opacity);
        return this;
    };

    d3.selection.prototype.layerWithName = function(className) {
        this.selectAll("."+className)
            .data([{}])
            .enter()
            .append("g")
            .class(className);

        return this.selectAll("."+className);
    };

    d3.selection.prototype.rotateTextZeroAngle = d3.selection.enter.prototype.rotateTextZeroAngle = d3.transition.prototype.rotateTextZeroAngle = function() {

        function toDegrees (radians) {
            return radians * (180 / Math.PI);
        }

        var self = this;

        this.attr("transform", function(d) { return "rotate(" + toDegrees(-Math.PI/2+d.angle) + ")" +
            (d.angle > Math.PI ? "rotate(180)" : ""); })
            .attr("text-anchor", function(d) { return d.angle < Math.PI ? "start" : "end"; });


        return this;
    };

    d3.selection.prototype.rotateLayer = d3.selection.enter.prototype.rotateLayer = d3.transition.prototype.rotateLayer = function() {

        function toDegrees (radians) {
            return radians * (180 / Math.PI);
        }

        var self = this;

        this.attr("transform", function(d) { return "translate(" + d.radius*Math.sin(d.angle) + ", " + (-d.radius*Math.cos(d.angle)) + ")" +
            "rotate(" + toDegrees(d.angle) + ")"});

        return this;
    };

    d3.selection.prototype.r = d3.selection.enter.prototype.r = d3.transition.prototype.r = function(radius) {

        this.attr("r", radius);

        return this;
    };

})();