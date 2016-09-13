(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var rectangle = require('./rectangle');
var bbox = function (ar, obj) {
  if (obj && obj.bbox) {
    return {
      leaf: obj,
      x: obj.bbox[0],
      y: obj.bbox[1],
      w: obj.bbox[2] - obj.bbox[0],
      h: obj.bbox[3] - obj.bbox[1]
    };
  }
  var len = ar.length;
  var i = 0;
  var a = new Array(len);
  while (i < len) {
    a[i] = [ar[i][0], ar[i][1]];
    i++;
  }
  var first = a[0];
  len = a.length;
  i = 1;
  var temp = {
    min: [].concat(first),
    max: [].concat(first)
  };
  while (i < len) {
    if (a[i][0] < temp.min[0]) {
      temp.min[0] = a[i][0];
    }
    else if (a[i][0] > temp.max[0]) {
      temp.max[0] = a[i][0];
    }
    if (a[i][1] < temp.min[1]) {
      temp.min[1] = a[i][1];
    }
    else if (a[i][1] > temp.max[1]) {
      temp.max[1] = a[i][1];
    }
    i++;
  }
  var out = {
    x: temp.min[0],
    y: temp.min[1],
    w: (temp.max[0] - temp.min[0]),
    h: (temp.max[1] - temp.min[1])
  };
  if (obj) {
    out.leaf = obj;
  }
  return out;
};
var geoJSON = {};
geoJSON.point = function (obj, self) {
  return (self.insertSubtree({
    x: obj.geometry.coordinates[0],
    y: obj.geometry.coordinates[1],
    w: 0,
    h: 0,
    leaf: obj
  }, self.root));
};
geoJSON.multiPointLineString = function (obj, self) {
  return (self.insertSubtree(bbox(obj.geometry.coordinates, obj), self.root));
};
geoJSON.multiLineStringPolygon = function (obj, self) {
  return (self.insertSubtree(bbox(Array.prototype.concat.apply([], obj.geometry.coordinates), obj), self.root));
};
geoJSON.multiPolygon = function (obj, self) {
  return (self.insertSubtree(bbox(Array.prototype.concat.apply([], Array.prototype.concat.apply([], obj.geometry.coordinates)), obj), self.root));
};
geoJSON.makeRec = function (obj) {
  return rectangle(obj.x, obj.y, obj.w, obj.h);
};
geoJSON.geometryCollection = function (obj, self) {
  if (obj.bbox) {
    return (self.insertSubtree({
      leaf: obj,
      x: obj.bbox[0],
      y: obj.bbox[1],
      w: obj.bbox[2] - obj.bbox[0],
      h: obj.bbox[3] - obj.bbox[1]
    }, self.root));
  }
  var geos = obj.geometry.geometries;
  var i = 0;
  var len = geos.length;
  var temp = [];
  var g;
  while (i < len) {
    g = geos[i];
    switch (g.type) {
    case 'Point':
      temp.push(geoJSON.makeRec({
        x: g.coordinates[0],
        y: g.coordinates[1],
        w: 0,
        h: 0
      }));
      break;
    case 'MultiPoint':
      temp.push(geoJSON.makeRec(bbox(g.coordinates)));
      break;
    case 'LineString':
      temp.push(geoJSON.makeRec(bbox(g.coordinates)));
      break;
    case 'MultiLineString':
      temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], g.coordinates))));
      break;
    case 'Polygon':
      temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], g.coordinates))));
      break;
    case 'MultiPolygon':
      temp.push(geoJSON.makeRec(bbox(Array.prototype.concat.apply([], Array.prototype.concat.apply([], g.coordinates)))));
      break;
    case 'GeometryCollection':
      geos = geos.concat(g.geometries);
      len = geos.length;
      break;
    }
    i++;
  }
  var first = temp[0];
  i = 1;
  len = temp.length;
  while (i < len) {
    first.expand(temp[i]);
    i++;
  }
  return self.insertSubtree({
    leaf: obj,
    x: first.x(),
    y: first.y(),
    h: first.h(),
    w: first.w()
  }, self.root);
};
exports.geoJSON = function (prelim) {
  var that = this;
  var features, feature;
  if (Array.isArray(prelim)) {
    features = prelim.slice();
  }
  else if (prelim.features && Array.isArray(prelim.features)) {
    features = prelim.features.slice();
  }
  else if (prelim instanceof Object) {
    features = [prelim];
  } else {
    throw ('this isn\'t what we\'re looking for');
  }
  var len = features.length;
  var i = 0;
  while (i < len) {
    feature = features[i];
    if (feature.type === 'Feature') {
      switch (feature.geometry.type) {
      case 'Point':
        geoJSON.point(feature, that);
        break;
      case 'MultiPoint':
        geoJSON.multiPointLineString(feature, that);
        break;
      case 'LineString':
        geoJSON.multiPointLineString(feature, that);
        break;
      case 'MultiLineString':
        geoJSON.multiLineStringPolygon(feature, that);
        break;
      case 'Polygon':
        geoJSON.multiLineStringPolygon(feature, that);
        break;
      case 'MultiPolygon':
        geoJSON.multiPolygon(feature, that);
        break;
      case 'GeometryCollection':
        geoJSON.geometryCollection(feature, that);
        break;
      }
    }
    i++;
  }
};
exports.bbox = function () {
  var x1, y1, x2, y2;
  switch (arguments.length) {
  case 1:
    x1 = arguments[0][0][0];
    y1 = arguments[0][0][1];
    x2 = arguments[0][1][0];
    y2 = arguments[0][1][1];
    break;
  case 2:
    x1 = arguments[0][0];
    y1 = arguments[0][1];
    x2 = arguments[1][0];
    y2 = arguments[1][1];
    break;
  case 4:
    x1 = arguments[0];
    y1 = arguments[1];
    x2 = arguments[2];
    y2 = arguments[3];
    break;
  }

  return this.search({
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1
  });
};

},{"./rectangle":3}],2:[function(require,module,exports){
'use strict';
var RTree = require('./rtree');
var geojson = require('./geojson');
RTree.prototype.bbox = geojson.bbox;
RTree.prototype.geoJSON = geojson.geoJSON;
RTree.Rectangle = require('./rectangle');
module.exports = RTree;
},{"./geojson":1,"./rectangle":3,"./rtree":4}],3:[function(require,module,exports){
'use strict';
function Rectangle(x, y, w, h) { // new Rectangle(bounds) or new Rectangle(x, y, w, h)
  if (!(this instanceof Rectangle)) {
    return new Rectangle(x, y, w, h);
  }
  var x2, y2, p;

  if (x.x) {
    w = x.w;
    h = x.h;
    y = x.y;
    if (x.w !== 0 && !x.w && x.x2) {
      w = x.x2 - x.x;
      h = x.y2 - x.y;
    }
    else {
      w = x.w;
      h = x.h;
    }
    x = x.x;
    // For extra fastitude
    x2 = x + w;
    y2 = y + h;
    p = (h + w) ? false : true;
  }
  else {
    // For extra fastitude
    x2 = x + w;
    y2 = y + h;
    p = (h + w) ? false : true;
  }

  this.x1 = this.x = function () {
    return x;
  };
  this.y1 = this.y = function () {
    return y;
  };
  this.x2 = function () {
    return x2;
  };
  this.y2 = function () {
    return y2;
  };
  this.w = function () {
    return w;
  };
  this.h = function () {
    return h;
  };
  this.p = function () {
    return p;
  };

  this.overlap = function (a) {
    if (p || a.p()) {
      return x <= a.x2() && x2 >= a.x() && y <= a.y2() && y2 >= a.y();
    }
    return x < a.x2() && x2 > a.x() && y < a.y2() && y2 > a.y();
  };

  this.expand = function (a) {
    var nx, ny;
    var ax = a.x();
    var ay = a.y();
    var ax2 = a.x2();
    var ay2 = a.y2();
    if (x > ax) {
      nx = ax;
    }
    else {
      nx = x;
    }
    if (y > ay) {
      ny = ay;
    }
    else {
      ny = y;
    }
    if (x2 > ax2) {
      w = x2 - nx;
    }
    else {
      w = ax2 - nx;
    }
    if (y2 > ay2) {
      h = y2 - ny;
    }
    else {
      h = ay2 - ny;
    }
    x = nx;
    y = ny;
    return this;
  };

  //End of RTree.Rectangle
}


/* returns true if rectangle 1 overlaps rectangle 2
 * [ boolean ] = overlapRectangle(rectangle a, rectangle b)
 * @static function
 */
Rectangle.overlapRectangle = function (a, b) {
  //if(!((a.h||a.w)&&(b.h||b.w))){ not faster resist the urge!
  if ((a.h === 0 && a.w === 0) || (b.h === 0 && b.w === 0)) {
    return a.x <= (b.x + b.w) && (a.x + a.w) >= b.x && a.y <= (b.y + b.h) && (a.y + a.h) >= b.y;
  }
  else {
    return a.x < (b.x + b.w) && (a.x + a.w) > b.x && a.y < (b.y + b.h) && (a.y + a.h) > b.y;
  }
};

/* returns true if rectangle a is contained in rectangle b
 * [ boolean ] = containsRectangle(rectangle a, rectangle b)
 * @static function
 */
Rectangle.containsRectangle = function (a, b) {
  return (a.x + a.w) <= (b.x + b.w) && a.x >= b.x && (a.y + a.h) <= (b.y + b.h) && a.y >= b.y;
};

/* expands rectangle A to include rectangle B, rectangle B is untouched
 * [ rectangle a ] = expandRectangle(rectangle a, rectangle b)
 * @static function
 */
Rectangle.expandRectangle = function (a, b) {
  var nx, ny;
  var axw = a.x + a.w;
  var bxw = b.x + b.w;
  var ayh = a.y + a.h;
  var byh = b.y + b.h;
  if (a.x > b.x) {
    nx = b.x;
  }
  else {
    nx = a.x;
  }
  if (a.y > b.y) {
    ny = b.y;
  }
  else {
    ny = a.y;
  }
  if (axw > bxw) {
    a.w = axw - nx;
  }
  else {
    a.w = bxw - nx;
  }
  if (ayh > byh) {
    a.h = ayh - ny;
  }
  else {
    a.h = byh - ny;
  }
  a.x = nx;
  a.y = ny;
  return a;
};

/* generates a minimally bounding rectangle for all rectangles in
 * array 'nodes'. If rect is set, it is modified into the MBR. Otherwise,
 * a new rectangle is generated and returned.
 * [ rectangle a ] = makeMBR(rectangle array nodes, rectangle rect)
 * @static function
 */
Rectangle.makeMBR = function (nodes, rect) {
  if (!nodes.length) {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };
  }
  rect = rect || {};
  rect.x = nodes[0].x;
  rect.y = nodes[0].y;
  rect.w = nodes[0].w;
  rect.h = nodes[0].h;

  for (var i = 1, len = nodes.length; i < len; i++) {
    Rectangle.expandRectangle(rect, nodes[i]);
  }

  return rect;
};
Rectangle.squarifiedRatio = function (l, w, fill) {
  // Area of new enlarged rectangle
  var lperi = (l + w) / 2.0; // Average size of a side of the new rectangle
  var larea = l * w; // Area of new rectangle
  // return the ratio of the perimeter to the area - the closer to 1 we are,
  // the more 'square' a rectangle is. conversly, when approaching zero the
  // more elongated a rectangle is
  var lgeo = larea / (lperi * lperi);
  return larea * fill / lgeo;
};
module.exports = Rectangle;
},{}],4:[function(require,module,exports){
'use strict';
var rectangle = require('./rectangle');
function RTree(width) {
  if (!(this instanceof RTree)) {
    return new RTree(width);
  }
  // Variables to control tree-dimensions
  var minWidth = 3;  // Minimum width of any node before a merge
  var maxWidth = 6;  // Maximum width of any node before a split
  if (!isNaN(width)) {
    minWidth = Math.floor(width / 2.0);
    maxWidth = width;
  }
  // Start with an empty root-tree
  var rootTree = {x: 0, y: 0, w: 0, h: 0, id: 'root', nodes: [] };
  this.root = rootTree;


  // This is my special addition to the world of r-trees
  // every other (simple) method I found produced crap trees
  // this skews insertions to prefering squarer and emptier nodes
  var flatten = function (tree) {
    var todo = tree.slice();
    var done = [];
    var current;
    while (todo.length) {
      current = todo.pop();
      if (current.nodes) {
        todo = todo.concat(current.nodes);
      } else if (current.leaf) {
        done.push(current);
      }
    }
    return done;
  };
  /* find the best specific node(s) for object to be deleted from
   * [ leaf node parent ] = removeSubtree(rectangle, object, root)
   * @private
   */
  var removeSubtree = function (rect, obj, root) {
    var hitStack = []; // Contains the elements that overlap
    var countStack = []; // Contains the elements that overlap
    var retArray = [];
    var currentDepth = 1;
    var tree, i, ltree;
    if (!rect || !rectangle.overlapRectangle(rect, root)) {
      return retArray;
    }
    var retObj = {x: rect.x, y: rect.y, w: rect.w, h: rect.h, target: obj};

    countStack.push(root.nodes.length);
    hitStack.push(root);
    while (hitStack.length > 0) {
      tree = hitStack.pop();
      i = countStack.pop() - 1;
      if ('target' in retObj) { // will this ever be false?
        while (i >= 0) {
          ltree = tree.nodes[i];
          if (rectangle.overlapRectangle(retObj, ltree)) {

            if ((retObj.target && 'leaf' in ltree && ltree.leaf === retObj.target) || (!retObj.target && ('leaf' in ltree || rectangle.containsRectangle(ltree, retObj)))) {
              // A Match !!
            // Yup we found a match...
            // we can cancel search and start walking up the list
              if ('nodes' in ltree) {// If we are deleting a node not a leaf...
                retArray = flatten(tree.nodes.splice(i, 1));
              } else {
                retArray = tree.nodes.splice(i, 1);
              }
              // Resize MBR down...
              rectangle.makeMBR(tree.nodes, tree);
              delete retObj.target;
              //if (tree.nodes.length < minWidth) { // Underflow
              //  retObj.nodes = searchSubtree(tree, true, [], tree);
              //}
              break;
            } else if ('nodes' in ltree) { // Not a Leaf
              currentDepth++;
              countStack.push(i);
              hitStack.push(tree);
              tree = ltree;
              i = ltree.nodes.length;
            }
          }
          i--;
        }

      } else if ('nodes' in retObj) { // We are unsplitting

        tree.nodes.splice(i + 1, 1); // Remove unsplit node
        if (tree.nodes.length > 0) {
          rectangle.makeMBR(tree.nodes, tree);
        }
        for (var t = 0;t < retObj.nodes.length;t++) {
          insertSubtree(retObj.nodes[t], tree);
        }
        retObj.nodes = [];
        if (hitStack.length === 0 && tree.nodes.length <= 1) { // Underflow..on root!
          retObj.nodes = searchSubtree(tree, true, retObj.nodes, tree);
          tree.nodes = [];
          hitStack.push(tree);
          countStack.push(1);
        } else if (hitStack.length > 0 && tree.nodes.length < minWidth) { // Underflow..AGAIN!
          retObj.nodes = searchSubtree(tree, true, retObj.nodes, tree);
          tree.nodes = [];
        } else {
          delete retObj.nodes; // Just start resizing
        }
      } else { // we are just resizing
        rectangle.makeMBR(tree.nodes, tree);
      }
      currentDepth -= 1;
    }
    return retArray;
  };

  /* choose the best damn node for rectangle to be inserted into
   * [ leaf node parent ] = chooseLeafSubtree(rectangle, root to start search at)
   * @private
   */
  var chooseLeafSubtree = function (rect, root) {
    var bestChoiceIndex = -1;
    var bestChoiceStack = [];
    var bestChoiceArea;
    var first = true;
    bestChoiceStack.push(root);
    var nodes = root.nodes;

    while (first || bestChoiceIndex !== -1) {
      if (first) {
        first = false;
      } else {
        bestChoiceStack.push(nodes[bestChoiceIndex]);
        nodes = nodes[bestChoiceIndex].nodes;
        bestChoiceIndex = -1;
      }

      for (var i = nodes.length - 1; i >= 0; i--) {
        var ltree = nodes[i];
        if ('leaf' in ltree) {
          // Bail out of everything and start inserting
          bestChoiceIndex = -1;
          break;
        }
        // Area of new enlarged rectangle
        var oldLRatio = rectangle.squarifiedRatio(ltree.w, ltree.h, ltree.nodes.length + 1);

        // Enlarge rectangle to fit new rectangle
        var nw = Math.max(ltree.x + ltree.w, rect.x + rect.w) - Math.min(ltree.x, rect.x);
        var nh = Math.max(ltree.y + ltree.h, rect.y + rect.h) - Math.min(ltree.y, rect.y);

        // Area of new enlarged rectangle
        var lratio = rectangle.squarifiedRatio(nw, nh, ltree.nodes.length + 2);

        if (bestChoiceIndex < 0 || Math.abs(lratio - oldLRatio) < bestChoiceArea) {
          bestChoiceArea = Math.abs(lratio - oldLRatio);
          bestChoiceIndex = i;
        }
      }
    }

    return bestChoiceStack;
  };

  /* split a set of nodes into two roughly equally-filled nodes
   * [ an array of two new arrays of nodes ] = linearSplit(array of nodes)
   * @private
   */
  var linearSplit = function (nodes) {
    var n = pickLinear(nodes);
    while (nodes.length > 0) {
      pickNext(nodes, n[0], n[1]);
    }
    return n;
  };

  /* insert the best source rectangle into the best fitting parent node: a or b
   * [] = pickNext(array of source nodes, target node array a, target node array b)
   * @private
   */
  var pickNext = function (nodes, a, b) {
  // Area of new enlarged rectangle
    var areaA = rectangle.squarifiedRatio(a.w, a.h, a.nodes.length + 1);
    var areaB = rectangle.squarifiedRatio(b.w, b.h, b.nodes.length + 1);
    var highAreaDelta;
    var highAreaNode;
    var lowestGrowthGroup;

    for (var i = nodes.length - 1; i >= 0;i--) {
      var l = nodes[i];
      var newAreaA = {};
      newAreaA.x = Math.min(a.x, l.x);
      newAreaA.y = Math.min(a.y, l.y);
      newAreaA.w = Math.max(a.x + a.w, l.x + l.w) - newAreaA.x;
      newAreaA.h = Math.max(a.y + a.h, l.y + l.h) - newAreaA.y;
      var changeNewAreaA = Math.abs(rectangle.squarifiedRatio(newAreaA.w, newAreaA.h, a.nodes.length + 2) - areaA);

      var newAreaB = {};
      newAreaB.x = Math.min(b.x, l.x);
      newAreaB.y = Math.min(b.y, l.y);
      newAreaB.w = Math.max(b.x + b.w, l.x + l.w) - newAreaB.x;
      newAreaB.h = Math.max(b.y + b.h, l.y + l.h) - newAreaB.y;
      var changeNewAreaB = Math.abs(rectangle.squarifiedRatio(newAreaB.w, newAreaB.h, b.nodes.length + 2) - areaB);

      if (!highAreaNode || !highAreaDelta || Math.abs(changeNewAreaB - changeNewAreaA) < highAreaDelta) {
        highAreaNode = i;
        highAreaDelta = Math.abs(changeNewAreaB - changeNewAreaA);
        lowestGrowthGroup = changeNewAreaB < changeNewAreaA ? b : a;
      }
    }
    var tempNode = nodes.splice(highAreaNode, 1)[0];
    if (a.nodes.length + nodes.length + 1 <= minWidth) {
      a.nodes.push(tempNode);
      rectangle.expandRectangle(a, tempNode);
    }  else if (b.nodes.length + nodes.length + 1 <= minWidth) {
      b.nodes.push(tempNode);
      rectangle.expandRectangle(b, tempNode);
    }
    else {
      lowestGrowthGroup.nodes.push(tempNode);
      rectangle.expandRectangle(lowestGrowthGroup, tempNode);
    }
  };

  /* pick the 'best' two starter nodes to use as seeds using the 'linear' criteria
   * [ an array of two new arrays of nodes ] = pickLinear(array of source nodes)
   * @private
   */
  var pickLinear = function (nodes) {
    var lowestHighX = nodes.length - 1;
    var highestLowX = 0;
    var lowestHighY = nodes.length - 1;
    var highestLowY = 0;
    var t1, t2;

    for (var i = nodes.length - 2; i >= 0;i--) {
      var l = nodes[i];
      if (l.x > nodes[highestLowX].x) {
        highestLowX = i;
      } else if (l.x + l.w < nodes[lowestHighX].x + nodes[lowestHighX].w) {
        lowestHighX = i;
      }
      if (l.y > nodes[highestLowY].y) {
        highestLowY = i;
      } else if (l.y + l.h < nodes[lowestHighY].y + nodes[lowestHighY].h) {
        lowestHighY = i;
      }
    }
    var dx = Math.abs((nodes[lowestHighX].x + nodes[lowestHighX].w) - nodes[highestLowX].x);
    var dy = Math.abs((nodes[lowestHighY].y + nodes[lowestHighY].h) - nodes[highestLowY].y);
    if (dx > dy)  {
      if (lowestHighX > highestLowX)  {
        t1 = nodes.splice(lowestHighX, 1)[0];
        t2 = nodes.splice(highestLowX, 1)[0];
      }  else {
        t2 = nodes.splice(highestLowX, 1)[0];
        t1 = nodes.splice(lowestHighX, 1)[0];
      }
    }  else {
      if (lowestHighY > highestLowY)  {
        t1 = nodes.splice(lowestHighY, 1)[0];
        t2 = nodes.splice(highestLowY, 1)[0];
      }  else {
        t2 = nodes.splice(highestLowY, 1)[0];
        t1 = nodes.splice(lowestHighY, 1)[0];
      }
    }
    return [
      {x: t1.x, y: t1.y, w: t1.w, h: t1.h, nodes: [t1]},
      {x: t2.x, y: t2.y, w: t2.w, h: t2.h, nodes: [t2]}
    ];
  };

  var attachData = function (node, moreTree) {
    node.nodes = moreTree.nodes;
    node.x = moreTree.x;
    node.y = moreTree.y;
    node.w = moreTree.w;
    node.h = moreTree.h;
    return node;
  };

  /* non-recursive internal search function
  * [ nodes | objects ] = searchSubtree(rectangle, [return node data], [array to fill], root to begin search at)
   * @private
   */
  var searchSubtree = function (rect, returnNode, returnArray, root) {
    var hitStack = []; // Contains the elements that overlap

    if (!rectangle.overlapRectangle(rect, root)) {
      return returnArray;
    }


    hitStack.push(root.nodes);

    while (hitStack.length > 0) {
      var nodes = hitStack.pop();

      for (var i = nodes.length - 1; i >= 0; i--) {
        var ltree = nodes[i];
        if (rectangle.overlapRectangle(rect, ltree)) {
          if ('nodes' in ltree) { // Not a Leaf
            hitStack.push(ltree.nodes);
          } else if ('leaf' in ltree) { // A Leaf !!
            if (!returnNode) {
              returnArray.push(ltree.leaf);
            } else {
              returnArray.push(ltree);
            }
          }
        }
      }
    }

    return returnArray;
  };

  /* non-recursive internal insert function
   * [] = insertSubtree(rectangle, object to insert, root to begin insertion at)
   * @private
   */
  var insertSubtree = function (node, root) {
    var bc; // Best Current node
    // Initial insertion is special because we resize the Tree and we don't
    // care about any overflow (seriously, how can the first object overflow?)
    if (root.nodes.length === 0) {
      root.x = node.x;
      root.y = node.y;
      root.w = node.w;
      root.h = node.h;
      root.nodes.push(node);
      return;
    }

    // Find the best fitting leaf node
    // chooseLeaf returns an array of all tree levels (including root)
    // that were traversed while trying to find the leaf
    var treeStack = chooseLeafSubtree(node, root);
    var retObj = node;//{x:rect.x,y:rect.y,w:rect.w,h:rect.h, leaf:obj};
    var pbc;
    // Walk back up the tree resizing and inserting as needed
    while (treeStack.length > 0) {
      //handle the case of an empty node (from a split)
      if (bc && 'nodes' in bc && bc.nodes.length === 0) {
        pbc = bc; // Past bc
        bc = treeStack.pop();
        for (var t = 0;t < bc.nodes.length;t++) {
          if (bc.nodes[t] === pbc || bc.nodes[t].nodes.length === 0) {
            bc.nodes.splice(t, 1);
            break;
          }
        }
      } else {
        bc = treeStack.pop();
      }

      // If there is data attached to this retObj
      if ('leaf' in retObj || 'nodes' in retObj || Array.isArray(retObj)) {
        // Do Insert
        if (Array.isArray(retObj)) {
          for (var ai = 0; ai < retObj.length; ai++) {
            rectangle.expandRectangle(bc, retObj[ai]);
          }
          bc.nodes = bc.nodes.concat(retObj);
        } else {
          rectangle.expandRectangle(bc, retObj);
          bc.nodes.push(retObj); // Do Insert
        }

        if (bc.nodes.length <= maxWidth)  { // Start Resizeing Up the Tree
          retObj = {x: bc.x, y: bc.y, w: bc.w, h: bc.h};
        }  else { // Otherwise Split this Node
          // linearSplit() returns an array containing two new nodes
          // formed from the split of the previous node's overflow
          var a = linearSplit(bc.nodes);
          retObj = a;//[1];

          if (treeStack.length < 1)  { // If are splitting the root..
            bc.nodes.push(a[0]);
            treeStack.push(bc);  // Reconsider the root element
            retObj = a[1];
          } /*else {
            delete bc;
          }*/
        }
      } else { // Otherwise Do Resize
        //Just keep applying the new bounding rectangle to the parents..
        rectangle.expandRectangle(bc, retObj);
        retObj = {x: bc.x, y: bc.y, w: bc.w, h: bc.h};
      }
    }
  };

  this.insertSubtree = insertSubtree;
  /* quick 'n' dirty function for plugins or manually drawing the tree
   * [ tree ] = RTree.getTree(): returns the raw tree data. useful for adding
   * @public
   * !! DEPRECATED !!
   */
  this.getTree = function () {
    return rootTree;
  };

  /* quick 'n' dirty function for plugins or manually loading the tree
   * [ tree ] = RTree.setTree(sub-tree, where to attach): returns the raw tree data. useful for adding
   * @public
   * !! DEPRECATED !!
   */
  this.setTree = function (newTree, where) {
    if (!where) {
      where = rootTree;
    }
    return attachData(where, newTree);
  };

  /* non-recursive search function
  * [ nodes | objects ] = RTree.search(rectangle, [return node data], [array to fill])
   * @public
   */
  this.search = function (rect, returnNode, returnArray) {
    returnArray = returnArray || [];
    return searchSubtree(rect, returnNode, returnArray, rootTree);
  };

  this.find = function(id) {
    return this._find(id, rootTree);
  }

  this._find = function(id, tree) {
    if( tree.leaf ) {
      if( tree.leaf.properties.id === id ) return tree;
    }

    if( !tree.nodes ) return;

    var result;
    for( var i = 0; i < tree.nodes.length; i++ ) {
      result = this._find(id, tree.nodes[i]);
      if( result ) return result; 
    }
  }


  var removeArea = function (rect) {
    var numberDeleted = 1,
    retArray = [],
    deleted;
    while (numberDeleted > 0) {
      deleted = removeSubtree(rect, false, rootTree);
      numberDeleted = deleted.length;
      retArray = retArray.concat(deleted);
    }
    return retArray;
  };

  var removeObj = function (rect, obj) {
    var retArray = removeSubtree(rect, obj, rootTree);
    return retArray;
  };
    /* non-recursive delete function
   * [deleted object] = RTree.remove(rectangle, [object to delete])
   */
  this.remove = function (rect, obj) {
    if (!obj || typeof obj === 'function') {
      return removeArea(rect, obj);
    } else {
      return removeObj(rect, obj);
    }
  };

  /* non-recursive insert function
   * [] = RTree.insert(rectangle, object to insert)
   */
  this.insert = function (rect, obj) {
    var retArray = insertSubtree({x: rect.x, y: rect.y, w: rect.w, h: rect.h, leaf: obj}, rootTree);
    return retArray;
  };
}
RTree.prototype.toJSON = function (printing) {
  return JSON.stringify(this.root, false, printing);
};

RTree.fromJSON = function (json) {
  var rt = new RTree();
  rt.setTree(JSON.parse(json));
  return rt;
};

module.exports = RTree;


/**
 * Polyfill for the Array.isArray function
 * todo: Test on IE7 and IE8
 * Taken from https://github.com/geraintluff/tv4/issues/20
 */
if (typeof Array.isArray !== 'function') {
  Array.isArray = function (a) {
    return typeof a === 'object' && {}.toString.call(a) === '[object Array]';
  };
}

},{"./rectangle":3}],5:[function(require,module,exports){
'use strict';

function CanvasFeature(geojson, id) {

    // radius for point features
    // use to calculate mouse over/out and click events for points
    // this value should match the value used for rendering points
    this.size = 5;
    this.isPoint = false;

    // User space object for store variables used for rendering geometry
    this.render = {};

    var cache = {
        // projected points on canvas
        canvasXY: null,
        // zoom level canvasXY points are calculated to
        zoom: -1
    };

    // performance flag, will keep invisible features for recalc 
    // events as well as not being rendered
    this.visible = true;

    // bounding box for geometry, used for intersection and
    // visiblility optimizations
    this.bounds = null;

    // Leaflet LatLng, used for points to quickly look for intersection
    this.latlng = null;

    // clear the canvasXY stored values
    this.clearCache = function () {
        delete cache.canvasXY;
        cache.zoom = -1;
    };

    this.setCanvasXY = function (canvasXY, zoom, layer) {
        cache.canvasXY = canvasXY;
        cache.zoom = zoom;

        if (this.isPoint) this.updatePointInRTree(layer);
    };

    this.getCanvasXY = function () {
        return cache.canvasXY;
    };

    this.requiresReprojection = function (zoom) {
        if (cache.zoom == zoom && cache.canvasXY) {
            return false;
        }
        return true;
    };

    this.updatePointInRTree = function (layer) {
        var coords = this.geojson.geometry.coordinates;
        var dpp = layer.getDegreesPerPx([coords[1], coords[0]]);

        if (this._rtreeGeojson) {
            var rTreeCoords = this._rtreeGeojson.geometry.coordinates;
            var result = layer.rTree.remove({
                x: rTreeCoords[0][0][0] - 1,
                y: rTreeCoords[0][1][1] - 1,
                w: Math.abs(rTreeCoords[0][0][0] - rTreeCoords[0][1][0]) + 2,
                h: Math.abs(rTreeCoords[0][1][1] - rTreeCoords[0][2][1]) + 2
            }, this._rtreeGeojson);
            if (result.length === 0) {
                console.warn('Unable to find: ' + this._rtreeGeojson.geometry.properties.id + ' in rTree');
            }
            // console.log(result);
        }

        var offset = dpp * (this.size / 2);

        var left = coords[0] - offset;
        var top = coords[1] + offset;
        var right = coords[0] + offset;
        var bottom = coords[1] - offset;

        this._rtreeGeojson = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [[[left, top], [right, top], [right, bottom], [left, bottom], [left, top]]]
            },
            properties: {
                id: this.id
            }
        };

        layer.rTree.geoJSON(this._rtreeGeojson);
    };

    // optional, per feature, renderer
    this.renderer = null;

    // geojson was options object
    if (geojson.geojson) {
        this.renderer = geojson.renderer;
        if (geojson.size) this.size = geojson.size;
        geojson = geojson.geojson;
    }

    if (geojson.geometry) {
        this.geojson = geojson;
        this.id = id || geojson.properties.id;
    } else {
        this.geojson = {
            type: 'Feature',
            geometry: geojson,
            properties: {
                id: id
            }
        };
        this.id = id;
    }

    // points have to be reprojected w/ buffer after zoom
    if (this.geojson.geometry.type === 'Point') {
        this.isPoint = true;
    } else {
        this._rtreeGeojson = {
            type: 'Feature',
            geometry: this.geojson.geometry,
            properties: {
                id: id || this.geojson.properties.id
            }
        };
    }

    this.type = this.geojson.geometry.type;
}

