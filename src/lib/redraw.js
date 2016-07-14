
var running = false;
var reschedule = null;

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

    // if( running ) {
    //   reschedule = true;
    //   return;
    // }
    // running = true;

    // objects should keep track of last bbox and zoom of map
    // if this hasn't changed the ll -> container pt is not needed
    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    if( this.debug ) t = new Date().getTime();

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

    this.redrawFeatures();
  },

  layer.redrawFeatures = function() {
    this.clearCanvas();
    
    for( var i = 0; i < this.features.length; i++ ) {
      if( !this.features[i].visible ) continue;
      this.redrawFeature(this.features[i]);
    }

    if( this.debug ) console.log('Render time: '+(new Date().getTime() - t)+'ms; avg: '+
      ((new Date().getTime() - t) / this.features.length)+'ms');

    // running = false;
    // if( reschedule ) {
    //   console.log('reschedule');
    //   reschedule = false;
    //   this.redraw();
    // }
  }

  layer.redrawFeature = function(canvasFeature) {
      var renderer = canvasFeature.renderer ? canvasFeature.renderer : this.renderer;
      var xy = canvasFeature.getCanvasXY();

      // badness...
      if( !xy ) return;

      // call feature render function in feature scope; feature is passed as well
      renderer.call(
          canvasFeature, // scope
          this._ctx, 
          xy, 
          this._map,
          canvasFeature
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

    var geojson = canvasFeature.geojson;

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

    // ignore anything not in bounds
    if( geojson.type == 'Point' ) {
      if( !bounds.contains(canvasFeature.latlng) ) {
        return;
      }
    } else if( geojson.type == 'MultiPolygon' ) {

      // just make sure at least one polygon is within range
      var found = false;
      for( var i = 0; i < canvasFeature.bounds.length; i++ ) {
        if( bounds.contains(canvasFeature.bounds[i]) || bounds.intersects(canvasFeature.bounds[i]) ) {
          found = true;
          break;
        }
      }
      if( !found ) {
        return;
      }

    } else {
      if( !bounds.contains(canvasFeature.bounds) && !bounds.intersects(canvasFeature.bounds) ) {
        return;
      }
    }
    
   };
}