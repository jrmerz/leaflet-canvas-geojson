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

  // get layer feature via geojson object
  getFeatureForGeojson : function(geojson) {
    for( var i = 0; i < this.features.length; i++ ) {
      if( this.features[i].geojson == geojson ) return this.features[i];
    }

    return null;
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

    if( this.onMouseOver && mouseover.length > 0 ) this.onMouseOver.call(this, mouseover, e);
    if( this.onMouseMove && mousemove.length > 0 ) this.onMouseMove.call(this, mousemove, e);
    if( this.onMouseOut && mouseout.length > 0 ) this.onMouseOut.call(this, mouseout, e);

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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9sYXllciIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1ZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAgQSBGZWF0dXJlIHNob3VsZCBoYXZlIHRoZSBmb2xsb3dpbmc6XG5cbiAgZmVhdHVyZSA9IHtcbiAgICB2aXNpYmxlIDogQm9vbGVhbixcbiAgICBzaXplIDogTnVtYmVyLCAvLyBwb2ludHMgb25seSwgdXNlZCBmb3IgbW91c2UgaW50ZXJhY3Rpb25zXG4gICAgZ2VvanNvbiA6IHt9XG4gICAgcmVuZGVyIDogZnVuY3Rpb24oY29udGV4dCwgY29vcmRpbmF0ZXNJblhZLCBtYXApIHt9IC8vIGNhbGxlZCBpbiBmZWF0dXJlIHNjb3BlXG4gIH1cblxuICBnZW9YWSBhbmQgbGVhZmxldCB3aWxsIGJlIGFzc2lnbmVkXG4qKi9cblxuTC5DYW52YXNHZW9qc29uTGF5ZXIgPSBMLkNsYXNzLmV4dGVuZCh7XG4gIC8vIHNob3cgbGF5ZXIgdGltaW5nXG4gIGRlYnVnIDogZmFsc2UsXG5cbiAgLy8gaW5jbHVkZSBldmVudHNcbiAgaW5jbHVkZXM6IFtMLk1peGluLkV2ZW50c10sXG5cbiAgLy8gbGlzdCBvZiBnZW9qc29uIGZlYXR1cmVzIHRvIGRyYXdcbiAgLy8gICAtIHRoZXNlIHdpbGwgZHJhdyBpbiBvcmRlclxuICBmZWF0dXJlcyA6IFtdLFxuXG4gIC8vIGxpc3Qgb2YgY3VycmVudCBmZWF0dXJlcyB1bmRlciB0aGUgbW91c2VcbiAgaW50ZXJzZWN0TGlzdCA6IFtdLFxuXG4gIC8vIHVzZWQgdG8gY2FsY3VsYXRlIHBpeGVscyBtb3ZlZCBmcm9tIGNlbnRlclxuICBsYXN0Q2VudGVyTEwgOiBudWxsLFxuXG4gIC8vIGdlb21ldHJ5IGhlbHBlcnNcbiAgdXRpbHMgOiByZXF1aXJlKCcuL3V0aWxzJyksXG5cbiAgLy8gaW5pdGlhbGl6ZSBsYXllclxuICBpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG5cbiAgICAvLyBtb3ZlIG1vdXNlIGV2ZW50IGhhbmRsZXJzIHRvIGxheWVyIHNjb3BlXG4gICAgdmFyIG1vdXNlRXZlbnRzID0gWydvbk1vdXNlT3ZlcicsICdvbk1vdXNlTW92ZScsICdvbk1vdXNlT3V0JywgJ29uQ2xpY2snXTtcbiAgICBtb3VzZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuICAgICAgaWYoICF0aGlzLm9wdGlvbnNbZV0gKSByZXR1cm47XG4gICAgICB0aGlzW2VdID0gdGhpcy5vcHRpb25zW2VdO1xuICAgICAgZGVsZXRlIHRoaXMub3B0aW9uc1tlXTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gc2V0IGNhbnZhcyBhbmQgY2FudmFzIGNvbnRleHQgc2hvcnRjdXRzXG4gICAgdGhpcy5fY2FudmFzID0gdGhpcy5fY3JlYXRlQ2FudmFzKCk7XG4gICAgdGhpcy5fY3R4ID0gdGhpcy5fY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIH0sXG5cbiAgX2NyZWF0ZUNhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IHRoaXMub3B0aW9ucy56SW5kZXggfHwgMDtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtdGlsZS1jb250YWluZXIgbGVhZmxldC16b29tLWFuaW1hdGVkJztcbiAgICBjYW52YXMuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIGNhbnZhcztcbiAgfSxcblxuICBvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcblxuICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAvLyB0aGUgY29udGFpbmVyIGlzIG1vdmVkIGluIHRoZSBvcG9zaXRlIGRpcmVjdGlvbiBvZiB0aGVcbiAgICAvLyBtYXAgcGFuZSB0byBrZWVwIHRoZSBjYW52YXMgYWx3YXlzIGluICgwLCAwKVxuICAgIHZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMudGlsZVBhbmU7XG4gICAgdmFyIF9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1sYXllcicpO1xuXG4gICAgX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jYW52YXMpO1xuICAgIHRpbGVQYW5lLmFwcGVuZENoaWxkKF9jb250YWluZXIpO1xuXG4gICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgIC8vIGhhY2s6IGxpc3RlbiB0byBwcmVkcmFnIGV2ZW50IGxhdW5jaGVkIGJ5IGRyYWdnaW5nIHRvXG4gICAgLy8gc2V0IGNvbnRhaW5lciBpbiBwb3NpdGlvbiAoMCwgMCkgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgaWYgKG1hcC5kcmFnZ2luZy5lbmFibGVkKCkpIHtcbiAgICAgIG1hcC5kcmFnZ2luZy5fZHJhZ2dhYmxlLm9uKCdwcmVkcmFnJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkID0gbWFwLmRyYWdnaW5nLl9kcmFnZ2FibGU7XG4gICAgICAgIEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jYW52YXMsIHsgeDogLWQuX25ld1Bvcy54LCB5OiAtZC5fbmV3UG9zLnkgfSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBtYXAub24oe1xuICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLl9yZXNldCxcbiAgICAgICdyZXNpemUnICAgIDogdGhpcy5fcmVzZXQsXG4gICAgICAnbW92ZScgICAgICA6IHRoaXMucmVuZGVyLFxuICAgICAgJ3pvb21zdGFydCcgOiB0aGlzLl9zdGFydFpvb20sXG4gICAgICAnem9vbWVuZCcgICA6IHRoaXMuX2VuZFpvb20sXG4gICAgICAnbW91c2Vtb3ZlJyA6IHRoaXMuX2ludGVyc2VjdHMsXG4gICAgICAnY2xpY2snICAgICA6IHRoaXMuX2ludGVyc2VjdHNcbiAgICB9LCB0aGlzKTtcblxuICAgIHRoaXMuX3Jlc2V0KCk7XG4gIH0sXG5cbiAgX3N0YXJ0Wm9vbTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB0aGlzLnpvb21pbmcgPSB0cnVlO1xuICB9LFxuXG4gIF9lbmRab29tOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgc2V0VGltZW91dCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpLCA1MCk7XG4gIH0sXG5cbiAgZ2V0Q2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3Jlc2V0KCk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcbiAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgIG1hcC5vZmYoe1xuICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLl9yZXNldCxcbiAgICAgICdyZXNpemUnICAgIDogdGhpcy5fcmVzZXQsXG4gICAgICAnbW92ZScgICAgICA6IHRoaXMucmVuZGVyLFxuICAgICAgJ3pvb21zdGFydCcgOiB0aGlzLl9zdGFydFpvb20sXG4gICAgICAnem9vbWVuZCcgICA6IHRoaXMuX2VuZFpvb20sXG4gICAgICAnbW91c2Vtb3ZlJyA6IHRoaXMuX2ludGVyc2VjdHMsXG4gICAgICAnY2xpY2snICAgICA6IHRoaXMuX2ludGVyc2VjdHNcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyByZXNldCBhY3R1YWwgY2FudmFzIHNpemVcbiAgICB2YXIgc2l6ZSA9IHRoaXMuX21hcC5nZXRTaXplKCk7XG4gICAgdGhpcy5fY2FudmFzLndpZHRoID0gc2l6ZS54O1xuICAgIHRoaXMuX2NhbnZhcy5oZWlnaHQgPSBzaXplLnk7XG5cbiAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgLy8gY2xlYXIgZWFjaCBmZWF0dXJlcyBjYWNoZVxuICBjbGVhckNhY2hlIDogZnVuY3Rpb24oKSB7XG4gICAgLy8ga2lsbCB0aGUgZmVhdHVyZSBwb2ludCBjYWNoZVxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuY2xlYXJGZWF0dXJlQ2FjaGUoIHRoaXMuZmVhdHVyZXNbaV0gKTtcbiAgICB9XG4gIH0sXG5cbiAgY2xlYXJGZWF0dXJlQ2FjaGUgOiBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgaWYoICFmZWF0dXJlLmNhY2hlICkgcmV0dXJuO1xuICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSBudWxsO1xuICB9LFxuXG4gIC8vIHJlZHJhdyBhbGwgZmVhdHVyZXMuICBUaGlzIGRvZXMgbm90IGhhbmRsZSBjbGVhcmluZyB0aGUgY2FudmFzIG9yIHNldHRpbmdcbiAgLy8gdGhlIGNhbnZhcyBjb3JyZWN0IHBvc2l0aW9uLiAgVGhhdCBpcyBoYW5kbGVkIGJ5IHJlbmRlclxuICByZWRyYXc6IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICAvLyBvYmplY3RzIHNob3VsZCBrZWVwIHRyYWNrIG9mIGxhc3QgYmJveCBhbmQgem9vbSBvZiBtYXBcbiAgICAvLyBpZiB0aGlzIGhhc24ndCBjaGFuZ2VkIHRoZSBsbCAtPiBjb250YWluZXIgcHQgaXMgbm90IG5lZWRlZFxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgdmFyIHpvb20gPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUodGhpcy5mZWF0dXJlc1tpXSwgYm91bmRzLCB6b29tLCBkaWZmKTtcbiAgICB9XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdSZW5kZXIgdGltZTogJysobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSsnbXM7IGF2ZzogJytcbiAgICAgICgobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSAvIHRoaXMuZmVhdHVyZXMubGVuZ3RoKSsnbXMnKTtcbiAgfSxcblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIHJlZHJhd0ZlYXR1cmUgOiBmdW5jdGlvbihmZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYpIHtcbiAgICAvL2lmKCBmZWF0dXJlLmdlb2pzb24ucHJvcGVydGllcy5kZWJ1ZyApIGRlYnVnZ2VyO1xuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIGZsYWdnZWQgYXMgaGlkZGVuXG4gICAgLy8gd2UgZG8gbmVlZCB0byBjbGVhciB0aGUgY2FjaGUgaW4gdGhpcyBjYXNlXG4gICAgaWYoICFmZWF0dXJlLnZpc2libGUgKSB7XG4gICAgICB0aGlzLmNsZWFyRmVhdHVyZUNhY2hlKGZlYXR1cmUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIG5vdyBsZXRzIGNoZWNrIGNhY2hlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlcHJvamVjdCB0aGVcbiAgICAvLyB4eSBjb29yZGluYXRlc1xuICAgIHZhciByZXByb2plY3QgPSB0cnVlO1xuICAgIGlmKCBmZWF0dXJlLmNhY2hlICkge1xuICAgICAgaWYoIGZlYXR1cmUuY2FjaGUuem9vbSA9PSB6b29tICYmIGZlYXR1cmUuY2FjaGUuZ2VvWFkgKSB7XG4gICAgICAgIHJlcHJvamVjdCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGFjdHVhbGx5IHByb2plY3QgdG8geHkgaWYgbmVlZGVkXG4gICAgaWYoIHJlcHJvamVjdCApIHtcbiAgICAgIHRoaXMuX2NhbGNHZW9YWShmZWF0dXJlLCB6b29tKTtcbiAgICB9ICAvLyBlbmQgcmVwcm9qZWN0XG5cbiAgICAvLyBpZiB0aGlzIHdhcyBhIHNpbXBsZSBwYW4gZXZlbnQgKGEgZGlmZiB3YXMgcHJvdmlkZWQpIGFuZCB3ZSBkaWQgbm90IHJlcHJvamVjdFxuICAgIC8vIG1vdmUgdGhlIGZlYXR1cmUgYnkgZGlmZiB4L3lcbiAgICBpZiggZGlmZiAmJiAhcmVwcm9qZWN0ICkge1xuICAgICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgICAgZmVhdHVyZS5jYWNoZS5nZW9YWS54ICs9IGRpZmYueDtcbiAgICAgICAgZmVhdHVyZS5jYWNoZS5nZW9YWS55ICs9IGRpZmYueTtcblxuICAgICAgfSBlbHNlIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShmZWF0dXJlLmNhY2hlLmdlb1hZLCBkaWZmKTtcblxuICAgICAgfSBlbHNlIGlmICggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGZlYXR1cmUuY2FjaGUuZ2VvWFksIGRpZmYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlnbm9yZSBhbnl0aGluZyBub3QgaW4gYm91bmRzXG4gICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG4gICAgICBpZiggIWJvdW5kcy5jb250YWlucyhmZWF0dXJlLmxhdGxuZykgKSB7XG4gICAgICAgIC8vZmVhdHVyZS5vdXRPZkJvdW5kcyA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoICFib3VuZHMuY29udGFpbnMoZmVhdHVyZS5ib3VuZHMpICYmICFib3VuZHMuaW50ZXJzZWN0cyhmZWF0dXJlLmJvdW5kcykgKSB7XG4gICAgICAgIC8vZmVhdHVyZS5vdXRPZkJvdW5kcyA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB0aGUgZmVhdHVyZSB3YXMgb3V0IG9mIGJvdW5kcyBsYXN0IHRpbWUgd2Ugd2FudCB0byByZXByb2plY3RcbiAgICAvL2ZlYXR1cmUub3V0T2ZCb3VuZHMgPSBmYWxzZTtcblxuICAgIC8vIGNhbGwgZmVhdHVyZSByZW5kZXIgZnVuY3Rpb24gaW4gZmVhdHVyZSBzY29wZTsgZmVhdHVyZSBpcyBwYXNzZWQgYXMgd2VsbFxuICAgIGZlYXR1cmUucmVuZGVyLmNhbGwoZmVhdHVyZSwgdGhpcy5fY3R4LCBmZWF0dXJlLmNhY2hlLmdlb1hZLCB0aGlzLl9tYXAsIGZlYXR1cmUpO1xuICB9LFxuXG4gIF9jYWxjR2VvWFkgOiBmdW5jdGlvbihmZWF0dXJlLCB6b29tKSB7XG4gICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYSBjYWNoZSBuYW1lc3BhY2UgYW5kIHNldCB0aGUgem9vbSBsZXZlbFxuICAgIGlmKCAhZmVhdHVyZS5jYWNoZSApIGZlYXR1cmUuY2FjaGUgPSB7fTtcbiAgICBmZWF0dXJlLmNhY2hlLnpvb20gPSB6b29tO1xuXG4gICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXVxuICAgICAgXSk7XG5cbiAgICAgIGlmKCBmZWF0dXJlLnNpemUgKSB7XG4gICAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFlbMF0gPSBmZWF0dXJlLmNhY2hlLmdlb1hZWzBdIC0gZmVhdHVyZS5zaXplIC8gMjtcbiAgICAgICAgZmVhdHVyZS5jYWNoZS5nZW9YWVsxXSA9IGZlYXR1cmUuY2FjaGUuZ2VvWFlbMV0gLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG4gICAgICBmZWF0dXJlLmNhY2hlLmdlb1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMsIHRoaXMuX21hcCk7XG5cbiAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICBmZWF0dXJlLmNhY2hlLmdlb1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0sIHRoaXMuX21hcCk7XG4gICAgfVxuICB9LFxuXG4gIGFkZEZlYXR1cmVzIDogZnVuY3Rpb24oZmVhdHVyZXMpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmFkZEZlYXR1cmUodGhpcy5mZWF0dXJlc1tpXSk7XG4gICAgfVxuICB9LFxuXG4gIGFkZEZlYXR1cmUgOiBmdW5jdGlvbihmZWF0dXJlLCBib3R0b20pIHtcbiAgICBpZiggIWZlYXR1cmUuZ2VvanNvbiApIHJldHVybjtcbiAgICBpZiggIWZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeSApIHJldHVybjtcblxuICAgIGlmKCB0eXBlb2YgZmVhdHVyZS52aXNpYmxlID09PSAndW5kZWZpbmVkJyApIGZlYXR1cmUudmlzaWJsZSA9IHRydWU7XG4gICAgZmVhdHVyZS5jYWNoZSA9IG51bGw7XG5cbiAgICBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgZmVhdHVyZS5ib3VuZHMgPSB0aGlzLnV0aWxzLmNhbGNCb3VuZHMoZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcblxuICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgIGZlYXR1cmUuYm91bmRzID0gdGhpcy51dGlscy5jYWxjQm91bmRzKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG5cbiAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuICAgICAgZmVhdHVyZS5sYXRsbmcgPSBMLmxhdExuZyhmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdHZW9KU09OIGZlYXR1cmUgdHlwZSBcIicrZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUrJ1wiIG5vdCBzdXBwb3J0ZWQuJyk7XG4gICAgICBjb25zb2xlLmxvZyhmZWF0dXJlLmdlb2pzb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKCBib3R0b20gKSB7IC8vIGJvdHRvbSBvciBpbmRleFxuICAgICAgaWYoIHR5cGVvZiBib3R0b20gPT09ICdudW1iZXInKSB0aGlzLmZlYXR1cmVzLnNwbGljZShib3R0b20sIDAsIGZlYXR1cmUpO1xuICAgICAgZWxzZSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICB9XG4gIH0sXG5cbiAgYWRkRmVhdHVyZUJvdHRvbSA6IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICB0aGlzLmFkZEZlYXR1cmUoZmVhdHVyZSwgdHJ1ZSk7XG4gIH0sXG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHJlLXJlbmRlciByZXF1aXJlZC4gIGllIHRoZSBmZWF0dXJlIHdhcyB2aXNpYmxlO1xuICByZW1vdmVGZWF0dXJlIDogZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZmVhdHVyZXMuaW5kZXhPZihmZWF0dXJlKTtcbiAgICBpZiggaW5kZXggPT0gLTEgKSByZXR1cm47XG5cbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiggdGhpcy5mZWF0dXJlLnZpc2libGUgKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLy8gZ2V0IGxheWVyIGZlYXR1cmUgdmlhIGdlb2pzb24gb2JqZWN0XG4gIGdldEZlYXR1cmVGb3JHZW9qc29uIDogZnVuY3Rpb24oZ2VvanNvbikge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmZlYXR1cmVzW2ldLmdlb2pzb24gPT0gZ2VvanNvbiApIHJldHVybiB0aGlzLmZlYXR1cmVzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIHJlbmRlcjogZnVuY3Rpb24oZSkge1xuICAgIHZhciB0LCBkaWZmXG4gICAgaWYoIHRoaXMuZGVidWcgKSB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICB2YXIgZGlmZiA9IG51bGw7XG4gICAgaWYoIGUgJiYgZS50eXBlID09ICdtb3ZlJyApIHtcbiAgICAgIHZhciBjZW50ZXIgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XG5cbiAgICAgIHZhciBwdCA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGNlbnRlcik7XG4gICAgICBpZiggdGhpcy5sYXN0Q2VudGVyTEwgKSB7XG4gICAgICAgIHZhciBsYXN0WHkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludCh0aGlzLmxhc3RDZW50ZXJMTCk7XG4gICAgICAgIGRpZmYgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYeS54IC0gcHQueCxcbiAgICAgICAgICB5IDogbGFzdFh5LnkgLSBwdC55XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5sYXN0Q2VudGVyTEwgPSBjZW50ZXI7XG4gICAgfVxuXG4gICAgdmFyIHRvcExlZnQgPSB0aGlzLl9tYXAuY29udGFpbmVyUG9pbnRUb0xheWVyUG9pbnQoWzAsIDBdKTtcbiAgICBMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB0b3BMZWZ0KTtcblxuICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIC8vIGNsZWFyIGNhbnZhc1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgIGlmKCAhdGhpcy56b29taW5nICkgdGhpcy5yZWRyYXcoZGlmZik7XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIHtcbiAgICAgIGRpZmYgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQ7XG5cbiAgICAgIHZhciBjID0gMDtcbiAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoICF0aGlzLmZlYXR1cmVzW2ldLmNhY2hlLmdlb1hZICkgY29udGludWU7XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KHRoaXMuZmVhdHVyZXNbaV0uY2FjaGUuZ2VvWFkpICkgYyArPSB0aGlzLmZlYXR1cmVzW2ldLmNhY2hlLmdlb1hZLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coJ1JlbmRlcmVkICcrYysnIHB0cyBpbiAnK2RpZmYrJ21zJyk7XG4gICAgfVxuICB9LFxuXG4gIC8qXG4gICAgcmV0dXJuIGxpc3Qgb2YgYWxsIGludGVyc2VjdGluZyBnZW9tZXRyeSByZWdyYWRsZXNzIGlzIGN1cnJlbnRseSB2aXNpYmxlXG5cbiAgICBweFJhZGl1cyAtIGlzIGZvciBsaW5lcyBhbmQgcG9pbnRzIG9ubHkuICBCYXNpY2FsbHkgaG93IGZhciBvZmYgdGhlIGxpbmUgb3JcbiAgICBvciBwb2ludCBhIGxhdGxuZyBjYW4gYmUgYW5kIHN0aWxsIGJlIGNvbnNpZGVyZWQgaW50ZXJzZWN0aW5nLiAgVGhpcyBpc1xuICAgIGdpdmVuIGluIHB4IGFzIGl0IGlzIGNvbXBlbnNhdGluZyBmb3IgdXNlciBpbnRlbnQgd2l0aCBtb3VzZSBjbGljayBvciB0b3VjaC5cbiAgICBUaGUgcG9pbnQgbXVzdCBsYXkgaW5zaWRlIHRvIHBvbHlnb24gZm9yIGEgbWF0Y2guXG4gICovXG4gIGdldEFsbEludGVyc2VjdGluZ0dlb21ldHJ5IDogZnVuY3Rpb24obGF0bG5nLCBweFJhZGl1cykge1xuICAgIHZhciBtcHAgPSB0aGlzLnV0aWxzLm1ldGVyc1BlclB4KGxhdGxuZywgdGhpcy5fbWFwKTtcbiAgICB2YXIgciA9IG1wcCAqIChweFJhZGl1cyB8fCA1KTsgLy8gNSBweCByYWRpdXMgYnVmZmVyO1xuXG4gICAgdmFyIGNlbnRlciA9IHtcbiAgICAgIHR5cGUgOiAnUG9pbnQnLFxuICAgICAgY29vcmRpbmF0ZXMgOiBbbGF0bG5nLmxuZywgbGF0bG5nLmxhdF1cbiAgICB9O1xuICAgIHZhciB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcbiAgICB2YXIgY29udGFpbmVyUG9pbnQgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChsYXRsbmcpO1xuXG4gICAgdmFyIGY7XG4gICAgdmFyIGludGVyc2VjdHMgPSBbXTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGYgPSB0aGlzLmZlYXR1cmVzW2ldO1xuXG4gICAgICBpZiggIWYuZ2VvanNvbi5nZW9tZXRyeSApIGNvbnRpbnVlO1xuICAgICAgaWYoIGYuYm91bmRzICYmICFmLmJvdW5kcy5jb250YWlucyhsYXRsbmcpICkgY29udGludWU7XG5cbiAgICAgIGlmKCAhZi5jYWNoZSApIHRoaXMuX2NhbGNHZW9YWShmLCB6b29tKTtcbiAgICAgIGVsc2UgaWYoICFmLmNhY2hlLmdlb1hZICkgdGhpcy5fY2FsY0dlb1hZKGYsIHpvb20pO1xuXG4gICAgICBpZiggdGhpcy51dGlscy5nZW9tZXRyeVdpdGhpblJhZGl1cyhmLmdlb2pzb24uZ2VvbWV0cnksIGYuY2FjaGUuZ2VvWFksIGNlbnRlciwgY29udGFpbmVyUG9pbnQsIHIpICkge1xuICAgICAgICBpbnRlcnNlY3RzLnB1c2goZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGludGVyc2VjdHM7XG4gIH0sXG5cbiAgLy8gZ2V0IHRoZSBtZXRlcnMgcGVyIHB4IGFuZCBhIGNlcnRhaW4gcG9pbnQ7XG4gIGdldE1ldGVyc1BlclB4IDogZnVuY3Rpb24obGF0bG5nKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubWV0ZXJzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICB9LFxuXG4gIF9pbnRlcnNlY3RzIDogZnVuY3Rpb24oZSkge1xuICAgIHZhciB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdmFyIG1wcCA9IHRoaXMuZ2V0TWV0ZXJzUGVyUHgoZS5sYXRsbmcpO1xuICAgIHZhciByID0gbXBwICogNTsgLy8gNSBweCByYWRpdXMgYnVmZmVyO1xuXG4gICAgdmFyIGNlbnRlciA9IHtcbiAgICAgIHR5cGUgOiAnUG9pbnQnLFxuICAgICAgY29vcmRpbmF0ZXMgOiBbZS5sYXRsbmcubG5nLCBlLmxhdGxuZy5sYXRdXG4gICAgfTtcblxuICAgIHZhciBmO1xuICAgIHZhciBpbnRlcnNlY3RzID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBmID0gdGhpcy5mZWF0dXJlc1tpXTtcblxuICAgICAgaWYoICFmLnZpc2libGUgKSBjb250aW51ZTtcbiAgICAgIGlmKCAhZi5nZW9qc29uLmdlb21ldHJ5ICkgY29udGludWU7XG4gICAgICBpZiggIWYuY2FjaGUgKSBjb250aW51ZTtcbiAgICAgIGlmKCAhZi5jYWNoZS5nZW9YWSApIGNvbnRpbnVlO1xuICAgICAgaWYoIGYuYm91bmRzICYmICFmLmJvdW5kcy5jb250YWlucyhlLmxhdGxuZykgKSBjb250aW51ZTtcblxuICAgICAgaWYoIHRoaXMudXRpbHMuZ2VvbWV0cnlXaXRoaW5SYWRpdXMoZi5nZW9qc29uLmdlb21ldHJ5LCBmLmNhY2hlLmdlb1hZLCBjZW50ZXIsIGUuY29udGFpbmVyUG9pbnQsIGYuc2l6ZSA/IChmLnNpemUgKiBtcHApIDogcikgKSB7XG4gICAgICAgIGludGVyc2VjdHMucHVzaChmLmdlb2pzb24pO1xuICAgICAgfVxuXG4gICAgfVxuXG4gICAgaWYoIGUudHlwZSA9PSAnY2xpY2snICYmIHRoaXMub25DbGljayApIHtcbiAgICAgIHRoaXMub25DbGljayhpbnRlcnNlY3RzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbW91c2VvdmVyID0gW10sIG1vdXNlb3V0ID0gW10sIG1vdXNlbW92ZSA9IFtdO1xuXG4gICAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGludGVyc2VjdHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggdGhpcy5pbnRlcnNlY3RMaXN0LmluZGV4T2YoaW50ZXJzZWN0c1tpXSkgPiAtMSApIHtcbiAgICAgICAgbW91c2Vtb3ZlLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgbW91c2VvdmVyLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmludGVyc2VjdExpc3QubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggaW50ZXJzZWN0cy5pbmRleE9mKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSkgPT0gLTEgKSB7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgICBtb3VzZW91dC5wdXNoKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gaW50ZXJzZWN0cztcblxuICAgIGlmKCB0aGlzLm9uTW91c2VPdmVyICYmIG1vdXNlb3Zlci5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlT3Zlci5jYWxsKHRoaXMsIG1vdXNlb3ZlciwgZSk7XG4gICAgaWYoIHRoaXMub25Nb3VzZU1vdmUgJiYgbW91c2Vtb3ZlLmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VNb3ZlLmNhbGwodGhpcywgbW91c2Vtb3ZlLCBlKTtcbiAgICBpZiggdGhpcy5vbk1vdXNlT3V0ICYmIG1vdXNlb3V0Lmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VPdXQuY2FsbCh0aGlzLCBtb3VzZW91dCwgZSk7XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdpbnRlcnNlY3RzIHRpbWU6ICcrKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCkrJ21zJyk7XG5cbiAgICBpZiggY2hhbmdlZCApIHRoaXMucmVuZGVyKCk7XG4gIH1cbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vdmVMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBkaWZmKSB7XG4gICAgdmFyIGk7IGxlbiA9IGNvb3Jkcy5sZW5ndGg7XG4gICAgZm9yKCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgY29vcmRzW2ldLnggKz0gZGlmZi54O1xuICAgICAgY29vcmRzW2ldLnkgKz0gZGlmZi55O1xuICAgIH1cbiAgfSxcblxuICBwcm9qZWN0TGluZSA6IGZ1bmN0aW9uKGNvb3JkcywgbWFwKSB7XG4gICAgdmFyIHh5TGluZSA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB4eUxpbmUucHVzaChtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgY29vcmRzW2ldWzFdLCBjb29yZHNbaV1bMF1cbiAgICAgIF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4geHlMaW5lO1xuICB9LFxuXG4gIGNhbGNCb3VuZHMgOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICB2YXIgeG1pbiA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeG1heCA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeW1pbiA9IGNvb3Jkc1swXVswXTtcbiAgICB2YXIgeW1heCA9IGNvb3Jkc1swXVswXTtcblxuICAgIGZvciggdmFyIGkgPSAxOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHhtaW4gPiBjb29yZHNbaV1bMV0gKSB4bWluID0gY29vcmRzW2ldWzFdO1xuICAgICAgaWYoIHhtYXggPCBjb29yZHNbaV1bMV0gKSB4bWF4ID0gY29vcmRzW2ldWzFdO1xuXG4gICAgICBpZiggeW1pbiA+IGNvb3Jkc1tpXVswXSApIHltaW4gPSBjb29yZHNbaV1bMF07XG4gICAgICBpZiggeW1heCA8IGNvb3Jkc1tpXVswXSApIHltYXggPSBjb29yZHNbaV1bMF07XG4gICAgfVxuXG4gICAgdmFyIHNvdXRoV2VzdCA9IEwubGF0TG5nKHhtaW4tLjAxLCB5bWluLS4wMSk7XG4gICAgdmFyIG5vcnRoRWFzdCA9IEwubGF0TG5nKHhtYXgrLjAxLCB5bWF4Ky4wMSk7XG5cbiAgICByZXR1cm4gTC5sYXRMbmdCb3VuZHMoc291dGhXZXN0LCBub3J0aEVhc3QpO1xuICB9LFxuXG4gIGdlb21ldHJ5V2l0aGluUmFkaXVzIDogZnVuY3Rpb24oZ2VvbWV0cnksIHh5UG9pbnRzLCBjZW50ZXIsIHh5UG9pbnQsIHJhZGl1cykge1xuICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50RGlzdGFuY2UoZ2VvbWV0cnksIGNlbnRlcikgPD0gcmFkaXVzO1xuICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgIGZvciggdmFyIGkgPSAxOyBpIDwgeHlQb2ludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmKCB0aGlzLmxpbmVJbnRlcnNlY3RzQ2lyY2xlKHh5UG9pbnRzW2ktMV0sIHh5UG9pbnRzW2ldLCB4eVBvaW50LCAzKSApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJykge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnRJblBvbHlnb24oY2VudGVyLCBnZW9tZXRyeSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIGh0dHA6Ly9tYXRoLnN0YWNrZXhjaGFuZ2UuY29tL3F1ZXN0aW9ucy8yNzU1MjkvY2hlY2staWYtbGluZS1pbnRlcnNlY3RzLXdpdGgtY2lyY2xlcy1wZXJpbWV0ZXJcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRGlzdGFuY2VfZnJvbV9hX3BvaW50X3RvX2FfbGluZVxuICAvLyBbbG5nIHgsIGxhdCwgeV1cbiAgbGluZUludGVyc2VjdHNDaXJjbGUgOiBmdW5jdGlvbihsaW5lUDEsIGxpbmVQMiwgcG9pbnQsIHJhZGl1cykge1xuICAgIHZhciBkaXN0YW5jZSA9XG4gICAgICBNYXRoLmFicyhcbiAgICAgICAgKChsaW5lUDIueSAtIGxpbmVQMS55KSpwb2ludC54KSAtICgobGluZVAyLnggLSBsaW5lUDEueCkqcG9pbnQueSkgKyAobGluZVAyLngqbGluZVAxLnkpIC0gKGxpbmVQMi55KmxpbmVQMS54KVxuICAgICAgKSAvXG4gICAgICBNYXRoLnNxcnQoXG4gICAgICAgIE1hdGgucG93KGxpbmVQMi55IC0gbGluZVAxLnksIDIpICsgTWF0aC5wb3cobGluZVAyLnggLSBsaW5lUDEueCwgMilcbiAgICAgICk7XG4gICAgcmV0dXJuIGRpc3RhbmNlIDw9IHJhZGl1cztcbiAgfSxcblxuICAvLyBodHRwOi8vd2lraS5vcGVuc3RyZWV0bWFwLm9yZy93aWtpL1pvb21fbGV2ZWxzXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1NDUwOTgvbGVhZmxldC1jYWxjdWxhdGluZy1tZXRlcnMtcGVyLXBpeGVsLWF0LXpvb20tbGV2ZWxcbiAgbWV0ZXJzUGVyUHggOiBmdW5jdGlvbihsbCwgbWFwKSB7XG4gICAgdmFyIHBvaW50QyA9IG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGxsKTsgLy8gY29udmVydCB0byBjb250YWluZXJwb2ludCAocGl4ZWxzKVxuICAgIHZhciBwb2ludFggPSBbcG9pbnRDLnggKyAxLCBwb2ludEMueV07IC8vIGFkZCBvbmUgcGl4ZWwgdG8geFxuXG4gICAgLy8gY29udmVydCBjb250YWluZXJwb2ludHMgdG8gbGF0bG5nJ3NcbiAgICB2YXIgbGF0TG5nQyA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50Qyk7XG4gICAgdmFyIGxhdExuZ1ggPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludFgpO1xuXG4gICAgdmFyIGRpc3RhbmNlWCA9IGxhdExuZ0MuZGlzdGFuY2VUbyhsYXRMbmdYKTsgLy8gY2FsY3VsYXRlIGRpc3RhbmNlIGJldHdlZW4gYyBhbmQgeCAobGF0aXR1ZGUpXG4gICAgcmV0dXJuIGRpc3RhbmNlWDtcbiAgfSxcblxuICAvLyBmcm9tIGh0dHA6Ly93d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvbGF0bG9uZy5odG1sXG4gIHBvaW50RGlzdGFuY2UgOiBmdW5jdGlvbiAocHQxLCBwdDIpIHtcbiAgICB2YXIgbG9uMSA9IHB0MS5jb29yZGluYXRlc1swXSxcbiAgICAgIGxhdDEgPSBwdDEuY29vcmRpbmF0ZXNbMV0sXG4gICAgICBsb24yID0gcHQyLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MiA9IHB0Mi5jb29yZGluYXRlc1sxXSxcbiAgICAgIGRMYXQgPSB0aGlzLm51bWJlclRvUmFkaXVzKGxhdDIgLSBsYXQxKSxcbiAgICAgIGRMb24gPSB0aGlzLm51bWJlclRvUmFkaXVzKGxvbjIgLSBsb24xKSxcbiAgICAgIGEgPSBNYXRoLnBvdyhNYXRoLnNpbihkTGF0IC8gMiksIDIpICsgTWF0aC5jb3ModGhpcy5udW1iZXJUb1JhZGl1cyhsYXQxKSlcbiAgICAgICAgKiBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDIpKSAqIE1hdGgucG93KE1hdGguc2luKGRMb24gLyAyKSwgMiksXG4gICAgICBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMSAtIGEpKTtcbiAgICByZXR1cm4gKDYzNzEgKiBjKSAqIDEwMDA7IC8vIHJldHVybnMgbWV0ZXJzXG4gIH0sXG5cbiAgcG9pbnRJblBvbHlnb24gOiBmdW5jdGlvbiAocCwgcG9seSkge1xuICAgIHZhciBjb29yZHMgPSAocG9seS50eXBlID09IFwiUG9seWdvblwiKSA/IFsgcG9seS5jb29yZGluYXRlcyBdIDogcG9seS5jb29yZGluYXRlc1xuXG4gICAgdmFyIGluc2lkZUJveCA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnBvaW50SW5Cb3VuZGluZ0JveChwLCB0aGlzLmJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3Jkcyhjb29yZHNbaV0pKSkgaW5zaWRlQm94ID0gdHJ1ZVxuICAgIH1cbiAgICBpZiAoIWluc2lkZUJveCkgcmV0dXJuIGZhbHNlXG5cbiAgICB2YXIgaW5zaWRlUG9seSA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnBucG9seShwLmNvb3JkaW5hdGVzWzFdLCBwLmNvb3JkaW5hdGVzWzBdLCBjb29yZHNbaV0pKSBpbnNpZGVQb2x5ID0gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVQb2x5XG4gIH0sXG5cbiAgcG9pbnRJbkJvdW5kaW5nQm94IDogZnVuY3Rpb24gKHBvaW50LCBib3VuZHMpIHtcbiAgICByZXR1cm4gIShwb2ludC5jb29yZGluYXRlc1sxXSA8IGJvdW5kc1swXVswXSB8fCBwb2ludC5jb29yZGluYXRlc1sxXSA+IGJvdW5kc1sxXVswXSB8fCBwb2ludC5jb29yZGluYXRlc1swXSA8IGJvdW5kc1swXVsxXSB8fCBwb2ludC5jb29yZGluYXRlc1swXSA+IGJvdW5kc1sxXVsxXSlcbiAgfSxcblxuICBib3VuZGluZ0JveEFyb3VuZFBvbHlDb29yZHMgOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICB2YXIgeEFsbCA9IFtdLCB5QWxsID0gW11cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICB4QWxsLnB1c2goY29vcmRzWzBdW2ldWzFdKVxuICAgICAgeUFsbC5wdXNoKGNvb3Jkc1swXVtpXVswXSlcbiAgICB9XG5cbiAgICB4QWxsID0geEFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgeUFsbCA9IHlBbGwuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiBhIC0gYiB9KVxuXG4gICAgcmV0dXJuIFsgW3hBbGxbMF0sIHlBbGxbMF1dLCBbeEFsbFt4QWxsLmxlbmd0aCAtIDFdLCB5QWxsW3lBbGwubGVuZ3RoIC0gMV1dIF1cbiAgfSxcblxuICAvLyBQb2ludCBpbiBQb2x5Z29uXG4gIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWwjTGlzdGluZyB0aGUgVmVydGljZXNcbiAgcG5wb2x5IDogZnVuY3Rpb24oeCx5LGNvb3Jkcykge1xuICAgIHZhciB2ZXJ0ID0gWyBbMCwwXSBdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb29yZHNbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVtqXSlcbiAgICAgIH1cbiAgICAgIHZlcnQucHVzaChjb29yZHNbaV1bMF0pXG4gICAgICB2ZXJ0LnB1c2goWzAsMF0pXG4gICAgfVxuXG4gICAgdmFyIGluc2lkZSA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSB2ZXJ0Lmxlbmd0aCAtIDE7IGkgPCB2ZXJ0Lmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgaWYgKCgodmVydFtpXVswXSA+IHkpICE9ICh2ZXJ0W2pdWzBdID4geSkpICYmICh4IDwgKHZlcnRbal1bMV0gLSB2ZXJ0W2ldWzFdKSAqICh5IC0gdmVydFtpXVswXSkgLyAodmVydFtqXVswXSAtIHZlcnRbaV1bMF0pICsgdmVydFtpXVsxXSkpIGluc2lkZSA9ICFpbnNpZGVcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zaWRlXG4gIH0sXG5cbiAgbnVtYmVyVG9SYWRpdXMgOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgcmV0dXJuIG51bWJlciAqIE1hdGguUEkgLyAxODA7XG4gIH1cbn07XG4iXX0=
