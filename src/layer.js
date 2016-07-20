var CanvasFeature = require('./classes/CanvasFeature');
var CanvasFeatures = require('./classes/CanvasFeatures');

function CanvasLayer() {
  // show layer timing
  this.debug = false;

  // include events
  this.includes = [L.Mixin.Events];

  // list of geojson features to draw
  //   - these will draw in order
  this.features = [];
  // lookup index
  this.featureIndex = {};

  // list of current features under the mouse
  this.intersectList = [];

  // used to calculate pixels moved from center
  this.lastCenterLL = null;

  // geometry helpers
  this.utils = require('./lib/utils');
  
  this.moving = false;
  this.zooming = false;
  // TODO: make this work
  this.allowPanRendering = false;
  
  // recommended you override this.  you can also set a custom renderer
  // for each CanvasFeature if you wish
  this.renderer = require('./defaultRenderer');

  this.getCanvas = function() {
    return this._canvas;
  };

  this.draw = function() {
    this.reset();
  };

  this.addTo = function (map) {
    map.addLayer(this);
    return this;
  };

  this.reset = function () {
    // reset actual canvas size
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
  };

  // clear canvas
  this.clearCanvas = function() {
    var canvas = this.getCanvas();
    var ctx = this._ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // make sure this is called after...
    this.reposition();
  }

  this.reposition = function() {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    this._canvas.style.top = topLeft.y+'px';
    this._canvas.style.left = topLeft.x+'px';
    //L.DomUtil.setPosition(this._canvas, topLeft);
  }

  // clear each features cache
  this.clearCache = function() {
    // kill the feature point cache
    for( var i = 0; i < this.features.length; i++ ) {
      this.features[i].clearCache();
    }
  };

  // get layer feature via geojson object
  this.getCanvasFeatureById = function(id) {
    return this.featureIndex[id];
  }

  // get the meters per px and a certain point;
  this.getMetersPerPx = function(latlng) {
    return this.utils.metersPerPx(latlng, this._map);
  }

  this.getDegreesPerPx = function(latlng) {
    return this.utils.degreesPerPx(latlng, this._map);
  }
};

var layer = new CanvasLayer();


require('./lib/init')(layer);
require('./lib/redraw')(layer);
require('./lib/addFeature')(layer);
require('./lib/toCanvasXY')(layer);

L.CanvasFeatureFactory = require('./classes/factory');
L.CanvasFeature = CanvasFeature;
L.CanvasFeatureCollection = CanvasFeatures;
L.CanvasGeojsonLayer = L.Class.extend(layer);
