#! /bin/bash

# --debug: adds sourcemaps
# --standalone: creates exposed namespace
browserify --debug \
    src/layer \
    -o dist/leaflet-canvas-geojson.js \
    -t [ babelify --presets [ es2015 ] ]
