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

        for( j = 0; j < xyPoints.length; j++ ) {
          if( j == 0 ) ctx.moveTo(xyPoints[j].x, xyPoints[j].y);
          else ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
        }

        ctx.stroke();
        ctx.fill();
      }
    }

    markerLayer.addFeature(feature);
  }

  console.log(markerLayer.features);
  markerLayer.render();
});
