
module.exports = function(layer) {
     layer.toCanvasXY = function(feature, geojson, zoom) {
        // make sure we have a cache namespace and set the zoom level
        if( !feature.cache ) feature.cache = {};
        var canvasXY;

        if( geojson.geometry.type == 'Point' ) {

        canvasXY = this._map.latLngToContainerPoint([
            geojson.geometry.coordinates[1],
            geojson.geometry.coordinates[0]
        ]);

        if( feature.size ) {
            canvasXY[0] = canvasXY[0] - feature.size / 2;
            canvasXY[1] = canvasXY[1] - feature.size / 2;
        }

        } else if( geojson.geometry.type == 'LineString' ) {
            
        canvasXY = this.utils.projectLine(geojson.geometry.coordinates, this._map);
        trimCanvasXY(canvasXY);
    
        } else if ( geojson.geometry.type == 'Polygon' ) {
        
        canvasXY = this.utils.projectLine(geojson.geometry.coordinates[0], this._map);
        trimCanvasXY(canvasXY);
        
        } else if ( geojson.geometry.type == 'MultiPolygon' ) {
            canvasXY = [];
        
            for( var i = 0; i < geojson.geometry.coordinates.length; i++ ) {
                var xy = this.utils.projectLine(geojson.geometry.coordinates[i][0], this._map);
                trimCanvasXY(xy);
                canvasXY.push(xy);
            }
        }
        
        feature.setCanvasXY(canvasXY, zoom);
    };
}

// given an array of geo xy coordinates, make sure each point is at least more than 1px apart
function trimCanvasXY(xy) {
    if( xy.length === 0 ) return;
    var last = xy[xy.length-1], i, point;

    var c = 0;
    for( i = xy.length-2; i >= 0; i-- ) {
        point = xy[i];
        if( Math.abs(last.x - point.x) === 0 && Math.abs(last.y - point.y) === 0 ) {
            xy.splice(i, 1);
            c++;
        } else {
            last = point;
        }
    }

    if( xy.length <= 1 ) {
        xy.push(last);
        c--;
    }
};