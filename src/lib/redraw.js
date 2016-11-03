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

    if( !this.zooming ) {
      this.redraw();
    } else {
      this.clearCanvas();
    }
  },
    

  // redraw all features.  This does not handle clearing the canvas or setting
  // the canvas correct position.  That is handled by render
  layer.redraw = function() {
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
          this.prepareForRedraw(f.canvasFeatures[j], bounds, zoom);
        }

      } else {
        this.prepareForRedraw(f, bounds, zoom);
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
  layer.prepareForRedraw = function(canvasFeature, bounds, zoom) {
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
    }
   };
}