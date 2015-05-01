
var AnimationMixin = {

    /**
     * Flips element wrt vertical axis
     * @param node DOM node
     * @param startDeg
     * @param endDeg
     * @param ccw true if animated in ccw direction
     * @param callback called at the end of the animation
     */
    flipY: function(node, startDeg, endDeg, ccw, callback) {
        var self = this;

        this.ny = startDeg;

        if(this.rotYINT) {
            clearInterval(this.rotYINT);
        }

        function rotate() {
            if(ccw) {
                self.ny -= 5;
            } else {
                self.ny += 5;
            }
            node.style.transform="rotateY(" + self.ny + "deg)";
            node.style.webkitTransform="rotateY(" + self.ny + "deg)";
            node.style.OTransform="rotateY(" + self.ny + "deg)";
            node.style.MozTransform="rotateY(" + self.ny + "deg)";
            if (self.ny === endDeg) {
                clearInterval(self.rotYINT);
                if(callback) {
                    callback();
                }
            }
        }
        this.rotYINT = setInterval(rotate, 4);

    }

};

module.exports = AnimationMixin;
