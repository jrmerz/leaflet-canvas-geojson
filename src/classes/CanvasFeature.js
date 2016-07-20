function CanvasFeature(geojson, id) {
    
    // radius for point features
    // use to calculate mouse over/out and click events for points
    // this value should match the value used for rendering points
    this.size = 5;
    
    // User space object for store variables used for rendering geometry
    this.render = {};

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
        delete cache.canvasXY;
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


    if( geojson.geometry ) {
        this.geojson = {
            type : 'Feature',
            geometry : geojson.geometry,
            properties : {
                id : id || geojson.properties.id
            }
        }
        this.id = id;
    } else {
        this.geojson = {
            type : 'Feature',
            geometry : geojson,
            properties : {
                id : id
            }
        }
        this.id = id;
    }

    this.type = this.geojson.geometry.type;

    // optional, per feature, renderer
    this.renderer = null;
}

module.exports = CanvasFeature;