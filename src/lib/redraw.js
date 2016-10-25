var running = false;
var reschedule = null;

module.exports = function(layer) {
  layer.render = function(e) {
    if( !this.showing ) return;

    if( !this.allowPanRendering && this.moving ) {
      return;
    }

    if( e && e.type == 'move' && !this.animating ) {
      return;
    }

    var t, diff
    if( this.debug ) {
        t = new Date().getTime();
    }

    var diff = null;
        map = this._map,
        center = map.getCenter();

    if( (e && e.type == 'moveend') || (e && e.type == 'move' && this.animating) ) {
      if (this.lastCenterLL === null) {
        this.lastCenterLL = map._initialCenter;
      }
      var pt = this._map.latLngToContainerPoint(center);

      if( this.lastCenterLL ) {
        var lastXy = map.latLngToContainerPoint(this.lastCenterLL);
        diff = {
          x : lastXy.x - pt.x,
          y : lastXy.y - pt.y
        }
      }
    }
    
    this.lastCenterLL = center;

    if( !this.zooming ) {
      this.redraw(diff);
    } else {
      this.clearCanvas();
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

    var features = this.intersectsBbox([[bounds.getWest(), bounds.getSouth()], [bounds.getEast(), bounds.getNorth()]], null, null, null);

    var f, i, subfeature, j;
    for( i = 0; i < this.features.length; i++ ) {
      f = this.features[i];

      if( f.isCanvasFeatures ) {

        for( j = 0; j < f.canvasFeatures.length; j++ ) {
          this.prepareForRedraw(f.canvasFeatures[j], bounds, zoom, diff);
        }

      } else {
        this.prepareForRedraw(f, bounds, zoom, diff);
      }
    }

    this.redrawFeatures(features);
  },

  layer.redrawFeatures = function(features) {
    this.clearCanvas();


    features.sort(function(a, b){
      if( a.order > b.order ) return 1;
      if( a.order < b.order ) return -1;
      return 0;
    });
    
    for( var i = 0; i < features.length; i++ ) {
      if( !features[i].visible ) continue;
      this.redrawFeature(features[i]);
    }
  }

  layer.redrawFeature = function(canvasFeature) {
      var renderer = canvasFeature.renderer ? canvasFeature.renderer : this.renderer;
      var xy = canvasFeature.getCanvasXY();

      // badness...
      if( !xy ) return;

      // call feature render function in feature scope; feature is passed as well
      renderer.call(
          canvasFeature, // scope (canvas feature)
          this._ctx,     // canvas 2d context
          xy,            // xy points to draw
          this._map,     // leaflet map instance
          canvasFeature  // canvas feature
      );
  }

  // redraw an individual feature
  layer.prepareForRedraw = function(canvasFeature, bounds, zoom, diff) {
    //if( feature.geojson.properties.debug ) debugger;

    // ignore anything flagged as hidden
    // we do need to clear the cache in this case
    if( !canvasFeature.visible ) {
      canvasFeature.clearCache();
      return;
    }

    var geojson = canvasFeature.geojson.geometry;

    // now lets check cache to see if we need to reproject the
    // xy coordinates
    // actually project to xy if needed
    var reproject = canvasFeature.requiresReprojection(zoom);
    if( reproject ) {
      this.toCanvasXY(canvasFeature, geojson, zoom);
    }  // end reproject

    // if this was a simple pan event (a diff was provided) and we did not reproject
    // move the feature by diff x/y
    if( diff && !reproject ) {
      if( geojson.type == 'Point' ) {

        var xy = canvasFeature.getCanvasXY()
        xy.x += diff.x;
        xy.y += diff.y;

      } else if( geojson.type == 'LineString' ) {

        this.utils.moveLine(canvasFeature.getCanvasXY(), diff);

      } else if ( geojson.type == 'Polygon' ) {
      
        this.utils.moveLine(canvasFeature.getCanvasXY(), diff);
      
      } else if ( geojson.type == 'MultiPolygon' ) {
        var xy = canvasFeature.getCanvasXY();
        for( var i = 0; i < xy.length; i++ ) {
          this.utils.moveLine(xy[i], diff);
        }
      }
    }
   };
}