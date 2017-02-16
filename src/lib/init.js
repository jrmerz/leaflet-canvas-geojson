var intersectUtils = require('./intersects');
var RTree = require('rtree');
var count = 0;

module.exports = function(layer) {

    layer.initialize = function(options) {
        // list of geojson features to draw
        //   - these will draw in order
        this.features = [];
        // lookup index
        this.featureIndex = {};

        // list of current features under the mouse
        this.intersectList = [];

        // used to calculate pixels moved from center
        this.lastCenterLL = null;

        this.moving = false;
        this.zooming = false;

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

        this.rTree = new RTree();

        // set canvas and canvas context shortcuts
        this._canvas = createCanvas(options);
        this._ctx = this._canvas.getContext('2d');

        this.show();
    };

    intersectUtils(layer);

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
        // if (map.dragging.enabled()) {
        //     map.dragging._draggable.on('predrag', function() {
        //         var d = map.dragging._draggable;
        //         L.DomUtil.setPosition(this._canvas, { x: -d._newPos.x, y: -d._newPos.y });
        //     }, this);
        // }

        map.on({
            'resize'    : onResize,
            'zoomstart' : startZoom,
            'zoomend'   : endZoom,
            'moveend'   : moveEnd,
            'move'      : scheduleMoveRender,
            'mousemove' : this.intersects,
            'click'     : this.intersects
        }, this);

        this.reset();
        this.clearCanvas();

        if( this.zIndex !== undefined ) {
            this.setZIndex(this.zIndex);
        }

        //re-display layer if it's been removed and then re-added
        if (this._hasBeenRemoved === true) {
            this.render();
            this._hasBeenRemoved = false;
        }
    }

    layer.onRemove = function(map) {
        this._container.parentNode.removeChild(this._container);
        map.off({
            'resize'    : onResize,
            'moveend'   : moveEnd,
            'move'      : scheduleMoveRender,
            'zoomstart' : startZoom,
            'zoomend'   : endZoom,
            'mousemove' : this.intersects,
            'click'     : this.intersects
        }, this);

        this._hasBeenRemoved = true;
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
    this.zooming = true;
    this._canvas.style.visibility = 'hidden';
}

function onResize() {
    this.reset();
    this.render();
}

function endZoom() {
    setTimeout(function(){
        this.zooming = false;
        this._canvas.style.visibility = 'visible';
        this.reset();
        this.clearCache();
        this.render();
    }.bind(this), 100);
}

function moveStart() {
    this.moving = true;
    return;
}

function moveEnd(e) {
    this.moving = false;
    this.render(e);
};

function scheduleMoveRender() {
    if( !this.animating ) return;
    if( this.moveRenderScheduled ) return;
    this.moveRenderScheduled = true;

    window.requestAnimationFrame(function() {
        window.requestAnimationFrame(function() {
            this.render();
            this.moveRenderScheduled = false;
        }.bind(this));
    }.bind(this));
}