module.exports = CanvasFeature;

},{}],6:[function(require,module,exports){
'use strict';

var CanvasFeature = require('./CanvasFeature');

function CanvasFeatures(geojson) {
    // quick type flag
    this.isCanvasFeatures = true;

    this.canvasFeatures = [];

    // actual geojson object, will not be modifed, just stored
    this.geojson = geojson;

    // performance flag, will keep invisible features for recalc 
    // events as well as not being rendered
    this.visible = true;

    this.clearCache = function () {
        for (var i = 0; i < this.canvasFeatures.length; i++) {
            this.canvasFeatures[i].clearCache();
        }
    };

    if (this.geojson) {
        for (var i = 0; i < this.geojson.features.length; i++) {
            this.canvasFeatures.push(new CanvasFeature(this.geojson.features[i]));
        }
    }
}

module.exports = CanvasFeatures;

},{"./CanvasFeature":5}],7:[function(require,module,exports){
'use strict';

var CanvasFeature = require('./CanvasFeature');
var CanvasFeatures = require('./CanvasFeatures');

function factory(arg) {
    if (Array.isArray(arg)) {
        return arg.map(generate);
    }

    return generate(arg);
}

function generate(geojson) {
    if (geojson.type === 'FeatureCollection') {
        return new CanvasFeatures(geojson);
    } else if (geojson.type === 'Feature') {
        return new CanvasFeature(geojson);
    }
    throw new Error('Unsupported GeoJSON: ' + geojson.type);
}

module.exports = factory;

},{"./CanvasFeature":5,"./CanvasFeatures":6}],8:[function(require,module,exports){
'use strict';

var ctx;

/**
 * Fuction called in scope of CanvasFeature
 */
function render(context, xyPoints, map, canvasFeature) {
    ctx = context;

    if (canvasFeature.type === 'Point') {
        renderPoint(xyPoints, this.size);
    } else if (canvasFeature.type === 'LineString') {
        renderLine(xyPoints);
    } else if (canvasFeature.type === 'Polygon') {
        renderPolygon(xyPoints);
    } else if (canvasFeature.type === 'MultiPolygon') {
        xyPoints.forEach(renderPolygon);
    }
}

function renderPoint(xyPoint, size) {
    ctx.beginPath();

    ctx.arc(xyPoint.x, xyPoint.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(0, 0, 0, .3)';
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
    for (j = 1; j < xyPoints.length; j++) {
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
    for (j = 1; j < xyPoints.length; j++) {
        ctx.lineTo(xyPoints[j].x, xyPoints[j].y);
    }
    ctx.lineTo(xyPoints[0].x, xyPoints[0].y);

    ctx.stroke();
    ctx.fill();
}

module.exports = render;

},{}],9:[function(require,module,exports){
'use strict';

var CanvasFeature = require('./classes/CanvasFeature');
var CanvasFeatures = require('./classes/CanvasFeatures');

function CanvasLayer() {
  // show layer timing
  this.debug = false;

  // include events
  this.includes = [L.Mixin.Events];

  // geometry helpers
  this.utils = require('./lib/utils');

  // recommended you override this.  you can also set a custom renderer
  // for each CanvasFeature if you wish
  this.renderer = require('./defaultRenderer');

  this.getCanvas = function () {
    return this._canvas;
  };

  this.draw = function () {
    this.reset();
  };

  this.addTo = function (map) {
    map.addLayer(this);
    return this;
  };

  this.reset = function () {
    // reset actual canvas size
    var size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
  };

  // clear canvas
  this.clearCanvas = function () {
    var canvas = this.getCanvas();
    var ctx = this._ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // make sure this is called after...
    this.reposition();
  };

  this.reposition = function () {
    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
    this._canvas.style.top = topLeft.y + 'px';
    this._canvas.style.left = topLeft.x + 'px';
    //L.DomUtil.setPosition(this._canvas, topLeft);
  };

  // clear each features cache
  this.clearCache = function () {
    // kill the feature point cache
    for (var i = 0; i < this.features.length; i++) {
      this.features[i].clearCache();
    }
  };

  // get layer feature via geojson object
  this.getCanvasFeatureById = function (id) {
    return this.featureIndex[id];
  };

  // get the meters per px and a certain point;
  this.getMetersPerPx = function (latlng) {
    return this.utils.metersPerPx(latlng, this._map);
  };

  this.getDegreesPerPx = function (latlng) {
    return this.utils.degreesPerPx(latlng, this._map);
  };
};

var layer = new CanvasLayer();

require('./lib/init')(layer);
require('./lib/redraw')(layer);
require('./lib/addFeature')(layer);
require('./lib/toCanvasXY')(layer);

L.CanvasFeatureFactory = require('./classes/factory');
L.CanvasFeature = CanvasFeature;
L.CanvasFeatureCollection = CanvasFeatures;
L.CanvasGeojsonLayer = L.Class.extend(layer);

},{"./classes/CanvasFeature":5,"./classes/CanvasFeatures":6,"./classes/factory":7,"./defaultRenderer":8,"./lib/addFeature":10,"./lib/init":11,"./lib/redraw":13,"./lib/toCanvasXY":14,"./lib/utils":15}],10:[function(require,module,exports){
'use strict';

var CanvasFeature = require('../classes/CanvasFeature');
var CanvasFeatures = require('../classes/CanvasFeatures');

module.exports = function (layer) {
  layer.addCanvasFeatures = function (features) {
    for (var i = 0; i < features.length; i++) {
      this.addCanvasFeature(features[i], false, null, false);
    }

    this.rebuildIndex(this.features);
  };

  layer.addCanvasFeature = function (feature, bottom, callback) {
    if (!(feature instanceof CanvasFeature) && !(feature instanceof CanvasFeatures)) {
      throw new Error('Feature must be instance of CanvasFeature or CanvasFeatures');
    }

    if (bottom) {
      // bottom or index
      if (typeof bottom === 'number') this.features.splice(bottom, 0, feature);else this.features.unshift(feature);
    } else {
      this.features.push(feature);
    }

    this.featureIndex[feature.id] = feature;

    this.addToIndex(feature);

    for (var i = 0; i < this.features.length; i++) {
      this.features[i].order = i;
    }
  },

  // returns true if re-render required.  ie the feature was visible;
  layer.removeCanvasFeature = function (feature) {
    var index = this.features.indexOf(feature);
    if (index == -1) return;

    this.splice(index, 1);

    this.rebuildIndex(this.features);

    if (this.feature.visible) return true;
    return false;
  };

  layer.removeAll = function () {
    this.allowPanRendering = true;
    this.features = [];
    this.rebuildIndex(this.features);
  };
};

},{"../classes/CanvasFeature":5,"../classes/CanvasFeatures":6}],11:[function(require,module,exports){
'use strict';

var intersectUtils = require('./intersects');
var RTree = require('rtree');
var count = 0;

module.exports = function (layer) {

    layer.initialize = function (options) {
        this.showing = true;

        // list of geojson features to draw
        //   - these will draw in order
        this.features = [];
        // lookup index
        this.featureIndex = {};

        // list of current features under the mouse
        this.intersectList = [];

        // used to calculate pixels moved from center
        this.lastCenterLL = null;

        this.moving = false;
        this.zooming = false;
        // TODO: make this work
        this.allowPanRendering = false;

        // set options
        options = options || {};
        L.Util.setOptions(this, options);

        // move mouse event handlers to layer scope
        var mouseEvents = ['onMouseOver', 'onMouseMove', 'onMouseOut', 'onClick'];
        mouseEvents.forEach(function (e) {
            if (!this.options[e]) return;
            this[e] = this.options[e];
            delete this.options[e];
        }.bind(this));

        this.rTree = new RTree();

        // set canvas and canvas context shortcuts
        this._canvas = createCanvas(options);
        this._ctx = this._canvas.getContext('2d');
    };

    intersectUtils(layer);

    layer.onAdd = function (map) {
        this._map = map;

        // add container with the canvas to the tile pane
        // the container is moved in the oposite direction of the
        // map pane to keep the canvas always in (0, 0)
        //var tilePane = this._map._panes.tilePane;
        var tilePane = this._map._panes.markerPane;
        var _container = L.DomUtil.create('div', 'leaflet-layer-' + count);
        count++;

        _container.appendChild(this._canvas);
        tilePane.appendChild(_container);

        this._container = _container;

        // hack: listen to predrag event launched by dragging to
        // set container in position (0, 0) in screen coordinates
        // if (map.dragging.enabled()) {
        //     map.dragging._draggable.on('predrag', function() {
        //         var d = map.dragging._draggable;
        //         L.DomUtil.setPosition(this._canvas, { x: -d._newPos.x, y: -d._newPos.y });
        //     }, this);
        // }

        map.on({
            'viewreset': this.onResize,
            'resize': this.onResize,
            'zoomstart': startZoom,
            'zoomend': endZoom,
            //    'movestart' : moveStart,
            'moveend': moveEnd,
            'mousemove': this.intersects,
            'click': this.intersects
        }, this);

        this.reset();
        this.clearCanvas();

        if (this.zIndex !== undefined) {
            this.setZIndex(this.zIndex);
        }
    };

    layer.onRemove = function (map) {
        this._container.parentNode.removeChild(this._container);
        map.off({
            'viewreset': this.onResize,
            'resize': this.onResize,
            //   'movestart' : moveStart,
            'moveend': moveEnd,
            'zoomstart': startZoom,
            'zoomend': endZoom,
            'mousemove': this.intersects,
            'click': this.intersects
        }, this);
    };

    var resizeTimer = -1;
    layer.onResize = function () {
        if (resizeTimer !== -1) clearTimeout(resizeTimer);

        resizeTimer = setTimeout(function () {
            resizeTimer = -1;
            this.reset();
            this.clearCache();
            this.render();
        }.bind(this), 100);
    };
};

function createCanvas(options) {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = options.zIndex || 0;
    var className = 'leaflet-tile-container leaflet-zoom-animated';
    canvas.setAttribute('class', className);
    return canvas;
}

function startZoom() {
    this._canvas.style.visibility = 'hidden';
    this.zooming = true;
}

function endZoom() {
    this._canvas.style.visibility = 'visible';
    this.zooming = false;
    this.clearCache();
    setTimeout(this.render.bind(this), 50);
}

function moveStart() {
    if (this.moving) return;
    this.moving = true;

    //if( !this.allowPanRendering ) return;
    return;
    // window.requestAnimationFrame(frameRender.bind(this));
}

function moveEnd(e) {
    this.moving = false;
    this.render(e);
};

function frameRender() {
    if (!this.moving) return;

    var t = new Date().getTime();
    this.render();

    if (new Date().getTime() - t > 75) {
        if (this.debug) {
            console.log('Disabled rendering while paning');
        }

        this.allowPanRendering = false;
        return;
    }

    setTimeout(function () {
        if (!this.moving) return;
        window.requestAnimationFrame(frameRender.bind(this));
    }.bind(this), 750);
}

},{"./intersects":12,"rtree":2}],12:[function(require,module,exports){
'use strict';

var RTree = require('rtree');

/** 
 * Handle mouse intersection events
 * e - leaflet event
 **/
function intersects(e) {
  if (!this.showing) return;

  var dpp = this.getDegreesPerPx(e.latlng);

  var mpp = this.getMetersPerPx(e.latlng);
  var r = mpp * 5; // 5 px radius buffer;

  var center = {
    type: 'Point',
    coordinates: [e.latlng.lng, e.latlng.lat]
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

  for (i = 0; i < features.length; i++) {
    clFeature = this.getCanvasFeatureById(features[i].properties.id);
    if (!clFeature.visible) continue;
    clFeatures.push(clFeature);
  }

  // now make sure this actually overlap if precision is given
  if (precision) {
    for (var i = clFeatures.length - 1; i >= 0; i--) {
      f = clFeatures[i];
      if (!this.utils.geometryWithinRadius(f._rtreeGeojson.geometry, f.getCanvasXY(), center, containerPoint, precision)) {
        clFeatures.splice(i, 1);
      }
    }
  }

  return clFeatures;
}

function onIntersectsListCreated(e, intersects) {
  if (e.type == 'click' && this.onClick) {
    this.onClick(intersects);
    return;
  }

  var mouseover = [],
      mouseout = [],
      mousemove = [];

  var changed = false;
  for (var i = 0; i < intersects.length; i++) {
    if (this.intersectList.indexOf(intersects[i]) > -1) {
      mousemove.push(intersects[i]);
    } else {
      changed = true;
      mouseover.push(intersects[i]);
    }
  }

  for (var i = 0; i < this.intersectList.length; i++) {
    if (intersects.indexOf(this.intersectList[i]) == -1) {
      changed = true;
      mouseout.push(this.intersectList[i]);
    }
  }

  this.intersectList = intersects;

  if (this.onMouseOver && mouseover.length > 0) this.onMouseOver.call(this, mouseover, e);
  if (this.onMouseMove) this.onMouseMove.call(this, mousemove, e); // always fire
  if (this.onMouseOut && mouseout.length > 0) this.onMouseOut.call(this, mouseout, e);
}

function rebuild(clFeatures) {
  var features = [];

  for (var i = 0; i < clFeatures.length; i++) {
    features.push(clFeatures[i]._rtreeGeojson);
    clFeatures[i].order = i;
  }

  this.rTree = new RTree();
  this.rTree.geoJSON({
    type: 'FeatureCollection',
    features: features
  });
}

function add(clFeature) {
  if (clFeature.isPoint) {
    clFeature.updatePointInRTree(this);
  } else {
    this.rTree.geoJSON(clFeature._rtreeGeojson);
  }
}

// TODO: need to prototype these functions
module.exports = function (layer) {
  layer.intersects = intersects;
  layer.intersectsBbox = intersectsBbox;
  layer.rebuildIndex = rebuild;
  layer.addToIndex = add;
};

},{"rtree":2}],13:[function(require,module,exports){
'use strict';

var running = false;
var reschedule = null;

module.exports = function (layer) {
  layer.render = function (e) {
    if (!this.allowPanRendering && this.moving) {
      return;
    }

    var t, diff;
    if (this.debug) {
      t = new Date().getTime();
    }

    var diff = null;
    var center = this._map.getCenter();

    if (e && e.type == 'moveend') {
      var pt = this._map.latLngToContainerPoint(center);

      if (this.lastCenterLL) {
        var lastXy = this._map.latLngToContainerPoint(this.lastCenterLL);
        diff = {
          x: lastXy.x - pt.x,
          y: lastXy.y - pt.y
        };
      }
    }

    this.lastCenterLL = center;

    if (!this.zooming) {
      this.redraw(diff);
    } else {
      this.clearCanvas();
    }
  },

  // redraw all features.  This does not handle clearing the canvas or setting
  // the canvas correct position.  That is handled by render
  layer.redraw = function (diff) {
    if (!this.showing) return;

    // if( running ) {
    //   reschedule = true;
    //   return;
    // }
    // running = true;

    // objects should keep track of last bbox and zoom of map
    // if this hasn't changed the ll -> container pt is not needed
    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    var f, i, subfeature, j;
    for (i = 0; i < this.features.length; i++) {
      f = this.features[i];

      if (f.isCanvasFeatures) {

        for (j = 0; j < f.canvasFeatures.length; j++) {
          this.prepareForRedraw(f.canvasFeatures[j], bounds, zoom, diff);
        }
      } else {
        this.prepareForRedraw(f, bounds, zoom, diff);
      }
    }

    var features = this.intersectsBbox([[bounds.getWest(), bounds.getSouth()], [bounds.getEast(), bounds.getNorth()]], null, null, null);
    this.redrawFeatures(features);
  }, layer.redrawFeatures = function (features) {
    this.clearCanvas();

    features.sort(function (a, b) {
      if (a.order > b.order) return 1;
      if (a.order < b.order) return -1;
      return 0;
    });

    for (var i = 0; i < features.length; i++) {
      if (!features[i].visible) continue;
      this.redrawFeature(features[i]);
    }
  };

  layer.redrawFeature = function (canvasFeature) {
    var renderer = canvasFeature.renderer ? canvasFeature.renderer : this.renderer;
    var xy = canvasFeature.getCanvasXY();

    // badness...
    if (!xy) return;

    // call feature render function in feature scope; feature is passed as well
    renderer.call(canvasFeature, // scope (canvas feature)
    this._ctx, // canvas 2d context
    xy, // xy points to draw
    this._map, // leaflet map instance
    canvasFeature // canvas feature
    );
  };

  // redraw an individual feature
  layer.prepareForRedraw = function (canvasFeature, bounds, zoom, diff) {
    //if( feature.geojson.properties.debug ) debugger;

    // ignore anything flagged as hidden
    // we do need to clear the cache in this case
    if (!canvasFeature.visible) {
      canvasFeature.clearCache();
      return;
    }

    var geojson = canvasFeature.geojson.geometry;

    // now lets check cache to see if we need to reproject the
    // xy coordinates
    // actually project to xy if needed
    var reproject = canvasFeature.requiresReprojection(zoom);
    if (reproject) {
      this.toCanvasXY(canvasFeature, geojson, zoom);
    } // end reproject

    // if this was a simple pan event (a diff was provided) and we did not reproject
    // move the feature by diff x/y
    if (diff && !reproject) {
      if (geojson.type == 'Point') {

        var xy = canvasFeature.getCanvasXY();
        xy.x += diff.x;
        xy.y += diff.y;
      } else if (geojson.type == 'LineString') {

        this.utils.moveLine(canvasFeature.getCanvasXY(), diff);
      } else if (geojson.type == 'Polygon') {

        this.utils.moveLine(canvasFeature.getCanvasXY(), diff);
      } else if (geojson.type == 'MultiPolygon') {
        var xy = canvasFeature.getCanvasXY();
        for (var i = 0; i < xy.length; i++) {
          this.utils.moveLine(xy[i], diff);
        }
      }
    }
  };
};

},{}],14:[function(require,module,exports){
'use strict';

module.exports = function (layer) {
    layer.toCanvasXY = function (feature, geojson, zoom) {
        // make sure we have a cache namespace and set the zoom level
        if (!feature.cache) feature.cache = {};
        var canvasXY;

        if (geojson.type == 'Point') {

            canvasXY = this._map.latLngToContainerPoint([geojson.coordinates[1], geojson.coordinates[0]]);

            if (feature.size) {
                canvasXY[0] = canvasXY[0] - feature.size / 2;
                canvasXY[1] = canvasXY[1] - feature.size / 2;
            }
        } else if (geojson.type == 'LineString') {

            canvasXY = this.utils.projectLine(geojson.coordinates, this._map);
            trimCanvasXY(canvasXY);
        } else if (geojson.type == 'Polygon') {

            canvasXY = this.utils.projectLine(geojson.coordinates[0], this._map);
            trimCanvasXY(canvasXY);
        } else if (geojson.type == 'MultiPolygon') {
            canvasXY = [];

            for (var i = 0; i < geojson.coordinates.length; i++) {
                var xy = this.utils.projectLine(geojson.coordinates[i][0], this._map);
                trimCanvasXY(xy);
                canvasXY.push(xy);
            }
        }

        feature.setCanvasXY(canvasXY, zoom, this);
    };
};

// given an array of geo xy coordinates, make sure each point is at least more than 1px apart
function trimCanvasXY(xy) {
    if (xy.length === 0) return;
    var last = xy[xy.length - 1],
        i,
        point;

    var c = 0;
    for (i = xy.length - 2; i >= 0; i--) {
        point = xy[i];
        if (Math.abs(last.x - point.x) === 0 && Math.abs(last.y - point.y) === 0) {
            xy.splice(i, 1);
            c++;
        } else {
            last = point;
        }
    }

    if (xy.length <= 1) {
        xy.push(last);
        c--;
    }
};

},{}],15:[function(require,module,exports){
'use strict';

module.exports = {
  moveLine: function moveLine(coords, diff) {
    var i,
        len = coords.length;
    for (i = 0; i < len; i++) {
      coords[i].x += diff.x;
      coords[i].y += diff.y;
    }
  },

  projectLine: function projectLine(coords, map) {
    var xyLine = [];

    for (var i = 0; i < coords.length; i++) {
      xyLine.push(map.latLngToContainerPoint([coords[i][1], coords[i][0]]));
    }

    return xyLine;
  },

  calcBounds: function calcBounds(coords) {
    var xmin = coords[0][1];
    var xmax = coords[0][1];
    var ymin = coords[0][0];
    var ymax = coords[0][0];

    for (var i = 1; i < coords.length; i++) {
      if (xmin > coords[i][1]) xmin = coords[i][1];
      if (xmax < coords[i][1]) xmax = coords[i][1];

      if (ymin > coords[i][0]) ymin = coords[i][0];
      if (ymax < coords[i][0]) ymax = coords[i][0];
    }

    var southWest = L.latLng(xmin - .01, ymin - .01);
    var northEast = L.latLng(xmax + .01, ymax + .01);

    return L.latLngBounds(southWest, northEast);
  },

  geometryWithinRadius: function geometryWithinRadius(geometry, xyPoints, center, xyPoint, radius) {
    if (geometry.type == 'Point') {
      return this.pointDistance(geometry, center) <= radius;
    } else if (geometry.type == 'LineString') {

      for (var i = 1; i < xyPoints.length; i++) {
        if (this.lineIntersectsCircle(xyPoints[i - 1], xyPoints[i], xyPoint, 3)) {
          return true;
        }
      }

      return false;
    } else if (geometry.type == 'Polygon' || geometry.type == 'MultiPolygon') {
      return this.pointInPolygon(center, geometry);
    }
  },

  // http://math.stackexchange.com/questions/275529/check-if-line-intersects-with-circles-perimeter
  // https://en.wikipedia.org/wiki/Distance_from_a_point_to_a_line
  // [lng x, lat, y]
  lineIntersectsCircle: function lineIntersectsCircle(lineP1, lineP2, point, radius) {
    var distance = Math.abs((lineP2.y - lineP1.y) * point.x - (lineP2.x - lineP1.x) * point.y + lineP2.x * lineP1.y - lineP2.y * lineP1.x) / Math.sqrt(Math.pow(lineP2.y - lineP1.y, 2) + Math.pow(lineP2.x - lineP1.x, 2));
    return distance <= radius;
  },

  // http://wiki.openstreetmap.org/wiki/Zoom_levels
  // http://stackoverflow.com/questions/27545098/leaflet-calculating-meters-per-pixel-at-zoom-level
  metersPerPx: function metersPerPx(ll, map) {
    var pointC = map.latLngToContainerPoint(ll); // convert to containerpoint (pixels)
    var pointX = [pointC.x + 1, pointC.y]; // add one pixel to x

    // convert containerpoints to latlng's
    var latLngC = map.containerPointToLatLng(pointC);
    var latLngX = map.containerPointToLatLng(pointX);

    var distanceX = latLngC.distanceTo(latLngX); // calculate distance between c and x (latitude)
    return distanceX;
  },

  degreesPerPx: function degreesPerPx(ll, map) {
    var pointC = map.latLngToContainerPoint(ll); // convert to containerpoint (pixels)
    var pointX = [pointC.x + 1, pointC.y]; // add one pixel to x

    // convert containerpoints to latlng's
    var latLngC = map.containerPointToLatLng(pointC);
    var latLngX = map.containerPointToLatLng(pointX);

    return Math.abs(latLngC.lng - latLngX.lng); // calculate distance between c and x (latitude)
  },

  // from http://www.movable-type.co.uk/scripts/latlong.html
  pointDistance: function pointDistance(pt1, pt2) {
    var lon1 = pt1.coordinates[0],
        lat1 = pt1.coordinates[1],
        lon2 = pt2.coordinates[0],
        lat2 = pt2.coordinates[1],
        dLat = this.numberToRadius(lat2 - lat1),
        dLon = this.numberToRadius(lon2 - lon1),
        a = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(this.numberToRadius(lat1)) * Math.cos(this.numberToRadius(lat2)) * Math.pow(Math.sin(dLon / 2), 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return 6371 * c * 1000; // returns meters
  },

  pointInPolygon: function pointInPolygon(p, poly) {
    var coords = poly.type == "Polygon" ? [poly.coordinates] : poly.coordinates;

    var insideBox = false;
    for (var i = 0; i < coords.length; i++) {
      if (this.pointInBoundingBox(p, this.boundingBoxAroundPolyCoords(coords[i]))) insideBox = true;
    }
    if (!insideBox) return false;

    var insidePoly = false;
    for (var i = 0; i < coords.length; i++) {
      if (this.pnpoly(p.coordinates[1], p.coordinates[0], coords[i])) insidePoly = true;
    }

    return insidePoly;
  },

  pointInBoundingBox: function pointInBoundingBox(point, bounds) {
    return !(point.coordinates[1] < bounds[0][0] || point.coordinates[1] > bounds[1][0] || point.coordinates[0] < bounds[0][1] || point.coordinates[0] > bounds[1][1]);
  },

  boundingBoxAroundPolyCoords: function boundingBoxAroundPolyCoords(coords) {
    var xAll = [],
        yAll = [];

    for (var i = 0; i < coords[0].length; i++) {
      xAll.push(coords[0][i][1]);
      yAll.push(coords[0][i][0]);
    }

    xAll = xAll.sort(function (a, b) {
      return a - b;
    });
    yAll = yAll.sort(function (a, b) {
      return a - b;
    });

    return [[xAll[0], yAll[0]], [xAll[xAll.length - 1], yAll[yAll.length - 1]]];
  },

  // Point in Polygon
  // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#Listing the Vertices
  pnpoly: function pnpoly(x, y, coords) {
    var vert = [[0, 0]];

    for (var i = 0; i < coords.length; i++) {
      for (var j = 0; j < coords[i].length; j++) {
        vert.push(coords[i][j]);
      }
      vert.push(coords[i][0]);
      vert.push([0, 0]);
    }

    var inside = false;
    for (var i = 0, j = vert.length - 1; i < vert.length; j = i++) {
      if (vert[i][0] > y != vert[j][0] > y && x < (vert[j][1] - vert[i][1]) * (y - vert[i][0]) / (vert[j][0] - vert[i][0]) + vert[i][1]) inside = !inside;
    }

    return inside;
  },

  numberToRadius: function numberToRadius(number) {
    return number * Math.PI / 180;
  }
};

},{}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvZ2VvanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRyZWUvbGliL3JlY3RhbmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvcnRyZWUuanMiLCJzcmMvY2xhc3Nlcy9DYW52YXNGZWF0dXJlLmpzIiwic3JjL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMuanMiLCJzcmMvY2xhc3Nlcy9mYWN0b3J5LmpzIiwic3JjL2RlZmF1bHRSZW5kZXJlci9pbmRleC5qcyIsInNyYy9sYXllci5qcyIsInNyYy9saWIvYWRkRmVhdHVyZS5qcyIsInNyYy9saWIvaW5pdC5qcyIsInNyYy9saWIvaW50ZXJzZWN0cy5qcyIsInNyYy9saWIvcmVkcmF3LmpzIiwic3JjL2xpYi90b0NhbnZhc1hZLmpzIiwic3JjL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QXJLYzs7QUF1S2Ysa0JBQWlCLHdCQUFVLE1BQVYsRUFBa0I7QUFDakMsV0FBTyxTQUFTLEtBQUssRUFBZCxHQUFtQixHQUExQjtBQUNEO0FBektjLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciByZWN0YW5nbGUgPSByZXF1aXJlKCcuL3JlY3RhbmdsZScpO1xudmFyIGJib3ggPSBmdW5jdGlvbiAoYXIsIG9iaikge1xuICBpZiAob2JqICYmIG9iai5iYm94KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlYWY6IG9iaixcbiAgICAgIHg6IG9iai5iYm94WzBdLFxuICAgICAgeTogb2JqLmJib3hbMV0sXG4gICAgICB3OiBvYmouYmJveFsyXSAtIG9iai5iYm94WzBdLFxuICAgICAgaDogb2JqLmJib3hbM10gLSBvYmouYmJveFsxXVxuICAgIH07XG4gIH1cbiAgdmFyIGxlbiA9IGFyLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICB2YXIgYSA9IG5ldyBBcnJheShsZW4pO1xuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIGFbaV0gPSBbYXJbaV1bMF0sIGFyW2ldWzFdXTtcbiAgICBpKys7XG4gIH1cbiAgdmFyIGZpcnN0ID0gYVswXTtcbiAgbGVuID0gYS5sZW5ndGg7XG4gIGkgPSAxO1xuICB2YXIgdGVtcCA9IHtcbiAgICBtaW46IFtdLmNvbmNhdChmaXJzdCksXG4gICAgbWF4OiBbXS5jb25jYXQoZmlyc3QpXG4gIH07XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgaWYgKGFbaV1bMF0gPCB0ZW1wLm1pblswXSkge1xuICAgICAgdGVtcC5taW5bMF0gPSBhW2ldWzBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChhW2ldWzBdID4gdGVtcC5tYXhbMF0pIHtcbiAgICAgIHRlbXAubWF4WzBdID0gYVtpXVswXTtcbiAgICB9XG4gICAgaWYgKGFbaV1bMV0gPCB0ZW1wLm1pblsxXSkge1xuICAgICAgdGVtcC5taW5bMV0gPSBhW2ldWzFdO1xuICAgIH1cbiAgICBlbHNlIGlmIChhW2ldWzFdID4gdGVtcC5tYXhbMV0pIHtcbiAgICAgIHRlbXAubWF4WzFdID0gYVtpXVsxXTtcbiAgICB9XG4gICAgaSsrO1xuICB9XG4gIHZhciBvdXQgPSB7XG4gICAgeDogdGVtcC5taW5bMF0sXG4gICAgeTogdGVtcC5taW5bMV0sXG4gICAgdzogKHRlbXAubWF4WzBdIC0gdGVtcC5taW5bMF0pLFxuICAgIGg6ICh0ZW1wLm1heFsxXSAtIHRlbXAubWluWzFdKVxuICB9O1xuICBpZiAob2JqKSB7XG4gICAgb3V0LmxlYWYgPSBvYmo7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn07XG52YXIgZ2VvSlNPTiA9IHt9O1xuZ2VvSlNPTi5wb2ludCA9IGZ1bmN0aW9uIChvYmosIHNlbGYpIHtcbiAgcmV0dXJuIChzZWxmLmluc2VydFN1YnRyZWUoe1xuICAgIHg6IG9iai5nZW9tZXRyeS5jb29yZGluYXRlc1swXSxcbiAgICB5OiBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sXG4gICAgdzogMCxcbiAgICBoOiAwLFxuICAgIGxlYWY6IG9ialxuICB9LCBzZWxmLnJvb3QpKTtcbn07XG5nZW9KU09OLm11bHRpUG9pbnRMaW5lU3RyaW5nID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZShiYm94KG9iai5nZW9tZXRyeS5jb29yZGluYXRlcywgb2JqKSwgc2VsZi5yb290KSk7XG59O1xuZ2VvSlNPTi5tdWx0aUxpbmVTdHJpbmdQb2x5Z29uID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZShiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIG9iai5nZW9tZXRyeS5jb29yZGluYXRlcyksIG9iaiksIHNlbGYucm9vdCkpO1xufTtcbmdlb0pTT04ubXVsdGlQb2x5Z29uID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZShiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIG9iai5nZW9tZXRyeS5jb29yZGluYXRlcykpLCBvYmopLCBzZWxmLnJvb3QpKTtcbn07XG5nZW9KU09OLm1ha2VSZWMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiByZWN0YW5nbGUob2JqLngsIG9iai55LCBvYmoudywgb2JqLmgpO1xufTtcbmdlb0pTT04uZ2VvbWV0cnlDb2xsZWN0aW9uID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICBpZiAob2JqLmJib3gpIHtcbiAgICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZSh7XG4gICAgICBsZWFmOiBvYmosXG4gICAgICB4OiBvYmouYmJveFswXSxcbiAgICAgIHk6IG9iai5iYm94WzFdLFxuICAgICAgdzogb2JqLmJib3hbMl0gLSBvYmouYmJveFswXSxcbiAgICAgIGg6IG9iai5iYm94WzNdIC0gb2JqLmJib3hbMV1cbiAgICB9LCBzZWxmLnJvb3QpKTtcbiAgfVxuICB2YXIgZ2VvcyA9IG9iai5nZW9tZXRyeS5nZW9tZXRyaWVzO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsZW4gPSBnZW9zLmxlbmd0aDtcbiAgdmFyIHRlbXAgPSBbXTtcbiAgdmFyIGc7XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgZyA9IGdlb3NbaV07XG4gICAgc3dpdGNoIChnLnR5cGUpIHtcbiAgICBjYXNlICdQb2ludCc6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKHtcbiAgICAgICAgeDogZy5jb29yZGluYXRlc1swXSxcbiAgICAgICAgeTogZy5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgdzogMCxcbiAgICAgICAgaDogMFxuICAgICAgfSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2ludCc6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKGJib3goZy5jb29yZGluYXRlcykpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xpbmVTdHJpbmcnOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyhiYm94KGcuY29vcmRpbmF0ZXMpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNdWx0aUxpbmVTdHJpbmcnOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyhiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIGcuY29vcmRpbmF0ZXMpKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUG9seWdvbic6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKGJib3goQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgZy5jb29yZGluYXRlcykpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNdWx0aVBvbHlnb24nOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyhiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIGcuY29vcmRpbmF0ZXMpKSkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dlb21ldHJ5Q29sbGVjdGlvbic6XG4gICAgICBnZW9zID0gZ2Vvcy5jb25jYXQoZy5nZW9tZXRyaWVzKTtcbiAgICAgIGxlbiA9IGdlb3MubGVuZ3RoO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGkrKztcbiAgfVxuICB2YXIgZmlyc3QgPSB0ZW1wWzBdO1xuICBpID0gMTtcbiAgbGVuID0gdGVtcC5sZW5ndGg7XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgZmlyc3QuZXhwYW5kKHRlbXBbaV0pO1xuICAgIGkrKztcbiAgfVxuICByZXR1cm4gc2VsZi5pbnNlcnRTdWJ0cmVlKHtcbiAgICBsZWFmOiBvYmosXG4gICAgeDogZmlyc3QueCgpLFxuICAgIHk6IGZpcnN0LnkoKSxcbiAgICBoOiBmaXJzdC5oKCksXG4gICAgdzogZmlyc3QudygpXG4gIH0sIHNlbGYucm9vdCk7XG59O1xuZXhwb3J0cy5nZW9KU09OID0gZnVuY3Rpb24gKHByZWxpbSkge1xuICB2YXIgdGhhdCA9IHRoaXM7XG4gIHZhciBmZWF0dXJlcywgZmVhdHVyZTtcbiAgaWYgKEFycmF5LmlzQXJyYXkocHJlbGltKSkge1xuICAgIGZlYXR1cmVzID0gcHJlbGltLnNsaWNlKCk7XG4gIH1cbiAgZWxzZSBpZiAocHJlbGltLmZlYXR1cmVzICYmIEFycmF5LmlzQXJyYXkocHJlbGltLmZlYXR1cmVzKSkge1xuICAgIGZlYXR1cmVzID0gcHJlbGltLmZlYXR1cmVzLnNsaWNlKCk7XG4gIH1cbiAgZWxzZSBpZiAocHJlbGltIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgZmVhdHVyZXMgPSBbcHJlbGltXTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyAoJ3RoaXMgaXNuXFwndCB3aGF0IHdlXFwncmUgbG9va2luZyBmb3InKTtcbiAgfVxuICB2YXIgbGVuID0gZmVhdHVyZXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgZmVhdHVyZSA9IGZlYXR1cmVzW2ldO1xuICAgIGlmIChmZWF0dXJlLnR5cGUgPT09ICdGZWF0dXJlJykge1xuICAgICAgc3dpdGNoIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUpIHtcbiAgICAgIGNhc2UgJ1BvaW50JzpcbiAgICAgICAgZ2VvSlNPTi5wb2ludChmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdNdWx0aVBvaW50JzpcbiAgICAgICAgZ2VvSlNPTi5tdWx0aVBvaW50TGluZVN0cmluZyhmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdMaW5lU3RyaW5nJzpcbiAgICAgICAgZ2VvSlNPTi5tdWx0aVBvaW50TGluZVN0cmluZyhmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdNdWx0aUxpbmVTdHJpbmcnOlxuICAgICAgICBnZW9KU09OLm11bHRpTGluZVN0cmluZ1BvbHlnb24oZmVhdHVyZSwgdGhhdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnUG9seWdvbic6XG4gICAgICAgIGdlb0pTT04ubXVsdGlMaW5lU3RyaW5nUG9seWdvbihmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdNdWx0aVBvbHlnb24nOlxuICAgICAgICBnZW9KU09OLm11bHRpUG9seWdvbihmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdHZW9tZXRyeUNvbGxlY3Rpb24nOlxuICAgICAgICBnZW9KU09OLmdlb21ldHJ5Q29sbGVjdGlvbihmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGkrKztcbiAgfVxufTtcbmV4cG9ydHMuYmJveCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHgxLCB5MSwgeDIsIHkyO1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgY2FzZSAxOlxuICAgIHgxID0gYXJndW1lbnRzWzBdWzBdWzBdO1xuICAgIHkxID0gYXJndW1lbnRzWzBdWzBdWzFdO1xuICAgIHgyID0gYXJndW1lbnRzWzBdWzFdWzBdO1xuICAgIHkyID0gYXJndW1lbnRzWzBdWzFdWzFdO1xuICAgIGJyZWFrO1xuICBjYXNlIDI6XG4gICAgeDEgPSBhcmd1bWVudHNbMF1bMF07XG4gICAgeTEgPSBhcmd1bWVudHNbMF1bMV07XG4gICAgeDIgPSBhcmd1bWVudHNbMV1bMF07XG4gICAgeTIgPSBhcmd1bWVudHNbMV1bMV07XG4gICAgYnJlYWs7XG4gIGNhc2UgNDpcbiAgICB4MSA9IGFyZ3VtZW50c1swXTtcbiAgICB5MSA9IGFyZ3VtZW50c1sxXTtcbiAgICB4MiA9IGFyZ3VtZW50c1syXTtcbiAgICB5MiA9IGFyZ3VtZW50c1szXTtcbiAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiB0aGlzLnNlYXJjaCh7XG4gICAgeDogeDEsXG4gICAgeTogeTEsXG4gICAgdzogeDIgLSB4MSxcbiAgICBoOiB5MiAtIHkxXG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBSVHJlZSA9IHJlcXVpcmUoJy4vcnRyZWUnKTtcbnZhciBnZW9qc29uID0gcmVxdWlyZSgnLi9nZW9qc29uJyk7XG5SVHJlZS5wcm90b3R5cGUuYmJveCA9IGdlb2pzb24uYmJveDtcblJUcmVlLnByb3RvdHlwZS5nZW9KU09OID0gZ2VvanNvbi5nZW9KU09OO1xuUlRyZWUuUmVjdGFuZ2xlID0gcmVxdWlyZSgnLi9yZWN0YW5nbGUnKTtcbm1vZHVsZS5leHBvcnRzID0gUlRyZWU7IiwiJ3VzZSBzdHJpY3QnO1xuZnVuY3Rpb24gUmVjdGFuZ2xlKHgsIHksIHcsIGgpIHsgLy8gbmV3IFJlY3RhbmdsZShib3VuZHMpIG9yIG5ldyBSZWN0YW5nbGUoeCwgeSwgdywgaClcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlY3RhbmdsZSkpIHtcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSh4LCB5LCB3LCBoKTtcbiAgfVxuICB2YXIgeDIsIHkyLCBwO1xuXG4gIGlmICh4LngpIHtcbiAgICB3ID0geC53O1xuICAgIGggPSB4Lmg7XG4gICAgeSA9IHgueTtcbiAgICBpZiAoeC53ICE9PSAwICYmICF4LncgJiYgeC54Mikge1xuICAgICAgdyA9IHgueDIgLSB4Lng7XG4gICAgICBoID0geC55MiAtIHgueTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB3ID0geC53O1xuICAgICAgaCA9IHguaDtcbiAgICB9XG4gICAgeCA9IHgueDtcbiAgICAvLyBGb3IgZXh0cmEgZmFzdGl0dWRlXG4gICAgeDIgPSB4ICsgdztcbiAgICB5MiA9IHkgKyBoO1xuICAgIHAgPSAoaCArIHcpID8gZmFsc2UgOiB0cnVlO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIEZvciBleHRyYSBmYXN0aXR1ZGVcbiAgICB4MiA9IHggKyB3O1xuICAgIHkyID0geSArIGg7XG4gICAgcCA9IChoICsgdykgPyBmYWxzZSA6IHRydWU7XG4gIH1cblxuICB0aGlzLngxID0gdGhpcy54ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xuICB0aGlzLnkxID0gdGhpcy55ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB5O1xuICB9O1xuICB0aGlzLngyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB4MjtcbiAgfTtcbiAgdGhpcy55MiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geTI7XG4gIH07XG4gIHRoaXMudyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdztcbiAgfTtcbiAgdGhpcy5oID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBoO1xuICB9O1xuICB0aGlzLnAgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHA7XG4gIH07XG5cbiAgdGhpcy5vdmVybGFwID0gZnVuY3Rpb24gKGEpIHtcbiAgICBpZiAocCB8fCBhLnAoKSkge1xuICAgICAgcmV0dXJuIHggPD0gYS54MigpICYmIHgyID49IGEueCgpICYmIHkgPD0gYS55MigpICYmIHkyID49IGEueSgpO1xuICAgIH1cbiAgICByZXR1cm4geCA8IGEueDIoKSAmJiB4MiA+IGEueCgpICYmIHkgPCBhLnkyKCkgJiYgeTIgPiBhLnkoKTtcbiAgfTtcblxuICB0aGlzLmV4cGFuZCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIG54LCBueTtcbiAgICB2YXIgYXggPSBhLngoKTtcbiAgICB2YXIgYXkgPSBhLnkoKTtcbiAgICB2YXIgYXgyID0gYS54MigpO1xuICAgIHZhciBheTIgPSBhLnkyKCk7XG4gICAgaWYgKHggPiBheCkge1xuICAgICAgbnggPSBheDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBueCA9IHg7XG4gICAgfVxuICAgIGlmICh5ID4gYXkpIHtcbiAgICAgIG55ID0gYXk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbnkgPSB5O1xuICAgIH1cbiAgICBpZiAoeDIgPiBheDIpIHtcbiAgICAgIHcgPSB4MiAtIG54O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHcgPSBheDIgLSBueDtcbiAgICB9XG4gICAgaWYgKHkyID4gYXkyKSB7XG4gICAgICBoID0geTIgLSBueTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBoID0gYXkyIC0gbnk7XG4gICAgfVxuICAgIHggPSBueDtcbiAgICB5ID0gbnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy9FbmQgb2YgUlRyZWUuUmVjdGFuZ2xlXG59XG5cblxuLyogcmV0dXJucyB0cnVlIGlmIHJlY3RhbmdsZSAxIG92ZXJsYXBzIHJlY3RhbmdsZSAyXG4gKiBbIGJvb2xlYW4gXSA9IG92ZXJsYXBSZWN0YW5nbGUocmVjdGFuZ2xlIGEsIHJlY3RhbmdsZSBiKVxuICogQHN0YXRpYyBmdW5jdGlvblxuICovXG5SZWN0YW5nbGUub3ZlcmxhcFJlY3RhbmdsZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIC8vaWYoISgoYS5ofHxhLncpJiYoYi5ofHxiLncpKSl7IG5vdCBmYXN0ZXIgcmVzaXN0IHRoZSB1cmdlIVxuICBpZiAoKGEuaCA9PT0gMCAmJiBhLncgPT09IDApIHx8IChiLmggPT09IDAgJiYgYi53ID09PSAwKSkge1xuICAgIHJldHVybiBhLnggPD0gKGIueCArIGIudykgJiYgKGEueCArIGEudykgPj0gYi54ICYmIGEueSA8PSAoYi55ICsgYi5oKSAmJiAoYS55ICsgYS5oKSA+PSBiLnk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGEueCA8IChiLnggKyBiLncpICYmIChhLnggKyBhLncpID4gYi54ICYmIGEueSA8IChiLnkgKyBiLmgpICYmIChhLnkgKyBhLmgpID4gYi55O1xuICB9XG59O1xuXG4vKiByZXR1cm5zIHRydWUgaWYgcmVjdGFuZ2xlIGEgaXMgY29udGFpbmVkIGluIHJlY3RhbmdsZSBiXG4gKiBbIGJvb2xlYW4gXSA9IGNvbnRhaW5zUmVjdGFuZ2xlKHJlY3RhbmdsZSBhLCByZWN0YW5nbGUgYilcbiAqIEBzdGF0aWMgZnVuY3Rpb25cbiAqL1xuUmVjdGFuZ2xlLmNvbnRhaW5zUmVjdGFuZ2xlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgcmV0dXJuIChhLnggKyBhLncpIDw9IChiLnggKyBiLncpICYmIGEueCA+PSBiLnggJiYgKGEueSArIGEuaCkgPD0gKGIueSArIGIuaCkgJiYgYS55ID49IGIueTtcbn07XG5cbi8qIGV4cGFuZHMgcmVjdGFuZ2xlIEEgdG8gaW5jbHVkZSByZWN0YW5nbGUgQiwgcmVjdGFuZ2xlIEIgaXMgdW50b3VjaGVkXG4gKiBbIHJlY3RhbmdsZSBhIF0gPSBleHBhbmRSZWN0YW5nbGUocmVjdGFuZ2xlIGEsIHJlY3RhbmdsZSBiKVxuICogQHN0YXRpYyBmdW5jdGlvblxuICovXG5SZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgdmFyIG54LCBueTtcbiAgdmFyIGF4dyA9IGEueCArIGEudztcbiAgdmFyIGJ4dyA9IGIueCArIGIudztcbiAgdmFyIGF5aCA9IGEueSArIGEuaDtcbiAgdmFyIGJ5aCA9IGIueSArIGIuaDtcbiAgaWYgKGEueCA+IGIueCkge1xuICAgIG54ID0gYi54O1xuICB9XG4gIGVsc2Uge1xuICAgIG54ID0gYS54O1xuICB9XG4gIGlmIChhLnkgPiBiLnkpIHtcbiAgICBueSA9IGIueTtcbiAgfVxuICBlbHNlIHtcbiAgICBueSA9IGEueTtcbiAgfVxuICBpZiAoYXh3ID4gYnh3KSB7XG4gICAgYS53ID0gYXh3IC0gbng7XG4gIH1cbiAgZWxzZSB7XG4gICAgYS53ID0gYnh3IC0gbng7XG4gIH1cbiAgaWYgKGF5aCA+IGJ5aCkge1xuICAgIGEuaCA9IGF5aCAtIG55O1xuICB9XG4gIGVsc2Uge1xuICAgIGEuaCA9IGJ5aCAtIG55O1xuICB9XG4gIGEueCA9IG54O1xuICBhLnkgPSBueTtcbiAgcmV0dXJuIGE7XG59O1xuXG4vKiBnZW5lcmF0ZXMgYSBtaW5pbWFsbHkgYm91bmRpbmcgcmVjdGFuZ2xlIGZvciBhbGwgcmVjdGFuZ2xlcyBpblxuICogYXJyYXkgJ25vZGVzJy4gSWYgcmVjdCBpcyBzZXQsIGl0IGlzIG1vZGlmaWVkIGludG8gdGhlIE1CUi4gT3RoZXJ3aXNlLFxuICogYSBuZXcgcmVjdGFuZ2xlIGlzIGdlbmVyYXRlZCBhbmQgcmV0dXJuZWQuXG4gKiBbIHJlY3RhbmdsZSBhIF0gPSBtYWtlTUJSKHJlY3RhbmdsZSBhcnJheSBub2RlcywgcmVjdGFuZ2xlIHJlY3QpXG4gKiBAc3RhdGljIGZ1bmN0aW9uXG4gKi9cblJlY3RhbmdsZS5tYWtlTUJSID0gZnVuY3Rpb24gKG5vZGVzLCByZWN0KSB7XG4gIGlmICghbm9kZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgdzogMCxcbiAgICAgIGg6IDBcbiAgICB9O1xuICB9XG4gIHJlY3QgPSByZWN0IHx8IHt9O1xuICByZWN0LnggPSBub2Rlc1swXS54O1xuICByZWN0LnkgPSBub2Rlc1swXS55O1xuICByZWN0LncgPSBub2Rlc1swXS53O1xuICByZWN0LmggPSBub2Rlc1swXS5oO1xuXG4gIGZvciAodmFyIGkgPSAxLCBsZW4gPSBub2Rlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIFJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUocmVjdCwgbm9kZXNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJlY3Q7XG59O1xuUmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyA9IGZ1bmN0aW9uIChsLCB3LCBmaWxsKSB7XG4gIC8vIEFyZWEgb2YgbmV3IGVubGFyZ2VkIHJlY3RhbmdsZVxuICB2YXIgbHBlcmkgPSAobCArIHcpIC8gMi4wOyAvLyBBdmVyYWdlIHNpemUgb2YgYSBzaWRlIG9mIHRoZSBuZXcgcmVjdGFuZ2xlXG4gIHZhciBsYXJlYSA9IGwgKiB3OyAvLyBBcmVhIG9mIG5ldyByZWN0YW5nbGVcbiAgLy8gcmV0dXJuIHRoZSByYXRpbyBvZiB0aGUgcGVyaW1ldGVyIHRvIHRoZSBhcmVhIC0gdGhlIGNsb3NlciB0byAxIHdlIGFyZSxcbiAgLy8gdGhlIG1vcmUgJ3NxdWFyZScgYSByZWN0YW5nbGUgaXMuIGNvbnZlcnNseSwgd2hlbiBhcHByb2FjaGluZyB6ZXJvIHRoZVxuICAvLyBtb3JlIGVsb25nYXRlZCBhIHJlY3RhbmdsZSBpc1xuICB2YXIgbGdlbyA9IGxhcmVhIC8gKGxwZXJpICogbHBlcmkpO1xuICByZXR1cm4gbGFyZWEgKiBmaWxsIC8gbGdlbztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFJlY3RhbmdsZTsiLCIndXNlIHN0cmljdCc7XG52YXIgcmVjdGFuZ2xlID0gcmVxdWlyZSgnLi9yZWN0YW5nbGUnKTtcbmZ1bmN0aW9uIFJUcmVlKHdpZHRoKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSVHJlZSkpIHtcbiAgICByZXR1cm4gbmV3IFJUcmVlKHdpZHRoKTtcbiAgfVxuICAvLyBWYXJpYWJsZXMgdG8gY29udHJvbCB0cmVlLWRpbWVuc2lvbnNcbiAgdmFyIG1pbldpZHRoID0gMzsgIC8vIE1pbmltdW0gd2lkdGggb2YgYW55IG5vZGUgYmVmb3JlIGEgbWVyZ2VcbiAgdmFyIG1heFdpZHRoID0gNjsgIC8vIE1heGltdW0gd2lkdGggb2YgYW55IG5vZGUgYmVmb3JlIGEgc3BsaXRcbiAgaWYgKCFpc05hTih3aWR0aCkpIHtcbiAgICBtaW5XaWR0aCA9IE1hdGguZmxvb3Iod2lkdGggLyAyLjApO1xuICAgIG1heFdpZHRoID0gd2lkdGg7XG4gIH1cbiAgLy8gU3RhcnQgd2l0aCBhbiBlbXB0eSByb290LXRyZWVcbiAgdmFyIHJvb3RUcmVlID0ge3g6IDAsIHk6IDAsIHc6IDAsIGg6IDAsIGlkOiAncm9vdCcsIG5vZGVzOiBbXSB9O1xuICB0aGlzLnJvb3QgPSByb290VHJlZTtcblxuXG4gIC8vIFRoaXMgaXMgbXkgc3BlY2lhbCBhZGRpdGlvbiB0byB0aGUgd29ybGQgb2Ygci10cmVlc1xuICAvLyBldmVyeSBvdGhlciAoc2ltcGxlKSBtZXRob2QgSSBmb3VuZCBwcm9kdWNlZCBjcmFwIHRyZWVzXG4gIC8vIHRoaXMgc2tld3MgaW5zZXJ0aW9ucyB0byBwcmVmZXJpbmcgc3F1YXJlciBhbmQgZW1wdGllciBub2Rlc1xuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uICh0cmVlKSB7XG4gICAgdmFyIHRvZG8gPSB0cmVlLnNsaWNlKCk7XG4gICAgdmFyIGRvbmUgPSBbXTtcbiAgICB2YXIgY3VycmVudDtcbiAgICB3aGlsZSAodG9kby5sZW5ndGgpIHtcbiAgICAgIGN1cnJlbnQgPSB0b2RvLnBvcCgpO1xuICAgICAgaWYgKGN1cnJlbnQubm9kZXMpIHtcbiAgICAgICAgdG9kbyA9IHRvZG8uY29uY2F0KGN1cnJlbnQubm9kZXMpO1xuICAgICAgfSBlbHNlIGlmIChjdXJyZW50LmxlYWYpIHtcbiAgICAgICAgZG9uZS5wdXNoKGN1cnJlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZG9uZTtcbiAgfTtcbiAgLyogZmluZCB0aGUgYmVzdCBzcGVjaWZpYyBub2RlKHMpIGZvciBvYmplY3QgdG8gYmUgZGVsZXRlZCBmcm9tXG4gICAqIFsgbGVhZiBub2RlIHBhcmVudCBdID0gcmVtb3ZlU3VidHJlZShyZWN0YW5nbGUsIG9iamVjdCwgcm9vdClcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciByZW1vdmVTdWJ0cmVlID0gZnVuY3Rpb24gKHJlY3QsIG9iaiwgcm9vdCkge1xuICAgIHZhciBoaXRTdGFjayA9IFtdOyAvLyBDb250YWlucyB0aGUgZWxlbWVudHMgdGhhdCBvdmVybGFwXG4gICAgdmFyIGNvdW50U3RhY2sgPSBbXTsgLy8gQ29udGFpbnMgdGhlIGVsZW1lbnRzIHRoYXQgb3ZlcmxhcFxuICAgIHZhciByZXRBcnJheSA9IFtdO1xuICAgIHZhciBjdXJyZW50RGVwdGggPSAxO1xuICAgIHZhciB0cmVlLCBpLCBsdHJlZTtcbiAgICBpZiAoIXJlY3QgfHwgIXJlY3RhbmdsZS5vdmVybGFwUmVjdGFuZ2xlKHJlY3QsIHJvb3QpKSB7XG4gICAgICByZXR1cm4gcmV0QXJyYXk7XG4gICAgfVxuICAgIHZhciByZXRPYmogPSB7eDogcmVjdC54LCB5OiByZWN0LnksIHc6IHJlY3QudywgaDogcmVjdC5oLCB0YXJnZXQ6IG9ian07XG5cbiAgICBjb3VudFN0YWNrLnB1c2gocm9vdC5ub2Rlcy5sZW5ndGgpO1xuICAgIGhpdFN0YWNrLnB1c2gocm9vdCk7XG4gICAgd2hpbGUgKGhpdFN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIHRyZWUgPSBoaXRTdGFjay5wb3AoKTtcbiAgICAgIGkgPSBjb3VudFN0YWNrLnBvcCgpIC0gMTtcbiAgICAgIGlmICgndGFyZ2V0JyBpbiByZXRPYmopIHsgLy8gd2lsbCB0aGlzIGV2ZXIgYmUgZmFsc2U/XG4gICAgICAgIHdoaWxlIChpID49IDApIHtcbiAgICAgICAgICBsdHJlZSA9IHRyZWUubm9kZXNbaV07XG4gICAgICAgICAgaWYgKHJlY3RhbmdsZS5vdmVybGFwUmVjdGFuZ2xlKHJldE9iaiwgbHRyZWUpKSB7XG5cbiAgICAgICAgICAgIGlmICgocmV0T2JqLnRhcmdldCAmJiAnbGVhZicgaW4gbHRyZWUgJiYgbHRyZWUubGVhZiA9PT0gcmV0T2JqLnRhcmdldCkgfHwgKCFyZXRPYmoudGFyZ2V0ICYmICgnbGVhZicgaW4gbHRyZWUgfHwgcmVjdGFuZ2xlLmNvbnRhaW5zUmVjdGFuZ2xlKGx0cmVlLCByZXRPYmopKSkpIHtcbiAgICAgICAgICAgICAgLy8gQSBNYXRjaCAhIVxuICAgICAgICAgICAgLy8gWXVwIHdlIGZvdW5kIGEgbWF0Y2guLi5cbiAgICAgICAgICAgIC8vIHdlIGNhbiBjYW5jZWwgc2VhcmNoIGFuZCBzdGFydCB3YWxraW5nIHVwIHRoZSBsaXN0XG4gICAgICAgICAgICAgIGlmICgnbm9kZXMnIGluIGx0cmVlKSB7Ly8gSWYgd2UgYXJlIGRlbGV0aW5nIGEgbm9kZSBub3QgYSBsZWFmLi4uXG4gICAgICAgICAgICAgICAgcmV0QXJyYXkgPSBmbGF0dGVuKHRyZWUubm9kZXMuc3BsaWNlKGksIDEpKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXRBcnJheSA9IHRyZWUubm9kZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIFJlc2l6ZSBNQlIgZG93bi4uLlxuICAgICAgICAgICAgICByZWN0YW5nbGUubWFrZU1CUih0cmVlLm5vZGVzLCB0cmVlKTtcbiAgICAgICAgICAgICAgZGVsZXRlIHJldE9iai50YXJnZXQ7XG4gICAgICAgICAgICAgIC8vaWYgKHRyZWUubm9kZXMubGVuZ3RoIDwgbWluV2lkdGgpIHsgLy8gVW5kZXJmbG93XG4gICAgICAgICAgICAgIC8vICByZXRPYmoubm9kZXMgPSBzZWFyY2hTdWJ0cmVlKHRyZWUsIHRydWUsIFtdLCB0cmVlKTtcbiAgICAgICAgICAgICAgLy99XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgnbm9kZXMnIGluIGx0cmVlKSB7IC8vIE5vdCBhIExlYWZcbiAgICAgICAgICAgICAgY3VycmVudERlcHRoKys7XG4gICAgICAgICAgICAgIGNvdW50U3RhY2sucHVzaChpKTtcbiAgICAgICAgICAgICAgaGl0U3RhY2sucHVzaCh0cmVlKTtcbiAgICAgICAgICAgICAgdHJlZSA9IGx0cmVlO1xuICAgICAgICAgICAgICBpID0gbHRyZWUubm9kZXMubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpLS07XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIGlmICgnbm9kZXMnIGluIHJldE9iaikgeyAvLyBXZSBhcmUgdW5zcGxpdHRpbmdcblxuICAgICAgICB0cmVlLm5vZGVzLnNwbGljZShpICsgMSwgMSk7IC8vIFJlbW92ZSB1bnNwbGl0IG5vZGVcbiAgICAgICAgaWYgKHRyZWUubm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJlY3RhbmdsZS5tYWtlTUJSKHRyZWUubm9kZXMsIHRyZWUpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIHQgPSAwO3QgPCByZXRPYmoubm9kZXMubGVuZ3RoO3QrKykge1xuICAgICAgICAgIGluc2VydFN1YnRyZWUocmV0T2JqLm5vZGVzW3RdLCB0cmVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXRPYmoubm9kZXMgPSBbXTtcbiAgICAgICAgaWYgKGhpdFN0YWNrLmxlbmd0aCA9PT0gMCAmJiB0cmVlLm5vZGVzLmxlbmd0aCA8PSAxKSB7IC8vIFVuZGVyZmxvdy4ub24gcm9vdCFcbiAgICAgICAgICByZXRPYmoubm9kZXMgPSBzZWFyY2hTdWJ0cmVlKHRyZWUsIHRydWUsIHJldE9iai5ub2RlcywgdHJlZSk7XG4gICAgICAgICAgdHJlZS5ub2RlcyA9IFtdO1xuICAgICAgICAgIGhpdFN0YWNrLnB1c2godHJlZSk7XG4gICAgICAgICAgY291bnRTdGFjay5wdXNoKDEpO1xuICAgICAgICB9IGVsc2UgaWYgKGhpdFN0YWNrLmxlbmd0aCA+IDAgJiYgdHJlZS5ub2Rlcy5sZW5ndGggPCBtaW5XaWR0aCkgeyAvLyBVbmRlcmZsb3cuLkFHQUlOIVxuICAgICAgICAgIHJldE9iai5ub2RlcyA9IHNlYXJjaFN1YnRyZWUodHJlZSwgdHJ1ZSwgcmV0T2JqLm5vZGVzLCB0cmVlKTtcbiAgICAgICAgICB0cmVlLm5vZGVzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVsZXRlIHJldE9iai5ub2RlczsgLy8gSnVzdCBzdGFydCByZXNpemluZ1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyB3ZSBhcmUganVzdCByZXNpemluZ1xuICAgICAgICByZWN0YW5nbGUubWFrZU1CUih0cmVlLm5vZGVzLCB0cmVlKTtcbiAgICAgIH1cbiAgICAgIGN1cnJlbnREZXB0aCAtPSAxO1xuICAgIH1cbiAgICByZXR1cm4gcmV0QXJyYXk7XG4gIH07XG5cbiAgLyogY2hvb3NlIHRoZSBiZXN0IGRhbW4gbm9kZSBmb3IgcmVjdGFuZ2xlIHRvIGJlIGluc2VydGVkIGludG9cbiAgICogWyBsZWFmIG5vZGUgcGFyZW50IF0gPSBjaG9vc2VMZWFmU3VidHJlZShyZWN0YW5nbGUsIHJvb3QgdG8gc3RhcnQgc2VhcmNoIGF0KVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIGNob29zZUxlYWZTdWJ0cmVlID0gZnVuY3Rpb24gKHJlY3QsIHJvb3QpIHtcbiAgICB2YXIgYmVzdENob2ljZUluZGV4ID0gLTE7XG4gICAgdmFyIGJlc3RDaG9pY2VTdGFjayA9IFtdO1xuICAgIHZhciBiZXN0Q2hvaWNlQXJlYTtcbiAgICB2YXIgZmlyc3QgPSB0cnVlO1xuICAgIGJlc3RDaG9pY2VTdGFjay5wdXNoKHJvb3QpO1xuICAgIHZhciBub2RlcyA9IHJvb3Qubm9kZXM7XG5cbiAgICB3aGlsZSAoZmlyc3QgfHwgYmVzdENob2ljZUluZGV4ICE9PSAtMSkge1xuICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgIGZpcnN0ID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiZXN0Q2hvaWNlU3RhY2sucHVzaChub2Rlc1tiZXN0Q2hvaWNlSW5kZXhdKTtcbiAgICAgICAgbm9kZXMgPSBub2Rlc1tiZXN0Q2hvaWNlSW5kZXhdLm5vZGVzO1xuICAgICAgICBiZXN0Q2hvaWNlSW5kZXggPSAtMTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBsdHJlZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAoJ2xlYWYnIGluIGx0cmVlKSB7XG4gICAgICAgICAgLy8gQmFpbCBvdXQgb2YgZXZlcnl0aGluZyBhbmQgc3RhcnQgaW5zZXJ0aW5nXG4gICAgICAgICAgYmVzdENob2ljZUluZGV4ID0gLTE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXJlYSBvZiBuZXcgZW5sYXJnZWQgcmVjdGFuZ2xlXG4gICAgICAgIHZhciBvbGRMUmF0aW8gPSByZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvKGx0cmVlLncsIGx0cmVlLmgsIGx0cmVlLm5vZGVzLmxlbmd0aCArIDEpO1xuXG4gICAgICAgIC8vIEVubGFyZ2UgcmVjdGFuZ2xlIHRvIGZpdCBuZXcgcmVjdGFuZ2xlXG4gICAgICAgIHZhciBudyA9IE1hdGgubWF4KGx0cmVlLnggKyBsdHJlZS53LCByZWN0LnggKyByZWN0LncpIC0gTWF0aC5taW4obHRyZWUueCwgcmVjdC54KTtcbiAgICAgICAgdmFyIG5oID0gTWF0aC5tYXgobHRyZWUueSArIGx0cmVlLmgsIHJlY3QueSArIHJlY3QuaCkgLSBNYXRoLm1pbihsdHJlZS55LCByZWN0LnkpO1xuXG4gICAgICAgIC8vIEFyZWEgb2YgbmV3IGVubGFyZ2VkIHJlY3RhbmdsZVxuICAgICAgICB2YXIgbHJhdGlvID0gcmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyhudywgbmgsIGx0cmVlLm5vZGVzLmxlbmd0aCArIDIpO1xuXG4gICAgICAgIGlmIChiZXN0Q2hvaWNlSW5kZXggPCAwIHx8IE1hdGguYWJzKGxyYXRpbyAtIG9sZExSYXRpbykgPCBiZXN0Q2hvaWNlQXJlYSkge1xuICAgICAgICAgIGJlc3RDaG9pY2VBcmVhID0gTWF0aC5hYnMobHJhdGlvIC0gb2xkTFJhdGlvKTtcbiAgICAgICAgICBiZXN0Q2hvaWNlSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGJlc3RDaG9pY2VTdGFjaztcbiAgfTtcblxuICAvKiBzcGxpdCBhIHNldCBvZiBub2RlcyBpbnRvIHR3byByb3VnaGx5IGVxdWFsbHktZmlsbGVkIG5vZGVzXG4gICAqIFsgYW4gYXJyYXkgb2YgdHdvIG5ldyBhcnJheXMgb2Ygbm9kZXMgXSA9IGxpbmVhclNwbGl0KGFycmF5IG9mIG5vZGVzKVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIGxpbmVhclNwbGl0ID0gZnVuY3Rpb24gKG5vZGVzKSB7XG4gICAgdmFyIG4gPSBwaWNrTGluZWFyKG5vZGVzKTtcbiAgICB3aGlsZSAobm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgcGlja05leHQobm9kZXMsIG5bMF0sIG5bMV0pO1xuICAgIH1cbiAgICByZXR1cm4gbjtcbiAgfTtcblxuICAvKiBpbnNlcnQgdGhlIGJlc3Qgc291cmNlIHJlY3RhbmdsZSBpbnRvIHRoZSBiZXN0IGZpdHRpbmcgcGFyZW50IG5vZGU6IGEgb3IgYlxuICAgKiBbXSA9IHBpY2tOZXh0KGFycmF5IG9mIHNvdXJjZSBub2RlcywgdGFyZ2V0IG5vZGUgYXJyYXkgYSwgdGFyZ2V0IG5vZGUgYXJyYXkgYilcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciBwaWNrTmV4dCA9IGZ1bmN0aW9uIChub2RlcywgYSwgYikge1xuICAvLyBBcmVhIG9mIG5ldyBlbmxhcmdlZCByZWN0YW5nbGVcbiAgICB2YXIgYXJlYUEgPSByZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvKGEudywgYS5oLCBhLm5vZGVzLmxlbmd0aCArIDEpO1xuICAgIHZhciBhcmVhQiA9IHJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8oYi53LCBiLmgsIGIubm9kZXMubGVuZ3RoICsgMSk7XG4gICAgdmFyIGhpZ2hBcmVhRGVsdGE7XG4gICAgdmFyIGhpZ2hBcmVhTm9kZTtcbiAgICB2YXIgbG93ZXN0R3Jvd3RoR3JvdXA7XG5cbiAgICBmb3IgKHZhciBpID0gbm9kZXMubGVuZ3RoIC0gMTsgaSA+PSAwO2ktLSkge1xuICAgICAgdmFyIGwgPSBub2Rlc1tpXTtcbiAgICAgIHZhciBuZXdBcmVhQSA9IHt9O1xuICAgICAgbmV3QXJlYUEueCA9IE1hdGgubWluKGEueCwgbC54KTtcbiAgICAgIG5ld0FyZWFBLnkgPSBNYXRoLm1pbihhLnksIGwueSk7XG4gICAgICBuZXdBcmVhQS53ID0gTWF0aC5tYXgoYS54ICsgYS53LCBsLnggKyBsLncpIC0gbmV3QXJlYUEueDtcbiAgICAgIG5ld0FyZWFBLmggPSBNYXRoLm1heChhLnkgKyBhLmgsIGwueSArIGwuaCkgLSBuZXdBcmVhQS55O1xuICAgICAgdmFyIGNoYW5nZU5ld0FyZWFBID0gTWF0aC5hYnMocmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyhuZXdBcmVhQS53LCBuZXdBcmVhQS5oLCBhLm5vZGVzLmxlbmd0aCArIDIpIC0gYXJlYUEpO1xuXG4gICAgICB2YXIgbmV3QXJlYUIgPSB7fTtcbiAgICAgIG5ld0FyZWFCLnggPSBNYXRoLm1pbihiLngsIGwueCk7XG4gICAgICBuZXdBcmVhQi55ID0gTWF0aC5taW4oYi55LCBsLnkpO1xuICAgICAgbmV3QXJlYUIudyA9IE1hdGgubWF4KGIueCArIGIudywgbC54ICsgbC53KSAtIG5ld0FyZWFCLng7XG4gICAgICBuZXdBcmVhQi5oID0gTWF0aC5tYXgoYi55ICsgYi5oLCBsLnkgKyBsLmgpIC0gbmV3QXJlYUIueTtcbiAgICAgIHZhciBjaGFuZ2VOZXdBcmVhQiA9IE1hdGguYWJzKHJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8obmV3QXJlYUIudywgbmV3QXJlYUIuaCwgYi5ub2Rlcy5sZW5ndGggKyAyKSAtIGFyZWFCKTtcblxuICAgICAgaWYgKCFoaWdoQXJlYU5vZGUgfHwgIWhpZ2hBcmVhRGVsdGEgfHwgTWF0aC5hYnMoY2hhbmdlTmV3QXJlYUIgLSBjaGFuZ2VOZXdBcmVhQSkgPCBoaWdoQXJlYURlbHRhKSB7XG4gICAgICAgIGhpZ2hBcmVhTm9kZSA9IGk7XG4gICAgICAgIGhpZ2hBcmVhRGVsdGEgPSBNYXRoLmFicyhjaGFuZ2VOZXdBcmVhQiAtIGNoYW5nZU5ld0FyZWFBKTtcbiAgICAgICAgbG93ZXN0R3Jvd3RoR3JvdXAgPSBjaGFuZ2VOZXdBcmVhQiA8IGNoYW5nZU5ld0FyZWFBID8gYiA6IGE7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciB0ZW1wTm9kZSA9IG5vZGVzLnNwbGljZShoaWdoQXJlYU5vZGUsIDEpWzBdO1xuICAgIGlmIChhLm5vZGVzLmxlbmd0aCArIG5vZGVzLmxlbmd0aCArIDEgPD0gbWluV2lkdGgpIHtcbiAgICAgIGEubm9kZXMucHVzaCh0ZW1wTm9kZSk7XG4gICAgICByZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlKGEsIHRlbXBOb2RlKTtcbiAgICB9ICBlbHNlIGlmIChiLm5vZGVzLmxlbmd0aCArIG5vZGVzLmxlbmd0aCArIDEgPD0gbWluV2lkdGgpIHtcbiAgICAgIGIubm9kZXMucHVzaCh0ZW1wTm9kZSk7XG4gICAgICByZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlKGIsIHRlbXBOb2RlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb3dlc3RHcm93dGhHcm91cC5ub2Rlcy5wdXNoKHRlbXBOb2RlKTtcbiAgICAgIHJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUobG93ZXN0R3Jvd3RoR3JvdXAsIHRlbXBOb2RlKTtcbiAgICB9XG4gIH07XG5cbiAgLyogcGljayB0aGUgJ2Jlc3QnIHR3byBzdGFydGVyIG5vZGVzIHRvIHVzZSBhcyBzZWVkcyB1c2luZyB0aGUgJ2xpbmVhcicgY3JpdGVyaWFcbiAgICogWyBhbiBhcnJheSBvZiB0d28gbmV3IGFycmF5cyBvZiBub2RlcyBdID0gcGlja0xpbmVhcihhcnJheSBvZiBzb3VyY2Ugbm9kZXMpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgcGlja0xpbmVhciA9IGZ1bmN0aW9uIChub2Rlcykge1xuICAgIHZhciBsb3dlc3RIaWdoWCA9IG5vZGVzLmxlbmd0aCAtIDE7XG4gICAgdmFyIGhpZ2hlc3RMb3dYID0gMDtcbiAgICB2YXIgbG93ZXN0SGlnaFkgPSBub2Rlcy5sZW5ndGggLSAxO1xuICAgIHZhciBoaWdoZXN0TG93WSA9IDA7XG4gICAgdmFyIHQxLCB0MjtcblxuICAgIGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAyOyBpID49IDA7aS0tKSB7XG4gICAgICB2YXIgbCA9IG5vZGVzW2ldO1xuICAgICAgaWYgKGwueCA+IG5vZGVzW2hpZ2hlc3RMb3dYXS54KSB7XG4gICAgICAgIGhpZ2hlc3RMb3dYID0gaTtcbiAgICAgIH0gZWxzZSBpZiAobC54ICsgbC53IDwgbm9kZXNbbG93ZXN0SGlnaFhdLnggKyBub2Rlc1tsb3dlc3RIaWdoWF0udykge1xuICAgICAgICBsb3dlc3RIaWdoWCA9IGk7XG4gICAgICB9XG4gICAgICBpZiAobC55ID4gbm9kZXNbaGlnaGVzdExvd1ldLnkpIHtcbiAgICAgICAgaGlnaGVzdExvd1kgPSBpO1xuICAgICAgfSBlbHNlIGlmIChsLnkgKyBsLmggPCBub2Rlc1tsb3dlc3RIaWdoWV0ueSArIG5vZGVzW2xvd2VzdEhpZ2hZXS5oKSB7XG4gICAgICAgIGxvd2VzdEhpZ2hZID0gaTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGR4ID0gTWF0aC5hYnMoKG5vZGVzW2xvd2VzdEhpZ2hYXS54ICsgbm9kZXNbbG93ZXN0SGlnaFhdLncpIC0gbm9kZXNbaGlnaGVzdExvd1hdLngpO1xuICAgIHZhciBkeSA9IE1hdGguYWJzKChub2Rlc1tsb3dlc3RIaWdoWV0ueSArIG5vZGVzW2xvd2VzdEhpZ2hZXS5oKSAtIG5vZGVzW2hpZ2hlc3RMb3dZXS55KTtcbiAgICBpZiAoZHggPiBkeSkgIHtcbiAgICAgIGlmIChsb3dlc3RIaWdoWCA+IGhpZ2hlc3RMb3dYKSAge1xuICAgICAgICB0MSA9IG5vZGVzLnNwbGljZShsb3dlc3RIaWdoWCwgMSlbMF07XG4gICAgICAgIHQyID0gbm9kZXMuc3BsaWNlKGhpZ2hlc3RMb3dYLCAxKVswXTtcbiAgICAgIH0gIGVsc2Uge1xuICAgICAgICB0MiA9IG5vZGVzLnNwbGljZShoaWdoZXN0TG93WCwgMSlbMF07XG4gICAgICAgIHQxID0gbm9kZXMuc3BsaWNlKGxvd2VzdEhpZ2hYLCAxKVswXTtcbiAgICAgIH1cbiAgICB9ICBlbHNlIHtcbiAgICAgIGlmIChsb3dlc3RIaWdoWSA+IGhpZ2hlc3RMb3dZKSAge1xuICAgICAgICB0MSA9IG5vZGVzLnNwbGljZShsb3dlc3RIaWdoWSwgMSlbMF07XG4gICAgICAgIHQyID0gbm9kZXMuc3BsaWNlKGhpZ2hlc3RMb3dZLCAxKVswXTtcbiAgICAgIH0gIGVsc2Uge1xuICAgICAgICB0MiA9IG5vZGVzLnNwbGljZShoaWdoZXN0TG93WSwgMSlbMF07XG4gICAgICAgIHQxID0gbm9kZXMuc3BsaWNlKGxvd2VzdEhpZ2hZLCAxKVswXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgIHt4OiB0MS54LCB5OiB0MS55LCB3OiB0MS53LCBoOiB0MS5oLCBub2RlczogW3QxXX0sXG4gICAgICB7eDogdDIueCwgeTogdDIueSwgdzogdDIudywgaDogdDIuaCwgbm9kZXM6IFt0Ml19XG4gICAgXTtcbiAgfTtcblxuICB2YXIgYXR0YWNoRGF0YSA9IGZ1bmN0aW9uIChub2RlLCBtb3JlVHJlZSkge1xuICAgIG5vZGUubm9kZXMgPSBtb3JlVHJlZS5ub2RlcztcbiAgICBub2RlLnggPSBtb3JlVHJlZS54O1xuICAgIG5vZGUueSA9IG1vcmVUcmVlLnk7XG4gICAgbm9kZS53ID0gbW9yZVRyZWUudztcbiAgICBub2RlLmggPSBtb3JlVHJlZS5oO1xuICAgIHJldHVybiBub2RlO1xuICB9O1xuXG4gIC8qIG5vbi1yZWN1cnNpdmUgaW50ZXJuYWwgc2VhcmNoIGZ1bmN0aW9uXG4gICogWyBub2RlcyB8IG9iamVjdHMgXSA9IHNlYXJjaFN1YnRyZWUocmVjdGFuZ2xlLCBbcmV0dXJuIG5vZGUgZGF0YV0sIFthcnJheSB0byBmaWxsXSwgcm9vdCB0byBiZWdpbiBzZWFyY2ggYXQpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgc2VhcmNoU3VidHJlZSA9IGZ1bmN0aW9uIChyZWN0LCByZXR1cm5Ob2RlLCByZXR1cm5BcnJheSwgcm9vdCkge1xuICAgIHZhciBoaXRTdGFjayA9IFtdOyAvLyBDb250YWlucyB0aGUgZWxlbWVudHMgdGhhdCBvdmVybGFwXG5cbiAgICBpZiAoIXJlY3RhbmdsZS5vdmVybGFwUmVjdGFuZ2xlKHJlY3QsIHJvb3QpKSB7XG4gICAgICByZXR1cm4gcmV0dXJuQXJyYXk7XG4gICAgfVxuXG5cbiAgICBoaXRTdGFjay5wdXNoKHJvb3Qubm9kZXMpO1xuXG4gICAgd2hpbGUgKGhpdFN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIHZhciBub2RlcyA9IGhpdFN0YWNrLnBvcCgpO1xuXG4gICAgICBmb3IgKHZhciBpID0gbm9kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIGx0cmVlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChyZWN0YW5nbGUub3ZlcmxhcFJlY3RhbmdsZShyZWN0LCBsdHJlZSkpIHtcbiAgICAgICAgICBpZiAoJ25vZGVzJyBpbiBsdHJlZSkgeyAvLyBOb3QgYSBMZWFmXG4gICAgICAgICAgICBoaXRTdGFjay5wdXNoKGx0cmVlLm5vZGVzKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCdsZWFmJyBpbiBsdHJlZSkgeyAvLyBBIExlYWYgISFcbiAgICAgICAgICAgIGlmICghcmV0dXJuTm9kZSkge1xuICAgICAgICAgICAgICByZXR1cm5BcnJheS5wdXNoKGx0cmVlLmxlYWYpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuQXJyYXkucHVzaChsdHJlZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldHVybkFycmF5O1xuICB9O1xuXG4gIC8qIG5vbi1yZWN1cnNpdmUgaW50ZXJuYWwgaW5zZXJ0IGZ1bmN0aW9uXG4gICAqIFtdID0gaW5zZXJ0U3VidHJlZShyZWN0YW5nbGUsIG9iamVjdCB0byBpbnNlcnQsIHJvb3QgdG8gYmVnaW4gaW5zZXJ0aW9uIGF0KVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIGluc2VydFN1YnRyZWUgPSBmdW5jdGlvbiAobm9kZSwgcm9vdCkge1xuICAgIHZhciBiYzsgLy8gQmVzdCBDdXJyZW50IG5vZGVcbiAgICAvLyBJbml0aWFsIGluc2VydGlvbiBpcyBzcGVjaWFsIGJlY2F1c2Ugd2UgcmVzaXplIHRoZSBUcmVlIGFuZCB3ZSBkb24ndFxuICAgIC8vIGNhcmUgYWJvdXQgYW55IG92ZXJmbG93IChzZXJpb3VzbHksIGhvdyBjYW4gdGhlIGZpcnN0IG9iamVjdCBvdmVyZmxvdz8pXG4gICAgaWYgKHJvb3Qubm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByb290LnggPSBub2RlLng7XG4gICAgICByb290LnkgPSBub2RlLnk7XG4gICAgICByb290LncgPSBub2RlLnc7XG4gICAgICByb290LmggPSBub2RlLmg7XG4gICAgICByb290Lm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRmluZCB0aGUgYmVzdCBmaXR0aW5nIGxlYWYgbm9kZVxuICAgIC8vIGNob29zZUxlYWYgcmV0dXJucyBhbiBhcnJheSBvZiBhbGwgdHJlZSBsZXZlbHMgKGluY2x1ZGluZyByb290KVxuICAgIC8vIHRoYXQgd2VyZSB0cmF2ZXJzZWQgd2hpbGUgdHJ5aW5nIHRvIGZpbmQgdGhlIGxlYWZcbiAgICB2YXIgdHJlZVN0YWNrID0gY2hvb3NlTGVhZlN1YnRyZWUobm9kZSwgcm9vdCk7XG4gICAgdmFyIHJldE9iaiA9IG5vZGU7Ly97eDpyZWN0LngseTpyZWN0LnksdzpyZWN0LncsaDpyZWN0LmgsIGxlYWY6b2JqfTtcbiAgICB2YXIgcGJjO1xuICAgIC8vIFdhbGsgYmFjayB1cCB0aGUgdHJlZSByZXNpemluZyBhbmQgaW5zZXJ0aW5nIGFzIG5lZWRlZFxuICAgIHdoaWxlICh0cmVlU3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgLy9oYW5kbGUgdGhlIGNhc2Ugb2YgYW4gZW1wdHkgbm9kZSAoZnJvbSBhIHNwbGl0KVxuICAgICAgaWYgKGJjICYmICdub2RlcycgaW4gYmMgJiYgYmMubm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHBiYyA9IGJjOyAvLyBQYXN0IGJjXG4gICAgICAgIGJjID0gdHJlZVN0YWNrLnBvcCgpO1xuICAgICAgICBmb3IgKHZhciB0ID0gMDt0IDwgYmMubm9kZXMubGVuZ3RoO3QrKykge1xuICAgICAgICAgIGlmIChiYy5ub2Rlc1t0XSA9PT0gcGJjIHx8IGJjLm5vZGVzW3RdLm5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgYmMubm9kZXMuc3BsaWNlKHQsIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBiYyA9IHRyZWVTdGFjay5wb3AoKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlcmUgaXMgZGF0YSBhdHRhY2hlZCB0byB0aGlzIHJldE9ialxuICAgICAgaWYgKCdsZWFmJyBpbiByZXRPYmogfHwgJ25vZGVzJyBpbiByZXRPYmogfHwgQXJyYXkuaXNBcnJheShyZXRPYmopKSB7XG4gICAgICAgIC8vIERvIEluc2VydFxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZXRPYmopKSB7XG4gICAgICAgICAgZm9yICh2YXIgYWkgPSAwOyBhaSA8IHJldE9iai5sZW5ndGg7IGFpKyspIHtcbiAgICAgICAgICAgIHJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUoYmMsIHJldE9ialthaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBiYy5ub2RlcyA9IGJjLm5vZGVzLmNvbmNhdChyZXRPYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUoYmMsIHJldE9iaik7XG4gICAgICAgICAgYmMubm9kZXMucHVzaChyZXRPYmopOyAvLyBEbyBJbnNlcnRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYy5ub2Rlcy5sZW5ndGggPD0gbWF4V2lkdGgpICB7IC8vIFN0YXJ0IFJlc2l6ZWluZyBVcCB0aGUgVHJlZVxuICAgICAgICAgIHJldE9iaiA9IHt4OiBiYy54LCB5OiBiYy55LCB3OiBiYy53LCBoOiBiYy5ofTtcbiAgICAgICAgfSAgZWxzZSB7IC8vIE90aGVyd2lzZSBTcGxpdCB0aGlzIE5vZGVcbiAgICAgICAgICAvLyBsaW5lYXJTcGxpdCgpIHJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyB0d28gbmV3IG5vZGVzXG4gICAgICAgICAgLy8gZm9ybWVkIGZyb20gdGhlIHNwbGl0IG9mIHRoZSBwcmV2aW91cyBub2RlJ3Mgb3ZlcmZsb3dcbiAgICAgICAgICB2YXIgYSA9IGxpbmVhclNwbGl0KGJjLm5vZGVzKTtcbiAgICAgICAgICByZXRPYmogPSBhOy8vWzFdO1xuXG4gICAgICAgICAgaWYgKHRyZWVTdGFjay5sZW5ndGggPCAxKSAgeyAvLyBJZiBhcmUgc3BsaXR0aW5nIHRoZSByb290Li5cbiAgICAgICAgICAgIGJjLm5vZGVzLnB1c2goYVswXSk7XG4gICAgICAgICAgICB0cmVlU3RhY2sucHVzaChiYyk7ICAvLyBSZWNvbnNpZGVyIHRoZSByb290IGVsZW1lbnRcbiAgICAgICAgICAgIHJldE9iaiA9IGFbMV07XG4gICAgICAgICAgfSAvKmVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIGJjO1xuICAgICAgICAgIH0qL1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyBPdGhlcndpc2UgRG8gUmVzaXplXG4gICAgICAgIC8vSnVzdCBrZWVwIGFwcGx5aW5nIHRoZSBuZXcgYm91bmRpbmcgcmVjdGFuZ2xlIHRvIHRoZSBwYXJlbnRzLi5cbiAgICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShiYywgcmV0T2JqKTtcbiAgICAgICAgcmV0T2JqID0ge3g6IGJjLngsIHk6IGJjLnksIHc6IGJjLncsIGg6IGJjLmh9O1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICB0aGlzLmluc2VydFN1YnRyZWUgPSBpbnNlcnRTdWJ0cmVlO1xuICAvKiBxdWljayAnbicgZGlydHkgZnVuY3Rpb24gZm9yIHBsdWdpbnMgb3IgbWFudWFsbHkgZHJhd2luZyB0aGUgdHJlZVxuICAgKiBbIHRyZWUgXSA9IFJUcmVlLmdldFRyZWUoKTogcmV0dXJucyB0aGUgcmF3IHRyZWUgZGF0YS4gdXNlZnVsIGZvciBhZGRpbmdcbiAgICogQHB1YmxpY1xuICAgKiAhISBERVBSRUNBVEVEICEhXG4gICAqL1xuICB0aGlzLmdldFRyZWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHJvb3RUcmVlO1xuICB9O1xuXG4gIC8qIHF1aWNrICduJyBkaXJ0eSBmdW5jdGlvbiBmb3IgcGx1Z2lucyBvciBtYW51YWxseSBsb2FkaW5nIHRoZSB0cmVlXG4gICAqIFsgdHJlZSBdID0gUlRyZWUuc2V0VHJlZShzdWItdHJlZSwgd2hlcmUgdG8gYXR0YWNoKTogcmV0dXJucyB0aGUgcmF3IHRyZWUgZGF0YS4gdXNlZnVsIGZvciBhZGRpbmdcbiAgICogQHB1YmxpY1xuICAgKiAhISBERVBSRUNBVEVEICEhXG4gICAqL1xuICB0aGlzLnNldFRyZWUgPSBmdW5jdGlvbiAobmV3VHJlZSwgd2hlcmUpIHtcbiAgICBpZiAoIXdoZXJlKSB7XG4gICAgICB3aGVyZSA9IHJvb3RUcmVlO1xuICAgIH1cbiAgICByZXR1cm4gYXR0YWNoRGF0YSh3aGVyZSwgbmV3VHJlZSk7XG4gIH07XG5cbiAgLyogbm9uLXJlY3Vyc2l2ZSBzZWFyY2ggZnVuY3Rpb25cbiAgKiBbIG5vZGVzIHwgb2JqZWN0cyBdID0gUlRyZWUuc2VhcmNoKHJlY3RhbmdsZSwgW3JldHVybiBub2RlIGRhdGFdLCBbYXJyYXkgdG8gZmlsbF0pXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHRoaXMuc2VhcmNoID0gZnVuY3Rpb24gKHJlY3QsIHJldHVybk5vZGUsIHJldHVybkFycmF5KSB7XG4gICAgcmV0dXJuQXJyYXkgPSByZXR1cm5BcnJheSB8fCBbXTtcbiAgICByZXR1cm4gc2VhcmNoU3VidHJlZShyZWN0LCByZXR1cm5Ob2RlLCByZXR1cm5BcnJheSwgcm9vdFRyZWUpO1xuICB9O1xuXG4gIHRoaXMuZmluZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmQoaWQsIHJvb3RUcmVlKTtcbiAgfVxuXG4gIHRoaXMuX2ZpbmQgPSBmdW5jdGlvbihpZCwgdHJlZSkge1xuICAgIGlmKCB0cmVlLmxlYWYgKSB7XG4gICAgICBpZiggdHJlZS5sZWFmLnByb3BlcnRpZXMuaWQgPT09IGlkICkgcmV0dXJuIHRyZWU7XG4gICAgfVxuXG4gICAgaWYoICF0cmVlLm5vZGVzICkgcmV0dXJuO1xuXG4gICAgdmFyIHJlc3VsdDtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRyZWUubm9kZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl9maW5kKGlkLCB0cmVlLm5vZGVzW2ldKTtcbiAgICAgIGlmKCByZXN1bHQgKSByZXR1cm4gcmVzdWx0OyBcbiAgICB9XG4gIH1cblxuXG4gIHZhciByZW1vdmVBcmVhID0gZnVuY3Rpb24gKHJlY3QpIHtcbiAgICB2YXIgbnVtYmVyRGVsZXRlZCA9IDEsXG4gICAgcmV0QXJyYXkgPSBbXSxcbiAgICBkZWxldGVkO1xuICAgIHdoaWxlIChudW1iZXJEZWxldGVkID4gMCkge1xuICAgICAgZGVsZXRlZCA9IHJlbW92ZVN1YnRyZWUocmVjdCwgZmFsc2UsIHJvb3RUcmVlKTtcbiAgICAgIG51bWJlckRlbGV0ZWQgPSBkZWxldGVkLmxlbmd0aDtcbiAgICAgIHJldEFycmF5ID0gcmV0QXJyYXkuY29uY2F0KGRlbGV0ZWQpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0QXJyYXk7XG4gIH07XG5cbiAgdmFyIHJlbW92ZU9iaiA9IGZ1bmN0aW9uIChyZWN0LCBvYmopIHtcbiAgICB2YXIgcmV0QXJyYXkgPSByZW1vdmVTdWJ0cmVlKHJlY3QsIG9iaiwgcm9vdFRyZWUpO1xuICAgIHJldHVybiByZXRBcnJheTtcbiAgfTtcbiAgICAvKiBub24tcmVjdXJzaXZlIGRlbGV0ZSBmdW5jdGlvblxuICAgKiBbZGVsZXRlZCBvYmplY3RdID0gUlRyZWUucmVtb3ZlKHJlY3RhbmdsZSwgW29iamVjdCB0byBkZWxldGVdKVxuICAgKi9cbiAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbiAocmVjdCwgb2JqKSB7XG4gICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHJlbW92ZUFyZWEocmVjdCwgb2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlbW92ZU9iaihyZWN0LCBvYmopO1xuICAgIH1cbiAgfTtcblxuICAvKiBub24tcmVjdXJzaXZlIGluc2VydCBmdW5jdGlvblxuICAgKiBbXSA9IFJUcmVlLmluc2VydChyZWN0YW5nbGUsIG9iamVjdCB0byBpbnNlcnQpXG4gICAqL1xuICB0aGlzLmluc2VydCA9IGZ1bmN0aW9uIChyZWN0LCBvYmopIHtcbiAgICB2YXIgcmV0QXJyYXkgPSBpbnNlcnRTdWJ0cmVlKHt4OiByZWN0LngsIHk6IHJlY3QueSwgdzogcmVjdC53LCBoOiByZWN0LmgsIGxlYWY6IG9ian0sIHJvb3RUcmVlKTtcbiAgICByZXR1cm4gcmV0QXJyYXk7XG4gIH07XG59XG5SVHJlZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKHByaW50aW5nKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnJvb3QsIGZhbHNlLCBwcmludGluZyk7XG59O1xuXG5SVHJlZS5mcm9tSlNPTiA9IGZ1bmN0aW9uIChqc29uKSB7XG4gIHZhciBydCA9IG5ldyBSVHJlZSgpO1xuICBydC5zZXRUcmVlKEpTT04ucGFyc2UoanNvbikpO1xuICByZXR1cm4gcnQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJUcmVlO1xuXG5cbi8qKlxuICogUG9seWZpbGwgZm9yIHRoZSBBcnJheS5pc0FycmF5IGZ1bmN0aW9uXG4gKiB0b2RvOiBUZXN0IG9uIElFNyBhbmQgSUU4XG4gKiBUYWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9nZXJhaW50bHVmZi90djQvaXNzdWVzLzIwXG4gKi9cbmlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSAhPT0gJ2Z1bmN0aW9uJykge1xuICBBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gdHlwZW9mIGEgPT09ICdvYmplY3QnICYmIHt9LnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG59XG4iLCJmdW5jdGlvbiBDYW52YXNGZWF0dXJlKGdlb2pzb24sIGlkKSB7XG4gICAgXG4gICAgLy8gcmFkaXVzIGZvciBwb2ludCBmZWF0dXJlc1xuICAgIC8vIHVzZSB0byBjYWxjdWxhdGUgbW91c2Ugb3Zlci9vdXQgYW5kIGNsaWNrIGV2ZW50cyBmb3IgcG9pbnRzXG4gICAgLy8gdGhpcyB2YWx1ZSBzaG91bGQgbWF0Y2ggdGhlIHZhbHVlIHVzZWQgZm9yIHJlbmRlcmluZyBwb2ludHNcbiAgICB0aGlzLnNpemUgPSA1O1xuICAgIHRoaXMuaXNQb2ludCA9IGZhbHNlO1xuXG4gICAgLy8gVXNlciBzcGFjZSBvYmplY3QgZm9yIHN0b3JlIHZhcmlhYmxlcyB1c2VkIGZvciByZW5kZXJpbmcgZ2VvbWV0cnlcbiAgICB0aGlzLnJlbmRlciA9IHt9O1xuXG4gICAgdmFyIGNhY2hlID0ge1xuICAgICAgICAvLyBwcm9qZWN0ZWQgcG9pbnRzIG9uIGNhbnZhc1xuICAgICAgICBjYW52YXNYWSA6IG51bGwsXG4gICAgICAgIC8vIHpvb20gbGV2ZWwgY2FudmFzWFkgcG9pbnRzIGFyZSBjYWxjdWxhdGVkIHRvXG4gICAgICAgIHpvb20gOiAtMVxuICAgIH1cbiAgICBcbiAgICAvLyBwZXJmb3JtYW5jZSBmbGFnLCB3aWxsIGtlZXAgaW52aXNpYmxlIGZlYXR1cmVzIGZvciByZWNhbGMgXG4gICAgLy8gZXZlbnRzIGFzIHdlbGwgYXMgbm90IGJlaW5nIHJlbmRlcmVkXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICBcbiAgICAvLyBib3VuZGluZyBib3ggZm9yIGdlb21ldHJ5LCB1c2VkIGZvciBpbnRlcnNlY3Rpb24gYW5kXG4gICAgLy8gdmlzaWJsaWxpdHkgb3B0aW1pemF0aW9uc1xuICAgIHRoaXMuYm91bmRzID0gbnVsbDtcbiAgICBcbiAgICAvLyBMZWFmbGV0IExhdExuZywgdXNlZCBmb3IgcG9pbnRzIHRvIHF1aWNrbHkgbG9vayBmb3IgaW50ZXJzZWN0aW9uXG4gICAgdGhpcy5sYXRsbmcgPSBudWxsO1xuICAgIFxuICAgIC8vIGNsZWFyIHRoZSBjYW52YXNYWSBzdG9yZWQgdmFsdWVzXG4gICAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGRlbGV0ZSBjYWNoZS5jYW52YXNYWTtcbiAgICAgICAgY2FjaGUuem9vbSA9IC0xO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnNldENhbnZhc1hZID0gZnVuY3Rpb24oY2FudmFzWFksIHpvb20sIGxheWVyKSB7XG4gICAgICAgIGNhY2hlLmNhbnZhc1hZID0gY2FudmFzWFk7XG4gICAgICAgIGNhY2hlLnpvb20gPSB6b29tO1xuXG4gICAgICAgIGlmKCB0aGlzLmlzUG9pbnQgKSB0aGlzLnVwZGF0ZVBvaW50SW5SVHJlZShsYXllcik7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZ2V0Q2FudmFzWFkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlLmNhbnZhc1hZO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnJlcXVpcmVzUmVwcm9qZWN0aW9uID0gZnVuY3Rpb24oem9vbSkge1xuICAgICAgaWYoIGNhY2hlLnpvb20gPT0gem9vbSAmJiBjYWNoZS5jYW52YXNYWSApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVQb2ludEluUlRyZWUgPSBmdW5jdGlvbihsYXllcikge1xuICAgICAgICB2YXIgY29vcmRzID0gdGhpcy5nZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICB2YXIgZHBwID0gbGF5ZXIuZ2V0RGVncmVlc1BlclB4KFtjb29yZHNbMV0sIGNvb3Jkc1swXV0pO1xuXG4gICAgICAgIGlmKCB0aGlzLl9ydHJlZUdlb2pzb24gKSB7XG4gICAgICAgICAgICB2YXIgclRyZWVDb29yZHMgPSB0aGlzLl9ydHJlZUdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gbGF5ZXIuclRyZWUucmVtb3ZlKFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgeCA6IHJUcmVlQ29vcmRzWzBdWzBdWzBdIC0gMSxcbiAgICAgICAgICAgICAgICAgICAgeSA6IHJUcmVlQ29vcmRzWzBdWzFdWzFdIC0gMSxcbiAgICAgICAgICAgICAgICAgICAgdyA6IE1hdGguYWJzKHJUcmVlQ29vcmRzWzBdWzBdWzBdIC0gclRyZWVDb29yZHNbMF1bMV1bMF0pICsgMixcbiAgICAgICAgICAgICAgICAgICAgaCA6IE1hdGguYWJzKHJUcmVlQ29vcmRzWzBdWzFdWzFdIC0gclRyZWVDb29yZHNbMF1bMl1bMV0pICsgMlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGhpcy5fcnRyZWVHZW9qc29uXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYoIHJlc3VsdC5sZW5ndGggPT09IDAgKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdVbmFibGUgdG8gZmluZDogJyt0aGlzLl9ydHJlZUdlb2pzb24uZ2VvbWV0cnkucHJvcGVydGllcy5pZCsnIGluIHJUcmVlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9mZnNldCA9IGRwcCAqICh0aGlzLnNpemUgLyAyKTtcblxuICAgICAgICB2YXIgbGVmdCA9IGNvb3Jkc1swXSAtIG9mZnNldDtcbiAgICAgICAgdmFyIHRvcCA9IGNvb3Jkc1sxXSArIG9mZnNldDtcbiAgICAgICAgdmFyIHJpZ2h0ID0gY29vcmRzWzBdICsgb2Zmc2V0O1xuICAgICAgICB2YXIgYm90dG9tID0gY29vcmRzWzFdIC0gb2Zmc2V0O1xuXG4gICAgICAgIHRoaXMuX3J0cmVlR2VvanNvbiA9IHtcbiAgICAgICAgICAgIHR5cGUgOiAnRmVhdHVyZScsXG4gICAgICAgICAgICBnZW9tZXRyeSA6IHtcbiAgICAgICAgICAgICAgICB0eXBlIDogJ1BvbHlnb24nLFxuICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzIDogW1tcbiAgICAgICAgICAgICAgICAgICAgW2xlZnQsIHRvcF0sXG4gICAgICAgICAgICAgICAgICAgIFtyaWdodCwgdG9wXSxcbiAgICAgICAgICAgICAgICAgICAgW3JpZ2h0LCBib3R0b21dLFxuICAgICAgICAgICAgICAgICAgICBbbGVmdCwgYm90dG9tXSxcbiAgICAgICAgICAgICAgICAgICAgW2xlZnQsIHRvcF1cbiAgICAgICAgICAgICAgICBdXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb3BlcnRpZXMgOiB7XG4gICAgICAgICAgICAgICAgaWQgOiB0aGlzLmlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsYXllci5yVHJlZS5nZW9KU09OKHRoaXMuX3J0cmVlR2VvanNvbik7XG4gICAgfVxuXG4gICAgLy8gb3B0aW9uYWwsIHBlciBmZWF0dXJlLCByZW5kZXJlclxuICAgIHRoaXMucmVuZGVyZXIgPSBudWxsO1xuXG4gICAgLy8gZ2VvanNvbiB3YXMgb3B0aW9ucyBvYmplY3RcbiAgICBpZiggZ2VvanNvbi5nZW9qc29uICkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyID0gZ2VvanNvbi5yZW5kZXJlcjtcbiAgICAgICAgaWYoIGdlb2pzb24uc2l6ZSApIHRoaXMuc2l6ZSA9IGdlb2pzb24uc2l6ZTtcbiAgICAgICAgZ2VvanNvbiA9IGdlb2pzb24uZ2VvanNvbjtcbiAgICB9XG4gICAgXG4gICAgaWYoIGdlb2pzb24uZ2VvbWV0cnkgKSB7XG4gICAgICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgICAgIHRoaXMuaWQgPSBpZCB8fCBnZW9qc29uLnByb3BlcnRpZXMuaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5nZW9qc29uID0ge1xuICAgICAgICAgICAgdHlwZSA6ICdGZWF0dXJlJyxcbiAgICAgICAgICAgIGdlb21ldHJ5IDogZ2VvanNvbixcbiAgICAgICAgICAgIHByb3BlcnRpZXMgOiB7XG4gICAgICAgICAgICAgICAgaWQgOiBpZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcbiAgICB9XG5cbiAgICAvLyBwb2ludHMgaGF2ZSB0byBiZSByZXByb2plY3RlZCB3LyBidWZmZXIgYWZ0ZXIgem9vbVxuICAgIGlmKCB0aGlzLmdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PT0gJ1BvaW50JyApIHtcbiAgICAgICAgdGhpcy5pc1BvaW50ID0gdHJ1ZTsgXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcnRyZWVHZW9qc29uID0ge1xuICAgICAgICAgICAgdHlwZSA6ICdGZWF0dXJlJyxcbiAgICAgICAgICAgIGdlb21ldHJ5IDogdGhpcy5nZW9qc29uLmdlb21ldHJ5LFxuICAgICAgICAgICAgcHJvcGVydGllcyA6IHtcbiAgICAgICAgICAgICAgICBpZCA6IGlkIHx8IHRoaXMuZ2VvanNvbi5wcm9wZXJ0aWVzLmlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSB0aGlzLmdlb2pzb24uZ2VvbWV0cnkudHlwZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNGZWF0dXJlOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9DYW52YXNGZWF0dXJlJyk7XG5cbmZ1bmN0aW9uIENhbnZhc0ZlYXR1cmVzKGdlb2pzb24pIHtcbiAgICAvLyBxdWljayB0eXBlIGZsYWdcbiAgICB0aGlzLmlzQ2FudmFzRmVhdHVyZXMgPSB0cnVlO1xuICAgIFxuICAgIHRoaXMuY2FudmFzRmVhdHVyZXMgPSBbXTtcbiAgICBcbiAgICAvLyBhY3R1YWwgZ2VvanNvbiBvYmplY3QsIHdpbGwgbm90IGJlIG1vZGlmZWQsIGp1c3Qgc3RvcmVkXG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICBcbiAgICAvLyBwZXJmb3JtYW5jZSBmbGFnLCB3aWxsIGtlZXAgaW52aXNpYmxlIGZlYXR1cmVzIGZvciByZWNhbGMgXG4gICAgLy8gZXZlbnRzIGFzIHdlbGwgYXMgbm90IGJlaW5nIHJlbmRlcmVkXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmNhbnZhc0ZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNGZWF0dXJlc1tpXS5jbGVhckNhY2hlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIHRoaXMuZ2VvanNvbiApIHtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmdlb2pzb24uZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzLnB1c2gobmV3IENhbnZhc0ZlYXR1cmUodGhpcy5nZW9qc29uLmZlYXR1cmVzW2ldKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRmVhdHVyZXM7IiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZXMnKTtcblxuZnVuY3Rpb24gZmFjdG9yeShhcmcpIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheShhcmcpICkge1xuICAgICAgICByZXR1cm4gYXJnLm1hcChnZW5lcmF0ZSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBnZW5lcmF0ZShhcmcpO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZShnZW9qc29uKSB7XG4gICAgaWYoIGdlb2pzb24udHlwZSA9PT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJyApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNGZWF0dXJlcyhnZW9qc29uKTtcbiAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlJyApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNGZWF0dXJlKGdlb2pzb24pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIEdlb0pTT046ICcrZ2VvanNvbi50eXBlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5OyIsInZhciBjdHg7XG5cbi8qKlxuICogRnVjdGlvbiBjYWxsZWQgaW4gc2NvcGUgb2YgQ2FudmFzRmVhdHVyZVxuICovXG5mdW5jdGlvbiByZW5kZXIoY29udGV4dCwgeHlQb2ludHMsIG1hcCwgY2FudmFzRmVhdHVyZSkge1xuICAgIGN0eCA9IGNvbnRleHQ7XG4gICAgXG4gICAgaWYoIGNhbnZhc0ZlYXR1cmUudHlwZSA9PT0gJ1BvaW50JyApIHtcbiAgICAgICAgcmVuZGVyUG9pbnQoeHlQb2ludHMsIHRoaXMuc2l6ZSk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgcmVuZGVyTGluZSh4eVBvaW50cyk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdQb2x5Z29uJyApIHtcbiAgICAgICAgcmVuZGVyUG9seWdvbih4eVBvaW50cyk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgICB4eVBvaW50cy5mb3JFYWNoKHJlbmRlclBvbHlnb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyUG9pbnQoeHlQb2ludCwgc2l6ZSkge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgIGN0eC5hcmMoeHlQb2ludC54LCB4eVBvaW50LnksIHNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbic7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTGluZSh4eVBvaW50cykge1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnO1xuICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuXG4gICAgdmFyIGo7XG4gICAgY3R4Lm1vdmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcbiAgICBmb3IoIGogPSAxOyBqIDwgeHlQb2ludHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGN0eC5saW5lVG8oeHlQb2ludHNbal0ueCwgeHlQb2ludHNbal0ueSk7XG4gICAgfVxuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBvbHlnb24oeHlQb2ludHMpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LCAxNTIsIDAsLjgpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcblxuICAgIHZhciBqO1xuICAgIGN0eC5tb3ZlVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG4gICAgZm9yKCBqID0gMTsgaiA8IHh5UG9pbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjdHgubGluZVRvKHh5UG9pbnRzW2pdLngsIHh5UG9pbnRzW2pdLnkpO1xuICAgIH1cbiAgICBjdHgubGluZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlcycpO1xuXG5mdW5jdGlvbiBDYW52YXNMYXllcigpIHtcbiAgLy8gc2hvdyBsYXllciB0aW1pbmdcbiAgdGhpcy5kZWJ1ZyA9IGZhbHNlO1xuXG4gIC8vIGluY2x1ZGUgZXZlbnRzXG4gIHRoaXMuaW5jbHVkZXMgPSBbTC5NaXhpbi5FdmVudHNdO1xuXG4gIC8vIGdlb21ldHJ5IGhlbHBlcnNcbiAgdGhpcy51dGlscyA9IHJlcXVpcmUoJy4vbGliL3V0aWxzJyk7XG5cbiAgLy8gcmVjb21tZW5kZWQgeW91IG92ZXJyaWRlIHRoaXMuICB5b3UgY2FuIGFsc28gc2V0IGEgY3VzdG9tIHJlbmRlcmVyXG4gIC8vIGZvciBlYWNoIENhbnZhc0ZlYXR1cmUgaWYgeW91IHdpc2hcbiAgdGhpcy5yZW5kZXJlciA9IHJlcXVpcmUoJy4vZGVmYXVsdFJlbmRlcmVyJyk7XG5cbiAgdGhpcy5nZXRDYW52YXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xuICB9O1xuXG4gIHRoaXMuZHJhdyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfTtcblxuICB0aGlzLmFkZFRvID0gZnVuY3Rpb24gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHJlc2V0IGFjdHVhbCBjYW52YXMgc2l6ZVxuICAgIHZhciBzaXplID0gdGhpcy5fbWFwLmdldFNpemUoKTtcbiAgICB0aGlzLl9jYW52YXMud2lkdGggPSBzaXplLng7XG4gICAgdGhpcy5fY2FudmFzLmhlaWdodCA9IHNpemUueTtcbiAgfTtcblxuICAvLyBjbGVhciBjYW52YXNcbiAgdGhpcy5jbGVhckNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG5cbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhpcyBpcyBjYWxsZWQgYWZ0ZXIuLi5cbiAgICB0aGlzLnJlcG9zaXRpb24oKTtcbiAgfVxuXG4gIHRoaXMucmVwb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b3BMZWZ0ID0gdGhpcy5fbWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnRvcCA9IHRvcExlZnQueSsncHgnO1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS5sZWZ0ID0gdG9wTGVmdC54KydweCc7XG4gICAgLy9MLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB0b3BMZWZ0KTtcbiAgfVxuXG4gIC8vIGNsZWFyIGVhY2ggZmVhdHVyZXMgY2FjaGVcbiAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8ga2lsbCB0aGUgZmVhdHVyZSBwb2ludCBjYWNoZVxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBnZXQgbGF5ZXIgZmVhdHVyZSB2aWEgZ2VvanNvbiBvYmplY3RcbiAgdGhpcy5nZXRDYW52YXNGZWF0dXJlQnlJZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuZmVhdHVyZUluZGV4W2lkXTtcbiAgfVxuXG4gIC8vIGdldCB0aGUgbWV0ZXJzIHBlciBweCBhbmQgYSBjZXJ0YWluIHBvaW50O1xuICB0aGlzLmdldE1ldGVyc1BlclB4ID0gZnVuY3Rpb24obGF0bG5nKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubWV0ZXJzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICB9XG5cbiAgdGhpcy5nZXREZWdyZWVzUGVyUHggPSBmdW5jdGlvbihsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5kZWdyZWVzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICB9XG59O1xuXG52YXIgbGF5ZXIgPSBuZXcgQ2FudmFzTGF5ZXIoKTtcblxuXG5yZXF1aXJlKCcuL2xpYi9pbml0JykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvcmVkcmF3JykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvYWRkRmVhdHVyZScpKGxheWVyKTtcbnJlcXVpcmUoJy4vbGliL3RvQ2FudmFzWFknKShsYXllcik7XG5cbkwuQ2FudmFzRmVhdHVyZUZhY3RvcnkgPSByZXF1aXJlKCcuL2NsYXNzZXMvZmFjdG9yeScpO1xuTC5DYW52YXNGZWF0dXJlID0gQ2FudmFzRmVhdHVyZTtcbkwuQ2FudmFzRmVhdHVyZUNvbGxlY3Rpb24gPSBDYW52YXNGZWF0dXJlcztcbkwuQ2FudmFzR2VvanNvbkxheWVyID0gTC5DbGFzcy5leHRlbmQobGF5ZXIpO1xuIiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4uL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICBsYXllci5hZGRDYW52YXNGZWF0dXJlcyA9IGZ1bmN0aW9uKGZlYXR1cmVzKSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuYWRkQ2FudmFzRmVhdHVyZShmZWF0dXJlc1tpXSwgZmFsc2UsIG51bGwsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlYnVpbGRJbmRleCh0aGlzLmZlYXR1cmVzKTtcbiAgfTtcblxuICBsYXllci5hZGRDYW52YXNGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSwgYm90dG9tLCBjYWxsYmFjaykge1xuICAgIGlmKCAhKGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlKSAmJiAhKGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlcykgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZlYXR1cmUgbXVzdCBiZSBpbnN0YW5jZSBvZiBDYW52YXNGZWF0dXJlIG9yIENhbnZhc0ZlYXR1cmVzJyk7XG4gICAgfVxuXG4gICAgaWYoIGJvdHRvbSApIHsgLy8gYm90dG9tIG9yIGluZGV4XG4gICAgICBpZiggdHlwZW9mIGJvdHRvbSA9PT0gJ251bWJlcicpIHRoaXMuZmVhdHVyZXMuc3BsaWNlKGJvdHRvbSwgMCwgZmVhdHVyZSk7XG4gICAgICBlbHNlIHRoaXMuZmVhdHVyZXMudW5zaGlmdChmZWF0dXJlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mZWF0dXJlcy5wdXNoKGZlYXR1cmUpO1xuICAgIH1cblxuICAgIHRoaXMuZmVhdHVyZUluZGV4W2ZlYXR1cmUuaWRdID0gZmVhdHVyZTtcblxuICAgIHRoaXMuYWRkVG9JbmRleChmZWF0dXJlKTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmVhdHVyZXNbaV0ub3JkZXIgPSBpO1xuICAgIH1cbiAgfSxcblxuICAvLyByZXR1cm5zIHRydWUgaWYgcmUtcmVuZGVyIHJlcXVpcmVkLiAgaWUgdGhlIGZlYXR1cmUgd2FzIHZpc2libGU7XG4gIGxheWVyLnJlbW92ZUNhbnZhc0ZlYXR1cmUgPSBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5mZWF0dXJlcy5pbmRleE9mKGZlYXR1cmUpO1xuICAgIGlmKCBpbmRleCA9PSAtMSApIHJldHVybjtcblxuICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHRoaXMucmVidWlsZEluZGV4KHRoaXMuZmVhdHVyZXMpO1xuXG4gICAgaWYoIHRoaXMuZmVhdHVyZS52aXNpYmxlICkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICBcbiAgbGF5ZXIucmVtb3ZlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IHRydWU7XG4gICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICAgIHRoaXMucmVidWlsZEluZGV4KHRoaXMuZmVhdHVyZXMpO1xuICB9XG59IiwidmFyIGludGVyc2VjdFV0aWxzID0gcmVxdWlyZSgnLi9pbnRlcnNlY3RzJyk7XG52YXIgUlRyZWUgPSByZXF1aXJlKCdydHJlZScpO1xudmFyIGNvdW50ID0gMDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgIFxuICAgIGxheWVyLmluaXRpYWxpemUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc2hvd2luZyA9IHRydWU7XG5cbiAgICAgICAgLy8gbGlzdCBvZiBnZW9qc29uIGZlYXR1cmVzIHRvIGRyYXdcbiAgICAgICAgLy8gICAtIHRoZXNlIHdpbGwgZHJhdyBpbiBvcmRlclxuICAgICAgICB0aGlzLmZlYXR1cmVzID0gW107XG4gICAgICAgIC8vIGxvb2t1cCBpbmRleFxuICAgICAgICB0aGlzLmZlYXR1cmVJbmRleCA9IHt9O1xuXG4gICAgICAgIC8vIGxpc3Qgb2YgY3VycmVudCBmZWF0dXJlcyB1bmRlciB0aGUgbW91c2VcbiAgICAgICAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gW107XG5cbiAgICAgICAgLy8gdXNlZCB0byBjYWxjdWxhdGUgcGl4ZWxzIG1vdmVkIGZyb20gY2VudGVyXG4gICAgICAgIHRoaXMubGFzdENlbnRlckxMID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgd29ya1xuICAgICAgICB0aGlzLmFsbG93UGFuUmVuZGVyaW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gc2V0IG9wdGlvbnNcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIG1vdmUgbW91c2UgZXZlbnQgaGFuZGxlcnMgdG8gbGF5ZXIgc2NvcGVcbiAgICAgICAgdmFyIG1vdXNlRXZlbnRzID0gWydvbk1vdXNlT3ZlcicsICdvbk1vdXNlTW92ZScsICdvbk1vdXNlT3V0JywgJ29uQ2xpY2snXTtcbiAgICAgICAgbW91c2VFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGlmKCAhdGhpcy5vcHRpb25zW2VdICkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpc1tlXSA9IHRoaXMub3B0aW9uc1tlXTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnNbZV07XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5yVHJlZSA9IG5ldyBSVHJlZSgpO1xuXG4gICAgICAgIC8vIHNldCBjYW52YXMgYW5kIGNhbnZhcyBjb250ZXh0IHNob3J0Y3V0c1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBjcmVhdGVDYW52YXMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2N0eCA9IHRoaXMuX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH07XG5cbiAgICBpbnRlcnNlY3RVdGlscyhsYXllcik7XG4gICAgXG4gICAgbGF5ZXIub25BZGQgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuXG4gICAgICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAgICAgLy8gdGhlIGNvbnRhaW5lciBpcyBtb3ZlZCBpbiB0aGUgb3Bvc2l0ZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgICAgIC8vIG1hcCBwYW5lIHRvIGtlZXAgdGhlIGNhbnZhcyBhbHdheXMgaW4gKDAsIDApXG4gICAgICAgIC8vdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcbiAgICAgICAgdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy5tYXJrZXJQYW5lO1xuICAgICAgICB2YXIgX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWxheWVyLScrY291bnQpO1xuICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgIF9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fY2FudmFzKTtcbiAgICAgICAgdGlsZVBhbmUuYXBwZW5kQ2hpbGQoX2NvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgICAgICAvLyBoYWNrOiBsaXN0ZW4gdG8gcHJlZHJhZyBldmVudCBsYXVuY2hlZCBieSBkcmFnZ2luZyB0b1xuICAgICAgICAvLyBzZXQgY29udGFpbmVyIGluIHBvc2l0aW9uICgwLCAwKSBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICAgICAgLy8gaWYgKG1hcC5kcmFnZ2luZy5lbmFibGVkKCkpIHtcbiAgICAgICAgLy8gICAgIG1hcC5kcmFnZ2luZy5fZHJhZ2dhYmxlLm9uKCdwcmVkcmFnJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICAgICAgdmFyIGQgPSBtYXAuZHJhZ2dpbmcuX2RyYWdnYWJsZTtcbiAgICAgICAgLy8gICAgICAgICBMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB7IHg6IC1kLl9uZXdQb3MueCwgeTogLWQuX25ld1Bvcy55IH0pO1xuICAgICAgICAvLyAgICAgfSwgdGhpcyk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBtYXAub24oe1xuICAgICAgICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLm9uUmVzaXplLFxuICAgICAgICAgICAgJ3Jlc2l6ZScgICAgOiB0aGlzLm9uUmVzaXplLFxuICAgICAgICAgICAgJ3pvb21zdGFydCcgOiBzdGFydFpvb20sXG4gICAgICAgICAgICAnem9vbWVuZCcgICA6IGVuZFpvb20sXG4gICAgICAgIC8vICAgICdtb3Zlc3RhcnQnIDogbW92ZVN0YXJ0LFxuICAgICAgICAgICAgJ21vdmVlbmQnICAgOiBtb3ZlRW5kLFxuICAgICAgICAgICAgJ21vdXNlbW92ZScgOiB0aGlzLmludGVyc2VjdHMsXG4gICAgICAgICAgICAnY2xpY2snICAgICA6IHRoaXMuaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcblxuICAgICAgICBpZiggdGhpcy56SW5kZXggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0WkluZGV4KHRoaXMuekluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsYXllci5vblJlbW92ZSA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgICBtYXAub2ZmKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5vblJlc2l6ZSxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5vblJlc2l6ZSxcbiAgICAgICAgIC8vICAgJ21vdmVzdGFydCcgOiBtb3ZlU3RhcnQsXG4gICAgICAgICAgICAnbW92ZWVuZCcgICA6IG1vdmVFbmQsXG4gICAgICAgICAgICAnem9vbXN0YXJ0JyA6IHN0YXJ0Wm9vbSxcbiAgICAgICAgICAgICd6b29tZW5kJyAgIDogZW5kWm9vbSxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogdGhpcy5pbnRlcnNlY3RzLFxuICAgICAgICAgICAgJ2NsaWNrJyAgICAgOiB0aGlzLmludGVyc2VjdHNcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIHJlc2l6ZVRpbWVyID0gLTE7XG4gICAgbGF5ZXIub25SZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoIHJlc2l6ZVRpbWVyICE9PSAtMSApIGNsZWFyVGltZW91dChyZXNpemVUaW1lcik7XG5cbiAgICAgICAgcmVzaXplVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXNpemVUaW1lciA9IC0xO1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDEwMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDYW52YXMob3B0aW9ucykge1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGNhbnZhcy5zdHlsZS50b3AgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICBjYW52YXMuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICAgIGNhbnZhcy5zdHlsZS56SW5kZXggPSBvcHRpb25zLnpJbmRleCB8fCAwO1xuICAgIHZhciBjbGFzc05hbWUgPSAnbGVhZmxldC10aWxlLWNvbnRhaW5lciBsZWFmbGV0LXpvb20tYW5pbWF0ZWQnO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gY2FudmFzO1xufVxuXG5mdW5jdGlvbiBzdGFydFpvb20oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB0aGlzLnpvb21pbmcgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBlbmRab29tKCkge1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xuICAgIHNldFRpbWVvdXQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgNTApO1xufVxuXG5mdW5jdGlvbiBtb3ZlU3RhcnQoKSB7XG4gICAgaWYoIHRoaXMubW92aW5nICkgcmV0dXJuO1xuICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICBcbiAgICAvL2lmKCAhdGhpcy5hbGxvd1BhblJlbmRlcmluZyApIHJldHVybjtcbiAgICByZXR1cm47XG4gICAgLy8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbn1cblxuZnVuY3Rpb24gbW92ZUVuZChlKSB7XG4gICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcihlKTtcbn07XG5cbmZ1bmN0aW9uIGZyYW1lUmVuZGVyKCkge1xuICAgIGlmKCAhdGhpcy5tb3ZpbmcgKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgXG4gICAgaWYoIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCA+IDc1ICkge1xuICAgICAgICBpZiggdGhpcy5kZWJ1ZyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNhYmxlZCByZW5kZXJpbmcgd2hpbGUgcGFuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKCAhdGhpcy5tb3ZpbmcgKSByZXR1cm47XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWVSZW5kZXIuYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpLCA3NTApO1xufSIsInZhciBSVHJlZSA9IHJlcXVpcmUoJ3J0cmVlJyk7XG5cblxuLyoqIFxuICogSGFuZGxlIG1vdXNlIGludGVyc2VjdGlvbiBldmVudHNcbiAqIGUgLSBsZWFmbGV0IGV2ZW50XG4gKiovXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGUpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIHZhciBkcHAgPSB0aGlzLmdldERlZ3JlZXNQZXJQeChlLmxhdGxuZyk7XG5cbiAgICB2YXIgbXBwID0gdGhpcy5nZXRNZXRlcnNQZXJQeChlLmxhdGxuZyk7XG4gICAgdmFyIHIgPSBtcHAgKiA1OyAvLyA1IHB4IHJhZGl1cyBidWZmZXI7XG5cbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgdHlwZSA6ICdQb2ludCcsXG4gICAgICBjb29yZGluYXRlcyA6IFtlLmxhdGxuZy5sbmcsIGUubGF0bG5nLmxhdF1cbiAgICB9O1xuXG4gICAgdmFyIGNvbnRhaW5lclBvaW50ID0gZS5jb250YWluZXJQb2ludDtcblxuICAgIHZhciB4MSA9IGUubGF0bG5nLmxuZyAtIGRwcDtcbiAgICB2YXIgeDIgPSBlLmxhdGxuZy5sbmcgKyBkcHA7XG4gICAgdmFyIHkxID0gZS5sYXRsbmcubGF0IC0gZHBwO1xuICAgIHZhciB5MiA9IGUubGF0bG5nLmxhdCArIGRwcDtcblxuICAgIHZhciBpbnRlcnNlY3RzID0gdGhpcy5pbnRlcnNlY3RzQmJveChbW3gxLCB5MV0sIFt4MiwgeTJdXSwgciwgY2VudGVyLCBjb250YWluZXJQb2ludCk7XG5cbiAgICBvbkludGVyc2VjdHNMaXN0Q3JlYXRlZC5jYWxsKHRoaXMsIGUsIGludGVyc2VjdHMpO1xufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RzQmJveChiYm94LCBwcmVjaXNpb24sIGNlbnRlciwgY29udGFpbmVyUG9pbnQpIHtcbiAgICB2YXIgY2xGZWF0dXJlcyA9IFtdO1xuICAgIHZhciBmZWF0dXJlcyA9IHRoaXMuclRyZWUuYmJveChiYm94KTtcbiAgICB2YXIgaSwgZiwgY2xGZWF0dXJlO1xuXG4gICAgZm9yKCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY2xGZWF0dXJlID0gdGhpcy5nZXRDYW52YXNGZWF0dXJlQnlJZChmZWF0dXJlc1tpXS5wcm9wZXJ0aWVzLmlkKTtcbiAgICAgIGlmKCAhY2xGZWF0dXJlLnZpc2libGUgKSBjb250aW51ZTtcbiAgICAgIGNsRmVhdHVyZXMucHVzaChjbEZlYXR1cmUpO1xuICAgIH1cblxuICAgIC8vIG5vdyBtYWtlIHN1cmUgdGhpcyBhY3R1YWxseSBvdmVybGFwIGlmIHByZWNpc2lvbiBpcyBnaXZlblxuICAgIGlmKCBwcmVjaXNpb24gKSB7XG4gICAgICBmb3IoIHZhciBpID0gY2xGZWF0dXJlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgZiA9IGNsRmVhdHVyZXNbaV07XG4gICAgICAgIGlmKCAhdGhpcy51dGlscy5nZW9tZXRyeVdpdGhpblJhZGl1cyhmLl9ydHJlZUdlb2pzb24uZ2VvbWV0cnksIGYuZ2V0Q2FudmFzWFkoKSwgY2VudGVyLCBjb250YWluZXJQb2ludCwgcHJlY2lzaW9uKSApIHtcbiAgICAgICAgICBjbEZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbEZlYXR1cmVzO1xufVxuXG5mdW5jdGlvbiBvbkludGVyc2VjdHNMaXN0Q3JlYXRlZChlLCBpbnRlcnNlY3RzKSB7XG4gIGlmKCBlLnR5cGUgPT0gJ2NsaWNrJyAmJiB0aGlzLm9uQ2xpY2sgKSB7XG4gICAgdGhpcy5vbkNsaWNrKGludGVyc2VjdHMpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBtb3VzZW92ZXIgPSBbXSwgbW91c2VvdXQgPSBbXSwgbW91c2Vtb3ZlID0gW107XG5cbiAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrICkge1xuICAgIGlmKCB0aGlzLmludGVyc2VjdExpc3QuaW5kZXhPZihpbnRlcnNlY3RzW2ldKSA+IC0xICkge1xuICAgICAgbW91c2Vtb3ZlLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgbW91c2VvdmVyLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgfVxuICB9XG5cbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmludGVyc2VjdExpc3QubGVuZ3RoOyBpKysgKSB7XG4gICAgaWYoIGludGVyc2VjdHMuaW5kZXhPZih0aGlzLmludGVyc2VjdExpc3RbaV0pID09IC0xICkge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICBtb3VzZW91dC5wdXNoKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gaW50ZXJzZWN0cztcblxuICBpZiggdGhpcy5vbk1vdXNlT3ZlciAmJiBtb3VzZW92ZXIubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU92ZXIuY2FsbCh0aGlzLCBtb3VzZW92ZXIsIGUpO1xuICBpZiggdGhpcy5vbk1vdXNlTW92ZSApIHRoaXMub25Nb3VzZU1vdmUuY2FsbCh0aGlzLCBtb3VzZW1vdmUsIGUpOyAvLyBhbHdheXMgZmlyZVxuICBpZiggdGhpcy5vbk1vdXNlT3V0ICYmIG1vdXNlb3V0Lmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VPdXQuY2FsbCh0aGlzLCBtb3VzZW91dCwgZSk7XG59XG5cbmZ1bmN0aW9uIHJlYnVpbGQoY2xGZWF0dXJlcykge1xuICB2YXIgZmVhdHVyZXMgPSBbXTtcblxuICBmb3IoIHZhciBpID0gMDsgaSA8IGNsRmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgZmVhdHVyZXMucHVzaChjbEZlYXR1cmVzW2ldLl9ydHJlZUdlb2pzb24pOyBcbiAgICBjbEZlYXR1cmVzW2ldLm9yZGVyID0gaTtcbiAgfVxuXG4gIHRoaXMuclRyZWUgPSBuZXcgUlRyZWUoKTtcbiAgdGhpcy5yVHJlZS5nZW9KU09OKHtcbiAgICB0eXBlIDogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICBmZWF0dXJlcyA6IGZlYXR1cmVzXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGQoY2xGZWF0dXJlKSB7XG4gIGlmKCBjbEZlYXR1cmUuaXNQb2ludCApIHtcbiAgICBjbEZlYXR1cmUudXBkYXRlUG9pbnRJblJUcmVlKHRoaXMpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuclRyZWUuZ2VvSlNPTihjbEZlYXR1cmUuX3J0cmVlR2VvanNvbik7XG4gIH1cbn1cblxuLy8gVE9ETzogbmVlZCB0byBwcm90b3R5cGUgdGhlc2UgZnVuY3Rpb25zXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gIGxheWVyLmludGVyc2VjdHMgPSBpbnRlcnNlY3RzO1xuICBsYXllci5pbnRlcnNlY3RzQmJveCA9IGludGVyc2VjdHNCYm94O1xuICBsYXllci5yZWJ1aWxkSW5kZXggPSByZWJ1aWxkO1xuICBsYXllci5hZGRUb0luZGV4ID0gYWRkO1xufVxuIiwidmFyIHJ1bm5pbmcgPSBmYWxzZTtcbnZhciByZXNjaGVkdWxlID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICBsYXllci5yZW5kZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYoICF0aGlzLmFsbG93UGFuUmVuZGVyaW5nICYmIHRoaXMubW92aW5nICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0LCBkaWZmXG4gICAgaWYoIHRoaXMuZGVidWcgKSB7XG4gICAgICAgIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB9XG5cbiAgICB2YXIgZGlmZiA9IG51bGw7XG4gICAgdmFyIGNlbnRlciA9IHRoaXMuX21hcC5nZXRDZW50ZXIoKTtcblxuICAgIGlmKCBlICYmIGUudHlwZSA9PSAnbW92ZWVuZCcgKSB7XG4gICAgICB2YXIgcHQgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChjZW50ZXIpO1xuXG4gICAgICBpZiggdGhpcy5sYXN0Q2VudGVyTEwgKSB7XG4gICAgICAgIHZhciBsYXN0WHkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludCh0aGlzLmxhc3RDZW50ZXJMTCk7XG4gICAgICAgIGRpZmYgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYeS54IC0gcHQueCxcbiAgICAgICAgICB5IDogbGFzdFh5LnkgLSBwdC55XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgdGhpcy5sYXN0Q2VudGVyTEwgPSBjZW50ZXI7XG5cbiAgICBpZiggIXRoaXMuem9vbWluZyApIHtcbiAgICAgIHRoaXMucmVkcmF3KGRpZmYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgfVxuXG4gIH0sXG4gICAgXG5cbiAgLy8gcmVkcmF3IGFsbCBmZWF0dXJlcy4gIFRoaXMgZG9lcyBub3QgaGFuZGxlIGNsZWFyaW5nIHRoZSBjYW52YXMgb3Igc2V0dGluZ1xuICAvLyB0aGUgY2FudmFzIGNvcnJlY3QgcG9zaXRpb24uICBUaGF0IGlzIGhhbmRsZWQgYnkgcmVuZGVyXG4gIGxheWVyLnJlZHJhdyA9IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIC8vIGlmKCBydW5uaW5nICkge1xuICAgIC8vICAgcmVzY2hlZHVsZSA9IHRydWU7XG4gICAgLy8gICByZXR1cm47XG4gICAgLy8gfVxuICAgIC8vIHJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgLy8gb2JqZWN0cyBzaG91bGQga2VlcCB0cmFjayBvZiBsYXN0IGJib3ggYW5kIHpvb20gb2YgbWFwXG4gICAgLy8gaWYgdGhpcyBoYXNuJ3QgY2hhbmdlZCB0aGUgbGwgLT4gY29udGFpbmVyIHB0IGlzIG5vdCBuZWVkZWRcbiAgICB2YXIgYm91bmRzID0gdGhpcy5fbWFwLmdldEJvdW5kcygpO1xuICAgIHZhciB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcblxuICAgIHZhciBmLCBpLCBzdWJmZWF0dXJlLCBqO1xuICAgIGZvciggaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG5cbiAgICAgIGlmKCBmLmlzQ2FudmFzRmVhdHVyZXMgKSB7XG5cbiAgICAgICAgZm9yKCBqID0gMDsgaiA8IGYuY2FudmFzRmVhdHVyZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgdGhpcy5wcmVwYXJlRm9yUmVkcmF3KGYuY2FudmFzRmVhdHVyZXNbal0sIGJvdW5kcywgem9vbSwgZGlmZik7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcmVwYXJlRm9yUmVkcmF3KGYsIGJvdW5kcywgem9vbSwgZGlmZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGZlYXR1cmVzID0gdGhpcy5pbnRlcnNlY3RzQmJveChbW2JvdW5kcy5nZXRXZXN0KCksIGJvdW5kcy5nZXRTb3V0aCgpXSwgW2JvdW5kcy5nZXRFYXN0KCksIGJvdW5kcy5nZXROb3J0aCgpXV0sIG51bGwsIG51bGwsIG51bGwpO1xuICAgIHRoaXMucmVkcmF3RmVhdHVyZXMoZmVhdHVyZXMpO1xuICB9LFxuXG4gIGxheWVyLnJlZHJhd0ZlYXR1cmVzID0gZnVuY3Rpb24oZmVhdHVyZXMpIHtcbiAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG5cblxuICAgIGZlYXR1cmVzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgICBpZiggYS5vcmRlciA+IGIub3JkZXIgKSByZXR1cm4gMTtcbiAgICAgIGlmKCBhLm9yZGVyIDwgYi5vcmRlciApIHJldHVybiAtMTtcbiAgICAgIHJldHVybiAwO1xuICAgIH0pO1xuICAgIFxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggIWZlYXR1cmVzW2ldLnZpc2libGUgKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVkcmF3RmVhdHVyZShmZWF0dXJlc1tpXSk7XG4gICAgfVxuICB9XG5cbiAgbGF5ZXIucmVkcmF3RmVhdHVyZSA9IGZ1bmN0aW9uKGNhbnZhc0ZlYXR1cmUpIHtcbiAgICAgIHZhciByZW5kZXJlciA9IGNhbnZhc0ZlYXR1cmUucmVuZGVyZXIgPyBjYW52YXNGZWF0dXJlLnJlbmRlcmVyIDogdGhpcy5yZW5kZXJlcjtcbiAgICAgIHZhciB4eSA9IGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKTtcblxuICAgICAgLy8gYmFkbmVzcy4uLlxuICAgICAgaWYoICF4eSApIHJldHVybjtcblxuICAgICAgLy8gY2FsbCBmZWF0dXJlIHJlbmRlciBmdW5jdGlvbiBpbiBmZWF0dXJlIHNjb3BlOyBmZWF0dXJlIGlzIHBhc3NlZCBhcyB3ZWxsXG4gICAgICByZW5kZXJlci5jYWxsKFxuICAgICAgICAgIGNhbnZhc0ZlYXR1cmUsIC8vIHNjb3BlIChjYW52YXMgZmVhdHVyZSlcbiAgICAgICAgICB0aGlzLl9jdHgsICAgICAvLyBjYW52YXMgMmQgY29udGV4dFxuICAgICAgICAgIHh5LCAgICAgICAgICAgIC8vIHh5IHBvaW50cyB0byBkcmF3XG4gICAgICAgICAgdGhpcy5fbWFwLCAgICAgLy8gbGVhZmxldCBtYXAgaW5zdGFuY2VcbiAgICAgICAgICBjYW52YXNGZWF0dXJlICAvLyBjYW52YXMgZmVhdHVyZVxuICAgICAgKTtcbiAgfVxuXG4gIC8vIHJlZHJhdyBhbiBpbmRpdmlkdWFsIGZlYXR1cmVcbiAgbGF5ZXIucHJlcGFyZUZvclJlZHJhdyA9IGZ1bmN0aW9uKGNhbnZhc0ZlYXR1cmUsIGJvdW5kcywgem9vbSwgZGlmZikge1xuICAgIC8vaWYoIGZlYXR1cmUuZ2VvanNvbi5wcm9wZXJ0aWVzLmRlYnVnICkgZGVidWdnZXI7XG5cbiAgICAvLyBpZ25vcmUgYW55dGhpbmcgZmxhZ2dlZCBhcyBoaWRkZW5cbiAgICAvLyB3ZSBkbyBuZWVkIHRvIGNsZWFyIHRoZSBjYWNoZSBpbiB0aGlzIGNhc2VcbiAgICBpZiggIWNhbnZhc0ZlYXR1cmUudmlzaWJsZSApIHtcbiAgICAgIGNhbnZhc0ZlYXR1cmUuY2xlYXJDYWNoZSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBnZW9qc29uID0gY2FudmFzRmVhdHVyZS5nZW9qc29uLmdlb21ldHJ5O1xuXG4gICAgLy8gbm93IGxldHMgY2hlY2sgY2FjaGUgdG8gc2VlIGlmIHdlIG5lZWQgdG8gcmVwcm9qZWN0IHRoZVxuICAgIC8vIHh5IGNvb3JkaW5hdGVzXG4gICAgLy8gYWN0dWFsbHkgcHJvamVjdCB0byB4eSBpZiBuZWVkZWRcbiAgICB2YXIgcmVwcm9qZWN0ID0gY2FudmFzRmVhdHVyZS5yZXF1aXJlc1JlcHJvamVjdGlvbih6b29tKTtcbiAgICBpZiggcmVwcm9qZWN0ICkge1xuICAgICAgdGhpcy50b0NhbnZhc1hZKGNhbnZhc0ZlYXR1cmUsIGdlb2pzb24sIHpvb20pO1xuICAgIH0gIC8vIGVuZCByZXByb2plY3RcblxuICAgIC8vIGlmIHRoaXMgd2FzIGEgc2ltcGxlIHBhbiBldmVudCAoYSBkaWZmIHdhcyBwcm92aWRlZCkgYW5kIHdlIGRpZCBub3QgcmVwcm9qZWN0XG4gICAgLy8gbW92ZSB0aGUgZmVhdHVyZSBieSBkaWZmIHgveVxuICAgIGlmKCBkaWZmICYmICFyZXByb2plY3QgKSB7XG4gICAgICBpZiggZ2VvanNvbi50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgICAgdmFyIHh5ID0gY2FudmFzRmVhdHVyZS5nZXRDYW52YXNYWSgpXG4gICAgICAgIHh5LnggKz0gZGlmZi54O1xuICAgICAgICB4eS55ICs9IGRpZmYueTtcblxuICAgICAgfSBlbHNlIGlmKCBnZW9qc29uLnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuXG4gICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoY2FudmFzRmVhdHVyZS5nZXRDYW52YXNYWSgpLCBkaWZmKTtcblxuICAgICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgIFxuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKSwgZGlmZik7XG4gICAgICBcbiAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgdmFyIHh5ID0gY2FudmFzRmVhdHVyZS5nZXRDYW52YXNYWSgpO1xuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IHh5Lmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoeHlbaV0sIGRpZmYpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgfTtcbn0iLCJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgbGF5ZXIudG9DYW52YXNYWSA9IGZ1bmN0aW9uKGZlYXR1cmUsIGdlb2pzb24sIHpvb20pIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGhhdmUgYSBjYWNoZSBuYW1lc3BhY2UgYW5kIHNldCB0aGUgem9vbSBsZXZlbFxuICAgICAgICBpZiggIWZlYXR1cmUuY2FjaGUgKSBmZWF0dXJlLmNhY2hlID0ge307XG4gICAgICAgIHZhciBjYW52YXNYWTtcblxuICAgICAgICBpZiggZ2VvanNvbi50eXBlID09ICdQb2ludCcgKSB7XG5cbiAgICAgICAgY2FudmFzWFkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgICBnZW9qc29uLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgICAgZ2VvanNvbi5jb29yZGluYXRlc1swXVxuICAgICAgICBdKTtcblxuICAgICAgICBpZiggZmVhdHVyZS5zaXplICkge1xuICAgICAgICAgICAgY2FudmFzWFlbMF0gPSBjYW52YXNYWVswXSAtIGZlYXR1cmUuc2l6ZSAvIDI7XG4gICAgICAgICAgICBjYW52YXNYWVsxXSA9IGNhbnZhc1hZWzFdIC0gZmVhdHVyZS5zaXplIC8gMjtcbiAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiggZ2VvanNvbi50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgICAgIFxuICAgICAgICBjYW52YXNYWSA9IHRoaXMudXRpbHMucHJvamVjdExpbmUoZ2VvanNvbi5jb29yZGluYXRlcywgdGhpcy5fbWFwKTtcbiAgICAgICAgdHJpbUNhbnZhc1hZKGNhbnZhc1hZKTtcbiAgICBcbiAgICAgICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09ICdQb2x5Z29uJyApIHtcbiAgICAgICAgXG4gICAgICAgIGNhbnZhc1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShnZW9qc29uLmNvb3JkaW5hdGVzWzBdLCB0aGlzLl9tYXApO1xuICAgICAgICB0cmltQ2FudmFzWFkoY2FudmFzWFkpO1xuICAgICAgICBcbiAgICAgICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgICAgICAgY2FudmFzWFkgPSBbXTtcbiAgICAgICAgXG4gICAgICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGdlb2pzb24uY29vcmRpbmF0ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICAgICAgdmFyIHh5ID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShnZW9qc29uLmNvb3JkaW5hdGVzW2ldWzBdLCB0aGlzLl9tYXApO1xuICAgICAgICAgICAgICAgIHRyaW1DYW52YXNYWSh4eSk7XG4gICAgICAgICAgICAgICAgY2FudmFzWFkucHVzaCh4eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZlYXR1cmUuc2V0Q2FudmFzWFkoY2FudmFzWFksIHpvb20sIHRoaXMpO1xuICAgIH07XG59XG5cbi8vIGdpdmVuIGFuIGFycmF5IG9mIGdlbyB4eSBjb29yZGluYXRlcywgbWFrZSBzdXJlIGVhY2ggcG9pbnQgaXMgYXQgbGVhc3QgbW9yZSB0aGFuIDFweCBhcGFydFxuZnVuY3Rpb24gdHJpbUNhbnZhc1hZKHh5KSB7XG4gICAgaWYoIHh5Lmxlbmd0aCA9PT0gMCApIHJldHVybjtcbiAgICB2YXIgbGFzdCA9IHh5W3h5Lmxlbmd0aC0xXSwgaSwgcG9pbnQ7XG5cbiAgICB2YXIgYyA9IDA7XG4gICAgZm9yKCBpID0geHkubGVuZ3RoLTI7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICBwb2ludCA9IHh5W2ldO1xuICAgICAgICBpZiggTWF0aC5hYnMobGFzdC54IC0gcG9pbnQueCkgPT09IDAgJiYgTWF0aC5hYnMobGFzdC55IC0gcG9pbnQueSkgPT09IDAgKSB7XG4gICAgICAgICAgICB4eS5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBjKys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsYXN0ID0gcG9pbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggeHkubGVuZ3RoIDw9IDEgKSB7XG4gICAgICAgIHh5LnB1c2gobGFzdCk7XG4gICAgICAgIGMtLTtcbiAgICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBtb3ZlTGluZSA6IGZ1bmN0aW9uKGNvb3JkcywgZGlmZikge1xuICAgIHZhciBpLCBsZW4gPSBjb29yZHMubGVuZ3RoO1xuICAgIGZvciggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgIGNvb3Jkc1tpXS54ICs9IGRpZmYueDtcbiAgICAgIGNvb3Jkc1tpXS55ICs9IGRpZmYueTtcbiAgICB9XG4gIH0sXG5cbiAgcHJvamVjdExpbmUgOiBmdW5jdGlvbihjb29yZHMsIG1hcCkge1xuICAgIHZhciB4eUxpbmUgPSBbXTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgeHlMaW5lLnB1c2gobWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoW1xuICAgICAgICAgIGNvb3Jkc1tpXVsxXSwgY29vcmRzW2ldWzBdXG4gICAgICBdKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHh5TGluZTtcbiAgfSxcblxuICBjYWxjQm91bmRzIDogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgdmFyIHhtaW4gPSBjb29yZHNbMF1bMV07XG4gICAgdmFyIHhtYXggPSBjb29yZHNbMF1bMV07XG4gICAgdmFyIHltaW4gPSBjb29yZHNbMF1bMF07XG4gICAgdmFyIHltYXggPSBjb29yZHNbMF1bMF07XG5cbiAgICBmb3IoIHZhciBpID0gMTsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB4bWluID4gY29vcmRzW2ldWzFdICkgeG1pbiA9IGNvb3Jkc1tpXVsxXTtcbiAgICAgIGlmKCB4bWF4IDwgY29vcmRzW2ldWzFdICkgeG1heCA9IGNvb3Jkc1tpXVsxXTtcblxuICAgICAgaWYoIHltaW4gPiBjb29yZHNbaV1bMF0gKSB5bWluID0gY29vcmRzW2ldWzBdO1xuICAgICAgaWYoIHltYXggPCBjb29yZHNbaV1bMF0gKSB5bWF4ID0gY29vcmRzW2ldWzBdO1xuICAgIH1cblxuICAgIHZhciBzb3V0aFdlc3QgPSBMLmxhdExuZyh4bWluLS4wMSwgeW1pbi0uMDEpO1xuICAgIHZhciBub3J0aEVhc3QgPSBMLmxhdExuZyh4bWF4Ky4wMSwgeW1heCsuMDEpO1xuXG4gICAgcmV0dXJuIEwubGF0TG5nQm91bmRzKHNvdXRoV2VzdCwgbm9ydGhFYXN0KTtcbiAgfSxcblxuICBnZW9tZXRyeVdpdGhpblJhZGl1cyA6IGZ1bmN0aW9uKGdlb21ldHJ5LCB4eVBvaW50cywgY2VudGVyLCB4eVBvaW50LCByYWRpdXMpIHtcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludERpc3RhbmNlKGdlb21ldHJ5LCBjZW50ZXIpIDw9IHJhZGl1cztcbiAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuXG4gICAgICBmb3IoIHZhciBpID0gMTsgaSA8IHh5UG9pbnRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICBpZiggdGhpcy5saW5lSW50ZXJzZWN0c0NpcmNsZSh4eVBvaW50c1tpLTFdLCB4eVBvaW50c1tpXSwgeHlQb2ludCwgMykgKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgfHwgZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJykge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnRJblBvbHlnb24oY2VudGVyLCBnZW9tZXRyeSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIGh0dHA6Ly9tYXRoLnN0YWNrZXhjaGFuZ2UuY29tL3F1ZXN0aW9ucy8yNzU1MjkvY2hlY2staWYtbGluZS1pbnRlcnNlY3RzLXdpdGgtY2lyY2xlcy1wZXJpbWV0ZXJcbiAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRGlzdGFuY2VfZnJvbV9hX3BvaW50X3RvX2FfbGluZVxuICAvLyBbbG5nIHgsIGxhdCwgeV1cbiAgbGluZUludGVyc2VjdHNDaXJjbGUgOiBmdW5jdGlvbihsaW5lUDEsIGxpbmVQMiwgcG9pbnQsIHJhZGl1cykge1xuICAgIHZhciBkaXN0YW5jZSA9XG4gICAgICBNYXRoLmFicyhcbiAgICAgICAgKChsaW5lUDIueSAtIGxpbmVQMS55KSpwb2ludC54KSAtICgobGluZVAyLnggLSBsaW5lUDEueCkqcG9pbnQueSkgKyAobGluZVAyLngqbGluZVAxLnkpIC0gKGxpbmVQMi55KmxpbmVQMS54KVxuICAgICAgKSAvXG4gICAgICBNYXRoLnNxcnQoXG4gICAgICAgIE1hdGgucG93KGxpbmVQMi55IC0gbGluZVAxLnksIDIpICsgTWF0aC5wb3cobGluZVAyLnggLSBsaW5lUDEueCwgMilcbiAgICAgICk7XG4gICAgcmV0dXJuIGRpc3RhbmNlIDw9IHJhZGl1cztcbiAgfSxcblxuICAvLyBodHRwOi8vd2lraS5vcGVuc3RyZWV0bWFwLm9yZy93aWtpL1pvb21fbGV2ZWxzXG4gIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjc1NDUwOTgvbGVhZmxldC1jYWxjdWxhdGluZy1tZXRlcnMtcGVyLXBpeGVsLWF0LXpvb20tbGV2ZWxcbiAgbWV0ZXJzUGVyUHggOiBmdW5jdGlvbihsbCwgbWFwKSB7XG4gICAgdmFyIHBvaW50QyA9IG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGxsKTsgLy8gY29udmVydCB0byBjb250YWluZXJwb2ludCAocGl4ZWxzKVxuICAgIHZhciBwb2ludFggPSBbcG9pbnRDLnggKyAxLCBwb2ludEMueV07IC8vIGFkZCBvbmUgcGl4ZWwgdG8geFxuXG4gICAgLy8gY29udmVydCBjb250YWluZXJwb2ludHMgdG8gbGF0bG5nJ3NcbiAgICB2YXIgbGF0TG5nQyA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50Qyk7XG4gICAgdmFyIGxhdExuZ1ggPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludFgpO1xuXG4gICAgdmFyIGRpc3RhbmNlWCA9IGxhdExuZ0MuZGlzdGFuY2VUbyhsYXRMbmdYKTsgLy8gY2FsY3VsYXRlIGRpc3RhbmNlIGJldHdlZW4gYyBhbmQgeCAobGF0aXR1ZGUpXG4gICAgcmV0dXJuIGRpc3RhbmNlWDtcbiAgfSxcblxuICBkZWdyZWVzUGVyUHggOiBmdW5jdGlvbihsbCwgbWFwKSB7XG4gICAgdmFyIHBvaW50QyA9IG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGxsKTsgLy8gY29udmVydCB0byBjb250YWluZXJwb2ludCAocGl4ZWxzKVxuICAgIHZhciBwb2ludFggPSBbcG9pbnRDLnggKyAxLCBwb2ludEMueV07IC8vIGFkZCBvbmUgcGl4ZWwgdG8geFxuXG4gICAgLy8gY29udmVydCBjb250YWluZXJwb2ludHMgdG8gbGF0bG5nJ3NcbiAgICB2YXIgbGF0TG5nQyA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50Qyk7XG4gICAgdmFyIGxhdExuZ1ggPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludFgpO1xuXG4gICAgcmV0dXJuIE1hdGguYWJzKGxhdExuZ0MubG5nIC0gbGF0TG5nWC5sbmcpOyAvLyBjYWxjdWxhdGUgZGlzdGFuY2UgYmV0d2VlbiBjIGFuZCB4IChsYXRpdHVkZSlcbiAgfSxcblxuICAvLyBmcm9tIGh0dHA6Ly93d3cubW92YWJsZS10eXBlLmNvLnVrL3NjcmlwdHMvbGF0bG9uZy5odG1sXG4gIHBvaW50RGlzdGFuY2UgOiBmdW5jdGlvbiAocHQxLCBwdDIpIHtcbiAgICB2YXIgbG9uMSA9IHB0MS5jb29yZGluYXRlc1swXSxcbiAgICAgIGxhdDEgPSBwdDEuY29vcmRpbmF0ZXNbMV0sXG4gICAgICBsb24yID0gcHQyLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MiA9IHB0Mi5jb29yZGluYXRlc1sxXSxcbiAgICAgIGRMYXQgPSB0aGlzLm51bWJlclRvUmFkaXVzKGxhdDIgLSBsYXQxKSxcbiAgICAgIGRMb24gPSB0aGlzLm51bWJlclRvUmFkaXVzKGxvbjIgLSBsb24xKSxcbiAgICAgIGEgPSBNYXRoLnBvdyhNYXRoLnNpbihkTGF0IC8gMiksIDIpICsgTWF0aC5jb3ModGhpcy5udW1iZXJUb1JhZGl1cyhsYXQxKSlcbiAgICAgICAgKiBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDIpKSAqIE1hdGgucG93KE1hdGguc2luKGRMb24gLyAyKSwgMiksXG4gICAgICBjID0gMiAqIE1hdGguYXRhbjIoTWF0aC5zcXJ0KGEpLCBNYXRoLnNxcnQoMSAtIGEpKTtcbiAgICByZXR1cm4gKDYzNzEgKiBjKSAqIDEwMDA7IC8vIHJldHVybnMgbWV0ZXJzXG4gIH0sXG5cbiAgcG9pbnRJblBvbHlnb24gOiBmdW5jdGlvbiAocCwgcG9seSkge1xuICAgIHZhciBjb29yZHMgPSAocG9seS50eXBlID09IFwiUG9seWdvblwiKSA/IFsgcG9seS5jb29yZGluYXRlcyBdIDogcG9seS5jb29yZGluYXRlc1xuXG4gICAgdmFyIGluc2lkZUJveCA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnBvaW50SW5Cb3VuZGluZ0JveChwLCB0aGlzLmJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3Jkcyhjb29yZHNbaV0pKSkgaW5zaWRlQm94ID0gdHJ1ZVxuICAgIH1cbiAgICBpZiAoIWluc2lkZUJveCkgcmV0dXJuIGZhbHNlXG5cbiAgICB2YXIgaW5zaWRlUG9seSA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLnBucG9seShwLmNvb3JkaW5hdGVzWzFdLCBwLmNvb3JkaW5hdGVzWzBdLCBjb29yZHNbaV0pKSBpbnNpZGVQb2x5ID0gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVQb2x5XG4gIH0sXG5cbiAgcG9pbnRJbkJvdW5kaW5nQm94IDogZnVuY3Rpb24gKHBvaW50LCBib3VuZHMpIHtcbiAgICByZXR1cm4gIShwb2ludC5jb29yZGluYXRlc1sxXSA8IGJvdW5kc1swXVswXSB8fCBwb2ludC5jb29yZGluYXRlc1sxXSA+IGJvdW5kc1sxXVswXSB8fCBwb2ludC5jb29yZGluYXRlc1swXSA8IGJvdW5kc1swXVsxXSB8fCBwb2ludC5jb29yZGluYXRlc1swXSA+IGJvdW5kc1sxXVsxXSlcbiAgfSxcblxuICBib3VuZGluZ0JveEFyb3VuZFBvbHlDb29yZHMgOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICB2YXIgeEFsbCA9IFtdLCB5QWxsID0gW11cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzWzBdLmxlbmd0aDsgaSsrKSB7XG4gICAgICB4QWxsLnB1c2goY29vcmRzWzBdW2ldWzFdKVxuICAgICAgeUFsbC5wdXNoKGNvb3Jkc1swXVtpXVswXSlcbiAgICB9XG5cbiAgICB4QWxsID0geEFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG4gICAgeUFsbCA9IHlBbGwuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiBhIC0gYiB9KVxuXG4gICAgcmV0dXJuIFsgW3hBbGxbMF0sIHlBbGxbMF1dLCBbeEFsbFt4QWxsLmxlbmd0aCAtIDFdLCB5QWxsW3lBbGwubGVuZ3RoIC0gMV1dIF1cbiAgfSxcblxuICAvLyBQb2ludCBpbiBQb2x5Z29uXG4gIC8vIGh0dHA6Ly93d3cuZWNzZS5ycGkuZWR1L0hvbWVwYWdlcy93cmYvUmVzZWFyY2gvU2hvcnRfTm90ZXMvcG5wb2x5Lmh0bWwjTGlzdGluZyB0aGUgVmVydGljZXNcbiAgcG5wb2x5IDogZnVuY3Rpb24oeCx5LGNvb3Jkcykge1xuICAgIHZhciB2ZXJ0ID0gWyBbMCwwXSBdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjb29yZHNbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVtqXSlcbiAgICAgIH1cbiAgICAgIHZlcnQucHVzaChjb29yZHNbaV1bMF0pXG4gICAgICB2ZXJ0LnB1c2goWzAsMF0pXG4gICAgfVxuXG4gICAgdmFyIGluc2lkZSA9IGZhbHNlXG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSB2ZXJ0Lmxlbmd0aCAtIDE7IGkgPCB2ZXJ0Lmxlbmd0aDsgaiA9IGkrKykge1xuICAgICAgaWYgKCgodmVydFtpXVswXSA+IHkpICE9ICh2ZXJ0W2pdWzBdID4geSkpICYmICh4IDwgKHZlcnRbal1bMV0gLSB2ZXJ0W2ldWzFdKSAqICh5IC0gdmVydFtpXVswXSkgLyAodmVydFtqXVswXSAtIHZlcnRbaV1bMF0pICsgdmVydFtpXVsxXSkpIGluc2lkZSA9ICFpbnNpZGVcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zaWRlXG4gIH0sXG5cbiAgbnVtYmVyVG9SYWRpdXMgOiBmdW5jdGlvbiAobnVtYmVyKSB7XG4gICAgcmV0dXJuIG51bWJlciAqIE1hdGguUEkgLyAxODA7XG4gIH1cbn07XG4iXX0=
