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
  // TODO: make this work
  this.allowPanRendering = true;
  
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
L.CanvasFeatureCollection = CanvasFeatures;
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
  layer.removeCanvasFeature = function(feature) {
    var index = this.features.indexOf(feature);
    if( index == -1 ) return;

    this.splice(index, 1);

    if( this.feature.visible ) return true;
    return false;
  };
  
  layer.removeAll = function() {
      this.allowPanRendering = true;
      this.features = [];
  }
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
    if( this.moving ) return;
    this.moving = true;
    
    if( !this.allowPanRendering ) return;
    
    window.requestAnimationFrame(frameRender.bind(this));
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
      if( !f.getCanvasXY() ) continue;
      if( !isInBounds(f, e.latlng) ) continue;

      if( this.utils.geometryWithinRadius(f.geojson.geometry, f.getCanvasXY(), center, e.containerPoint, f.size ? (f.size * mpp) : r) ) {
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
    if( !this.allowPanRendering && this.moving ) {
      return;
    }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUuanMiLCJzcmMvY2xhc3Nlcy9DYW52YXNGZWF0dXJlcy5qcyIsInNyYy9jbGFzc2VzL2ZhY3RvcnkuanMiLCJzcmMvZGVmYXVsdFJlbmRlcmVyL2luZGV4LmpzIiwic3JjL2xheWVyIiwic3JjL2xpYi9hZGRGZWF0dXJlLmpzIiwic3JjL2xpYi9pbml0LmpzIiwic3JjL2xpYi9pbnRlcnNlY3RzLmpzIiwic3JjL2xpYi9yZWRyYXcuanMiLCJzcmMvbGliL3RvQ2FudmFzWFkuanMiLCJzcmMvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBDYW52YXNGZWF0dXJlKGdlb2pzb24pIHtcbiAgICBcbiAgICAvLyByYWRpdXMgZm9yIHBvaW50IGZlYXR1cmVzXG4gICAgLy8gdXNlIHRvIGNhbGN1bGF0ZSBtb3VzZSBvdmVyL291dCBhbmQgY2xpY2sgZXZlbnRzIGZvciBwb2ludHNcbiAgICAvLyB0aGlzIHZhbHVlIHNob3VsZCBtYXRjaCB0aGUgdmFsdWUgdXNlZCBmb3IgcmVuZGVyaW5nIHBvaW50c1xuICAgIHRoaXMuc2l6ZSA9IDU7XG4gICAgXG4gICAgdmFyIGNhY2hlID0ge1xuICAgICAgICAvLyBwcm9qZWN0ZWQgcG9pbnRzIG9uIGNhbnZhc1xuICAgICAgICBjYW52YXNYWSA6IG51bGwsXG4gICAgICAgIC8vIHpvb20gbGV2ZWwgY2FudmFzWFkgcG9pbnRzIGFyZSBjYWxjdWxhdGVkIHRvXG4gICAgICAgIHpvb20gOiAtMVxuICAgIH1cbiAgICBcbiAgICAvLyBhY3R1YWwgZ2VvanNvbiBvYmplY3QsIHdpbGwgbm90IGJlIG1vZGlmZWQsIGp1c3Qgc3RvcmVkXG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICBcbiAgICAvLyBwZXJmb3JtYW5jZSBmbGFnLCB3aWxsIGtlZXAgaW52aXNpYmxlIGZlYXR1cmVzIGZvciByZWNhbGMgXG4gICAgLy8gZXZlbnRzIGFzIHdlbGwgYXMgbm90IGJlaW5nIHJlbmRlcmVkXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICBcbiAgICAvLyBib3VuZGluZyBib3ggZm9yIGdlb21ldHJ5LCB1c2VkIGZvciBpbnRlcnNlY3Rpb24gYW5kXG4gICAgLy8gdmlzaWJsaWxpdHkgb3B0aW1pemF0aW9uc1xuICAgIHRoaXMuYm91bmRzID0gbnVsbDtcbiAgICBcbiAgICAvLyBMZWFmbGV0IExhdExuZywgdXNlZCBmb3IgcG9pbnRzIHRvIHF1aWNrbHkgbG9vayBmb3IgaW50ZXJzZWN0aW9uXG4gICAgdGhpcy5sYXRsbmcgPSBudWxsO1xuICAgIFxuICAgIC8vIGNsZWFyIHRoZSBjYW52YXNYWSBzdG9yZWQgdmFsdWVzXG4gICAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2FjaGUuY2FudmFzWFkgPSBudWxsO1xuICAgICAgICB0aGlzLmNhY2hlLnpvb20gPSAtMTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zZXRDYW52YXNYWSA9IGZ1bmN0aW9uKGNhbnZhc1hZLCB6b29tKSB7XG4gICAgICAgIHRoaXMuY2FjaGUuY2FudmFzWFkgPSBjYW52YXNYWTtcbiAgICAgICAgdGhpcy5jYWNoZS56b29tID0gem9vbTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5nZXRDYW52YXNYWSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZS5jYW52YXNYWTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5yZXF1aXJlc1JlcHJvamVjdGlvbiA9IGZ1bmN0aW9uKHpvb20pIHtcbiAgICAgIGlmKCBjYWNoZS56b29tID09IHpvb20gJiYgY2FjaGUuZ2VvWFkgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBcbiAgICAvLyBvcHRpb25hbCwgcGVyIGZlYXR1cmUsIHJlbmRlcmVyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRmVhdHVyZTsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZScpO1xuXG5mdW5jdGlvbiBDYW52YXNGZWF0dXJlcyhnZW9qc29uKSB7XG4gICAgLy8gcXVpY2sgdHlwZSBmbGFnXG4gICAgdGhpcy5pc0NhbnZhc0ZlYXR1cmVzID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzID0gW107XG4gICAgXG4gICAgLy8gYWN0dWFsIGdlb2pzb24gb2JqZWN0LCB3aWxsIG5vdCBiZSBtb2RpZmVkLCBqdXN0IHN0b3JlZFxuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgXG4gICAgLy8gcGVyZm9ybWFuY2UgZmxhZywgd2lsbCBrZWVwIGludmlzaWJsZSBmZWF0dXJlcyBmb3IgcmVjYWxjIFxuICAgIC8vIGV2ZW50cyBhcyB3ZWxsIGFzIG5vdCBiZWluZyByZW5kZXJlZFxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgXG4gICAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5jYW52YXNGZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzRmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCB0aGlzLmdlb2pzb24gKSB7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9qc29uLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNGZWF0dXJlcy5wdXNoKG5ldyBDYW52YXNGZWF0dXJlKHRoaXMuZ2VvanNvbi5mZWF0dXJlc1tpXSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0ZlYXR1cmVzOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmVzJyk7XG5cbmZ1bmN0aW9uIGZhY3RvcnkoYXJnKSB7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoYXJnKSApIHtcbiAgICAgICAgcmV0dXJuIGFyZy5tYXAoZ2VuZXJhdGUpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZ2VuZXJhdGUoYXJnKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGUoZ2VvanNvbikge1xuICAgIGlmKCBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicgKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzRmVhdHVyZXMoZ2VvanNvbik7XG4gICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09PSAnRmVhdHVyZScgKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzRmVhdHVyZShnZW9qc29uKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBHZW9KU09OOiAnK2dlb2pzb24udHlwZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTsiLCJ2YXIgY3R4O1xuXG4vKipcbiAqIEZ1Y3Rpb24gY2FsbGVkIGluIHNjb3BlIG9mIENhbnZhc0ZlYXR1cmVcbiAqL1xuZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQsIHh5UG9pbnRzLCBtYXAsIGdlb2pzb24pIHtcbiAgICBjdHggPSBjb250ZXh0O1xuICAgIFxuICAgIGlmKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT09ICdQb2ludCcgKSB7XG4gICAgICAgIHJlbmRlclBvaW50KHh5UG9pbnRzLCB0aGlzLnNpemUpO1xuICAgIH0gZWxzZSBpZiggZ2VvanNvbi5nZW9tZXRyeS50eXBlID09PSAnTGluZVN0cmluZycgKSB7XG4gICAgICAgIHJlbmRlckxpbmUoeHlQb2ludHMpO1xuICAgIH0gZWxzZSBpZiggZ2VvanNvbi5nZW9tZXRyeS50eXBlID09PSAnUG9seWdvbicgKSB7XG4gICAgICAgIHJlbmRlclBvbHlnb24oeHlQb2ludHMpO1xuICAgIH0gZWxzZSBpZiggZ2VvanNvbi5nZW9tZXRyeS50eXBlID09PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgeHlQb2ludHMuZm9yRWFjaChyZW5kZXJQb2x5Z29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBvaW50KHh5UG9pbnQsIHNpemUpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICBjdHguYXJjKHh5UG9pbnQueCwgeHlQb2ludC55LCBzaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAgJ3JnYmEoMCwgMCwgMCwgLjMpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxpbmUoeHlQb2ludHMpIHtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJztcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwgMCwgMCwgLjMpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcblxuICAgIHZhciBqO1xuICAgIGN0eC5tb3ZlVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG4gICAgZm9yKCBqID0gMTsgaiA8IHh5UG9pbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjdHgubGluZVRvKHh5UG9pbnRzW2pdLngsIHh5UG9pbnRzW2pdLnkpO1xuICAgIH1cblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQb2x5Z29uKHh5UG9pbnRzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwgMTUyLCAwLC44KSc7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG5cbiAgICB2YXIgajtcbiAgICBjdHgubW92ZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuICAgIGZvciggaiA9IDE7IGogPCB4eVBvaW50cy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgY3R4LmxpbmVUbyh4eVBvaW50c1tqXS54LCB4eVBvaW50c1tqXS55KTtcbiAgICB9XG4gICAgY3R4LmxpbmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlcjsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcblxuZnVuY3Rpb24gQ2FudmFzTGF5ZXIoKSB7XG4gIC8vIHNob3cgbGF5ZXIgdGltaW5nXG4gIHRoaXMuZGVidWcgPSBmYWxzZTtcblxuICAvLyBpbmNsdWRlIGV2ZW50c1xuICB0aGlzLmluY2x1ZGVzID0gW0wuTWl4aW4uRXZlbnRzXTtcblxuICAvLyBsaXN0IG9mIGdlb2pzb24gZmVhdHVyZXMgdG8gZHJhd1xuICAvLyAgIC0gdGhlc2Ugd2lsbCBkcmF3IGluIG9yZGVyXG4gIHRoaXMuZmVhdHVyZXMgPSBbXTtcblxuICAvLyBsaXN0IG9mIGN1cnJlbnQgZmVhdHVyZXMgdW5kZXIgdGhlIG1vdXNlXG4gIHRoaXMuaW50ZXJzZWN0TGlzdCA9IFtdO1xuXG4gIC8vIHVzZWQgdG8gY2FsY3VsYXRlIHBpeGVscyBtb3ZlZCBmcm9tIGNlbnRlclxuICB0aGlzLmxhc3RDZW50ZXJMTCA9IG51bGw7XG5cbiAgLy8gZ2VvbWV0cnkgaGVscGVyc1xuICB0aGlzLnV0aWxzID0gcmVxdWlyZSgnLi9saWIvdXRpbHMnKTtcbiAgXG4gIHRoaXMubW92aW5nID0gZmFsc2U7XG4gIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgd29ya1xuICB0aGlzLmFsbG93UGFuUmVuZGVyaW5nID0gdHJ1ZTtcbiAgXG4gIC8vIHJlY29tbWVuZGVkIHlvdSBvdmVycmlkZSB0aGlzLiAgeW91IGNhbiBhbHNvIHNldCBhIGN1c3RvbSByZW5kZXJlclxuICAvLyBmb3IgZWFjaCBDYW52YXNGZWF0dXJlIGlmIHlvdSB3aXNoXG4gIHRoaXMucmVuZGVyZXIgPSByZXF1aXJlKCcuL2RlZmF1bHRSZW5kZXJlcicpO1xuXG4gIHRoaXMuZ2V0Q2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbnZhcztcbiAgfTtcblxuICB0aGlzLmRyYXcgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH07XG5cbiAgdGhpcy5hZGRUbyA9IGZ1bmN0aW9uIChtYXApIHtcbiAgICBtYXAuYWRkTGF5ZXIodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyByZXNldCBhY3R1YWwgY2FudmFzIHNpemVcbiAgICB2YXIgc2l6ZSA9IHRoaXMuX21hcC5nZXRTaXplKCk7XG4gICAgdGhpcy5fY2FudmFzLndpZHRoID0gc2l6ZS54O1xuICAgIHRoaXMuX2NhbnZhcy5oZWlnaHQgPSBzaXplLnk7XG5cbiAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH07XG5cbiAgLy8gY2xlYXIgZWFjaCBmZWF0dXJlcyBjYWNoZVxuICB0aGlzLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBraWxsIHRoZSBmZWF0dXJlIHBvaW50IGNhY2hlXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5mZWF0dXJlc1tpXS5jbGVhckNhY2hlKCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIGdldCBsYXllciBmZWF0dXJlIHZpYSBnZW9qc29uIG9iamVjdFxuICB0aGlzLmdldENhbnZhc0ZlYXR1cmVGb3JHZW9qc29uID0gZnVuY3Rpb24oZ2VvanNvbikge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmZlYXR1cmVzW2ldLmdlb2pzb24gPT0gZ2VvanNvbiApIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmVhdHVyZXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvLyBnZXQgdGhlIG1ldGVycyBwZXIgcHggYW5kIGEgY2VydGFpbiBwb2ludDtcbiAgdGhpcy5nZXRNZXRlcnNQZXJQeCA9IGZ1bmN0aW9uKGxhdGxuZykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLm1ldGVyc1BlclB4KGxhdGxuZywgdGhpcy5fbWFwKTtcbiAgfVxufTtcblxudmFyIGxheWVyID0gbmV3IENhbnZhc0xheWVyKCk7XG5cblxucmVxdWlyZSgnLi9saWIvaW5pdCcpKGxheWVyKTtcbnJlcXVpcmUoJy4vbGliL3JlZHJhdycpKGxheWVyKTtcbnJlcXVpcmUoJy4vbGliL2FkZEZlYXR1cmUnKShsYXllcik7XG5yZXF1aXJlKCcuL2xpYi90b0NhbnZhc1hZJykobGF5ZXIpO1xuXG5MLkNhbnZhc0ZlYXR1cmVGYWN0b3J5ID0gcmVxdWlyZSgnLi9jbGFzc2VzL2ZhY3RvcnknKTtcbkwuQ2FudmFzRmVhdHVyZSA9IENhbnZhc0ZlYXR1cmU7XG5MLkNhbnZhc0ZlYXR1cmVDb2xsZWN0aW9uID0gQ2FudmFzRmVhdHVyZXM7XG5MLkNhbnZhc0dlb2pzb25MYXllciA9IEwuQ2xhc3MuZXh0ZW5kKGxheWVyKTtcbiIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZXMgPSBmdW5jdGlvbihmZWF0dXJlcykge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmFkZENhbnZhc0ZlYXR1cmUoZmVhdHVyZXNbaV0pO1xuICAgIH1cbiAgfTtcblxuICBsYXllci5hZGRDYW52YXNGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSwgYm90dG9tKSB7XG4gICAgaWYoICEoZmVhdHVyZSBpbnN0YW5jZW9mIENhbnZhc0ZlYXR1cmUpICYmICEoZmVhdHVyZSBpbnN0YW5jZW9mIENhbnZhc0ZlYXR1cmVzKSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmVhdHVyZSBtdXN0IGJlIGluc3RhbmNlIG9mIENhbnZhc0ZlYXR1cmUgb3IgQ2FudmFzRmVhdHVyZXMnKTtcbiAgICB9XG4gICAgXG4gICAgaWYoIGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlcyApIHtcbiAgICAgICAgZmVhdHVyZS5jYW52YXNGZWF0dXJlcy5mb3JFYWNoKGZ1bmN0aW9uKGYpe1xuICAgICAgICAgICAgcHJlcGFyZUNhbnZhc0ZlYXR1cmUodGhpcywgZik7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcHJlcGFyZUNhbnZhc0ZlYXR1cmUodGhpcywgZmVhdHVyZSk7XG4gICAgfVxuXG4gICAgaWYoIGJvdHRvbSApIHsgLy8gYm90dG9tIG9yIGluZGV4XG4gICAgICBpZiggdHlwZW9mIGJvdHRvbSA9PT0gJ251bWJlcicpIHRoaXMuZmVhdHVyZXMuc3BsaWNlKGJvdHRvbSwgMCwgZmVhdHVyZSk7XG4gICAgICBlbHNlIHRoaXMuZmVhdHVyZXMudW5zaGlmdChmZWF0dXJlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mZWF0dXJlcy5wdXNoKGZlYXR1cmUpO1xuICAgIH1cbiAgfSxcblxuICBsYXllci5hZGRDYW52YXNGZWF0dXJlQm90dG9tID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHRoaXMuYWRkRmVhdHVyZShmZWF0dXJlLCB0cnVlKTtcbiAgfTtcblxuICAvLyByZXR1cm5zIHRydWUgaWYgcmUtcmVuZGVyIHJlcXVpcmVkLiAgaWUgdGhlIGZlYXR1cmUgd2FzIHZpc2libGU7XG4gIGxheWVyLnJlbW92ZUNhbnZhc0ZlYXR1cmUgPSBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5mZWF0dXJlcy5pbmRleE9mKGZlYXR1cmUpO1xuICAgIGlmKCBpbmRleCA9PSAtMSApIHJldHVybjtcblxuICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIGlmKCB0aGlzLmZlYXR1cmUudmlzaWJsZSApIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbiAgXG4gIGxheWVyLnJlbW92ZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IHRydWU7XG4gICAgICB0aGlzLmZlYXR1cmVzID0gW107XG4gIH1cbn1cblxuZnVuY3Rpb24gcHJlcGFyZUNhbnZhc0ZlYXR1cmUobGF5ZXIsIGNhbnZhc0ZlYXR1cmUpIHtcbiAgICB2YXIgZ2VvbWV0cnkgPSBjYW52YXNGZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnk7XG4gICAgXG4gICAgaWYoIGdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgICBcbiAgICAgIGNhbnZhc0ZlYXR1cmUuYm91bmRzID0gbGF5ZXIudXRpbHMuY2FsY0JvdW5kcyhnZW9tZXRyeS5jb29yZGluYXRlcyk7XG5cbiAgICB9IGVsc2UgaWYgKCBnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgIC8vIFRPRE86IHdlIG9ubHkgc3VwcG9ydCBvdXRlciByaW5ncyBvdXQgdGhlIG1vbWVudCwgbm8gaW5uZXIgcmluZ3MuICBUaHVzIGNvb3JkaW5hdGVzWzBdXG4gICAgICBjYW52YXNGZWF0dXJlLmJvdW5kcyA9IGxheWVyLnV0aWxzLmNhbGNCb3VuZHMoZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0pO1xuXG4gICAgfSBlbHNlIGlmICggZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuIFxuICAgICAgY2FudmFzRmVhdHVyZS5sYXRsbmcgPSBMLmxhdExuZyhnZW9tZXRyeS5jb29yZGluYXRlc1sxXSwgZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0pO1xuICAgIFxuICAgIH0gZWxzZSBpZiAoIGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICBcbiAgICAgIGNhbnZhc0ZlYXR1cmUuYm91bmRzID0gW107XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrICApIHtcbiAgICAgICAgY2FudmFzRmVhdHVyZS5ib3VuZHMucHVzaChsYXllci51dGlscy5jYWxjQm91bmRzKGdlb21ldHJ5LmNvb3JkaW5hdGVzW2ldWzBdKSk7XG4gICAgICB9XG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdHZW9KU09OIGZlYXR1cmUgdHlwZSBcIicrZ2VvbWV0cnkudHlwZSsnXCIgbm90IHN1cHBvcnRlZC4nKTtcbiAgICB9XG59IiwidmFyIGludGVyc2VjdHMgPSByZXF1aXJlKCcuL2ludGVyc2VjdHMnKTtcbnZhciBjb3VudCA9IDA7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBcbiAgICBsYXllci5pbml0aWFsaXplID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLmZlYXR1cmVzID0gW107XG4gICAgICAgIHRoaXMuaW50ZXJzZWN0TGlzdCA9IFtdO1xuICAgICAgICB0aGlzLnNob3dpbmcgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNldCBvcHRpb25zXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcblxuICAgICAgICAvLyBtb3ZlIG1vdXNlIGV2ZW50IGhhbmRsZXJzIHRvIGxheWVyIHNjb3BlXG4gICAgICAgIHZhciBtb3VzZUV2ZW50cyA9IFsnb25Nb3VzZU92ZXInLCAnb25Nb3VzZU1vdmUnLCAnb25Nb3VzZU91dCcsICdvbkNsaWNrJ107XG4gICAgICAgIG1vdXNlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBpZiggIXRoaXMub3B0aW9uc1tlXSApIHJldHVybjtcbiAgICAgICAgICAgIHRoaXNbZV0gPSB0aGlzLm9wdGlvbnNbZV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRpb25zW2VdO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIHNldCBjYW52YXMgYW5kIGNhbnZhcyBjb250ZXh0IHNob3J0Y3V0c1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBjcmVhdGVDYW52YXMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2N0eCA9IHRoaXMuX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH07XG4gICAgXG4gICAgbGF5ZXIub25BZGQgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuXG4gICAgICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAgICAgLy8gdGhlIGNvbnRhaW5lciBpcyBtb3ZlZCBpbiB0aGUgb3Bvc2l0ZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgICAgIC8vIG1hcCBwYW5lIHRvIGtlZXAgdGhlIGNhbnZhcyBhbHdheXMgaW4gKDAsIDApXG4gICAgICAgIC8vdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcbiAgICAgICAgdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy5tYXJrZXJQYW5lO1xuICAgICAgICB2YXIgX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWxheWVyLScrY291bnQpO1xuICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgIF9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fY2FudmFzKTtcbiAgICAgICAgdGlsZVBhbmUuYXBwZW5kQ2hpbGQoX2NvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgICAgICAvLyBoYWNrOiBsaXN0ZW4gdG8gcHJlZHJhZyBldmVudCBsYXVuY2hlZCBieSBkcmFnZ2luZyB0b1xuICAgICAgICAvLyBzZXQgY29udGFpbmVyIGluIHBvc2l0aW9uICgwLCAwKSBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICAgICAgaWYgKG1hcC5kcmFnZ2luZy5lbmFibGVkKCkpIHtcbiAgICAgICAgICAgIG1hcC5kcmFnZ2luZy5fZHJhZ2dhYmxlLm9uKCdwcmVkcmFnJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbW92ZVN0YXJ0LmFwcGx5KHRoaXMpO1xuICAgICAgICAgICAgICAgIC8vdmFyIGQgPSBtYXAuZHJhZ2dpbmcuX2RyYWdnYWJsZTtcbiAgICAgICAgICAgICAgICAvL0wuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jYW52YXMsIHsgeDogLWQuX25ld1Bvcy54LCB5OiAtZC5fbmV3UG9zLnkgfSk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hcC5vbih7XG4gICAgICAgICAgICAndmlld3Jlc2V0JyA6IHRoaXMucmVzZXQsXG4gICAgICAgICAgICAncmVzaXplJyAgICA6IHRoaXMucmVzZXQsXG4gICAgICAgICAgICAnem9vbXN0YXJ0JyA6IHN0YXJ0Wm9vbSxcbiAgICAgICAgICAgICd6b29tZW5kJyAgIDogZW5kWm9vbSxcbiAgICAgICAgICAgICdtb3Zlc3RhcnQnIDogbW92ZVN0YXJ0LFxuICAgICAgICAgICAgJ21vdmVlbmQnICAgOiBtb3ZlRW5kLFxuICAgICAgICAgICAgJ21vdXNlbW92ZScgOiBpbnRlcnNlY3RzLFxuICAgICAgICAgICAgJ2NsaWNrJyAgICAgOiBpbnRlcnNlY3RzXG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgICAgICBpZiggdGhpcy56SW5kZXggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0WkluZGV4KHRoaXMuekluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsYXllci5vblJlbW92ZSA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgICBtYXAub2ZmKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICdtb3Zlc3RhcnQnIDogbW92ZVN0YXJ0LFxuICAgICAgICAgICAgJ21vdmVlbmQnICAgOiBtb3ZlRW5kLFxuICAgICAgICAgICAgJ3pvb21zdGFydCcgOiBzdGFydFpvb20sXG4gICAgICAgICAgICAnem9vbWVuZCcgICA6IGVuZFpvb20sXG4gICAgICAgICAgICAnbW91c2Vtb3ZlJyA6IGludGVyc2VjdHMsXG4gICAgICAgICAgICAnY2xpY2snICAgICA6IGludGVyc2VjdHNcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDYW52YXMob3B0aW9ucykge1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGNhbnZhcy5zdHlsZS50b3AgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICBjYW52YXMuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICAgIGNhbnZhcy5zdHlsZS56SW5kZXggPSBvcHRpb25zLnpJbmRleCB8fCAwO1xuICAgIHZhciBjbGFzc05hbWUgPSAnbGVhZmxldC10aWxlLWNvbnRhaW5lciBsZWFmbGV0LXpvb20tYW5pbWF0ZWQnO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gY2FudmFzO1xufVxuXG5mdW5jdGlvbiBzdGFydFpvb20oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB0aGlzLnpvb21pbmcgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBlbmRab29tKCkge1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgIHNldFRpbWVvdXQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgNTApO1xufVxuXG5mdW5jdGlvbiBtb3ZlU3RhcnQoKSB7XG4gICAgaWYoIHRoaXMubW92aW5nICkgcmV0dXJuO1xuICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICBcbiAgICBpZiggIXRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgKSByZXR1cm47XG4gICAgXG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbn1cblxuZnVuY3Rpb24gbW92ZUVuZChlKSB7XG4gICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcihlKTtcbn07XG5cbmZ1bmN0aW9uIGZyYW1lUmVuZGVyKCkge1xuICAgIGlmKCAhdGhpcy5tb3ZpbmcgKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgXG4gICAgaWYoIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCA+IDc1ICkge1xuICAgICAgICBpZiggdGhpcy5kZWJ1ZyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNhYmxlZCByZW5kZXJpbmcgd2hpbGUgcGFuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKCAhdGhpcy5tb3ZpbmcgKSByZXR1cm47XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWVSZW5kZXIuYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpLCA3NTApO1xufSIsIi8qKiBcbiAqIEhhbmRsZSBtb3VzZSBpbnRlcnNlY3Rpb24gZXZlbnRzXG4gKiBlIC0gbGVhZmxldCBldmVudFxuICoqL1xuZnVuY3Rpb24gaW50ZXJzZWN0cyhlKSB7XG4gICAgaWYoICF0aGlzLnNob3dpbmcgKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciBtcHAgPSB0aGlzLmdldE1ldGVyc1BlclB4KGUubGF0bG5nKTtcbiAgICB2YXIgciA9IG1wcCAqIDU7IC8vIDUgcHggcmFkaXVzIGJ1ZmZlcjtcblxuICAgIHZhciBjZW50ZXIgPSB7XG4gICAgICB0eXBlIDogJ1BvaW50JyxcbiAgICAgIGNvb3JkaW5hdGVzIDogW2UubGF0bG5nLmxuZywgZS5sYXRsbmcubGF0XVxuICAgIH07XG5cbiAgICB2YXIgZjtcbiAgICB2YXIgaW50ZXJzZWN0cyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG5cbiAgICAgIGlmKCAhZi52aXNpYmxlICkgY29udGludWU7XG4gICAgICBpZiggIWYuZ2VvanNvbi5nZW9tZXRyeSApIGNvbnRpbnVlO1xuICAgICAgaWYoICFmLmdldENhbnZhc1hZKCkgKSBjb250aW51ZTtcbiAgICAgIGlmKCAhaXNJbkJvdW5kcyhmLCBlLmxhdGxuZykgKSBjb250aW51ZTtcblxuICAgICAgaWYoIHRoaXMudXRpbHMuZ2VvbWV0cnlXaXRoaW5SYWRpdXMoZi5nZW9qc29uLmdlb21ldHJ5LCBmLmdldENhbnZhc1hZKCksIGNlbnRlciwgZS5jb250YWluZXJQb2ludCwgZi5zaXplID8gKGYuc2l6ZSAqIG1wcCkgOiByKSApIHtcbiAgICAgICAgaW50ZXJzZWN0cy5wdXNoKGYuZ2VvanNvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGUudHlwZSA9PSAnY2xpY2snICYmIHRoaXMub25DbGljayApIHtcbiAgICAgIHRoaXMub25DbGljayhpbnRlcnNlY3RzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbW91c2VvdmVyID0gW10sIG1vdXNlb3V0ID0gW10sIG1vdXNlbW92ZSA9IFtdO1xuXG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGludGVyc2VjdHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5pbnRlcnNlY3RMaXN0LmluZGV4T2YoaW50ZXJzZWN0c1tpXSkgPiAtMSApIHtcbiAgICAgICAgbW91c2Vtb3ZlLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgbW91c2VvdmVyLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmludGVyc2VjdExpc3QubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggaW50ZXJzZWN0cy5pbmRleE9mKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSkgPT0gLTEgKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBtb3VzZW91dC5wdXNoKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gaW50ZXJzZWN0cztcblxuICAgIGlmKCB0aGlzLm9uTW91c2VPdmVyICYmIG1vdXNlb3Zlci5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlT3Zlci5jYWxsKHRoaXMsIG1vdXNlb3ZlciwgZSk7XG4gICAgaWYoIHRoaXMub25Nb3VzZU1vdmUgKSB0aGlzLm9uTW91c2VNb3ZlLmNhbGwodGhpcywgbW91c2Vtb3ZlLCBlKTsgLy8gYWx3YXlzIGZpcmVcbiAgICBpZiggdGhpcy5vbk1vdXNlT3V0ICYmIG1vdXNlb3V0Lmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VPdXQuY2FsbCh0aGlzLCBtb3VzZW91dCwgZSk7XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdpbnRlcnNlY3RzIHRpbWU6ICcrKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCkrJ21zJyk7XG5cbiAgICBpZiggY2hhbmdlZCApIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuXG5mdW5jdGlvbiBpc0luQm91bmRzKGZlYXR1cmUsIGxhdGxuZykge1xuICAgIGlmKCBmZWF0dXJlLmJvdW5kcyApIHtcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoZmVhdHVyZS5ib3VuZHMpICkge1xuXG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZmVhdHVyZS5ib3VuZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBpZiggZmVhdHVyZS5ib3VuZHNbaV0uY29udGFpbnMobGF0bG5nKSApIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmICggZmVhdHVyZS5ib3VuZHMuY29udGFpbnMobGF0bG5nKSApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdHM7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgIFxuICBsYXllci5yZW5kZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYoICF0aGlzLmFsbG93UGFuUmVuZGVyaW5nICYmIHRoaXMubW92aW5nICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0LCBkaWZmXG4gICAgaWYoIHRoaXMuZGVidWcgKSB7XG4gICAgICAgIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB9XG5cbiAgICB2YXIgZGlmZiA9IG51bGw7XG4gICAgaWYoIGUgJiYgZS50eXBlID09ICdtb3ZlZW5kJyApIHtcbiAgICAgIHZhciBjZW50ZXIgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XG5cbiAgICAgIHZhciBwdCA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGNlbnRlcik7XG4gICAgICBpZiggdGhpcy5sYXN0Q2VudGVyTEwgKSB7XG4gICAgICAgIHZhciBsYXN0WHkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludCh0aGlzLmxhc3RDZW50ZXJMTCk7XG4gICAgICAgIGRpZmYgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYeS54IC0gcHQueCxcbiAgICAgICAgICB5IDogbGFzdFh5LnkgLSBwdC55XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5sYXN0Q2VudGVyTEwgPSBjZW50ZXI7XG4gICAgfVxuXG4gICAgdmFyIHRvcExlZnQgPSB0aGlzLl9tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWzAsIDBdKTtcbiAgICBMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB0b3BMZWZ0KTtcblxuICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG5cbiAgICAvLyBjbGVhciBjYW52YXNcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICBpZiggIXRoaXMuem9vbWluZyApIHtcbiAgICAgICAgdGhpcy5yZWRyYXcoZGlmZik7XG4gICAgfVxuXG4gICAgaWYoIHRoaXMuZGVidWcgKSB7XG4gICAgICBkaWZmID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0O1xuXG4gICAgICB2YXIgYyA9IDA7XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmKCAhdGhpcy5mZWF0dXJlc1tpXS5jYWNoZS5nZW9YWSApIGNvbnRpbnVlO1xuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSh0aGlzLmZlYXR1cmVzW2ldLmNhY2hlLmdlb1hZKSApIGMgKz0gdGhpcy5mZWF0dXJlc1tpXS5jYWNoZS5nZW9YWS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKCdSZW5kZXJlZCAnK2MrJyBwdHMgaW4gJytkaWZmKydtcycpO1xuICAgIH1cbiAgfSxcbiAgICBcblxuICAvLyByZWRyYXcgYWxsIGZlYXR1cmVzLiAgVGhpcyBkb2VzIG5vdCBoYW5kbGUgY2xlYXJpbmcgdGhlIGNhbnZhcyBvciBzZXR0aW5nXG4gIC8vIHRoZSBjYW52YXMgY29ycmVjdCBwb3NpdGlvbi4gIFRoYXQgaXMgaGFuZGxlZCBieSByZW5kZXJcbiAgbGF5ZXIucmVkcmF3ID0gZnVuY3Rpb24oZGlmZikge1xuICAgIGlmKCAhdGhpcy5zaG93aW5nICkgcmV0dXJuO1xuXG4gICAgLy8gb2JqZWN0cyBzaG91bGQga2VlcCB0cmFjayBvZiBsYXN0IGJib3ggYW5kIHpvb20gb2YgbWFwXG4gICAgLy8gaWYgdGhpcyBoYXNuJ3QgY2hhbmdlZCB0aGUgbGwgLT4gY29udGFpbmVyIHB0IGlzIG5vdCBuZWVkZWRcbiAgICB2YXIgYm91bmRzID0gdGhpcy5fbWFwLmdldEJvdW5kcygpO1xuICAgIHZhciB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcblxuICAgIGlmKCB0aGlzLmRlYnVnICkgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIFxuICAgIHZhciBmLCBpLCBqO1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGYgPSB0aGlzLmZlYXR1cmVzW2ldO1xuICAgICAgaWYoIGYuaXNDYW52YXNGZWF0dXJlcyApIHtcbiAgICAgICAgZm9yKCBqID0gMDsgaiA8IGYuY2FudmFzRmVhdHVyZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgdGhpcy5yZWRyYXdGZWF0dXJlKGYuY2FudmFzRmVhdHVyZXNbal0sIGJvdW5kcywgem9vbSwgZGlmZik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVkcmF3RmVhdHVyZShmLCBib3VuZHMsIHpvb20sIGRpZmYpO1xuICAgICAgfVxuICAgICAgXG4gICAgfVxuXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZygnUmVuZGVyIHRpbWU6ICcrKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCkrJ21zOyBhdmc6ICcrXG4gICAgICAoKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCkgLyB0aGlzLmZlYXR1cmVzLmxlbmd0aCkrJ21zJyk7XG4gIH0sXG5cblxuXG4gIC8vIHJlZHJhdyBhbiBpbmRpdmlkdWFsIGZlYXR1cmVcbiAgbGF5ZXIucmVkcmF3RmVhdHVyZSA9IGZ1bmN0aW9uKGNhbnZhc0ZlYXR1cmUsIGJvdW5kcywgem9vbSwgZGlmZikge1xuICAgIC8vaWYoIGZlYXR1cmUuZ2VvanNvbi5wcm9wZXJ0aWVzLmRlYnVnICkgZGVidWdnZXI7XG5cbiAgICAvLyBpZ25vcmUgYW55dGhpbmcgZmxhZ2dlZCBhcyBoaWRkZW5cbiAgICAvLyB3ZSBkbyBuZWVkIHRvIGNsZWFyIHRoZSBjYWNoZSBpbiB0aGlzIGNhc2VcbiAgICBpZiggIWNhbnZhc0ZlYXR1cmUudmlzaWJsZSApIHtcbiAgICAgIGNhbnZhc0ZlYXR1cmUuY2xlYXJDYWNoZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG5vdyBsZXRzIGNoZWNrIGNhY2hlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlcHJvamVjdCB0aGVcbiAgICAvLyB4eSBjb29yZGluYXRlc1xuICAgIC8vIGFjdHVhbGx5IHByb2plY3QgdG8geHkgaWYgbmVlZGVkXG4gICAgdmFyIHJlcHJvamVjdCA9IGNhbnZhc0ZlYXR1cmUucmVxdWlyZXNSZXByb2plY3Rpb24oem9vbSk7XG4gICAgaWYoIHJlcHJvamVjdCApIHtcbiAgICAgIHRoaXMudG9DYW52YXNYWShjYW52YXNGZWF0dXJlLCB6b29tKTtcbiAgICB9ICAvLyBlbmQgcmVwcm9qZWN0XG5cbiAgICAvLyBpZiB0aGlzIHdhcyBhIHNpbXBsZSBwYW4gZXZlbnQgKGEgZGlmZiB3YXMgcHJvdmlkZWQpIGFuZCB3ZSBkaWQgbm90IHJlcHJvamVjdFxuICAgIC8vIG1vdmUgdGhlIGZlYXR1cmUgYnkgZGlmZiB4L3lcbiAgICBpZiggZGlmZiAmJiAhcmVwcm9qZWN0ICkge1xuICAgICAgaWYoIGNhbnZhc0ZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgICAgY2FudmFzRmVhdHVyZS5jYWNoZS5nZW9YWS54ICs9IGRpZmYueDtcbiAgICAgICAgY2FudmFzRmVhdHVyZS5jYWNoZS5nZW9YWS55ICs9IGRpZmYueTtcblxuICAgICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShjYW52YXNGZWF0dXJlLmNhY2hlLmdlb1hZLCBkaWZmKTtcblxuICAgICAgfSBlbHNlIGlmICggY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgXG4gICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoY2FudmFzRmVhdHVyZS5jYWNoZS5nZW9YWSwgZGlmZik7XG4gICAgICBcbiAgICAgIH0gZWxzZSBpZiAoIGNhbnZhc0ZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgICAgIFxuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNhbnZhc0ZlYXR1cmUuY2FjaGUuZ2VvWFkubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShjYW52YXNGZWF0dXJlLmNhY2hlLmdlb1hZW2ldLCBkaWZmKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlnbm9yZSBhbnl0aGluZyBub3QgaW4gYm91bmRzXG4gICAgaWYoIGNhbnZhc0ZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG4gICAgICBpZiggIWJvdW5kcy5jb250YWlucyhjYW52YXNGZWF0dXJlLmxhdGxuZykgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYoIGNhbnZhc0ZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nICkge1xuXG4gICAgICAvLyBqdXN0IG1ha2Ugc3VyZSBhdCBsZWFzdCBvbmUgcG9seWdvbiBpcyB3aXRoaW4gcmFuZ2VcbiAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjYW52YXNGZWF0dXJlLmJvdW5kcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoIGJvdW5kcy5jb250YWlucyhjYW52YXNGZWF0dXJlLmJvdW5kc1tpXSkgfHwgYm91bmRzLmludGVyc2VjdHMoY2FudmFzRmVhdHVyZS5ib3VuZHNbaV0pICkge1xuICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYoICFmb3VuZCApIHJldHVybjtcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggIWJvdW5kcy5jb250YWlucyhjYW52YXNGZWF0dXJlLmJvdW5kcykgJiYgIWJvdW5kcy5pbnRlcnNlY3RzKGNhbnZhc0ZlYXR1cmUuYm91bmRzKSApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB2YXIgcmVuZGVyZXIgPSBjYW52YXNGZWF0dXJlLnJlbmRlcmVyID8gY2FudmFzRmVhdHVyZS5yZW5kZXJlciA6IHRoaXMucmVuZGVyZXI7XG4gICAgXG4gICAgLy8gY2FsbCBmZWF0dXJlIHJlbmRlciBmdW5jdGlvbiBpbiBmZWF0dXJlIHNjb3BlOyBmZWF0dXJlIGlzIHBhc3NlZCBhcyB3ZWxsXG4gICAgcmVuZGVyZXIuY2FsbChcbiAgICAgICAgY2FudmFzRmVhdHVyZSwgLy8gc2NvcGVcbiAgICAgICAgdGhpcy5fY3R4LCBcbiAgICAgICAgY2FudmFzRmVhdHVyZS5nZXRDYW52YXNYWSgpLCBcbiAgICAgICAgdGhpcy5fbWFwLCBcbiAgICAgICAgY2FudmFzRmVhdHVyZS5nZW9qc29uXG4gICAgKTtcbiAgfTtcbn0iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgbGF5ZXIudG9DYW52YXNYWSA9IGZ1bmN0aW9uKGZlYXR1cmUsIHpvb20pIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYSBjYWNoZSBuYW1lc3BhY2UgYW5kIHNldCB0aGUgem9vbSBsZXZlbFxuICAgICAgICBpZiggIWZlYXR1cmUuY2FjaGUgKSBmZWF0dXJlLmNhY2hlID0ge307XG4gICAgICAgIHZhciBjYW52YXNYWTtcblxuICAgICAgICBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcblxuICAgICAgICBjYW52YXNYWSA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICAgIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXVxuICAgICAgICBdKTtcblxuICAgICAgICBpZiggZmVhdHVyZS5zaXplICkge1xuICAgICAgICAgICAgY2FudmFzWFlbMF0gPSBjYW52YXNYWVswXSAtIGZlYXR1cmUuc2l6ZSAvIDI7XG4gICAgICAgICAgICBjYW52YXNYWVsxXSA9IGNhbnZhc1hZWzFdIC0gZmVhdHVyZS5zaXplIC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgICAgICAgXG4gICAgICAgIGNhbnZhc1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMsIHRoaXMuX21hcCk7XG4gICAgICAgIHRyaW1DYW52YXNYWShjYW52YXNYWSk7XG4gICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgICAgXG4gICAgICAgIGNhbnZhc1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0sIHRoaXMuX21hcCk7XG4gICAgICAgIHRyaW1DYW52YXNYWShjYW52YXNYWSk7XG4gICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgICAgIGNhbnZhc1hZID0gW107XG4gICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdmFyIHh5ID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbaV1bMF0sIHRoaXMuX21hcCk7XG4gICAgICAgICAgICAgICAgdHJpbUNhbnZhc1hZKHh5KTtcbiAgICAgICAgICAgICAgICBjYW52YXNYWS5wdXNoKHh5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZmVhdHVyZS5zZXRDYW52YXNYWShjYW52YXNYWSwgem9vbSk7XG4gICAgfTtcbn1cblxuLy8gZ2l2ZW4gYW4gYXJyYXkgb2YgZ2VvIHh5IGNvb3JkaW5hdGVzLCBtYWtlIHN1cmUgZWFjaCBwb2ludCBpcyBhdCBsZWFzdCBtb3JlIHRoYW4gMXB4IGFwYXJ0XG5mdW5jdGlvbiB0cmltQ2FudmFzWFkoeHkpIHtcbiAgICBpZiggeHkubGVuZ3RoID09PSAwICkgcmV0dXJuO1xuICAgIHZhciBsYXN0ID0geHlbeHkubGVuZ3RoLTFdLCBpLCBwb2ludDtcblxuICAgIHZhciBjID0gMDtcbiAgICBmb3IoIGkgPSB4eS5sZW5ndGgtMjsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgIHBvaW50ID0geHlbaV07XG4gICAgICAgIGlmKCBNYXRoLmFicyhsYXN0LnggLSBwb2ludC54KSA9PT0gMCAmJiBNYXRoLmFicyhsYXN0LnkgLSBwb2ludC55KSA9PT0gMCApIHtcbiAgICAgICAgICAgIHh5LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGMrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhc3QgPSBwb2ludDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmKCB4eS5sZW5ndGggPD0gMSApIHtcbiAgICAgICAgeHkucHVzaChsYXN0KTtcbiAgICAgICAgYy0tO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vdmVMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBkaWZmKSB7XG4gICAgdmFyIGk7IGxlbiA9IGNvb3Jkcy5sZW5ndGg7XG4gICAgZm9yKCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgY29vcmRzW2ldLnggKz0gZGlmZi54O1xuICAgICAgY29vcmRzW2ldLnkgKz0gZGlmZi55O1xuICAgIH1cbiAgfSxcblxuICBwcm9qZWN0TGluZSA6IGZ1bmN0aW9uKGNvb3JkcywgbWFwKSB7XG4gICAgdmFyIHh5TGluZSA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB4eUxpbmUucHVzaChtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgY29vcmRzW2ldWzFdLCBjb29yZHNbaV1bMF1cbiAgICAgIF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4geHlMaW5lO1xuICB9LFxuXG4gIGNhbGNCb3VuZHMgOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICB2YXIgeG1pbiA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeG1heCA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeW1pbiA9IGNvb3Jkc1swXVswXTtcbiAgICB2YXIgeW1heCA9IGNvb3Jkc1swXVswXTtcblxuICAgIGZvciggdmFyIGkgPSAxOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHhtaW4gPiBjb29yZHNbaV1bMV0gKSB4bWluID0gY29vcmRzW2ldWzFdO1xuICAgICAgaWYoIHhtYXggPCBjb29yZHNbaV1bMV0gKSB4bWF4ID0gY29vcmRzW2ldWzFdO1xuXG4gICAgICBpZiggeW1pbiA+IGNvb3Jkc1tpXVswXSApIHltaW4gPSBjb29yZHNbaV1bMF07XG4gICAgICBpZiggeW1heCA8IGNvb3Jkc1tpXVswXSApIHltYXggPSBjb29yZHNbaV1bMF07XG4gICAgfVxuXG4gICAgdmFyIHNvdXRoV2VzdCA9IEwubGF0TG5nKHhtaW4tLjAxLCB5bWluLS4wMSk7XG4gICAgdmFyIG5vcnRoRWFzdCA9IEwubGF0TG5nKHhtYXgrLjAxLCB5bWF4Ky4wMSk7XG5cbiAgICByZXR1cm4gTC5sYXRMbmdCb3VuZHMoc291dGhXZXN0LCBub3J0aEVhc3QpO1xuICB9LFxuXG4gIGdlb21ldHJ5V2l0aGluUmFkaXVzIDogZnVuY3Rpb24oZ2VvbWV0cnksIHh5UG9pbnRzLCBjZW50ZXIsIHh5UG9pbnQsIHJhZGl1cykge1xuICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50RGlzdGFuY2UoZ2VvbWV0cnksIGNlbnRlcikgPD0gcmFkaXVzO1xuICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgIGZvciggdmFyIGkgPSAxOyBpIDwgeHlQb2ludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmKCB0aGlzLmxpbmVJbnRlcnNlY3RzQ2lyY2xlKHh5UG9pbnRzW2ktMV0sIHh5UG9pbnRzW2ldLCB4eVBvaW50LCAzKSApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludEluUG9seWdvbihjZW50ZXIsIGdlb21ldHJ5KTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzI3NTUyOS9jaGVjay1pZi1saW5lLWludGVyc2VjdHMtd2l0aC1jaXJjbGVzLXBlcmltZXRlclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EaXN0YW5jZV9mcm9tX2FfcG9pbnRfdG9fYV9saW5lXG4gIC8vIFtsbmcgeCwgbGF0LCB5XVxuICBsaW5lSW50ZXJzZWN0c0NpcmNsZSA6IGZ1bmN0aW9uKGxpbmVQMSwgbGluZVAyLCBwb2ludCwgcmFkaXVzKSB7XG4gICAgdmFyIGRpc3RhbmNlID1cbiAgICAgIE1hdGguYWJzKFxuICAgICAgICAoKGxpbmVQMi55IC0gbGluZVAxLnkpKnBvaW50LngpIC0gKChsaW5lUDIueCAtIGxpbmVQMS54KSpwb2ludC55KSArIChsaW5lUDIueCpsaW5lUDEueSkgLSAobGluZVAyLnkqbGluZVAxLngpXG4gICAgICApIC9cbiAgICAgIE1hdGguc3FydChcbiAgICAgICAgTWF0aC5wb3cobGluZVAyLnkgLSBsaW5lUDEueSwgMikgKyBNYXRoLnBvdyhsaW5lUDIueCAtIGxpbmVQMS54LCAyKVxuICAgICAgKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPD0gcmFkaXVzO1xuICB9LFxuXG4gIC8vIGh0dHA6Ly93aWtpLm9wZW5zdHJlZXRtYXAub3JnL3dpa2kvWm9vbV9sZXZlbHNcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzU0NTA5OC9sZWFmbGV0LWNhbGN1bGF0aW5nLW1ldGVycy1wZXItcGl4ZWwtYXQtem9vbS1sZXZlbFxuICBtZXRlcnNQZXJQeCA6IGZ1bmN0aW9uKGxsLCBtYXApIHtcbiAgICB2YXIgcG9pbnRDID0gbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGwpOyAvLyBjb252ZXJ0IHRvIGNvbnRhaW5lcnBvaW50IChwaXhlbHMpXG4gICAgdmFyIHBvaW50WCA9IFtwb2ludEMueCArIDEsIHBvaW50Qy55XTsgLy8gYWRkIG9uZSBwaXhlbCB0byB4XG5cbiAgICAvLyBjb252ZXJ0IGNvbnRhaW5lcnBvaW50cyB0byBsYXRsbmcnc1xuICAgIHZhciBsYXRMbmdDID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRDKTtcbiAgICB2YXIgbGF0TG5nWCA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50WCk7XG5cbiAgICB2YXIgZGlzdGFuY2VYID0gbGF0TG5nQy5kaXN0YW5jZVRvKGxhdExuZ1gpOyAvLyBjYWxjdWxhdGUgZGlzdGFuY2UgYmV0d2VlbiBjIGFuZCB4IChsYXRpdHVkZSlcbiAgICByZXR1cm4gZGlzdGFuY2VYO1xuICB9LFxuXG4gIC8vIGZyb20gaHR0cDovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWxcbiAgcG9pbnREaXN0YW5jZSA6IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHZhciBsb24xID0gcHQxLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MSA9IHB0MS5jb29yZGluYXRlc1sxXSxcbiAgICAgIGxvbjIgPSBwdDIuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQyID0gcHQyLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgZExhdCA9IHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MiAtIGxhdDEpLFxuICAgICAgZExvbiA9IHRoaXMubnVtYmVyVG9SYWRpdXMobG9uMiAtIGxvbjEpLFxuICAgICAgYSA9IE1hdGgucG93KE1hdGguc2luKGRMYXQgLyAyKSwgMikgKyBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDEpKVxuICAgICAgICAqIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MikpICogTWF0aC5wb3coTWF0aC5zaW4oZExvbiAvIDIpLCAyKSxcbiAgICAgIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xuICAgIHJldHVybiAoNjM3MSAqIGMpICogMTAwMDsgLy8gcmV0dXJucyBtZXRlcnNcbiAgfSxcblxuICBwb2ludEluUG9seWdvbiA6IGZ1bmN0aW9uIChwLCBwb2x5KSB7XG4gICAgdmFyIGNvb3JkcyA9IChwb2x5LnR5cGUgPT0gXCJQb2x5Z29uXCIpID8gWyBwb2x5LmNvb3JkaW5hdGVzIF0gOiBwb2x5LmNvb3JkaW5hdGVzXG5cbiAgICB2YXIgaW5zaWRlQm94ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG9pbnRJbkJvdW5kaW5nQm94KHAsIHRoaXMuYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzKGNvb3Jkc1tpXSkpKSBpbnNpZGVCb3ggPSB0cnVlXG4gICAgfVxuICAgIGlmICghaW5zaWRlQm94KSByZXR1cm4gZmFsc2VcblxuICAgIHZhciBpbnNpZGVQb2x5ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG5wb2x5KHAuY29vcmRpbmF0ZXNbMV0sIHAuY29vcmRpbmF0ZXNbMF0sIGNvb3Jkc1tpXSkpIGluc2lkZVBvbHkgPSB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVBvbHlcbiAgfSxcblxuICBwb2ludEluQm91bmRpbmdCb3ggOiBmdW5jdGlvbiAocG9pbnQsIGJvdW5kcykge1xuICAgIHJldHVybiAhKHBvaW50LmNvb3JkaW5hdGVzWzFdIDwgYm91bmRzWzBdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzFdID4gYm91bmRzWzFdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdIDwgYm91bmRzWzBdWzFdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdID4gYm91bmRzWzFdWzFdKVxuICB9LFxuXG4gIGJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3JkcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4QWxsID0gW10sIHlBbGwgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHNbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHhBbGwucHVzaChjb29yZHNbMF1baV1bMV0pXG4gICAgICB5QWxsLnB1c2goY29vcmRzWzBdW2ldWzBdKVxuICAgIH1cblxuICAgIHhBbGwgPSB4QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICB5QWxsID0geUFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG5cbiAgICByZXR1cm4gWyBbeEFsbFswXSwgeUFsbFswXV0sIFt4QWxsW3hBbGwubGVuZ3RoIC0gMV0sIHlBbGxbeUFsbC5sZW5ndGggLSAxXV0gXVxuICB9LFxuXG4gIC8vIFBvaW50IGluIFBvbHlnb25cbiAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbCNMaXN0aW5nIHRoZSBWZXJ0aWNlc1xuICBwbnBvbHkgOiBmdW5jdGlvbih4LHksY29vcmRzKSB7XG4gICAgdmFyIHZlcnQgPSBbIFswLDBdIF1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvb3Jkc1tpXS5sZW5ndGg7IGorKykge1xuICAgICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldW2pdKVxuICAgICAgfVxuICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVswXSlcbiAgICAgIHZlcnQucHVzaChbMCwwXSlcbiAgICB9XG5cbiAgICB2YXIgaW5zaWRlID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZlcnQubGVuZ3RoIC0gMTsgaSA8IHZlcnQubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICBpZiAoKCh2ZXJ0W2ldWzBdID4geSkgIT0gKHZlcnRbal1bMF0gPiB5KSkgJiYgKHggPCAodmVydFtqXVsxXSAtIHZlcnRbaV1bMV0pICogKHkgLSB2ZXJ0W2ldWzBdKSAvICh2ZXJ0W2pdWzBdIC0gdmVydFtpXVswXSkgKyB2ZXJ0W2ldWzFdKSkgaW5zaWRlID0gIWluc2lkZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVcbiAgfSxcblxuICBudW1iZXJUb1JhZGl1cyA6IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICByZXR1cm4gbnVtYmVyICogTWF0aC5QSSAvIDE4MDtcbiAgfVxufTtcbiJdfQ==
