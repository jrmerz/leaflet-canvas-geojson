(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function CanvasFeature(geojson, id) {

    // radius for point features
    // use to calculate mouse over/out and click events for points
    // this value should match the value used for rendering points
    this.size = 5;

    // User space object for store variables used for rendering geometry
    this.render = {};

    var cache = {
        // projected points on canvas
        canvasXY: null,
        // zoom level canvasXY points are calculated to
        zoom: -1
    };

    // performance flag, will keep invisible features for recalc
    // events as well as not being rendered
    this.visible = true;

    // bounding box for geometry, used for intersection and
    // visiblility optimizations
    this.bounds = null;

    // Leaflet LatLng, used for points to quickly look for intersection
    this.latlng = null;

    // clear the canvasXY stored values
    this.clearCache = function () {
        delete cache.canvasXY;
        cache.zoom = -1;
    };

    this.setCanvasXY = function (canvasXY, zoom) {
        cache.canvasXY = canvasXY;
        cache.zoom = zoom;
    };

    this.getCanvasXY = function () {
        return cache.canvasXY;
    };

    this.requiresReprojection = function (zoom) {
        if (cache.zoom == zoom && cache.canvasXY) {
            return false;
        }
        return true;
    };

    if (geojson.geometry) {
        this.geojson = geojson.geometry;
        this.id = geojson.properties.id;
    } else {
        this.geojson = geojson;
        this.id = id;
    }

    this.type = this.geojson.type;

    // optional, per feature, renderer
    this.renderer = null;
}

module.exports = CanvasFeature;

},{}],2:[function(require,module,exports){
'use strict';

var CanvasFeature = require('./CanvasFeature');

function CanvasFeatures(geojson) {
    // quick type flag
    this.isCanvasFeatures = true;

    this.canvasFeatures = [];

    // actual geojson object, will not be modifed, just stored
    this.geojson = geojson;

    // performance flag, will keep invisible features for recalc
    // events as well as not being rendered
    this.visible = true;

    this.clearCache = function () {
        for (var i = 0; i < this.canvasFeatures.length; i++) {
            this.canvasFeatures[i].clearCache();
        }
    };

    if (this.geojson) {
        for (var i = 0; i < this.geojson.features.length; i++) {
            this.canvasFeatures.push(new CanvasFeature(this.geojson.features[i]));
        }
    }
}

module.exports = CanvasFeatures;

},{"./CanvasFeature":1}],3:[function(require,module,exports){
'use strict';

var CanvasFeature = require('./CanvasFeature');
var CanvasFeatures = require('./CanvasFeatures');

function factory(arg) {
    if (Array.isArray(arg)) {
        return arg.map(generate);
    }

    return generate(arg);
}

function generate(geojson) {
    if (geojson.type === 'FeatureCollection') {
        return new CanvasFeatures(geojson);
    } else if (geojson.type === 'Feature') {
        return new CanvasFeature(geojson);
    }
    throw new Error('Unsupported GeoJSON: ' + geojson.type);
}

module.exports = factory;

},{"./CanvasFeature":1,"./CanvasFeatures":2}],4:[function(require,module,exports){
'use strict';

var ctx;

/**
 * Fuction called in scope of CanvasFeature
 */
function render(context, xyPoints, map, canvasFeature) {
    ctx = context;

    if (canvasFeature.type === 'Point') {
        renderPoint(xyPoints, this.size);
    } else if (canvasFeature.type === 'LineString') {
        renderLine(xyPoints);
    } else if (canvasFeature.type === 'Polygon') {
        renderPolygon(xyPoints);
    } else if (canvasFeature.type === 'MultiPolygon') {
        xyPoints.forEach(renderPolygon);
    }
}

function renderPoint(xyPoint, size) {
    ctx.beginPath();

    ctx.arc(xyPoint.x, xyPoint.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(0, 0, 0, .3)';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'green';

    ctx.stroke();
    ctx.fill();
}

function renderLine(xyPoints) {

    ctx.beginPath();
    ctx.strokeStyle = 'orange';
    ctx.fillStyle = 'rgba(0, 0, 0, .3)';
    ctx.lineWidth = 2;

    var j;
    ctx.moveTo(xyPoints[0].x, xyPoints[0].y);
    for (j = 1; j < xyPoints.length; j++) {
        ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
    }

    ctx.stroke();
    ctx.fill();
}

function renderPolygon(xyPoints) {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(255, 152, 0,.8)';
    ctx.lineWidth = 2;

    var j;
    ctx.moveTo(xyPoints[0].x, xyPoints[0].y);
    for (j = 1; j < xyPoints.length; j++) {
        ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
    }
    ctx.lineTo(xyPoints[0].x, xyPoints[0].y);

    ctx.stroke();
    ctx.fill();
}

module.exports = render;

},{}],5:[function(require,module,exports){
'use strict';

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

  this.getCanvas = function () {
    return this._canvas;
  };

  this.draw = function () {
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
  this.clearCanvas = function () {
    var canvas = this.getCanvas();
    var ctx = this._ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // make sure this is called after...
    this.reposition();
  };

  this.reposition = function () {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    this._canvas.style.top = topLeft.y + 'px';
    this._canvas.style.left = topLeft.x + 'px';
    //L.DomUtil.setPosition(this._canvas, topLeft);
  };

  // clear each features cache
  this.clearCache = function () {
    // kill the feature point cache
    for (var i = 0; i < this.features.length; i++) {
      this.features[i].clearCache();
    }
  };

  // get layer feature via geojson object
  this.getCanvasFeatureById = function (id) {
    return this.featureIndex[id];
  };

  // get the meters per px and a certain point;
  this.getMetersPerPx = function (latlng) {
    return this.utils.metersPerPx(latlng, this._map);
  };
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

},{"./classes/CanvasFeature":1,"./classes/CanvasFeatures":2,"./classes/factory":3,"./defaultRenderer":4,"./lib/addFeature":6,"./lib/init":7,"./lib/redraw":9,"./lib/toCanvasXY":10,"./lib/utils":11}],6:[function(require,module,exports){
'use strict';

var CanvasFeature = require('../classes/CanvasFeature');
var CanvasFeatures = require('../classes/CanvasFeatures');

module.exports = function (layer) {
  layer.addCanvasFeatures = function (features) {
    for (var i = 0; i < features.length; i++) {
      this.addCanvasFeature(features[i]);
    }
  };

  layer.addCanvasFeature = function (feature, bottom, callback) {
    if (!(feature instanceof CanvasFeature) && !(feature instanceof CanvasFeatures)) {
      throw new Error('Feature must be instance of CanvasFeature or CanvasFeatures');
    }

    prepareCanvasFeature(this, feature);

    if (bottom) {
      // bottom or index
      if (typeof bottom === 'number') this.features.splice(bottom, 0, feature);else this.features.unshift(feature);
    } else {
      this.features.push(feature);
    }

    this.featureIndex[feature.id] = feature;
  }, layer.addCanvasFeatureBottom = function (feature) {
    this.addFeature(feature, true);
  };

  // returns true if re-render required.  ie the feature was visible;
  layer.removeCanvasFeature = function (feature) {
    var index = this.features.indexOf(feature);
    if (index == -1) return;

    this.splice(index, 1);

    if (this.feature.visible) return true;
    return false;
  };

  layer.removeAll = function () {
    this.allowPanRendering = true;
    this.features = [];
  };
};

function prepareCanvasFeature(layer, canvasFeature) {
  var geojson = canvasFeature.geojson;

  if (geojson.type == 'LineString') {

    canvasFeature.bounds = layer.utils.calcBounds(geojson.coordinates);
  } else if (geojson.type == 'Polygon') {
    // TODO: we only support outer rings out the moment, no inner rings.  Thus coordinates[0]
    canvasFeature.bounds = layer.utils.calcBounds(geojson.coordinates[0]);
  } else if (geojson.type == 'Point') {

    canvasFeature.latlng = L.latLng(geojson.coordinates[1], geojson.coordinates[0]);
  } else if (geojson.type == 'MultiPolygon') {

    canvasFeature.bounds = [];
    for (var i = 0; i < geojson.coordinates.length; i++) {
      canvasFeature.bounds.push(layer.utils.calcBounds(geojson.coordinates[i][0]));
    }
  } else {
    throw new Error('GeoJSON feature type "' + geojson.type + '" not supported.');
  }
}

},{"../classes/CanvasFeature":1,"../classes/CanvasFeatures":2}],7:[function(require,module,exports){
'use strict';

var intersects = require('./intersects');
var count = 0;

module.exports = function (layer) {

    layer.initialize = function (options) {
        this.features = [];
        this.featureIndex = {};
        this.intersectList = [];
        this.showing = true;

        // set options
        options = options || {};
        L.Util.setOptions(this, options);

        // move mouse event handlers to layer scope
        var mouseEvents = ['onMouseOver', 'onMouseMove', 'onMouseOut', 'onClick'];
        mouseEvents.forEach(function (e) {
            if (!this.options[e]) return;
            this[e] = this.options[e];
            delete this.options[e];
        }.bind(this));

        // set canvas and canvas context shortcuts
        this._canvas = createCanvas(options);
        this._ctx = this._canvas.getContext('2d');
    };

    layer.onAdd = function (map) {
        this._map = map;

        // add container with the canvas to the tile pane
        // the container is moved in the oposite direction of the
        // map pane to keep the canvas always in (0, 0)
        //var tilePane = this._map._panes.tilePane;
        var tilePane = this._map._panes.markerPane;
        var _container = L.DomUtil.create('div', 'leaflet-layer-' + count);
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
            'viewreset': this.reset,
            'resize': this.reset,
            'zoomstart': startZoom,
            'zoomend': endZoom,
            //    'movestart' : moveStart,
            'moveend': moveEnd,
            'mousemove': intersects,
            'click': intersects
        }, this);

        this.reset();
        this.clearCanvas();

        if (this.zIndex !== undefined) {
            this.setZIndex(this.zIndex);
        }
    };

    layer.onRemove = function (map) {
        this._container.parentNode.removeChild(this._container);
        map.off({
            'viewreset': this.reset,
            'resize': this.reset,
            //   'movestart' : moveStart,
            'moveend': moveEnd,
            'zoomstart': startZoom,
            'zoomend': endZoom,
            'mousemove': intersects,
            'click': intersects
        }, this);
    };
};

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
    if (this.moving) return;
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
    if (!this.moving) return;

    var t = new Date().getTime();
    this.render();

    if (new Date().getTime() - t > 75) {
        if (this.debug) {
            console.log('Disabled rendering while paning');
        }

        this.allowPanRendering = false;
        return;
    }

    setTimeout(function () {
        if (!this.moving) return;
        window.requestAnimationFrame(frameRender.bind(this));
    }.bind(this), 750);
}

},{"./intersects":8}],8:[function(require,module,exports){
'use strict';

/** 
 * Handle mouse intersection events
 * e - leaflet event
 **/
function intersects(e) {
  if (!this.showing) return;

  var t = new Date().getTime();
  var mpp = this.getMetersPerPx(e.latlng);
  var r = mpp * 5; // 5 px radius buffer;

  var center = {
    type: 'Point',
    coordinates: [e.latlng.lng, e.latlng.lat]
  };

  var f;
  var intersects = [];

  for (var i = 0; i < this.features.length; i++) {
    f = this.features[i];

    if (!f.visible) {
      continue;
    }
    if (!f.getCanvasXY()) {
      continue;
    }
    if (!isInBounds(f, e.latlng)) {
      continue;
    }

    if (this.utils.geometryWithinRadius(f.geojson, f.getCanvasXY(), center, e.containerPoint, f.size ? f.size * mpp : r)) {
      intersects.push(f);
    }
  }

  onIntersectsListCreated.call(this, e, intersects);
}

function onIntersectsListCreated(e, intersects) {
  if (e.type == 'click' && this.onClick) {
    this.onClick(intersects);
    return;
  }

  var mouseover = [],
      mouseout = [],
      mousemove = [];

  var changed = false;
  for (var i = 0; i < intersects.length; i++) {
    if (this.intersectList.indexOf(intersects[i]) > -1) {
      mousemove.push(intersects[i]);
    } else {
      changed = true;
      mouseover.push(intersects[i]);
    }
  }

  for (var i = 0; i < this.intersectList.length; i++) {
    if (intersects.indexOf(this.intersectList[i]) == -1) {
      changed = true;
      mouseout.push(this.intersectList[i]);
    }
  }

  this.intersectList = intersects;

  if (this.onMouseOver && mouseover.length > 0) this.onMouseOver.call(this, mouseover, e);
  if (this.onMouseMove) this.onMouseMove.call(this, mousemove, e); // always fire
  if (this.onMouseOut && mouseout.length > 0) this.onMouseOut.call(this, mouseout, e);

  if (this.debug) console.log('intersects time: ' + (new Date().getTime() - t) + 'ms');
}

function isInBounds(feature, latlng) {
  if (feature.bounds) {
    if (Array.isArray(feature.bounds)) {

      for (var i = 0; i < feature.bounds.length; i++) {
        if (feature.bounds[i].contains(latlng)) return true;
      }
    } else if (feature.bounds.contains(latlng)) {
      return true;
    }

    return false;
  }
  return true;
}

module.exports = intersects;

},{}],9:[function(require,module,exports){
'use strict';

var running = false;
var reschedule = null;

module.exports = function (layer) {

  layer.render = function (e) {
    if (!this.allowPanRendering && this.moving) {
      return;
    }

    var t, diff;
    if (this.debug) {
      t = new Date().getTime();
    }

    var diff = null;
    if (e && e.type == 'moveend') {
      var center = this._map.getCenter();

      var pt = this._map.latLngToContainerPoint(center);
      if (this.lastCenterLL) {
        var lastXy = this._map.latLngToContainerPoint(this.lastCenterLL);
        diff = {
          x: lastXy.x - pt.x,
          y: lastXy.y - pt.y
        };
      }

      this.lastCenterLL = center;
    }

    if (!this.zooming) {
      this.redraw(diff);
    } else {
      this.clearCanvas();
    }
  },

  // redraw all features.  This does not handle clearing the canvas or setting
  // the canvas correct position.  That is handled by render
  layer.redraw = function (diff) {
    if (!this.showing) return;

    // if( running ) {
    //   reschedule = true;
    //   return;
    // }
    // running = true;

    // objects should keep track of last bbox and zoom of map
    // if this hasn't changed the ll -> container pt is not needed
    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    if (this.debug) t = new Date().getTime();

    var f, i, subfeature, j;
    for (i = 0; i < this.features.length; i++) {
      f = this.features[i];
      if (f.isCanvasFeatures) {

        for (j = 0; j < f.canvasFeatures.length; j++) {
          this.prepareForRedraw(f.canvasFeatures[j], bounds, zoom, diff);
        }
      } else {
        this.prepareForRedraw(f, bounds, zoom, diff);
      }
    }

    this.redrawFeatures();
  }, layer.redrawFeatures = function () {
    this.clearCanvas();

    for (var i = 0; i < this.features.length; i++) {
      if (!this.features[i].visible) continue;
      this.redrawFeature(this.features[i]);
    }

    if (this.debug) console.log('Render time: ' + (new Date().getTime() - t) + 'ms; avg: ' + (new Date().getTime() - t) / this.features.length + 'ms');

    // running = false;
    // if( reschedule ) {
    //   console.log('reschedule');
    //   reschedule = false;
    //   this.redraw();
    // }
  };

  layer.redrawFeature = function (canvasFeature) {
    var renderer = canvasFeature.renderer ? canvasFeature.renderer : this.renderer;
    var xy = canvasFeature.getCanvasXY();

    // badness...
    if (!xy) return;

    // call feature render function in feature scope; feature is passed as well
    renderer.call(canvasFeature, // scope
    this._ctx, xy, this._map, canvasFeature);
  };

  // redraw an individual feature
  layer.prepareForRedraw = function (canvasFeature, bounds, zoom, diff) {
    //if( feature.geojson.properties.debug ) debugger;

    // ignore anything flagged as hidden
    // we do need to clear the cache in this case
    if (!canvasFeature.visible) {
      canvasFeature.clearCache();
      return;
    }

    var geojson = canvasFeature.geojson;

    // now lets check cache to see if we need to reproject the
    // xy coordinates
    // actually project to xy if needed
    var reproject = canvasFeature.requiresReprojection(zoom);
    if (reproject) {
      this.toCanvasXY(canvasFeature, geojson, zoom);
    } // end reproject

    // if this was a simple pan event (a diff was provided) and we did not reproject
    // move the feature by diff x/y
    if (diff && !reproject) {
      if (geojson.type == 'Point') {

        var xy = canvasFeature.getCanvasXY();
        xy.x += diff.x;
        xy.y += diff.y;
      } else if (geojson.type == 'LineString') {

        this.utils.moveLine(canvasFeature.getCanvasXY(), diff);
      } else if (geojson.type == 'Polygon') {

        this.utils.moveLine(canvasFeature.getCanvasXY(), diff);
      } else if (geojson.type == 'MultiPolygon') {
        var xy = canvasFeature.getCanvasXY();
        for (var i = 0; i < xy.length; i++) {
          this.utils.moveLine(xy[i], diff);
        }
      }
    }

    // ignore anything not in bounds
    if (geojson.type == 'Point') {
      if (!bounds.contains(canvasFeature.latlng)) {
        return;
      }
    } else if (geojson.type == 'MultiPolygon') {

      // just make sure at least one polygon is within range
      var found = false;
      for (var i = 0; i < canvasFeature.bounds.length; i++) {
        if (bounds.contains(canvasFeature.bounds[i]) || bounds.intersects(canvasFeature.bounds[i])) {
          found = true;
          break;
        }
      }
      if (!found) {
        return;
      }
    } else {
      if (!bounds.contains(canvasFeature.bounds) && !bounds.intersects(canvasFeature.bounds)) {
        return;
      }
    }
  };
};

},{}],10:[function(require,module,exports){
'use strict';

module.exports = function (layer) {
    layer.toCanvasXY = function (feature, geojson, zoom) {
        // make sure we have a cache namespace and set the zoom level
        if (!feature.cache) feature.cache = {};
        var canvasXY;

        if (geojson.type == 'Point') {

            canvasXY = this._map.latLngToContainerPoint([geojson.coordinates[1], geojson.coordinates[0]]);

            if (feature.size) {
                canvasXY[0] = canvasXY[0] - feature.size / 2;
                canvasXY[1] = canvasXY[1] - feature.size / 2;
            }
        } else if (geojson.type == 'LineString') {

            canvasXY = this.utils.projectLine(geojson.coordinates, this._map);
            trimCanvasXY(canvasXY);
        } else if (geojson.type == 'Polygon') {

            canvasXY = this.utils.projectLine(geojson.coordinates[0], this._map);
            trimCanvasXY(canvasXY);
        } else if (geojson.type == 'MultiPolygon') {
            canvasXY = [];

            for (var i = 0; i < geojson.coordinates.length; i++) {
                var xy = this.utils.projectLine(geojson.coordinates[i][0], this._map);
                trimCanvasXY(xy);
                canvasXY.push(xy);
            }
        }

        feature.setCanvasXY(canvasXY, zoom);
    };
};

// given an array of geo xy coordinates, make sure each point is at least more than 1px apart
function trimCanvasXY(xy) {
    if (xy.length === 0) return;
    var last = xy[xy.length - 1],
        i,
        point;

    var c = 0;
    for (i = xy.length - 2; i >= 0; i--) {
        point = xy[i];
        if (Math.abs(last.x - point.x) === 0 && Math.abs(last.y - point.y) === 0) {
            xy.splice(i, 1);
            c++;
        } else {
            last = point;
        }
    }

    if (xy.length <= 1) {
        xy.push(last);
        c--;
    }
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = {
  moveLine: function moveLine(coords, diff) {
    var i,
        len = coords.length;
    for (i = 0; i < len; i++) {
      coords[i].x += diff.x;
      coords[i].y += diff.y;
    }
  },

  projectLine: function projectLine(coords, map) {
    var xyLine = [];

    for (var i = 0; i < coords.length; i++) {
      xyLine.push(map.latLngToContainerPoint([coords[i][1], coords[i][0]]));
    }

    return xyLine;
  },

  calcBounds: function calcBounds(coords) {
    var xmin = coords[0][1];
    var xmax = coords[0][1];
    var ymin = coords[0][0];
    var ymax = coords[0][0];

    for (var i = 1; i < coords.length; i++) {
      if (xmin > coords[i][1]) xmin = coords[i][1];
      if (xmax < coords[i][1]) xmax = coords[i][1];

      if (ymin > coords[i][0]) ymin = coords[i][0];
      if (ymax < coords[i][0]) ymax = coords[i][0];
    }

    var southWest = L.latLng(xmin - .01, ymin - .01);
    var northEast = L.latLng(xmax + .01, ymax + .01);

    return L.latLngBounds(southWest, northEast);
  },

  geometryWithinRadius: function geometryWithinRadius(geometry, xyPoints, center, xyPoint, radius) {
    if (geometry.type == 'Point') {
      return this.pointDistance(geometry, center) <= radius;
    } else if (geometry.type == 'LineString') {

      for (var i = 1; i < xyPoints.length; i++) {
        if (this.lineIntersectsCircle(xyPoints[i - 1], xyPoints[i], xyPoint, 3)) {
          return true;
        }
      }

      return false;
    } else if (geometry.type == 'Polygon' || geometry.type == 'MultiPolygon') {
      return this.pointInPolygon(center, geometry);
    }
  },

  // http://math.stackexchange.com/questions/275529/check-if-line-intersects-with-circles-perimeter
  // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  // [lng x, lat, y]
  lineIntersectsCircle: function lineIntersectsCircle(lineP1, lineP2, point, radius) {
    var distance = Math.abs((lineP2.y - lineP1.y) * point.x - (lineP2.x - lineP1.x) * point.y + lineP2.x * lineP1.y - lineP2.y * lineP1.x) / Math.sqrt(Math.pow(lineP2.y - lineP1.y, 2) + Math.pow(lineP2.x - lineP1.x, 2));
    return distance <= radius;
  },

  // http://wiki.openstreetmap.org/wiki/Zoom_levels
  // http://stackoverflow.com/questions/27545098/leaflet-calculating-meters-per-pixel-at-zoom-level
  metersPerPx: function metersPerPx(ll, map) {
    var pointC = map.latLngToContainerPoint(ll); // convert to containerpoint (pixels)
    var pointX = [pointC.x + 1, pointC.y]; // add one pixel to x

    // convert containerpoints to latlng's
    var latLngC = map.containerPointToLatLng(pointC);
    var latLngX = map.containerPointToLatLng(pointX);

    var distanceX = latLngC.distanceTo(latLngX); // calculate distance between c and x (latitude)
    return distanceX;
  },

  // from http://www.movable-type.co.uk/scripts/latlong.html
  pointDistance: function pointDistance(pt1, pt2) {
    var lon1 = pt1.coordinates[0],
        lat1 = pt1.coordinates[1],
        lon2 = pt2.coordinates[0],
        lat2 = pt2.coordinates[1],
        dLat = this.numberToRadius(lat2 - lat1),
        dLon = this.numberToRadius(lon2 - lon1),
        a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(this.numberToRadius(lat1)) * Math.cos(this.numberToRadius(lat2)) * Math.pow(Math.sin(dLon / 2), 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c * 1000; // returns meters
  },

  pointInPolygon: function pointInPolygon(p, poly) {
    var coords = poly.type == "Polygon" ? [poly.coordinates] : poly.coordinates;

    var insideBox = false;
    for (var i = 0; i < coords.length; i++) {
      if (this.pointInBoundingBox(p, this.boundingBoxAroundPolyCoords(coords[i]))) insideBox = true;
    }
    if (!insideBox) return false;

    var insidePoly = false;
    for (var i = 0; i < coords.length; i++) {
      if (this.pnpoly(p.coordinates[1], p.coordinates[0], coords[i])) insidePoly = true;
    }

    return insidePoly;
  },

  pointInBoundingBox: function pointInBoundingBox(point, bounds) {
    return !(point.coordinates[1] < bounds[0][0] || point.coordinates[1] > bounds[1][0] || point.coordinates[0] < bounds[0][1] || point.coordinates[0] > bounds[1][1]);
  },

  boundingBoxAroundPolyCoords: function boundingBoxAroundPolyCoords(coords) {
    var xAll = [],
        yAll = [];

    for (var i = 0; i < coords[0].length; i++) {
      xAll.push(coords[0][i][1]);
      yAll.push(coords[0][i][0]);
    }

    xAll = xAll.sort(function (a, b) {
      return a - b;
    });
    yAll = yAll.sort(function (a, b) {
      return a - b;
    });

    return [[xAll[0], yAll[0]], [xAll[xAll.length - 1], yAll[yAll.length - 1]]];
  },

  // Point in Polygon
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#Listing the Vertices
  pnpoly: function pnpoly(x, y, coords) {
    var vert = [[0, 0]];

    for (var i = 0; i < coords.length; i++) {
      for (var j = 0; j < coords[i].length; j++) {
        vert.push(coords[i][j]);
      }
      vert.push(coords[i][0]);
      vert.push([0, 0]);
    }

    var inside = false;
    for (var i = 0, j = vert.length - 1; i < vert.length; j = i++) {
      if (vert[i][0] > y != vert[j][0] > y && x < (vert[j][1] - vert[i][1]) * (y - vert[i][0]) / (vert[j][0] - vert[i][0]) + vert[i][1]) inside = !inside;
    }

    return inside;
  },

  numberToRadius: function numberToRadius(number) {
    return number * Math.PI / 180;
  }
};

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUuanMiLCJzcmMvY2xhc3Nlcy9DYW52YXNGZWF0dXJlcy5qcyIsInNyYy9jbGFzc2VzL2ZhY3RvcnkuanMiLCJzcmMvZGVmYXVsdFJlbmRlcmVyL2luZGV4LmpzIiwic3JjL2xheWVyLmpzIiwic3JjL2xpYi9hZGRGZWF0dXJlLmpzIiwic3JjL2xpYi9pbml0LmpzIiwic3JjL2xpYi9pbnRlcnNlY3RzLmpzIiwic3JjL2xpYi9yZWRyYXcuanMiLCJzcmMvbGliL3RvQ2FudmFzWFkuanMiLCJzcmMvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxTQUFTLGFBQVQsQ0FBdUIsT0FBdkIsRUFBZ0MsRUFBaEMsRUFBb0M7Ozs7O0FBS2hDLFNBQUssSUFBTCxHQUFZLENBQVo7OztBQUdBLFNBQUssTUFBTCxHQUFjLEVBQWQ7O0FBRUEsUUFBSSxRQUFROztBQUVSLGtCQUFXLElBRkg7O0FBSVIsY0FBTyxDQUFDO0FBSkEsS0FBWjs7OztBQVNBLFNBQUssT0FBTCxHQUFlLElBQWY7Ozs7QUFJQSxTQUFLLE1BQUwsR0FBYyxJQUFkOzs7QUFHQSxTQUFLLE1BQUwsR0FBYyxJQUFkOzs7QUFHQSxTQUFLLFVBQUwsR0FBa0IsWUFBVztBQUN6QixlQUFPLE1BQU0sUUFBYjtBQUNBLGNBQU0sSUFBTixHQUFhLENBQUMsQ0FBZDtBQUNILEtBSEQ7O0FBS0EsU0FBSyxXQUFMLEdBQW1CLFVBQVMsUUFBVCxFQUFtQixJQUFuQixFQUF5QjtBQUN4QyxjQUFNLFFBQU4sR0FBaUIsUUFBakI7QUFDQSxjQUFNLElBQU4sR0FBYSxJQUFiO0FBQ0gsS0FIRDs7QUFLQSxTQUFLLFdBQUwsR0FBbUIsWUFBVztBQUMxQixlQUFPLE1BQU0s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c0MsR0FBdEMsRUFBMkM7QUFDekMsYUFBSyxJQUFMLENBQVUsT0FBTyxDQUFQLEVBQVUsQ0FBVixDQUFWO0FBQ0Q7QUFDRCxXQUFLLElBQUwsQ0FBVSxPQUFPLENBQVAsRUFBVSxDQUFWLENBQVY7QUFDQSxXQUFLLElBQUwsQ0FBVSxDQUFDLENBQUQsRUFBRyxDQUFILENBQVY7QUFDRDs7QUFFRCxRQUFJLFNBQVMsS0FBYjtBQUNBLFNBQUssSUFBSSxJQUFJLENBQVIsRUFBVyxJQUFJLEtBQUssTUFBTCxHQUFjLENBQWxDLEVBQXFDLElBQUksS0FBSyxNQUE5QyxFQUFzRCxJQUFJLEdBQTFELEVBQStEO0FBQzdELFVBQU0sS0FBSyxDQUFMLEVBQVEsQ0FBUixJQUFhLENBQWQsSUFBcUIsS0FBSyxDQUFMLEVBQVEsQ0FBUixJQUFhLENBQW5DLElBQTJDLElBQUksQ0FBQyxLQUFLLENBQUwsRUFBUSxDQUFSLElBQWEsS0FBSyxDQUFMLEVBQVEsQ0FBUixDQUFkLEtBQTZCLElBQUksS0FBSyxDQUFMLEVBQVEsQ0FBUixDQUFqQyxLQUFnRCxLQUFLLENBQUwsRUFBUSxDQUFSLElBQWEsS0FBSyxDQUFMLEVBQVEsQ0FBUixDQUE3RCxJQUEyRSxLQUFLLENBQUwsRUFBUSxDQUFSLENBQTlILEVBQTJJLFNBQVMsQ0FBQyxNQUFWO0FBQzVJOztBQUVELFdBQU8sTUFBUDtBQUNELEdBMUpjOztBQTRKZixrQkFBaUIsd0JBQVUsTUFBVixFQUFrQjtBQUNqQyxXQUFPLFNBQVMsS0FBSyxFQUFkLEdBQW1CLEdBQTFCO0FBQ0Q7QUE5SmMsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gQ2FudmFzRmVhdHVyZShnZW9qc29uLCBpZCkge1xuICAgIFxuICAgIC8vIHJhZGl1cyBmb3IgcG9pbnQgZmVhdHVyZXNcbiAgICAvLyB1c2UgdG8gY2FsY3VsYXRlIG1vdXNlIG92ZXIvb3V0IGFuZCBjbGljayBldmVudHMgZm9yIHBvaW50c1xuICAgIC8vIHRoaXMgdmFsdWUgc2hvdWxkIG1hdGNoIHRoZSB2YWx1ZSB1c2VkIGZvciByZW5kZXJpbmcgcG9pbnRzXG4gICAgdGhpcy5zaXplID0gNTtcbiAgICBcbiAgICAvLyBVc2VyIHNwYWNlIG9iamVjdCBmb3Igc3RvcmUgdmFyaWFibGVzIHVzZWQgZm9yIHJlbmRlcmluZyBnZW9tZXRyeVxuICAgIHRoaXMucmVuZGVyID0ge307XG5cbiAgICB2YXIgY2FjaGUgPSB7XG4gICAgICAgIC8vIHByb2plY3RlZCBwb2ludHMgb24gY2FudmFzXG4gICAgICAgIGNhbnZhc1hZIDogbnVsbCxcbiAgICAgICAgLy8gem9vbSBsZXZlbCBjYW52YXNYWSBwb2ludHMgYXJlIGNhbGN1bGF0ZWQgdG9cbiAgICAgICAgem9vbSA6IC0xXG4gICAgfVxuICAgIFxuICAgIC8vIHBlcmZvcm1hbmNlIGZsYWcsIHdpbGwga2VlcCBpbnZpc2libGUgZmVhdHVyZXMgZm9yIHJlY2FsYyBcbiAgICAvLyBldmVudHMgYXMgd2VsbCBhcyBub3QgYmVpbmcgcmVuZGVyZWRcbiAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgIFxuICAgIC8vIGJvdW5kaW5nIGJveCBmb3IgZ2VvbWV0cnksIHVzZWQgZm9yIGludGVyc2VjdGlvbiBhbmRcbiAgICAvLyB2aXNpYmxpbGl0eSBvcHRpbWl6YXRpb25zXG4gICAgdGhpcy5ib3VuZHMgPSBudWxsO1xuICAgIFxuICAgIC8vIExlYWZsZXQgTGF0TG5nLCB1c2VkIGZvciBwb2ludHMgdG8gcXVpY2tseSBsb29rIGZvciBpbnRlcnNlY3Rpb25cbiAgICB0aGlzLmxhdGxuZyA9IG51bGw7XG4gICAgXG4gICAgLy8gY2xlYXIgdGhlIGNhbnZhc1hZIHN0b3JlZCB2YWx1ZXNcbiAgICB0aGlzLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZGVsZXRlIGNhY2hlLmNhbnZhc1hZO1xuICAgICAgICBjYWNoZS56b29tID0gLTE7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2V0Q2FudmFzWFkgPSBmdW5jdGlvbihjYW52YXNYWSwgem9vbSkge1xuICAgICAgICBjYWNoZS5jYW52YXNYWSA9IGNhbnZhc1hZO1xuICAgICAgICBjYWNoZS56b29tID0gem9vbTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5nZXRDYW52YXNYWSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2FjaGUuY2FudmFzWFk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMucmVxdWlyZXNSZXByb2plY3Rpb24gPSBmdW5jdGlvbih6b29tKSB7XG4gICAgICBpZiggY2FjaGUuem9vbSA9PSB6b29tICYmIGNhY2hlLmNhbnZhc1hZICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxuICAgIGlmKCBnZW9qc29uLmdlb21ldHJ5ICkge1xuICAgICAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uLmdlb21ldHJ5O1xuICAgICAgICB0aGlzLmlkID0gZ2VvanNvbi5wcm9wZXJ0aWVzLmlkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSB0aGlzLmdlb2pzb24udHlwZTtcblxuICAgIC8vIG9wdGlvbmFsLCBwZXIgZmVhdHVyZSwgcmVuZGVyZXJcbiAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNGZWF0dXJlOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9DYW52YXNGZWF0dXJlJyk7XG5cbmZ1bmN0aW9uIENhbnZhc0ZlYXR1cmVzKGdlb2pzb24pIHtcbiAgICAvLyBxdWljayB0eXBlIGZsYWdcbiAgICB0aGlzLmlzQ2FudmFzRmVhdHVyZXMgPSB0cnVlO1xuICAgIFxuICAgIHRoaXMuY2FudmFzRmVhdHVyZXMgPSBbXTtcbiAgICBcbiAgICAvLyBhY3R1YWwgZ2VvanNvbiBvYmplY3QsIHdpbGwgbm90IGJlIG1vZGlmZWQsIGp1c3Qgc3RvcmVkXG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICBcbiAgICAvLyBwZXJmb3JtYW5jZSBmbGFnLCB3aWxsIGtlZXAgaW52aXNpYmxlIGZlYXR1cmVzIGZvciByZWNhbGMgXG4gICAgLy8gZXZlbnRzIGFzIHdlbGwgYXMgbm90IGJlaW5nIHJlbmRlcmVkXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmNhbnZhc0ZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNGZWF0dXJlc1tpXS5jbGVhckNhY2hlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIHRoaXMuZ2VvanNvbiApIHtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmdlb2pzb24uZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzLnB1c2gobmV3IENhbnZhc0ZlYXR1cmUodGhpcy5nZW9qc29uLmZlYXR1cmVzW2ldKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRmVhdHVyZXM7IiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZXMnKTtcblxuZnVuY3Rpb24gZmFjdG9yeShhcmcpIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheShhcmcpICkge1xuICAgICAgICByZXR1cm4gYXJnLm1hcChnZW5lcmF0ZSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBnZW5lcmF0ZShhcmcpO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZShnZW9qc29uKSB7XG4gICAgaWYoIGdlb2pzb24udHlwZSA9PT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJyApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNGZWF0dXJlcyhnZW9qc29uKTtcbiAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlJyApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNGZWF0dXJlKGdlb2pzb24pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIEdlb0pTT046ICcrZ2VvanNvbi50eXBlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5OyIsInZhciBjdHg7XG5cbi8qKlxuICogRnVjdGlvbiBjYWxsZWQgaW4gc2NvcGUgb2YgQ2FudmFzRmVhdHVyZVxuICovXG5mdW5jdGlvbiByZW5kZXIoY29udGV4dCwgeHlQb2ludHMsIG1hcCwgY2FudmFzRmVhdHVyZSkge1xuICAgIGN0eCA9IGNvbnRleHQ7XG4gICAgXG4gICAgaWYoIGNhbnZhc0ZlYXR1cmUudHlwZSA9PT0gJ1BvaW50JyApIHtcbiAgICAgICAgcmVuZGVyUG9pbnQoeHlQb2ludHMsIHRoaXMuc2l6ZSk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgcmVuZGVyTGluZSh4eVBvaW50cyk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdQb2x5Z29uJyApIHtcbiAgICAgICAgcmVuZGVyUG9seWdvbih4eVBvaW50cyk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgICB4eVBvaW50cy5mb3JFYWNoKHJlbmRlclBvbHlnb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyUG9pbnQoeHlQb2ludCwgc2l6ZSkge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgIGN0eC5hcmMoeHlQb2ludC54LCB4eVBvaW50LnksIHNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbic7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTGluZSh4eVBvaW50cykge1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnO1xuICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuXG4gICAgdmFyIGo7XG4gICAgY3R4Lm1vdmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcbiAgICBmb3IoIGogPSAxOyBqIDwgeHlQb2ludHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGN0eC5saW5lVG8oeHlQb2ludHNbal0ueCwgeHlQb2ludHNbal0ueSk7XG4gICAgfVxuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBvbHlnb24oeHlQb2ludHMpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LCAxNTIsIDAsLjgpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcblxuICAgIHZhciBqO1xuICAgIGN0eC5tb3ZlVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG4gICAgZm9yKCBqID0gMTsgaiA8IHh5UG9pbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjdHgubGluZVRvKHh5UG9pbnRzW2pdLngsIHh5UG9pbnRzW2pdLnkpO1xuICAgIH1cbiAgICBjdHgubGluZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlcycpO1xuXG5mdW5jdGlvbiBDYW52YXNMYXllcigpIHtcbiAgLy8gc2hvdyBsYXllciB0aW1pbmdcbiAgdGhpcy5kZWJ1ZyA9IGZhbHNlO1xuXG4gIC8vIGluY2x1ZGUgZXZlbnRzXG4gIHRoaXMuaW5jbHVkZXMgPSBbTC5NaXhpbi5FdmVudHNdO1xuXG4gIC8vIGxpc3Qgb2YgZ2VvanNvbiBmZWF0dXJlcyB0byBkcmF3XG4gIC8vICAgLSB0aGVzZSB3aWxsIGRyYXcgaW4gb3JkZXJcbiAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICAvLyBsb29rdXAgaW5kZXhcbiAgdGhpcy5mZWF0dXJlSW5kZXggPSB7fTtcblxuICAvLyBsaXN0IG9mIGN1cnJlbnQgZmVhdHVyZXMgdW5kZXIgdGhlIG1vdXNlXG4gIHRoaXMuaW50ZXJzZWN0TGlzdCA9IFtdO1xuXG4gIC8vIHVzZWQgdG8gY2FsY3VsYXRlIHBpeGVscyBtb3ZlZCBmcm9tIGNlbnRlclxuICB0aGlzLmxhc3RDZW50ZXJMTCA9IG51bGw7XG5cbiAgLy8gZ2VvbWV0cnkgaGVscGVyc1xuICB0aGlzLnV0aWxzID0gcmVxdWlyZSgnLi9saWIvdXRpbHMnKTtcbiAgXG4gIHRoaXMubW92aW5nID0gZmFsc2U7XG4gIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgd29ya1xuICB0aGlzLmFsbG93UGFuUmVuZGVyaW5nID0gZmFsc2U7XG4gIFxuICAvLyByZWNvbW1lbmRlZCB5b3Ugb3ZlcnJpZGUgdGhpcy4gIHlvdSBjYW4gYWxzbyBzZXQgYSBjdXN0b20gcmVuZGVyZXJcbiAgLy8gZm9yIGVhY2ggQ2FudmFzRmVhdHVyZSBpZiB5b3Ugd2lzaFxuICB0aGlzLnJlbmRlcmVyID0gcmVxdWlyZSgnLi9kZWZhdWx0UmVuZGVyZXInKTtcblxuICB0aGlzLmdldENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XG4gIH07XG5cbiAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9O1xuXG4gIHRoaXMuYWRkVG8gPSBmdW5jdGlvbiAobWFwKSB7XG4gICAgbWFwLmFkZExheWVyKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gcmVzZXQgYWN0dWFsIGNhbnZhcyBzaXplXG4gICAgdmFyIHNpemUgPSB0aGlzLl9tYXAuZ2V0U2l6ZSgpO1xuICAgIHRoaXMuX2NhbnZhcy53aWR0aCA9IHNpemUueDtcbiAgICB0aGlzLl9jYW52YXMuaGVpZ2h0ID0gc2l6ZS55O1xuICB9O1xuXG4gIC8vIGNsZWFyIGNhbnZhc1xuICB0aGlzLmNsZWFyQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcblxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgIC8vIG1ha2Ugc3VyZSB0aGlzIGlzIGNhbGxlZCBhZnRlci4uLlxuICAgIHRoaXMucmVwb3NpdGlvbigpO1xuICB9XG5cbiAgdGhpcy5yZXBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRvcExlZnQgPSB0aGlzLl9tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWzAsIDBdKTtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudG9wID0gdG9wTGVmdC55KydweCc7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLmxlZnQgPSB0b3BMZWZ0LngrJ3B4JztcbiAgICAvL0wuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jYW52YXMsIHRvcExlZnQpO1xuICB9XG5cbiAgLy8gY2xlYXIgZWFjaCBmZWF0dXJlcyBjYWNoZVxuICB0aGlzLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBraWxsIHRoZSBmZWF0dXJlIHBvaW50IGNhY2hlXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5mZWF0dXJlc1tpXS5jbGVhckNhY2hlKCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGdldCBsYXllciBmZWF0dXJlIHZpYSBnZW9qc29uIG9iamVjdFxuICB0aGlzLmdldENhbnZhc0ZlYXR1cmVCeUlkID0gZnVuY3Rpb24oaWQpIHtcbiAgICByZXR1cm4gdGhpcy5mZWF0dXJlSW5kZXhbaWRdO1xuICB9XG5cbiAgLy8gZ2V0IHRoZSBtZXRlcnMgcGVyIHB4IGFuZCBhIGNlcnRhaW4gcG9pbnQ7XG4gIHRoaXMuZ2V0TWV0ZXJzUGVyUHggPSBmdW5jdGlvbihsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5tZXRlcnNQZXJQeChsYXRsbmcsIHRoaXMuX21hcCk7XG4gIH1cbn07XG5cbnZhciBsYXllciA9IG5ldyBDYW52YXNMYXllcigpO1xuXG5cbnJlcXVpcmUoJy4vbGliL2luaXQnKShsYXllcik7XG5yZXF1aXJlKCcuL2xpYi9yZWRyYXcnKShsYXllcik7XG5yZXF1aXJlKCcuL2xpYi9hZGRGZWF0dXJlJykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvdG9DYW52YXNYWScpKGxheWVyKTtcblxuTC5DYW52YXNGZWF0dXJlRmFjdG9yeSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9mYWN0b3J5Jyk7XG5MLkNhbnZhc0ZlYXR1cmUgPSBDYW52YXNGZWF0dXJlO1xuTC5DYW52YXNGZWF0dXJlQ29sbGVjdGlvbiA9IENhbnZhc0ZlYXR1cmVzO1xuTC5DYW52YXNHZW9qc29uTGF5ZXIgPSBMLkNsYXNzLmV4dGVuZChsYXllcik7XG4iLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4uL2NsYXNzZXMvQ2FudmFzRmVhdHVyZScpO1xudmFyIENhbnZhc0ZlYXR1cmVzID0gcmVxdWlyZSgnLi4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gIGxheWVyLmFkZENhbnZhc0ZlYXR1cmVzID0gZnVuY3Rpb24oZmVhdHVyZXMpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5hZGRDYW52YXNGZWF0dXJlKGZlYXR1cmVzW2ldKTtcbiAgICB9XG4gIH07XG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZSA9IGZ1bmN0aW9uKGZlYXR1cmUsIGJvdHRvbSwgY2FsbGJhY2spIHtcbiAgICBpZiggIShmZWF0dXJlIGluc3RhbmNlb2YgQ2FudmFzRmVhdHVyZSkgJiYgIShmZWF0dXJlIGluc3RhbmNlb2YgQ2FudmFzRmVhdHVyZXMpICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGZWF0dXJlIG11c3QgYmUgaW5zdGFuY2Ugb2YgQ2FudmFzRmVhdHVyZSBvciBDYW52YXNGZWF0dXJlcycpO1xuICAgIH1cbiAgICBcbiAgICBwcmVwYXJlQ2FudmFzRmVhdHVyZSh0aGlzLCBmZWF0dXJlKTtcblxuICAgIGlmKCBib3R0b20gKSB7IC8vIGJvdHRvbSBvciBpbmRleFxuICAgICAgaWYoIHR5cGVvZiBib3R0b20gPT09ICdudW1iZXInKSB0aGlzLmZlYXR1cmVzLnNwbGljZShib3R0b20sIDAsIGZlYXR1cmUpO1xuICAgICAgZWxzZSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICB9XG5cbiAgICB0aGlzLmZlYXR1cmVJbmRleFtmZWF0dXJlLmlkXSA9IGZlYXR1cmU7XG4gIH0sXG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZUJvdHRvbSA9IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICB0aGlzLmFkZEZlYXR1cmUoZmVhdHVyZSwgdHJ1ZSk7XG4gIH07XG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHJlLXJlbmRlciByZXF1aXJlZC4gIGllIHRoZSBmZWF0dXJlIHdhcyB2aXNpYmxlO1xuICBsYXllci5yZW1vdmVDYW52YXNGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZmVhdHVyZXMuaW5kZXhPZihmZWF0dXJlKTtcbiAgICBpZiggaW5kZXggPT0gLTEgKSByZXR1cm47XG5cbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiggdGhpcy5mZWF0dXJlLnZpc2libGUgKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gIFxuICBsYXllci5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVDYW52YXNGZWF0dXJlKGxheWVyLCBjYW52YXNGZWF0dXJlKSB7XG4gICAgdmFyIGdlb2pzb24gPSBjYW52YXNGZWF0dXJlLmdlb2pzb247XG4gICAgXG4gICAgaWYoIGdlb2pzb24udHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG4gICAgICBcbiAgICAgIGNhbnZhc0ZlYXR1cmUuYm91bmRzID0gbGF5ZXIudXRpbHMuY2FsY0JvdW5kcyhnZW9qc29uLmNvb3JkaW5hdGVzKTtcblxuICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAvLyBUT0RPOiB3ZSBvbmx5IHN1cHBvcnQgb3V0ZXIgcmluZ3Mgb3V0IHRoZSBtb21lbnQsIG5vIGlubmVyIHJpbmdzLiAgVGh1cyBjb29yZGluYXRlc1swXVxuICAgICAgY2FudmFzRmVhdHVyZS5ib3VuZHMgPSBsYXllci51dGlscy5jYWxjQm91bmRzKGdlb2pzb24uY29vcmRpbmF0ZXNbMF0pO1xuXG4gICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgIGNhbnZhc0ZlYXR1cmUubGF0bG5nID0gTC5sYXRMbmcoZ2VvanNvbi5jb29yZGluYXRlc1sxXSwgZ2VvanNvbi5jb29yZGluYXRlc1swXSk7XG4gICAgXG4gICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgXG4gICAgICBjYW52YXNGZWF0dXJlLmJvdW5kcyA9IFtdO1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBnZW9qc29uLmNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrICApIHtcbiAgICAgICAgY2FudmFzRmVhdHVyZS5ib3VuZHMucHVzaChsYXllci51dGlscy5jYWxjQm91bmRzKGdlb2pzb24uY29vcmRpbmF0ZXNbaV1bMF0pKTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0dlb0pTT04gZmVhdHVyZSB0eXBlIFwiJytnZW9qc29uLnR5cGUrJ1wiIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgfVxuXG59IiwidmFyIGludGVyc2VjdHMgPSByZXF1aXJlKCcuL2ludGVyc2VjdHMnKTtcbnZhciBjb3VudCA9IDA7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBcbiAgICBsYXllci5pbml0aWFsaXplID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLmZlYXR1cmVzID0gW107XG4gICAgICAgIHRoaXMuZmVhdHVyZUluZGV4ID0ge307XG4gICAgICAgIHRoaXMuaW50ZXJzZWN0TGlzdCA9IFtdO1xuICAgICAgICB0aGlzLnNob3dpbmcgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNldCBvcHRpb25zXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcblxuICAgICAgICAvLyBtb3ZlIG1vdXNlIGV2ZW50IGhhbmRsZXJzIHRvIGxheWVyIHNjb3BlXG4gICAgICAgIHZhciBtb3VzZUV2ZW50cyA9IFsnb25Nb3VzZU92ZXInLCAnb25Nb3VzZU1vdmUnLCAnb25Nb3VzZU91dCcsICdvbkNsaWNrJ107XG4gICAgICAgIG1vdXNlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBpZiggIXRoaXMub3B0aW9uc1tlXSApIHJldHVybjtcbiAgICAgICAgICAgIHRoaXNbZV0gPSB0aGlzLm9wdGlvbnNbZV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRpb25zW2VdO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIHNldCBjYW52YXMgYW5kIGNhbnZhcyBjb250ZXh0IHNob3J0Y3V0c1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBjcmVhdGVDYW52YXMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2N0eCA9IHRoaXMuX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH07XG4gICAgXG4gICAgbGF5ZXIub25BZGQgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuXG4gICAgICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAgICAgLy8gdGhlIGNvbnRhaW5lciBpcyBtb3ZlZCBpbiB0aGUgb3Bvc2l0ZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgICAgIC8vIG1hcCBwYW5lIHRvIGtlZXAgdGhlIGNhbnZhcyBhbHdheXMgaW4gKDAsIDApXG4gICAgICAgIC8vdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcbiAgICAgICAgdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy5tYXJrZXJQYW5lO1xuICAgICAgICB2YXIgX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWxheWVyLScrY291bnQpO1xuICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgIF9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fY2FudmFzKTtcbiAgICAgICAgdGlsZVBhbmUuYXBwZW5kQ2hpbGQoX2NvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgICAgICAvLyBoYWNrOiBsaXN0ZW4gdG8gcHJlZHJhZyBldmVudCBsYXVuY2hlZCBieSBkcmFnZ2luZyB0b1xuICAgICAgICAvLyBzZXQgY29udGFpbmVyIGluIHBvc2l0aW9uICgwLCAwKSBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICAgICAgLyppZiAobWFwLmRyYWdnaW5nLmVuYWJsZWQoKSkge1xuICAgICAgICAgICAgbWFwLmRyYWdnaW5nLl9kcmFnZ2FibGUub24oJ3ByZWRyYWcnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBtb3ZlU3RhcnQuYXBwbHkodGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSovXG5cbiAgICAgICAgbWFwLm9uKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICd6b29tc3RhcnQnIDogc3RhcnRab29tLFxuICAgICAgICAgICAgJ3pvb21lbmQnICAgOiBlbmRab29tLFxuICAgICAgICAvLyAgICAnbW92ZXN0YXJ0JyA6IG1vdmVTdGFydCxcbiAgICAgICAgICAgICdtb3ZlZW5kJyAgIDogbW92ZUVuZCxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogaW50ZXJzZWN0cyxcbiAgICAgICAgICAgICdjbGljaycgICAgIDogaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcblxuICAgICAgICBpZiggdGhpcy56SW5kZXggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0WkluZGV4KHRoaXMuekluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsYXllci5vblJlbW92ZSA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgICBtYXAub2ZmKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5yZXNldCxcbiAgICAgICAgIC8vICAgJ21vdmVzdGFydCcgOiBtb3ZlU3RhcnQsXG4gICAgICAgICAgICAnbW92ZWVuZCcgICA6IG1vdmVFbmQsXG4gICAgICAgICAgICAnem9vbXN0YXJ0JyA6IHN0YXJ0Wm9vbSxcbiAgICAgICAgICAgICd6b29tZW5kJyAgIDogZW5kWm9vbSxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogaW50ZXJzZWN0cyxcbiAgICAgICAgICAgICdjbGljaycgICAgIDogaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbnZhcyhvcHRpb25zKSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IG9wdGlvbnMuekluZGV4IHx8IDA7XG4gICAgdmFyIGNsYXNzTmFtZSA9ICdsZWFmbGV0LXRpbGUtY29udGFpbmVyIGxlYWZsZXQtem9vbS1hbmltYXRlZCc7XG4gICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiBjYW52YXM7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0Wm9vbSgpIHtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGVuZFpvb20oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgc2V0VGltZW91dCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpLCA1MCk7XG59XG5cbmZ1bmN0aW9uIG1vdmVTdGFydCgpIHtcbiAgICBpZiggdGhpcy5tb3ZpbmcgKSByZXR1cm47XG4gICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgIFxuICAgIC8vaWYoICF0aGlzLmFsbG93UGFuUmVuZGVyaW5nICkgcmV0dXJuO1xuICAgIHJldHVybjtcbiAgICAvLyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVuZGVyLmJpbmQodGhpcykpO1xufVxuXG5mdW5jdGlvbiBtb3ZlRW5kKGUpIHtcbiAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVuZGVyKGUpO1xufTtcblxuZnVuY3Rpb24gZnJhbWVSZW5kZXIoKSB7XG4gICAgaWYoICF0aGlzLm1vdmluZyApIHJldHVybjtcblxuICAgIHZhciB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICBcbiAgICBpZiggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0ID4gNzUgKSB7XG4gICAgICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2FibGVkIHJlbmRlcmluZyB3aGlsZSBwYW5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoICF0aGlzLm1vdmluZyApIHJldHVybjtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcyksIDc1MCk7XG59IiwiLyoqIFxuICogSGFuZGxlIG1vdXNlIGludGVyc2VjdGlvbiBldmVudHNcbiAqIGUgLSBsZWFmbGV0IGV2ZW50XG4gKiovXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGUpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIHZhciB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdmFyIG1wcCA9IHRoaXMuZ2V0TWV0ZXJzUGVyUHgoZS5sYXRsbmcpO1xuICAgIHZhciByID0gbXBwICogNTsgLy8gNSBweCByYWRpdXMgYnVmZmVyO1xuXG4gICAgdmFyIGNlbnRlciA9IHtcbiAgICAgIHR5cGUgOiAnUG9pbnQnLFxuICAgICAgY29vcmRpbmF0ZXMgOiBbZS5sYXRsbmcubG5nLCBlLmxhdGxuZy5sYXRdXG4gICAgfTtcblxuICAgIHZhciBmO1xuICAgIHZhciBpbnRlcnNlY3RzID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGYgPSB0aGlzLmZlYXR1cmVzW2ldO1xuXG4gICAgICAgIGlmICghZi52aXNpYmxlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmLmdldENhbnZhc1hZKCkpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzSW5Cb3VuZHMoZiwgZS5sYXRsbmcpKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIHRoaXMudXRpbHMuZ2VvbWV0cnlXaXRoaW5SYWRpdXMoZi5nZW9qc29uLCBmLmdldENhbnZhc1hZKCksIGNlbnRlciwgZS5jb250YWluZXJQb2ludCwgZi5zaXplID8gZi5zaXplICogbXBwIDogcikpIHtcbiAgICAgICAgICAgIGludGVyc2VjdHMucHVzaChmKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uSW50ZXJzZWN0c0xpc3RDcmVhdGVkLmNhbGwodGhpcywgZSwgaW50ZXJzZWN0cyk7XG59XG5cbmZ1bmN0aW9uIG9uSW50ZXJzZWN0c0xpc3RDcmVhdGVkKGUsIGludGVyc2VjdHMpIHtcbiAgaWYoIGUudHlwZSA9PSAnY2xpY2snICYmIHRoaXMub25DbGljayApIHtcbiAgICB0aGlzLm9uQ2xpY2soaW50ZXJzZWN0cyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1vdXNlb3ZlciA9IFtdLCBtb3VzZW91dCA9IFtdLCBtb3VzZW1vdmUgPSBbXTtcblxuICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICBmb3IoIHZhciBpID0gMDsgaSA8IGludGVyc2VjdHMubGVuZ3RoOyBpKysgKSB7XG4gICAgaWYoIHRoaXMuaW50ZXJzZWN0TGlzdC5pbmRleE9mKGludGVyc2VjdHNbaV0pID4gLTEgKSB7XG4gICAgICBtb3VzZW1vdmUucHVzaChpbnRlcnNlY3RzW2ldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICBtb3VzZW92ZXIucHVzaChpbnRlcnNlY3RzW2ldKTtcbiAgICB9XG4gIH1cblxuICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuaW50ZXJzZWN0TGlzdC5sZW5ndGg7IGkrKyApIHtcbiAgICBpZiggaW50ZXJzZWN0cy5pbmRleE9mKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSkgPT0gLTEgKSB7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIG1vdXNlb3V0LnB1c2godGhpcy5pbnRlcnNlY3RMaXN0W2ldKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmludGVyc2VjdExpc3QgPSBpbnRlcnNlY3RzO1xuXG4gIGlmKCB0aGlzLm9uTW91c2VPdmVyICYmIG1vdXNlb3Zlci5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlT3Zlci5jYWxsKHRoaXMsIG1vdXNlb3ZlciwgZSk7XG4gIGlmKCB0aGlzLm9uTW91c2VNb3ZlICkgdGhpcy5vbk1vdXNlTW92ZS5jYWxsKHRoaXMsIG1vdXNlbW92ZSwgZSk7IC8vIGFsd2F5cyBmaXJlXG4gIGlmKCB0aGlzLm9uTW91c2VPdXQgJiYgbW91c2VvdXQubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU91dC5jYWxsKHRoaXMsIG1vdXNlb3V0LCBlKTtcblxuICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdpbnRlcnNlY3RzIHRpbWU6ICcrKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCkrJ21zJyk7XG59XG5cbmZ1bmN0aW9uIGlzSW5Cb3VuZHMoZmVhdHVyZSwgbGF0bG5nKSB7XG4gICAgaWYoIGZlYXR1cmUuYm91bmRzICkge1xuICAgICAgICBpZiggQXJyYXkuaXNBcnJheShmZWF0dXJlLmJvdW5kcykgKSB7XG5cbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmZWF0dXJlLmJvdW5kcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIGlmKCBmZWF0dXJlLmJvdW5kc1tpXS5jb250YWlucyhsYXRsbmcpICkgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmJvdW5kcy5jb250YWlucyhsYXRsbmcpICkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0czsiLCJcbnZhciBydW5uaW5nID0gZmFsc2U7XG52YXIgcmVzY2hlZHVsZSA9IG51bGw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBcbiAgbGF5ZXIucmVuZGVyID0gZnVuY3Rpb24oZSkge1xuICAgIGlmKCAhdGhpcy5hbGxvd1BhblJlbmRlcmluZyAmJiB0aGlzLm1vdmluZyApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdCwgZGlmZlxuICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgICB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfVxuXG4gICAgdmFyIGRpZmYgPSBudWxsO1xuICAgIGlmKCBlICYmIGUudHlwZSA9PSAnbW92ZWVuZCcgKSB7XG4gICAgICB2YXIgY2VudGVyID0gdGhpcy5fbWFwLmdldENlbnRlcigpO1xuXG4gICAgICB2YXIgcHQgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChjZW50ZXIpO1xuICAgICAgaWYoIHRoaXMubGFzdENlbnRlckxMICkge1xuICAgICAgICB2YXIgbGFzdFh5ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQodGhpcy5sYXN0Q2VudGVyTEwpO1xuICAgICAgICBkaWZmID0ge1xuICAgICAgICAgIHggOiBsYXN0WHkueCAtIHB0LngsXG4gICAgICAgICAgeSA6IGxhc3RYeS55IC0gcHQueVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGFzdENlbnRlckxMID0gY2VudGVyO1xuICAgIH1cblxuXG4gICAgaWYoICF0aGlzLnpvb21pbmcgKSB7XG4gICAgICB0aGlzLnJlZHJhdyhkaWZmKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jbGVhckNhbnZhcygpO1xuICAgIH1cblxuICB9LFxuICAgIFxuXG4gIC8vIHJlZHJhdyBhbGwgZmVhdHVyZXMuICBUaGlzIGRvZXMgbm90IGhhbmRsZSBjbGVhcmluZyB0aGUgY2FudmFzIG9yIHNldHRpbmdcbiAgLy8gdGhlIGNhbnZhcyBjb3JyZWN0IHBvc2l0aW9uLiAgVGhhdCBpcyBoYW5kbGVkIGJ5IHJlbmRlclxuICBsYXllci5yZWRyYXcgPSBmdW5jdGlvbihkaWZmKSB7XG4gICAgaWYoICF0aGlzLnNob3dpbmcgKSByZXR1cm47XG5cbiAgICAvLyBpZiggcnVubmluZyApIHtcbiAgICAvLyAgIHJlc2NoZWR1bGUgPSB0cnVlO1xuICAgIC8vICAgcmV0dXJuO1xuICAgIC8vIH1cbiAgICAvLyBydW5uaW5nID0gdHJ1ZTtcblxuICAgIC8vIG9iamVjdHMgc2hvdWxkIGtlZXAgdHJhY2sgb2YgbGFzdCBiYm94IGFuZCB6b29tIG9mIG1hcFxuICAgIC8vIGlmIHRoaXMgaGFzbid0IGNoYW5nZWQgdGhlIGxsIC0+IGNvbnRhaW5lciBwdCBpcyBub3QgbmVlZGVkXG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuX21hcC5nZXRCb3VuZHMoKTtcbiAgICB2YXIgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIHZhciBmLCBpLCBzdWJmZWF0dXJlLCBqO1xuICAgIGZvciggaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG4gICAgICBpZiggZi5pc0NhbnZhc0ZlYXR1cmVzICkge1xuXG4gICAgICAgIGZvciggaiA9IDA7IGogPCBmLmNhbnZhc0ZlYXR1cmVzLmxlbmd0aDsgaisrICkge1xuICAgICAgICAgIHRoaXMucHJlcGFyZUZvclJlZHJhdyhmLmNhbnZhc0ZlYXR1cmVzW2pdLCBib3VuZHMsIHpvb20sIGRpZmYpO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJlcGFyZUZvclJlZHJhdyhmLCBib3VuZHMsIHpvb20sIGRpZmYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucmVkcmF3RmVhdHVyZXMoKTtcbiAgfSxcblxuICBsYXllci5yZWRyYXdGZWF0dXJlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcbiAgICBcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggIXRoaXMuZmVhdHVyZXNbaV0udmlzaWJsZSApIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZWRyYXdGZWF0dXJlKHRoaXMuZmVhdHVyZXNbaV0pO1xuICAgIH1cblxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coJ1JlbmRlciB0aW1lOiAnKyhuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQpKydtczsgYXZnOiAnK1xuICAgICAgKChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQpIC8gdGhpcy5mZWF0dXJlcy5sZW5ndGgpKydtcycpO1xuXG4gICAgLy8gcnVubmluZyA9IGZhbHNlO1xuICAgIC8vIGlmKCByZXNjaGVkdWxlICkge1xuICAgIC8vICAgY29uc29sZS5sb2coJ3Jlc2NoZWR1bGUnKTtcbiAgICAvLyAgIHJlc2NoZWR1bGUgPSBmYWxzZTtcbiAgICAvLyAgIHRoaXMucmVkcmF3KCk7XG4gICAgLy8gfVxuICB9XG5cbiAgbGF5ZXIucmVkcmF3RmVhdHVyZSA9IGZ1bmN0aW9uKGNhbnZhc0ZlYXR1cmUpIHtcbiAgICAgIHZhciByZW5kZXJlciA9IGNhbnZhc0ZlYXR1cmUucmVuZGVyZXIgPyBjYW52YXNGZWF0dXJlLnJlbmRlcmVyIDogdGhpcy5yZW5kZXJlcjtcbiAgICAgIHZhciB4eSA9IGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKTtcblxuICAgICAgLy8gYmFkbmVzcy4uLlxuICAgICAgaWYoICF4eSApIHJldHVybjtcblxuICAgICAgLy8gY2FsbCBmZWF0dXJlIHJlbmRlciBmdW5jdGlvbiBpbiBmZWF0dXJlIHNjb3BlOyBmZWF0dXJlIGlzIHBhc3NlZCBhcyB3ZWxsXG4gICAgICByZW5kZXJlci5jYWxsKFxuICAgICAgICAgIGNhbnZhc0ZlYXR1cmUsIC8vIHNjb3BlXG4gICAgICAgICAgdGhpcy5fY3R4LCBcbiAgICAgICAgICB4eSwgXG4gICAgICAgICAgdGhpcy5fbWFwLFxuICAgICAgICAgIGNhbnZhc0ZlYXR1cmVcbiAgICAgICk7XG4gIH1cblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIGxheWVyLnByZXBhcmVGb3JSZWRyYXcgPSBmdW5jdGlvbihjYW52YXNGZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYpIHtcbiAgICAvL2lmKCBmZWF0dXJlLmdlb2pzb24ucHJvcGVydGllcy5kZWJ1ZyApIGRlYnVnZ2VyO1xuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIGZsYWdnZWQgYXMgaGlkZGVuXG4gICAgLy8gd2UgZG8gbmVlZCB0byBjbGVhciB0aGUgY2FjaGUgaW4gdGhpcyBjYXNlXG4gICAgaWYoICFjYW52YXNGZWF0dXJlLnZpc2libGUgKSB7XG4gICAgICBjYW52YXNGZWF0dXJlLmNsZWFyQ2FjaGUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZ2VvanNvbiA9IGNhbnZhc0ZlYXR1cmUuZ2VvanNvbjtcblxuICAgIC8vIG5vdyBsZXRzIGNoZWNrIGNhY2hlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlcHJvamVjdCB0aGVcbiAgICAvLyB4eSBjb29yZGluYXRlc1xuICAgIC8vIGFjdHVhbGx5IHByb2plY3QgdG8geHkgaWYgbmVlZGVkXG4gICAgdmFyIHJlcHJvamVjdCA9IGNhbnZhc0ZlYXR1cmUucmVxdWlyZXNSZXByb2plY3Rpb24oem9vbSk7XG4gICAgaWYoIHJlcHJvamVjdCApIHtcbiAgICAgIHRoaXMudG9DYW52YXNYWShjYW52YXNGZWF0dXJlLCBnZW9qc29uLCB6b29tKTtcbiAgICB9ICAvLyBlbmQgcmVwcm9qZWN0XG5cbiAgICAvLyBpZiB0aGlzIHdhcyBhIHNpbXBsZSBwYW4gZXZlbnQgKGEgZGlmZiB3YXMgcHJvdmlkZWQpIGFuZCB3ZSBkaWQgbm90IHJlcHJvamVjdFxuICAgIC8vIG1vdmUgdGhlIGZlYXR1cmUgYnkgZGlmZiB4L3lcbiAgICBpZiggZGlmZiAmJiAhcmVwcm9qZWN0ICkge1xuICAgICAgaWYoIGdlb2pzb24udHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgIHZhciB4eSA9IGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKVxuICAgICAgICB4eS54ICs9IGRpZmYueDtcbiAgICAgICAgeHkueSArPSBkaWZmLnk7XG5cbiAgICAgIH0gZWxzZSBpZiggZ2VvanNvbi50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKSwgZGlmZik7XG5cbiAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICBcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCksIGRpZmYpO1xuICAgICAgXG4gICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgIHZhciB4eSA9IGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKTtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB4eS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKHh5W2ldLCBkaWZmKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlnbm9yZSBhbnl0aGluZyBub3QgaW4gYm91bmRzXG4gICAgaWYoIGdlb2pzb24udHlwZSA9PSAnUG9pbnQnICkge1xuICAgICAgaWYoICFib3VuZHMuY29udGFpbnMoY2FudmFzRmVhdHVyZS5sYXRsbmcpICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIGlmKCBnZW9qc29uLnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG5cbiAgICAgIC8vIGp1c3QgbWFrZSBzdXJlIGF0IGxlYXN0IG9uZSBwb2x5Z29uIGlzIHdpdGhpbiByYW5nZVxuICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNhbnZhc0ZlYXR1cmUuYm91bmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggYm91bmRzLmNvbnRhaW5zKGNhbnZhc0ZlYXR1cmUuYm91bmRzW2ldKSB8fCBib3VuZHMuaW50ZXJzZWN0cyhjYW52YXNGZWF0dXJlLmJvdW5kc1tpXSkgKSB7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiggIWZvdW5kICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoICFib3VuZHMuY29udGFpbnMoY2FudmFzRmVhdHVyZS5ib3VuZHMpICYmICFib3VuZHMuaW50ZXJzZWN0cyhjYW52YXNGZWF0dXJlLmJvdW5kcykgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICB9O1xufSIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgICBsYXllci50b0NhbnZhc1hZID0gZnVuY3Rpb24oZmVhdHVyZSwgZ2VvanNvbiwgem9vbSkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhIGNhY2hlIG5hbWVzcGFjZSBhbmQgc2V0IHRoZSB6b29tIGxldmVsXG4gICAgICAgIGlmKCAhZmVhdHVyZS5jYWNoZSApIGZlYXR1cmUuY2FjaGUgPSB7fTtcbiAgICAgICAgdmFyIGNhbnZhc1hZO1xuXG4gICAgICAgIGlmKCBnZW9qc29uLnR5cGUgPT0gJ1BvaW50JyApIHtcblxuICAgICAgICBjYW52YXNYWSA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICAgIGdlb2pzb24uY29vcmRpbmF0ZXNbMV0sXG4gICAgICAgICAgICBnZW9qc29uLmNvb3JkaW5hdGVzWzBdXG4gICAgICAgIF0pO1xuXG4gICAgICAgIGlmKCBmZWF0dXJlLnNpemUgKSB7XG4gICAgICAgICAgICBjYW52YXNYWVswXSA9IGNhbnZhc1hZWzBdIC0gZmVhdHVyZS5zaXplIC8gMjtcbiAgICAgICAgICAgIGNhbnZhc1hZWzFdID0gY2FudmFzWFlbMV0gLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmKCBnZW9qc29uLnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgICAgICAgXG4gICAgICAgIGNhbnZhc1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShnZW9qc29uLmNvb3JkaW5hdGVzLCB0aGlzLl9tYXApO1xuICAgICAgICB0cmltQ2FudmFzWFkoY2FudmFzWFkpO1xuICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgICBcbiAgICAgICAgY2FudmFzWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGdlb2pzb24uY29vcmRpbmF0ZXNbMF0sIHRoaXMuX21hcCk7XG4gICAgICAgIHRyaW1DYW52YXNYWShjYW52YXNYWSk7XG4gICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgICAgICBjYW52YXNYWSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZ2VvanNvbi5jb29yZGluYXRlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICB2YXIgeHkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGdlb2pzb24uY29vcmRpbmF0ZXNbaV1bMF0sIHRoaXMuX21hcCk7XG4gICAgICAgICAgICAgICAgdHJpbUNhbnZhc1hZKHh5KTtcbiAgICAgICAgICAgICAgICBjYW52YXNYWS5wdXNoKHh5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZmVhdHVyZS5zZXRDYW52YXNYWShjYW52YXNYWSwgem9vbSk7XG4gICAgfTtcbn1cblxuLy8gZ2l2ZW4gYW4gYXJyYXkgb2YgZ2VvIHh5IGNvb3JkaW5hdGVzLCBtYWtlIHN1cmUgZWFjaCBwb2ludCBpcyBhdCBsZWFzdCBtb3JlIHRoYW4gMXB4IGFwYXJ0XG5mdW5jdGlvbiB0cmltQ2FudmFzWFkoeHkpIHtcbiAgICBpZiggeHkubGVuZ3RoID09PSAwICkgcmV0dXJuO1xuICAgIHZhciBsYXN0ID0geHlbeHkubGVuZ3RoLTFdLCBpLCBwb2ludDtcblxuICAgIHZhciBjID0gMDtcbiAgICBmb3IoIGkgPSB4eS5sZW5ndGgtMjsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgIHBvaW50ID0geHlbaV07XG4gICAgICAgIGlmKCBNYXRoLmFicyhsYXN0LnggLSBwb2ludC54KSA9PT0gMCAmJiBNYXRoLmFicyhsYXN0LnkgLSBwb2ludC55KSA9PT0gMCApIHtcbiAgICAgICAgICAgIHh5LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGMrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhc3QgPSBwb2ludDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmKCB4eS5sZW5ndGggPD0gMSApIHtcbiAgICAgICAgeHkucHVzaChsYXN0KTtcbiAgICAgICAgYy0tO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vdmVMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBkaWZmKSB7XG4gICAgdmFyIGksIGxlbiA9IGNvb3Jkcy5sZW5ndGg7XG4gICAgZm9yKCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgY29vcmRzW2ldLnggKz0gZGlmZi54O1xuICAgICAgY29vcmRzW2ldLnkgKz0gZGlmZi55O1xuICAgIH1cbiAgfSxcblxuICBwcm9qZWN0TGluZSA6IGZ1bmN0aW9uKGNvb3JkcywgbWFwKSB7XG4gICAgdmFyIHh5TGluZSA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB4eUxpbmUucHVzaChtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgY29vcmRzW2ldWzFdLCBjb29yZHNbaV1bMF1cbiAgICAgIF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4geHlMaW5lO1xuICB9LFxuXG4gIGNhbGNCb3VuZHMgOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICB2YXIgeG1pbiA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeG1heCA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeW1pbiA9IGNvb3Jkc1swXVswXTtcbiAgICB2YXIgeW1heCA9IGNvb3Jkc1swXVswXTtcblxuICAgIGZvciggdmFyIGkgPSAxOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHhtaW4gPiBjb29yZHNbaV1bMV0gKSB4bWluID0gY29vcmRzW2ldWzFdO1xuICAgICAgaWYoIHhtYXggPCBjb29yZHNbaV1bMV0gKSB4bWF4ID0gY29vcmRzW2ldWzFdO1xuXG4gICAgICBpZiggeW1pbiA+IGNvb3Jkc1tpXVswXSApIHltaW4gPSBjb29yZHNbaV1bMF07XG4gICAgICBpZiggeW1heCA8IGNvb3Jkc1tpXVswXSApIHltYXggPSBjb29yZHNbaV1bMF07XG4gICAgfVxuXG4gICAgdmFyIHNvdXRoV2VzdCA9IEwubGF0TG5nKHhtaW4tLjAxLCB5bWluLS4wMSk7XG4gICAgdmFyIG5vcnRoRWFzdCA9IEwubGF0TG5nKHhtYXgrLjAxLCB5bWF4Ky4wMSk7XG5cbiAgICByZXR1cm4gTC5sYXRMbmdCb3VuZHMoc291dGhXZXN0LCBub3J0aEVhc3QpO1xuICB9LFxuXG4gIGdlb21ldHJ5V2l0aGluUmFkaXVzIDogZnVuY3Rpb24oZ2VvbWV0cnksIHh5UG9pbnRzLCBjZW50ZXIsIHh5UG9pbnQsIHJhZGl1cykge1xuICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50RGlzdGFuY2UoZ2VvbWV0cnksIGNlbnRlcikgPD0gcmFkaXVzO1xuICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgIGZvciggdmFyIGkgPSAxOyBpIDwgeHlQb2ludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmKCB0aGlzLmxpbmVJbnRlcnNlY3RzQ2lyY2xlKHh5UG9pbnRzW2ktMV0sIHh5UG9pbnRzW2ldLCB4eVBvaW50LCAzKSApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludEluUG9seWdvbihjZW50ZXIsIGdlb21ldHJ5KTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzI3NTUyOS9jaGVjay1pZi1saW5lLWludGVyc2VjdHMtd2l0aC1jaXJjbGVzLXBlcmltZXRlclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EaXN0YW5jZV9mcm9tX2FfcG9pbnRfdG9fYV9saW5lXG4gIC8vIFtsbmcgeCwgbGF0LCB5XVxuICBsaW5lSW50ZXJzZWN0c0NpcmNsZSA6IGZ1bmN0aW9uKGxpbmVQMSwgbGluZVAyLCBwb2ludCwgcmFkaXVzKSB7XG4gICAgdmFyIGRpc3RhbmNlID1cbiAgICAgIE1hdGguYWJzKFxuICAgICAgICAoKGxpbmVQMi55IC0gbGluZVAxLnkpKnBvaW50LngpIC0gKChsaW5lUDIueCAtIGxpbmVQMS54KSpwb2ludC55KSArIChsaW5lUDIueCpsaW5lUDEueSkgLSAobGluZVAyLnkqbGluZVAxLngpXG4gICAgICApIC9cbiAgICAgIE1hdGguc3FydChcbiAgICAgICAgTWF0aC5wb3cobGluZVAyLnkgLSBsaW5lUDEueSwgMikgKyBNYXRoLnBvdyhsaW5lUDIueCAtIGxpbmVQMS54LCAyKVxuICAgICAgKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPD0gcmFkaXVzO1xuICB9LFxuXG4gIC8vIGh0dHA6Ly93aWtpLm9wZW5zdHJlZXRtYXAub3JnL3dpa2kvWm9vbV9sZXZlbHNcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzU0NTA5OC9sZWFmbGV0LWNhbGN1bGF0aW5nLW1ldGVycy1wZXItcGl4ZWwtYXQtem9vbS1sZXZlbFxuICBtZXRlcnNQZXJQeCA6IGZ1bmN0aW9uKGxsLCBtYXApIHtcbiAgICB2YXIgcG9pbnRDID0gbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGwpOyAvLyBjb252ZXJ0IHRvIGNvbnRhaW5lcnBvaW50IChwaXhlbHMpXG4gICAgdmFyIHBvaW50WCA9IFtwb2ludEMueCArIDEsIHBvaW50Qy55XTsgLy8gYWRkIG9uZSBwaXhlbCB0byB4XG5cbiAgICAvLyBjb252ZXJ0IGNvbnRhaW5lcnBvaW50cyB0byBsYXRsbmcnc1xuICAgIHZhciBsYXRMbmdDID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRDKTtcbiAgICB2YXIgbGF0TG5nWCA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50WCk7XG5cbiAgICB2YXIgZGlzdGFuY2VYID0gbGF0TG5nQy5kaXN0YW5jZVRvKGxhdExuZ1gpOyAvLyBjYWxjdWxhdGUgZGlzdGFuY2UgYmV0d2VlbiBjIGFuZCB4IChsYXRpdHVkZSlcbiAgICByZXR1cm4gZGlzdGFuY2VYO1xuICB9LFxuXG4gIC8vIGZyb20gaHR0cDovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWxcbiAgcG9pbnREaXN0YW5jZSA6IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHZhciBsb24xID0gcHQxLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MSA9IHB0MS5jb29yZGluYXRlc1sxXSxcbiAgICAgIGxvbjIgPSBwdDIuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQyID0gcHQyLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgZExhdCA9IHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MiAtIGxhdDEpLFxuICAgICAgZExvbiA9IHRoaXMubnVtYmVyVG9SYWRpdXMobG9uMiAtIGxvbjEpLFxuICAgICAgYSA9IE1hdGgucG93KE1hdGguc2luKGRMYXQgLyAyKSwgMikgKyBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDEpKVxuICAgICAgICAqIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MikpICogTWF0aC5wb3coTWF0aC5zaW4oZExvbiAvIDIpLCAyKSxcbiAgICAgIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xuICAgIHJldHVybiAoNjM3MSAqIGMpICogMTAwMDsgLy8gcmV0dXJucyBtZXRlcnNcbiAgfSxcblxuICBwb2ludEluUG9seWdvbiA6IGZ1bmN0aW9uIChwLCBwb2x5KSB7XG4gICAgdmFyIGNvb3JkcyA9IChwb2x5LnR5cGUgPT0gXCJQb2x5Z29uXCIpID8gWyBwb2x5LmNvb3JkaW5hdGVzIF0gOiBwb2x5LmNvb3JkaW5hdGVzXG5cbiAgICB2YXIgaW5zaWRlQm94ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG9pbnRJbkJvdW5kaW5nQm94KHAsIHRoaXMuYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzKGNvb3Jkc1tpXSkpKSBpbnNpZGVCb3ggPSB0cnVlXG4gICAgfVxuICAgIGlmICghaW5zaWRlQm94KSByZXR1cm4gZmFsc2VcblxuICAgIHZhciBpbnNpZGVQb2x5ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG5wb2x5KHAuY29vcmRpbmF0ZXNbMV0sIHAuY29vcmRpbmF0ZXNbMF0sIGNvb3Jkc1tpXSkpIGluc2lkZVBvbHkgPSB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVBvbHlcbiAgfSxcblxuICBwb2ludEluQm91bmRpbmdCb3ggOiBmdW5jdGlvbiAocG9pbnQsIGJvdW5kcykge1xuICAgIHJldHVybiAhKHBvaW50LmNvb3JkaW5hdGVzWzFdIDwgYm91bmRzWzBdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzFdID4gYm91bmRzWzFdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdIDwgYm91bmRzWzBdWzFdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdID4gYm91bmRzWzFdWzFdKVxuICB9LFxuXG4gIGJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3JkcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4QWxsID0gW10sIHlBbGwgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHNbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHhBbGwucHVzaChjb29yZHNbMF1baV1bMV0pXG4gICAgICB5QWxsLnB1c2goY29vcmRzWzBdW2ldWzBdKVxuICAgIH1cblxuICAgIHhBbGwgPSB4QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICB5QWxsID0geUFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG5cbiAgICByZXR1cm4gWyBbeEFsbFswXSwgeUFsbFswXV0sIFt4QWxsW3hBbGwubGVuZ3RoIC0gMV0sIHlBbGxbeUFsbC5sZW5ndGggLSAxXV0gXVxuICB9LFxuXG4gIC8vIFBvaW50IGluIFBvbHlnb25cbiAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbCNMaXN0aW5nIHRoZSBWZXJ0aWNlc1xuICBwbnBvbHkgOiBmdW5jdGlvbih4LHksY29vcmRzKSB7XG4gICAgdmFyIHZlcnQgPSBbIFswLDBdIF1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvb3Jkc1tpXS5sZW5ndGg7IGorKykge1xuICAgICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldW2pdKVxuICAgICAgfVxuICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVswXSlcbiAgICAgIHZlcnQucHVzaChbMCwwXSlcbiAgICB9XG5cbiAgICB2YXIgaW5zaWRlID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZlcnQubGVuZ3RoIC0gMTsgaSA8IHZlcnQubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICBpZiAoKCh2ZXJ0W2ldWzBdID4geSkgIT0gKHZlcnRbal1bMF0gPiB5KSkgJiYgKHggPCAodmVydFtqXVsxXSAtIHZlcnRbaV1bMV0pICogKHkgLSB2ZXJ0W2ldWzBdKSAvICh2ZXJ0W2pdWzBdIC0gdmVydFtpXVswXSkgKyB2ZXJ0W2ldWzFdKSkgaW5zaWRlID0gIWluc2lkZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVcbiAgfSxcblxuICBudW1iZXJUb1JhZGl1cyA6IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICByZXR1cm4gbnVtYmVyICogTWF0aC5QSSAvIDE4MDtcbiAgfVxufTtcbiJdfQ==
