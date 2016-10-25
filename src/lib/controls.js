module.exports = function(layer) {
    layer.removeAll = function() {
        this.features = [];
        this.featureIndex = {};
        this.intersectList = [];
        this.rebuildIndex([]);
        this.reset();
    }
    
    layer.hide = function() {
        this._canvas.style.display = 'none';
        this.showing = false;
    };

    layer.show = function() {
        this._canvas.style.display = 'block';
        this.showing = true;
        if( this._map ) this.redraw();
    };


    layer.setZIndex = function(index) {
        this.zIndex = index;
        if( this._container ) {
            this._container.style.zIndex = index;
        }
    };
}