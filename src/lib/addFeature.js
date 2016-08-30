var CanvasFeature = require('../classes/CanvasFeature');
var CanvasFeatures = require('../classes/CanvasFeatures');

module.exports = function(layer) {
  layer.addCanvasFeatures = function(features) {
    for( var i = 0; i < features.length; i++ ) {
      this.addCanvasFeature(features[i], false, null, false);
    }

    this.rebuildIndex(this.features);
  };

  layer.addCanvasFeature = function(feature, bottom, callback) {
    if( !(feature instanceof CanvasFeature) && !(feature instanceof CanvasFeatures) ) {
      throw new Error('Feature must be instance of CanvasFeature or CanvasFeatures');
    }

    if( bottom ) { // bottom or index
      if( typeof bottom === 'number') this.features.splice(bottom, 0, feature);
      else this.features.unshift(feature);
    } else {
      this.features.push(feature);
    }

    this.featureIndex[feature.id] = feature;

    this.addToIndex(feature);
  },

  // returns true if re-render required.  ie the feature was visible;
  layer.removeCanvasFeature = function(feature) {
    var index = this.features.indexOf(feature);
    if( index == -1 ) return;

    this.splice(index, 1);

    this.rebuildIndex(this.features);

    if( this.feature.visible ) return true;
    return false;
  };
  
  layer.removeAll = function() {
    this.allowPanRendering = true;
    this.features = [];
    this.rebuildIndex(this.features);
  }
}