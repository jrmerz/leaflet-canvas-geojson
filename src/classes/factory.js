var CanvasFeature = require('./CanvasFeature');
var CanvasFeatures = require('./CanvasFeatures');

function factory(arg) {
    if( Array.isArray(arg) ) {
        return arg.map(generate);
    }
    
    return generate(arg);
}

function generate(geojson) {
    if( geojson.type === 'FeatureCollection' ) {
        return new CanvasFeatures(geojson);
    } else if ( geojson.type === 'Feature' ) {
        return new CanvasFeature(geojson);
    }
    throw new Error('Unsupported GeoJSON: '+geojson.type);
}

module.exports = factory;