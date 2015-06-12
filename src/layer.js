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

    for( var i = 0; i < this.features.length; i++ ) {
      this.redrawFeature(this.features[i], bounds, zoom, diff);
    }
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

  addFeature : function(feature) {
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

    this.features.push(feature);
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

    var xyPoint = [e.layerPoint.x, e.layerPoint.y];

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
      if( !f.cache.geoXY ) continue;
      if( f.bounds && !f.bounds.contains(e.latlng) ) continue;

      if( this.utils.geometryWithinRadius(f.geojson.geometry, f.cache.geoXY, center, xyPoint, f.size ? (f.size * mpp) : r) ) {
        intersects.push(f.geojson);
      }
    }

    if( e.type == 'click' && this.onClick ) {
      this.onClick(intersects);
      return;
    }

    var mouseover = [], mouseout = [], mousemove = [];

    for( var i = 0; i < intersects.length; i++ ) {
      if( this.intersectList.indexOf(intersects[i]) > -1 ) {
        mousemove.push(intersects[i]);
      } else {
        mouseover.push(intersects[i]);
      }
    }

    for( var i = 0; i < this.intersectList.length; i++ ) {
      if( intersects.indexOf(this.intersectList[i]) == -1 ) {
        mouseout.push(this.intersectList[i]);
      }
    }

    this.intersectList = intersects;

    if( this.onMouseOver && mouseover.length > 0 ) this.onMouseOver.call(this, mouseover);
    if( this.onMouseMove && mousemove.length > 0 ) this.onMouseMove.call(this, mousemove);
    if( this.onMouseOut && mouseout.length > 0 ) this.onMouseOut.call(this, mouseout);

    if( this.debug ) console.log('intersects time: '+(new Date().getTime() - t)+'ms');
  }
});
