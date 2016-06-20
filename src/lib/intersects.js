var async = require('async');

var running = false;
var reschedule = null;

/** 
 * Handle mouse intersection events
 * e - leaflet event
 **/
function intersects(e) {
    if( !this.showing ) return;

    if( running ) {
      reschedule = e;
      return;
    }
    running = true;

    var t = new Date().getTime();
    var mpp = this.getMetersPerPx(e.latlng);
    var r = mpp * 5; // 5 px radius buffer;

    var center = {
      type : 'Point',
      coordinates : [e.latlng.lng, e.latlng.lat]
    };

    var f;
    var intersects = [];

    async.eachSeries(
      this.features,
      (f, next) => {
        f = this.features[i];

        if( !f.visible ) {
          return next();
        }
        if( !f.getCanvasXY() ) {
          return next();
        }
        if( !isInBounds(f, e.latlng) ) {
          return next();
        }

        f.getGeoJson((geojson) => {
          if( this.utils.geometryWithinRadius(geojson.geometry, f.getCanvasXY(), center, e.containerPoint, f.size ? (f.size * mpp) : r) ) {
            intersects.push(f.geojson);
            next();
          }
        });
      },
      (err) => {
        onIntersectsListCreated.call(this, e, intersects);
      }
    );
    
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

  if( this.debug ) console.log('intersects time: '+(new Date().getTime() - t)+'ms');

  running = false;
  if( reschedule ) {
    var e = reschedule;
    reschedule = null;
    this.intersects(e);
  }
}

function isInBounds(feature, latlng) {
    if( feature.bounds ) {
        if( Array.isArray(feature.bounds) ) {

        for( var i = 0; i < feature.bounds.length; i++ ) {
            if( feature.bounds[i].contains(latlng) ) return true;
        }

        } else if ( feature.bounds.contains(latlng) ) {
        return true;
        }

        return false;
    }
    return true;
}

module.exports = intersects;