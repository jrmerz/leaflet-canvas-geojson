module.exports = function(layer) {
    layer.prototype.removeAll = function() {
        this.features = [];
        this.featureIndex = {};
        this.intersectList = [];
        this.reset();
    }
    
    layer.prototype.hide = function() {
        this._canvas.style.display = 'none';
        this.showing = false;
    };

    layer.prototype.show = function() {
        this._canvas.style.display = 'block';
        this.showing = true;
        this.redraw();
    };


    layer.prototype.setZIndex = function(index) {
        this.zIndex = index;
        if( this._container ) {
            this._container.style.zIndex = index;
        }
    };
}