var RTree = require('rtree');
var rTree = new RTree();
var layer;

/** 
 * Handle mouse intersection events
 * e - leaflet event
 **/
function intersects(e) {
    if( !this.showing ) return;

    var dpp = this.getDegreesPerPx(e.latlng);

    var x1 = e.latlng.lng - dpp;
    var x2 = e.latlng.lng + dpp;
    var y1 = e.latlng.lat - dpp;
    var y2 = e.latlng.lat + dpp;

    var intersects = intersectsBbox([[x1, y1], [x2, y2]]);

    onIntersectsListCreated.call(this, e, intersects);
}

function intersectsBbox(bbox) {
    var clFeatures = [];
    var features = rTree.bbox(bbox);
    for( var i = 0; i < features.length; i++ ) {
      clFeatures.push(layer.getCanvasFeatureById(features[i].properties.id));
    }
    return clFeatures;
}

function onIntersectsListCreated(e, intersects) {
  if( e.type == 'click' && this.onClick ) {
    this.onClick(intersects);
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
    features.push(clFeatures[i].geojson); 
  }

  rTree = new RTree();
  rTree.geoJSON({
    type : 'FeatureCollection',
    features : features
  });
}

function add(clFeature) {
  rTree.geoJSON(clFeature.geojson);
}

module.exports = {
  intersects : intersects,
  intersectsBbox : intersectsBbox,
  rebuild : rebuild,
  add : add,
  setLayer : function(l) {
    layer = l;
  }
}