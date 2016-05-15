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