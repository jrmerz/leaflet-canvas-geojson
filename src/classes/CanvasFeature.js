function CanvasFeature(geojson, id) {
    
    // radius for point features
    // use to calculate mouse over/out and click events for points
    // this value should match the value used for rendering points
    this.size = 5;
    this.isPoint = false;

    // User space object for store variables used for rendering geometry
    this.render = {};

    var cache = {
        // projected points on canvas
        canvasXY : null,
        // zoom level canvasXY points are calculated to
        zoom : -1
    };

    if (this.id === null || this.id === undefined) {
      this.id = geojson.id
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
    
    this.setCanvasXY = function(canvasXY, zoom, layer) {
        cache.canvasXY = canvasXY;
        cache.zoom = zoom;

        if( this.isPoint ) this.updatePointInRTree(layer);
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

    this.updatePointInRTree = function(layer) {
        var coords = this.geojson.geometry.coordinates;
        var dpp = layer.getDegreesPerPx([coords[1], coords[0]]);

        if( this._rtreeGeojson ) {
            var rTreeCoords = this._rtreeGeojson.geometry.coordinates;
            var result = layer.rTree.remove(
                {
                    x : rTreeCoords[0][0][0] - 1,
                    y : rTreeCoords[0][1][1] - 1,
                    w : Math.abs(rTreeCoords[0][0][0] - rTreeCoords[0][1][0]) + 2,
                    h : Math.abs(rTreeCoords[0][1][1] - rTreeCoords[0][2][1]) + 2
                },
                this._rtreeGeojson
            );
            if( result.length === 0 ) {
                console.warn('Unable to find: '+this._rtreeGeojson.geometry.properties.id+' in rTree');
            }
            // console.log(result);
        }

        var offset = dpp * (this.size / 2);

        var left = coords[0] - offset;
        var top = coords[1] + offset;
        var right = coords[0] + offset;
        var bottom = coords[1] - offset;

        this._rtreeGeojson = {
            type : 'Feature',
            geometry : {
                type : 'Polygon',
                coordinates : [[
                    [left, top],
                    [right, top],
                    [right, bottom],
                    [left, bottom],
                    [left, top]
                ]]
            },
            properties : {
                id : this.id
            }
        }

        layer.rTree.geoJSON(this._rtreeGeojson);
    }

    // optional, per feature, renderer
    this.renderer = null;

    // geojson was options object
    if( geojson.geojson ) {
        this.renderer = geojson.renderer;
        if( geojson.size ) this.size = geojson.size;
        geojson = geojson.geojson;
    }
    
    if( geojson.geometry ) {
        this.geojson = geojson;
        if (this.id === undefined) return;
    } else {
        this.geojson = {
            type : 'Feature',
            geometry : geojson,
            properties : {
                id : this.id
            }
        }
        this.id = id;
    }

    // points have to be reprojected w/ buffer after zoom
    if( this.geojson.geometry.type === 'Point' ) {
        this.isPoint = true; 
    } else {
        this._rtreeGeojson = {
            type : 'Feature',
            geometry : this.geojson.geometry,
            properties : {
                id : this.id || this.geojson.properties.id
            }
        }
    }

    this.type = this.geojson.geometry.type;
}

module.exports = CanvasFeature;