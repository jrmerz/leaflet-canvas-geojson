(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
  A Feature should have the following:

  feature = {
    visible : Boolean,
    size : Number, // points only, used for mouse interactions
    geojson : {}
    render : function(context, coordinatesInXY, map) {} // called in feature scope
  }

  geoXY and leaflet will be assigned
**/

L.CanvasGeojsonLayer = L.Class.extend({
  // show layer timing
  debug : false,

  // include events
  includes: [L.Mixin.Events],

  // list of geojson features to draw
  //   - these will draw in order
  features : [],

  // list of current features under the mouse
  intersectList : [],

  // used to calculate pixels moved from center
  lastCenterLL : null,

  // geometry helpers
  utils : require('./utils'),

  // initialize layer
  initialize: function (options) {
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
    this._canvas = this._createCanvas();
    this._ctx = this._canvas.getContext('2d');
  },

  _createCanvas: function() {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = this.options.zIndex || 0;
    var className = 'leaflet-tile-container leaflet-zoom-animated';
    canvas.setAttribute('class', className);
    return canvas;
  },

  onAdd: function (map) {
    this._map = map;

    // add container with the canvas to the tile pane
    // the container is moved in the oposite direction of the
    // map pane to keep the canvas always in (0, 0)
    var tilePane = this._map._panes.tilePane;
    var _container = L.DomUtil.create('div', 'leaflet-layer');

    _container.appendChild(this._canvas);
    tilePane.appendChild(_container);

    this._container = _container;

    // hack: listen to predrag event launched by dragging to
    // set container in position (0, 0) in screen coordinates
    if (map.dragging.enabled()) {
      map.dragging._draggable.on('predrag', function() {
        var d = map.dragging._draggable;
        L.DomUtil.setPosition(this._canvas, { x: -d._newPos.x, y: -d._newPos.y });
      }, this);
    }

    map.on({
      'viewreset' : this._reset,
      'resize'    : this._reset,
      'move'      : this.render,
      'zoomstart' : this._startZoom,
      'zoomend'   : this._endZoom,
      'mousemove' : this._intersects,
      'click'     : this._intersects
    }, this);

    this._reset();
  },

  _startZoom: function() {
    this._canvas.style.visibility = 'hidden';
    this.zooming = true;
  },

  _endZoom: function () {
    this._canvas.style.visibility = 'visible';
    this.zooming = false;
    setTimeout(this.render.bind(this), 50);
  },

  getCanvas: function() {
    return this._canvas;
  },

  draw: function() {
    this._reset();
  },

  onRemove: function (map) {
    this._container.parentNode.removeChild(this._container);
    map.off({
      'viewreset' : this._reset,
      'resize'    : this._reset,
      'move'      : this.render,
      'zoomstart' : this._startZoom,
      'zoomend'   : this._endZoom,
      'mousemove' : this._intersects,
      'click'     : this._intersects
    }, this);
  },

  addTo: function (map) {
    map.addLayer(this);
    return this;
  },

  _reset: function () {
    // reset actual canvas size
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;

    this.clearCache();

    this.render();
  },

  // clear each features cache
  clearCache : function() {
    // kill the feature point cache
    for( var i = 0; i < this.features.length; i++ ) {
      this.features[i].cache.geoXY = null;
    }
  },

  // redraw all features.  This does not handle clearing the canvas or setting
  // the canvas correct position.  That is handled by render
  redraw: function(diff) {
    // objects should keep track of last bbox and zoom of map
    // if this hasn't changed the ll -> container pt is not needed

    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    var t;
    if( this.debug ) t = new Date().getTime();
    for( var i = 0; i < this.features.length; i++ ) {
      this.redrawFeature(this.features[i], bounds, zoom, diff);
    }

    if( this.debug ) console.log('Render time: '+(new Date().getTime() - t)+'ms');
  },

  // redraw an individual feature
  redrawFeature : function(feature, bounds, zoom, diff) {
    // ignore anything flagged as hidden
    if( !feature.visible ) return;

    // now lets check cache to see if we need to reproject the
    // xy coordinates
    var reproject = true;
    if( feature.cache ) {
      if( feature.cache.zoom == zoom && feature.cache.geoXY ) {
        reproject = false;
      }
    }

    // actually project to xy if needed
    if( reproject ) {

      // make sure we have a cache namespace and set the zoom level
      if( !feature.cache ) feature.cache = {};
      feature.cache.zoom = zoom;

      if( feature.geojson.geometry.type == 'Point' ) {

        feature.cache.geoXY = this._map.latLngToContainerPoint([
            feature.geojson.geometry.coordinates[1],
            feature.geojson.geometry.coordinates[0]
        ]);

        // TODO: calculate bounding box if zoom has changed
        if( feature.size ){

        }

      } else if( feature.geojson.geometry.type == 'LineString' ) {
        feature.cache.geoXY = this.utils.projectLine(feature.geojson.geometry.coordinates, this._map);

      } else if ( feature.geojson.geometry.type == 'Polygon' ) {
        feature.cache.geoXY = this.utils.projectLine(feature.geojson.geometry.coordinates[0], this._map);
      }
    }  // end reproject

    // if this was a simple pan event (a diff was provided) and we did not reproject
    // move the feature by diff x/y
    if( diff && !reproject ) {
      if( feature.geojson.geometry.type == 'Point' ) {

        feature.cache.geoXY.x += diff.x;
        feature.cache.geoXY.y += diff.y;

      } else if( feature.geojson.geometry.type == 'LineString' ) {
        this.utils.moveLine(feature.cache.geoXY, diff);

      } else if ( feature.geojson.geometry.type == 'Polygon' ) {
        this.utils.moveLine(feature.cache.geoXY, diff);
      }
    }

    // ignore anything not in bounds
    if( feature.geojson.geometry.type == 'Point' ) {
      if( !bounds.contains(feature.latlng) ) {
        //feature.outOfBounds = true;
        return;
      }
    } else {
      if( !bounds.contains(feature.bounds) && !bounds.intersects(feature.bounds) ) {
        //feature.outOfBounds = true;
        return;
      }
    }

    // if the feature was out of bounds last time we want to reproject
    //feature.outOfBounds = false;

    // call feature render function in feature scope;
    feature.render.call(feature, this._ctx, feature.cache.geoXY, this._map);
  },

  addFeatures : function(features) {
    for( var i = 0; i < this.features.length; i++ ) {
      this.addFeature(this.features[i]);
    }
  },

  addFeature : function(feature, bottom) {
    if( !feature.geojson ) return;
    if( !feature.geojson.geometry ) return;

    if( typeof feature.visible === 'undefined' ) feature.visible = true;
    feature.cache = null;

    if( feature.geojson.geometry.type == 'LineString' ) {
      feature.bounds = this.utils.calcBounds(feature.geojson.geometry.coordinates);

    } else if ( feature.geojson.geometry.type == 'Polygon' ) {
      feature.bounds = this.utils.calcBounds(feature.geojson.geometry.coordinates[0]);

    } else if ( feature.geojson.geometry.type == 'Point' ) {
      feature.latlng = L.latLng(feature.geojson.geometry.coordinates[1], feature.geojson.geometry.coordinates[0]);
    } else {
      console.log('GeoJSON feature type "'+feature.geojson.geometry.type+'" not supported.');
      console.log(feature.geojson);
      return;
    }

    if( bottom ) this.features.unshift(feature);
    else this.features.push(feature);
  },

  addFeatureBottom : function(feature) {
    this.addFeature(feature, true);
  },

  render: function(e) {
    var t, diff
    if( this.debug ) t = new Date().getTime();

    var diff = null;
    if( e && e.type == 'move' ) {
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
    var ctx = canvas.getContext('2d');

    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if( !this.zooming ) this.redraw(diff);

    if( this.debug ) diff = new Date().getTime() - t;

    var c = 0;
    for( var i = 0; i < this.features.length; i++ ) {
      if( Array.isArray(this.features[i].cache.geoXY) ) c += this.features[i].cache.geoXY.length;
    }

    if( this.debug ) console.log('Rendered '+c+' pts in '+diff+'ms');
  },

  _intersects : function(e) {
    var t = new Date().getTime();

    var mpp = this.utils.metersPerPx(e.latlng, this._map);
    var r = mpp * 5; // 5 px radius buffer;

    var center = {
      type : 'Point',
      coordinates : [e.latlng.lng, e.latlng.lat]
    };

    var f;
    var intersects = [];

    /*
    var checkCount = {
      total : 0,
      time : new Date().getTime(),
      Point : {
        total : 0,
        timeTotal : 0,
        avgTime : 0
      },
      LineString : {
        total : 0,
        timeTotal : 0,
        avgTime : 0
      },
      Polygon : {
        total : 0,
        timeTotal : 0,
        avgTime : 0
      },
    };
    */

    for( var i = 0; i < this.features.length; i++ ) {
      f = this.features[i];

      if( !f.visible ) continue;
      if( !f.geojson.geometry ) continue;
      if( !f.cache ) continue;
      if( !f.cache.geoXY ) continue;
      if( f.bounds && !f.bounds.contains(e.latlng) ) continue;

      //checkCount.total++;
      //checkCount[f.geojson.geometry.type].total++;
      //var t = new Date().getTime();

      if( this.utils.geometryWithinRadius(f.geojson.geometry, f.cache.geoXY, center, e.containerPoint, f.size ? (f.size * mpp) : r) ) {
        intersects.push(f.geojson);
      }

      //checkCount[f.geojson.geometry.type].timeTotal += (new Date().getTime() - t);
    }

    /* for debug
    if( checkCount.Point.total > 0 ) {
      checkCount.Point.avgTime =  checkCount.Point.timeTotal / checkCount.Point.total;
    }
    if( checkCount.LineString.total > 0 ) {
      checkCount.LineString.avgTime =  checkCount.LineString.timeTotal / checkCount.LineString.total;
    }
    if( checkCount.Polygon.total > 0 ) {
      checkCount.Polygon.avgTime =  checkCount.Polygon.timeTotal / checkCount.Polygon.total;
    }
    checkCount.time = new Date().getTime() - checkCount.time;

    console.log(checkCount);
    */

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

    if( this.onMouseOver && mouseover.length > 0 ) this.onMouseOver.call(this, mouseover);
    if( this.onMouseMove && mousemove.length > 0 ) this.onMouseMove.call(this, mousemove);
    if( this.onMouseOut && mouseout.length > 0 ) this.onMouseOut.call(this, mouseout);

    if( this.debug ) console.log('intersects time: '+(new Date().getTime() - t)+'ms');

    if( changed ) this.render();
  }
});

},{"./utils":2}],2:[function(require,module,exports){
module.exports = {
  moveLine : function(coords, diff) {
    for( var i = 0; i < coords.length; i++ ) {
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
    } else if (geometry.type == 'Polygon') {
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9sYXllciIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICBBIEZlYXR1cmUgc2hvdWxkIGhhdmUgdGhlIGZvbGxvd2luZzpcblxuICBmZWF0dXJlID0ge1xuICAgIHZpc2libGUgOiBCb29sZWFuLFxuICAgIHNpemUgOiBOdW1iZXIsIC8vIHBvaW50cyBvbmx5LCB1c2VkIGZvciBtb3VzZSBpbnRlcmFjdGlvbnNcbiAgICBnZW9qc29uIDoge31cbiAgICByZW5kZXIgOiBmdW5jdGlvbihjb250ZXh0LCBjb29yZGluYXRlc0luWFksIG1hcCkge30gLy8gY2FsbGVkIGluIGZlYXR1cmUgc2NvcGVcbiAgfVxuXG4gIGdlb1hZIGFuZCBsZWFmbGV0IHdpbGwgYmUgYXNzaWduZWRcbioqL1xuXG5MLkNhbnZhc0dlb2pzb25MYXllciA9IEwuQ2xhc3MuZXh0ZW5kKHtcbiAgLy8gc2hvdyBsYXllciB0aW1pbmdcbiAgZGVidWcgOiBmYWxzZSxcblxuICAvLyBpbmNsdWRlIGV2ZW50c1xuICBpbmNsdWRlczogW0wuTWl4aW4uRXZlbnRzXSxcblxuICAvLyBsaXN0IG9mIGdlb2pzb24gZmVhdHVyZXMgdG8gZHJhd1xuICAvLyAgIC0gdGhlc2Ugd2lsbCBkcmF3IGluIG9yZGVyXG4gIGZlYXR1cmVzIDogW10sXG5cbiAgLy8gbGlzdCBvZiBjdXJyZW50IGZlYXR1cmVzIHVuZGVyIHRoZSBtb3VzZVxuICBpbnRlcnNlY3RMaXN0IDogW10sXG5cbiAgLy8gdXNlZCB0byBjYWxjdWxhdGUgcGl4ZWxzIG1vdmVkIGZyb20gY2VudGVyXG4gIGxhc3RDZW50ZXJMTCA6IG51bGwsXG5cbiAgLy8gZ2VvbWV0cnkgaGVscGVyc1xuICB1dGlscyA6IHJlcXVpcmUoJy4vdXRpbHMnKSxcblxuICAvLyBpbml0aWFsaXplIGxheWVyXG4gIGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgLy8gc2V0IG9wdGlvbnNcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcblxuICAgIC8vIG1vdmUgbW91c2UgZXZlbnQgaGFuZGxlcnMgdG8gbGF5ZXIgc2NvcGVcbiAgICB2YXIgbW91c2VFdmVudHMgPSBbJ29uTW91c2VPdmVyJywgJ29uTW91c2VNb3ZlJywgJ29uTW91c2VPdXQnLCAnb25DbGljayddO1xuICAgIG1vdXNlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7XG4gICAgICBpZiggIXRoaXMub3B0aW9uc1tlXSApIHJldHVybjtcbiAgICAgIHRoaXNbZV0gPSB0aGlzLm9wdGlvbnNbZV07XG4gICAgICBkZWxldGUgdGhpcy5vcHRpb25zW2VdO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAvLyBzZXQgY2FudmFzIGFuZCBjYW52YXMgY29udGV4dCBzaG9ydGN1dHNcbiAgICB0aGlzLl9jYW52YXMgPSB0aGlzLl9jcmVhdGVDYW52YXMoKTtcbiAgICB0aGlzLl9jdHggPSB0aGlzLl9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgfSxcblxuICBfY3JlYXRlQ2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBjYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICBjYW52YXMuc3R5bGUubGVmdCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcIm5vbmVcIjtcbiAgICBjYW52YXMuc3R5bGUuekluZGV4ID0gdGhpcy5vcHRpb25zLnpJbmRleCB8fCAwO1xuICAgIHZhciBjbGFzc05hbWUgPSAnbGVhZmxldC10aWxlLWNvbnRhaW5lciBsZWFmbGV0LXpvb20tYW5pbWF0ZWQnO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gY2FudmFzO1xuICB9LFxuXG4gIG9uQWRkOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgdGhpcy5fbWFwID0gbWFwO1xuXG4gICAgLy8gYWRkIGNvbnRhaW5lciB3aXRoIHRoZSBjYW52YXMgdG8gdGhlIHRpbGUgcGFuZVxuICAgIC8vIHRoZSBjb250YWluZXIgaXMgbW92ZWQgaW4gdGhlIG9wb3NpdGUgZGlyZWN0aW9uIG9mIHRoZVxuICAgIC8vIG1hcCBwYW5lIHRvIGtlZXAgdGhlIGNhbnZhcyBhbHdheXMgaW4gKDAsIDApXG4gICAgdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcbiAgICB2YXIgX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWxheWVyJyk7XG5cbiAgICBfY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2NhbnZhcyk7XG4gICAgdGlsZVBhbmUuYXBwZW5kQ2hpbGQoX2NvbnRhaW5lcik7XG5cbiAgICB0aGlzLl9jb250YWluZXIgPSBfY29udGFpbmVyO1xuXG4gICAgLy8gaGFjazogbGlzdGVuIHRvIHByZWRyYWcgZXZlbnQgbGF1bmNoZWQgYnkgZHJhZ2dpbmcgdG9cbiAgICAvLyBzZXQgY29udGFpbmVyIGluIHBvc2l0aW9uICgwLCAwKSBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICBpZiAobWFwLmRyYWdnaW5nLmVuYWJsZWQoKSkge1xuICAgICAgbWFwLmRyYWdnaW5nLl9kcmFnZ2FibGUub24oJ3ByZWRyYWcnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGQgPSBtYXAuZHJhZ2dpbmcuX2RyYWdnYWJsZTtcbiAgICAgICAgTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2NhbnZhcywgeyB4OiAtZC5fbmV3UG9zLngsIHk6IC1kLl9uZXdQb3MueSB9KTtcbiAgICAgIH0sIHRoaXMpO1xuICAgIH1cblxuICAgIG1hcC5vbih7XG4gICAgICAndmlld3Jlc2V0JyA6IHRoaXMuX3Jlc2V0LFxuICAgICAgJ3Jlc2l6ZScgICAgOiB0aGlzLl9yZXNldCxcbiAgICAgICdtb3ZlJyAgICAgIDogdGhpcy5yZW5kZXIsXG4gICAgICAnem9vbXN0YXJ0JyA6IHRoaXMuX3N0YXJ0Wm9vbSxcbiAgICAgICd6b29tZW5kJyAgIDogdGhpcy5fZW5kWm9vbSxcbiAgICAgICdtb3VzZW1vdmUnIDogdGhpcy5faW50ZXJzZWN0cyxcbiAgICAgICdjbGljaycgICAgIDogdGhpcy5faW50ZXJzZWN0c1xuICAgIH0sIHRoaXMpO1xuXG4gICAgdGhpcy5fcmVzZXQoKTtcbiAgfSxcblxuICBfc3RhcnRab29tOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG4gIH0sXG5cbiAgX2VuZFpvb206IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgICBzZXRUaW1lb3V0KHRoaXMucmVuZGVyLmJpbmQodGhpcyksIDUwKTtcbiAgfSxcblxuICBnZXRDYW52YXM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XG4gIH0sXG5cbiAgZHJhdzogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcmVzZXQoKTtcbiAgfSxcblxuICBvblJlbW92ZTogZnVuY3Rpb24gKG1hcCkge1xuICAgIHRoaXMuX2NvbnRhaW5lci5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuX2NvbnRhaW5lcik7XG4gICAgbWFwLm9mZih7XG4gICAgICAndmlld3Jlc2V0JyA6IHRoaXMuX3Jlc2V0LFxuICAgICAgJ3Jlc2l6ZScgICAgOiB0aGlzLl9yZXNldCxcbiAgICAgICdtb3ZlJyAgICAgIDogdGhpcy5yZW5kZXIsXG4gICAgICAnem9vbXN0YXJ0JyA6IHRoaXMuX3N0YXJ0Wm9vbSxcbiAgICAgICd6b29tZW5kJyAgIDogdGhpcy5fZW5kWm9vbSxcbiAgICAgICdtb3VzZW1vdmUnIDogdGhpcy5faW50ZXJzZWN0cyxcbiAgICAgICdjbGljaycgICAgIDogdGhpcy5faW50ZXJzZWN0c1xuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIGFkZFRvOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgbWFwLmFkZExheWVyKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIF9yZXNldDogZnVuY3Rpb24gKCkge1xuICAgIC8vIHJlc2V0IGFjdHVhbCBjYW52YXMgc2l6ZVxuICAgIHZhciBzaXplID0gdGhpcy5fbWFwLmdldFNpemUoKTtcbiAgICB0aGlzLl9jYW52YXMud2lkdGggPSBzaXplLng7XG4gICAgdGhpcy5fY2FudmFzLmhlaWdodCA9IHNpemUueTtcblxuICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfSxcblxuICAvLyBjbGVhciBlYWNoIGZlYXR1cmVzIGNhY2hlXG4gIGNsZWFyQ2FjaGUgOiBmdW5jdGlvbigpIHtcbiAgICAvLyBraWxsIHRoZSBmZWF0dXJlIHBvaW50IGNhY2hlXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5mZWF0dXJlc1tpXS5jYWNoZS5nZW9YWSA9IG51bGw7XG4gICAgfVxuICB9LFxuXG4gIC8vIHJlZHJhdyBhbGwgZmVhdHVyZXMuICBUaGlzIGRvZXMgbm90IGhhbmRsZSBjbGVhcmluZyB0aGUgY2FudmFzIG9yIHNldHRpbmdcbiAgLy8gdGhlIGNhbnZhcyBjb3JyZWN0IHBvc2l0aW9uLiAgVGhhdCBpcyBoYW5kbGVkIGJ5IHJlbmRlclxuICByZWRyYXc6IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICAvLyBvYmplY3RzIHNob3VsZCBrZWVwIHRyYWNrIG9mIGxhc3QgYmJveCBhbmQgem9vbSBvZiBtYXBcbiAgICAvLyBpZiB0aGlzIGhhc24ndCBjaGFuZ2VkIHRoZSBsbCAtPiBjb250YWluZXIgcHQgaXMgbm90IG5lZWRlZFxuXG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuX21hcC5nZXRCb3VuZHMoKTtcbiAgICB2YXIgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XG5cbiAgICB2YXIgdDtcbiAgICBpZiggdGhpcy5kZWJ1ZyApIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUodGhpcy5mZWF0dXJlc1tpXSwgYm91bmRzLCB6b29tLCBkaWZmKTtcbiAgICB9XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdSZW5kZXIgdGltZTogJysobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSsnbXMnKTtcbiAgfSxcblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIHJlZHJhd0ZlYXR1cmUgOiBmdW5jdGlvbihmZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYpIHtcbiAgICAvLyBpZ25vcmUgYW55dGhpbmcgZmxhZ2dlZCBhcyBoaWRkZW5cbiAgICBpZiggIWZlYXR1cmUudmlzaWJsZSApIHJldHVybjtcblxuICAgIC8vIG5vdyBsZXRzIGNoZWNrIGNhY2hlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlcHJvamVjdCB0aGVcbiAgICAvLyB4eSBjb29yZGluYXRlc1xuICAgIHZhciByZXByb2plY3QgPSB0cnVlO1xuICAgIGlmKCBmZWF0dXJlLmNhY2hlICkge1xuICAgICAgaWYoIGZlYXR1cmUuY2FjaGUuem9vbSA9PSB6b29tICYmIGZlYXR1cmUuY2FjaGUuZ2VvWFkgKSB7XG4gICAgICAgIHJlcHJvamVjdCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFjdHVhbGx5IHByb2plY3QgdG8geHkgaWYgbmVlZGVkXG4gICAgaWYoIHJlcHJvamVjdCApIHtcblxuICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYSBjYWNoZSBuYW1lc3BhY2UgYW5kIHNldCB0aGUgem9vbSBsZXZlbFxuICAgICAgaWYoICFmZWF0dXJlLmNhY2hlICkgZmVhdHVyZS5jYWNoZSA9IHt9O1xuICAgICAgZmVhdHVyZS5jYWNoZS56b29tID0gem9vbTtcblxuICAgICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgICAgZmVhdHVyZS5jYWNoZS5nZW9YWSA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICAgIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXVxuICAgICAgICBdKTtcblxuICAgICAgICAvLyBUT0RPOiBjYWxjdWxhdGUgYm91bmRpbmcgYm94IGlmIHpvb20gaGFzIGNoYW5nZWRcbiAgICAgICAgaWYoIGZlYXR1cmUuc2l6ZSApe1xuXG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG4gICAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlcywgdGhpcy5fbWFwKTtcblxuICAgICAgfSBlbHNlIGlmICggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgICBmZWF0dXJlLmNhY2hlLmdlb1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0sIHRoaXMuX21hcCk7XG4gICAgICB9XG4gICAgfSAgLy8gZW5kIHJlcHJvamVjdFxuXG4gICAgLy8gaWYgdGhpcyB3YXMgYSBzaW1wbGUgcGFuIGV2ZW50IChhIGRpZmYgd2FzIHByb3ZpZGVkKSBhbmQgd2UgZGlkIG5vdCByZXByb2plY3RcbiAgICAvLyBtb3ZlIHRoZSBmZWF0dXJlIGJ5IGRpZmYgeC95XG4gICAgaWYoIGRpZmYgJiYgIXJlcHJvamVjdCApIHtcbiAgICAgIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkueCArPSBkaWZmLng7XG4gICAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkueSArPSBkaWZmLnk7XG5cbiAgICAgIH0gZWxzZSBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGZlYXR1cmUuY2FjaGUuZ2VvWFksIGRpZmYpO1xuXG4gICAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoZmVhdHVyZS5jYWNoZS5nZW9YWSwgZGlmZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIG5vdCBpbiBib3VuZHNcbiAgICBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcbiAgICAgIGlmKCAhYm91bmRzLmNvbnRhaW5zKGZlYXR1cmUubGF0bG5nKSApIHtcbiAgICAgICAgLy9mZWF0dXJlLm91dE9mQm91bmRzID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggIWJvdW5kcy5jb250YWlucyhmZWF0dXJlLmJvdW5kcykgJiYgIWJvdW5kcy5pbnRlcnNlY3RzKGZlYXR1cmUuYm91bmRzKSApIHtcbiAgICAgICAgLy9mZWF0dXJlLm91dE9mQm91bmRzID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIHRoZSBmZWF0dXJlIHdhcyBvdXQgb2YgYm91bmRzIGxhc3QgdGltZSB3ZSB3YW50IHRvIHJlcHJvamVjdFxuICAgIC8vZmVhdHVyZS5vdXRPZkJvdW5kcyA9IGZhbHNlO1xuXG4gICAgLy8gY2FsbCBmZWF0dXJlIHJlbmRlciBmdW5jdGlvbiBpbiBmZWF0dXJlIHNjb3BlO1xuICAgIGZlYXR1cmUucmVuZGVyLmNhbGwoZmVhdHVyZSwgdGhpcy5fY3R4LCBmZWF0dXJlLmNhY2hlLmdlb1hZLCB0aGlzLl9tYXApO1xuICB9LFxuXG4gIGFkZEZlYXR1cmVzIDogZnVuY3Rpb24oZmVhdHVyZXMpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmFkZEZlYXR1cmUodGhpcy5mZWF0dXJlc1tpXSk7XG4gICAgfVxuICB9LFxuXG4gIGFkZEZlYXR1cmUgOiBmdW5jdGlvbihmZWF0dXJlLCBib3R0b20pIHtcbiAgICBpZiggIWZlYXR1cmUuZ2VvanNvbiApIHJldHVybjtcbiAgICBpZiggIWZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeSApIHJldHVybjtcblxuICAgIGlmKCB0eXBlb2YgZmVhdHVyZS52aXNpYmxlID09PSAndW5kZWZpbmVkJyApIGZlYXR1cmUudmlzaWJsZSA9IHRydWU7XG4gICAgZmVhdHVyZS5jYWNoZSA9IG51bGw7XG5cbiAgICBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgZmVhdHVyZS5ib3VuZHMgPSB0aGlzLnV0aWxzLmNhbGNCb3VuZHMoZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcblxuICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgIGZlYXR1cmUuYm91bmRzID0gdGhpcy51dGlscy5jYWxjQm91bmRzKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG5cbiAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuICAgICAgZmVhdHVyZS5sYXRsbmcgPSBMLmxhdExuZyhmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdHZW9KU09OIGZlYXR1cmUgdHlwZSBcIicrZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUrJ1wiIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICBjb25zb2xlLmxvZyhmZWF0dXJlLmdlb2pzb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCBib3R0b20gKSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgZWxzZSB0aGlzLmZlYXR1cmVzLnB1c2goZmVhdHVyZSk7XG4gIH0sXG5cbiAgYWRkRmVhdHVyZUJvdHRvbSA6IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICB0aGlzLmFkZEZlYXR1cmUoZmVhdHVyZSwgdHJ1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHQsIGRpZmZcbiAgICBpZiggdGhpcy5kZWJ1ZyApIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIHZhciBkaWZmID0gbnVsbDtcbiAgICBpZiggZSAmJiBlLnR5cGUgPT0gJ21vdmUnICkge1xuICAgICAgdmFyIGNlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcblxuICAgICAgdmFyIHB0ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoY2VudGVyKTtcbiAgICAgIGlmKCB0aGlzLmxhc3RDZW50ZXJMTCApIHtcbiAgICAgICAgdmFyIGxhc3RYeSA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KHRoaXMubGFzdENlbnRlckxMKTtcbiAgICAgICAgZGlmZiA9IHtcbiAgICAgICAgICB4IDogbGFzdFh5LnggLSBwdC54LFxuICAgICAgICAgIHkgOiBsYXN0WHkueSAtIHB0LnlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RDZW50ZXJMTCA9IGNlbnRlcjtcbiAgICB9XG5cbiAgICB2YXIgdG9wTGVmdCA9IHRoaXMuX21hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgIEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jYW52YXMsIHRvcExlZnQpO1xuXG4gICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gY2xlYXIgY2FudmFzXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgaWYoICF0aGlzLnpvb21pbmcgKSB0aGlzLnJlZHJhdyhkaWZmKTtcblxuICAgIGlmKCB0aGlzLmRlYnVnICkgZGlmZiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdDtcblxuICAgIHZhciBjID0gMDtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggQXJyYXkuaXNBcnJheSh0aGlzLmZlYXR1cmVzW2ldLmNhY2hlLmdlb1hZKSApIGMgKz0gdGhpcy5mZWF0dXJlc1tpXS5jYWNoZS5nZW9YWS5sZW5ndGg7XG4gICAgfVxuXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZygnUmVuZGVyZWQgJytjKycgcHRzIGluICcrZGlmZisnbXMnKTtcbiAgfSxcblxuICBfaW50ZXJzZWN0cyA6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgdmFyIG1wcCA9IHRoaXMudXRpbHMubWV0ZXJzUGVyUHgoZS5sYXRsbmcsIHRoaXMuX21hcCk7XG4gICAgdmFyIHIgPSBtcHAgKiA1OyAvLyA1IHB4IHJhZGl1cyBidWZmZXI7XG5cbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgdHlwZSA6ICdQb2ludCcsXG4gICAgICBjb29yZGluYXRlcyA6IFtlLmxhdGxuZy5sbmcsIGUubGF0bG5nLmxhdF1cbiAgICB9O1xuXG4gICAgdmFyIGY7XG4gICAgdmFyIGludGVyc2VjdHMgPSBbXTtcblxuICAgIC8qXG4gICAgdmFyIGNoZWNrQ291bnQgPSB7XG4gICAgICB0b3RhbCA6IDAsXG4gICAgICB0aW1lIDogbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICBQb2ludCA6IHtcbiAgICAgICAgdG90YWwgOiAwLFxuICAgICAgICB0aW1lVG90YWwgOiAwLFxuICAgICAgICBhdmdUaW1lIDogMFxuICAgICAgfSxcbiAgICAgIExpbmVTdHJpbmcgOiB7XG4gICAgICAgIHRvdGFsIDogMCxcbiAgICAgICAgdGltZVRvdGFsIDogMCxcbiAgICAgICAgYXZnVGltZSA6IDBcbiAgICAgIH0sXG4gICAgICBQb2x5Z29uIDoge1xuICAgICAgICB0b3RhbCA6IDAsXG4gICAgICAgIHRpbWVUb3RhbCA6IDAsXG4gICAgICAgIGF2Z1RpbWUgOiAwXG4gICAgICB9LFxuICAgIH07XG4gICAgKi9cblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGYgPSB0aGlzLmZlYXR1cmVzW2ldO1xuXG4gICAgICBpZiggIWYudmlzaWJsZSApIGNvbnRpbnVlO1xuICAgICAgaWYoICFmLmdlb2pzb24uZ2VvbWV0cnkgKSBjb250aW51ZTtcbiAgICAgIGlmKCAhZi5jYWNoZSApIGNvbnRpbnVlO1xuICAgICAgaWYoICFmLmNhY2hlLmdlb1hZICkgY29udGludWU7XG4gICAgICBpZiggZi5ib3VuZHMgJiYgIWYuYm91bmRzLmNvbnRhaW5zKGUubGF0bG5nKSApIGNvbnRpbnVlO1xuXG4gICAgICAvL2NoZWNrQ291bnQudG90YWwrKztcbiAgICAgIC8vY2hlY2tDb3VudFtmLmdlb2pzb24uZ2VvbWV0cnkudHlwZV0udG90YWwrKztcbiAgICAgIC8vdmFyIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgaWYoIHRoaXMudXRpbHMuZ2VvbWV0cnlXaXRoaW5SYWRpdXMoZi5nZW9qc29uLmdlb21ldHJ5LCBmLmNhY2hlLmdlb1hZLCBjZW50ZXIsIGUuY29udGFpbmVyUG9pbnQsIGYuc2l6ZSA/IChmLnNpemUgKiBtcHApIDogcikgKSB7XG4gICAgICAgIGludGVyc2VjdHMucHVzaChmLmdlb2pzb24pO1xuICAgICAgfVxuXG4gICAgICAvL2NoZWNrQ291bnRbZi5nZW9qc29uLmdlb21ldHJ5LnR5cGVdLnRpbWVUb3RhbCArPSAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KTtcbiAgICB9XG5cbiAgICAvKiBmb3IgZGVidWdcbiAgICBpZiggY2hlY2tDb3VudC5Qb2ludC50b3RhbCA+IDAgKSB7XG4gICAgICBjaGVja0NvdW50LlBvaW50LmF2Z1RpbWUgPSAgY2hlY2tDb3VudC5Qb2ludC50aW1lVG90YWwgLyBjaGVja0NvdW50LlBvaW50LnRvdGFsO1xuICAgIH1cbiAgICBpZiggY2hlY2tDb3VudC5MaW5lU3RyaW5nLnRvdGFsID4gMCApIHtcbiAgICAgIGNoZWNrQ291bnQuTGluZVN0cmluZy5hdmdUaW1lID0gIGNoZWNrQ291bnQuTGluZVN0cmluZy50aW1lVG90YWwgLyBjaGVja0NvdW50LkxpbmVTdHJpbmcudG90YWw7XG4gICAgfVxuICAgIGlmKCBjaGVja0NvdW50LlBvbHlnb24udG90YWwgPiAwICkge1xuICAgICAgY2hlY2tDb3VudC5Qb2x5Z29uLmF2Z1RpbWUgPSAgY2hlY2tDb3VudC5Qb2x5Z29uLnRpbWVUb3RhbCAvIGNoZWNrQ291bnQuUG9seWdvbi50b3RhbDtcbiAgICB9XG4gICAgY2hlY2tDb3VudC50aW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBjaGVja0NvdW50LnRpbWU7XG5cbiAgICBjb25zb2xlLmxvZyhjaGVja0NvdW50KTtcbiAgICAqL1xuXG4gICAgaWYoIGUudHlwZSA9PSAnY2xpY2snICYmIHRoaXMub25DbGljayApIHtcbiAgICAgIHRoaXMub25DbGljayhpbnRlcnNlY3RzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbW91c2VvdmVyID0gW10sIG1vdXNlb3V0ID0gW10sIG1vdXNlbW92ZSA9IFtdO1xuXG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGludGVyc2VjdHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5pbnRlcnNlY3RMaXN0LmluZGV4T2YoaW50ZXJzZWN0c1tpXSkgPiAtMSApIHtcbiAgICAgICAgbW91c2Vtb3ZlLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgbW91c2VvdmVyLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmludGVyc2VjdExpc3QubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggaW50ZXJzZWN0cy5pbmRleE9mKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSkgPT0gLTEgKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBtb3VzZW91dC5wdXNoKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gaW50ZXJzZWN0cztcblxuICAgIGlmKCB0aGlzLm9uTW91c2VPdmVyICYmIG1vdXNlb3Zlci5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlT3Zlci5jYWxsKHRoaXMsIG1vdXNlb3Zlcik7XG4gICAgaWYoIHRoaXMub25Nb3VzZU1vdmUgJiYgbW91c2Vtb3ZlLmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VNb3ZlLmNhbGwodGhpcywgbW91c2Vtb3ZlKTtcbiAgICBpZiggdGhpcy5vbk1vdXNlT3V0ICYmIG1vdXNlb3V0Lmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VPdXQuY2FsbCh0aGlzLCBtb3VzZW91dCk7XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdpbnRlcnNlY3RzIHRpbWU6ICcrKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCkrJ21zJyk7XG5cbiAgICBpZiggY2hhbmdlZCApIHRoaXMucmVuZGVyKCk7XG4gIH1cbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vdmVMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBkaWZmKSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBjb29yZHNbaV0ueCArPSBkaWZmLng7XG4gICAgICBjb29yZHNbaV0ueSArPSBkaWZmLnk7XG4gICAgfVxuICB9LFxuXG4gIHByb2plY3RMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBtYXApIHtcbiAgICB2YXIgeHlMaW5lID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHh5TGluZS5wdXNoKG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICBjb29yZHNbaV1bMV0sIGNvb3Jkc1tpXVswXVxuICAgICAgXSkpO1xuICAgIH1cblxuICAgIHJldHVybiB4eUxpbmU7XG4gIH0sXG5cbiAgY2FsY0JvdW5kcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4bWluID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB4bWF4ID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB5bWluID0gY29vcmRzWzBdWzBdO1xuICAgIHZhciB5bWF4ID0gY29vcmRzWzBdWzBdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDE7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggeG1pbiA+IGNvb3Jkc1tpXVsxXSApIHhtaW4gPSBjb29yZHNbaV1bMV07XG4gICAgICBpZiggeG1heCA8IGNvb3Jkc1tpXVsxXSApIHhtYXggPSBjb29yZHNbaV1bMV07XG5cbiAgICAgIGlmKCB5bWluID4gY29vcmRzW2ldWzBdICkgeW1pbiA9IGNvb3Jkc1tpXVswXTtcbiAgICAgIGlmKCB5bWF4IDwgY29vcmRzW2ldWzBdICkgeW1heCA9IGNvb3Jkc1tpXVswXTtcbiAgICB9XG5cbiAgICB2YXIgc291dGhXZXN0ID0gTC5sYXRMbmcoeG1pbi0uMDEsIHltaW4tLjAxKTtcbiAgICB2YXIgbm9ydGhFYXN0ID0gTC5sYXRMbmcoeG1heCsuMDEsIHltYXgrLjAxKTtcblxuICAgIHJldHVybiBMLmxhdExuZ0JvdW5kcyhzb3V0aFdlc3QsIG5vcnRoRWFzdCk7XG4gIH0sXG5cbiAgZ2VvbWV0cnlXaXRoaW5SYWRpdXMgOiBmdW5jdGlvbihnZW9tZXRyeSwgeHlQb2ludHMsIGNlbnRlciwgeHlQb2ludCwgcmFkaXVzKSB7XG4gICAgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnREaXN0YW5jZShnZW9tZXRyeSwgY2VudGVyKSA8PSByYWRpdXM7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgZm9yKCB2YXIgaSA9IDE7IGkgPCB4eVBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoIHRoaXMubGluZUludGVyc2VjdHNDaXJjbGUoeHlQb2ludHNbaS0xXSwgeHlQb2ludHNbaV0sIHh5UG9pbnQsIDMpICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludEluUG9seWdvbihjZW50ZXIsIGdlb21ldHJ5KTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzI3NTUyOS9jaGVjay1pZi1saW5lLWludGVyc2VjdHMtd2l0aC1jaXJjbGVzLXBlcmltZXRlclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EaXN0YW5jZV9mcm9tX2FfcG9pbnRfdG9fYV9saW5lXG4gIC8vIFtsbmcgeCwgbGF0LCB5XVxuICBsaW5lSW50ZXJzZWN0c0NpcmNsZSA6IGZ1bmN0aW9uKGxpbmVQMSwgbGluZVAyLCBwb2ludCwgcmFkaXVzKSB7XG4gICAgdmFyIGRpc3RhbmNlID1cbiAgICAgIE1hdGguYWJzKFxuICAgICAgICAoKGxpbmVQMi55IC0gbGluZVAxLnkpKnBvaW50LngpIC0gKChsaW5lUDIueCAtIGxpbmVQMS54KSpwb2ludC55KSArIChsaW5lUDIueCpsaW5lUDEueSkgLSAobGluZVAyLnkqbGluZVAxLngpXG4gICAgICApIC9cbiAgICAgIE1hdGguc3FydChcbiAgICAgICAgTWF0aC5wb3cobGluZVAyLnkgLSBsaW5lUDEueSwgMikgKyBNYXRoLnBvdyhsaW5lUDIueCAtIGxpbmVQMS54LCAyKVxuICAgICAgKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPD0gcmFkaXVzO1xuICB9LFxuXG4gIC8vIGh0dHA6Ly93aWtpLm9wZW5zdHJlZXRtYXAub3JnL3dpa2kvWm9vbV9sZXZlbHNcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzU0NTA5OC9sZWFmbGV0LWNhbGN1bGF0aW5nLW1ldGVycy1wZXItcGl4ZWwtYXQtem9vbS1sZXZlbFxuICBtZXRlcnNQZXJQeCA6IGZ1bmN0aW9uKGxsLCBtYXApIHtcbiAgICB2YXIgcG9pbnRDID0gbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGwpOyAvLyBjb252ZXJ0IHRvIGNvbnRhaW5lcnBvaW50IChwaXhlbHMpXG4gICAgdmFyIHBvaW50WCA9IFtwb2ludEMueCArIDEsIHBvaW50Qy55XTsgLy8gYWRkIG9uZSBwaXhlbCB0byB4XG5cbiAgICAvLyBjb252ZXJ0IGNvbnRhaW5lcnBvaW50cyB0byBsYXRsbmcnc1xuICAgIHZhciBsYXRMbmdDID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRDKTtcbiAgICB2YXIgbGF0TG5nWCA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50WCk7XG5cbiAgICB2YXIgZGlzdGFuY2VYID0gbGF0TG5nQy5kaXN0YW5jZVRvKGxhdExuZ1gpOyAvLyBjYWxjdWxhdGUgZGlzdGFuY2UgYmV0d2VlbiBjIGFuZCB4IChsYXRpdHVkZSlcbiAgICByZXR1cm4gZGlzdGFuY2VYO1xuICB9LFxuXG4gIC8vIGZyb20gaHR0cDovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWxcbiAgcG9pbnREaXN0YW5jZSA6IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHZhciBsb24xID0gcHQxLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MSA9IHB0MS5jb29yZGluYXRlc1sxXSxcbiAgICAgIGxvbjIgPSBwdDIuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQyID0gcHQyLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgZExhdCA9IHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MiAtIGxhdDEpLFxuICAgICAgZExvbiA9IHRoaXMubnVtYmVyVG9SYWRpdXMobG9uMiAtIGxvbjEpLFxuICAgICAgYSA9IE1hdGgucG93KE1hdGguc2luKGRMYXQgLyAyKSwgMikgKyBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDEpKVxuICAgICAgICAqIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MikpICogTWF0aC5wb3coTWF0aC5zaW4oZExvbiAvIDIpLCAyKSxcbiAgICAgIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xuICAgIHJldHVybiAoNjM3MSAqIGMpICogMTAwMDsgLy8gcmV0dXJucyBtZXRlcnNcbiAgfSxcblxuICBwb2ludEluUG9seWdvbiA6IGZ1bmN0aW9uIChwLCBwb2x5KSB7XG4gICAgdmFyIGNvb3JkcyA9IChwb2x5LnR5cGUgPT0gXCJQb2x5Z29uXCIpID8gWyBwb2x5LmNvb3JkaW5hdGVzIF0gOiBwb2x5LmNvb3JkaW5hdGVzXG5cbiAgICB2YXIgaW5zaWRlQm94ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG9pbnRJbkJvdW5kaW5nQm94KHAsIHRoaXMuYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzKGNvb3Jkc1tpXSkpKSBpbnNpZGVCb3ggPSB0cnVlXG4gICAgfVxuICAgIGlmICghaW5zaWRlQm94KSByZXR1cm4gZmFsc2VcblxuICAgIHZhciBpbnNpZGVQb2x5ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG5wb2x5KHAuY29vcmRpbmF0ZXNbMV0sIHAuY29vcmRpbmF0ZXNbMF0sIGNvb3Jkc1tpXSkpIGluc2lkZVBvbHkgPSB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVBvbHlcbiAgfSxcblxuICBwb2ludEluQm91bmRpbmdCb3ggOiBmdW5jdGlvbiAocG9pbnQsIGJvdW5kcykge1xuICAgIHJldHVybiAhKHBvaW50LmNvb3JkaW5hdGVzWzFdIDwgYm91bmRzWzBdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzFdID4gYm91bmRzWzFdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdIDwgYm91bmRzWzBdWzFdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdID4gYm91bmRzWzFdWzFdKVxuICB9LFxuXG4gIGJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3JkcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4QWxsID0gW10sIHlBbGwgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHNbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHhBbGwucHVzaChjb29yZHNbMF1baV1bMV0pXG4gICAgICB5QWxsLnB1c2goY29vcmRzWzBdW2ldWzBdKVxuICAgIH1cblxuICAgIHhBbGwgPSB4QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICB5QWxsID0geUFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG5cbiAgICByZXR1cm4gWyBbeEFsbFswXSwgeUFsbFswXV0sIFt4QWxsW3hBbGwubGVuZ3RoIC0gMV0sIHlBbGxbeUFsbC5sZW5ndGggLSAxXV0gXVxuICB9LFxuXG4gIC8vIFBvaW50IGluIFBvbHlnb25cbiAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbCNMaXN0aW5nIHRoZSBWZXJ0aWNlc1xuICBwbnBvbHkgOiBmdW5jdGlvbih4LHksY29vcmRzKSB7XG4gICAgdmFyIHZlcnQgPSBbIFswLDBdIF1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvb3Jkc1tpXS5sZW5ndGg7IGorKykge1xuICAgICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldW2pdKVxuICAgICAgfVxuICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVswXSlcbiAgICAgIHZlcnQucHVzaChbMCwwXSlcbiAgICB9XG5cbiAgICB2YXIgaW5zaWRlID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZlcnQubGVuZ3RoIC0gMTsgaSA8IHZlcnQubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICBpZiAoKCh2ZXJ0W2ldWzBdID4geSkgIT0gKHZlcnRbal1bMF0gPiB5KSkgJiYgKHggPCAodmVydFtqXVsxXSAtIHZlcnRbaV1bMV0pICogKHkgLSB2ZXJ0W2ldWzBdKSAvICh2ZXJ0W2pdWzBdIC0gdmVydFtpXVswXSkgKyB2ZXJ0W2ldWzFdKSkgaW5zaWRlID0gIWluc2lkZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVcbiAgfSxcblxuICBudW1iZXJUb1JhZGl1cyA6IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICByZXR1cm4gbnVtYmVyICogTWF0aC5QSSAvIDE4MDtcbiAgfVxufTtcbiJdfQ==
