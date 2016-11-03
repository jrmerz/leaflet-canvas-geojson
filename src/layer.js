var CanvasFeature = require('./classes/CanvasFeature');
var CanvasFeatures = require('./classes/CanvasFeatures');

function CanvasLayer() {
  // show layer timing
  this.debug = false;

  // include events
  this.includes = [L.Mixin.Events];

  // geometry helpers
  this.utils = require('./lib/utils');

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

    // if this was a simple pan event (a diff was provided) and we did not reproject
    // move the feature by diff x/y
    if( this.lastTL ) {
      var diff = this._map.latLngToContainerPoint(this.lastTL);
      var i, canvasFeature, geojson, xy;

      for( i = 0; i < this.features.length; i++ ) {
        canvasFeature = this.features[i];
        geojson = canvasFeature.geojson.geometry;
        xy = canvasFeature.getCanvasXY();

        if( !xy ) continue;

        if( geojson.type == 'Point' ) {

          xy.x += diff.x;
          xy.y += diff.y;

        } else if( geojson.type == 'LineString' ) {

          this.utils.moveLine(xy, diff);

        } else if ( geojson.type == 'Polygon' ) {
        
          this.utils.moveLine(xy, diff);
        
        } else if ( geojson.type == 'MultiPolygon' ) {
          for( var j = 0; j < xy.length; j++ ) {
            this.utils.moveLine(xy[j], diff);
          }
        }
      }
    }

    this.lastTL = this._map.containerPointToLatLng([0, 0]);
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
require('./lib/controls')(layer);

L.CanvasFeatureFactory = require('./classes/factory');
L.CanvasFeature = CanvasFeature;
L.CanvasFeatureCollection = CanvasFeatures;
L.CanvasGeojsonLayer = L.Class.extend(layer);
