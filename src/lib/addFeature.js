var CanvasFeature = require('../classes/CanvasFeature');
var CanvasFeatures = require('../classes/CanvasFeatures');

module.exports = function(layer) {
  layer.addCanvasFeatures = function(features) {
    for( var i = 0; i < features.length; i++ ) {
      this.addCanvasFeature(features[i]);
    }
  };

  layer.addCanvasFeature = function(feature, bottom) {
    if( !(feature instanceof CanvasFeature) && !(feature instanceof CanvasFeatures) ) {
      throw new Error('Feature must be instance of CanvasFeature or CanvasFeatures');
    }
    
    if( feature instanceof CanvasFeatures ) {
        feature.canvasFeatures.forEach(function(f){
            prepareCanvasFeature(this, f);
        }.bind(this));
    } else {
        prepareCanvasFeature(this, feature);
    }

    if( bottom ) { // bottom or index
      if( typeof bottom === 'number') this.features.splice(bottom, 0, feature);
      else this.features.unshift(feature);
    } else {
      this.features.push(feature);
    }
  },

  layer.addCanvasFeatureBottom = function(feature) {
    this.addFeature(feature, true);
  };

  // returns true if re-render required.  ie the feature was visible;
  layer.removeFeature = function(feature) {
    var index = this.features.indexOf(feature);
    if( index == -1 ) return;

    this.splice(index, 1);

    if( this.feature.visible ) return true;
    return false;
  };
}

function prepareCanvasFeature(layer, canvasFeature) {
    var geometry = canvasFeature.geojson.geometry;
    
    if( geometry.type == 'LineString' ) {
        
      canvasFeature.bounds = layer.utils.calcBounds(geometry.coordinates);

    } else if ( geometry.type == 'Polygon' ) {
      // TODO: we only support outer rings out the moment, no inner rings.  Thus coordinates[0]
      canvasFeature.bounds = layer.utils.calcBounds(geometry.coordinates[0]);

    } else if ( geometry.type == 'Point' ) {
 
      canvasFeature.latlng = L.latLng(geometry.coordinates[1], geometry.coordinates[0]);
    
    } else if ( geometry.type == 'MultiPolygon' ) {
      
      canvasFeature.bounds = [];
      for( var i = 0; i < geometry.coordinates.length; i++  ) {
        canvasFeature.bounds.push(layer.utils.calcBounds(geometry.coordinates[i][0]));
      }
      
    } else {
      throw new Error('GeoJSON feature type "'+geometry.type+'" not supported.');
    }
}