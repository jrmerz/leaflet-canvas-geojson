function CanvasFeature(geojson) {
    
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
    
    // actual geojson object, will not be modifed, just stored
    this.geojson = geojson;
    
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
        this.cache.canvasXY = null;
        this.cache.zoom = -1;
    }
    
    this.setCanvasXY = function(canvasXY, zoom) {
        this.cache.canvasXY = canvasXY;
        this.cache.zoom = zoom;
    }
    
    this.getCanvasXY = function() {
        return this.cache.canvasXY;
    }
    
    this.requiresReprojection = function(zoom) {
      if( cache.zoom == zoom && cache.geoXY ) {
        return false;
      }
      return true;
    }
    
    // optional, per feature, renderer
    this.renderer = null;
}

module.exports = CanvasFeature;