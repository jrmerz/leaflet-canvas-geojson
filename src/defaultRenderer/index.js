var ctx;

/**
 * Fuction called in scope of CanvasFeature
 */
function render(context, xyPoints, map, geojson) {
    ctx = context;
    
    if( geojson.geometry.type === 'Point' ) {
        renderPoint(xyPoints, this.size);
    } else if( geojson.geometry.type === 'LineString' ) {
        renderLine(xyPoints);
    } else if( geojson.geometry.type === 'Polygon' ) {
        renderPolygon(xyPoints);
    } else if( geojson.geometry.type === 'MultiPolygon' ) {
        xyPoints.forEach(renderPolygon);
    }
}

function renderPoint(xyPoint, size) {
    ctx.beginPath();

    ctx.arc(xyPoint.x, xyPoint.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle =  'rgba(0, 0, 0, .3)';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'green';

    ctx.stroke();
    ctx.fill();
}

function renderLine(xyPoints) {

    ctx.beginPath();
    ctx.strokeStyle = 'orange';
    ctx.fillStyle = 'rgba(0, 0, 0, .3)';
    ctx.lineWidth = 2;

    var j;
    ctx.moveTo(xyPoints[0].x, xyPoints[0].y);
    for( j = 1; j < xyPoints.length; j++ ) {
        ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
    }

    ctx.stroke();
    ctx.fill();
}

function renderPolygon(xyPoints) {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'rgba(255, 152, 0,.8)';
    ctx.lineWidth = 2;

    var j;
    ctx.moveTo(xyPoints[0].x, xyPoints[0].y);
    for( j = 1; j < xyPoints.length; j++ ) {
        ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
    }
    ctx.lineTo(xyPoints[0].x, xyPoints[0].y);

    ctx.stroke();
    ctx.fill();
}

module.exports = render;