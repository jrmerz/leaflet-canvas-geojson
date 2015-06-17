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

    // call feature render function in feature scope;
    feature.render.call(feature, this._ctx, feature.cache.geoXY, this._map);
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

      // TODO: calculate bounding box if zoom has changed
      if( feature.size ){

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

    if( bottom ) this.features.unshift(feature);
    else this.features.push(feature);
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9sYXllciIsInNyYy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Y0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAgQSBGZWF0dXJlIHNob3VsZCBoYXZlIHRoZSBmb2xsb3dpbmc6XG5cbiAgZmVhdHVyZSA9IHtcbiAgICB2aXNpYmxlIDogQm9vbGVhbixcbiAgICBzaXplIDogTnVtYmVyLCAvLyBwb2ludHMgb25seSwgdXNlZCBmb3IgbW91c2UgaW50ZXJhY3Rpb25zXG4gICAgZ2VvanNvbiA6IHt9XG4gICAgcmVuZGVyIDogZnVuY3Rpb24oY29udGV4dCwgY29vcmRpbmF0ZXNJblhZLCBtYXApIHt9IC8vIGNhbGxlZCBpbiBmZWF0dXJlIHNjb3BlXG4gIH1cblxuICBnZW9YWSBhbmQgbGVhZmxldCB3aWxsIGJlIGFzc2lnbmVkXG4qKi9cblxuTC5DYW52YXNHZW9qc29uTGF5ZXIgPSBMLkNsYXNzLmV4dGVuZCh7XG4gIC8vIHNob3cgbGF5ZXIgdGltaW5nXG4gIGRlYnVnIDogZmFsc2UsXG5cbiAgLy8gaW5jbHVkZSBldmVudHNcbiAgaW5jbHVkZXM6IFtMLk1peGluLkV2ZW50c10sXG5cbiAgLy8gbGlzdCBvZiBnZW9qc29uIGZlYXR1cmVzIHRvIGRyYXdcbiAgLy8gICAtIHRoZXNlIHdpbGwgZHJhdyBpbiBvcmRlclxuICBmZWF0dXJlcyA6IFtdLFxuXG4gIC8vIGxpc3Qgb2YgY3VycmVudCBmZWF0dXJlcyB1bmRlciB0aGUgbW91c2VcbiAgaW50ZXJzZWN0TGlzdCA6IFtdLFxuXG4gIC8vIHVzZWQgdG8gY2FsY3VsYXRlIHBpeGVscyBtb3ZlZCBmcm9tIGNlbnRlclxuICBsYXN0Q2VudGVyTEwgOiBudWxsLFxuXG4gIC8vIGdlb21ldHJ5IGhlbHBlcnNcbiAgdXRpbHMgOiByZXF1aXJlKCcuL3V0aWxzJyksXG5cbiAgLy8gaW5pdGlhbGl6ZSBsYXllclxuICBpbml0aWFsaXplOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgIC8vIHNldCBvcHRpb25zXG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgTC5VdGlsLnNldE9wdGlvbnModGhpcywgb3B0aW9ucyk7XG5cbiAgICAvLyBtb3ZlIG1vdXNlIGV2ZW50IGhhbmRsZXJzIHRvIGxheWVyIHNjb3BlXG4gICAgdmFyIG1vdXNlRXZlbnRzID0gWydvbk1vdXNlT3ZlcicsICdvbk1vdXNlTW92ZScsICdvbk1vdXNlT3V0JywgJ29uQ2xpY2snXTtcbiAgICBtb3VzZUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuICAgICAgaWYoICF0aGlzLm9wdGlvbnNbZV0gKSByZXR1cm47XG4gICAgICB0aGlzW2VdID0gdGhpcy5vcHRpb25zW2VdO1xuICAgICAgZGVsZXRlIHRoaXMub3B0aW9uc1tlXTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgLy8gc2V0IGNhbnZhcyBhbmQgY2FudmFzIGNvbnRleHQgc2hvcnRjdXRzXG4gICAgdGhpcy5fY2FudmFzID0gdGhpcy5fY3JlYXRlQ2FudmFzKCk7XG4gICAgdGhpcy5fY3R4ID0gdGhpcy5fY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIH0sXG5cbiAgX2NyZWF0ZUNhbnZhczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IHRoaXMub3B0aW9ucy56SW5kZXggfHwgMDtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtdGlsZS1jb250YWluZXIgbGVhZmxldC16b29tLWFuaW1hdGVkJztcbiAgICBjYW52YXMuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIGNhbnZhcztcbiAgfSxcblxuICBvbkFkZDogZnVuY3Rpb24gKG1hcCkge1xuICAgIHRoaXMuX21hcCA9IG1hcDtcblxuICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAvLyB0aGUgY29udGFpbmVyIGlzIG1vdmVkIGluIHRoZSBvcG9zaXRlIGRpcmVjdGlvbiBvZiB0aGVcbiAgICAvLyBtYXAgcGFuZSB0byBrZWVwIHRoZSBjYW52YXMgYWx3YXlzIGluICgwLCAwKVxuICAgIHZhciB0aWxlUGFuZSA9IHRoaXMuX21hcC5fcGFuZXMudGlsZVBhbmU7XG4gICAgdmFyIF9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnbGVhZmxldC1sYXllcicpO1xuXG4gICAgX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jYW52YXMpO1xuICAgIHRpbGVQYW5lLmFwcGVuZENoaWxkKF9jb250YWluZXIpO1xuXG4gICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgIC8vIGhhY2s6IGxpc3RlbiB0byBwcmVkcmFnIGV2ZW50IGxhdW5jaGVkIGJ5IGRyYWdnaW5nIHRvXG4gICAgLy8gc2V0IGNvbnRhaW5lciBpbiBwb3NpdGlvbiAoMCwgMCkgaW4gc2NyZWVuIGNvb3JkaW5hdGVzXG4gICAgaWYgKG1hcC5kcmFnZ2luZy5lbmFibGVkKCkpIHtcbiAgICAgIG1hcC5kcmFnZ2luZy5fZHJhZ2dhYmxlLm9uKCdwcmVkcmFnJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkID0gbWFwLmRyYWdnaW5nLl9kcmFnZ2FibGU7XG4gICAgICAgIEwuRG9tVXRpbC5zZXRQb3NpdGlvbih0aGlzLl9jYW52YXMsIHsgeDogLWQuX25ld1Bvcy54LCB5OiAtZC5fbmV3UG9zLnkgfSk7XG4gICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICBtYXAub24oe1xuICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLl9yZXNldCxcbiAgICAgICdyZXNpemUnICAgIDogdGhpcy5fcmVzZXQsXG4gICAgICAnbW92ZScgICAgICA6IHRoaXMucmVuZGVyLFxuICAgICAgJ3pvb21zdGFydCcgOiB0aGlzLl9zdGFydFpvb20sXG4gICAgICAnem9vbWVuZCcgICA6IHRoaXMuX2VuZFpvb20sXG4gICAgICAnbW91c2Vtb3ZlJyA6IHRoaXMuX2ludGVyc2VjdHMsXG4gICAgICAnY2xpY2snICAgICA6IHRoaXMuX2ludGVyc2VjdHNcbiAgICB9LCB0aGlzKTtcblxuICAgIHRoaXMuX3Jlc2V0KCk7XG4gIH0sXG5cbiAgX3N0YXJ0Wm9vbTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB0aGlzLnpvb21pbmcgPSB0cnVlO1xuICB9LFxuXG4gIF9lbmRab29tOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgc2V0VGltZW91dCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpLCA1MCk7XG4gIH0sXG5cbiAgZ2V0Q2FudmFzOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xuICB9LFxuXG4gIGRyYXc6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuX3Jlc2V0KCk7XG4gIH0sXG5cbiAgb25SZW1vdmU6IGZ1bmN0aW9uIChtYXApIHtcbiAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgIG1hcC5vZmYoe1xuICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLl9yZXNldCxcbiAgICAgICdyZXNpemUnICAgIDogdGhpcy5fcmVzZXQsXG4gICAgICAnbW92ZScgICAgICA6IHRoaXMucmVuZGVyLFxuICAgICAgJ3pvb21zdGFydCcgOiB0aGlzLl9zdGFydFpvb20sXG4gICAgICAnem9vbWVuZCcgICA6IHRoaXMuX2VuZFpvb20sXG4gICAgICAnbW91c2Vtb3ZlJyA6IHRoaXMuX2ludGVyc2VjdHMsXG4gICAgICAnY2xpY2snICAgICA6IHRoaXMuX2ludGVyc2VjdHNcbiAgICB9LCB0aGlzKTtcbiAgfSxcblxuICBhZGRUbzogZnVuY3Rpb24gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBfcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyByZXNldCBhY3R1YWwgY2FudmFzIHNpemVcbiAgICB2YXIgc2l6ZSA9IHRoaXMuX21hcC5nZXRTaXplKCk7XG4gICAgdGhpcy5fY2FudmFzLndpZHRoID0gc2l6ZS54O1xuICAgIHRoaXMuX2NhbnZhcy5oZWlnaHQgPSBzaXplLnk7XG5cbiAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0sXG5cbiAgLy8gY2xlYXIgZWFjaCBmZWF0dXJlcyBjYWNoZVxuICBjbGVhckNhY2hlIDogZnVuY3Rpb24oKSB7XG4gICAgLy8ga2lsbCB0aGUgZmVhdHVyZSBwb2ludCBjYWNoZVxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuY2xlYXJGZWF0dXJlQ2FjaGUoIHRoaXMuZmVhdHVyZXNbaV0gKTtcbiAgICB9XG4gIH0sXG5cbiAgY2xlYXJGZWF0dXJlQ2FjaGUgOiBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgaWYoICFmZWF0dXJlLmNhY2hlICkgcmV0dXJuO1xuICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSBudWxsO1xuICB9LFxuXG4gIC8vIHJlZHJhdyBhbGwgZmVhdHVyZXMuICBUaGlzIGRvZXMgbm90IGhhbmRsZSBjbGVhcmluZyB0aGUgY2FudmFzIG9yIHNldHRpbmdcbiAgLy8gdGhlIGNhbnZhcyBjb3JyZWN0IHBvc2l0aW9uLiAgVGhhdCBpcyBoYW5kbGVkIGJ5IHJlbmRlclxuICByZWRyYXc6IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICAvLyBvYmplY3RzIHNob3VsZCBrZWVwIHRyYWNrIG9mIGxhc3QgYmJveCBhbmQgem9vbSBvZiBtYXBcbiAgICAvLyBpZiB0aGlzIGhhc24ndCBjaGFuZ2VkIHRoZSBsbCAtPiBjb250YWluZXIgcHQgaXMgbm90IG5lZWRlZFxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgdmFyIHpvb20gPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUodGhpcy5mZWF0dXJlc1tpXSwgYm91bmRzLCB6b29tLCBkaWZmKTtcbiAgICB9XG5cbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCdSZW5kZXIgdGltZTogJysobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSsnbXM7IGF2ZzogJytcbiAgICAgICgobmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0KSAvIHRoaXMuZmVhdHVyZXMubGVuZ3RoKSsnbXMnKTtcbiAgfSxcblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIHJlZHJhd0ZlYXR1cmUgOiBmdW5jdGlvbihmZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYpIHtcbiAgICAvLyBpZ25vcmUgYW55dGhpbmcgZmxhZ2dlZCBhcyBoaWRkZW5cbiAgICAvLyB3ZSBkbyBuZWVkIHRvIGNsZWFyIHRoZSBjYWNoZSBpbiB0aGlzIGNhc2VcbiAgICBpZiggIWZlYXR1cmUudmlzaWJsZSApIHtcbiAgICAgIHRoaXMuY2xlYXJGZWF0dXJlQ2FjaGUoZmVhdHVyZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gbm93IGxldHMgY2hlY2sgY2FjaGUgdG8gc2VlIGlmIHdlIG5lZWQgdG8gcmVwcm9qZWN0IHRoZVxuICAgIC8vIHh5IGNvb3JkaW5hdGVzXG4gICAgdmFyIHJlcHJvamVjdCA9IHRydWU7XG4gICAgaWYoIGZlYXR1cmUuY2FjaGUgKSB7XG4gICAgICBpZiggZmVhdHVyZS5jYWNoZS56b29tID09IHpvb20gJiYgZmVhdHVyZS5jYWNoZS5nZW9YWSApIHtcbiAgICAgICAgcmVwcm9qZWN0ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWN0dWFsbHkgcHJvamVjdCB0byB4eSBpZiBuZWVkZWRcbiAgICBpZiggcmVwcm9qZWN0ICkge1xuICAgICAgdGhpcy5fY2FsY0dlb1hZKGZlYXR1cmUsIHpvb20pO1xuICAgIH0gIC8vIGVuZCByZXByb2plY3RcblxuICAgIC8vIGlmIHRoaXMgd2FzIGEgc2ltcGxlIHBhbiBldmVudCAoYSBkaWZmIHdhcyBwcm92aWRlZCkgYW5kIHdlIGRpZCBub3QgcmVwcm9qZWN0XG4gICAgLy8gbW92ZSB0aGUgZmVhdHVyZSBieSBkaWZmIHgveVxuICAgIGlmKCBkaWZmICYmICFyZXByb2plY3QgKSB7XG4gICAgICBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcblxuICAgICAgICBmZWF0dXJlLmNhY2hlLmdlb1hZLnggKz0gZGlmZi54O1xuICAgICAgICBmZWF0dXJlLmNhY2hlLmdlb1hZLnkgKz0gZGlmZi55O1xuXG4gICAgICB9IGVsc2UgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGZlYXR1cmUuY2FjaGUuZ2VvWFksIGRpZmYpO1xuXG4gICAgICB9IGVsc2UgaWYgKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoZmVhdHVyZS5jYWNoZS5nZW9YWSwgZGlmZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIG5vdCBpbiBib3VuZHNcbiAgICBpZiggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcbiAgICAgIGlmKCAhYm91bmRzLmNvbnRhaW5zKGZlYXR1cmUubGF0bG5nKSApIHtcbiAgICAgICAgLy9mZWF0dXJlLm91dE9mQm91bmRzID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggIWJvdW5kcy5jb250YWlucyhmZWF0dXJlLmJvdW5kcykgJiYgIWJvdW5kcy5pbnRlcnNlY3RzKGZlYXR1cmUuYm91bmRzKSApIHtcbiAgICAgICAgLy9mZWF0dXJlLm91dE9mQm91bmRzID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIHRoZSBmZWF0dXJlIHdhcyBvdXQgb2YgYm91bmRzIGxhc3QgdGltZSB3ZSB3YW50IHRvIHJlcHJvamVjdFxuICAgIC8vZmVhdHVyZS5vdXRPZkJvdW5kcyA9IGZhbHNlO1xuXG4gICAgLy8gY2FsbCBmZWF0dXJlIHJlbmRlciBmdW5jdGlvbiBpbiBmZWF0dXJlIHNjb3BlO1xuICAgIGZlYXR1cmUucmVuZGVyLmNhbGwoZmVhdHVyZSwgdGhpcy5fY3R4LCBmZWF0dXJlLmNhY2hlLmdlb1hZLCB0aGlzLl9tYXApO1xuICB9LFxuXG4gIF9jYWxjR2VvWFkgOiBmdW5jdGlvbihmZWF0dXJlLCB6b29tKSB7XG4gICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYSBjYWNoZSBuYW1lc3BhY2UgYW5kIHNldCB0aGUgem9vbSBsZXZlbFxuICAgIGlmKCAhZmVhdHVyZS5jYWNoZSApIGZlYXR1cmUuY2FjaGUgPSB7fTtcbiAgICBmZWF0dXJlLmNhY2hlLnpvb20gPSB6b29tO1xuXG4gICAgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXVxuICAgICAgXSk7XG5cbiAgICAgIC8vIFRPRE86IGNhbGN1bGF0ZSBib3VuZGluZyBib3ggaWYgem9vbSBoYXMgY2hhbmdlZFxuICAgICAgaWYoIGZlYXR1cmUuc2l6ZSApe1xuXG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlcywgdGhpcy5fbWFwKTtcblxuICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgIGZlYXR1cmUuY2FjaGUuZ2VvWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1swXSwgdGhpcy5fbWFwKTtcbiAgICB9XG4gIH0sXG5cbiAgYWRkRmVhdHVyZXMgOiBmdW5jdGlvbihmZWF0dXJlcykge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuYWRkRmVhdHVyZSh0aGlzLmZlYXR1cmVzW2ldKTtcbiAgICB9XG4gIH0sXG5cbiAgYWRkRmVhdHVyZSA6IGZ1bmN0aW9uKGZlYXR1cmUsIGJvdHRvbSkge1xuICAgIGlmKCAhZmVhdHVyZS5nZW9qc29uICkgcmV0dXJuO1xuICAgIGlmKCAhZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5ICkgcmV0dXJuO1xuXG4gICAgaWYoIHR5cGVvZiBmZWF0dXJlLnZpc2libGUgPT09ICd1bmRlZmluZWQnICkgZmVhdHVyZS52aXNpYmxlID0gdHJ1ZTtcbiAgICBmZWF0dXJlLmNhY2hlID0gbnVsbDtcblxuICAgIGlmKCBmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG4gICAgICBmZWF0dXJlLmJvdW5kcyA9IHRoaXMudXRpbHMuY2FsY0JvdW5kcyhmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuXG4gICAgfSBlbHNlIGlmICggZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgZmVhdHVyZS5ib3VuZHMgPSB0aGlzLnV0aWxzLmNhbGNCb3VuZHMoZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcblxuICAgIH0gZWxzZSBpZiAoIGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09ICdQb2ludCcgKSB7XG4gICAgICBmZWF0dXJlLmxhdGxuZyA9IEwubGF0TG5nKGZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlc1sxXSwgZmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coJ0dlb0pTT04gZmVhdHVyZSB0eXBlIFwiJytmZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnkudHlwZSsnXCIgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmUuZ2VvanNvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoIGJvdHRvbSApIHRoaXMuZmVhdHVyZXMudW5zaGlmdChmZWF0dXJlKTtcbiAgICBlbHNlIHRoaXMuZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgfSxcblxuICBhZGRGZWF0dXJlQm90dG9tIDogZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHRoaXMuYWRkRmVhdHVyZShmZWF0dXJlLCB0cnVlKTtcbiAgfSxcblxuICAvLyByZXR1cm5zIHRydWUgaWYgcmUtcmVuZGVyIHJlcXVpcmVkLiAgaWUgdGhlIGZlYXR1cmUgd2FzIHZpc2libGU7XG4gIHJlbW92ZUZlYXR1cmUgOiBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5mZWF0dXJlcy5pbmRleE9mKGZlYXR1cmUpO1xuICAgIGlmKCBpbmRleCA9PSAtMSApIHJldHVybjtcblxuICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIGlmKCB0aGlzLmZlYXR1cmUudmlzaWJsZSApIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdCwgZGlmZlxuICAgIGlmKCB0aGlzLmRlYnVnICkgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgdmFyIGRpZmYgPSBudWxsO1xuICAgIGlmKCBlICYmIGUudHlwZSA9PSAnbW92ZScgKSB7XG4gICAgICB2YXIgY2VudGVyID0gdGhpcy5fbWFwLmdldENlbnRlcigpO1xuXG4gICAgICB2YXIgcHQgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChjZW50ZXIpO1xuICAgICAgaWYoIHRoaXMubGFzdENlbnRlckxMICkge1xuICAgICAgICB2YXIgbGFzdFh5ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQodGhpcy5sYXN0Q2VudGVyTEwpO1xuICAgICAgICBkaWZmID0ge1xuICAgICAgICAgIHggOiBsYXN0WHkueCAtIHB0LngsXG4gICAgICAgICAgeSA6IGxhc3RYeS55IC0gcHQueVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGFzdENlbnRlckxMID0gY2VudGVyO1xuICAgIH1cblxuICAgIHZhciB0b3BMZWZ0ID0gdGhpcy5fbWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2NhbnZhcywgdG9wTGVmdCk7XG5cbiAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICB2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAvLyBjbGVhciBjYW52YXNcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICBpZiggIXRoaXMuem9vbWluZyApIHRoaXMucmVkcmF3KGRpZmYpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSB7XG4gICAgICBkaWZmID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0O1xuXG4gICAgICB2YXIgYyA9IDA7XG4gICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmKCAhdGhpcy5mZWF0dXJlc1tpXS5jYWNoZS5nZW9YWSApIGNvbnRpbnVlO1xuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSh0aGlzLmZlYXR1cmVzW2ldLmNhY2hlLmdlb1hZKSApIGMgKz0gdGhpcy5mZWF0dXJlc1tpXS5jYWNoZS5nZW9YWS5sZW5ndGg7XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKCdSZW5kZXJlZCAnK2MrJyBwdHMgaW4gJytkaWZmKydtcycpO1xuICAgIH1cbiAgfSxcblxuICAvKlxuICAgIHJldHVybiBsaXN0IG9mIGFsbCBpbnRlcnNlY3RpbmcgZ2VvbWV0cnkgcmVncmFkbGVzcyBpcyBjdXJyZW50bHkgdmlzaWJsZVxuXG4gICAgcHhSYWRpdXMgLSBpcyBmb3IgbGluZXMgYW5kIHBvaW50cyBvbmx5LiAgQmFzaWNhbGx5IGhvdyBmYXIgb2ZmIHRoZSBsaW5lIG9yXG4gICAgb3IgcG9pbnQgYSBsYXRsbmcgY2FuIGJlIGFuZCBzdGlsbCBiZSBjb25zaWRlcmVkIGludGVyc2VjdGluZy4gIFRoaXMgaXNcbiAgICBnaXZlbiBpbiBweCBhcyBpdCBpcyBjb21wZW5zYXRpbmcgZm9yIHVzZXIgaW50ZW50IHdpdGggbW91c2UgY2xpY2sgb3IgdG91Y2guXG4gICAgVGhlIHBvaW50IG11c3QgbGF5IGluc2lkZSB0byBwb2x5Z29uIGZvciBhIG1hdGNoLlxuICAqL1xuICBnZXRBbGxJbnRlcnNlY3RpbmdHZW9tZXRyeSA6IGZ1bmN0aW9uKGxhdGxuZywgcHhSYWRpdXMpIHtcbiAgICB2YXIgbXBwID0gdGhpcy51dGlscy5tZXRlcnNQZXJQeChsYXRsbmcsIHRoaXMuX21hcCk7XG4gICAgdmFyIHIgPSBtcHAgKiAocHhSYWRpdXMgfHwgNSk7IC8vIDUgcHggcmFkaXVzIGJ1ZmZlcjtcblxuICAgIHZhciBjZW50ZXIgPSB7XG4gICAgICB0eXBlIDogJ1BvaW50JyxcbiAgICAgIGNvb3JkaW5hdGVzIDogW2xhdGxuZy5sbmcsIGxhdGxuZy5sYXRdXG4gICAgfTtcbiAgICB2YXIgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XG4gICAgdmFyIGNvbnRhaW5lclBvaW50ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGF0bG5nKTtcblxuICAgIHZhciBmO1xuICAgIHZhciBpbnRlcnNlY3RzID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBmID0gdGhpcy5mZWF0dXJlc1tpXTtcblxuICAgICAgaWYoICFmLmdlb2pzb24uZ2VvbWV0cnkgKSBjb250aW51ZTtcbiAgICAgIGlmKCBmLmJvdW5kcyAmJiAhZi5ib3VuZHMuY29udGFpbnMobGF0bG5nKSApIGNvbnRpbnVlO1xuXG4gICAgICBpZiggIWYuY2FjaGUgKSB0aGlzLl9jYWxjR2VvWFkoZiwgem9vbSk7XG4gICAgICBlbHNlIGlmKCAhZi5jYWNoZS5nZW9YWSApIHRoaXMuX2NhbGNHZW9YWShmLCB6b29tKTtcblxuICAgICAgaWYoIHRoaXMudXRpbHMuZ2VvbWV0cnlXaXRoaW5SYWRpdXMoZi5nZW9qc29uLmdlb21ldHJ5LCBmLmNhY2hlLmdlb1hZLCBjZW50ZXIsIGNvbnRhaW5lclBvaW50LCByKSApIHtcbiAgICAgICAgaW50ZXJzZWN0cy5wdXNoKGYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBpbnRlcnNlY3RzO1xuICB9LFxuXG4gIC8vIGdldCB0aGUgbWV0ZXJzIHBlciBweCBhbmQgYSBjZXJ0YWluIHBvaW50O1xuICBnZXRNZXRlcnNQZXJQeCA6IGZ1bmN0aW9uKGxhdGxuZykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLm1ldGVyc1BlclB4KGxhdGxuZywgdGhpcy5fbWFwKTtcbiAgfSxcblxuICBfaW50ZXJzZWN0cyA6IGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHZhciBtcHAgPSB0aGlzLmdldE1ldGVyc1BlclB4KGUubGF0bG5nKTtcbiAgICB2YXIgciA9IG1wcCAqIDU7IC8vIDUgcHggcmFkaXVzIGJ1ZmZlcjtcblxuICAgIHZhciBjZW50ZXIgPSB7XG4gICAgICB0eXBlIDogJ1BvaW50JyxcbiAgICAgIGNvb3JkaW5hdGVzIDogW2UubGF0bG5nLmxuZywgZS5sYXRsbmcubGF0XVxuICAgIH07XG5cbiAgICB2YXIgZjtcbiAgICB2YXIgaW50ZXJzZWN0cyA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG5cbiAgICAgIGlmKCAhZi52aXNpYmxlICkgY29udGludWU7XG4gICAgICBpZiggIWYuZ2VvanNvbi5nZW9tZXRyeSApIGNvbnRpbnVlO1xuICAgICAgaWYoICFmLmNhY2hlICkgY29udGludWU7XG4gICAgICBpZiggIWYuY2FjaGUuZ2VvWFkgKSBjb250aW51ZTtcbiAgICAgIGlmKCBmLmJvdW5kcyAmJiAhZi5ib3VuZHMuY29udGFpbnMoZS5sYXRsbmcpICkgY29udGludWU7XG5cbiAgICAgIGlmKCB0aGlzLnV0aWxzLmdlb21ldHJ5V2l0aGluUmFkaXVzKGYuZ2VvanNvbi5nZW9tZXRyeSwgZi5jYWNoZS5nZW9YWSwgY2VudGVyLCBlLmNvbnRhaW5lclBvaW50LCBmLnNpemUgPyAoZi5zaXplICogbXBwKSA6IHIpICkge1xuICAgICAgICBpbnRlcnNlY3RzLnB1c2goZi5nZW9qc29uKTtcbiAgICAgIH1cblxuICAgIH1cblxuICAgIGlmKCBlLnR5cGUgPT0gJ2NsaWNrJyAmJiB0aGlzLm9uQ2xpY2sgKSB7XG4gICAgICB0aGlzLm9uQ2xpY2soaW50ZXJzZWN0cyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIG1vdXNlb3ZlciA9IFtdLCBtb3VzZW91dCA9IFtdLCBtb3VzZW1vdmUgPSBbXTtcblxuICAgIHZhciBjaGFuZ2VkID0gZmFsc2U7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHRoaXMuaW50ZXJzZWN0TGlzdC5pbmRleE9mKGludGVyc2VjdHNbaV0pID4gLTEgKSB7XG4gICAgICAgIG1vdXNlbW92ZS5wdXNoKGludGVyc2VjdHNbaV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIG1vdXNlb3Zlci5wdXNoKGludGVyc2VjdHNbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5pbnRlcnNlY3RMaXN0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIGludGVyc2VjdHMuaW5kZXhPZih0aGlzLmludGVyc2VjdExpc3RbaV0pID09IC0xICkge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgbW91c2VvdXQucHVzaCh0aGlzLmludGVyc2VjdExpc3RbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaW50ZXJzZWN0TGlzdCA9IGludGVyc2VjdHM7XG5cbiAgICBpZiggdGhpcy5vbk1vdXNlT3ZlciAmJiBtb3VzZW92ZXIubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU92ZXIuY2FsbCh0aGlzLCBtb3VzZW92ZXIpO1xuICAgIGlmKCB0aGlzLm9uTW91c2VNb3ZlICYmIG1vdXNlbW92ZS5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlTW92ZS5jYWxsKHRoaXMsIG1vdXNlbW92ZSk7XG4gICAgaWYoIHRoaXMub25Nb3VzZU91dCAmJiBtb3VzZW91dC5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlT3V0LmNhbGwodGhpcywgbW91c2VvdXQpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZygnaW50ZXJzZWN0cyB0aW1lOiAnKyhuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQpKydtcycpO1xuXG4gICAgaWYoIGNoYW5nZWQgKSB0aGlzLnJlbmRlcigpO1xuICB9XG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBtb3ZlTGluZSA6IGZ1bmN0aW9uKGNvb3JkcywgZGlmZikge1xuICAgIHZhciBpOyBsZW4gPSBjb29yZHMubGVuZ3RoO1xuICAgIGZvciggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgIGNvb3Jkc1tpXS54ICs9IGRpZmYueDtcbiAgICAgIGNvb3Jkc1tpXS55ICs9IGRpZmYueTtcbiAgICB9XG4gIH0sXG5cbiAgcHJvamVjdExpbmUgOiBmdW5jdGlvbihjb29yZHMsIG1hcCkge1xuICAgIHZhciB4eUxpbmUgPSBbXTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgeHlMaW5lLnB1c2gobWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoW1xuICAgICAgICAgIGNvb3Jkc1tpXVsxXSwgY29vcmRzW2ldWzBdXG4gICAgICBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHh5TGluZTtcbiAgfSxcblxuICBjYWxjQm91bmRzIDogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgdmFyIHhtaW4gPSBjb29yZHNbMF1bMV07XG4gICAgdmFyIHhtYXggPSBjb29yZHNbMF1bMV07XG4gICAgdmFyIHltaW4gPSBjb29yZHNbMF1bMF07XG4gICAgdmFyIHltYXggPSBjb29yZHNbMF1bMF07XG5cbiAgICBmb3IoIHZhciBpID0gMTsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB4bWluID4gY29vcmRzW2ldWzFdICkgeG1pbiA9IGNvb3Jkc1tpXVsxXTtcbiAgICAgIGlmKCB4bWF4IDwgY29vcmRzW2ldWzFdICkgeG1heCA9IGNvb3Jkc1tpXVsxXTtcblxuICAgICAgaWYoIHltaW4gPiBjb29yZHNbaV1bMF0gKSB5bWluID0gY29vcmRzW2ldWzBdO1xuICAgICAgaWYoIHltYXggPCBjb29yZHNbaV1bMF0gKSB5bWF4ID0gY29vcmRzW2ldWzBdO1xuICAgIH1cblxuICAgIHZhciBzb3V0aFdlc3QgPSBMLmxhdExuZyh4bWluLS4wMSwgeW1pbi0uMDEpO1xuICAgIHZhciBub3J0aEVhc3QgPSBMLmxhdExuZyh4bWF4Ky4wMSwgeW1heCsuMDEpO1xuXG4gICAgcmV0dXJuIEwubGF0TG5nQm91bmRzKHNvdXRoV2VzdCwgbm9ydGhFYXN0KTtcbiAgfSxcblxuICBnZW9tZXRyeVdpdGhpblJhZGl1cyA6IGZ1bmN0aW9uKGdlb21ldHJ5LCB4eVBvaW50cywgY2VudGVyLCB4eVBvaW50LCByYWRpdXMpIHtcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludERpc3RhbmNlKGdlb21ldHJ5LCBjZW50ZXIpIDw9IHJhZGl1cztcbiAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuXG4gICAgICBmb3IoIHZhciBpID0gMTsgaSA8IHh5UG9pbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggdGhpcy5saW5lSW50ZXJzZWN0c0NpcmNsZSh4eVBvaW50c1tpLTFdLCB4eVBvaW50c1tpXSwgeHlQb2ludCwgMykgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50SW5Qb2x5Z29uKGNlbnRlciwgZ2VvbWV0cnkpO1xuICAgIH1cbiAgfSxcblxuICAvLyBodHRwOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMjc1NTI5L2NoZWNrLWlmLWxpbmUtaW50ZXJzZWN0cy13aXRoLWNpcmNsZXMtcGVyaW1ldGVyXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Rpc3RhbmNlX2Zyb21fYV9wb2ludF90b19hX2xpbmVcbiAgLy8gW2xuZyB4LCBsYXQsIHldXG4gIGxpbmVJbnRlcnNlY3RzQ2lyY2xlIDogZnVuY3Rpb24obGluZVAxLCBsaW5lUDIsIHBvaW50LCByYWRpdXMpIHtcbiAgICB2YXIgZGlzdGFuY2UgPVxuICAgICAgTWF0aC5hYnMoXG4gICAgICAgICgobGluZVAyLnkgLSBsaW5lUDEueSkqcG9pbnQueCkgLSAoKGxpbmVQMi54IC0gbGluZVAxLngpKnBvaW50LnkpICsgKGxpbmVQMi54KmxpbmVQMS55KSAtIChsaW5lUDIueSpsaW5lUDEueClcbiAgICAgICkgL1xuICAgICAgTWF0aC5zcXJ0KFxuICAgICAgICBNYXRoLnBvdyhsaW5lUDIueSAtIGxpbmVQMS55LCAyKSArIE1hdGgucG93KGxpbmVQMi54IC0gbGluZVAxLngsIDIpXG4gICAgICApO1xuICAgIHJldHVybiBkaXN0YW5jZSA8PSByYWRpdXM7XG4gIH0sXG5cbiAgLy8gaHR0cDovL3dpa2kub3BlbnN0cmVldG1hcC5vcmcvd2lraS9ab29tX2xldmVsc1xuICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI3NTQ1MDk4L2xlYWZsZXQtY2FsY3VsYXRpbmctbWV0ZXJzLXBlci1waXhlbC1hdC16b29tLWxldmVsXG4gIG1ldGVyc1BlclB4IDogZnVuY3Rpb24obGwsIG1hcCkge1xuICAgIHZhciBwb2ludEMgPSBtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChsbCk7IC8vIGNvbnZlcnQgdG8gY29udGFpbmVycG9pbnQgKHBpeGVscylcbiAgICB2YXIgcG9pbnRYID0gW3BvaW50Qy54ICsgMSwgcG9pbnRDLnldOyAvLyBhZGQgb25lIHBpeGVsIHRvIHhcblxuICAgIC8vIGNvbnZlcnQgY29udGFpbmVycG9pbnRzIHRvIGxhdGxuZydzXG4gICAgdmFyIGxhdExuZ0MgPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludEMpO1xuICAgIHZhciBsYXRMbmdYID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRYKTtcblxuICAgIHZhciBkaXN0YW5jZVggPSBsYXRMbmdDLmRpc3RhbmNlVG8obGF0TG5nWCk7IC8vIGNhbGN1bGF0ZSBkaXN0YW5jZSBiZXR3ZWVuIGMgYW5kIHggKGxhdGl0dWRlKVxuICAgIHJldHVybiBkaXN0YW5jZVg7XG4gIH0sXG5cbiAgLy8gZnJvbSBodHRwOi8vd3d3Lm1vdmFibGUtdHlwZS5jby51ay9zY3JpcHRzL2xhdGxvbmcuaHRtbFxuICBwb2ludERpc3RhbmNlIDogZnVuY3Rpb24gKHB0MSwgcHQyKSB7XG4gICAgdmFyIGxvbjEgPSBwdDEuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQxID0gcHQxLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgbG9uMiA9IHB0Mi5jb29yZGluYXRlc1swXSxcbiAgICAgIGxhdDIgPSBwdDIuY29vcmRpbmF0ZXNbMV0sXG4gICAgICBkTGF0ID0gdGhpcy5udW1iZXJUb1JhZGl1cyhsYXQyIC0gbGF0MSksXG4gICAgICBkTG9uID0gdGhpcy5udW1iZXJUb1JhZGl1cyhsb24yIC0gbG9uMSksXG4gICAgICBhID0gTWF0aC5wb3coTWF0aC5zaW4oZExhdCAvIDIpLCAyKSArIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MSkpXG4gICAgICAgICogTWF0aC5jb3ModGhpcy5udW1iZXJUb1JhZGl1cyhsYXQyKSkgKiBNYXRoLnBvdyhNYXRoLnNpbihkTG9uIC8gMiksIDIpLFxuICAgICAgYyA9IDIgKiBNYXRoLmF0YW4yKE1hdGguc3FydChhKSwgTWF0aC5zcXJ0KDEgLSBhKSk7XG4gICAgcmV0dXJuICg2MzcxICogYykgKiAxMDAwOyAvLyByZXR1cm5zIG1ldGVyc1xuICB9LFxuXG4gIHBvaW50SW5Qb2x5Z29uIDogZnVuY3Rpb24gKHAsIHBvbHkpIHtcbiAgICB2YXIgY29vcmRzID0gKHBvbHkudHlwZSA9PSBcIlBvbHlnb25cIikgPyBbIHBvbHkuY29vcmRpbmF0ZXMgXSA6IHBvbHkuY29vcmRpbmF0ZXNcblxuICAgIHZhciBpbnNpZGVCb3ggPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wb2ludEluQm91bmRpbmdCb3gocCwgdGhpcy5ib3VuZGluZ0JveEFyb3VuZFBvbHlDb29yZHMoY29vcmRzW2ldKSkpIGluc2lkZUJveCA9IHRydWVcbiAgICB9XG4gICAgaWYgKCFpbnNpZGVCb3gpIHJldHVybiBmYWxzZVxuXG4gICAgdmFyIGluc2lkZVBvbHkgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wbnBvbHkocC5jb29yZGluYXRlc1sxXSwgcC5jb29yZGluYXRlc1swXSwgY29vcmRzW2ldKSkgaW5zaWRlUG9seSA9IHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zaWRlUG9seVxuICB9LFxuXG4gIHBvaW50SW5Cb3VuZGluZ0JveCA6IGZ1bmN0aW9uIChwb2ludCwgYm91bmRzKSB7XG4gICAgcmV0dXJuICEocG9pbnQuY29vcmRpbmF0ZXNbMV0gPCBib3VuZHNbMF1bMF0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMV0gPiBib3VuZHNbMV1bMF0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMF0gPCBib3VuZHNbMF1bMV0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMF0gPiBib3VuZHNbMV1bMV0pXG4gIH0sXG5cbiAgYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzIDogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgdmFyIHhBbGwgPSBbXSwgeUFsbCA9IFtdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkc1swXS5sZW5ndGg7IGkrKykge1xuICAgICAgeEFsbC5wdXNoKGNvb3Jkc1swXVtpXVsxXSlcbiAgICAgIHlBbGwucHVzaChjb29yZHNbMF1baV1bMF0pXG4gICAgfVxuXG4gICAgeEFsbCA9IHhBbGwuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgIHlBbGwgPSB5QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcblxuICAgIHJldHVybiBbIFt4QWxsWzBdLCB5QWxsWzBdXSwgW3hBbGxbeEFsbC5sZW5ndGggLSAxXSwgeUFsbFt5QWxsLmxlbmd0aCAtIDFdXSBdXG4gIH0sXG5cbiAgLy8gUG9pbnQgaW4gUG9seWdvblxuICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sI0xpc3RpbmcgdGhlIFZlcnRpY2VzXG4gIHBucG9seSA6IGZ1bmN0aW9uKHgseSxjb29yZHMpIHtcbiAgICB2YXIgdmVydCA9IFsgWzAsMF0gXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29vcmRzW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZlcnQucHVzaChjb29yZHNbaV1bal0pXG4gICAgICB9XG4gICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldWzBdKVxuICAgICAgdmVydC5wdXNoKFswLDBdKVxuICAgIH1cblxuICAgIHZhciBpbnNpZGUgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdmVydC5sZW5ndGggLSAxOyBpIDwgdmVydC5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgIGlmICgoKHZlcnRbaV1bMF0gPiB5KSAhPSAodmVydFtqXVswXSA+IHkpKSAmJiAoeCA8ICh2ZXJ0W2pdWzFdIC0gdmVydFtpXVsxXSkgKiAoeSAtIHZlcnRbaV1bMF0pIC8gKHZlcnRbal1bMF0gLSB2ZXJ0W2ldWzBdKSArIHZlcnRbaV1bMV0pKSBpbnNpZGUgPSAhaW5zaWRlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVxuICB9LFxuXG4gIG51bWJlclRvUmFkaXVzIDogZnVuY3Rpb24gKG51bWJlcikge1xuICAgIHJldHVybiBudW1iZXIgKiBNYXRoLlBJIC8gMTgwO1xuICB9XG59O1xuIl19
