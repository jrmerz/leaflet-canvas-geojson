var RTree = require('rtree');


/**
 * Handle mouse intersection events
 * e - leaflet event
 **/
function intersects(e) {
    if( !this.showing ) return;

    var dpp = this.getDegreesPerPx(e.latlng);

    var mpp = this.getMetersPerPx(e.latlng);
    var r = mpp * 5; // 5 px radius buffer;

    var center = {
      type : 'Point',
      coordinates : [e.latlng.lng, e.latlng.lat]
    };

    var containerPoint = e.containerPoint;

    var x1 = e.latlng.lng - dpp;
    var x2 = e.latlng.lng + dpp;
    var y1 = e.latlng.lat - dpp;
    var y2 = e.latlng.lat + dpp;

    var intersects = this.intersectsBbox([[x1, y1], [x2, y2]], r, center, containerPoint);

    onIntersectsListCreated.call(this, e, intersects);
}

function intersectsBbox(bbox, precision, center, containerPoint) {
    var clFeatures = [];
    var features = this.rTree.bbox(bbox);
    var i, f, clFeature;

    for( i = 0; i < features.length; i++ ) {
      clFeature = this.getCanvasFeatureById(features[i].properties.id);

      if( !clFeature ) continue;
      if( !clFeature.visible ) continue;
      
      clFeatures.push(clFeature);
    }

    // now make sure this actually overlap if precision is given
    if( precision ) {
      for( var i = clFeatures.length - 1; i >= 0; i-- ) {
        f = clFeatures[i];
        if(f && !this.utils.geometryWithinRadius(f._rtreeGeojson.geometry, f.getCanvasXY(), center, containerPoint, precision) ) {
          clFeatures.splice(i, 1);
        }
      }
    }

    return clFeatures;
}

function onIntersectsListCreated(e, intersects) {
  if( e.type == 'click' && this.onClick ) {
    var latlng = e.latlng;
    this.onClick(intersects, latlng);
    return;
  }

  var mouseover = [], mouseout = [], mousemove = [];

  var changed = false;
  for( var i = 0; i < intersects.length; i++ ) {
    if( this.intersectList.indexOf(intersects[i]) > -1 ) {
      mousemove.push(intersects[i]);
    } else {
      changed = true;
      mouseover.push(intersects[i]);
    }
  }

  for( var i = 0; i < this.intersectList.length; i++ ) {
    if( intersects.indexOf(this.intersectList[i]) == -1 ) {
      changed = true;
      mouseout.push(this.intersectList[i]);
    }
  }

  this.intersectList = intersects;

  if( this.onMouseOver && mouseover.length > 0 ) this.onMouseOver.call(this, mouseover, e);
  if( this.onMouseMove ) this.onMouseMove.call(this, mousemove, e); // always fire
  if( this.onMouseOut && mouseout.length > 0 ) this.onMouseOut.call(this, mouseout, e);
}

function rebuild(clFeatures) {
  var features = [];

  for( var i = 0; i < clFeatures.length; i++ ) {
    features.push(clFeatures[i]._rtreeGeojson);
    clFeatures[i].order = i;
  }

  this.rTree = new RTree();
  this.rTree.geoJSON({
    type : 'FeatureCollection',
    features : features
  });
}

function add(clFeature) {
  if( clFeature.isPoint ) {
    clFeature.updatePointInRTree(this);
  } else {
    this.rTree.geoJSON(clFeature._rtreeGeojson);
  }
}

// TODO: need to prototype these functions
module.exports = function(layer) {
  layer.intersects = intersects;
  layer.intersectsBbox = intersectsBbox;
  layer.rebuildIndex = rebuild;
  layer.addToIndex = add;
}
