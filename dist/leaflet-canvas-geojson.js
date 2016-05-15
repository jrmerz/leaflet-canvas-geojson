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
    if( !this.allowPanRendering ) return;
    if( this.moving ) return;
    this.moving = true;
    
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
    
    console.log(new Date().getTime() - t);
    if( new Date().getTime() - t > 75 ) {
        console.log('Disabled rendering while paning');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUuanMiLCJzcmMvY2xhc3Nlcy9DYW52YXNGZWF0dXJlcy5qcyIsInNyYy9jbGFzc2VzL2ZhY3RvcnkuanMiLCJzcmMvZGVmYXVsdFJlbmRlcmVyL2luZGV4LmpzIiwic3JjL2xheWVyIiwic3JjL2xpYi9hZGRGZWF0dXJlLmpzIiwic3JjL2xpYi9pbml0LmpzIiwic3JjL2xpYi9pbnRlcnNlY3RzLmpzIiwic3JjL2xpYi9yZWRyYXcuanMiLCJzcmMvbGliL3RvQ2FudmFzWFkuanMiLCJzcmMvbGliL3V0aWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZnVuY3Rpb24gQ2FudmFzRmVhdHVyZShnZW9qc29uKSB7XG4gICAgXG4gICAgLy8gcmFkaXVzIGZvciBwb2ludCBmZWF0dXJlc1xuICAgIC8vIHVzZSB0byBjYWxjdWxhdGUgbW91c2Ugb3Zlci9vdXQgYW5kIGNsaWNrIGV2ZW50cyBmb3IgcG9pbnRzXG4gICAgLy8gdGhpcyB2YWx1ZSBzaG91bGQgbWF0Y2ggdGhlIHZhbHVlIHVzZWQgZm9yIHJlbmRlcmluZyBwb2ludHNcbiAgICB0aGlzLnNpemUgPSA1O1xuICAgIFxuICAgIHZhciBjYWNoZSA9IHtcbiAgICAgICAgLy8gcHJvamVjdGVkIHBvaW50cyBvbiBjYW52YXNcbiAgICAgICAgY2FudmFzWFkgOiBudWxsLFxuICAgICAgICAvLyB6b29tIGxldmVsIGNhbnZhc1hZIHBvaW50cyBhcmUgY2FsY3VsYXRlZCB0b1xuICAgICAgICB6b29tIDogLTFcbiAgICB9XG4gICAgXG4gICAgLy8gYWN0dWFsIGdlb2pzb24gb2JqZWN0LCB3aWxsIG5vdCBiZSBtb2RpZmVkLCBqdXN0IHN0b3JlZFxuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgXG4gICAgLy8gcGVyZm9ybWFuY2UgZmxhZywgd2lsbCBrZWVwIGludmlzaWJsZSBmZWF0dXJlcyBmb3IgcmVjYWxjIFxuICAgIC8vIGV2ZW50cyBhcyB3ZWxsIGFzIG5vdCBiZWluZyByZW5kZXJlZFxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgXG4gICAgLy8gYm91bmRpbmcgYm94IGZvciBnZW9tZXRyeSwgdXNlZCBmb3IgaW50ZXJzZWN0aW9uIGFuZFxuICAgIC8vIHZpc2libGlsaXR5IG9wdGltaXphdGlvbnNcbiAgICB0aGlzLmJvdW5kcyA9IG51bGw7XG4gICAgXG4gICAgLy8gTGVhZmxldCBMYXRMbmcsIHVzZWQgZm9yIHBvaW50cyB0byBxdWlja2x5IGxvb2sgZm9yIGludGVyc2VjdGlvblxuICAgIHRoaXMubGF0bG5nID0gbnVsbDtcbiAgICBcbiAgICAvLyBjbGVhciB0aGUgY2FudmFzWFkgc3RvcmVkIHZhbHVlc1xuICAgIHRoaXMuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmNhY2hlLmNhbnZhc1hZID0gbnVsbDtcbiAgICAgICAgdGhpcy5jYWNoZS56b29tID0gLTE7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2V0Q2FudmFzWFkgPSBmdW5jdGlvbihjYW52YXNYWSwgem9vbSkge1xuICAgICAgICB0aGlzLmNhY2hlLmNhbnZhc1hZID0gY2FudmFzWFk7XG4gICAgICAgIHRoaXMuY2FjaGUuem9vbSA9IHpvb207XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZ2V0Q2FudmFzWFkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuY2FudmFzWFk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMucmVxdWlyZXNSZXByb2plY3Rpb24gPSBmdW5jdGlvbih6b29tKSB7XG4gICAgICBpZiggY2FjaGUuem9vbSA9PSB6b29tICYmIGNhY2hlLmdlb1hZICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgXG4gICAgLy8gb3B0aW9uYWwsIHBlciBmZWF0dXJlLCByZW5kZXJlclxuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0ZlYXR1cmU7IiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmUnKTtcblxuZnVuY3Rpb24gQ2FudmFzRmVhdHVyZXMoZ2VvanNvbikge1xuICAgIC8vIHF1aWNrIHR5cGUgZmxhZ1xuICAgIHRoaXMuaXNDYW52YXNGZWF0dXJlcyA9IHRydWU7XG4gICAgXG4gICAgdGhpcy5jYW52YXNGZWF0dXJlcyA9IFtdO1xuICAgIFxuICAgIC8vIGFjdHVhbCBnZW9qc29uIG9iamVjdCwgd2lsbCBub3QgYmUgbW9kaWZlZCwganVzdCBzdG9yZWRcbiAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgIFxuICAgIC8vIHBlcmZvcm1hbmNlIGZsYWcsIHdpbGwga2VlcCBpbnZpc2libGUgZmVhdHVyZXMgZm9yIHJlY2FsYyBcbiAgICAvLyBldmVudHMgYXMgd2VsbCBhcyBub3QgYmVpbmcgcmVuZGVyZWRcbiAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgIFxuICAgIHRoaXMuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuY2FudmFzRmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzW2ldLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggdGhpcy5nZW9qc29uICkge1xuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZ2VvanNvbi5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzRmVhdHVyZXMucHVzaChuZXcgQ2FudmFzRmVhdHVyZSh0aGlzLmdlb2pzb24uZmVhdHVyZXNbaV0pKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNGZWF0dXJlczsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZScpO1xudmFyIENhbnZhc0ZlYXR1cmVzID0gcmVxdWlyZSgnLi9DYW52YXNGZWF0dXJlcycpO1xuXG5mdW5jdGlvbiBmYWN0b3J5KGFyZykge1xuICAgIGlmKCBBcnJheS5pc0FycmF5KGFyZykgKSB7XG4gICAgICAgIHJldHVybiBhcmcubWFwKGdlbmVyYXRlKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGdlbmVyYXRlKGFyZyk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlKGdlb2pzb24pIHtcbiAgICBpZiggZ2VvanNvbi50eXBlID09PSAnRmVhdHVyZUNvbGxlY3Rpb24nICkge1xuICAgICAgICByZXR1cm4gbmV3IENhbnZhc0ZlYXR1cmVzKGdlb2pzb24pO1xuICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PT0gJ0ZlYXR1cmUnICkge1xuICAgICAgICByZXR1cm4gbmV3IENhbnZhc0ZlYXR1cmUoZ2VvanNvbik7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgR2VvSlNPTjogJytnZW9qc29uLnR5cGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3Rvcnk7IiwidmFyIGN0eDtcblxuLyoqXG4gKiBGdWN0aW9uIGNhbGxlZCBpbiBzY29wZSBvZiBDYW52YXNGZWF0dXJlXG4gKi9cbmZ1bmN0aW9uIHJlbmRlcihjb250ZXh0LCB4eVBvaW50cywgbWFwLCBnZW9qc29uKSB7XG4gICAgY3R4ID0gY29udGV4dDtcbiAgICBcbiAgICBpZiggZ2VvanNvbi5nZW9tZXRyeS50eXBlID09PSAnUG9pbnQnICkge1xuICAgICAgICByZW5kZXJQb2ludCh4eVBvaW50cywgdGhpcy5zaXplKTtcbiAgICB9IGVsc2UgaWYoIGdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgICByZW5kZXJMaW5lKHh5UG9pbnRzKTtcbiAgICB9IGVsc2UgaWYoIGdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvbHlnb24nICkge1xuICAgICAgICByZW5kZXJQb2x5Z29uKHh5UG9pbnRzKTtcbiAgICB9IGVsc2UgaWYoIGdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgIHh5UG9pbnRzLmZvckVhY2gocmVuZGVyUG9seWdvbik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJQb2ludCh4eVBvaW50LCBzaXplKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgY3R4LmFyYyh4eVBvaW50LngsIHh5UG9pbnQueSwgc2l6ZSwgMCwgMiAqIE1hdGguUEksIGZhbHNlKTtcbiAgICBjdHguZmlsbFN0eWxlID0gICdyZ2JhKDAsIDAsIDAsIC4zKSc7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2dyZWVuJztcblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJMaW5lKHh5UG9pbnRzKSB7XG5cbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ29yYW5nZSc7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDAsIDAsIDAsIC4zKSc7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG5cbiAgICB2YXIgajtcbiAgICBjdHgubW92ZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuICAgIGZvciggaiA9IDE7IGogPCB4eVBvaW50cy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgY3R4LmxpbmVUbyh4eVBvaW50c1tqXS54LCB4eVBvaW50c1tqXS55KTtcbiAgICB9XG5cbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUG9seWdvbih4eVBvaW50cykge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnd2hpdGUnO1xuICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgyNTUsIDE1MiwgMCwuOCknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuXG4gICAgdmFyIGo7XG4gICAgY3R4Lm1vdmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcbiAgICBmb3IoIGogPSAxOyBqIDwgeHlQb2ludHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGN0eC5saW5lVG8oeHlQb2ludHNbal0ueCwgeHlQb2ludHNbal0ueSk7XG4gICAgfVxuICAgIGN0eC5saW5lVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSByZW5kZXI7IiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ2FudmFzRmVhdHVyZScpO1xudmFyIENhbnZhc0ZlYXR1cmVzID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmVzJyk7XG5cbmZ1bmN0aW9uIENhbnZhc0xheWVyKCkge1xuICAvLyBzaG93IGxheWVyIHRpbWluZ1xuICB0aGlzLmRlYnVnID0gZmFsc2U7XG5cbiAgLy8gaW5jbHVkZSBldmVudHNcbiAgdGhpcy5pbmNsdWRlcyA9IFtMLk1peGluLkV2ZW50c107XG5cbiAgLy8gbGlzdCBvZiBnZW9qc29uIGZlYXR1cmVzIHRvIGRyYXdcbiAgLy8gICAtIHRoZXNlIHdpbGwgZHJhdyBpbiBvcmRlclxuICB0aGlzLmZlYXR1cmVzID0gW107XG5cbiAgLy8gbGlzdCBvZiBjdXJyZW50IGZlYXR1cmVzIHVuZGVyIHRoZSBtb3VzZVxuICB0aGlzLmludGVyc2VjdExpc3QgPSBbXTtcblxuICAvLyB1c2VkIHRvIGNhbGN1bGF0ZSBwaXhlbHMgbW92ZWQgZnJvbSBjZW50ZXJcbiAgdGhpcy5sYXN0Q2VudGVyTEwgPSBudWxsO1xuXG4gIC8vIGdlb21ldHJ5IGhlbHBlcnNcbiAgdGhpcy51dGlscyA9IHJlcXVpcmUoJy4vbGliL3V0aWxzJyk7XG4gIFxuICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IHRydWU7XG4gIFxuICAvLyByZWNvbW1lbmRlZCB5b3Ugb3ZlcnJpZGUgdGhpcy4gIHlvdSBjYW4gYWxzbyBzZXQgYSBjdXN0b20gcmVuZGVyZXJcbiAgLy8gZm9yIGVhY2ggQ2FudmFzRmVhdHVyZSBpZiB5b3Ugd2lzaFxuICB0aGlzLnJlbmRlcmVyID0gcmVxdWlyZSgnLi9kZWZhdWx0UmVuZGVyZXInKTtcblxuICB0aGlzLmdldENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XG4gIH07XG5cbiAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9O1xuXG4gIHRoaXMuYWRkVG8gPSBmdW5jdGlvbiAobWFwKSB7XG4gICAgbWFwLmFkZExheWVyKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gcmVzZXQgYWN0dWFsIGNhbnZhcyBzaXplXG4gICAgdmFyIHNpemUgPSB0aGlzLl9tYXAuZ2V0U2l6ZSgpO1xuICAgIHRoaXMuX2NhbnZhcy53aWR0aCA9IHNpemUueDtcbiAgICB0aGlzLl9jYW52YXMuaGVpZ2h0ID0gc2l6ZS55O1xuXG4gICAgdGhpcy5jbGVhckNhY2hlKCk7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9O1xuXG4gIC8vIGNsZWFyIGVhY2ggZmVhdHVyZXMgY2FjaGVcbiAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8ga2lsbCB0aGUgZmVhdHVyZSBwb2ludCBjYWNoZVxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBnZXQgbGF5ZXIgZmVhdHVyZSB2aWEgZ2VvanNvbiBvYmplY3RcbiAgdGhpcy5nZXRDYW52YXNGZWF0dXJlRm9yR2VvanNvbiA9IGZ1bmN0aW9uKGdlb2pzb24pIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5mZWF0dXJlc1tpXS5nZW9qc29uID09IGdlb2pzb24gKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZlYXR1cmVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLy8gZ2V0IHRoZSBtZXRlcnMgcGVyIHB4IGFuZCBhIGNlcnRhaW4gcG9pbnQ7XG4gIHRoaXMuZ2V0TWV0ZXJzUGVyUHggPSBmdW5jdGlvbihsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5tZXRlcnNQZXJQeChsYXRsbmcsIHRoaXMuX21hcCk7XG4gIH1cbn07XG5cbnZhciBsYXllciA9IG5ldyBDYW52YXNMYXllcigpO1xuXG5cbnJlcXVpcmUoJy4vbGliL2luaXQnKShsYXllcik7XG5yZXF1aXJlKCcuL2xpYi9yZWRyYXcnKShsYXllcik7XG5yZXF1aXJlKCcuL2xpYi9hZGRGZWF0dXJlJykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvdG9DYW52YXNYWScpKGxheWVyKTtcblxuTC5DYW52YXNGZWF0dXJlRmFjdG9yeSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9mYWN0b3J5Jyk7XG5MLkNhbnZhc0ZlYXR1cmUgPSBDYW52YXNGZWF0dXJlO1xuTC5DYW52YXNGZWF0dXJlQ29sbGVjdGlvbiA9IENhbnZhc0ZlYXR1cmVzO1xuTC5DYW52YXNHZW9qc29uTGF5ZXIgPSBMLkNsYXNzLmV4dGVuZChsYXllcik7XG4iLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4uL2NsYXNzZXMvQ2FudmFzRmVhdHVyZScpO1xudmFyIENhbnZhc0ZlYXR1cmVzID0gcmVxdWlyZSgnLi4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gIGxheWVyLmFkZENhbnZhc0ZlYXR1cmVzID0gZnVuY3Rpb24oZmVhdHVyZXMpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5hZGRDYW52YXNGZWF0dXJlKGZlYXR1cmVzW2ldKTtcbiAgICB9XG4gIH07XG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZSA9IGZ1bmN0aW9uKGZlYXR1cmUsIGJvdHRvbSkge1xuICAgIGlmKCAhKGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlKSAmJiAhKGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlcykgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZlYXR1cmUgbXVzdCBiZSBpbnN0YW5jZSBvZiBDYW52YXNGZWF0dXJlIG9yIENhbnZhc0ZlYXR1cmVzJyk7XG4gICAgfVxuICAgIFxuICAgIGlmKCBmZWF0dXJlIGluc3RhbmNlb2YgQ2FudmFzRmVhdHVyZXMgKSB7XG4gICAgICAgIGZlYXR1cmUuY2FudmFzRmVhdHVyZXMuZm9yRWFjaChmdW5jdGlvbihmKXtcbiAgICAgICAgICAgIHByZXBhcmVDYW52YXNGZWF0dXJlKHRoaXMsIGYpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHByZXBhcmVDYW52YXNGZWF0dXJlKHRoaXMsIGZlYXR1cmUpO1xuICAgIH1cblxuICAgIGlmKCBib3R0b20gKSB7IC8vIGJvdHRvbSBvciBpbmRleFxuICAgICAgaWYoIHR5cGVvZiBib3R0b20gPT09ICdudW1iZXInKSB0aGlzLmZlYXR1cmVzLnNwbGljZShib3R0b20sIDAsIGZlYXR1cmUpO1xuICAgICAgZWxzZSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICB9XG4gIH0sXG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZUJvdHRvbSA9IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICB0aGlzLmFkZEZlYXR1cmUoZmVhdHVyZSwgdHJ1ZSk7XG4gIH07XG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHJlLXJlbmRlciByZXF1aXJlZC4gIGllIHRoZSBmZWF0dXJlIHdhcyB2aXNpYmxlO1xuICBsYXllci5yZW1vdmVDYW52YXNGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZmVhdHVyZXMuaW5kZXhPZihmZWF0dXJlKTtcbiAgICBpZiggaW5kZXggPT0gLTEgKSByZXR1cm47XG5cbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiggdGhpcy5mZWF0dXJlLnZpc2libGUgKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gIFxuICBsYXllci5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVDYW52YXNGZWF0dXJlKGxheWVyLCBjYW52YXNGZWF0dXJlKSB7XG4gICAgdmFyIGdlb21ldHJ5ID0gY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5O1xuICAgIFxuICAgIGlmKCBnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgXG4gICAgICBjYW52YXNGZWF0dXJlLmJvdW5kcyA9IGxheWVyLnV0aWxzLmNhbGNCb3VuZHMoZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuXG4gICAgfSBlbHNlIGlmICggZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAvLyBUT0RPOiB3ZSBvbmx5IHN1cHBvcnQgb3V0ZXIgcmluZ3Mgb3V0IHRoZSBtb21lbnQsIG5vIGlubmVyIHJpbmdzLiAgVGh1cyBjb29yZGluYXRlc1swXVxuICAgICAgY2FudmFzRmVhdHVyZS5ib3VuZHMgPSBsYXllci51dGlscy5jYWxjQm91bmRzKGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcblxuICAgIH0gZWxzZSBpZiAoIGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcbiBcbiAgICAgIGNhbnZhc0ZlYXR1cmUubGF0bG5nID0gTC5sYXRMbmcoZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sIGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcbiAgICBcbiAgICB9IGVsc2UgaWYgKCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgXG4gICAgICBjYW52YXNGZWF0dXJlLmJvdW5kcyA9IFtdO1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBnZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGg7IGkrKyAgKSB7XG4gICAgICAgIGNhbnZhc0ZlYXR1cmUuYm91bmRzLnB1c2gobGF5ZXIudXRpbHMuY2FsY0JvdW5kcyhnZW9tZXRyeS5jb29yZGluYXRlc1tpXVswXSkpO1xuICAgICAgfVxuICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignR2VvSlNPTiBmZWF0dXJlIHR5cGUgXCInK2dlb21ldHJ5LnR5cGUrJ1wiIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgfVxufSIsInZhciBpbnRlcnNlY3RzID0gcmVxdWlyZSgnLi9pbnRlcnNlY3RzJyk7XG52YXIgY291bnQgPSAwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgXG4gICAgbGF5ZXIuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICAgICAgICB0aGlzLmludGVyc2VjdExpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5zaG93aW5nID0gdHJ1ZTtcblxuICAgICAgICAvLyBzZXQgb3B0aW9uc1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gbW92ZSBtb3VzZSBldmVudCBoYW5kbGVycyB0byBsYXllciBzY29wZVxuICAgICAgICB2YXIgbW91c2VFdmVudHMgPSBbJ29uTW91c2VPdmVyJywgJ29uTW91c2VNb3ZlJywgJ29uTW91c2VPdXQnLCAnb25DbGljayddO1xuICAgICAgICBtb3VzZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgaWYoICF0aGlzLm9wdGlvbnNbZV0gKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzW2VdID0gdGhpcy5vcHRpb25zW2VdO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMub3B0aW9uc1tlXTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvLyBzZXQgY2FudmFzIGFuZCBjYW52YXMgY29udGV4dCBzaG9ydGN1dHNcbiAgICAgICAgdGhpcy5fY2FudmFzID0gY3JlYXRlQ2FudmFzKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9jdHggPSB0aGlzLl9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9O1xuICAgIFxuICAgIGxheWVyLm9uQWRkID0gZnVuY3Rpb24obWFwKSB7XG4gICAgICAgIHRoaXMuX21hcCA9IG1hcDtcblxuICAgICAgICAvLyBhZGQgY29udGFpbmVyIHdpdGggdGhlIGNhbnZhcyB0byB0aGUgdGlsZSBwYW5lXG4gICAgICAgIC8vIHRoZSBjb250YWluZXIgaXMgbW92ZWQgaW4gdGhlIG9wb3NpdGUgZGlyZWN0aW9uIG9mIHRoZVxuICAgICAgICAvLyBtYXAgcGFuZSB0byBrZWVwIHRoZSBjYW52YXMgYWx3YXlzIGluICgwLCAwKVxuICAgICAgICAvL3ZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMudGlsZVBhbmU7XG4gICAgICAgIHZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMubWFya2VyUGFuZTtcbiAgICAgICAgdmFyIF9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1sYXllci0nK2NvdW50KTtcbiAgICAgICAgY291bnQrKztcblxuICAgICAgICBfY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2NhbnZhcyk7XG4gICAgICAgIHRpbGVQYW5lLmFwcGVuZENoaWxkKF9jb250YWluZXIpO1xuXG4gICAgICAgIHRoaXMuX2NvbnRhaW5lciA9IF9jb250YWluZXI7XG5cbiAgICAgICAgLy8gaGFjazogbGlzdGVuIHRvIHByZWRyYWcgZXZlbnQgbGF1bmNoZWQgYnkgZHJhZ2dpbmcgdG9cbiAgICAgICAgLy8gc2V0IGNvbnRhaW5lciBpbiBwb3NpdGlvbiAoMCwgMCkgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgICAgIGlmIChtYXAuZHJhZ2dpbmcuZW5hYmxlZCgpKSB7XG4gICAgICAgICAgICBtYXAuZHJhZ2dpbmcuX2RyYWdnYWJsZS5vbigncHJlZHJhZycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG1vdmVTdGFydC5hcHBseSh0aGlzKTtcbiAgICAgICAgICAgICAgICAvL3ZhciBkID0gbWFwLmRyYWdnaW5nLl9kcmFnZ2FibGU7XG4gICAgICAgICAgICAgICAgLy9MLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB7IHg6IC1kLl9uZXdQb3MueCwgeTogLWQuX25ld1Bvcy55IH0pO1xuICAgICAgICAgICAgfSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXAub24oe1xuICAgICAgICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLnJlc2V0LFxuICAgICAgICAgICAgJ3Jlc2l6ZScgICAgOiB0aGlzLnJlc2V0LFxuICAgICAgICAgICAgJ3pvb21zdGFydCcgOiBzdGFydFpvb20sXG4gICAgICAgICAgICAnem9vbWVuZCcgICA6IGVuZFpvb20sXG4gICAgICAgICAgICAnbW92ZXN0YXJ0JyA6IG1vdmVTdGFydCxcbiAgICAgICAgICAgICdtb3ZlZW5kJyAgIDogbW92ZUVuZCxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogaW50ZXJzZWN0cyxcbiAgICAgICAgICAgICdjbGljaycgICAgIDogaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICAgICAgaWYoIHRoaXMuekluZGV4ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLnNldFpJbmRleCh0aGlzLnpJbmRleCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgbGF5ZXIub25SZW1vdmUgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fY29udGFpbmVyLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgbWFwLm9mZih7XG4gICAgICAgICAgICAndmlld3Jlc2V0JyA6IHRoaXMucmVzZXQsXG4gICAgICAgICAgICAncmVzaXplJyAgICA6IHRoaXMucmVzZXQsXG4gICAgICAgICAgICAnbW92ZXN0YXJ0JyA6IG1vdmVTdGFydCxcbiAgICAgICAgICAgICdtb3ZlZW5kJyAgIDogbW92ZUVuZCxcbiAgICAgICAgICAgICd6b29tc3RhcnQnIDogc3RhcnRab29tLFxuICAgICAgICAgICAgJ3pvb21lbmQnICAgOiBlbmRab29tLFxuICAgICAgICAgICAgJ21vdXNlbW92ZScgOiBpbnRlcnNlY3RzLFxuICAgICAgICAgICAgJ2NsaWNrJyAgICAgOiBpbnRlcnNlY3RzXG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2FudmFzKG9wdGlvbnMpIHtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBjYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICBjYW52YXMuc3R5bGUubGVmdCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcIm5vbmVcIjtcbiAgICBjYW52YXMuc3R5bGUuekluZGV4ID0gb3B0aW9ucy56SW5kZXggfHwgMDtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtdGlsZS1jb250YWluZXIgbGVhZmxldC16b29tLWFuaW1hdGVkJztcbiAgICBjYW52YXMuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIGNhbnZhcztcbn1cblxuZnVuY3Rpb24gc3RhcnRab29tKCkge1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgdGhpcy56b29taW5nID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZW5kWm9vbSgpIHtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KHRoaXMucmVuZGVyLmJpbmQodGhpcyksIDUwKTtcbn1cblxuZnVuY3Rpb24gbW92ZVN0YXJ0KCkge1xuICAgIGlmKCAhdGhpcy5hbGxvd1BhblJlbmRlcmluZyApIHJldHVybjtcbiAgICBpZiggdGhpcy5tb3ZpbmcgKSByZXR1cm47XG4gICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgIFxuICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWVSZW5kZXIuYmluZCh0aGlzKSk7XG59XG5cbmZ1bmN0aW9uIG1vdmVFbmQoZSkge1xuICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZW5kZXIoZSk7XG59O1xuXG5mdW5jdGlvbiBmcmFtZVJlbmRlcigpIHtcbiAgICBpZiggIXRoaXMubW92aW5nICkgcmV0dXJuO1xuXG4gICAgdmFyIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICAgIFxuICAgIGNvbnNvbGUubG9nKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCk7XG4gICAgaWYoIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCA+IDc1ICkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGlzYWJsZWQgcmVuZGVyaW5nIHdoaWxlIHBhbmluZycpO1xuICAgICAgICB0aGlzLmFsbG93UGFuUmVuZGVyaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICBpZiggIXRoaXMubW92aW5nICkgcmV0dXJuO1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVuZGVyLmJpbmQodGhpcykpO1xuICAgIH0uYmluZCh0aGlzKSwgNzUwKTtcbn0iLCIvKiogXG4gKiBIYW5kbGUgbW91c2UgaW50ZXJzZWN0aW9uIGV2ZW50c1xuICogZSAtIGxlYWZsZXQgZXZlbnRcbiAqKi9cbmZ1bmN0aW9uIGludGVyc2VjdHMoZSkge1xuICAgIGlmKCAhdGhpcy5zaG93aW5nICkgcmV0dXJuO1xuXG4gICAgdmFyIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgbXBwID0gdGhpcy5nZXRNZXRlcnNQZXJQeChlLmxhdGxuZyk7XG4gICAgdmFyIHIgPSBtcHAgKiA1OyAvLyA1IHB4IHJhZGl1cyBidWZmZXI7XG5cbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgdHlwZSA6ICdQb2ludCcsXG4gICAgICBjb29yZGluYXRlcyA6IFtlLmxhdGxuZy5sbmcsIGUubGF0bG5nLmxhdF1cbiAgICB9O1xuXG4gICAgdmFyIGY7XG4gICAgdmFyIGludGVyc2VjdHMgPSBbXTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGYgPSB0aGlzLmZlYXR1cmVzW2ldO1xuXG4gICAgICBpZiggIWYudmlzaWJsZSApIGNvbnRpbnVlO1xuICAgICAgaWYoICFmLmdlb2pzb24uZ2VvbWV0cnkgKSBjb250aW51ZTtcbiAgICAgIGlmKCAhZi5nZXRDYW52YXNYWSgpICkgY29udGludWU7XG4gICAgICBpZiggIWlzSW5Cb3VuZHMoZiwgZS5sYXRsbmcpICkgY29udGludWU7XG5cbiAgICAgIGlmKCB0aGlzLnV0aWxzLmdlb21ldHJ5V2l0aGluUmFkaXVzKGYuZ2VvanNvbi5nZW9tZXRyeSwgZi5nZXRDYW52YXNYWSgpLCBjZW50ZXIsIGUuY29udGFpbmVyUG9pbnQsIGYuc2l6ZSA/IChmLnNpemUgKiBtcHApIDogcikgKSB7XG4gICAgICAgIGludGVyc2VjdHMucHVzaChmLmdlb2pzb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBlLnR5cGUgPT0gJ2NsaWNrJyAmJiB0aGlzLm9uQ2xpY2sgKSB7XG4gICAgICB0aGlzLm9uQ2xpY2soaW50ZXJzZWN0cyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1vdXNlb3ZlciA9IFtdLCBtb3VzZW91dCA9IFtdLCBtb3VzZW1vdmUgPSBbXTtcblxuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuaW50ZXJzZWN0TGlzdC5pbmRleE9mKGludGVyc2VjdHNbaV0pID4gLTEgKSB7XG4gICAgICAgIG1vdXNlbW92ZS5wdXNoKGludGVyc2VjdHNbaV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdXNlb3Zlci5wdXNoKGludGVyc2VjdHNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5pbnRlcnNlY3RMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIGludGVyc2VjdHMuaW5kZXhPZih0aGlzLmludGVyc2VjdExpc3RbaV0pID09IC0xICkge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgbW91c2VvdXQucHVzaCh0aGlzLmludGVyc2VjdExpc3RbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaW50ZXJzZWN0TGlzdCA9IGludGVyc2VjdHM7XG5cbiAgICBpZiggdGhpcy5vbk1vdXNlT3ZlciAmJiBtb3VzZW92ZXIubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU92ZXIuY2FsbCh0aGlzLCBtb3VzZW92ZXIsIGUpO1xuICAgIGlmKCB0aGlzLm9uTW91c2VNb3ZlICkgdGhpcy5vbk1vdXNlTW92ZS5jYWxsKHRoaXMsIG1vdXNlbW92ZSwgZSk7IC8vIGFsd2F5cyBmaXJlXG4gICAgaWYoIHRoaXMub25Nb3VzZU91dCAmJiBtb3VzZW91dC5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlT3V0LmNhbGwodGhpcywgbW91c2VvdXQsIGUpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZygnaW50ZXJzZWN0cyB0aW1lOiAnKyhuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQpKydtcycpO1xuXG4gICAgaWYoIGNoYW5nZWQgKSB0aGlzLnJlbmRlcigpO1xuICB9XG5cblxuZnVuY3Rpb24gaXNJbkJvdW5kcyhmZWF0dXJlLCBsYXRsbmcpIHtcbiAgICBpZiggZmVhdHVyZS5ib3VuZHMgKSB7XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KGZlYXR1cmUuYm91bmRzKSApIHtcblxuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmUuYm91bmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgaWYoIGZlYXR1cmUuYm91bmRzW2ldLmNvbnRhaW5zKGxhdGxuZykgKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuYm91bmRzLmNvbnRhaW5zKGxhdGxuZykgKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RzOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBcbiAgbGF5ZXIucmVuZGVyID0gZnVuY3Rpb24oZSkge1xuICAgIGlmKCAhdGhpcy5hbGxvd1BhblJlbmRlcmluZyAmJiB0aGlzLm1vdmluZyApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdCwgZGlmZlxuICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgICB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfVxuXG4gICAgdmFyIGRpZmYgPSBudWxsO1xuICAgIGlmKCBlICYmIGUudHlwZSA9PSAnbW92ZWVuZCcgKSB7XG4gICAgICB2YXIgY2VudGVyID0gdGhpcy5fbWFwLmdldENlbnRlcigpO1xuXG4gICAgICB2YXIgcHQgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChjZW50ZXIpO1xuICAgICAgaWYoIHRoaXMubGFzdENlbnRlckxMICkge1xuICAgICAgICB2YXIgbGFzdFh5ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQodGhpcy5sYXN0Q2VudGVyTEwpO1xuICAgICAgICBkaWZmID0ge1xuICAgICAgICAgIHggOiBsYXN0WHkueCAtIHB0LngsXG4gICAgICAgICAgeSA6IGxhc3RYeS55IC0gcHQueVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGFzdENlbnRlckxMID0gY2VudGVyO1xuICAgIH1cblxuICAgIHZhciB0b3BMZWZ0ID0gdGhpcy5fbWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2NhbnZhcywgdG9wTGVmdCk7XG5cbiAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICB2YXIgY3R4ID0gdGhpcy5fY3R4O1xuXG4gICAgLy8gY2xlYXIgY2FudmFzXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgaWYoICF0aGlzLnpvb21pbmcgKSB7XG4gICAgICAgIHRoaXMucmVkcmF3KGRpZmYpO1xuICAgIH1cblxuICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgZGlmZiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdDtcblxuICAgICAgdmFyIGMgPSAwO1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggIXRoaXMuZmVhdHVyZXNbaV0uY2FjaGUuZ2VvWFkgKSBjb250aW51ZTtcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkodGhpcy5mZWF0dXJlc1tpXS5jYWNoZS5nZW9YWSkgKSBjICs9IHRoaXMuZmVhdHVyZXNbaV0uY2FjaGUuZ2VvWFkubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZygnUmVuZGVyZWQgJytjKycgcHRzIGluICcrZGlmZisnbXMnKTtcbiAgICB9XG4gIH0sXG4gICAgXG5cbiAgLy8gcmVkcmF3IGFsbCBmZWF0dXJlcy4gIFRoaXMgZG9lcyBub3QgaGFuZGxlIGNsZWFyaW5nIHRoZSBjYW52YXMgb3Igc2V0dGluZ1xuICAvLyB0aGUgY2FudmFzIGNvcnJlY3QgcG9zaXRpb24uICBUaGF0IGlzIGhhbmRsZWQgYnkgcmVuZGVyXG4gIGxheWVyLnJlZHJhdyA9IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIC8vIG9iamVjdHMgc2hvdWxkIGtlZXAgdHJhY2sgb2YgbGFzdCBiYm94IGFuZCB6b29tIG9mIG1hcFxuICAgIC8vIGlmIHRoaXMgaGFzbid0IGNoYW5nZWQgdGhlIGxsIC0+IGNvbnRhaW5lciBwdCBpcyBub3QgbmVlZGVkXG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuX21hcC5nZXRCb3VuZHMoKTtcbiAgICB2YXIgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBcbiAgICB2YXIgZiwgaSwgajtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBmID0gdGhpcy5mZWF0dXJlc1tpXTtcbiAgICAgIGlmKCBmLmlzQ2FudmFzRmVhdHVyZXMgKSB7XG4gICAgICAgIGZvciggaiA9IDA7IGogPCBmLmNhbnZhc0ZlYXR1cmVzLmxlbmd0aDsgaisrICkge1xuICAgICAgICAgIHRoaXMucmVkcmF3RmVhdHVyZShmLmNhbnZhc0ZlYXR1cmVzW2pdLCBib3VuZHMsIHpvb20sIGRpZmYpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUoZiwgYm91bmRzLCB6b29tLCBkaWZmKTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coJ1JlbmRlciB0aW1lOiAnKyhuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQpKydtczsgYXZnOiAnK1xuICAgICAgKChuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQpIC8gdGhpcy5mZWF0dXJlcy5sZW5ndGgpKydtcycpO1xuICB9LFxuXG5cblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIGxheWVyLnJlZHJhd0ZlYXR1cmUgPSBmdW5jdGlvbihjYW52YXNGZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYpIHtcbiAgICAvL2lmKCBmZWF0dXJlLmdlb2pzb24ucHJvcGVydGllcy5kZWJ1ZyApIGRlYnVnZ2VyO1xuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIGZsYWdnZWQgYXMgaGlkZGVuXG4gICAgLy8gd2UgZG8gbmVlZCB0byBjbGVhciB0aGUgY2FjaGUgaW4gdGhpcyBjYXNlXG4gICAgaWYoICFjYW52YXNGZWF0dXJlLnZpc2libGUgKSB7XG4gICAgICBjYW52YXNGZWF0dXJlLmNsZWFyQ2FjaGUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBub3cgbGV0cyBjaGVjayBjYWNoZSB0byBzZWUgaWYgd2UgbmVlZCB0byByZXByb2plY3QgdGhlXG4gICAgLy8geHkgY29vcmRpbmF0ZXNcbiAgICAvLyBhY3R1YWxseSBwcm9qZWN0IHRvIHh5IGlmIG5lZWRlZFxuICAgIHZhciByZXByb2plY3QgPSBjYW52YXNGZWF0dXJlLnJlcXVpcmVzUmVwcm9qZWN0aW9uKHpvb20pO1xuICAgIGlmKCByZXByb2plY3QgKSB7XG4gICAgICB0aGlzLnRvQ2FudmFzWFkoY2FudmFzRmVhdHVyZSwgem9vbSk7XG4gICAgfSAgLy8gZW5kIHJlcHJvamVjdFxuXG4gICAgLy8gaWYgdGhpcyB3YXMgYSBzaW1wbGUgcGFuIGV2ZW50IChhIGRpZmYgd2FzIHByb3ZpZGVkKSBhbmQgd2UgZGlkIG5vdCByZXByb2plY3RcbiAgICAvLyBtb3ZlIHRoZSBmZWF0dXJlIGJ5IGRpZmYgeC95XG4gICAgaWYoIGRpZmYgJiYgIXJlcHJvamVjdCApIHtcbiAgICAgIGlmKCBjYW52YXNGZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgIGNhbnZhc0ZlYXR1cmUuY2FjaGUuZ2VvWFkueCArPSBkaWZmLng7XG4gICAgICAgIGNhbnZhc0ZlYXR1cmUuY2FjaGUuZ2VvWFkueSArPSBkaWZmLnk7XG5cbiAgICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuXG4gICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoY2FudmFzRmVhdHVyZS5jYWNoZS5nZW9YWSwgZGlmZik7XG5cbiAgICAgIH0gZWxzZSBpZiAoIGNhbnZhc0ZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgIFxuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGNhbnZhc0ZlYXR1cmUuY2FjaGUuZ2VvWFksIGRpZmYpO1xuICAgICAgXG4gICAgICB9IGVsc2UgaWYgKCBjYW52YXNGZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgICBcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjYW52YXNGZWF0dXJlLmNhY2hlLmdlb1hZLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoY2FudmFzRmVhdHVyZS5jYWNoZS5nZW9YWVtpXSwgZGlmZik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZ25vcmUgYW55dGhpbmcgbm90IGluIGJvdW5kc1xuICAgIGlmKCBjYW52YXNGZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuICAgICAgaWYoICFib3VuZHMuY29udGFpbnMoY2FudmFzRmVhdHVyZS5sYXRsbmcpICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJyApIHtcblxuICAgICAgLy8ganVzdCBtYWtlIHN1cmUgYXQgbGVhc3Qgb25lIHBvbHlnb24gaXMgd2l0aGluIHJhbmdlXG4gICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgY2FudmFzRmVhdHVyZS5ib3VuZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmKCBib3VuZHMuY29udGFpbnMoY2FudmFzRmVhdHVyZS5ib3VuZHNbaV0pIHx8IGJvdW5kcy5pbnRlcnNlY3RzKGNhbnZhc0ZlYXR1cmUuYm91bmRzW2ldKSApIHtcbiAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmKCAhZm91bmQgKSByZXR1cm47XG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoICFib3VuZHMuY29udGFpbnMoY2FudmFzRmVhdHVyZS5ib3VuZHMpICYmICFib3VuZHMuaW50ZXJzZWN0cyhjYW52YXNGZWF0dXJlLmJvdW5kcykgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgdmFyIHJlbmRlcmVyID0gY2FudmFzRmVhdHVyZS5yZW5kZXJlciA/IGNhbnZhc0ZlYXR1cmUucmVuZGVyZXIgOiB0aGlzLnJlbmRlcmVyO1xuICAgIFxuICAgIC8vIGNhbGwgZmVhdHVyZSByZW5kZXIgZnVuY3Rpb24gaW4gZmVhdHVyZSBzY29wZTsgZmVhdHVyZSBpcyBwYXNzZWQgYXMgd2VsbFxuICAgIHJlbmRlcmVyLmNhbGwoXG4gICAgICAgIGNhbnZhc0ZlYXR1cmUsIC8vIHNjb3BlXG4gICAgICAgIHRoaXMuX2N0eCwgXG4gICAgICAgIGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKSwgXG4gICAgICAgIHRoaXMuX21hcCwgXG4gICAgICAgIGNhbnZhc0ZlYXR1cmUuZ2VvanNvblxuICAgICk7XG4gIH07XG59IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgIGxheWVyLnRvQ2FudmFzWFkgPSBmdW5jdGlvbihmZWF0dXJlLCB6b29tKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgY2FjaGUgbmFtZXNwYWNlIGFuZCBzZXQgdGhlIHpvb20gbGV2ZWxcbiAgICAgICAgaWYoICFmZWF0dXJlLmNhY2hlICkgZmVhdHVyZS5jYWNoZSA9IHt9O1xuICAgICAgICB2YXIgY2FudmFzWFk7XG5cbiAgICAgICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgICAgY2FudmFzWFkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgICBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sXG4gICAgICAgICAgICBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1cbiAgICAgICAgXSk7XG5cbiAgICAgICAgaWYoIGZlYXR1cmUuc2l6ZSApIHtcbiAgICAgICAgICAgIGNhbnZhc1hZWzBdID0gY2FudmFzWFlbMF0gLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgICAgICAgY2FudmFzWFlbMV0gPSBjYW52YXNYWVsxXSAtIGZlYXR1cmUuc2l6ZSAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgICAgIFxuICAgICAgICBjYW52YXNYWSA9IHRoaXMudXRpbHMucHJvamVjdExpbmUoZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzLCB0aGlzLl9tYXApO1xuICAgICAgICB0cmltQ2FudmFzWFkoY2FudmFzWFkpO1xuICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAgIFxuICAgICAgICBjYW52YXNYWSA9IHRoaXMudXRpbHMucHJvamVjdExpbmUoZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLCB0aGlzLl9tYXApO1xuICAgICAgICB0cmltQ2FudmFzWFkoY2FudmFzWFkpO1xuICAgICAgICBcbiAgICAgICAgfSBlbHNlIGlmICggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgICAgICBjYW52YXNYWSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIHZhciB4eSA9IHRoaXMudXRpbHMucHJvamVjdExpbmUoZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzW2ldWzBdLCB0aGlzLl9tYXApO1xuICAgICAgICAgICAgICAgIHRyaW1DYW52YXNYWSh4eSk7XG4gICAgICAgICAgICAgICAgY2FudmFzWFkucHVzaCh4eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZlYXR1cmUuc2V0Q2FudmFzWFkoY2FudmFzWFksIHpvb20pO1xuICAgIH07XG59XG5cbi8vIGdpdmVuIGFuIGFycmF5IG9mIGdlbyB4eSBjb29yZGluYXRlcywgbWFrZSBzdXJlIGVhY2ggcG9pbnQgaXMgYXQgbGVhc3QgbW9yZSB0aGFuIDFweCBhcGFydFxuZnVuY3Rpb24gdHJpbUNhbnZhc1hZKHh5KSB7XG4gICAgaWYoIHh5Lmxlbmd0aCA9PT0gMCApIHJldHVybjtcbiAgICB2YXIgbGFzdCA9IHh5W3h5Lmxlbmd0aC0xXSwgaSwgcG9pbnQ7XG5cbiAgICB2YXIgYyA9IDA7XG4gICAgZm9yKCBpID0geHkubGVuZ3RoLTI7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICBwb2ludCA9IHh5W2ldO1xuICAgICAgICBpZiggTWF0aC5hYnMobGFzdC54IC0gcG9pbnQueCkgPT09IDAgJiYgTWF0aC5hYnMobGFzdC55IC0gcG9pbnQueSkgPT09IDAgKSB7XG4gICAgICAgICAgICB4eS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBjKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0ID0gcG9pbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggeHkubGVuZ3RoIDw9IDEgKSB7XG4gICAgICAgIHh5LnB1c2gobGFzdCk7XG4gICAgICAgIGMtLTtcbiAgICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBtb3ZlTGluZSA6IGZ1bmN0aW9uKGNvb3JkcywgZGlmZikge1xuICAgIHZhciBpOyBsZW4gPSBjb29yZHMubGVuZ3RoO1xuICAgIGZvciggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgIGNvb3Jkc1tpXS54ICs9IGRpZmYueDtcbiAgICAgIGNvb3Jkc1tpXS55ICs9IGRpZmYueTtcbiAgICB9XG4gIH0sXG5cbiAgcHJvamVjdExpbmUgOiBmdW5jdGlvbihjb29yZHMsIG1hcCkge1xuICAgIHZhciB4eUxpbmUgPSBbXTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgeHlMaW5lLnB1c2gobWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoW1xuICAgICAgICAgIGNvb3Jkc1tpXVsxXSwgY29vcmRzW2ldWzBdXG4gICAgICBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHh5TGluZTtcbiAgfSxcblxuICBjYWxjQm91bmRzIDogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgdmFyIHhtaW4gPSBjb29yZHNbMF1bMV07XG4gICAgdmFyIHhtYXggPSBjb29yZHNbMF1bMV07XG4gICAgdmFyIHltaW4gPSBjb29yZHNbMF1bMF07XG4gICAgdmFyIHltYXggPSBjb29yZHNbMF1bMF07XG5cbiAgICBmb3IoIHZhciBpID0gMTsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB4bWluID4gY29vcmRzW2ldWzFdICkgeG1pbiA9IGNvb3Jkc1tpXVsxXTtcbiAgICAgIGlmKCB4bWF4IDwgY29vcmRzW2ldWzFdICkgeG1heCA9IGNvb3Jkc1tpXVsxXTtcblxuICAgICAgaWYoIHltaW4gPiBjb29yZHNbaV1bMF0gKSB5bWluID0gY29vcmRzW2ldWzBdO1xuICAgICAgaWYoIHltYXggPCBjb29yZHNbaV1bMF0gKSB5bWF4ID0gY29vcmRzW2ldWzBdO1xuICAgIH1cblxuICAgIHZhciBzb3V0aFdlc3QgPSBMLmxhdExuZyh4bWluLS4wMSwgeW1pbi0uMDEpO1xuICAgIHZhciBub3J0aEVhc3QgPSBMLmxhdExuZyh4bWF4Ky4wMSwgeW1heCsuMDEpO1xuXG4gICAgcmV0dXJuIEwubGF0TG5nQm91bmRzKHNvdXRoV2VzdCwgbm9ydGhFYXN0KTtcbiAgfSxcblxuICBnZW9tZXRyeVdpdGhpblJhZGl1cyA6IGZ1bmN0aW9uKGdlb21ldHJ5LCB4eVBvaW50cywgY2VudGVyLCB4eVBvaW50LCByYWRpdXMpIHtcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludERpc3RhbmNlKGdlb21ldHJ5LCBjZW50ZXIpIDw9IHJhZGl1cztcbiAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuXG4gICAgICBmb3IoIHZhciBpID0gMTsgaSA8IHh5UG9pbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggdGhpcy5saW5lSW50ZXJzZWN0c0NpcmNsZSh4eVBvaW50c1tpLTFdLCB4eVBvaW50c1tpXSwgeHlQb2ludCwgMykgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgfHwgZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnRJblBvbHlnb24oY2VudGVyLCBnZW9tZXRyeSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIGh0dHA6Ly9tYXRoLnN0YWNrZXhjaGFuZ2UuY29tL3F1ZXN0aW9ucy8yNzU1MjkvY2hlY2staWYtbGluZS1pbnRlcnNlY3RzLXdpdGgtY2lyY2xlcy1wZXJpbWV0ZXJcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRGlzdGFuY2VfZnJvbV9hX3BvaW50X3RvX2FfbGluZVxuICAvLyBbbG5nIHgsIGxhdCwgeV1cbiAgbGluZUludGVyc2VjdHNDaXJjbGUgOiBmdW5jdGlvbihsaW5lUDEsIGxpbmVQMiwgcG9pbnQsIHJhZGl1cykge1xuICAgIHZhciBkaXN0YW5jZSA9XG4gICAgICBNYXRoLmFicyhcbiAgICAgICAgKChsaW5lUDIueSAtIGxpbmVQMS55KSpwb2ludC54KSAtICgobGluZVAyLnggLSBsaW5lUDEueCkqcG9pbnQueSkgKyAobGluZVAyLngqbGluZVAxLnkpIC0gKGxpbmVQMi55KmxpbmVQMS54KVxuICAgICAgKSAvXG4gICAgICBNYXRoLnNxcnQoXG4gICAgICAgIE1hdGgucG93KGxpbmVQMi55IC0gbGluZVAxLnksIDIpICsgTWF0aC5wb3cobGluZVAyLnggLSBsaW5lUDEueCwgMilcbiAgICAgICk7XG4gICAgcmV0dXJuIGRpc3RhbmNlIDw9IHJhZGl1cztcbiAgfSxcblxuICAvLyBodHRwOi8vd2lraS5vcGVuc3RyZWV0bWFwLm9yZy93aWtpL1pvb21fbGV2ZWxzXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1NDUwOTgvbGVhZmxldC1jYWxjdWxhdGluZy1tZXRlcnMtcGVyLXBpeGVsLWF0LXpvb20tbGV2ZWxcbiAgbWV0ZXJzUGVyUHggOiBmdW5jdGlvbihsbCwgbWFwKSB7XG4gICAgdmFyIHBvaW50QyA9IG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGxsKTsgLy8gY29udmVydCB0byBjb250YWluZXJwb2ludCAocGl4ZWxzKVxuICAgIHZhciBwb2ludFggPSBbcG9pbnRDLnggKyAxLCBwb2ludEMueV07IC8vIGFkZCBvbmUgcGl4ZWwgdG8geFxuXG4gICAgLy8gY29udmVydCBjb250YWluZXJwb2ludHMgdG8gbGF0bG5nJ3NcbiAgICB2YXIgbGF0TG5nQyA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50Qyk7XG4gICAgdmFyIGxhdExuZ1ggPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludFgpO1xuXG4gICAgdmFyIGRpc3RhbmNlWCA9IGxhdExuZ0MuZGlzdGFuY2VUbyhsYXRMbmdYKTsgLy8gY2FsY3VsYXRlIGRpc3RhbmNlIGJldHdlZW4gYyBhbmQgeCAobGF0aXR1ZGUpXG4gICAgcmV0dXJuIGRpc3RhbmNlWDtcbiAgfSxcblxuICAvLyBmcm9tIGh0dHA6Ly93d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvbGF0bG9uZy5odG1sXG4gIHBvaW50RGlzdGFuY2UgOiBmdW5jdGlvbiAocHQxLCBwdDIpIHtcbiAgICB2YXIgbG9uMSA9IHB0MS5jb29yZGluYXRlc1swXSxcbiAgICAgIGxhdDEgPSBwdDEuY29vcmRpbmF0ZXNbMV0sXG4gICAgICBsb24yID0gcHQyLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MiA9IHB0Mi5jb29yZGluYXRlc1sxXSxcbiAgICAgIGRMYXQgPSB0aGlzLm51bWJlclRvUmFkaXVzKGxhdDIgLSBsYXQxKSxcbiAgICAgIGRMb24gPSB0aGlzLm51bWJlclRvUmFkaXVzKGxvbjIgLSBsb24xKSxcbiAgICAgIGEgPSBNYXRoLnBvdyhNYXRoLnNpbihkTGF0IC8gMiksIDIpICsgTWF0aC5jb3ModGhpcy5udW1iZXJUb1JhZGl1cyhsYXQxKSlcbiAgICAgICAgKiBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDIpKSAqIE1hdGgucG93KE1hdGguc2luKGRMb24gLyAyKSwgMiksXG4gICAgICBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMSAtIGEpKTtcbiAgICByZXR1cm4gKDYzNzEgKiBjKSAqIDEwMDA7IC8vIHJldHVybnMgbWV0ZXJzXG4gIH0sXG5cbiAgcG9pbnRJblBvbHlnb24gOiBmdW5jdGlvbiAocCwgcG9seSkge1xuICAgIHZhciBjb29yZHMgPSAocG9seS50eXBlID09IFwiUG9seWdvblwiKSA/IFsgcG9seS5jb29yZGluYXRlcyBdIDogcG9seS5jb29yZGluYXRlc1xuXG4gICAgdmFyIGluc2lkZUJveCA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnBvaW50SW5Cb3VuZGluZ0JveChwLCB0aGlzLmJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3Jkcyhjb29yZHNbaV0pKSkgaW5zaWRlQm94ID0gdHJ1ZVxuICAgIH1cbiAgICBpZiAoIWluc2lkZUJveCkgcmV0dXJuIGZhbHNlXG5cbiAgICB2YXIgaW5zaWRlUG9seSA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnBucG9seShwLmNvb3JkaW5hdGVzWzFdLCBwLmNvb3JkaW5hdGVzWzBdLCBjb29yZHNbaV0pKSBpbnNpZGVQb2x5ID0gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVQb2x5XG4gIH0sXG5cbiAgcG9pbnRJbkJvdW5kaW5nQm94IDogZnVuY3Rpb24gKHBvaW50LCBib3VuZHMpIHtcbiAgICByZXR1cm4gIShwb2ludC5jb29yZGluYXRlc1sxXSA8IGJvdW5kc1swXVswXSB8fCBwb2ludC5jb29yZGluYXRlc1sxXSA+IGJvdW5kc1sxXVswXSB8fCBwb2ludC5jb29yZGluYXRlc1swXSA8IGJvdW5kc1swXVsxXSB8fCBwb2ludC5jb29yZGluYXRlc1swXSA+IGJvdW5kc1sxXVsxXSlcbiAgfSxcblxuICBib3VuZGluZ0JveEFyb3VuZFBvbHlDb29yZHMgOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICB2YXIgeEFsbCA9IFtdLCB5QWxsID0gW11cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICB4QWxsLnB1c2goY29vcmRzWzBdW2ldWzFdKVxuICAgICAgeUFsbC5wdXNoKGNvb3Jkc1swXVtpXVswXSlcbiAgICB9XG5cbiAgICB4QWxsID0geEFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgeUFsbCA9IHlBbGwuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiBhIC0gYiB9KVxuXG4gICAgcmV0dXJuIFsgW3hBbGxbMF0sIHlBbGxbMF1dLCBbeEFsbFt4QWxsLmxlbmd0aCAtIDFdLCB5QWxsW3lBbGwubGVuZ3RoIC0gMV1dIF1cbiAgfSxcblxuICAvLyBQb2ludCBpbiBQb2x5Z29uXG4gIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWwjTGlzdGluZyB0aGUgVmVydGljZXNcbiAgcG5wb2x5IDogZnVuY3Rpb24oeCx5LGNvb3Jkcykge1xuICAgIHZhciB2ZXJ0ID0gWyBbMCwwXSBdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb29yZHNbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVtqXSlcbiAgICAgIH1cbiAgICAgIHZlcnQucHVzaChjb29yZHNbaV1bMF0pXG4gICAgICB2ZXJ0LnB1c2goWzAsMF0pXG4gICAgfVxuXG4gICAgdmFyIGluc2lkZSA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSB2ZXJ0Lmxlbmd0aCAtIDE7IGkgPCB2ZXJ0Lmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgaWYgKCgodmVydFtpXVswXSA+IHkpICE9ICh2ZXJ0W2pdWzBdID4geSkpICYmICh4IDwgKHZlcnRbal1bMV0gLSB2ZXJ0W2ldWzFdKSAqICh5IC0gdmVydFtpXVswXSkgLyAodmVydFtqXVswXSAtIHZlcnRbaV1bMF0pICsgdmVydFtpXVsxXSkpIGluc2lkZSA9ICFpbnNpZGVcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zaWRlXG4gIH0sXG5cbiAgbnVtYmVyVG9SYWRpdXMgOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgcmV0dXJuIG51bWJlciAqIE1hdGguUEkgLyAxODA7XG4gIH1cbn07XG4iXX0=
