function CanvasFeature(geojson, id) {
    
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
        cache.canvasXY = null;
        cache.zoom = -1;
    }
    
    this.setCanvasXY = function(canvasXY, zoom) {
        cache.canvasXY = canvasXY;
        cache.zoom = zoom;
    }
    
    this.getCanvasXY = function() {
        return cache.canvasXY;
    }
    
    this.requiresReprojection = function(zoom) {
      if( cache.zoom == zoom && cache.canvasXY ) {
        return false;
      }
      return true;
    }

    /**
     * To options for wrapper.  One, you provide a geojson object.
     * Two, you provide a accessor method and id.  When this class
     * needs access to the GeoJSON, the id will be passed, as well
     * as the callback.
     */
    if( typeof geojson === 'object' ) {
        this._geojson = geojson;
        
        // TODO: allow user to override default variable
        this.id = geojson.properties.id;

        this.type = geojson.type;
        this._getGeoJson = function(id, callback) {
            callback(this._geojson);
        }
    } else {
        this._getGeoJson = geojson;
        this._id = id;
    }

    this.getGeoJson = function(callback) {
        this._getGeoJson(this._id, callback);
    }

    this.getGeoJson((geojson) => {
        if( geojson.geometry ) {
            this.type = geojson.geometry.type;
        } else {
            this.type = geojson.type;
        }
    });
    
    // optional, per feature, renderer
    this.renderer = null;
}

module.exports = CanvasFeature;