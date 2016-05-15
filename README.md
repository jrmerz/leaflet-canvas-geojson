# leaflet-canvas-geojson
A HTML canvas layer to render large amounts of geojson data.


## Basic Usage

```javascript
/**
 * note unlike most DOM based map event handling which return only
 * the top feature, the L.CanvasGeojsonLayer returns all features
 * the are moused over or clicked.
 */
var canvasLayer = new L.CanvasGeojsonLayer({
    onMouseOver : function(features) {
        // handle mouseover events
    },
    onMouseOut : function(features) {
        // handle mouseout events
    },
    onClick : function(features) {
        // handle mouse click events
    }
});

// add to map
canvasLayer.addTo(map);

/**
 * This is just shorthand for creating a bunch of L.CanvasFeature 
 * or L.CanvasFeatureCollection objects from your geojson
 */
canvasLayer.addCanvasFeatures(L.CanvasFeatureFactory(geojsonData));

// first render
canvasLayer.render();
```

## Rendering

There are two ways two the geojson:

1) Assign a renderer to the layer
```javascript
canvasLayer.renderer = function() {}
```

2) Assign a renderer to the L.CanvasFeature
```javascript
canvasFeature.renderer = function() {}
```

If a CanvasFeature render is provided, it will be used instead of the layer
render.

The renderer function should look like:
```javascript
/**
 * ctx - The canvas elements 2d context
 * xyPoints - either object or array
 *  for Point: {x: number, y: number}
 *  for Linestring: array of points
 *  for Polygon: array of points
 *  for Multipolygon: array of Polygons
 * map - canvas layers map
 * geojson - actual geojson object passed to L.CanvasFeature
 *
 * The function will be called in scope of the CanvasFeature.  So
 * [this] will access the CanvasFeature
 */
function render(ctx, xyPoints, map, geojson) {
    // to stuff here
}
```

See /src/defaultRenderer/index.js for full example.  This is also the layer
default if no renderer is assigned.

## Layer Methods

### addCanvasFeatures(features: [L.CanvasFeature | L.CanvasFeatureCollection])

Add array of CanvasFeatures to layer

### addCanvasFeature(feature: L.CanvasFeature | L.CanvasFeatureCollection)

Add single L.CanvasFeature or L.CanvasFeatureCollection

### removeCanvasFeature(feature: L.CanvasFeature | L.CanvasFeatureCollection)

remove single L.CanvasFeature or L.CanvasFeatureCollection

### removeAll()

Remove all canvas layer features

### getCanvasFeatureForGeojson(geojson: Object)

Returns a L.CanvasFeature or L.CanvasFeatureCollection.  Useful for when you need
to lookup a Feature to remove or update the visibility

### render()

Render to GeoJSON

## CanvasFeature Visibility

If you want to hide/show a feature, the recommended method is to use the visible
flag with the associated L.CanvasFeature.  Not only will the Feature not be drawn,
but this flag will save the layer from reprojecting the feature.


