var CanvasFeature = require('../classes/CanvasFeature');
var CanvasFeatures = require('../classes/CanvasFeatures');

module.exports = function(layer) {
  layer.addCanvasFeatures = function(features) {
    for( var i = 0; i < features.length; i++ ) {
      this.addCanvasFeature(features[i]);
    }
  };

  layer.addCanvasFeature = function(feature, bottom, callback) {
    if( !(feature instanceof CanvasFeature) && !(feature instanceof CanvasFeatures) ) {
      throw new Error('Feature must be instance of CanvasFeature or CanvasFeatures');
    }
    
    prepareCanvasFeature(this, feature);

    if( bottom ) { // bottom or index
      if( typeof bottom === 'number') this.features.splice(bottom, 0, feature);
      else this.features.unshift(feature);
    } else {
      this.features.push(feature);
    }

    this.featureIndex[feature.id] = feature;
  },

  layer.addCanvasFeatureBottom = function(feature) {
    this.addFeature(feature, true);
  };

  // returns true if re-render required.  ie the feature was visible;
  layer.removeCanvasFeature = function(feature) {
    var index = this.features.indexOf(feature);
    if( index == -1 ) return;

    this.splice(index, 1);

    if( this.feature.visible ) return true;
    return false;
  };
  
  layer.removeAll = function() {
      this.allowPanRendering = true;
      this.features = [];
  }
}

function prepareCanvasFeature(layer, canvasFeature) {
    var geojson = canvasFeature.geojson;
    
    if( geojson.type == 'LineString' ) {
      
      canvasFeature.bounds = layer.utils.calcBounds(geojson.coordinates);

    } else if ( geojson.type == 'Polygon' ) {
      // TODO: we only support outer rings out the moment, no inner rings.  Thus coordinates[0]
      canvasFeature.bounds = layer.utils.calcBounds(geojson.coordinates[0]);

    } else if ( geojson.type == 'Point' ) {

      canvasFeature.latlng = L.latLng(geojson.coordinates[1], geojson.coordinates[0]);
    
    } else if ( geojson.type == 'MultiPolygon' ) {
      
      canvasFeature.bounds = [];
      for( var i = 0; i < geojson.coordinates.length; i++  ) {
        canvasFeature.bounds.push(layer.utils.calcBounds(geojson.coordinates[i][0]));
      }
      
    } else {
      throw new Error('GeoJSON feature type "'+geojson.type+'" not supported.');
    }

}