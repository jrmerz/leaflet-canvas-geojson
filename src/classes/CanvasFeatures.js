var CanvasFeature = require('./CanvasFeature');

function CanvasFeatures(geojson) {
    // quick type flag
    this.isCanvasFeatures = true;
    
    this.canvasFeatures = [];
    
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
            
            if (!this.geojson.features[i].hasOwnProperty('id') || this.geojson.features[i].id === null) {
              this.geojson.features[i].id = i;
            }

            this.canvasFeatures.push(new CanvasFeature(this.geojson.features[i]));
        }
    }
}

module.exports = CanvasFeatures;