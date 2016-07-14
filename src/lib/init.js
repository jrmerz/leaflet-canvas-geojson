var intersects = require('./intersects');
var count = 0;

module.exports = function(layer) {
    
    layer.initialize = function(options) {
        this.features = [];
        this.featureIndex = {};
        this.intersectList = [];
        this.showing = true;

        // set options
        options = options || {};
        L.Util.setOptions(this, options);

        // move mouse event handlers to layer scope
        var mouseEvents = ['onMouseOver', 'onMouseMove', 'onMouseOut', 'onClick'];
        mouseEvents.forEach(function(e){
            if( !this.options[e] ) return;
            this[e] = this.options[e];
            delete this.options[e];
        }.bind(this));

        // set canvas and canvas context shortcuts
        this._canvas = createCanvas(options);
        this._ctx = this._canvas.getContext('2d');
    };
    
    layer.onAdd = function(map) {
        this._map = map;

        // add container with the canvas to the tile pane
        // the container is moved in the oposite direction of the
        // map pane to keep the canvas always in (0, 0)
        //var tilePane = this._map._panes.tilePane;
        var tilePane = this._map._panes.markerPane;
        var _container = L.DomUtil.create('div', 'leaflet-layer-'+count);
        count++;

        _container.appendChild(this._canvas);
        tilePane.appendChild(_container);

        this._container = _container;

        // hack: listen to predrag event launched by dragging to
        // set container in position (0, 0) in screen coordinates
        /*if (map.dragging.enabled()) {
            map.dragging._draggable.on('predrag', function() {
                moveStart.apply(this);
            }, this);
        }*/

        map.on({
            'viewreset' : this.reset,
            'resize'    : this.reset,
            'zoomstart' : startZoom,
            'zoomend'   : endZoom,
        //    'movestart' : moveStart,
            'moveend'   : moveEnd,
            'mousemove' : intersects,
            'click'     : intersects
        }, this);

        this.reset();
        this.clearCanvas();

        if( this.zIndex !== undefined ) {
            this.setZIndex(this.zIndex);
        }
    }
    
    layer.onRemove = function(map) {
        this._container.parentNode.removeChild(this._container);
        map.off({
            'viewreset' : this.reset,
            'resize'    : this.reset,
         //   'movestart' : moveStart,
            'moveend'   : moveEnd,
            'zoomstart' : startZoom,
            'zoomend'   : endZoom,
            'mousemove' : intersects,
            'click'     : intersects
        }, this);
    }
}

function createCanvas(options) {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = options.zIndex || 0;
    var className = 'leaflet-tile-container leaflet-zoom-animated';
    canvas.setAttribute('class', className);
    return canvas;
}

function startZoom() {
    this._canvas.style.visibility = 'hidden';
    this.zooming = true;
}

function endZoom() {
    this._canvas.style.visibility = 'visible';
    this.zooming = false;
    this.clearCache();
    setTimeout(this.render.bind(this), 50);
}

function moveStart() {
    if( this.moving ) return;
    this.moving = true;
    
    //if( !this.allowPanRendering ) return;
    return;
    // window.requestAnimationFrame(frameRender.bind(this));
}

function moveEnd(e) {
    this.moving = false;
    this.render(e);
};

function frameRender() {
    if( !this.moving ) return;

    var t = new Date().getTime();
    this.render();
    
    if( new Date().getTime() - t > 75 ) {
        if( this.debug ) {
            console.log('Disabled rendering while paning');
        }
        
        this.allowPanRendering = false;
        return;
    }
    
    setTimeout(function(){
        if( !this.moving ) return;
        window.requestAnimationFrame(frameRender.bind(this));
    }.bind(this), 750);
}