var map = L.map('map').setView([39, -121], 7);

// add an OpenStreetMap tile layer
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var markerLayer = new L.CanvasGeojsonLayer({
  onMouseOver : function(features) {
    for( var i = 0; i < features.length; i++ ) {
      if( !features[i].properties.render ) features[i].properties.render = {};
      features[i].properties.render.hover = true;
    }
    this.render();
  },
  onMouseOut : function(features) {
    for( var i = 0; i < features.length; i++ ) {
      if( !features[i].properties.render ) features[i].properties.render = {};
      features[i].properties.render.hover = false;
    }
    this.render();
  }
});
markerLayer.addTo(map);



$.get('http://localhost:3007/rest/getNetwork', function(resp){
  for( var i = 0; i < resp.length; i++ ) {

    var feature = {
      geojson : resp[i],
      size : 10,
      render : function(ctx, xyPoints, map) {
        var render = this.geojson.properties.render || {};

        if( this.geojson.geometry.type == 'Point' ) {
          ctx.beginPath();

          ctx.arc(xyPoints.x, xyPoints.y, this.size, 0, 2 * Math.PI, false);
          ctx.fillStyle = render.hover ? 'red' : 'rgba(0, 0, 0, .3)';
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'green';

          ctx.stroke();
          ctx.fill();

        } else if ( this.geojson.geometry.type == 'LineString' ) {

          ctx.beginPath();
          ctx.strokeStyle = render.hover ? 'red' : 'orange';
          ctx.fillStyle = 'rgba(0, 0, 0, .3)';
          ctx.lineWidth = 2;

          for( j = 0; j < xyPoints.length; j++ ) {
            if( j == 0 ) ctx.moveTo(xyPoints[j].x, xyPoints[j].y);
            else ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
          }

          ctx.stroke();
          ctx.fill();

          var ne = map.latLngToContainerPoint(this.bounds.getNorthEast());
          var sw = map.latLngToContainerPoint(this.bounds.getSouthWest());

          ctx.beginPath();
          ctx.moveTo(ne.x, ne.y);
          ctx.lineTo(sw.x, ne.y);
          ctx.lineTo(sw.x, sw.y);
          ctx.lineTo(ne.x, sw.y);
          ctx.lineTo(ne.x, ne.y);

          ctx.strokeStyle = 'white';
          ctx.stroke();
        }
      }
    }

    markerLayer.addFeature(feature);
  }

  markerLayer.render();
});

$.get('http://localhost:3007/rest/getRegions', function(resp){

  for( var i = 0; i < resp.length; i++ ) {

    var feature = {
      geojson : resp[i].geo,
      render : function(ctx, xyPoints, map) {
        if( this.geojson.geometry.type != 'Polygon' ) return;

        var render = this.geojson.properties.render || {};

        ctx.beginPath();
        ctx.strokeStyle = render.hover ? 'red' : 'blue';
        ctx.fillStyle = 'rgba(0, 0, 0, .3)';
        ctx.lineWidth = 4;

        if( xyPoints.length > 500 ) {
          for( j = 0; j < xyPoints.length; j += 50 ) {
            if( j == 0 ) ctx.moveTo(xyPoints[j].x, xyPoints[j].y);
            else ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
          }
        } else {
          for( j = 0; j < xyPoints.length; j++ ) {
            if( j == 0 ) ctx.moveTo(xyPoints[j].x, xyPoints[j].y);
            else ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
          }
        }


        ctx.stroke();
        ctx.fill();
      }
    }

    markerLayer.addFeature(feature);
  }

  markerLayer.render();
});
