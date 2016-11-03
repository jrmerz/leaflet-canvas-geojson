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
        this.showing = true;
        this._canvas.style.display = 'block';

        if( this._map ) {
            this.clearCanvas();
            this.reset();
            this.clearCache();
            this.render();
        }
    };


    layer.setZIndex = function(index) {
        this.zIndex = index;
        if( this._container ) {
            this._container.style.zIndex = index;
        }
    };
}