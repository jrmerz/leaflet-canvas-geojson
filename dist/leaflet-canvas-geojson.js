(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function CanvasFeature(geojson) {
    
    // radius for point features
    // use to calculate mouse over/out and click events for points
    // this value should match the value used for rendering points
    this.size = 5;
    
    var cache = {
        // projected points on canvas
        canvasXY : null,
        // zoom level canvasXY points are calculated to
        zoom : -1
    }
    
    // actual geojson object, will not be modifed, just stored
    this.geojson = geojson;
    
    // performance flag, will keep invisible features for recalc 
    // events as well as not being rendered
    this.visible = true;
    
    // bounding box for geometry, used for intersection and
    // visiblility optimizations
    this.bounds = null;
    
    // Leaflet LatLng, used for points to quickly look for intersection
    this.latlng = null;
    
    // clear the canvasXY stored values
    this.clearCache = function() {
        this.cache.canvasXY = null;
        this.cache.zoom = -1;
    }
    
    this.setCanvasXY = function(canvasXY, zoom) {
        this.cache.canvasXY = canvasXY;
        this.cache.zoom = zoom;
    }
    
    this.getCanvasXY = function() {
        return this.cache.canvasXY;
    }
    
    this.requiresReprojection = function(zoom) {
      if( cache.zoom == zoom && cache.geoXY ) {
        return false;
      }
      return true;
    }
    
    // optional, per feature, renderer
    this.renderer = null;
}

module.exports = CanvasFeature;
},{}],2:[function(require,module,exports){
var CanvasFeature = require('./CanvasFeature');

function CanvasFeatures(geojson) {
    // quick type flag
    this.isCanvasFeatures = true;
    
    this.canvasFeatures = [];
    
    // radius for point features
    // use to calculate mouse over/out and click events for points
    // this value should match the value used for rendering points
    this.size = 5;
    
    // actual geojson object, will not be modifed, just stored
    this.geojson = geojson;
    
    // performance flag, will keep invisible features for recalc 
    // events as well as not being rendered
    this.visible = true;
    
    this.clearCache = function() {
        for( var i = 0; i < this.canvasFeatures.length; i++ ) {
            this.canvasFeatures[i].clearCache();
        }
    }
    
    if( this.geojson ) {
        for( var i = 0; i < this.geojson.features.length; i++ ) {
            this.canvasFeatures.push(new CanvasFeature(this.geojson.features[i]));
        }
    }
}

module.exports = CanvasFeatures;
},{"./CanvasFeature":1}],3:[function(require,module,exports){
var CanvasFeature = require('./CanvasFeature');
var CanvasFeatures = require('./CanvasFeatures');

function factory(arg) {
    if( Array.isArray(arg) ) {
        return arg.map(generate);
    }
    
    return generate(arg);
}

function generate(geojson) {
    if( geojson.type === 'FeatureCollection' ) {
        return new CanvasFeatures(geojson);
    } else if ( geojson.type === 'Feature' ) {
        return new CanvasFeature(geojson);
    }
    throw new Error('Unsupported GeoJSON: '+geojson.type);
}

module.exports = factory;
},{"./CanvasFeature":1,"./CanvasFeatures":2}],4:[function(require,module,exports){
var ctx;

/**
 * Fuction called in scope of CanvasFeature
 */
function render(context, xyPoints, map, geojson) {
    ctx = context;
    
    if( geojson.geometry.type === 'Point' ) {
        renderPoint(xyPoints, this.size);
    } else if( geojson.geometry.type === 'LineString' ) {
        renderLine(xyPoints);
    } else if( geojson.geometry.type === 'Polygon' ) {
        renderPolygon(xyPoints);
    } else if( geojson.geometry.type === 'MultiPolygon' ) {
        xyPoints.forEach(renderPolygon);
    }
}

function renderPoint(xyPoint, size) {
    ctx.beginPath();

    ctx.arc(xyPoint.x, xyPoint.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle =  'rgba(0, 0, 0, .3)';
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
    for( j = 1; j < xyPoints.length; j++ ) {
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
    for( j = 1; j < xyPoints.length; j++ ) {
        ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
    }
    ctx.lineTo(xyPoints[0].x, xyPoints[0].y);

    ctx.stroke();
    ctx.fill();
}

module.exports = render;
},{}],5:[function(require,module,exports){
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

  // list of current features under the mouse
  this.intersectList = [];

  // used to calculate pixels moved from center
  this.lastCenterLL = null;

  // geometry helpers
  this.utils = require('./lib/utils');
  
  this.moving = false;
  this.zooming = false;
  
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

    this.clearCache();

    this.render();
  };

  // clear each features cache
  this.clearCache = function() {
    // kill the feature point cache
    for( var i = 0; i < this.features.length; i++ ) {
      this.features[i].clearCache();
    }
  };

  // get layer feature via geojson object
  this.getCanvasFeatureForGeojson = function(geojson) {
    for( var i = 0; i < this.features.length; i++ ) {
      if( this.features[i].geojson == geojson ) {
        return this.features[i];
      }
    }

    return null;
  }

  // get the meters per px and a certain point;
  this.getMetersPerPx = function(latlng) {
    return this.utils.metersPerPx(latlng, this._map);
  }
};

var layer = new CanvasLayer();


require('./lib/init')(layer);
require('./lib/redraw')(layer);
require('./lib/addFeature')(layer);
require('./lib/toCanvasXY')(layer);

L.CanvasFeatureFactory = require('./classes/factory');
L.CanvasFeature = CanvasFeature;
L.CanvasFeatures = CanvasFeatures;
L.CanvasGeojsonLayer = L.Class.extend(layer);

},{"./classes/CanvasFeature":1,"./classes/CanvasFeatures":2,"./classes/factory":3,"./defaultRenderer":4,"./lib/addFeature":6,"./lib/init":7,"./lib/redraw":9,"./lib/toCanvasXY":10,"./lib/utils":11}],6:[function(require,module,exports){
var CanvasFeature = require('../classes/CanvasFeature');
var CanvasFeatures = require('../classes/CanvasFeatures');

module.exports = function(layer) {
  layer.addCanvasFeatures = function(features) {
    for( var i = 0; i < features.length; i++ ) {
      this.addCanvasFeature(features[i]);
    }
  };

  layer.addCanvasFeature = function(feature, bottom) {
    if( !(feature instanceof CanvasFeature) && !(feature instanceof CanvasFeatures) ) {
      throw new Error('Feature must be instance of CanvasFeature or CanvasFeatures');
    }
    
    if( feature instanceof CanvasFeatures ) {
        feature.canvasFeatures.forEach(function(f){
            prepareCanvasFeature(this, f);
        }.bind(this));
    } else {
        prepareCanvasFeature(this, feature);
    }

    if( bottom ) { // bottom or index
      if( typeof bottom === 'number') this.features.splice(bottom, 0, feature);
      else this.features.unshift(feature);
    } else {
      this.features.push(feature);
    }
  },

  layer.addCanvasFeatureBottom = function(feature) {
    this.addFeature(feature, true);
  };

  // returns true if re-render required.  ie the feature was visible;
  layer.removeFeature = function(feature) {
    var index = this.features.indexOf(feature);
    if( index == -1 ) return;

    this.splice(index, 1);

    if( this.feature.visible ) return true;
    return false;
  };
}

function prepareCanvasFeature(layer, canvasFeature) {
    var geometry = canvasFeature.geojson.geometry;
    
    if( geometry.type == 'LineString' ) {
        
      canvasFeature.bounds = layer.utils.calcBounds(geometry.coordinates);

    } else if ( geometry.type == 'Polygon' ) {
      // TODO: we only support outer rings out the moment, no inner rings.  Thus coordinates[0]
      canvasFeature.bounds = layer.utils.calcBounds(geometry.coordinates[0]);

    } else if ( geometry.type == 'Point' ) {
 
      canvasFeature.latlng = L.latLng(geometry.coordinates[1], geometry.coordinates[0]);
    
    } else if ( geometry.type == 'MultiPolygon' ) {
      
      canvasFeature.bounds = [];
      for( var i = 0; i < geometry.coordinates.length; i++  ) {
        canvasFeature.bounds.push(layer.utils.calcBounds(geometry.coordinates[i][0]));
      }
      
    } else {
      throw new Error('GeoJSON feature type "'+geometry.type+'" not supported.');
    }
}
},{"../classes/CanvasFeature":1,"../classes/CanvasFeatures":2}],7:[function(require,module,exports){
var intersects = require('./intersects');
var count = 0;

module.exports = function(layer) {
    
    layer.initialize = function(options) {
        this.features = [];
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
        if (map.dragging.enabled()) {
            map.dragging._draggable.on('predrag', function() {
                moveStart.apply(this);
                //var d = map.dragging._draggable;
                //L.DomUtil.setPosition(this._canvas, { x: -d._newPos.x, y: -d._newPos.y });
            }, this);
        }

        map.on({
            'viewreset' : this.reset,
            'resize'    : this.reset,
            'zoomstart' : startZoom,
            'zoomend'   : endZoom,
            'movestart' : moveStart,
            'moveend'   : moveEnd,
            'mousemove' : intersects,
            'click'     : intersects
        }, this);

        this.reset();

        if( this.zIndex !== undefined ) {
            this.setZIndex(this.zIndex);
        }
    }
    
    layer.onRemove = function(map) {
        this._container.parentNode.removeChild(this._container);
        map.off({
            'viewreset' : this.reset,
            'resize'    : this.reset,
            'movestart' : moveStart,
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
    setTimeout(this.render.bind(this), 50);
}

function moveStart() {
    this.moving = true;
    
    window.requestAnimationFrame(frameRender.bind(this));
}

function moveEnd(e) {
    this.moving = false;
    this.render(e);
};

function frameRender() {
    if( !this.moving ) return;
    
    this.render();
    setTimeout(function(){
        window.requestAnimationFrame(frameRender.bind(this));
    }, 500);
}
},{"./intersects":8}],8:[function(require,module,exports){
/** 
 * Handle mouse intersection events
 * e - leaflet event
 **/
function intersects(e) {
    if( !this.showing ) return;

    var t = new Date().getTime();
    var mpp = this.getMetersPerPx(e.latlng);
    var r = mpp * 5; // 5 px radius buffer;

    var center = {
      type : 'Point',
      coordinates : [e.latlng.lng, e.latlng.lat]
    };

    var f;
    var intersects = [];

    for( var i = 0; i < this.features.length; i++ ) {
      f = this.features[i];

      if( !f.visible ) continue;
      if( !f.geojson.geometry ) continue;
      if( !f.cache ) continue;
      if( !f.cache.geoXY ) continue;
      if( !this._isInBounds(f, e.latlng) ) continue;

      if( this.utils.geometryWithinRadius(f.geojson.geometry, f.cache.geoXY, center, e.containerPoint, f.size ? (f.size * mpp) : r) ) {
        intersects.push(f.geojson);
      }
    }

    if( e.type == 'click' && this.onClick ) {
      this.onClick(intersects);
      return;
    }

    var mouseover = [], mouseout = [], mousemove = [];

    var changed = false;
    for( var i = 0; i < intersects.length; i++ ) {
      if( this.intersectList.indexOf(intersects[i]) > -1 ) {
        mousemove.push(intersects[i]);
      } else {
        changed = true;
        mouseover.push(intersects[i]);
      }
    }

    for( var i = 0; i < this.intersectList.length; i++ ) {
      if( intersects.indexOf(this.intersectList[i]) == -1 ) {
        changed = true;
        mouseout.push(this.intersectList[i]);
      }
    }

    this.intersectList = intersects;

    if( this.onMouseOver && mouseover.length > 0 ) this.onMouseOver.call(this, mouseover, e);
    if( this.onMouseMove ) this.onMouseMove.call(this, mousemove, e); // always fire
    if( this.onMouseOut && mouseout.length > 0 ) this.onMouseOut.call(this, mouseout, e);

    if( this.debug ) console.log('intersects time: '+(new Date().getTime() - t)+'ms');

    if( changed ) this.render();
  }


function isInBounds(feature, latlng) {
    if( feature.bounds ) {
        if( Array.isArray(feature.bounds) ) {

        for( var i = 0; i < feature.bounds.length; i++ ) {
            if( feature.bounds[i].contains(latlng) ) return true;
        }

        } else if ( feature.bounds.contains(latlng) ) {
        return true;
        }

        return false;
    }
    return true;
}

module.exports = intersects;
},{}],9:[function(require,module,exports){
module.exports = function(layer) {
    
  layer.render = function(e) {
    /*if( this.moving ) {
      return;
    }*/

    var t, diff
    if( this.debug ) {
        t = new Date().getTime();
    }

    var diff = null;
    if( e && e.type == 'moveend' ) {
      var center = this._map.getCenter();

      var pt = this._map.latLngToContainerPoint(center);
      if( this.lastCenterLL ) {
        var lastXy = this._map.latLngToContainerPoint(this.lastCenterLL);
        diff = {
          x : lastXy.x - pt.x,
          y : lastXy.y - pt.y
        }
      }

      this.lastCenterLL = center;
    }

    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);

    var canvas = this.getCanvas();
    var ctx = this._ctx;

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if( !this.zooming ) {
        this.redraw(diff);
    }

    if( this.debug ) {
      diff = new Date().getTime() - t;

      var c = 0;
      for( var i = 0; i < this.features.length; i++ ) {
        if( !this.features[i].cache.geoXY ) continue;
        if( Array.isArray(this.features[i].cache.geoXY) ) c += this.features[i].cache.geoXY.length;
      }

      console.log('Rendered '+c+' pts in '+diff+'ms');
    }
  },
    

  // redraw all features.  This does not handle clearing the canvas or setting
  // the canvas correct position.  That is handled by render
  layer.redraw = function(diff) {
    if( !this.showing ) return;

    // objects should keep track of last bbox and zoom of map
    // if this hasn't changed the ll -> container pt is not needed
    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    if( this.debug ) t = new Date().getTime();
    
    var f, i, j;
    for( var i = 0; i < this.features.length; i++ ) {
      f = this.features[i];
      if( f.isCanvasFeatures ) {
        for( j = 0; j < f.canvasFeatures.length; j++ ) {
          this.redrawFeature(f.canvasFeatures[j], bounds, zoom, diff);
        }
      } else {
        this.redrawFeature(f, bounds, zoom, diff);
      }
      
    }

    if( this.debug ) console.log('Render time: '+(new Date().getTime() - t)+'ms; avg: '+
      ((new Date().getTime() - t) / this.features.length)+'ms');
  },



  // redraw an individual feature
  layer.redrawFeature = function(canvasFeature, bounds, zoom, diff) {
    //if( feature.geojson.properties.debug ) debugger;

    // ignore anything flagged as hidden
    // we do need to clear the cache in this case
    if( !canvasFeature.visible ) {
      canvasFeature.clearCache();
      return;
    }

    // now lets check cache to see if we need to reproject the
    // xy coordinates
    // actually project to xy if needed
    var reproject = canvasFeature.requiresReprojection(zoom);
    if( reproject ) {
      this.toCanvasXY(canvasFeature, zoom);
    }  // end reproject

    // if this was a simple pan event (a diff was provided) and we did not reproject
    // move the feature by diff x/y
    if( diff && !reproject ) {
      if( canvasFeature.geojson.geometry.type == 'Point' ) {

        canvasFeature.cache.geoXY.x += diff.x;
        canvasFeature.cache.geoXY.y += diff.y;

      } else if( canvasFeature.geojson.geometry.type == 'LineString' ) {

        this.utils.moveLine(canvasFeature.cache.geoXY, diff);

      } else if ( canvasFeature.geojson.geometry.type == 'Polygon' ) {
      
        this.utils.moveLine(canvasFeature.cache.geoXY, diff);
      
      } else if ( canvasFeature.geojson.geometry.type == 'MultiPolygon' ) {
          
        for( var i = 0; i < canvasFeature.cache.geoXY.length; i++ ) {
          this.utils.moveLine(canvasFeature.cache.geoXY[i], diff);
        }
      }
    }

    // ignore anything not in bounds
    if( canvasFeature.geojson.geometry.type == 'Point' ) {
      if( !bounds.contains(canvasFeature.latlng) ) {
        return;
      }
    } else if( canvasFeature.geojson.geometry.type == 'MultiPolygon' ) {

      // just make sure at least one polygon is within range
      var found = false;
      for( var i = 0; i < canvasFeature.bounds.length; i++ ) {
        if( bounds.contains(canvasFeature.bounds[i]) || bounds.intersects(canvasFeature.bounds[i]) ) {
          found = true;
          break;
        }
      }
      if( !found ) return;

    } else {
      if( !bounds.contains(canvasFeature.bounds) && !bounds.intersects(canvasFeature.bounds) ) {
        return;
      }
    }
    
    var renderer = canvasFeature.renderer ? canvasFeature.renderer : this.renderer;
    
    // call feature render function in feature scope; feature is passed as well
    renderer.call(
        canvasFeature, // scope
        this._ctx, 
        canvasFeature.getCanvasXY(), 
        this._map, 
        canvasFeature.geojson
    );
  };
}
},{}],10:[function(require,module,exports){

module.exports = function(layer) {
     layer.toCanvasXY = function(feature, zoom) {
        // make sure we have a cache namespace and set the zoom level
        if( !feature.cache ) feature.cache = {};
        var canvasXY;

        if( feature.geojson.geometry.type == 'Point' ) {

        canvasXY = this._map.latLngToContainerPoint([
            feature.geojson.geometry.coordinates[1],
            feature.geojson.geometry.coordinates[0]
        ]);

        if( feature.size ) {
            canvasXY[0] = canvasXY[0] - feature.size / 2;
            canvasXY[1] = canvasXY[1] - feature.size / 2;
        }

        } else if( feature.geojson.geometry.type == 'LineString' ) {
            
        canvasXY = this.utils.projectLine(feature.geojson.geometry.coordinates, this._map);
        trimCanvasXY(canvasXY);
    
        } else if ( feature.geojson.geometry.type == 'Polygon' ) {
        
        canvasXY = this.utils.projectLine(feature.geojson.geometry.coordinates[0], this._map);
        trimCanvasXY(canvasXY);
        
        } else if ( feature.geojson.geometry.type == 'MultiPolygon' ) {
            canvasXY = [];
        
            for( var i = 0; i < feature.geojson.geometry.coordinates.length; i++ ) {
                var xy = this.utils.projectLine(feature.geojson.geometry.coordinates[i][0], this._map);
                trimCanvasXY(xy);
                canvasXY.push(xy);
            }
        }
        
        feature.setCanvasXY(canvasXY, zoom);
    };
}

// given an array of geo xy coordinates, make sure each point is at least more than 1px apart
function trimCanvasXY(xy) {
    if( xy.length === 0 ) return;
    var last = xy[xy.length-1], i, point;

    var c = 0;
    for( i = xy.length-2; i >= 0; i-- ) {
        point = xy[i];
        if( Math.abs(last.x - point.x) === 0 && Math.abs(last.y - point.y) === 0 ) {
            xy.splice(i, 1);
            c++;
        } else {
            last = point;
        }
    }

    if( xy.length <= 1 ) {
        xy.push(last);
        c--;
    }
};
},{}],11:[function(require,module,exports){
module.exports = {
  moveLine : function(coords, diff) {
    var i; len = coords.length;
    for( i = 0; i < len; i++ ) {
      coords[i].x += diff.x;
      coords[i].y += diff.y;
    }
  },

  projectLine : function(coords, map) {
    var xyLine = [];

    for( var i = 0; i < coords.length; i++ ) {
      xyLine.push(map.latLngToContainerPoint([
          coords[i][1], coords[i][0]
      ]));
    }

    return xyLine;
  },

  calcBounds : function(coords) {
    var xmin = coords[0][1];
    var xmax = coords[0][1];
    var ymin = coords[0][0];
    var ymax = coords[0][0];

    for( var i = 1; i < coords.length; i++ ) {
      if( xmin > coords[i][1] ) xmin = coords[i][1];
      if( xmax < coords[i][1] ) xmax = coords[i][1];

      if( ymin > coords[i][0] ) ymin = coords[i][0];
      if( ymax < coords[i][0] ) ymax = coords[i][0];
    }

    var southWest = L.latLng(xmin-.01, ymin-.01);
    var northEast = L.latLng(xmax+.01, ymax+.01);

    return L.latLngBounds(southWest, northEast);
  },

  geometryWithinRadius : function(geometry, xyPoints, center, xyPoint, radius) {
    if (geometry.type == 'Point') {
      return this.pointDistance(geometry, center) <= radius;
    } else if (geometry.type == 'LineString' ) {

      for( var i = 1; i < xyPoints.length; i++ ) {
        if( this.lineIntersectsCircle(xyPoints[i-1], xyPoints[i], xyPoint, 3) ) {
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
  lineIntersectsCircle : function(lineP1, lineP2, point, radius) {
    var distance =
      Math.abs(
        ((lineP2.y - lineP1.y)*point.x) - ((lineP2.x - lineP1.x)*point.y) + (lineP2.x*lineP1.y) - (lineP2.y*lineP1.x)
      ) /
      Math.sqrt(
        Math.pow(lineP2.y - lineP1.y, 2) + Math.pow(lineP2.x - lineP1.x, 2)
      );
    return distance <= radius;
  },

  // http://wiki.openstreetmap.org/wiki/Zoom_levels
  // http://stackoverflow.com/questions/27545098/leaflet-calculating-meters-per-pixel-at-zoom-level
  metersPerPx : function(ll, map) {
    var pointC = map.latLngToContainerPoint(ll); // convert to containerpoint (pixels)
    var pointX = [pointC.x + 1, pointC.y]; // add one pixel to x

    // convert containerpoints to latlng's
    var latLngC = map.containerPointToLatLng(pointC);
    var latLngX = map.containerPointToLatLng(pointX);

    var distanceX = latLngC.distanceTo(latLngX); // calculate distance between c and x (latitude)
    return distanceX;
  },

  // from http://www.movable-type.co.uk/scripts/latlong.html
  pointDistance : function (pt1, pt2) {
    var lon1 = pt1.coordinates[0],
      lat1 = pt1.coordinates[1],
      lon2 = pt2.coordinates[0],
      lat2 = pt2.coordinates[1],
      dLat = this.numberToRadius(lat2 - lat1),
      dLon = this.numberToRadius(lon2 - lon1),
      a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(this.numberToRadius(lat1))
        * Math.cos(this.numberToRadius(lat2)) * Math.pow(Math.sin(dLon / 2), 2),
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (6371 * c) * 1000; // returns meters
  },

  pointInPolygon : function (p, poly) {
    var coords = (poly.type == "Polygon") ? [ poly.coordinates ] : poly.coordinates

    var insideBox = false
    for (var i = 0; i < coords.length; i++) {
      if (this.pointInBoundingBox(p, this.boundingBoxAroundPolyCoords(coords[i]))) insideBox = true
    }
    if (!insideBox) return false

    var insidePoly = false
    for (var i = 0; i < coords.length; i++) {
      if (this.pnpoly(p.coordinates[1], p.coordinates[0], coords[i])) insidePoly = true
    }

    return insidePoly
  },

  pointInBoundingBox : function (point, bounds) {
    return !(point.coordinates[1] < bounds[0][0] || point.coordinates[1] > bounds[1][0] || point.coordinates[0] < bounds[0][1] || point.coordinates[0] > bounds[1][1])
  },

  boundingBoxAroundPolyCoords : function(coords) {
    var xAll = [], yAll = []

    for (var i = 0; i < coords[0].length; i++) {
      xAll.push(coords[0][i][1])
      yAll.push(coords[0][i][0])
    }

    xAll = xAll.sort(function (a,b) { return a - b })
    yAll = yAll.sort(function (a,b) { return a - b })

    return [ [xAll[0], yAll[0]], [xAll[xAll.length - 1], yAll[yAll.length - 1]] ]
  },

  // Point in Polygon
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#Listing the Vertices
  pnpoly : function(x,y,coords) {
    var vert = [ [0,0] ]

    for (var i = 0; i < coords.length; i++) {
      for (var j = 0; j < coords[i].length; j++) {
        vert.push(coords[i][j])
      }
      vert.push(coords[i][0])
      vert.push([0,0])
    }

    var inside = false
    for (var i = 0, j = vert.length - 1; i < vert.length; j = i++) {
      if (((vert[i][0] > y) != (vert[j][0] > y)) && (x < (vert[j][1] - vert[i][1]) * (y - vert[i][0]) / (vert[j][0] - vert[i][0]) + vert[i][1])) inside = !inside
    }

    return inside
  },

  numberToRadius : function (number) {
    return number * Math.PI / 180;
  }
};

},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUuanMiLCJzcmMvY2xhc3Nlcy9DYW52YXNGZWF0dXJlcy5qcyIsInNyYy9jbGFzc2VzL2ZhY3RvcnkuanMiLCJzcmMvZGVmYXVsdFJlbmRlcmVyL2luZGV4LmpzIiwic3JjL2xheWVyIiwic3JjL2xpYi9hZGRGZWF0dXJlLmpzIiwic3JjL2xpYi9pbml0LmpzIiwic3JjL2xpYi9pbnRlcnNlY3RzLmpzIiwic3JjL2xpYi9yZWRyYXcuanMiLCJzcmMvbGliL3RvQ2FudmFzWFkuanMiLCJzcmMvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gQ2FudmFzRmVhdHVyZShnZW9qc29uKSB7XG4gICAgXG4gICAgLy8gcmFkaXVzIGZvciBwb2ludCBmZWF0dXJlc1xuICAgIC8vIHVzZSB0byBjYWxjdWxhdGUgbW91c2Ugb3Zlci9vdXQgYW5kIGNsaWNrIGV2ZW50cyBmb3IgcG9pbnRzXG4gICAgLy8gdGhpcyB2YWx1ZSBzaG91bGQgbWF0Y2ggdGhlIHZhbHVlIHVzZWQgZm9yIHJlbmRlcmluZyBwb2ludHNcbiAgICB0aGlzLnNpemUgPSA1O1xuICAgIFxuICAgIHZhciBjYWNoZSA9IHtcbiAgICAgICAgLy8gcHJvamVjdGVkIHBvaW50cyBvbiBjYW52YXNcbiAgICAgICAgY2FudmFzWFkgOiBudWxsLFxuICAgICAgICAvLyB6b29tIGxldmVsIGNhbnZhc1hZIHBvaW50cyBhcmUgY2FsY3VsYXRlZCB0b1xuICAgICAgICB6b29tIDogLTFcbiAgICB9XG4gICAgXG4gICAgLy8gYWN0dWFsIGdlb2pzb24gb2JqZWN0LCB3aWxsIG5vdCBiZSBtb2RpZmVkLCBqdXN0IHN0b3JlZFxuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgXG4gICAgLy8gcGVyZm9ybWFuY2UgZmxhZywgd2lsbCBrZWVwIGludmlzaWJsZSBmZWF0dXJlcyBmb3IgcmVjYWxjIFxuICAgIC8vIGV2ZW50cyBhcyB3ZWxsIGFzIG5vdCBiZWluZyByZW5kZXJlZFxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgXG4gICAgLy8gYm91bmRpbmcgYm94IGZvciBnZW9tZXRyeSwgdXNlZCBmb3IgaW50ZXJzZWN0aW9uIGFuZFxuICAgIC8vIHZpc2libGlsaXR5IG9wdGltaXphdGlvbnNcbiAgICB0aGlzLmJvdW5kcyA9IG51bGw7XG4gICAgXG4gICAgLy8gTGVhZmxldCBMYXRMbmcsIHVzZWQgZm9yIHBvaW50cyB0byBxdWlja2x5IGxvb2sgZm9yIGludGVyc2VjdGlvblxuICAgIHRoaXMubGF0bG5nID0gbnVsbDtcbiAgICBcbiAgICAvLyBjbGVhciB0aGUgY2FudmFzWFkgc3RvcmVkIHZhbHVlc1xuICAgIHRoaXMuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmNhY2hlLmNhbnZhc1hZID0gbnVsbDtcbiAgICAgICAgdGhpcy5jYWNoZS56b29tID0gLTE7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2V0Q2FudmFzWFkgPSBmdW5jdGlvbihjYW52YXNYWSwgem9vbSkge1xuICAgICAgICB0aGlzLmNhY2hlLmNhbnZhc1hZID0gY2FudmFzWFk7XG4gICAgICAgIHRoaXMuY2FjaGUuem9vbSA9IHpvb207XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZ2V0Q2FudmFzWFkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuY2FudmFzWFk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMucmVxdWlyZXNSZXByb2plY3Rpb24gPSBmdW5jdGlvbih6b29tKSB7XG4gICAgICBpZiggY2FjaGUuem9vbSA9PSB6b29tICYmIGNhY2hlLmdlb1hZICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgLy8gb3B0aW9uYWwsIHBlciBmZWF0dXJlLCByZW5kZXJlclxuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0ZlYXR1cmU7IiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmUnKTtcblxuZnVuY3Rpb24gQ2FudmFzRmVhdHVyZXMoZ2VvanNvbikge1xuICAgIC8vIHF1aWNrIHR5cGUgZmxhZ1xuICAgIHRoaXMuaXNDYW52YXNGZWF0dXJlcyA9IHRydWU7XG4gICAgXG4gICAgdGhpcy5jYW52YXNGZWF0dXJlcyA9IFtdO1xuICAgIFxuICAgIC8vIHJhZGl1cyBmb3IgcG9pbnQgZmVhdHVyZXNcbiAgICAvLyB1c2UgdG8gY2FsY3VsYXRlIG1vdXNlIG92ZXIvb3V0IGFuZCBjbGljayBldmVudHMgZm9yIHBvaW50c1xuICAgIC8vIHRoaXMgdmFsdWUgc2hvdWxkIG1hdGNoIHRoZSB2YWx1ZSB1c2VkIGZvciByZW5kZXJpbmcgcG9pbnRzXG4gICAgdGhpcy5zaXplID0gNTtcbiAgICBcbiAgICAvLyBhY3R1YWwgZ2VvanNvbiBvYmplY3QsIHdpbGwgbm90IGJlIG1vZGlmZWQsIGp1c3Qgc3RvcmVkXG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICBcbiAgICAvLyBwZXJmb3JtYW5jZSBmbGFnLCB3aWxsIGtlZXAgaW52aXNpYmxlIGZlYXR1cmVzIGZvciByZWNhbGMgXG4gICAgLy8gZXZlbnRzIGFzIHdlbGwgYXMgbm90IGJlaW5nIHJlbmRlcmVkXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmNhbnZhc0ZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNGZWF0dXJlc1tpXS5jbGVhckNhY2hlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIHRoaXMuZ2VvanNvbiApIHtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmdlb2pzb24uZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzLnB1c2gobmV3IENhbnZhc0ZlYXR1cmUodGhpcy5nZW9qc29uLmZlYXR1cmVzW2ldKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRmVhdHVyZXM7IiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZXMnKTtcblxuZnVuY3Rpb24gZmFjdG9yeShhcmcpIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheShhcmcpICkge1xuICAgICAgICByZXR1cm4gYXJnLm1hcChnZW5lcmF0ZSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBnZW5lcmF0ZShhcmcpO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZShnZW9qc29uKSB7XG4gICAgaWYoIGdlb2pzb24udHlwZSA9PT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJyApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNGZWF0dXJlcyhnZW9qc29uKTtcbiAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlJyApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNGZWF0dXJlKGdlb2pzb24pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIEdlb0pTT046ICcrZ2VvanNvbi50eXBlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5OyIsInZhciBjdHg7XG5cbi8qKlxuICogRnVjdGlvbiBjYWxsZWQgaW4gc2NvcGUgb2YgQ2FudmFzRmVhdHVyZVxuICovXG5mdW5jdGlvbiByZW5kZXIoY29udGV4dCwgeHlQb2ludHMsIG1hcCwgZ2VvanNvbikge1xuICAgIGN0eCA9IGNvbnRleHQ7XG4gICAgXG4gICAgaWYoIGdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvaW50JyApIHtcbiAgICAgICAgcmVuZGVyUG9pbnQoeHlQb2ludHMsIHRoaXMuc2l6ZSk7XG4gICAgfSBlbHNlIGlmKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgcmVuZGVyTGluZSh4eVBvaW50cyk7XG4gICAgfSBlbHNlIGlmKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT09ICdQb2x5Z29uJyApIHtcbiAgICAgICAgcmVuZGVyUG9seWdvbih4eVBvaW50cyk7XG4gICAgfSBlbHNlIGlmKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgICB4eVBvaW50cy5mb3JFYWNoKHJlbmRlclBvbHlnb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyUG9pbnQoeHlQb2ludCwgc2l6ZSkge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgIGN0eC5hcmMoeHlQb2ludC54LCB4eVBvaW50LnksIHNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbic7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTGluZSh4eVBvaW50cykge1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnO1xuICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuXG4gICAgdmFyIGo7XG4gICAgY3R4Lm1vdmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcbiAgICBmb3IoIGogPSAxOyBqIDwgeHlQb2ludHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGN0eC5saW5lVG8oeHlQb2ludHNbal0ueCwgeHlQb2ludHNbal0ueSk7XG4gICAgfVxuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBvbHlnb24oeHlQb2ludHMpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LCAxNTIsIDAsLjgpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcblxuICAgIHZhciBqO1xuICAgIGN0eC5tb3ZlVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG4gICAgZm9yKCBqID0gMTsgaiA8IHh5UG9pbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjdHgubGluZVRvKHh5UG9pbnRzW2pdLngsIHh5UG9pbnRzW2pdLnkpO1xuICAgIH1cbiAgICBjdHgubGluZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlcycpO1xuXG5mdW5jdGlvbiBDYW52YXNMYXllcigpIHtcbiAgLy8gc2hvdyBsYXllciB0aW1pbmdcbiAgdGhpcy5kZWJ1ZyA9IGZhbHNlO1xuXG4gIC8vIGluY2x1ZGUgZXZlbnRzXG4gIHRoaXMuaW5jbHVkZXMgPSBbTC5NaXhpbi5FdmVudHNdO1xuXG4gIC8vIGxpc3Qgb2YgZ2VvanNvbiBmZWF0dXJlcyB0byBkcmF3XG4gIC8vICAgLSB0aGVzZSB3aWxsIGRyYXcgaW4gb3JkZXJcbiAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuXG4gIC8vIGxpc3Qgb2YgY3VycmVudCBmZWF0dXJlcyB1bmRlciB0aGUgbW91c2VcbiAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gW107XG5cbiAgLy8gdXNlZCB0byBjYWxjdWxhdGUgcGl4ZWxzIG1vdmVkIGZyb20gY2VudGVyXG4gIHRoaXMubGFzdENlbnRlckxMID0gbnVsbDtcblxuICAvLyBnZW9tZXRyeSBoZWxwZXJzXG4gIHRoaXMudXRpbHMgPSByZXF1aXJlKCcuL2xpYi91dGlscycpO1xuICBcbiAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gIFxuICAvLyByZWNvbW1lbmRlZCB5b3Ugb3ZlcnJpZGUgdGhpcy4gIHlvdSBjYW4gYWxzbyBzZXQgYSBjdXN0b20gcmVuZGVyZXJcbiAgLy8gZm9yIGVhY2ggQ2FudmFzRmVhdHVyZSBpZiB5b3Ugd2lzaFxuICB0aGlzLnJlbmRlcmVyID0gcmVxdWlyZSgnLi9kZWZhdWx0UmVuZGVyZXInKTtcblxuICB0aGlzLmdldENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XG4gIH07XG5cbiAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9O1xuXG4gIHRoaXMuYWRkVG8gPSBmdW5jdGlvbiAobWFwKSB7XG4gICAgbWFwLmFkZExheWVyKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gcmVzZXQgYWN0dWFsIGNhbnZhcyBzaXplXG4gICAgdmFyIHNpemUgPSB0aGlzLl9tYXAuZ2V0U2l6ZSgpO1xuICAgIHRoaXMuX2NhbnZhcy53aWR0aCA9IHNpemUueDtcbiAgICB0aGlzLl9jYW52YXMuaGVpZ2h0ID0gc2l6ZS55O1xuXG4gICAgdGhpcy5jbGVhckNhY2hlKCk7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9O1xuXG4gIC8vIGNsZWFyIGVhY2ggZmVhdHVyZXMgY2FjaGVcbiAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8ga2lsbCB0aGUgZmVhdHVyZSBwb2ludCBjYWNoZVxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBnZXQgbGF5ZXIgZmVhdHVyZSB2aWEgZ2VvanNvbiBvYmplY3RcbiAgdGhpcy5nZXRDYW52YXNGZWF0dXJlRm9yR2VvanNvbiA9IGZ1bmN0aW9uKGdlb2pzb24pIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5mZWF0dXJlc1tpXS5nZW9qc29uID09IGdlb2pzb24gKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gZ2V0IHRoZSBtZXRlcnMgcGVyIHB4IGFuZCBhIGNlcnRhaW4gcG9pbnQ7XG4gIHRoaXMuZ2V0TWV0ZXJzUGVyUHggPSBmdW5jdGlvbihsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5tZXRlcnNQZXJQeChsYXRsbmcsIHRoaXMuX21hcCk7XG4gIH1cbn07XG5cbnZhciBsYXllciA9IG5ldyBDYW52YXNMYXllcigpO1xuXG5cbnJlcXVpcmUoJy4vbGliL2luaXQnKShsYXllcik7XG5yZXF1aXJlKCcuL2xpYi9yZWRyYXcnKShsYXllcik7XG5yZXF1aXJlKCcuL2xpYi9hZGRGZWF0dXJlJykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvdG9DYW52YXNYWScpKGxheWVyKTtcblxuTC5DYW52YXNGZWF0dXJlRmFjdG9yeSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9mYWN0b3J5Jyk7XG5MLkNhbnZhc0ZlYXR1cmUgPSBDYW52YXNGZWF0dXJlO1xuTC5DYW52YXNGZWF0dXJlcyA9IENhbnZhc0ZlYXR1cmVzO1xuTC5DYW52YXNHZW9qc29uTGF5ZXIgPSBMLkNsYXNzLmV4dGVuZChsYXllcik7XG4iLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4uL2NsYXNzZXMvQ2FudmFzRmVhdHVyZScpO1xudmFyIENhbnZhc0ZlYXR1cmVzID0gcmVxdWlyZSgnLi4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gIGxheWVyLmFkZENhbnZhc0ZlYXR1cmVzID0gZnVuY3Rpb24oZmVhdHVyZXMpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5hZGRDYW52YXNGZWF0dXJlKGZlYXR1cmVzW2ldKTtcbiAgICB9XG4gIH07XG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZSA9IGZ1bmN0aW9uKGZlYXR1cmUsIGJvdHRvbSkge1xuICAgIGlmKCAhKGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlKSAmJiAhKGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlcykgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZlYXR1cmUgbXVzdCBiZSBpbnN0YW5jZSBvZiBDYW52YXNGZWF0dXJlIG9yIENhbnZhc0ZlYXR1cmVzJyk7XG4gICAgfVxuICAgIFxuICAgIGlmKCBmZWF0dXJlIGluc3RhbmNlb2YgQ2FudmFzRmVhdHVyZXMgKSB7XG4gICAgICAgIGZlYXR1cmUuY2FudmFzRmVhdHVyZXMuZm9yRWFjaChmdW5jdGlvbihmKXtcbiAgICAgICAgICAgIHByZXBhcmVDYW52YXNGZWF0dXJlKHRoaXMsIGYpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByZXBhcmVDYW52YXNGZWF0dXJlKHRoaXMsIGZlYXR1cmUpO1xuICAgIH1cblxuICAgIGlmKCBib3R0b20gKSB7IC8vIGJvdHRvbSBvciBpbmRleFxuICAgICAgaWYoIHR5cGVvZiBib3R0b20gPT09ICdudW1iZXInKSB0aGlzLmZlYXR1cmVzLnNwbGljZShib3R0b20sIDAsIGZlYXR1cmUpO1xuICAgICAgZWxzZSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICB9XG4gIH0sXG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZUJvdHRvbSA9IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICB0aGlzLmFkZEZlYXR1cmUoZmVhdHVyZSwgdHJ1ZSk7XG4gIH07XG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHJlLXJlbmRlciByZXF1aXJlZC4gIGllIHRoZSBmZWF0dXJlIHdhcyB2aXNpYmxlO1xuICBsYXllci5yZW1vdmVGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZmVhdHVyZXMuaW5kZXhPZihmZWF0dXJlKTtcbiAgICBpZiggaW5kZXggPT0gLTEgKSByZXR1cm47XG5cbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiggdGhpcy5mZWF0dXJlLnZpc2libGUgKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVDYW52YXNGZWF0dXJlKGxheWVyLCBjYW52YXNGZWF0dXJlKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5O1xuICAgIFxuICAgIGlmKCBnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgXG4gICAgICBjYW52YXNGZWF0dXJlLmJvdW5kcyA9IGxheWVyLnV0aWxzLmNhbGNCb3VuZHMoZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuXG4gICAgfSBlbHNlIGlmICggZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAvLyBUT0RPOiB3ZSBvbmx5IHN1cHBvcnQgb3V0ZXIgcmluZ3Mgb3V0IHRoZSBtb21lbnQsIG5vIGlubmVyIHJpbmdzLiAgVGh1cyBjb29yZGluYXRlc1swXVxuICAgICAgY2FudmFzRmVhdHVyZS5ib3VuZHMgPSBsYXllci51dGlscy5jYWxjQm91bmRzKGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcblxuICAgIH0gZWxzZSBpZiAoIGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcbiBcbiAgICAgIGNhbnZhc0ZlYXR1cmUubGF0bG5nID0gTC5sYXRMbmcoZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sIGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcbiAgICBcbiAgICB9IGVsc2UgaWYgKCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgXG4gICAgICBjYW52YXNGZWF0dXJlLmJvdW5kcyA9IFtdO1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBnZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGg7IGkrKyAgKSB7XG4gICAgICAgIGNhbnZhc0ZlYXR1cmUuYm91bmRzLnB1c2gobGF5ZXIudXRpbHMuY2FsY0JvdW5kcyhnZW9tZXRyeS5jb29yZGluYXRlc1tpXVswXSkpO1xuICAgICAgfVxuICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignR2VvSlNPTiBmZWF0dXJlIHR5cGUgXCInK2dlb21ldHJ5LnR5cGUrJ1wiIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgfVxufSIsInZhciBpbnRlcnNlY3RzID0gcmVxdWlyZSgnLi9pbnRlcnNlY3RzJyk7XG52YXIgY291bnQgPSAwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgXG4gICAgbGF5ZXIuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICAgICAgICB0aGlzLmludGVyc2VjdExpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5zaG93aW5nID0gdHJ1ZTtcblxuICAgICAgICAvLyBzZXQgb3B0aW9uc1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gbW92ZSBtb3VzZSBldmVudCBoYW5kbGVycyB0byBsYXllciBzY29wZVxuICAgICAgICB2YXIgbW91c2VFdmVudHMgPSBbJ29uTW91c2VPdmVyJywgJ29uTW91c2VNb3ZlJywgJ29uTW91c2VPdXQnLCAnb25DbGljayddO1xuICAgICAgICBtb3VzZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgaWYoICF0aGlzLm9wdGlvbnNbZV0gKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzW2VdID0gdGhpcy5vcHRpb25zW2VdO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMub3B0aW9uc1tlXTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvLyBzZXQgY2FudmFzIGFuZCBjYW52YXMgY29udGV4dCBzaG9ydGN1dHNcbiAgICAgICAgdGhpcy5fY2FudmFzID0gY3JlYXRlQ2FudmFzKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9jdHggPSB0aGlzLl9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9O1xuICAgIFxuICAgIGxheWVyLm9uQWRkID0gZnVuY3Rpb24obWFwKSB7XG4gICAgICAgIHRoaXMuX21hcCA9IG1hcDtcblxuICAgICAgICAvLyBhZGQgY29udGFpbmVyIHdpdGggdGhlIGNhbnZhcyB0byB0aGUgdGlsZSBwYW5lXG4gICAgICAgIC8vIHRoZSBjb250YWluZXIgaXMgbW92ZWQgaW4gdGhlIG9wb3NpdGUgZGlyZWN0aW9uIG9mIHRoZVxuICAgICAgICAvLyBtYXAgcGFuZSB0byBrZWVwIHRoZSBjYW52YXMgYWx3YXlzIGluICgwLCAwKVxuICAgICAgICAvL3ZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMudGlsZVBhbmU7XG4gICAgICAgIHZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMubWFya2VyUGFuZTtcbiAgICAgICAgdmFyIF9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1sYXllci0nK2NvdW50KTtcbiAgICAgICAgY291bnQrKztcblxuICAgICAgICBfY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2NhbnZhcyk7XG4gICAgICAgIHRpbGVQYW5lLmFwcGVuZENoaWxkKF9jb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IF9jb250YWluZXI7XG5cbiAgICAgICAgLy8gaGFjazogbGlzdGVuIHRvIHByZWRyYWcgZXZlbnQgbGF1bmNoZWQgYnkgZHJhZ2dpbmcgdG9cbiAgICAgICAgLy8gc2V0IGNvbnRhaW5lciBpbiBwb3NpdGlvbiAoMCwgMCkgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgICAgIGlmIChtYXAuZHJhZ2dpbmcuZW5hYmxlZCgpKSB7XG4gICAgICAgICAgICBtYXAuZHJhZ2dpbmcuX2RyYWdnYWJsZS5vbigncHJlZHJhZycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG1vdmVTdGFydC5hcHBseSh0aGlzKTtcbiAgICAgICAgICAgICAgICAvL3ZhciBkID0gbWFwLmRyYWdnaW5nLl9kcmFnZ2FibGU7XG4gICAgICAgICAgICAgICAgLy9MLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB7IHg6IC1kLl9uZXdQb3MueCwgeTogLWQuX25ld1Bvcy55IH0pO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXAub24oe1xuICAgICAgICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLnJlc2V0LFxuICAgICAgICAgICAgJ3Jlc2l6ZScgICAgOiB0aGlzLnJlc2V0LFxuICAgICAgICAgICAgJ3pvb21zdGFydCcgOiBzdGFydFpvb20sXG4gICAgICAgICAgICAnem9vbWVuZCcgICA6IGVuZFpvb20sXG4gICAgICAgICAgICAnbW92ZXN0YXJ0JyA6IG1vdmVTdGFydCxcbiAgICAgICAgICAgICdtb3ZlZW5kJyAgIDogbW92ZUVuZCxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogaW50ZXJzZWN0cyxcbiAgICAgICAgICAgICdjbGljaycgICAgIDogaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICAgICAgaWYoIHRoaXMuekluZGV4ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLnNldFpJbmRleCh0aGlzLnpJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgbGF5ZXIub25SZW1vdmUgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgbWFwLm9mZih7XG4gICAgICAgICAgICAndmlld3Jlc2V0JyA6IHRoaXMucmVzZXQsXG4gICAgICAgICAgICAncmVzaXplJyAgICA6IHRoaXMucmVzZXQsXG4gICAgICAgICAgICAnbW92ZXN0YXJ0JyA6IG1vdmVTdGFydCxcbiAgICAgICAgICAgICdtb3ZlZW5kJyAgIDogbW92ZUVuZCxcbiAgICAgICAgICAgICd6b29tc3RhcnQnIDogc3RhcnRab29tLFxuICAgICAgICAgICAgJ3pvb21lbmQnICAgOiBlbmRab29tLFxuICAgICAgICAgICAgJ21vdXNlbW92ZScgOiBpbnRlcnNlY3RzLFxuICAgICAgICAgICAgJ2NsaWNrJyAgICAgOiBpbnRlcnNlY3RzXG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2FudmFzKG9wdGlvbnMpIHtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBjYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICBjYW52YXMuc3R5bGUubGVmdCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcIm5vbmVcIjtcbiAgICBjYW52YXMuc3R5bGUuekluZGV4ID0gb3B0aW9ucy56SW5kZXggfHwgMDtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtdGlsZS1jb250YWluZXIgbGVhZmxldC16b29tLWFuaW1hdGVkJztcbiAgICBjYW52YXMuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIGNhbnZhcztcbn1cblxuZnVuY3Rpb24gc3RhcnRab29tKCkge1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgdGhpcy56b29taW5nID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZW5kWm9vbSgpIHtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KHRoaXMucmVuZGVyLmJpbmQodGhpcyksIDUwKTtcbn1cblxuZnVuY3Rpb24gbW92ZVN0YXJ0KCkge1xuICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICBcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVuZGVyLmJpbmQodGhpcykpO1xufVxuXG5mdW5jdGlvbiBtb3ZlRW5kKGUpIHtcbiAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVuZGVyKGUpO1xufTtcblxuZnVuY3Rpb24gZnJhbWVSZW5kZXIoKSB7XG4gICAgaWYoICF0aGlzLm1vdmluZyApIHJldHVybjtcbiAgICBcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbiAgICB9LCA1MDApO1xufSIsIi8qKiBcbiAqIEhhbmRsZSBtb3VzZSBpbnRlcnNlY3Rpb24gZXZlbnRzXG4gKiBlIC0gbGVhZmxldCBldmVudFxuICoqL1xuZnVuY3Rpb24gaW50ZXJzZWN0cyhlKSB7XG4gICAgaWYoICF0aGlzLnNob3dpbmcgKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciBtcHAgPSB0aGlzLmdldE1ldGVyc1BlclB4KGUubGF0bG5nKTtcbiAgICB2YXIgciA9IG1wcCAqIDU7IC8vIDUgcHggcmFkaXVzIGJ1ZmZlcjtcblxuICAgIHZhciBjZW50ZXIgPSB7XG4gICAgICB0eXBlIDogJ1BvaW50JyxcbiAgICAgIGNvb3JkaW5hdGVzIDogW2UubGF0bG5nLmxuZywgZS5sYXRsbmcubGF0XVxuICAgIH07XG5cbiAgICB2YXIgZjtcbiAgICB2YXIgaW50ZXJzZWN0cyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG5cbiAgICAgIGlmKCAhZi52aXNpYmxlICkgY29udGludWU7XG4gICAgICBpZiggIWYuZ2VvanNvbi5nZW9tZXRyeSApIGNvbnRpbnVlO1xuICAgICAgaWYoICFmLmNhY2hlICkgY29udGludWU7XG4gICAgICBpZiggIWYuY2FjaGUuZ2VvWFkgKSBjb250aW51ZTtcbiAgICAgIGlmKCAhdGhpcy5faXNJbkJvdW5kcyhmLCBlLmxhdGxuZykgKSBjb250aW51ZTtcblxuICAgICAgaWYoIHRoaXMudXRpbHMuZ2VvbWV0cnlXaXRoaW5SYWRpdXMoZi5nZW9qc29uLmdlb21ldHJ5LCBmLmNhY2hlLmdlb1hZLCBjZW50ZXIsIGUuY29udGFpbmVyUG9pbnQsIGYuc2l6ZSA/IChmLnNpemUgKiBtcHApIDogcikgKSB7XG4gICAgICAgIGludGVyc2VjdHMucHVzaChmLmdlb2pzb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBlLnR5cGUgPT0gJ2NsaWNrJyAmJiB0aGlzLm9uQ2xpY2sgKSB7XG4gICAgICB0aGlzLm9uQ2xpY2soaW50ZXJzZWN0cyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1vdXNlb3ZlciA9IFtdLCBtb3VzZW91dCA9IFtdLCBtb3VzZW1vdmUgPSBbXTtcblxuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuaW50ZXJzZWN0TGlzdC5pbmRleE9mKGludGVyc2VjdHNbaV0pID4gLTEgKSB7XG4gICAgICAgIG1vdXNlbW92ZS5wdXNoKGludGVyc2VjdHNbaV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdXNlb3Zlci5wdXNoKGludGVyc2VjdHNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5pbnRlcnNlY3RMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIGludGVyc2VjdHMuaW5kZXhPZih0aGlzLmludGVyc2VjdExpc3RbaV0pID09IC0xICkge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgbW91c2VvdXQucHVzaCh0aGlzLmludGVyc2VjdExpc3RbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaW50ZXJzZWN0TGlzdCA9IGludGVyc2VjdHM7XG5cbiAgICBpZiggdGhpcy5vbk1vdXNlT3ZlciAmJiBtb3VzZW92ZXIubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU92ZXIuY2FsbCh0aGlzLCBtb3VzZW92ZXIsIGUpO1xuICAgIGlmKCB0aGlzLm9uTW91c2VNb3ZlICkgdGhpcy5vbk1vdXNlTW92ZS5jYWxsKHRoaXMsIG1vdXNlbW92ZSwgZSk7IC8vIGFsd2F5cyBmaXJlXG4gICAgaWYoIHRoaXMub25Nb3VzZU91dCAmJiBtb3VzZW91dC5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlT3V0LmNhbGwodGhpcywgbW91c2VvdXQsIGUpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZygnaW50ZXJzZWN0cyB0aW1lOiAnKyhuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQpKydtcycpO1xuXG4gICAgaWYoIGNoYW5nZWQgKSB0aGlzLnJlbmRlcigpO1xuICB9XG5cblxuZnVuY3Rpb24gaXNJbkJvdW5kcyhmZWF0dXJlLCBsYXRsbmcpIHtcbiAgICBpZiggZmVhdHVyZS5ib3VuZHMgKSB7XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KGZlYXR1cmUuYm91bmRzKSApIHtcblxuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmUuYm91bmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgaWYoIGZlYXR1cmUuYm91bmRzW2ldLmNvbnRhaW5zKGxhdGxuZykgKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuYm91bmRzLmNvbnRhaW5zKGxhdGxuZykgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RzOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBcbiAgbGF5ZXIucmVuZGVyID0gZnVuY3Rpb24oZSkge1xuICAgIC8qaWYoIHRoaXMubW92aW5nICkge1xuICAgICAgcmV0dXJuO1xuICAgIH0qL1xuXG4gICAgdmFyIHQsIGRpZmZcbiAgICBpZiggdGhpcy5kZWJ1ZyApIHtcbiAgICAgICAgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIH1cblxuICAgIHZhciBkaWZmID0gbnVsbDtcbiAgICBpZiggZSAmJiBlLnR5cGUgPT0gJ21vdmVlbmQnICkge1xuICAgICAgdmFyIGNlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcblxuICAgICAgdmFyIHB0ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoY2VudGVyKTtcbiAgICAgIGlmKCB0aGlzLmxhc3RDZW50ZXJMTCApIHtcbiAgICAgICAgdmFyIGxhc3RYeSA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KHRoaXMubGFzdENlbnRlckxMKTtcbiAgICAgICAgZGlmZiA9IHtcbiAgICAgICAgICB4IDogbGFzdFh5LnggLSBwdC54LFxuICAgICAgICAgIHkgOiBsYXN0WHkueSAtIHB0LnlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RDZW50ZXJMTCA9IGNlbnRlcjtcbiAgICB9XG5cbiAgICB2YXIgdG9wTGVmdCA9IHRoaXMuX21hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgIEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jYW52YXMsIHRvcExlZnQpO1xuXG4gICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcblxuICAgIC8vIGNsZWFyIGNhbnZhc1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgIGlmKCAhdGhpcy56b29taW5nICkge1xuICAgICAgICB0aGlzLnJlZHJhdyhkaWZmKTtcbiAgICB9XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIHtcbiAgICAgIGRpZmYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQ7XG5cbiAgICAgIHZhciBjID0gMDtcbiAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoICF0aGlzLmZlYXR1cmVzW2ldLmNhY2hlLmdlb1hZICkgY29udGludWU7XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KHRoaXMuZmVhdHVyZXNbaV0uY2FjaGUuZ2VvWFkpICkgYyArPSB0aGlzLmZlYXR1cmVzW2ldLmNhY2hlLmdlb1hZLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coJ1JlbmRlcmVkICcrYysnIHB0cyBpbiAnK2RpZmYrJ21zJyk7XG4gICAgfVxuICB9LFxuICAgIFxuXG4gIC8vIHJlZHJhdyBhbGwgZmVhdHVyZXMuICBUaGlzIGRvZXMgbm90IGhhbmRsZSBjbGVhcmluZyB0aGUgY2FudmFzIG9yIHNldHRpbmdcbiAgLy8gdGhlIGNhbnZhcyBjb3JyZWN0IHBvc2l0aW9uLiAgVGhhdCBpcyBoYW5kbGVkIGJ5IHJlbmRlclxuICBsYXllci5yZWRyYXcgPSBmdW5jdGlvbihkaWZmKSB7XG4gICAgaWYoICF0aGlzLnNob3dpbmcgKSByZXR1cm47XG5cbiAgICAvLyBvYmplY3RzIHNob3VsZCBrZWVwIHRyYWNrIG9mIGxhc3QgYmJveCBhbmQgem9vbSBvZiBtYXBcbiAgICAvLyBpZiB0aGlzIGhhc24ndCBjaGFuZ2VkIHRoZSBsbCAtPiBjb250YWluZXIgcHQgaXMgbm90IG5lZWRlZFxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgdmFyIHpvb20gPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgXG4gICAgdmFyIGYsIGksIGo7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG4gICAgICBpZiggZi5pc0NhbnZhc0ZlYXR1cmVzICkge1xuICAgICAgICBmb3IoIGogPSAwOyBqIDwgZi5jYW52YXNGZWF0dXJlcy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUoZi5jYW52YXNGZWF0dXJlc1tqXSwgYm91bmRzLCB6b29tLCBkaWZmKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZWRyYXdGZWF0dXJlKGYsIGJvdW5kcywgem9vbSwgZGlmZik7XG4gICAgICB9XG4gICAgICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdSZW5kZXIgdGltZTogJysobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSsnbXM7IGF2ZzogJytcbiAgICAgICgobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSAvIHRoaXMuZmVhdHVyZXMubGVuZ3RoKSsnbXMnKTtcbiAgfSxcblxuXG5cbiAgLy8gcmVkcmF3IGFuIGluZGl2aWR1YWwgZmVhdHVyZVxuICBsYXllci5yZWRyYXdGZWF0dXJlID0gZnVuY3Rpb24oY2FudmFzRmVhdHVyZSwgYm91bmRzLCB6b29tLCBkaWZmKSB7XG4gICAgLy9pZiggZmVhdHVyZS5nZW9qc29uLnByb3BlcnRpZXMuZGVidWcgKSBkZWJ1Z2dlcjtcblxuICAgIC8vIGlnbm9yZSBhbnl0aGluZyBmbGFnZ2VkIGFzIGhpZGRlblxuICAgIC8vIHdlIGRvIG5lZWQgdG8gY2xlYXIgdGhlIGNhY2hlIGluIHRoaXMgY2FzZVxuICAgIGlmKCAhY2FudmFzRmVhdHVyZS52aXNpYmxlICkge1xuICAgICAgY2FudmFzRmVhdHVyZS5jbGVhckNhY2hlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gbm93IGxldHMgY2hlY2sgY2FjaGUgdG8gc2VlIGlmIHdlIG5lZWQgdG8gcmVwcm9qZWN0IHRoZVxuICAgIC8vIHh5IGNvb3JkaW5hdGVzXG4gICAgLy8gYWN0dWFsbHkgcHJvamVjdCB0byB4eSBpZiBuZWVkZWRcbiAgICB2YXIgcmVwcm9qZWN0ID0gY2FudmFzRmVhdHVyZS5yZXF1aXJlc1JlcHJvamVjdGlvbih6b29tKTtcbiAgICBpZiggcmVwcm9qZWN0ICkge1xuICAgICAgdGhpcy50b0NhbnZhc1hZKGNhbnZhc0ZlYXR1cmUsIHpvb20pO1xuICAgIH0gIC8vIGVuZCByZXByb2plY3RcblxuICAgIC8vIGlmIHRoaXMgd2FzIGEgc2ltcGxlIHBhbiBldmVudCAoYSBkaWZmIHdhcyBwcm92aWRlZCkgYW5kIHdlIGRpZCBub3QgcmVwcm9qZWN0XG4gICAgLy8gbW92ZSB0aGUgZmVhdHVyZSBieSBkaWZmIHgveVxuICAgIGlmKCBkaWZmICYmICFyZXByb2plY3QgKSB7XG4gICAgICBpZiggY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcblxuICAgICAgICBjYW52YXNGZWF0dXJlLmNhY2hlLmdlb1hZLnggKz0gZGlmZi54O1xuICAgICAgICBjYW52YXNGZWF0dXJlLmNhY2hlLmdlb1hZLnkgKz0gZGlmZi55O1xuXG4gICAgICB9IGVsc2UgaWYoIGNhbnZhc0ZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGNhbnZhc0ZlYXR1cmUuY2FjaGUuZ2VvWFksIGRpZmYpO1xuXG4gICAgICB9IGVsc2UgaWYgKCBjYW52YXNGZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICBcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShjYW52YXNGZWF0dXJlLmNhY2hlLmdlb1hZLCBkaWZmKTtcbiAgICAgIFxuICAgICAgfSBlbHNlIGlmICggY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgICAgXG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgY2FudmFzRmVhdHVyZS5jYWNoZS5nZW9YWS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGNhbnZhc0ZlYXR1cmUuY2FjaGUuZ2VvWFlbaV0sIGRpZmYpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIG5vdCBpbiBib3VuZHNcbiAgICBpZiggY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcbiAgICAgIGlmKCAhYm91bmRzLmNvbnRhaW5zKGNhbnZhc0ZlYXR1cmUubGF0bG5nKSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG5cbiAgICAgIC8vIGp1c3QgbWFrZSBzdXJlIGF0IGxlYXN0IG9uZSBwb2x5Z29uIGlzIHdpdGhpbiByYW5nZVxuICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNhbnZhc0ZlYXR1cmUuYm91bmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggYm91bmRzLmNvbnRhaW5zKGNhbnZhc0ZlYXR1cmUuYm91bmRzW2ldKSB8fCBib3VuZHMuaW50ZXJzZWN0cyhjYW52YXNGZWF0dXJlLmJvdW5kc1tpXSkgKSB7XG4gICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiggIWZvdW5kICkgcmV0dXJuO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKCAhYm91bmRzLmNvbnRhaW5zKGNhbnZhc0ZlYXR1cmUuYm91bmRzKSAmJiAhYm91bmRzLmludGVyc2VjdHMoY2FudmFzRmVhdHVyZS5ib3VuZHMpICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHZhciByZW5kZXJlciA9IGNhbnZhc0ZlYXR1cmUucmVuZGVyZXIgPyBjYW52YXNGZWF0dXJlLnJlbmRlcmVyIDogdGhpcy5yZW5kZXJlcjtcbiAgICBcbiAgICAvLyBjYWxsIGZlYXR1cmUgcmVuZGVyIGZ1bmN0aW9uIGluIGZlYXR1cmUgc2NvcGU7IGZlYXR1cmUgaXMgcGFzc2VkIGFzIHdlbGxcbiAgICByZW5kZXJlci5jYWxsKFxuICAgICAgICBjYW52YXNGZWF0dXJlLCAvLyBzY29wZVxuICAgICAgICB0aGlzLl9jdHgsIFxuICAgICAgICBjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCksIFxuICAgICAgICB0aGlzLl9tYXAsIFxuICAgICAgICBjYW52YXNGZWF0dXJlLmdlb2pzb25cbiAgICApO1xuICB9O1xufSIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgICBsYXllci50b0NhbnZhc1hZID0gZnVuY3Rpb24oZmVhdHVyZSwgem9vbSkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhIGNhY2hlIG5hbWVzcGFjZSBhbmQgc2V0IHRoZSB6b29tIGxldmVsXG4gICAgICAgIGlmKCAhZmVhdHVyZS5jYWNoZSApIGZlYXR1cmUuY2FjaGUgPSB7fTtcbiAgICAgICAgdmFyIGNhbnZhc1hZO1xuXG4gICAgICAgIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgIGNhbnZhc1hZID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoW1xuICAgICAgICAgICAgZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgICAgZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdXG4gICAgICAgIF0pO1xuXG4gICAgICAgIGlmKCBmZWF0dXJlLnNpemUgKSB7XG4gICAgICAgICAgICBjYW52YXNYWVswXSA9IGNhbnZhc1hZWzBdIC0gZmVhdHVyZS5zaXplIC8gMjtcbiAgICAgICAgICAgIGNhbnZhc1hZWzFdID0gY2FudmFzWFlbMV0gLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgY2FudmFzWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlcywgdGhpcy5fbWFwKTtcbiAgICAgICAgdHJpbUNhbnZhc1hZKGNhbnZhc1hZKTtcbiAgICBcbiAgICAgICAgfSBlbHNlIGlmICggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgICBcbiAgICAgICAgY2FudmFzWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXSwgdGhpcy5fbWFwKTtcbiAgICAgICAgdHJpbUNhbnZhc1hZKGNhbnZhc1hZKTtcbiAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgICAgICAgY2FudmFzWFkgPSBbXTtcbiAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICB2YXIgeHkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1tpXVswXSwgdGhpcy5fbWFwKTtcbiAgICAgICAgICAgICAgICB0cmltQ2FudmFzWFkoeHkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1hZLnB1c2goeHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmZWF0dXJlLnNldENhbnZhc1hZKGNhbnZhc1hZLCB6b29tKTtcbiAgICB9O1xufVxuXG4vLyBnaXZlbiBhbiBhcnJheSBvZiBnZW8geHkgY29vcmRpbmF0ZXMsIG1ha2Ugc3VyZSBlYWNoIHBvaW50IGlzIGF0IGxlYXN0IG1vcmUgdGhhbiAxcHggYXBhcnRcbmZ1bmN0aW9uIHRyaW1DYW52YXNYWSh4eSkge1xuICAgIGlmKCB4eS5sZW5ndGggPT09IDAgKSByZXR1cm47XG4gICAgdmFyIGxhc3QgPSB4eVt4eS5sZW5ndGgtMV0sIGksIHBvaW50O1xuXG4gICAgdmFyIGMgPSAwO1xuICAgIGZvciggaSA9IHh5Lmxlbmd0aC0yOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgcG9pbnQgPSB4eVtpXTtcbiAgICAgICAgaWYoIE1hdGguYWJzKGxhc3QueCAtIHBvaW50LngpID09PSAwICYmIE1hdGguYWJzKGxhc3QueSAtIHBvaW50LnkpID09PSAwICkge1xuICAgICAgICAgICAgeHkuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYysrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGFzdCA9IHBvaW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHh5Lmxlbmd0aCA8PSAxICkge1xuICAgICAgICB4eS5wdXNoKGxhc3QpO1xuICAgICAgICBjLS07XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbW92ZUxpbmUgOiBmdW5jdGlvbihjb29yZHMsIGRpZmYpIHtcbiAgICB2YXIgaTsgbGVuID0gY29vcmRzLmxlbmd0aDtcbiAgICBmb3IoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBjb29yZHNbaV0ueCArPSBkaWZmLng7XG4gICAgICBjb29yZHNbaV0ueSArPSBkaWZmLnk7XG4gICAgfVxuICB9LFxuXG4gIHByb2plY3RMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBtYXApIHtcbiAgICB2YXIgeHlMaW5lID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHh5TGluZS5wdXNoKG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICBjb29yZHNbaV1bMV0sIGNvb3Jkc1tpXVswXVxuICAgICAgXSkpO1xuICAgIH1cblxuICAgIHJldHVybiB4eUxpbmU7XG4gIH0sXG5cbiAgY2FsY0JvdW5kcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4bWluID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB4bWF4ID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB5bWluID0gY29vcmRzWzBdWzBdO1xuICAgIHZhciB5bWF4ID0gY29vcmRzWzBdWzBdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDE7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggeG1pbiA+IGNvb3Jkc1tpXVsxXSApIHhtaW4gPSBjb29yZHNbaV1bMV07XG4gICAgICBpZiggeG1heCA8IGNvb3Jkc1tpXVsxXSApIHhtYXggPSBjb29yZHNbaV1bMV07XG5cbiAgICAgIGlmKCB5bWluID4gY29vcmRzW2ldWzBdICkgeW1pbiA9IGNvb3Jkc1tpXVswXTtcbiAgICAgIGlmKCB5bWF4IDwgY29vcmRzW2ldWzBdICkgeW1heCA9IGNvb3Jkc1tpXVswXTtcbiAgICB9XG5cbiAgICB2YXIgc291dGhXZXN0ID0gTC5sYXRMbmcoeG1pbi0uMDEsIHltaW4tLjAxKTtcbiAgICB2YXIgbm9ydGhFYXN0ID0gTC5sYXRMbmcoeG1heCsuMDEsIHltYXgrLjAxKTtcblxuICAgIHJldHVybiBMLmxhdExuZ0JvdW5kcyhzb3V0aFdlc3QsIG5vcnRoRWFzdCk7XG4gIH0sXG5cbiAgZ2VvbWV0cnlXaXRoaW5SYWRpdXMgOiBmdW5jdGlvbihnZW9tZXRyeSwgeHlQb2ludHMsIGNlbnRlciwgeHlQb2ludCwgcmFkaXVzKSB7XG4gICAgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnREaXN0YW5jZShnZW9tZXRyeSwgY2VudGVyKSA8PSByYWRpdXM7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgZm9yKCB2YXIgaSA9IDE7IGkgPCB4eVBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoIHRoaXMubGluZUludGVyc2VjdHNDaXJjbGUoeHlQb2ludHNbaS0xXSwgeHlQb2ludHNbaV0sIHh5UG9pbnQsIDMpICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50SW5Qb2x5Z29uKGNlbnRlciwgZ2VvbWV0cnkpO1xuICAgIH1cbiAgfSxcblxuICAvLyBodHRwOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMjc1NTI5L2NoZWNrLWlmLWxpbmUtaW50ZXJzZWN0cy13aXRoLWNpcmNsZXMtcGVyaW1ldGVyXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Rpc3RhbmNlX2Zyb21fYV9wb2ludF90b19hX2xpbmVcbiAgLy8gW2xuZyB4LCBsYXQsIHldXG4gIGxpbmVJbnRlcnNlY3RzQ2lyY2xlIDogZnVuY3Rpb24obGluZVAxLCBsaW5lUDIsIHBvaW50LCByYWRpdXMpIHtcbiAgICB2YXIgZGlzdGFuY2UgPVxuICAgICAgTWF0aC5hYnMoXG4gICAgICAgICgobGluZVAyLnkgLSBsaW5lUDEueSkqcG9pbnQueCkgLSAoKGxpbmVQMi54IC0gbGluZVAxLngpKnBvaW50LnkpICsgKGxpbmVQMi54KmxpbmVQMS55KSAtIChsaW5lUDIueSpsaW5lUDEueClcbiAgICAgICkgL1xuICAgICAgTWF0aC5zcXJ0KFxuICAgICAgICBNYXRoLnBvdyhsaW5lUDIueSAtIGxpbmVQMS55LCAyKSArIE1hdGgucG93KGxpbmVQMi54IC0gbGluZVAxLngsIDIpXG4gICAgICApO1xuICAgIHJldHVybiBkaXN0YW5jZSA8PSByYWRpdXM7XG4gIH0sXG5cbiAgLy8gaHR0cDovL3dpa2kub3BlbnN0cmVldG1hcC5vcmcvd2lraS9ab29tX2xldmVsc1xuICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI3NTQ1MDk4L2xlYWZsZXQtY2FsY3VsYXRpbmctbWV0ZXJzLXBlci1waXhlbC1hdC16b29tLWxldmVsXG4gIG1ldGVyc1BlclB4IDogZnVuY3Rpb24obGwsIG1hcCkge1xuICAgIHZhciBwb2ludEMgPSBtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChsbCk7IC8vIGNvbnZlcnQgdG8gY29udGFpbmVycG9pbnQgKHBpeGVscylcbiAgICB2YXIgcG9pbnRYID0gW3BvaW50Qy54ICsgMSwgcG9pbnRDLnldOyAvLyBhZGQgb25lIHBpeGVsIHRvIHhcblxuICAgIC8vIGNvbnZlcnQgY29udGFpbmVycG9pbnRzIHRvIGxhdGxuZydzXG4gICAgdmFyIGxhdExuZ0MgPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludEMpO1xuICAgIHZhciBsYXRMbmdYID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRYKTtcblxuICAgIHZhciBkaXN0YW5jZVggPSBsYXRMbmdDLmRpc3RhbmNlVG8obGF0TG5nWCk7IC8vIGNhbGN1bGF0ZSBkaXN0YW5jZSBiZXR3ZWVuIGMgYW5kIHggKGxhdGl0dWRlKVxuICAgIHJldHVybiBkaXN0YW5jZVg7XG4gIH0sXG5cbiAgLy8gZnJvbSBodHRwOi8vd3d3Lm1vdmFibGUtdHlwZS5jby51ay9zY3JpcHRzL2xhdGxvbmcuaHRtbFxuICBwb2ludERpc3RhbmNlIDogZnVuY3Rpb24gKHB0MSwgcHQyKSB7XG4gICAgdmFyIGxvbjEgPSBwdDEuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQxID0gcHQxLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgbG9uMiA9IHB0Mi5jb29yZGluYXRlc1swXSxcbiAgICAgIGxhdDIgPSBwdDIuY29vcmRpbmF0ZXNbMV0sXG4gICAgICBkTGF0ID0gdGhpcy5udW1iZXJUb1JhZGl1cyhsYXQyIC0gbGF0MSksXG4gICAgICBkTG9uID0gdGhpcy5udW1iZXJUb1JhZGl1cyhsb24yIC0gbG9uMSksXG4gICAgICBhID0gTWF0aC5wb3coTWF0aC5zaW4oZExhdCAvIDIpLCAyKSArIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MSkpXG4gICAgICAgICogTWF0aC5jb3ModGhpcy5udW1iZXJUb1JhZGl1cyhsYXQyKSkgKiBNYXRoLnBvdyhNYXRoLnNpbihkTG9uIC8gMiksIDIpLFxuICAgICAgYyA9IDIgKiBNYXRoLmF0YW4yKE1hdGguc3FydChhKSwgTWF0aC5zcXJ0KDEgLSBhKSk7XG4gICAgcmV0dXJuICg2MzcxICogYykgKiAxMDAwOyAvLyByZXR1cm5zIG1ldGVyc1xuICB9LFxuXG4gIHBvaW50SW5Qb2x5Z29uIDogZnVuY3Rpb24gKHAsIHBvbHkpIHtcbiAgICB2YXIgY29vcmRzID0gKHBvbHkudHlwZSA9PSBcIlBvbHlnb25cIikgPyBbIHBvbHkuY29vcmRpbmF0ZXMgXSA6IHBvbHkuY29vcmRpbmF0ZXNcblxuICAgIHZhciBpbnNpZGVCb3ggPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wb2ludEluQm91bmRpbmdCb3gocCwgdGhpcy5ib3VuZGluZ0JveEFyb3VuZFBvbHlDb29yZHMoY29vcmRzW2ldKSkpIGluc2lkZUJveCA9IHRydWVcbiAgICB9XG4gICAgaWYgKCFpbnNpZGVCb3gpIHJldHVybiBmYWxzZVxuXG4gICAgdmFyIGluc2lkZVBvbHkgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wbnBvbHkocC5jb29yZGluYXRlc1sxXSwgcC5jb29yZGluYXRlc1swXSwgY29vcmRzW2ldKSkgaW5zaWRlUG9seSA9IHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zaWRlUG9seVxuICB9LFxuXG4gIHBvaW50SW5Cb3VuZGluZ0JveCA6IGZ1bmN0aW9uIChwb2ludCwgYm91bmRzKSB7XG4gICAgcmV0dXJuICEocG9pbnQuY29vcmRpbmF0ZXNbMV0gPCBib3VuZHNbMF1bMF0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMV0gPiBib3VuZHNbMV1bMF0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMF0gPCBib3VuZHNbMF1bMV0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMF0gPiBib3VuZHNbMV1bMV0pXG4gIH0sXG5cbiAgYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzIDogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgdmFyIHhBbGwgPSBbXSwgeUFsbCA9IFtdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkc1swXS5sZW5ndGg7IGkrKykge1xuICAgICAgeEFsbC5wdXNoKGNvb3Jkc1swXVtpXVsxXSlcbiAgICAgIHlBbGwucHVzaChjb29yZHNbMF1baV1bMF0pXG4gICAgfVxuXG4gICAgeEFsbCA9IHhBbGwuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgIHlBbGwgPSB5QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcblxuICAgIHJldHVybiBbIFt4QWxsWzBdLCB5QWxsWzBdXSwgW3hBbGxbeEFsbC5sZW5ndGggLSAxXSwgeUFsbFt5QWxsLmxlbmd0aCAtIDFdXSBdXG4gIH0sXG5cbiAgLy8gUG9pbnQgaW4gUG9seWdvblxuICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sI0xpc3RpbmcgdGhlIFZlcnRpY2VzXG4gIHBucG9seSA6IGZ1bmN0aW9uKHgseSxjb29yZHMpIHtcbiAgICB2YXIgdmVydCA9IFsgWzAsMF0gXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29vcmRzW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZlcnQucHVzaChjb29yZHNbaV1bal0pXG4gICAgICB9XG4gICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldWzBdKVxuICAgICAgdmVydC5wdXNoKFswLDBdKVxuICAgIH1cblxuICAgIHZhciBpbnNpZGUgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdmVydC5sZW5ndGggLSAxOyBpIDwgdmVydC5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgIGlmICgoKHZlcnRbaV1bMF0gPiB5KSAhPSAodmVydFtqXVswXSA+IHkpKSAmJiAoeCA8ICh2ZXJ0W2pdWzFdIC0gdmVydFtpXVsxXSkgKiAoeSAtIHZlcnRbaV1bMF0pIC8gKHZlcnRbal1bMF0gLSB2ZXJ0W2ldWzBdKSArIHZlcnRbaV1bMV0pKSBpbnNpZGUgPSAhaW5zaWRlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVxuICB9LFxuXG4gIG51bWJlclRvUmFkaXVzIDogZnVuY3Rpb24gKG51bWJlcikge1xuICAgIHJldHVybiBudW1iZXIgKiBNYXRoLlBJIC8gMTgwO1xuICB9XG59O1xuIl19
