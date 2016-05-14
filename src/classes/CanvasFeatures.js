var CanvasFeature = require('./CanvasFeature');

function CanvasFeatures(geojson) {
    // quick type flag
    this.isCanvasFeatures = true;
    
    this.canvasFeatures = [];
    
    // radius for point features
    // use to calculate mouse over/out and click events for points
    // this value should match the value used for rendering points
    this.size = 5;
    
    // actual geojson object, will not be modifed, just stored
    this.geojson = geojson;
    
    // performance flag, will keep invisible features for recalc 
    // events as well as not being rendered
    this.visible = true;
    
    this.clearCache = function() {
        for( var i = 0; i < this.canvasFeatures.length; i++ ) {
            this.canvasFeatures[i].clearCache();
        }
    }
    
    if( this.geojson ) {
        for( var i = 0; i < this.geojson.features.length; i++ ) {
            this.canvasFeatures.push(new CanvasFeature(this.geojson.features[i]));
        }
    }
}

module.exports = CanvasFeatures;