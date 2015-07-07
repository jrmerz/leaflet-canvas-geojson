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
      this.clearFeatureCache( this.features[i] );
    }
  },

  clearFeatureCache : function(feature) {
    if( !feature.cache ) return;
    feature.cache.geoXY = null;
  },

  // redraw all features.  This does not handle clearing the canvas or setting
  // the canvas correct position.  That is handled by render
  redraw: function(diff) {
    // objects should keep track of last bbox and zoom of map
    // if this hasn't changed the ll -> container pt is not needed
    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    if( this.debug ) t = new Date().getTime();

    for( var i = 0; i < this.features.length; i++ ) {
      this.redrawFeature(this.features[i], bounds, zoom, diff);
    }

    if( this.debug ) console.log('Render time: '+(new Date().getTime() - t)+'ms; avg: '+
      ((new Date().getTime() - t) / this.features.length)+'ms');
  },

  // redraw an individual feature
  redrawFeature : function(feature, bounds, zoom, diff) {
    //if( feature.geojson.properties.debug ) debugger;

    // ignore anything flagged as hidden
    // we do need to clear the cache in this case
    if( !feature.visible ) {
      this.clearFeatureCache(feature);
      return;
    }

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
      this._calcGeoXY(feature, zoom);
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

    // call feature render function in feature scope; feature is passed as well
    feature.render.call(feature, this._ctx, feature.cache.geoXY, this._map, feature);
  },

  _calcGeoXY : function(feature, zoom) {
    // make sure we have a cache namespace and set the zoom level
    if( !feature.cache ) feature.cache = {};
    feature.cache.zoom = zoom;

    if( feature.geojson.geometry.type == 'Point' ) {

      feature.cache.geoXY = this._map.latLngToContainerPoint([
          feature.geojson.geometry.coordinates[1],
          feature.geojson.geometry.coordinates[0]
      ]);

      if( feature.size ) {
        feature.cache.geoXY[0] = feature.cache.geoXY[0] - feature.size / 2;
        feature.cache.geoXY[1] = feature.cache.geoXY[1] - feature.size / 2;
      }

    } else if( feature.geojson.geometry.type == 'LineString' ) {
      feature.cache.geoXY = this.utils.projectLine(feature.geojson.geometry.coordinates, this._map);

    } else if ( feature.geojson.geometry.type == 'Polygon' ) {
      feature.cache.geoXY = this.utils.projectLine(feature.geojson.geometry.coordinates[0], this._map);
    }
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

    if( bottom ) { // bottom or index
      if( typeof bottom === 'number') this.features.splice(bottom, 0, feature);
      else this.features.unshift(feature);
    } else {
      this.features.push(feature);
    }
  },

  addFeatureBottom : function(feature) {
    this.addFeature(feature, true);
  },

  // returns true if re-render required.  ie the feature was visible;
  removeFeature : function(feature) {
    var index = this.features.indexOf(feature);
    if( index == -1 ) return;

    this.splice(index, 1);

    if( this.feature.visible ) return true;
    return false;
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

  /*
    return list of all intersecting geometry regradless is currently visible

    pxRadius - is for lines and points only.  Basically how far off the line or
    or point a latlng can be and still be considered intersecting.  This is
    given in px as it is compensating for user intent with mouse click or touch.
    The point must lay inside to polygon for a match.
  */
  getAllIntersectingGeometry : function(latlng, pxRadius) {
    var mpp = this.utils.metersPerPx(latlng, this._map);
    var r = mpp * (pxRadius || 5); // 5 px radius buffer;

    var center = {
      type : 'Point',
      coordinates : [latlng.lng, latlng.lat]
    };
    var zoom = this._map.getZoom();
    var containerPoint = this._map.latLngToContainerPoint(latlng);

    var f;
    var intersects = [];

    for( var i = 0; i < this.features.length; i++ ) {
      f = this.features[i];

      if( !f.geojson.geometry ) continue;
      if( f.bounds && !f.bounds.contains(latlng) ) continue;

      if( !f.cache ) this._calcGeoXY(f, zoom);
      else if( !f.cache.geoXY ) this._calcGeoXY(f, zoom);

      if( this.utils.geometryWithinRadius(f.geojson.geometry, f.cache.geoXY, center, containerPoint, r) ) {
        intersects.push(f);
      }
    }

    return intersects;
  },

  // get the meters per px and a certain point;
  getMetersPerPx : function(latlng) {
    return this.utils.metersPerPx(latlng, this._map);
  },

  _intersects : function(e) {
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
      if( f.bounds && !f.bounds.contains(e.latlng) ) continue;

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9sYXllciIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAgQSBGZWF0dXJlIHNob3VsZCBoYXZlIHRoZSBmb2xsb3dpbmc6XG5cbiAgZmVhdHVyZSA9IHtcbiAgICB2aXNpYmxlIDogQm9vbGVhbixcbiAgICBzaXplIDogTnVtYmVyLCAvLyBwb2ludHMgb25seSwgdXNlZCBmb3IgbW91c2UgaW50ZXJhY3Rpb25zXG4gICAgZ2VvanNvbiA6IHt9XG4gICAgcmVuZGVyIDogZnVuY3Rpb24oY29udGV4dCwgY29vcmRpbmF0ZXNJblhZLCBtYXApIHt9IC8vIGNhbGxlZCBpbiBmZWF0dXJlIHNjb3BlXG4gIH1cblxuICBnZW9YWSBhbmQgbGVhZmxldCB3aWxsIGJlIGFzc2lnbmVkXG4qKi9cblxuTC5DYW52YXNHZW9qc29uTGF5ZXIgPSBMLkNsYXNzLmV4dGVuZCh7XG4gIC8vIHNob3cgbGF5ZXIgdGltaW5nXG4gIGRlYnVnIDogZmFsc2UsXG5cbiAgLy8gaW5jbHVkZSBldmVudHNcbiAgaW5jbHVkZXM6IFtMLk1peGluLkV2ZW50c10sXG5cbiAgLy8gbGlzdCBvZiBnZW9qc29uIGZlYXR1cmVzIHRvIGRyYXdcbiAgLy8gICAtIHRoZXNlIHdpbGwgZHJhdyBpbiBvcmRlclxuICBmZWF0dXJlcyA6IFtdLFxuXG4gIC8vIGxpc3Qgb2YgY3VycmVudCBmZWF0dXJlcyB1bmRlciB0aGUgbW91c2VcbiAgaW50ZXJzZWN0TGlzdCA6IFtdLFxuXG4gIC8vIHVzZWQgdG8gY2FsY3VsYXRlIHBpeGVscyBtb3ZlZCBmcm9tIGNlbnRlclxuICBsYXN0Q2VudGVyTEwgOiBudWxsLFxuXG4gIC8vIGdlb21ldHJ5IGhlbHBlcnNcbiAgdXRpbHMgOiByZXF1aXJlKCcuL3V0aWxzJyksXG5cbiAgLy8gaW5pdGlhbGl6ZSBsYXllclxuICBpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG5cbiAgICAvLyBtb3ZlIG1vdXNlIGV2ZW50IGhhbmRsZXJzIHRvIGxheWVyIHNjb3BlXG4gICAgdmFyIG1vdXNlRXZlbnRzID0gWydvbk1vdXNlT3ZlcicsICdvbk1vdXNlTW92ZScsICdvbk1vdXNlT3V0JywgJ29uQ2xpY2snXTtcbiAgICBtb3VzZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuICAgICAgaWYoICF0aGlzLm9wdGlvbnNbZV0gKSByZXR1cm47XG4gICAgICB0aGlzW2VdID0gdGhpcy5vcHRpb25zW2VdO1xuICAgICAgZGVsZXRlIHRoaXMub3B0aW9uc1tlXTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gc2V0IGNhbnZhcyBhbmQgY2FudmFzIGNvbnRleHQgc2hvcnRjdXRzXG4gICAgdGhpcy5fY2FudmFzID0gdGhpcy5fY3JlYXRlQ2FudmFzKCk7XG4gICAgdGhpcy5fY3R4ID0gdGhpcy5fY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIH0sXG5cbiAgX2NyZWF0ZUNhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IHRoaXMub3B0aW9ucy56SW5kZXggfHwgMDtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtdGlsZS1jb250YWluZXIgbGVhZmxldC16b29tLWFuaW1hdGVkJztcbiAgICBjYW52YXMuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIGNhbnZhcztcbiAgfSxcblxuICBvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcblxuICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAvLyB0aGUgY29udGFpbmVyIGlzIG1vdmVkIGluIHRoZSBvcG9zaXRlIGRpcmVjdGlvbiBvZiB0aGVcbiAgICAvLyBtYXAgcGFuZSB0byBrZWVwIHRoZSBjYW52YXMgYWx3YXlzIGluICgwLCAwKVxuICAgIHZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMudGlsZVBhbmU7XG4gICAgdmFyIF9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1sYXllcicpO1xuXG4gICAgX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jYW52YXMpO1xuICAgIHRpbGVQYW5lLmFwcGVuZENoaWxkKF9jb250YWluZXIpO1xuXG4gICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgIC8vIGhhY2s6IGxpc3RlbiB0byBwcmVkcmFnIGV2ZW50IGxhdW5jaGVkIGJ5IGRyYWdnaW5nIHRvXG4gICAgLy8gc2V0IGNvbnRhaW5lciBpbiBwb3NpdGlvbiAoMCwgMCkgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgaWYgKG1hcC5kcmFnZ2luZy5lbmFibGVkKCkpIHtcbiAgICAgIG1hcC5kcmFnZ2luZy5fZHJhZ2dhYmxlLm9uKCdwcmVkcmFnJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkID0gbWFwLmRyYWdnaW5nLl9kcmFnZ2FibGU7XG4gICAgICAgIEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jYW52YXMsIHsgeDogLWQuX25ld1Bvcy54LCB5OiAtZC5fbmV3UG9zLnkgfSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBtYXAub24oe1xuICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLl9yZXNldCxcbiAgICAgICdyZXNpemUnICAgIDogdGhpcy5fcmVzZXQsXG4gICAgICAnbW92ZScgICAgICA6IHRoaXMucmVuZGVyLFxuICAgICAgJ3pvb21zdGFydCcgOiB0aGlzLl9zdGFydFpvb20sXG4gICAgICAnem9vbWVuZCcgICA6IHRoaXMuX2VuZFpvb20sXG4gICAgICAnbW91c2Vtb3ZlJyA6IHRoaXMuX2ludGVyc2VjdHMsXG4gICAgICAnY2xpY2snICAgICA6IHRoaXMuX2ludGVyc2VjdHNcbiAgICB9LCB0aGlzKTtcblxuICAgIHRoaXMuX3Jlc2V0KCk7XG4gIH0sXG5cbiAgX3N0YXJ0Wm9vbTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB0aGlzLnpvb21pbmcgPSB0cnVlO1xuICB9LFxuXG4gIF9lbmRab29tOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgc2V0VGltZW91dCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpLCA1MCk7XG4gIH0sXG5cbiAgZ2V0Q2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3Jlc2V0KCk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcbiAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgIG1hcC5vZmYoe1xuICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLl9yZXNldCxcbiAgICAgICdyZXNpemUnICAgIDogdGhpcy5fcmVzZXQsXG4gICAgICAnbW92ZScgICAgICA6IHRoaXMucmVuZGVyLFxuICAgICAgJ3pvb21zdGFydCcgOiB0aGlzLl9zdGFydFpvb20sXG4gICAgICAnem9vbWVuZCcgICA6IHRoaXMuX2VuZFpvb20sXG4gICAgICAnbW91c2Vtb3ZlJyA6IHRoaXMuX2ludGVyc2VjdHMsXG4gICAgICAnY2xpY2snICAgICA6IHRoaXMuX2ludGVyc2VjdHNcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyByZXNldCBhY3R1YWwgY2FudmFzIHNpemVcbiAgICB2YXIgc2l6ZSA9IHRoaXMuX21hcC5nZXRTaXplKCk7XG4gICAgdGhpcy5fY2FudmFzLndpZHRoID0gc2l6ZS54O1xuICAgIHRoaXMuX2NhbnZhcy5oZWlnaHQgPSBzaXplLnk7XG5cbiAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgLy8gY2xlYXIgZWFjaCBmZWF0dXJlcyBjYWNoZVxuICBjbGVhckNhY2hlIDogZnVuY3Rpb24oKSB7XG4gICAgLy8ga2lsbCB0aGUgZmVhdHVyZSBwb2ludCBjYWNoZVxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuY2xlYXJGZWF0dXJlQ2FjaGUoIHRoaXMuZmVhdHVyZXNbaV0gKTtcbiAgICB9XG4gIH0sXG5cbiAgY2xlYXJGZWF0dXJlQ2FjaGUgOiBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgaWYoICFmZWF0dXJlLmNhY2hlICkgcmV0dXJuO1xuICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSBudWxsO1xuICB9LFxuXG4gIC8vIHJlZHJhdyBhbGwgZmVhdHVyZXMuICBUaGlzIGRvZXMgbm90IGhhbmRsZSBjbGVhcmluZyB0aGUgY2FudmFzIG9yIHNldHRpbmdcbiAgLy8gdGhlIGNhbnZhcyBjb3JyZWN0IHBvc2l0aW9uLiAgVGhhdCBpcyBoYW5kbGVkIGJ5IHJlbmRlclxuICByZWRyYXc6IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICAvLyBvYmplY3RzIHNob3VsZCBrZWVwIHRyYWNrIG9mIGxhc3QgYmJveCBhbmQgem9vbSBvZiBtYXBcbiAgICAvLyBpZiB0aGlzIGhhc24ndCBjaGFuZ2VkIHRoZSBsbCAtPiBjb250YWluZXIgcHQgaXMgbm90IG5lZWRlZFxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgdmFyIHpvb20gPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUodGhpcy5mZWF0dXJlc1tpXSwgYm91bmRzLCB6b29tLCBkaWZmKTtcbiAgICB9XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdSZW5kZXIgdGltZTogJysobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSsnbXM7IGF2ZzogJytcbiAgICAgICgobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSAvIHRoaXMuZmVhdHVyZXMubGVuZ3RoKSsnbXMnKTtcbiAgfSxcblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIHJlZHJhd0ZlYXR1cmUgOiBmdW5jdGlvbihmZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYpIHtcbiAgICAvL2lmKCBmZWF0dXJlLmdlb2pzb24ucHJvcGVydGllcy5kZWJ1ZyApIGRlYnVnZ2VyO1xuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIGZsYWdnZWQgYXMgaGlkZGVuXG4gICAgLy8gd2UgZG8gbmVlZCB0byBjbGVhciB0aGUgY2FjaGUgaW4gdGhpcyBjYXNlXG4gICAgaWYoICFmZWF0dXJlLnZpc2libGUgKSB7XG4gICAgICB0aGlzLmNsZWFyRmVhdHVyZUNhY2hlKGZlYXR1cmUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG5vdyBsZXRzIGNoZWNrIGNhY2hlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlcHJvamVjdCB0aGVcbiAgICAvLyB4eSBjb29yZGluYXRlc1xuICAgIHZhciByZXByb2plY3QgPSB0cnVlO1xuICAgIGlmKCBmZWF0dXJlLmNhY2hlICkge1xuICAgICAgaWYoIGZlYXR1cmUuY2FjaGUuem9vbSA9PSB6b29tICYmIGZlYXR1cmUuY2FjaGUuZ2VvWFkgKSB7XG4gICAgICAgIHJlcHJvamVjdCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFjdHVhbGx5IHByb2plY3QgdG8geHkgaWYgbmVlZGVkXG4gICAgaWYoIHJlcHJvamVjdCApIHtcbiAgICAgIHRoaXMuX2NhbGNHZW9YWShmZWF0dXJlLCB6b29tKTtcbiAgICB9ICAvLyBlbmQgcmVwcm9qZWN0XG5cbiAgICAvLyBpZiB0aGlzIHdhcyBhIHNpbXBsZSBwYW4gZXZlbnQgKGEgZGlmZiB3YXMgcHJvdmlkZWQpIGFuZCB3ZSBkaWQgbm90IHJlcHJvamVjdFxuICAgIC8vIG1vdmUgdGhlIGZlYXR1cmUgYnkgZGlmZiB4L3lcbiAgICBpZiggZGlmZiAmJiAhcmVwcm9qZWN0ICkge1xuICAgICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgICAgZmVhdHVyZS5jYWNoZS5nZW9YWS54ICs9IGRpZmYueDtcbiAgICAgICAgZmVhdHVyZS5jYWNoZS5nZW9YWS55ICs9IGRpZmYueTtcblxuICAgICAgfSBlbHNlIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShmZWF0dXJlLmNhY2hlLmdlb1hZLCBkaWZmKTtcblxuICAgICAgfSBlbHNlIGlmICggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGZlYXR1cmUuY2FjaGUuZ2VvWFksIGRpZmYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlnbm9yZSBhbnl0aGluZyBub3QgaW4gYm91bmRzXG4gICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG4gICAgICBpZiggIWJvdW5kcy5jb250YWlucyhmZWF0dXJlLmxhdGxuZykgKSB7XG4gICAgICAgIC8vZmVhdHVyZS5vdXRPZkJvdW5kcyA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoICFib3VuZHMuY29udGFpbnMoZmVhdHVyZS5ib3VuZHMpICYmICFib3VuZHMuaW50ZXJzZWN0cyhmZWF0dXJlLmJvdW5kcykgKSB7XG4gICAgICAgIC8vZmVhdHVyZS5vdXRPZkJvdW5kcyA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgZmVhdHVyZSB3YXMgb3V0IG9mIGJvdW5kcyBsYXN0IHRpbWUgd2Ugd2FudCB0byByZXByb2plY3RcbiAgICAvL2ZlYXR1cmUub3V0T2ZCb3VuZHMgPSBmYWxzZTtcblxuICAgIC8vIGNhbGwgZmVhdHVyZSByZW5kZXIgZnVuY3Rpb24gaW4gZmVhdHVyZSBzY29wZTsgZmVhdHVyZSBpcyBwYXNzZWQgYXMgd2VsbFxuICAgIGZlYXR1cmUucmVuZGVyLmNhbGwoZmVhdHVyZSwgdGhpcy5fY3R4LCBmZWF0dXJlLmNhY2hlLmdlb1hZLCB0aGlzLl9tYXAsIGZlYXR1cmUpO1xuICB9LFxuXG4gIF9jYWxjR2VvWFkgOiBmdW5jdGlvbihmZWF0dXJlLCB6b29tKSB7XG4gICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYSBjYWNoZSBuYW1lc3BhY2UgYW5kIHNldCB0aGUgem9vbSBsZXZlbFxuICAgIGlmKCAhZmVhdHVyZS5jYWNoZSApIGZlYXR1cmUuY2FjaGUgPSB7fTtcbiAgICBmZWF0dXJlLmNhY2hlLnpvb20gPSB6b29tO1xuXG4gICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXVxuICAgICAgXSk7XG5cbiAgICAgIGlmKCBmZWF0dXJlLnNpemUgKSB7XG4gICAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFlbMF0gPSBmZWF0dXJlLmNhY2hlLmdlb1hZWzBdIC0gZmVhdHVyZS5zaXplIC8gMjtcbiAgICAgICAgZmVhdHVyZS5jYWNoZS5nZW9YWVsxXSA9IGZlYXR1cmUuY2FjaGUuZ2VvWFlbMV0gLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG4gICAgICBmZWF0dXJlLmNhY2hlLmdlb1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMsIHRoaXMuX21hcCk7XG5cbiAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICBmZWF0dXJlLmNhY2hlLmdlb1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0sIHRoaXMuX21hcCk7XG4gICAgfVxuICB9LFxuXG4gIGFkZEZlYXR1cmVzIDogZnVuY3Rpb24oZmVhdHVyZXMpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmFkZEZlYXR1cmUodGhpcy5mZWF0dXJlc1tpXSk7XG4gICAgfVxuICB9LFxuXG4gIGFkZEZlYXR1cmUgOiBmdW5jdGlvbihmZWF0dXJlLCBib3R0b20pIHtcbiAgICBpZiggIWZlYXR1cmUuZ2VvanNvbiApIHJldHVybjtcbiAgICBpZiggIWZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeSApIHJldHVybjtcblxuICAgIGlmKCB0eXBlb2YgZmVhdHVyZS52aXNpYmxlID09PSAndW5kZWZpbmVkJyApIGZlYXR1cmUudmlzaWJsZSA9IHRydWU7XG4gICAgZmVhdHVyZS5jYWNoZSA9IG51bGw7XG5cbiAgICBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgZmVhdHVyZS5ib3VuZHMgPSB0aGlzLnV0aWxzLmNhbGNCb3VuZHMoZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcblxuICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgIGZlYXR1cmUuYm91bmRzID0gdGhpcy51dGlscy5jYWxjQm91bmRzKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG5cbiAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuICAgICAgZmVhdHVyZS5sYXRsbmcgPSBMLmxhdExuZyhmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdHZW9KU09OIGZlYXR1cmUgdHlwZSBcIicrZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUrJ1wiIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICBjb25zb2xlLmxvZyhmZWF0dXJlLmdlb2pzb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCBib3R0b20gKSB7IC8vIGJvdHRvbSBvciBpbmRleFxuICAgICAgaWYoIHR5cGVvZiBib3R0b20gPT09ICdudW1iZXInKSB0aGlzLmZlYXR1cmVzLnNwbGljZShib3R0b20sIDAsIGZlYXR1cmUpO1xuICAgICAgZWxzZSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICB9XG4gIH0sXG5cbiAgYWRkRmVhdHVyZUJvdHRvbSA6IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICB0aGlzLmFkZEZlYXR1cmUoZmVhdHVyZSwgdHJ1ZSk7XG4gIH0sXG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHJlLXJlbmRlciByZXF1aXJlZC4gIGllIHRoZSBmZWF0dXJlIHdhcyB2aXNpYmxlO1xuICByZW1vdmVGZWF0dXJlIDogZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZmVhdHVyZXMuaW5kZXhPZihmZWF0dXJlKTtcbiAgICBpZiggaW5kZXggPT0gLTEgKSByZXR1cm47XG5cbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiggdGhpcy5mZWF0dXJlLnZpc2libGUgKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHQsIGRpZmZcbiAgICBpZiggdGhpcy5kZWJ1ZyApIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgIHZhciBkaWZmID0gbnVsbDtcbiAgICBpZiggZSAmJiBlLnR5cGUgPT0gJ21vdmUnICkge1xuICAgICAgdmFyIGNlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcblxuICAgICAgdmFyIHB0ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoY2VudGVyKTtcbiAgICAgIGlmKCB0aGlzLmxhc3RDZW50ZXJMTCApIHtcbiAgICAgICAgdmFyIGxhc3RYeSA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KHRoaXMubGFzdENlbnRlckxMKTtcbiAgICAgICAgZGlmZiA9IHtcbiAgICAgICAgICB4IDogbGFzdFh5LnggLSBwdC54LFxuICAgICAgICAgIHkgOiBsYXN0WHkueSAtIHB0LnlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmxhc3RDZW50ZXJMTCA9IGNlbnRlcjtcbiAgICB9XG5cbiAgICB2YXIgdG9wTGVmdCA9IHRoaXMuX21hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgIEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jYW52YXMsIHRvcExlZnQpO1xuXG4gICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgLy8gY2xlYXIgY2FudmFzXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgaWYoICF0aGlzLnpvb21pbmcgKSB0aGlzLnJlZHJhdyhkaWZmKTtcblxuICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgZGlmZiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdDtcblxuICAgICAgdmFyIGMgPSAwO1xuICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggIXRoaXMuZmVhdHVyZXNbaV0uY2FjaGUuZ2VvWFkgKSBjb250aW51ZTtcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkodGhpcy5mZWF0dXJlc1tpXS5jYWNoZS5nZW9YWSkgKSBjICs9IHRoaXMuZmVhdHVyZXNbaV0uY2FjaGUuZ2VvWFkubGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICBjb25zb2xlLmxvZygnUmVuZGVyZWQgJytjKycgcHRzIGluICcrZGlmZisnbXMnKTtcbiAgICB9XG4gIH0sXG5cbiAgLypcbiAgICByZXR1cm4gbGlzdCBvZiBhbGwgaW50ZXJzZWN0aW5nIGdlb21ldHJ5IHJlZ3JhZGxlc3MgaXMgY3VycmVudGx5IHZpc2libGVcblxuICAgIHB4UmFkaXVzIC0gaXMgZm9yIGxpbmVzIGFuZCBwb2ludHMgb25seS4gIEJhc2ljYWxseSBob3cgZmFyIG9mZiB0aGUgbGluZSBvclxuICAgIG9yIHBvaW50IGEgbGF0bG5nIGNhbiBiZSBhbmQgc3RpbGwgYmUgY29uc2lkZXJlZCBpbnRlcnNlY3RpbmcuICBUaGlzIGlzXG4gICAgZ2l2ZW4gaW4gcHggYXMgaXQgaXMgY29tcGVuc2F0aW5nIGZvciB1c2VyIGludGVudCB3aXRoIG1vdXNlIGNsaWNrIG9yIHRvdWNoLlxuICAgIFRoZSBwb2ludCBtdXN0IGxheSBpbnNpZGUgdG8gcG9seWdvbiBmb3IgYSBtYXRjaC5cbiAgKi9cbiAgZ2V0QWxsSW50ZXJzZWN0aW5nR2VvbWV0cnkgOiBmdW5jdGlvbihsYXRsbmcsIHB4UmFkaXVzKSB7XG4gICAgdmFyIG1wcCA9IHRoaXMudXRpbHMubWV0ZXJzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICAgIHZhciByID0gbXBwICogKHB4UmFkaXVzIHx8IDUpOyAvLyA1IHB4IHJhZGl1cyBidWZmZXI7XG5cbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgdHlwZSA6ICdQb2ludCcsXG4gICAgICBjb29yZGluYXRlcyA6IFtsYXRsbmcubG5nLCBsYXRsbmcubGF0XVxuICAgIH07XG4gICAgdmFyIHpvb20gPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xuICAgIHZhciBjb250YWluZXJQb2ludCA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGxhdGxuZyk7XG5cbiAgICB2YXIgZjtcbiAgICB2YXIgaW50ZXJzZWN0cyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG5cbiAgICAgIGlmKCAhZi5nZW9qc29uLmdlb21ldHJ5ICkgY29udGludWU7XG4gICAgICBpZiggZi5ib3VuZHMgJiYgIWYuYm91bmRzLmNvbnRhaW5zKGxhdGxuZykgKSBjb250aW51ZTtcblxuICAgICAgaWYoICFmLmNhY2hlICkgdGhpcy5fY2FsY0dlb1hZKGYsIHpvb20pO1xuICAgICAgZWxzZSBpZiggIWYuY2FjaGUuZ2VvWFkgKSB0aGlzLl9jYWxjR2VvWFkoZiwgem9vbSk7XG5cbiAgICAgIGlmKCB0aGlzLnV0aWxzLmdlb21ldHJ5V2l0aGluUmFkaXVzKGYuZ2VvanNvbi5nZW9tZXRyeSwgZi5jYWNoZS5nZW9YWSwgY2VudGVyLCBjb250YWluZXJQb2ludCwgcikgKSB7XG4gICAgICAgIGludGVyc2VjdHMucHVzaChmKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaW50ZXJzZWN0cztcbiAgfSxcblxuICAvLyBnZXQgdGhlIG1ldGVycyBwZXIgcHggYW5kIGEgY2VydGFpbiBwb2ludDtcbiAgZ2V0TWV0ZXJzUGVyUHggOiBmdW5jdGlvbihsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5tZXRlcnNQZXJQeChsYXRsbmcsIHRoaXMuX21hcCk7XG4gIH0sXG5cbiAgX2ludGVyc2VjdHMgOiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgbXBwID0gdGhpcy5nZXRNZXRlcnNQZXJQeChlLmxhdGxuZyk7XG4gICAgdmFyIHIgPSBtcHAgKiA1OyAvLyA1IHB4IHJhZGl1cyBidWZmZXI7XG5cbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgdHlwZSA6ICdQb2ludCcsXG4gICAgICBjb29yZGluYXRlcyA6IFtlLmxhdGxuZy5sbmcsIGUubGF0bG5nLmxhdF1cbiAgICB9O1xuXG4gICAgdmFyIGY7XG4gICAgdmFyIGludGVyc2VjdHMgPSBbXTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGYgPSB0aGlzLmZlYXR1cmVzW2ldO1xuXG4gICAgICBpZiggIWYudmlzaWJsZSApIGNvbnRpbnVlO1xuICAgICAgaWYoICFmLmdlb2pzb24uZ2VvbWV0cnkgKSBjb250aW51ZTtcbiAgICAgIGlmKCAhZi5jYWNoZSApIGNvbnRpbnVlO1xuICAgICAgaWYoICFmLmNhY2hlLmdlb1hZICkgY29udGludWU7XG4gICAgICBpZiggZi5ib3VuZHMgJiYgIWYuYm91bmRzLmNvbnRhaW5zKGUubGF0bG5nKSApIGNvbnRpbnVlO1xuXG4gICAgICBpZiggdGhpcy51dGlscy5nZW9tZXRyeVdpdGhpblJhZGl1cyhmLmdlb2pzb24uZ2VvbWV0cnksIGYuY2FjaGUuZ2VvWFksIGNlbnRlciwgZS5jb250YWluZXJQb2ludCwgZi5zaXplID8gKGYuc2l6ZSAqIG1wcCkgOiByKSApIHtcbiAgICAgICAgaW50ZXJzZWN0cy5wdXNoKGYuZ2VvanNvbik7XG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBpZiggZS50eXBlID09ICdjbGljaycgJiYgdGhpcy5vbkNsaWNrICkge1xuICAgICAgdGhpcy5vbkNsaWNrKGludGVyc2VjdHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBtb3VzZW92ZXIgPSBbXSwgbW91c2VvdXQgPSBbXSwgbW91c2Vtb3ZlID0gW107XG5cbiAgICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgaW50ZXJzZWN0cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmludGVyc2VjdExpc3QuaW5kZXhPZihpbnRlcnNlY3RzW2ldKSA+IC0xICkge1xuICAgICAgICBtb3VzZW1vdmUucHVzaChpbnRlcnNlY3RzW2ldKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBtb3VzZW92ZXIucHVzaChpbnRlcnNlY3RzW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuaW50ZXJzZWN0TGlzdC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCBpbnRlcnNlY3RzLmluZGV4T2YodGhpcy5pbnRlcnNlY3RMaXN0W2ldKSA9PSAtMSApIHtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdXNlb3V0LnB1c2godGhpcy5pbnRlcnNlY3RMaXN0W2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmludGVyc2VjdExpc3QgPSBpbnRlcnNlY3RzO1xuXG4gICAgaWYoIHRoaXMub25Nb3VzZU92ZXIgJiYgbW91c2VvdmVyLmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VPdmVyLmNhbGwodGhpcywgbW91c2VvdmVyKTtcbiAgICBpZiggdGhpcy5vbk1vdXNlTW92ZSAmJiBtb3VzZW1vdmUubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU1vdmUuY2FsbCh0aGlzLCBtb3VzZW1vdmUpO1xuICAgIGlmKCB0aGlzLm9uTW91c2VPdXQgJiYgbW91c2VvdXQubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU91dC5jYWxsKHRoaXMsIG1vdXNlb3V0KTtcblxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coJ2ludGVyc2VjdHMgdGltZTogJysobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSsnbXMnKTtcblxuICAgIGlmKCBjaGFuZ2VkICkgdGhpcy5yZW5kZXIoKTtcbiAgfVxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbW92ZUxpbmUgOiBmdW5jdGlvbihjb29yZHMsIGRpZmYpIHtcbiAgICB2YXIgaTsgbGVuID0gY29vcmRzLmxlbmd0aDtcbiAgICBmb3IoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBjb29yZHNbaV0ueCArPSBkaWZmLng7XG4gICAgICBjb29yZHNbaV0ueSArPSBkaWZmLnk7XG4gICAgfVxuICB9LFxuXG4gIHByb2plY3RMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBtYXApIHtcbiAgICB2YXIgeHlMaW5lID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHh5TGluZS5wdXNoKG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICBjb29yZHNbaV1bMV0sIGNvb3Jkc1tpXVswXVxuICAgICAgXSkpO1xuICAgIH1cblxuICAgIHJldHVybiB4eUxpbmU7XG4gIH0sXG5cbiAgY2FsY0JvdW5kcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4bWluID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB4bWF4ID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB5bWluID0gY29vcmRzWzBdWzBdO1xuICAgIHZhciB5bWF4ID0gY29vcmRzWzBdWzBdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDE7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggeG1pbiA+IGNvb3Jkc1tpXVsxXSApIHhtaW4gPSBjb29yZHNbaV1bMV07XG4gICAgICBpZiggeG1heCA8IGNvb3Jkc1tpXVsxXSApIHhtYXggPSBjb29yZHNbaV1bMV07XG5cbiAgICAgIGlmKCB5bWluID4gY29vcmRzW2ldWzBdICkgeW1pbiA9IGNvb3Jkc1tpXVswXTtcbiAgICAgIGlmKCB5bWF4IDwgY29vcmRzW2ldWzBdICkgeW1heCA9IGNvb3Jkc1tpXVswXTtcbiAgICB9XG5cbiAgICB2YXIgc291dGhXZXN0ID0gTC5sYXRMbmcoeG1pbi0uMDEsIHltaW4tLjAxKTtcbiAgICB2YXIgbm9ydGhFYXN0ID0gTC5sYXRMbmcoeG1heCsuMDEsIHltYXgrLjAxKTtcblxuICAgIHJldHVybiBMLmxhdExuZ0JvdW5kcyhzb3V0aFdlc3QsIG5vcnRoRWFzdCk7XG4gIH0sXG5cbiAgZ2VvbWV0cnlXaXRoaW5SYWRpdXMgOiBmdW5jdGlvbihnZW9tZXRyeSwgeHlQb2ludHMsIGNlbnRlciwgeHlQb2ludCwgcmFkaXVzKSB7XG4gICAgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnREaXN0YW5jZShnZW9tZXRyeSwgY2VudGVyKSA8PSByYWRpdXM7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgZm9yKCB2YXIgaSA9IDE7IGkgPCB4eVBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoIHRoaXMubGluZUludGVyc2VjdHNDaXJjbGUoeHlQb2ludHNbaS0xXSwgeHlQb2ludHNbaV0sIHh5UG9pbnQsIDMpICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludEluUG9seWdvbihjZW50ZXIsIGdlb21ldHJ5KTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzI3NTUyOS9jaGVjay1pZi1saW5lLWludGVyc2VjdHMtd2l0aC1jaXJjbGVzLXBlcmltZXRlclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EaXN0YW5jZV9mcm9tX2FfcG9pbnRfdG9fYV9saW5lXG4gIC8vIFtsbmcgeCwgbGF0LCB5XVxuICBsaW5lSW50ZXJzZWN0c0NpcmNsZSA6IGZ1bmN0aW9uKGxpbmVQMSwgbGluZVAyLCBwb2ludCwgcmFkaXVzKSB7XG4gICAgdmFyIGRpc3RhbmNlID1cbiAgICAgIE1hdGguYWJzKFxuICAgICAgICAoKGxpbmVQMi55IC0gbGluZVAxLnkpKnBvaW50LngpIC0gKChsaW5lUDIueCAtIGxpbmVQMS54KSpwb2ludC55KSArIChsaW5lUDIueCpsaW5lUDEueSkgLSAobGluZVAyLnkqbGluZVAxLngpXG4gICAgICApIC9cbiAgICAgIE1hdGguc3FydChcbiAgICAgICAgTWF0aC5wb3cobGluZVAyLnkgLSBsaW5lUDEueSwgMikgKyBNYXRoLnBvdyhsaW5lUDIueCAtIGxpbmVQMS54LCAyKVxuICAgICAgKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPD0gcmFkaXVzO1xuICB9LFxuXG4gIC8vIGh0dHA6Ly93aWtpLm9wZW5zdHJlZXRtYXAub3JnL3dpa2kvWm9vbV9sZXZlbHNcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzU0NTA5OC9sZWFmbGV0LWNhbGN1bGF0aW5nLW1ldGVycy1wZXItcGl4ZWwtYXQtem9vbS1sZXZlbFxuICBtZXRlcnNQZXJQeCA6IGZ1bmN0aW9uKGxsLCBtYXApIHtcbiAgICB2YXIgcG9pbnRDID0gbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGwpOyAvLyBjb252ZXJ0IHRvIGNvbnRhaW5lcnBvaW50IChwaXhlbHMpXG4gICAgdmFyIHBvaW50WCA9IFtwb2ludEMueCArIDEsIHBvaW50Qy55XTsgLy8gYWRkIG9uZSBwaXhlbCB0byB4XG5cbiAgICAvLyBjb252ZXJ0IGNvbnRhaW5lcnBvaW50cyB0byBsYXRsbmcnc1xuICAgIHZhciBsYXRMbmdDID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRDKTtcbiAgICB2YXIgbGF0TG5nWCA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50WCk7XG5cbiAgICB2YXIgZGlzdGFuY2VYID0gbGF0TG5nQy5kaXN0YW5jZVRvKGxhdExuZ1gpOyAvLyBjYWxjdWxhdGUgZGlzdGFuY2UgYmV0d2VlbiBjIGFuZCB4IChsYXRpdHVkZSlcbiAgICByZXR1cm4gZGlzdGFuY2VYO1xuICB9LFxuXG4gIC8vIGZyb20gaHR0cDovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWxcbiAgcG9pbnREaXN0YW5jZSA6IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHZhciBsb24xID0gcHQxLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MSA9IHB0MS5jb29yZGluYXRlc1sxXSxcbiAgICAgIGxvbjIgPSBwdDIuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQyID0gcHQyLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgZExhdCA9IHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MiAtIGxhdDEpLFxuICAgICAgZExvbiA9IHRoaXMubnVtYmVyVG9SYWRpdXMobG9uMiAtIGxvbjEpLFxuICAgICAgYSA9IE1hdGgucG93KE1hdGguc2luKGRMYXQgLyAyKSwgMikgKyBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDEpKVxuICAgICAgICAqIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MikpICogTWF0aC5wb3coTWF0aC5zaW4oZExvbiAvIDIpLCAyKSxcbiAgICAgIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xuICAgIHJldHVybiAoNjM3MSAqIGMpICogMTAwMDsgLy8gcmV0dXJucyBtZXRlcnNcbiAgfSxcblxuICBwb2ludEluUG9seWdvbiA6IGZ1bmN0aW9uIChwLCBwb2x5KSB7XG4gICAgdmFyIGNvb3JkcyA9IChwb2x5LnR5cGUgPT0gXCJQb2x5Z29uXCIpID8gWyBwb2x5LmNvb3JkaW5hdGVzIF0gOiBwb2x5LmNvb3JkaW5hdGVzXG5cbiAgICB2YXIgaW5zaWRlQm94ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG9pbnRJbkJvdW5kaW5nQm94KHAsIHRoaXMuYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzKGNvb3Jkc1tpXSkpKSBpbnNpZGVCb3ggPSB0cnVlXG4gICAgfVxuICAgIGlmICghaW5zaWRlQm94KSByZXR1cm4gZmFsc2VcblxuICAgIHZhciBpbnNpZGVQb2x5ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG5wb2x5KHAuY29vcmRpbmF0ZXNbMV0sIHAuY29vcmRpbmF0ZXNbMF0sIGNvb3Jkc1tpXSkpIGluc2lkZVBvbHkgPSB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVBvbHlcbiAgfSxcblxuICBwb2ludEluQm91bmRpbmdCb3ggOiBmdW5jdGlvbiAocG9pbnQsIGJvdW5kcykge1xuICAgIHJldHVybiAhKHBvaW50LmNvb3JkaW5hdGVzWzFdIDwgYm91bmRzWzBdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzFdID4gYm91bmRzWzFdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdIDwgYm91bmRzWzBdWzFdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdID4gYm91bmRzWzFdWzFdKVxuICB9LFxuXG4gIGJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3JkcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4QWxsID0gW10sIHlBbGwgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHNbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHhBbGwucHVzaChjb29yZHNbMF1baV1bMV0pXG4gICAgICB5QWxsLnB1c2goY29vcmRzWzBdW2ldWzBdKVxuICAgIH1cblxuICAgIHhBbGwgPSB4QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICB5QWxsID0geUFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG5cbiAgICByZXR1cm4gWyBbeEFsbFswXSwgeUFsbFswXV0sIFt4QWxsW3hBbGwubGVuZ3RoIC0gMV0sIHlBbGxbeUFsbC5sZW5ndGggLSAxXV0gXVxuICB9LFxuXG4gIC8vIFBvaW50IGluIFBvbHlnb25cbiAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbCNMaXN0aW5nIHRoZSBWZXJ0aWNlc1xuICBwbnBvbHkgOiBmdW5jdGlvbih4LHksY29vcmRzKSB7XG4gICAgdmFyIHZlcnQgPSBbIFswLDBdIF1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvb3Jkc1tpXS5sZW5ndGg7IGorKykge1xuICAgICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldW2pdKVxuICAgICAgfVxuICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVswXSlcbiAgICAgIHZlcnQucHVzaChbMCwwXSlcbiAgICB9XG5cbiAgICB2YXIgaW5zaWRlID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZlcnQubGVuZ3RoIC0gMTsgaSA8IHZlcnQubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICBpZiAoKCh2ZXJ0W2ldWzBdID4geSkgIT0gKHZlcnRbal1bMF0gPiB5KSkgJiYgKHggPCAodmVydFtqXVsxXSAtIHZlcnRbaV1bMV0pICogKHkgLSB2ZXJ0W2ldWzBdKSAvICh2ZXJ0W2pdWzBdIC0gdmVydFtpXVswXSkgKyB2ZXJ0W2ldWzFdKSkgaW5zaWRlID0gIWluc2lkZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVcbiAgfSxcblxuICBudW1iZXJUb1JhZGl1cyA6IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICByZXR1cm4gbnVtYmVyICogTWF0aC5QSSAvIDE4MDtcbiAgfVxufTtcbiJdfQ==
