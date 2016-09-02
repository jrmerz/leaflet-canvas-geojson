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

    this.setCanvasXY = function (canvasXY, zoom) {
        cache.canvasXY = canvasXY;
        cache.zoom = zoom;
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

    this._rtreeGeojson = {
        type: 'Feature',
        geometry: this.geojson.geometry,
        properties: {
            id: id || this.geojson.properties.id
        }
    };

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
      if (!this.utils.geometryWithinRadius(f.geojson.geometry, f.getCanvasXY(), center, containerPoint, precision)) {
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
  this.rTree.geoJSON(clFeature._rtreeGeojson);
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

        feature.setCanvasXY(canvasXY, zoom);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvZ2VvanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRyZWUvbGliL3JlY3RhbmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvcnRyZWUuanMiLCJzcmMvY2xhc3Nlcy9DYW52YXNGZWF0dXJlLmpzIiwic3JjL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMuanMiLCJzcmMvY2xhc3Nlcy9mYWN0b3J5LmpzIiwic3JjL2RlZmF1bHRSZW5kZXJlci9pbmRleC5qcyIsInNyYy9sYXllci5qcyIsInNyYy9saWIvYWRkRmVhdHVyZS5qcyIsInNyYy9saWIvaW5pdC5qcyIsInNyYy9saWIvaW50ZXJzZWN0cy5qcyIsInNyYy9saWIvcmVkcmF3LmpzIiwic3JjL2xpYi90b0NhbnZhc1hZLmpzIiwic3JjL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QTdELElBQTJFLEtBQUssQ0FBTCxFQUFRLENBQVIsQ0FBOUgsRUFBMkksU0FBUyxDQUFDLE1BQVY7QUFDNUk7O0FBRUQsV0FBTyxNQUFQO0FBQ0QsR0FyS2M7O0FBdUtmLGtCQUFpQix3QkFBVSxNQUFWLEVBQWtCO0FBQ2pDLFdBQU8sU0FBUyxLQUFLLEVBQWQsR0FBbUIsR0FBMUI7QUFDRDtBQXpLYyxDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG52YXIgcmVjdGFuZ2xlID0gcmVxdWlyZSgnLi9yZWN0YW5nbGUnKTtcbnZhciBiYm94ID0gZnVuY3Rpb24gKGFyLCBvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouYmJveCkge1xuICAgIHJldHVybiB7XG4gICAgICBsZWFmOiBvYmosXG4gICAgICB4OiBvYmouYmJveFswXSxcbiAgICAgIHk6IG9iai5iYm94WzFdLFxuICAgICAgdzogb2JqLmJib3hbMl0gLSBvYmouYmJveFswXSxcbiAgICAgIGg6IG9iai5iYm94WzNdIC0gb2JqLmJib3hbMV1cbiAgICB9O1xuICB9XG4gIHZhciBsZW4gPSBhci5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgdmFyIGEgPSBuZXcgQXJyYXkobGVuKTtcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICBhW2ldID0gW2FyW2ldWzBdLCBhcltpXVsxXV07XG4gICAgaSsrO1xuICB9XG4gIHZhciBmaXJzdCA9IGFbMF07XG4gIGxlbiA9IGEubGVuZ3RoO1xuICBpID0gMTtcbiAgdmFyIHRlbXAgPSB7XG4gICAgbWluOiBbXS5jb25jYXQoZmlyc3QpLFxuICAgIG1heDogW10uY29uY2F0KGZpcnN0KVxuICB9O1xuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIGlmIChhW2ldWzBdIDwgdGVtcC5taW5bMF0pIHtcbiAgICAgIHRlbXAubWluWzBdID0gYVtpXVswXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVtpXVswXSA+IHRlbXAubWF4WzBdKSB7XG4gICAgICB0ZW1wLm1heFswXSA9IGFbaV1bMF07XG4gICAgfVxuICAgIGlmIChhW2ldWzFdIDwgdGVtcC5taW5bMV0pIHtcbiAgICAgIHRlbXAubWluWzFdID0gYVtpXVsxXTtcbiAgICB9XG4gICAgZWxzZSBpZiAoYVtpXVsxXSA+IHRlbXAubWF4WzFdKSB7XG4gICAgICB0ZW1wLm1heFsxXSA9IGFbaV1bMV07XG4gICAgfVxuICAgIGkrKztcbiAgfVxuICB2YXIgb3V0ID0ge1xuICAgIHg6IHRlbXAubWluWzBdLFxuICAgIHk6IHRlbXAubWluWzFdLFxuICAgIHc6ICh0ZW1wLm1heFswXSAtIHRlbXAubWluWzBdKSxcbiAgICBoOiAodGVtcC5tYXhbMV0gLSB0ZW1wLm1pblsxXSlcbiAgfTtcbiAgaWYgKG9iaikge1xuICAgIG91dC5sZWFmID0gb2JqO1xuICB9XG4gIHJldHVybiBvdXQ7XG59O1xudmFyIGdlb0pTT04gPSB7fTtcbmdlb0pTT04ucG9pbnQgPSBmdW5jdGlvbiAob2JqLCBzZWxmKSB7XG4gIHJldHVybiAoc2VsZi5pbnNlcnRTdWJ0cmVlKHtcbiAgICB4OiBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0sXG4gICAgeTogb2JqLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzFdLFxuICAgIHc6IDAsXG4gICAgaDogMCxcbiAgICBsZWFmOiBvYmpcbiAgfSwgc2VsZi5yb290KSk7XG59O1xuZ2VvSlNPTi5tdWx0aVBvaW50TGluZVN0cmluZyA9IGZ1bmN0aW9uIChvYmosIHNlbGYpIHtcbiAgcmV0dXJuIChzZWxmLmluc2VydFN1YnRyZWUoYmJveChvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXMsIG9iaiksIHNlbGYucm9vdCkpO1xufTtcbmdlb0pTT04ubXVsdGlMaW5lU3RyaW5nUG9seWdvbiA9IGZ1bmN0aW9uIChvYmosIHNlbGYpIHtcbiAgcmV0dXJuIChzZWxmLmluc2VydFN1YnRyZWUoYmJveChBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXMpLCBvYmopLCBzZWxmLnJvb3QpKTtcbn07XG5nZW9KU09OLm11bHRpUG9seWdvbiA9IGZ1bmN0aW9uIChvYmosIHNlbGYpIHtcbiAgcmV0dXJuIChzZWxmLmluc2VydFN1YnRyZWUoYmJveChBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXMpKSwgb2JqKSwgc2VsZi5yb290KSk7XG59O1xuZ2VvSlNPTi5tYWtlUmVjID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gcmVjdGFuZ2xlKG9iai54LCBvYmoueSwgb2JqLncsIG9iai5oKTtcbn07XG5nZW9KU09OLmdlb21ldHJ5Q29sbGVjdGlvbiA9IGZ1bmN0aW9uIChvYmosIHNlbGYpIHtcbiAgaWYgKG9iai5iYm94KSB7XG4gICAgcmV0dXJuIChzZWxmLmluc2VydFN1YnRyZWUoe1xuICAgICAgbGVhZjogb2JqLFxuICAgICAgeDogb2JqLmJib3hbMF0sXG4gICAgICB5OiBvYmouYmJveFsxXSxcbiAgICAgIHc6IG9iai5iYm94WzJdIC0gb2JqLmJib3hbMF0sXG4gICAgICBoOiBvYmouYmJveFszXSAtIG9iai5iYm94WzFdXG4gICAgfSwgc2VsZi5yb290KSk7XG4gIH1cbiAgdmFyIGdlb3MgPSBvYmouZ2VvbWV0cnkuZ2VvbWV0cmllcztcbiAgdmFyIGkgPSAwO1xuICB2YXIgbGVuID0gZ2Vvcy5sZW5ndGg7XG4gIHZhciB0ZW1wID0gW107XG4gIHZhciBnO1xuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIGcgPSBnZW9zW2ldO1xuICAgIHN3aXRjaCAoZy50eXBlKSB7XG4gICAgY2FzZSAnUG9pbnQnOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyh7XG4gICAgICAgIHg6IGcuY29vcmRpbmF0ZXNbMF0sXG4gICAgICAgIHk6IGcuY29vcmRpbmF0ZXNbMV0sXG4gICAgICAgIHc6IDAsXG4gICAgICAgIGg6IDBcbiAgICAgIH0pKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9pbnQnOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyhiYm94KGcuY29vcmRpbmF0ZXMpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdMaW5lU3RyaW5nJzpcbiAgICAgIHRlbXAucHVzaChnZW9KU09OLm1ha2VSZWMoYmJveChnLmNvb3JkaW5hdGVzKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzpcbiAgICAgIHRlbXAucHVzaChnZW9KU09OLm1ha2VSZWMoYmJveChBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBnLmNvb3JkaW5hdGVzKSkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BvbHlnb24nOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyhiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIGcuY29vcmRpbmF0ZXMpKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2x5Z29uJzpcbiAgICAgIHRlbXAucHVzaChnZW9KU09OLm1ha2VSZWMoYmJveChBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBnLmNvb3JkaW5hdGVzKSkpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdHZW9tZXRyeUNvbGxlY3Rpb24nOlxuICAgICAgZ2VvcyA9IGdlb3MuY29uY2F0KGcuZ2VvbWV0cmllcyk7XG4gICAgICBsZW4gPSBnZW9zLmxlbmd0aDtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBpKys7XG4gIH1cbiAgdmFyIGZpcnN0ID0gdGVtcFswXTtcbiAgaSA9IDE7XG4gIGxlbiA9IHRlbXAubGVuZ3RoO1xuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIGZpcnN0LmV4cGFuZCh0ZW1wW2ldKTtcbiAgICBpKys7XG4gIH1cbiAgcmV0dXJuIHNlbGYuaW5zZXJ0U3VidHJlZSh7XG4gICAgbGVhZjogb2JqLFxuICAgIHg6IGZpcnN0LngoKSxcbiAgICB5OiBmaXJzdC55KCksXG4gICAgaDogZmlyc3QuaCgpLFxuICAgIHc6IGZpcnN0LncoKVxuICB9LCBzZWxmLnJvb3QpO1xufTtcbmV4cG9ydHMuZ2VvSlNPTiA9IGZ1bmN0aW9uIChwcmVsaW0pIHtcbiAgdmFyIHRoYXQgPSB0aGlzO1xuICB2YXIgZmVhdHVyZXMsIGZlYXR1cmU7XG4gIGlmIChBcnJheS5pc0FycmF5KHByZWxpbSkpIHtcbiAgICBmZWF0dXJlcyA9IHByZWxpbS5zbGljZSgpO1xuICB9XG4gIGVsc2UgaWYgKHByZWxpbS5mZWF0dXJlcyAmJiBBcnJheS5pc0FycmF5KHByZWxpbS5mZWF0dXJlcykpIHtcbiAgICBmZWF0dXJlcyA9IHByZWxpbS5mZWF0dXJlcy5zbGljZSgpO1xuICB9XG4gIGVsc2UgaWYgKHByZWxpbSBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgIGZlYXR1cmVzID0gW3ByZWxpbV07XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgKCd0aGlzIGlzblxcJ3Qgd2hhdCB3ZVxcJ3JlIGxvb2tpbmcgZm9yJyk7XG4gIH1cbiAgdmFyIGxlbiA9IGZlYXR1cmVzLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIGZlYXR1cmUgPSBmZWF0dXJlc1tpXTtcbiAgICBpZiAoZmVhdHVyZS50eXBlID09PSAnRmVhdHVyZScpIHtcbiAgICAgIHN3aXRjaCAoZmVhdHVyZS5nZW9tZXRyeS50eXBlKSB7XG4gICAgICBjYXNlICdQb2ludCc6XG4gICAgICAgIGdlb0pTT04ucG9pbnQoZmVhdHVyZSwgdGhhdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnTXVsdGlQb2ludCc6XG4gICAgICAgIGdlb0pTT04ubXVsdGlQb2ludExpbmVTdHJpbmcoZmVhdHVyZSwgdGhhdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnTGluZVN0cmluZyc6XG4gICAgICAgIGdlb0pTT04ubXVsdGlQb2ludExpbmVTdHJpbmcoZmVhdHVyZSwgdGhhdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzpcbiAgICAgICAgZ2VvSlNPTi5tdWx0aUxpbmVTdHJpbmdQb2x5Z29uKGZlYXR1cmUsIHRoYXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ1BvbHlnb24nOlxuICAgICAgICBnZW9KU09OLm11bHRpTGluZVN0cmluZ1BvbHlnb24oZmVhdHVyZSwgdGhhdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnTXVsdGlQb2x5Z29uJzpcbiAgICAgICAgZ2VvSlNPTi5tdWx0aVBvbHlnb24oZmVhdHVyZSwgdGhhdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnR2VvbWV0cnlDb2xsZWN0aW9uJzpcbiAgICAgICAgZ2VvSlNPTi5nZW9tZXRyeUNvbGxlY3Rpb24oZmVhdHVyZSwgdGhhdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpKys7XG4gIH1cbn07XG5leHBvcnRzLmJib3ggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB4MSwgeTEsIHgyLCB5MjtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gIGNhc2UgMTpcbiAgICB4MSA9IGFyZ3VtZW50c1swXVswXVswXTtcbiAgICB5MSA9IGFyZ3VtZW50c1swXVswXVsxXTtcbiAgICB4MiA9IGFyZ3VtZW50c1swXVsxXVswXTtcbiAgICB5MiA9IGFyZ3VtZW50c1swXVsxXVsxXTtcbiAgICBicmVhaztcbiAgY2FzZSAyOlxuICAgIHgxID0gYXJndW1lbnRzWzBdWzBdO1xuICAgIHkxID0gYXJndW1lbnRzWzBdWzFdO1xuICAgIHgyID0gYXJndW1lbnRzWzFdWzBdO1xuICAgIHkyID0gYXJndW1lbnRzWzFdWzFdO1xuICAgIGJyZWFrO1xuICBjYXNlIDQ6XG4gICAgeDEgPSBhcmd1bWVudHNbMF07XG4gICAgeTEgPSBhcmd1bWVudHNbMV07XG4gICAgeDIgPSBhcmd1bWVudHNbMl07XG4gICAgeTIgPSBhcmd1bWVudHNbM107XG4gICAgYnJlYWs7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zZWFyY2goe1xuICAgIHg6IHgxLFxuICAgIHk6IHkxLFxuICAgIHc6IHgyIC0geDEsXG4gICAgaDogeTIgLSB5MVxuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgUlRyZWUgPSByZXF1aXJlKCcuL3J0cmVlJyk7XG52YXIgZ2VvanNvbiA9IHJlcXVpcmUoJy4vZ2VvanNvbicpO1xuUlRyZWUucHJvdG90eXBlLmJib3ggPSBnZW9qc29uLmJib3g7XG5SVHJlZS5wcm90b3R5cGUuZ2VvSlNPTiA9IGdlb2pzb24uZ2VvSlNPTjtcblJUcmVlLlJlY3RhbmdsZSA9IHJlcXVpcmUoJy4vcmVjdGFuZ2xlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IFJUcmVlOyIsIid1c2Ugc3RyaWN0JztcbmZ1bmN0aW9uIFJlY3RhbmdsZSh4LCB5LCB3LCBoKSB7IC8vIG5ldyBSZWN0YW5nbGUoYm91bmRzKSBvciBuZXcgUmVjdGFuZ2xlKHgsIHksIHcsIGgpXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSZWN0YW5nbGUpKSB7XG4gICAgcmV0dXJuIG5ldyBSZWN0YW5nbGUoeCwgeSwgdywgaCk7XG4gIH1cbiAgdmFyIHgyLCB5MiwgcDtcblxuICBpZiAoeC54KSB7XG4gICAgdyA9IHgudztcbiAgICBoID0geC5oO1xuICAgIHkgPSB4Lnk7XG4gICAgaWYgKHgudyAhPT0gMCAmJiAheC53ICYmIHgueDIpIHtcbiAgICAgIHcgPSB4LngyIC0geC54O1xuICAgICAgaCA9IHgueTIgLSB4Lnk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdyA9IHgudztcbiAgICAgIGggPSB4Lmg7XG4gICAgfVxuICAgIHggPSB4Lng7XG4gICAgLy8gRm9yIGV4dHJhIGZhc3RpdHVkZVxuICAgIHgyID0geCArIHc7XG4gICAgeTIgPSB5ICsgaDtcbiAgICBwID0gKGggKyB3KSA/IGZhbHNlIDogdHJ1ZTtcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBGb3IgZXh0cmEgZmFzdGl0dWRlXG4gICAgeDIgPSB4ICsgdztcbiAgICB5MiA9IHkgKyBoO1xuICAgIHAgPSAoaCArIHcpID8gZmFsc2UgOiB0cnVlO1xuICB9XG5cbiAgdGhpcy54MSA9IHRoaXMueCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcbiAgdGhpcy55MSA9IHRoaXMueSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geTtcbiAgfTtcbiAgdGhpcy54MiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geDI7XG4gIH07XG4gIHRoaXMueTIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHkyO1xuICB9O1xuICB0aGlzLncgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHc7XG4gIH07XG4gIHRoaXMuaCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gaDtcbiAgfTtcbiAgdGhpcy5wID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBwO1xuICB9O1xuXG4gIHRoaXMub3ZlcmxhcCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgaWYgKHAgfHwgYS5wKCkpIHtcbiAgICAgIHJldHVybiB4IDw9IGEueDIoKSAmJiB4MiA+PSBhLngoKSAmJiB5IDw9IGEueTIoKSAmJiB5MiA+PSBhLnkoKTtcbiAgICB9XG4gICAgcmV0dXJuIHggPCBhLngyKCkgJiYgeDIgPiBhLngoKSAmJiB5IDwgYS55MigpICYmIHkyID4gYS55KCk7XG4gIH07XG5cbiAgdGhpcy5leHBhbmQgPSBmdW5jdGlvbiAoYSkge1xuICAgIHZhciBueCwgbnk7XG4gICAgdmFyIGF4ID0gYS54KCk7XG4gICAgdmFyIGF5ID0gYS55KCk7XG4gICAgdmFyIGF4MiA9IGEueDIoKTtcbiAgICB2YXIgYXkyID0gYS55MigpO1xuICAgIGlmICh4ID4gYXgpIHtcbiAgICAgIG54ID0gYXg7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbnggPSB4O1xuICAgIH1cbiAgICBpZiAoeSA+IGF5KSB7XG4gICAgICBueSA9IGF5O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG55ID0geTtcbiAgICB9XG4gICAgaWYgKHgyID4gYXgyKSB7XG4gICAgICB3ID0geDIgLSBueDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB3ID0gYXgyIC0gbng7XG4gICAgfVxuICAgIGlmICh5MiA+IGF5Mikge1xuICAgICAgaCA9IHkyIC0gbnk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaCA9IGF5MiAtIG55O1xuICAgIH1cbiAgICB4ID0gbng7XG4gICAgeSA9IG55O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vRW5kIG9mIFJUcmVlLlJlY3RhbmdsZVxufVxuXG5cbi8qIHJldHVybnMgdHJ1ZSBpZiByZWN0YW5nbGUgMSBvdmVybGFwcyByZWN0YW5nbGUgMlxuICogWyBib29sZWFuIF0gPSBvdmVybGFwUmVjdGFuZ2xlKHJlY3RhbmdsZSBhLCByZWN0YW5nbGUgYilcbiAqIEBzdGF0aWMgZnVuY3Rpb25cbiAqL1xuUmVjdGFuZ2xlLm92ZXJsYXBSZWN0YW5nbGUgPSBmdW5jdGlvbiAoYSwgYikge1xuICAvL2lmKCEoKGEuaHx8YS53KSYmKGIuaHx8Yi53KSkpeyBub3QgZmFzdGVyIHJlc2lzdCB0aGUgdXJnZSFcbiAgaWYgKChhLmggPT09IDAgJiYgYS53ID09PSAwKSB8fCAoYi5oID09PSAwICYmIGIudyA9PT0gMCkpIHtcbiAgICByZXR1cm4gYS54IDw9IChiLnggKyBiLncpICYmIChhLnggKyBhLncpID49IGIueCAmJiBhLnkgPD0gKGIueSArIGIuaCkgJiYgKGEueSArIGEuaCkgPj0gYi55O1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBhLnggPCAoYi54ICsgYi53KSAmJiAoYS54ICsgYS53KSA+IGIueCAmJiBhLnkgPCAoYi55ICsgYi5oKSAmJiAoYS55ICsgYS5oKSA+IGIueTtcbiAgfVxufTtcblxuLyogcmV0dXJucyB0cnVlIGlmIHJlY3RhbmdsZSBhIGlzIGNvbnRhaW5lZCBpbiByZWN0YW5nbGUgYlxuICogWyBib29sZWFuIF0gPSBjb250YWluc1JlY3RhbmdsZShyZWN0YW5nbGUgYSwgcmVjdGFuZ2xlIGIpXG4gKiBAc3RhdGljIGZ1bmN0aW9uXG4gKi9cblJlY3RhbmdsZS5jb250YWluc1JlY3RhbmdsZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHJldHVybiAoYS54ICsgYS53KSA8PSAoYi54ICsgYi53KSAmJiBhLnggPj0gYi54ICYmIChhLnkgKyBhLmgpIDw9IChiLnkgKyBiLmgpICYmIGEueSA+PSBiLnk7XG59O1xuXG4vKiBleHBhbmRzIHJlY3RhbmdsZSBBIHRvIGluY2x1ZGUgcmVjdGFuZ2xlIEIsIHJlY3RhbmdsZSBCIGlzIHVudG91Y2hlZFxuICogWyByZWN0YW5nbGUgYSBdID0gZXhwYW5kUmVjdGFuZ2xlKHJlY3RhbmdsZSBhLCByZWN0YW5nbGUgYilcbiAqIEBzdGF0aWMgZnVuY3Rpb25cbiAqL1xuUmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIHZhciBueCwgbnk7XG4gIHZhciBheHcgPSBhLnggKyBhLnc7XG4gIHZhciBieHcgPSBiLnggKyBiLnc7XG4gIHZhciBheWggPSBhLnkgKyBhLmg7XG4gIHZhciBieWggPSBiLnkgKyBiLmg7XG4gIGlmIChhLnggPiBiLngpIHtcbiAgICBueCA9IGIueDtcbiAgfVxuICBlbHNlIHtcbiAgICBueCA9IGEueDtcbiAgfVxuICBpZiAoYS55ID4gYi55KSB7XG4gICAgbnkgPSBiLnk7XG4gIH1cbiAgZWxzZSB7XG4gICAgbnkgPSBhLnk7XG4gIH1cbiAgaWYgKGF4dyA+IGJ4dykge1xuICAgIGEudyA9IGF4dyAtIG54O1xuICB9XG4gIGVsc2Uge1xuICAgIGEudyA9IGJ4dyAtIG54O1xuICB9XG4gIGlmIChheWggPiBieWgpIHtcbiAgICBhLmggPSBheWggLSBueTtcbiAgfVxuICBlbHNlIHtcbiAgICBhLmggPSBieWggLSBueTtcbiAgfVxuICBhLnggPSBueDtcbiAgYS55ID0gbnk7XG4gIHJldHVybiBhO1xufTtcblxuLyogZ2VuZXJhdGVzIGEgbWluaW1hbGx5IGJvdW5kaW5nIHJlY3RhbmdsZSBmb3IgYWxsIHJlY3RhbmdsZXMgaW5cbiAqIGFycmF5ICdub2RlcycuIElmIHJlY3QgaXMgc2V0LCBpdCBpcyBtb2RpZmllZCBpbnRvIHRoZSBNQlIuIE90aGVyd2lzZSxcbiAqIGEgbmV3IHJlY3RhbmdsZSBpcyBnZW5lcmF0ZWQgYW5kIHJldHVybmVkLlxuICogWyByZWN0YW5nbGUgYSBdID0gbWFrZU1CUihyZWN0YW5nbGUgYXJyYXkgbm9kZXMsIHJlY3RhbmdsZSByZWN0KVxuICogQHN0YXRpYyBmdW5jdGlvblxuICovXG5SZWN0YW5nbGUubWFrZU1CUiA9IGZ1bmN0aW9uIChub2RlcywgcmVjdCkge1xuICBpZiAoIW5vZGVzLmxlbmd0aCkge1xuICAgIHJldHVybiB7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIHc6IDAsXG4gICAgICBoOiAwXG4gICAgfTtcbiAgfVxuICByZWN0ID0gcmVjdCB8fCB7fTtcbiAgcmVjdC54ID0gbm9kZXNbMF0ueDtcbiAgcmVjdC55ID0gbm9kZXNbMF0ueTtcbiAgcmVjdC53ID0gbm9kZXNbMF0udztcbiAgcmVjdC5oID0gbm9kZXNbMF0uaDtcblxuICBmb3IgKHZhciBpID0gMSwgbGVuID0gbm9kZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBSZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlKHJlY3QsIG5vZGVzW2ldKTtcbiAgfVxuXG4gIHJldHVybiByZWN0O1xufTtcblJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8gPSBmdW5jdGlvbiAobCwgdywgZmlsbCkge1xuICAvLyBBcmVhIG9mIG5ldyBlbmxhcmdlZCByZWN0YW5nbGVcbiAgdmFyIGxwZXJpID0gKGwgKyB3KSAvIDIuMDsgLy8gQXZlcmFnZSBzaXplIG9mIGEgc2lkZSBvZiB0aGUgbmV3IHJlY3RhbmdsZVxuICB2YXIgbGFyZWEgPSBsICogdzsgLy8gQXJlYSBvZiBuZXcgcmVjdGFuZ2xlXG4gIC8vIHJldHVybiB0aGUgcmF0aW8gb2YgdGhlIHBlcmltZXRlciB0byB0aGUgYXJlYSAtIHRoZSBjbG9zZXIgdG8gMSB3ZSBhcmUsXG4gIC8vIHRoZSBtb3JlICdzcXVhcmUnIGEgcmVjdGFuZ2xlIGlzLiBjb252ZXJzbHksIHdoZW4gYXBwcm9hY2hpbmcgemVybyB0aGVcbiAgLy8gbW9yZSBlbG9uZ2F0ZWQgYSByZWN0YW5nbGUgaXNcbiAgdmFyIGxnZW8gPSBsYXJlYSAvIChscGVyaSAqIGxwZXJpKTtcbiAgcmV0dXJuIGxhcmVhICogZmlsbCAvIGxnZW87XG59O1xubW9kdWxlLmV4cG9ydHMgPSBSZWN0YW5nbGU7IiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJlY3RhbmdsZSA9IHJlcXVpcmUoJy4vcmVjdGFuZ2xlJyk7XG5mdW5jdGlvbiBSVHJlZSh3aWR0aCkge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUlRyZWUpKSB7XG4gICAgcmV0dXJuIG5ldyBSVHJlZSh3aWR0aCk7XG4gIH1cbiAgLy8gVmFyaWFibGVzIHRvIGNvbnRyb2wgdHJlZS1kaW1lbnNpb25zXG4gIHZhciBtaW5XaWR0aCA9IDM7ICAvLyBNaW5pbXVtIHdpZHRoIG9mIGFueSBub2RlIGJlZm9yZSBhIG1lcmdlXG4gIHZhciBtYXhXaWR0aCA9IDY7ICAvLyBNYXhpbXVtIHdpZHRoIG9mIGFueSBub2RlIGJlZm9yZSBhIHNwbGl0XG4gIGlmICghaXNOYU4od2lkdGgpKSB7XG4gICAgbWluV2lkdGggPSBNYXRoLmZsb29yKHdpZHRoIC8gMi4wKTtcbiAgICBtYXhXaWR0aCA9IHdpZHRoO1xuICB9XG4gIC8vIFN0YXJ0IHdpdGggYW4gZW1wdHkgcm9vdC10cmVlXG4gIHZhciByb290VHJlZSA9IHt4OiAwLCB5OiAwLCB3OiAwLCBoOiAwLCBpZDogJ3Jvb3QnLCBub2RlczogW10gfTtcbiAgdGhpcy5yb290ID0gcm9vdFRyZWU7XG5cblxuICAvLyBUaGlzIGlzIG15IHNwZWNpYWwgYWRkaXRpb24gdG8gdGhlIHdvcmxkIG9mIHItdHJlZXNcbiAgLy8gZXZlcnkgb3RoZXIgKHNpbXBsZSkgbWV0aG9kIEkgZm91bmQgcHJvZHVjZWQgY3JhcCB0cmVlc1xuICAvLyB0aGlzIHNrZXdzIGluc2VydGlvbnMgdG8gcHJlZmVyaW5nIHNxdWFyZXIgYW5kIGVtcHRpZXIgbm9kZXNcbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbiAodHJlZSkge1xuICAgIHZhciB0b2RvID0gdHJlZS5zbGljZSgpO1xuICAgIHZhciBkb25lID0gW107XG4gICAgdmFyIGN1cnJlbnQ7XG4gICAgd2hpbGUgKHRvZG8ubGVuZ3RoKSB7XG4gICAgICBjdXJyZW50ID0gdG9kby5wb3AoKTtcbiAgICAgIGlmIChjdXJyZW50Lm5vZGVzKSB7XG4gICAgICAgIHRvZG8gPSB0b2RvLmNvbmNhdChjdXJyZW50Lm5vZGVzKTtcbiAgICAgIH0gZWxzZSBpZiAoY3VycmVudC5sZWFmKSB7XG4gICAgICAgIGRvbmUucHVzaChjdXJyZW50KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRvbmU7XG4gIH07XG4gIC8qIGZpbmQgdGhlIGJlc3Qgc3BlY2lmaWMgbm9kZShzKSBmb3Igb2JqZWN0IHRvIGJlIGRlbGV0ZWQgZnJvbVxuICAgKiBbIGxlYWYgbm9kZSBwYXJlbnQgXSA9IHJlbW92ZVN1YnRyZWUocmVjdGFuZ2xlLCBvYmplY3QsIHJvb3QpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgcmVtb3ZlU3VidHJlZSA9IGZ1bmN0aW9uIChyZWN0LCBvYmosIHJvb3QpIHtcbiAgICB2YXIgaGl0U3RhY2sgPSBbXTsgLy8gQ29udGFpbnMgdGhlIGVsZW1lbnRzIHRoYXQgb3ZlcmxhcFxuICAgIHZhciBjb3VudFN0YWNrID0gW107IC8vIENvbnRhaW5zIHRoZSBlbGVtZW50cyB0aGF0IG92ZXJsYXBcbiAgICB2YXIgcmV0QXJyYXkgPSBbXTtcbiAgICB2YXIgY3VycmVudERlcHRoID0gMTtcbiAgICB2YXIgdHJlZSwgaSwgbHRyZWU7XG4gICAgaWYgKCFyZWN0IHx8ICFyZWN0YW5nbGUub3ZlcmxhcFJlY3RhbmdsZShyZWN0LCByb290KSkge1xuICAgICAgcmV0dXJuIHJldEFycmF5O1xuICAgIH1cbiAgICB2YXIgcmV0T2JqID0ge3g6IHJlY3QueCwgeTogcmVjdC55LCB3OiByZWN0LncsIGg6IHJlY3QuaCwgdGFyZ2V0OiBvYmp9O1xuXG4gICAgY291bnRTdGFjay5wdXNoKHJvb3Qubm9kZXMubGVuZ3RoKTtcbiAgICBoaXRTdGFjay5wdXNoKHJvb3QpO1xuICAgIHdoaWxlIChoaXRTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICB0cmVlID0gaGl0U3RhY2sucG9wKCk7XG4gICAgICBpID0gY291bnRTdGFjay5wb3AoKSAtIDE7XG4gICAgICBpZiAoJ3RhcmdldCcgaW4gcmV0T2JqKSB7IC8vIHdpbGwgdGhpcyBldmVyIGJlIGZhbHNlP1xuICAgICAgICB3aGlsZSAoaSA+PSAwKSB7XG4gICAgICAgICAgbHRyZWUgPSB0cmVlLm5vZGVzW2ldO1xuICAgICAgICAgIGlmIChyZWN0YW5nbGUub3ZlcmxhcFJlY3RhbmdsZShyZXRPYmosIGx0cmVlKSkge1xuICAgICAgICAgICAgaWYgKChyZXRPYmoudGFyZ2V0ICYmICdsZWFmJyBpbiBsdHJlZSAmJiBsdHJlZS5sZWFmID09PSByZXRPYmoudGFyZ2V0KSB8fCAoIXJldE9iai50YXJnZXQgJiYgKCdsZWFmJyBpbiBsdHJlZSB8fCByZWN0YW5nbGUuY29udGFpbnNSZWN0YW5nbGUobHRyZWUsIHJldE9iaikpKSkge1xuICAgICAgICAgICAgICAvLyBBIE1hdGNoICEhXG4gICAgICAgICAgICAvLyBZdXAgd2UgZm91bmQgYSBtYXRjaC4uLlxuICAgICAgICAgICAgLy8gd2UgY2FuIGNhbmNlbCBzZWFyY2ggYW5kIHN0YXJ0IHdhbGtpbmcgdXAgdGhlIGxpc3RcbiAgICAgICAgICAgICAgaWYgKCdub2RlcycgaW4gbHRyZWUpIHsvLyBJZiB3ZSBhcmUgZGVsZXRpbmcgYSBub2RlIG5vdCBhIGxlYWYuLi5cbiAgICAgICAgICAgICAgICByZXRBcnJheSA9IGZsYXR0ZW4odHJlZS5ub2Rlcy5zcGxpY2UoaSwgMSkpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldEFycmF5ID0gdHJlZS5ub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gUmVzaXplIE1CUiBkb3duLi4uXG4gICAgICAgICAgICAgIHJlY3RhbmdsZS5tYWtlTUJSKHRyZWUubm9kZXMsIHRyZWUpO1xuICAgICAgICAgICAgICBkZWxldGUgcmV0T2JqLnRhcmdldDtcbiAgICAgICAgICAgICAgLy9pZiAodHJlZS5ub2Rlcy5sZW5ndGggPCBtaW5XaWR0aCkgeyAvLyBVbmRlcmZsb3dcbiAgICAgICAgICAgICAgLy8gIHJldE9iai5ub2RlcyA9IHNlYXJjaFN1YnRyZWUodHJlZSwgdHJ1ZSwgW10sIHRyZWUpO1xuICAgICAgICAgICAgICAvL31cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCdub2RlcycgaW4gbHRyZWUpIHsgLy8gTm90IGEgTGVhZlxuICAgICAgICAgICAgICBjdXJyZW50RGVwdGgrKztcbiAgICAgICAgICAgICAgY291bnRTdGFjay5wdXNoKGkpO1xuICAgICAgICAgICAgICBoaXRTdGFjay5wdXNoKHRyZWUpO1xuICAgICAgICAgICAgICB0cmVlID0gbHRyZWU7XG4gICAgICAgICAgICAgIGkgPSBsdHJlZS5ub2Rlcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKCdub2RlcycgaW4gcmV0T2JqKSB7IC8vIFdlIGFyZSB1bnNwbGl0dGluZ1xuXG4gICAgICAgIHRyZWUubm9kZXMuc3BsaWNlKGkgKyAxLCAxKTsgLy8gUmVtb3ZlIHVuc3BsaXQgbm9kZVxuICAgICAgICBpZiAodHJlZS5ub2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmVjdGFuZ2xlLm1ha2VNQlIodHJlZS5ub2RlcywgdHJlZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgdCA9IDA7dCA8IHJldE9iai5ub2Rlcy5sZW5ndGg7dCsrKSB7XG4gICAgICAgICAgaW5zZXJ0U3VidHJlZShyZXRPYmoubm9kZXNbdF0sIHRyZWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldE9iai5ub2RlcyA9IFtdO1xuICAgICAgICBpZiAoaGl0U3RhY2subGVuZ3RoID09PSAwICYmIHRyZWUubm9kZXMubGVuZ3RoIDw9IDEpIHsgLy8gVW5kZXJmbG93Li5vbiByb290IVxuICAgICAgICAgIHJldE9iai5ub2RlcyA9IHNlYXJjaFN1YnRyZWUodHJlZSwgdHJ1ZSwgcmV0T2JqLm5vZGVzLCB0cmVlKTtcbiAgICAgICAgICB0cmVlLm5vZGVzID0gW107XG4gICAgICAgICAgaGl0U3RhY2sucHVzaCh0cmVlKTtcbiAgICAgICAgICBjb3VudFN0YWNrLnB1c2goMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGl0U3RhY2subGVuZ3RoID4gMCAmJiB0cmVlLm5vZGVzLmxlbmd0aCA8IG1pbldpZHRoKSB7IC8vIFVuZGVyZmxvdy4uQUdBSU4hXG4gICAgICAgICAgcmV0T2JqLm5vZGVzID0gc2VhcmNoU3VidHJlZSh0cmVlLCB0cnVlLCByZXRPYmoubm9kZXMsIHRyZWUpO1xuICAgICAgICAgIHRyZWUubm9kZXMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgcmV0T2JqLm5vZGVzOyAvLyBKdXN0IHN0YXJ0IHJlc2l6aW5nXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHdlIGFyZSBqdXN0IHJlc2l6aW5nXG4gICAgICAgIHJlY3RhbmdsZS5tYWtlTUJSKHRyZWUubm9kZXMsIHRyZWUpO1xuICAgICAgfVxuICAgICAgY3VycmVudERlcHRoIC09IDE7XG4gICAgfVxuICAgIHJldHVybiByZXRBcnJheTtcbiAgfTtcblxuICAvKiBjaG9vc2UgdGhlIGJlc3QgZGFtbiBub2RlIGZvciByZWN0YW5nbGUgdG8gYmUgaW5zZXJ0ZWQgaW50b1xuICAgKiBbIGxlYWYgbm9kZSBwYXJlbnQgXSA9IGNob29zZUxlYWZTdWJ0cmVlKHJlY3RhbmdsZSwgcm9vdCB0byBzdGFydCBzZWFyY2ggYXQpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgY2hvb3NlTGVhZlN1YnRyZWUgPSBmdW5jdGlvbiAocmVjdCwgcm9vdCkge1xuICAgIHZhciBiZXN0Q2hvaWNlSW5kZXggPSAtMTtcbiAgICB2YXIgYmVzdENob2ljZVN0YWNrID0gW107XG4gICAgdmFyIGJlc3RDaG9pY2VBcmVhO1xuICAgIHZhciBmaXJzdCA9IHRydWU7XG4gICAgYmVzdENob2ljZVN0YWNrLnB1c2gocm9vdCk7XG4gICAgdmFyIG5vZGVzID0gcm9vdC5ub2RlcztcblxuICAgIHdoaWxlIChmaXJzdCB8fCBiZXN0Q2hvaWNlSW5kZXggIT09IC0xKSB7XG4gICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJlc3RDaG9pY2VTdGFjay5wdXNoKG5vZGVzW2Jlc3RDaG9pY2VJbmRleF0pO1xuICAgICAgICBub2RlcyA9IG5vZGVzW2Jlc3RDaG9pY2VJbmRleF0ubm9kZXM7XG4gICAgICAgIGJlc3RDaG9pY2VJbmRleCA9IC0xO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gbm9kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIGx0cmVlID0gbm9kZXNbaV07XG4gICAgICAgIGlmICgnbGVhZicgaW4gbHRyZWUpIHtcbiAgICAgICAgICAvLyBCYWlsIG91dCBvZiBldmVyeXRoaW5nIGFuZCBzdGFydCBpbnNlcnRpbmdcbiAgICAgICAgICBiZXN0Q2hvaWNlSW5kZXggPSAtMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBBcmVhIG9mIG5ldyBlbmxhcmdlZCByZWN0YW5nbGVcbiAgICAgICAgdmFyIG9sZExSYXRpbyA9IHJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8obHRyZWUudywgbHRyZWUuaCwgbHRyZWUubm9kZXMubGVuZ3RoICsgMSk7XG5cbiAgICAgICAgLy8gRW5sYXJnZSByZWN0YW5nbGUgdG8gZml0IG5ldyByZWN0YW5nbGVcbiAgICAgICAgdmFyIG53ID0gTWF0aC5tYXgobHRyZWUueCArIGx0cmVlLncsIHJlY3QueCArIHJlY3QudykgLSBNYXRoLm1pbihsdHJlZS54LCByZWN0LngpO1xuICAgICAgICB2YXIgbmggPSBNYXRoLm1heChsdHJlZS55ICsgbHRyZWUuaCwgcmVjdC55ICsgcmVjdC5oKSAtIE1hdGgubWluKGx0cmVlLnksIHJlY3QueSk7XG5cbiAgICAgICAgLy8gQXJlYSBvZiBuZXcgZW5sYXJnZWQgcmVjdGFuZ2xlXG4gICAgICAgIHZhciBscmF0aW8gPSByZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvKG53LCBuaCwgbHRyZWUubm9kZXMubGVuZ3RoICsgMik7XG5cbiAgICAgICAgaWYgKGJlc3RDaG9pY2VJbmRleCA8IDAgfHwgTWF0aC5hYnMobHJhdGlvIC0gb2xkTFJhdGlvKSA8IGJlc3RDaG9pY2VBcmVhKSB7XG4gICAgICAgICAgYmVzdENob2ljZUFyZWEgPSBNYXRoLmFicyhscmF0aW8gLSBvbGRMUmF0aW8pO1xuICAgICAgICAgIGJlc3RDaG9pY2VJbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmVzdENob2ljZVN0YWNrO1xuICB9O1xuXG4gIC8qIHNwbGl0IGEgc2V0IG9mIG5vZGVzIGludG8gdHdvIHJvdWdobHkgZXF1YWxseS1maWxsZWQgbm9kZXNcbiAgICogWyBhbiBhcnJheSBvZiB0d28gbmV3IGFycmF5cyBvZiBub2RlcyBdID0gbGluZWFyU3BsaXQoYXJyYXkgb2Ygbm9kZXMpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgbGluZWFyU3BsaXQgPSBmdW5jdGlvbiAobm9kZXMpIHtcbiAgICB2YXIgbiA9IHBpY2tMaW5lYXIobm9kZXMpO1xuICAgIHdoaWxlIChub2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICBwaWNrTmV4dChub2RlcywgblswXSwgblsxXSk7XG4gICAgfVxuICAgIHJldHVybiBuO1xuICB9O1xuXG4gIC8qIGluc2VydCB0aGUgYmVzdCBzb3VyY2UgcmVjdGFuZ2xlIGludG8gdGhlIGJlc3QgZml0dGluZyBwYXJlbnQgbm9kZTogYSBvciBiXG4gICAqIFtdID0gcGlja05leHQoYXJyYXkgb2Ygc291cmNlIG5vZGVzLCB0YXJnZXQgbm9kZSBhcnJheSBhLCB0YXJnZXQgbm9kZSBhcnJheSBiKVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIHBpY2tOZXh0ID0gZnVuY3Rpb24gKG5vZGVzLCBhLCBiKSB7XG4gIC8vIEFyZWEgb2YgbmV3IGVubGFyZ2VkIHJlY3RhbmdsZVxuICAgIHZhciBhcmVhQSA9IHJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8oYS53LCBhLmgsIGEubm9kZXMubGVuZ3RoICsgMSk7XG4gICAgdmFyIGFyZWFCID0gcmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyhiLncsIGIuaCwgYi5ub2Rlcy5sZW5ndGggKyAxKTtcbiAgICB2YXIgaGlnaEFyZWFEZWx0YTtcbiAgICB2YXIgaGlnaEFyZWFOb2RlO1xuICAgIHZhciBsb3dlc3RHcm93dGhHcm91cDtcblxuICAgIGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7aS0tKSB7XG4gICAgICB2YXIgbCA9IG5vZGVzW2ldO1xuICAgICAgdmFyIG5ld0FyZWFBID0ge307XG4gICAgICBuZXdBcmVhQS54ID0gTWF0aC5taW4oYS54LCBsLngpO1xuICAgICAgbmV3QXJlYUEueSA9IE1hdGgubWluKGEueSwgbC55KTtcbiAgICAgIG5ld0FyZWFBLncgPSBNYXRoLm1heChhLnggKyBhLncsIGwueCArIGwudykgLSBuZXdBcmVhQS54O1xuICAgICAgbmV3QXJlYUEuaCA9IE1hdGgubWF4KGEueSArIGEuaCwgbC55ICsgbC5oKSAtIG5ld0FyZWFBLnk7XG4gICAgICB2YXIgY2hhbmdlTmV3QXJlYUEgPSBNYXRoLmFicyhyZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvKG5ld0FyZWFBLncsIG5ld0FyZWFBLmgsIGEubm9kZXMubGVuZ3RoICsgMikgLSBhcmVhQSk7XG5cbiAgICAgIHZhciBuZXdBcmVhQiA9IHt9O1xuICAgICAgbmV3QXJlYUIueCA9IE1hdGgubWluKGIueCwgbC54KTtcbiAgICAgIG5ld0FyZWFCLnkgPSBNYXRoLm1pbihiLnksIGwueSk7XG4gICAgICBuZXdBcmVhQi53ID0gTWF0aC5tYXgoYi54ICsgYi53LCBsLnggKyBsLncpIC0gbmV3QXJlYUIueDtcbiAgICAgIG5ld0FyZWFCLmggPSBNYXRoLm1heChiLnkgKyBiLmgsIGwueSArIGwuaCkgLSBuZXdBcmVhQi55O1xuICAgICAgdmFyIGNoYW5nZU5ld0FyZWFCID0gTWF0aC5hYnMocmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyhuZXdBcmVhQi53LCBuZXdBcmVhQi5oLCBiLm5vZGVzLmxlbmd0aCArIDIpIC0gYXJlYUIpO1xuXG4gICAgICBpZiAoIWhpZ2hBcmVhTm9kZSB8fCAhaGlnaEFyZWFEZWx0YSB8fCBNYXRoLmFicyhjaGFuZ2VOZXdBcmVhQiAtIGNoYW5nZU5ld0FyZWFBKSA8IGhpZ2hBcmVhRGVsdGEpIHtcbiAgICAgICAgaGlnaEFyZWFOb2RlID0gaTtcbiAgICAgICAgaGlnaEFyZWFEZWx0YSA9IE1hdGguYWJzKGNoYW5nZU5ld0FyZWFCIC0gY2hhbmdlTmV3QXJlYUEpO1xuICAgICAgICBsb3dlc3RHcm93dGhHcm91cCA9IGNoYW5nZU5ld0FyZWFCIDwgY2hhbmdlTmV3QXJlYUEgPyBiIDogYTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHRlbXBOb2RlID0gbm9kZXMuc3BsaWNlKGhpZ2hBcmVhTm9kZSwgMSlbMF07XG4gICAgaWYgKGEubm9kZXMubGVuZ3RoICsgbm9kZXMubGVuZ3RoICsgMSA8PSBtaW5XaWR0aCkge1xuICAgICAgYS5ub2Rlcy5wdXNoKHRlbXBOb2RlKTtcbiAgICAgIHJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUoYSwgdGVtcE5vZGUpO1xuICAgIH0gIGVsc2UgaWYgKGIubm9kZXMubGVuZ3RoICsgbm9kZXMubGVuZ3RoICsgMSA8PSBtaW5XaWR0aCkge1xuICAgICAgYi5ub2Rlcy5wdXNoKHRlbXBOb2RlKTtcbiAgICAgIHJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUoYiwgdGVtcE5vZGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvd2VzdEdyb3d0aEdyb3VwLm5vZGVzLnB1c2godGVtcE5vZGUpO1xuICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShsb3dlc3RHcm93dGhHcm91cCwgdGVtcE5vZGUpO1xuICAgIH1cbiAgfTtcblxuICAvKiBwaWNrIHRoZSAnYmVzdCcgdHdvIHN0YXJ0ZXIgbm9kZXMgdG8gdXNlIGFzIHNlZWRzIHVzaW5nIHRoZSAnbGluZWFyJyBjcml0ZXJpYVxuICAgKiBbIGFuIGFycmF5IG9mIHR3byBuZXcgYXJyYXlzIG9mIG5vZGVzIF0gPSBwaWNrTGluZWFyKGFycmF5IG9mIHNvdXJjZSBub2RlcylcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciBwaWNrTGluZWFyID0gZnVuY3Rpb24gKG5vZGVzKSB7XG4gICAgdmFyIGxvd2VzdEhpZ2hYID0gbm9kZXMubGVuZ3RoIC0gMTtcbiAgICB2YXIgaGlnaGVzdExvd1ggPSAwO1xuICAgIHZhciBsb3dlc3RIaWdoWSA9IG5vZGVzLmxlbmd0aCAtIDE7XG4gICAgdmFyIGhpZ2hlc3RMb3dZID0gMDtcbiAgICB2YXIgdDEsIHQyO1xuXG4gICAgZm9yICh2YXIgaSA9IG5vZGVzLmxlbmd0aCAtIDI7IGkgPj0gMDtpLS0pIHtcbiAgICAgIHZhciBsID0gbm9kZXNbaV07XG4gICAgICBpZiAobC54ID4gbm9kZXNbaGlnaGVzdExvd1hdLngpIHtcbiAgICAgICAgaGlnaGVzdExvd1ggPSBpO1xuICAgICAgfSBlbHNlIGlmIChsLnggKyBsLncgPCBub2Rlc1tsb3dlc3RIaWdoWF0ueCArIG5vZGVzW2xvd2VzdEhpZ2hYXS53KSB7XG4gICAgICAgIGxvd2VzdEhpZ2hYID0gaTtcbiAgICAgIH1cbiAgICAgIGlmIChsLnkgPiBub2Rlc1toaWdoZXN0TG93WV0ueSkge1xuICAgICAgICBoaWdoZXN0TG93WSA9IGk7XG4gICAgICB9IGVsc2UgaWYgKGwueSArIGwuaCA8IG5vZGVzW2xvd2VzdEhpZ2hZXS55ICsgbm9kZXNbbG93ZXN0SGlnaFldLmgpIHtcbiAgICAgICAgbG93ZXN0SGlnaFkgPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgZHggPSBNYXRoLmFicygobm9kZXNbbG93ZXN0SGlnaFhdLnggKyBub2Rlc1tsb3dlc3RIaWdoWF0udykgLSBub2Rlc1toaWdoZXN0TG93WF0ueCk7XG4gICAgdmFyIGR5ID0gTWF0aC5hYnMoKG5vZGVzW2xvd2VzdEhpZ2hZXS55ICsgbm9kZXNbbG93ZXN0SGlnaFldLmgpIC0gbm9kZXNbaGlnaGVzdExvd1ldLnkpO1xuICAgIGlmIChkeCA+IGR5KSAge1xuICAgICAgaWYgKGxvd2VzdEhpZ2hYID4gaGlnaGVzdExvd1gpICB7XG4gICAgICAgIHQxID0gbm9kZXMuc3BsaWNlKGxvd2VzdEhpZ2hYLCAxKVswXTtcbiAgICAgICAgdDIgPSBub2Rlcy5zcGxpY2UoaGlnaGVzdExvd1gsIDEpWzBdO1xuICAgICAgfSAgZWxzZSB7XG4gICAgICAgIHQyID0gbm9kZXMuc3BsaWNlKGhpZ2hlc3RMb3dYLCAxKVswXTtcbiAgICAgICAgdDEgPSBub2Rlcy5zcGxpY2UobG93ZXN0SGlnaFgsIDEpWzBdO1xuICAgICAgfVxuICAgIH0gIGVsc2Uge1xuICAgICAgaWYgKGxvd2VzdEhpZ2hZID4gaGlnaGVzdExvd1kpICB7XG4gICAgICAgIHQxID0gbm9kZXMuc3BsaWNlKGxvd2VzdEhpZ2hZLCAxKVswXTtcbiAgICAgICAgdDIgPSBub2Rlcy5zcGxpY2UoaGlnaGVzdExvd1ksIDEpWzBdO1xuICAgICAgfSAgZWxzZSB7XG4gICAgICAgIHQyID0gbm9kZXMuc3BsaWNlKGhpZ2hlc3RMb3dZLCAxKVswXTtcbiAgICAgICAgdDEgPSBub2Rlcy5zcGxpY2UobG93ZXN0SGlnaFksIDEpWzBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAge3g6IHQxLngsIHk6IHQxLnksIHc6IHQxLncsIGg6IHQxLmgsIG5vZGVzOiBbdDFdfSxcbiAgICAgIHt4OiB0Mi54LCB5OiB0Mi55LCB3OiB0Mi53LCBoOiB0Mi5oLCBub2RlczogW3QyXX1cbiAgICBdO1xuICB9O1xuXG4gIHZhciBhdHRhY2hEYXRhID0gZnVuY3Rpb24gKG5vZGUsIG1vcmVUcmVlKSB7XG4gICAgbm9kZS5ub2RlcyA9IG1vcmVUcmVlLm5vZGVzO1xuICAgIG5vZGUueCA9IG1vcmVUcmVlLng7XG4gICAgbm9kZS55ID0gbW9yZVRyZWUueTtcbiAgICBub2RlLncgPSBtb3JlVHJlZS53O1xuICAgIG5vZGUuaCA9IG1vcmVUcmVlLmg7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cbiAgLyogbm9uLXJlY3Vyc2l2ZSBpbnRlcm5hbCBzZWFyY2ggZnVuY3Rpb25cbiAgKiBbIG5vZGVzIHwgb2JqZWN0cyBdID0gc2VhcmNoU3VidHJlZShyZWN0YW5nbGUsIFtyZXR1cm4gbm9kZSBkYXRhXSwgW2FycmF5IHRvIGZpbGxdLCByb290IHRvIGJlZ2luIHNlYXJjaCBhdClcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciBzZWFyY2hTdWJ0cmVlID0gZnVuY3Rpb24gKHJlY3QsIHJldHVybk5vZGUsIHJldHVybkFycmF5LCByb290KSB7XG4gICAgdmFyIGhpdFN0YWNrID0gW107IC8vIENvbnRhaW5zIHRoZSBlbGVtZW50cyB0aGF0IG92ZXJsYXBcblxuICAgIGlmICghcmVjdGFuZ2xlLm92ZXJsYXBSZWN0YW5nbGUocmVjdCwgcm9vdCkpIHtcbiAgICAgIHJldHVybiByZXR1cm5BcnJheTtcbiAgICB9XG5cblxuICAgIGhpdFN0YWNrLnB1c2gocm9vdC5ub2Rlcyk7XG5cbiAgICB3aGlsZSAoaGl0U3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgdmFyIG5vZGVzID0gaGl0U3RhY2sucG9wKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgbHRyZWUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKHJlY3RhbmdsZS5vdmVybGFwUmVjdGFuZ2xlKHJlY3QsIGx0cmVlKSkge1xuICAgICAgICAgIGlmICgnbm9kZXMnIGluIGx0cmVlKSB7IC8vIE5vdCBhIExlYWZcbiAgICAgICAgICAgIGhpdFN0YWNrLnB1c2gobHRyZWUubm9kZXMpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJ2xlYWYnIGluIGx0cmVlKSB7IC8vIEEgTGVhZiAhIVxuICAgICAgICAgICAgaWYgKCFyZXR1cm5Ob2RlKSB7XG4gICAgICAgICAgICAgIHJldHVybkFycmF5LnB1c2gobHRyZWUubGVhZik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm5BcnJheS5wdXNoKGx0cmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuQXJyYXk7XG4gIH07XG5cbiAgLyogbm9uLXJlY3Vyc2l2ZSBpbnRlcm5hbCBpbnNlcnQgZnVuY3Rpb25cbiAgICogW10gPSBpbnNlcnRTdWJ0cmVlKHJlY3RhbmdsZSwgb2JqZWN0IHRvIGluc2VydCwgcm9vdCB0byBiZWdpbiBpbnNlcnRpb24gYXQpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgaW5zZXJ0U3VidHJlZSA9IGZ1bmN0aW9uIChub2RlLCByb290KSB7XG4gICAgdmFyIGJjOyAvLyBCZXN0IEN1cnJlbnQgbm9kZVxuICAgIC8vIEluaXRpYWwgaW5zZXJ0aW9uIGlzIHNwZWNpYWwgYmVjYXVzZSB3ZSByZXNpemUgdGhlIFRyZWUgYW5kIHdlIGRvbid0XG4gICAgLy8gY2FyZSBhYm91dCBhbnkgb3ZlcmZsb3cgKHNlcmlvdXNseSwgaG93IGNhbiB0aGUgZmlyc3Qgb2JqZWN0IG92ZXJmbG93PylcbiAgICBpZiAocm9vdC5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJvb3QueCA9IG5vZGUueDtcbiAgICAgIHJvb3QueSA9IG5vZGUueTtcbiAgICAgIHJvb3QudyA9IG5vZGUudztcbiAgICAgIHJvb3QuaCA9IG5vZGUuaDtcbiAgICAgIHJvb3Qubm9kZXMucHVzaChub2RlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGaW5kIHRoZSBiZXN0IGZpdHRpbmcgbGVhZiBub2RlXG4gICAgLy8gY2hvb3NlTGVhZiByZXR1cm5zIGFuIGFycmF5IG9mIGFsbCB0cmVlIGxldmVscyAoaW5jbHVkaW5nIHJvb3QpXG4gICAgLy8gdGhhdCB3ZXJlIHRyYXZlcnNlZCB3aGlsZSB0cnlpbmcgdG8gZmluZCB0aGUgbGVhZlxuICAgIHZhciB0cmVlU3RhY2sgPSBjaG9vc2VMZWFmU3VidHJlZShub2RlLCByb290KTtcbiAgICB2YXIgcmV0T2JqID0gbm9kZTsvL3t4OnJlY3QueCx5OnJlY3QueSx3OnJlY3QudyxoOnJlY3QuaCwgbGVhZjpvYmp9O1xuICAgIHZhciBwYmM7XG4gICAgLy8gV2FsayBiYWNrIHVwIHRoZSB0cmVlIHJlc2l6aW5nIGFuZCBpbnNlcnRpbmcgYXMgbmVlZGVkXG4gICAgd2hpbGUgKHRyZWVTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAvL2hhbmRsZSB0aGUgY2FzZSBvZiBhbiBlbXB0eSBub2RlIChmcm9tIGEgc3BsaXQpXG4gICAgICBpZiAoYmMgJiYgJ25vZGVzJyBpbiBiYyAmJiBiYy5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcGJjID0gYmM7IC8vIFBhc3QgYmNcbiAgICAgICAgYmMgPSB0cmVlU3RhY2sucG9wKCk7XG4gICAgICAgIGZvciAodmFyIHQgPSAwO3QgPCBiYy5ub2Rlcy5sZW5ndGg7dCsrKSB7XG4gICAgICAgICAgaWYgKGJjLm5vZGVzW3RdID09PSBwYmMgfHwgYmMubm9kZXNbdF0ubm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBiYy5ub2Rlcy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJjID0gdHJlZVN0YWNrLnBvcCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBkYXRhIGF0dGFjaGVkIHRvIHRoaXMgcmV0T2JqXG4gICAgICBpZiAoJ2xlYWYnIGluIHJldE9iaiB8fCAnbm9kZXMnIGluIHJldE9iaiB8fCBBcnJheS5pc0FycmF5KHJldE9iaikpIHtcbiAgICAgICAgLy8gRG8gSW5zZXJ0XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJldE9iaikpIHtcbiAgICAgICAgICBmb3IgKHZhciBhaSA9IDA7IGFpIDwgcmV0T2JqLmxlbmd0aDsgYWkrKykge1xuICAgICAgICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShiYywgcmV0T2JqW2FpXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJjLm5vZGVzID0gYmMubm9kZXMuY29uY2F0KHJldE9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShiYywgcmV0T2JqKTtcbiAgICAgICAgICBiYy5ub2Rlcy5wdXNoKHJldE9iaik7IC8vIERvIEluc2VydFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJjLm5vZGVzLmxlbmd0aCA8PSBtYXhXaWR0aCkgIHsgLy8gU3RhcnQgUmVzaXplaW5nIFVwIHRoZSBUcmVlXG4gICAgICAgICAgcmV0T2JqID0ge3g6IGJjLngsIHk6IGJjLnksIHc6IGJjLncsIGg6IGJjLmh9O1xuICAgICAgICB9ICBlbHNlIHsgLy8gT3RoZXJ3aXNlIFNwbGl0IHRoaXMgTm9kZVxuICAgICAgICAgIC8vIGxpbmVhclNwbGl0KCkgcmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHR3byBuZXcgbm9kZXNcbiAgICAgICAgICAvLyBmb3JtZWQgZnJvbSB0aGUgc3BsaXQgb2YgdGhlIHByZXZpb3VzIG5vZGUncyBvdmVyZmxvd1xuICAgICAgICAgIHZhciBhID0gbGluZWFyU3BsaXQoYmMubm9kZXMpO1xuICAgICAgICAgIHJldE9iaiA9IGE7Ly9bMV07XG5cbiAgICAgICAgICBpZiAodHJlZVN0YWNrLmxlbmd0aCA8IDEpICB7IC8vIElmIGFyZSBzcGxpdHRpbmcgdGhlIHJvb3QuLlxuICAgICAgICAgICAgYmMubm9kZXMucHVzaChhWzBdKTtcbiAgICAgICAgICAgIHRyZWVTdGFjay5wdXNoKGJjKTsgIC8vIFJlY29uc2lkZXIgdGhlIHJvb3QgZWxlbWVudFxuICAgICAgICAgICAgcmV0T2JqID0gYVsxXTtcbiAgICAgICAgICB9IC8qZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgYmM7XG4gICAgICAgICAgfSovXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIE90aGVyd2lzZSBEbyBSZXNpemVcbiAgICAgICAgLy9KdXN0IGtlZXAgYXBwbHlpbmcgdGhlIG5ldyBib3VuZGluZyByZWN0YW5nbGUgdG8gdGhlIHBhcmVudHMuLlxuICAgICAgICByZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlKGJjLCByZXRPYmopO1xuICAgICAgICByZXRPYmogPSB7eDogYmMueCwgeTogYmMueSwgdzogYmMudywgaDogYmMuaH07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuaW5zZXJ0U3VidHJlZSA9IGluc2VydFN1YnRyZWU7XG4gIC8qIHF1aWNrICduJyBkaXJ0eSBmdW5jdGlvbiBmb3IgcGx1Z2lucyBvciBtYW51YWxseSBkcmF3aW5nIHRoZSB0cmVlXG4gICAqIFsgdHJlZSBdID0gUlRyZWUuZ2V0VHJlZSgpOiByZXR1cm5zIHRoZSByYXcgdHJlZSBkYXRhLiB1c2VmdWwgZm9yIGFkZGluZ1xuICAgKiBAcHVibGljXG4gICAqICEhIERFUFJFQ0FURUQgISFcbiAgICovXG4gIHRoaXMuZ2V0VHJlZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcm9vdFRyZWU7XG4gIH07XG5cbiAgLyogcXVpY2sgJ24nIGRpcnR5IGZ1bmN0aW9uIGZvciBwbHVnaW5zIG9yIG1hbnVhbGx5IGxvYWRpbmcgdGhlIHRyZWVcbiAgICogWyB0cmVlIF0gPSBSVHJlZS5zZXRUcmVlKHN1Yi10cmVlLCB3aGVyZSB0byBhdHRhY2gpOiByZXR1cm5zIHRoZSByYXcgdHJlZSBkYXRhLiB1c2VmdWwgZm9yIGFkZGluZ1xuICAgKiBAcHVibGljXG4gICAqICEhIERFUFJFQ0FURUQgISFcbiAgICovXG4gIHRoaXMuc2V0VHJlZSA9IGZ1bmN0aW9uIChuZXdUcmVlLCB3aGVyZSkge1xuICAgIGlmICghd2hlcmUpIHtcbiAgICAgIHdoZXJlID0gcm9vdFRyZWU7XG4gICAgfVxuICAgIHJldHVybiBhdHRhY2hEYXRhKHdoZXJlLCBuZXdUcmVlKTtcbiAgfTtcblxuICAvKiBub24tcmVjdXJzaXZlIHNlYXJjaCBmdW5jdGlvblxuICAqIFsgbm9kZXMgfCBvYmplY3RzIF0gPSBSVHJlZS5zZWFyY2gocmVjdGFuZ2xlLCBbcmV0dXJuIG5vZGUgZGF0YV0sIFthcnJheSB0byBmaWxsXSlcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdGhpcy5zZWFyY2ggPSBmdW5jdGlvbiAocmVjdCwgcmV0dXJuTm9kZSwgcmV0dXJuQXJyYXkpIHtcbiAgICByZXR1cm5BcnJheSA9IHJldHVybkFycmF5IHx8IFtdO1xuICAgIHJldHVybiBzZWFyY2hTdWJ0cmVlKHJlY3QsIHJldHVybk5vZGUsIHJldHVybkFycmF5LCByb290VHJlZSk7XG4gIH07XG5cblxuICB2YXIgcmVtb3ZlQXJlYSA9IGZ1bmN0aW9uIChyZWN0KSB7XG4gICAgdmFyIG51bWJlckRlbGV0ZWQgPSAxLFxuICAgIHJldEFycmF5ID0gW10sXG4gICAgZGVsZXRlZDtcbiAgICB3aGlsZSAobnVtYmVyRGVsZXRlZCA+IDApIHtcbiAgICAgIGRlbGV0ZWQgPSByZW1vdmVTdWJ0cmVlKHJlY3QsIGZhbHNlLCByb290VHJlZSk7XG4gICAgICBudW1iZXJEZWxldGVkID0gZGVsZXRlZC5sZW5ndGg7XG4gICAgICByZXRBcnJheSA9IHJldEFycmF5LmNvbmNhdChkZWxldGVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldEFycmF5O1xuICB9O1xuXG4gIHZhciByZW1vdmVPYmogPSBmdW5jdGlvbiAocmVjdCwgb2JqKSB7XG4gICAgdmFyIHJldEFycmF5ID0gcmVtb3ZlU3VidHJlZShyZWN0LCBvYmosIHJvb3RUcmVlKTtcbiAgICByZXR1cm4gcmV0QXJyYXk7XG4gIH07XG4gICAgLyogbm9uLXJlY3Vyc2l2ZSBkZWxldGUgZnVuY3Rpb25cbiAgICogW2RlbGV0ZWQgb2JqZWN0XSA9IFJUcmVlLnJlbW92ZShyZWN0YW5nbGUsIFtvYmplY3QgdG8gZGVsZXRlXSlcbiAgICovXG4gIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24gKHJlY3QsIG9iaikge1xuICAgIGlmICghb2JqIHx8IHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiByZW1vdmVBcmVhKHJlY3QsIG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZW1vdmVPYmoocmVjdCwgb2JqKTtcbiAgICB9XG4gIH07XG5cbiAgLyogbm9uLXJlY3Vyc2l2ZSBpbnNlcnQgZnVuY3Rpb25cbiAgICogW10gPSBSVHJlZS5pbnNlcnQocmVjdGFuZ2xlLCBvYmplY3QgdG8gaW5zZXJ0KVxuICAgKi9cbiAgdGhpcy5pbnNlcnQgPSBmdW5jdGlvbiAocmVjdCwgb2JqKSB7XG4gICAgdmFyIHJldEFycmF5ID0gaW5zZXJ0U3VidHJlZSh7eDogcmVjdC54LCB5OiByZWN0LnksIHc6IHJlY3QudywgaDogcmVjdC5oLCBsZWFmOiBvYmp9LCByb290VHJlZSk7XG4gICAgcmV0dXJuIHJldEFycmF5O1xuICB9O1xufVxuUlRyZWUucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIChwcmludGluZykge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5yb290LCBmYWxzZSwgcHJpbnRpbmcpO1xufTtcblxuUlRyZWUuZnJvbUpTT04gPSBmdW5jdGlvbiAoanNvbikge1xuICB2YXIgcnQgPSBuZXcgUlRyZWUoKTtcbiAgcnQuc2V0VHJlZShKU09OLnBhcnNlKGpzb24pKTtcbiAgcmV0dXJuIHJ0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSVHJlZTtcblxuXG4vKipcbiAqIFBvbHlmaWxsIGZvciB0aGUgQXJyYXkuaXNBcnJheSBmdW5jdGlvblxuICogdG9kbzogVGVzdCBvbiBJRTcgYW5kIElFOFxuICogVGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZ2VyYWludGx1ZmYvdHY0L2lzc3Vlcy8yMFxuICovXG5pZiAodHlwZW9mIEFycmF5LmlzQXJyYXkgIT09ICdmdW5jdGlvbicpIHtcbiAgQXJyYXkuaXNBcnJheSA9IGZ1bmN0aW9uIChhKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBhID09PSAnb2JqZWN0JyAmJiB7fS50b1N0cmluZy5jYWxsKGEpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xufVxuIiwiZnVuY3Rpb24gQ2FudmFzRmVhdHVyZShnZW9qc29uLCBpZCkge1xuICAgIFxuICAgIC8vIHJhZGl1cyBmb3IgcG9pbnQgZmVhdHVyZXNcbiAgICAvLyB1c2UgdG8gY2FsY3VsYXRlIG1vdXNlIG92ZXIvb3V0IGFuZCBjbGljayBldmVudHMgZm9yIHBvaW50c1xuICAgIC8vIHRoaXMgdmFsdWUgc2hvdWxkIG1hdGNoIHRoZSB2YWx1ZSB1c2VkIGZvciByZW5kZXJpbmcgcG9pbnRzXG4gICAgdGhpcy5zaXplID0gNTtcbiAgICBcbiAgICAvLyBVc2VyIHNwYWNlIG9iamVjdCBmb3Igc3RvcmUgdmFyaWFibGVzIHVzZWQgZm9yIHJlbmRlcmluZyBnZW9tZXRyeVxuICAgIHRoaXMucmVuZGVyID0ge307XG5cbiAgICB2YXIgY2FjaGUgPSB7XG4gICAgICAgIC8vIHByb2plY3RlZCBwb2ludHMgb24gY2FudmFzXG4gICAgICAgIGNhbnZhc1hZIDogbnVsbCxcbiAgICAgICAgLy8gem9vbSBsZXZlbCBjYW52YXNYWSBwb2ludHMgYXJlIGNhbGN1bGF0ZWQgdG9cbiAgICAgICAgem9vbSA6IC0xXG4gICAgfVxuICAgIFxuICAgIC8vIHBlcmZvcm1hbmNlIGZsYWcsIHdpbGwga2VlcCBpbnZpc2libGUgZmVhdHVyZXMgZm9yIHJlY2FsYyBcbiAgICAvLyBldmVudHMgYXMgd2VsbCBhcyBub3QgYmVpbmcgcmVuZGVyZWRcbiAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgIFxuICAgIC8vIGJvdW5kaW5nIGJveCBmb3IgZ2VvbWV0cnksIHVzZWQgZm9yIGludGVyc2VjdGlvbiBhbmRcbiAgICAvLyB2aXNpYmxpbGl0eSBvcHRpbWl6YXRpb25zXG4gICAgdGhpcy5ib3VuZHMgPSBudWxsO1xuICAgIFxuICAgIC8vIExlYWZsZXQgTGF0TG5nLCB1c2VkIGZvciBwb2ludHMgdG8gcXVpY2tseSBsb29rIGZvciBpbnRlcnNlY3Rpb25cbiAgICB0aGlzLmxhdGxuZyA9IG51bGw7XG4gICAgXG4gICAgLy8gY2xlYXIgdGhlIGNhbnZhc1hZIHN0b3JlZCB2YWx1ZXNcbiAgICB0aGlzLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZGVsZXRlIGNhY2hlLmNhbnZhc1hZO1xuICAgICAgICBjYWNoZS56b29tID0gLTE7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuc2V0Q2FudmFzWFkgPSBmdW5jdGlvbihjYW52YXNYWSwgem9vbSkge1xuICAgICAgICBjYWNoZS5jYW52YXNYWSA9IGNhbnZhc1hZO1xuICAgICAgICBjYWNoZS56b29tID0gem9vbTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5nZXRDYW52YXNYWSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gY2FjaGUuY2FudmFzWFk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMucmVxdWlyZXNSZXByb2plY3Rpb24gPSBmdW5jdGlvbih6b29tKSB7XG4gICAgICBpZiggY2FjaGUuem9vbSA9PSB6b29tICYmIGNhY2hlLmNhbnZhc1hZICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBvcHRpb25hbCwgcGVyIGZlYXR1cmUsIHJlbmRlcmVyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XG5cbiAgICAvLyBnZW9qc29uIHdhcyBvcHRpb25zIG9iamVjdFxuICAgIGlmKCBnZW9qc29uLmdlb2pzb24gKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBnZW9qc29uLnJlbmRlcmVyO1xuICAgICAgICBpZiggZ2VvanNvbi5zaXplICkgdGhpcy5zaXplID0gZ2VvanNvbi5zaXplO1xuICAgICAgICBnZW9qc29uID0gZ2VvanNvbi5nZW9qc29uO1xuICAgIH1cbiAgICBcbiAgICBpZiggZ2VvanNvbi5nZW9tZXRyeSApIHtcbiAgICAgICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICAgICAgdGhpcy5pZCA9IGlkIHx8IGdlb2pzb24ucHJvcGVydGllcy5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmdlb2pzb24gPSB7XG4gICAgICAgICAgICB0eXBlIDogJ0ZlYXR1cmUnLFxuICAgICAgICAgICAgZ2VvbWV0cnkgOiBnZW9qc29uLFxuICAgICAgICAgICAgcHJvcGVydGllcyA6IHtcbiAgICAgICAgICAgICAgICBpZCA6IGlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cblxuICAgIHRoaXMuX3J0cmVlR2VvanNvbiA9IHtcbiAgICAgICAgdHlwZSA6ICdGZWF0dXJlJyxcbiAgICAgICAgZ2VvbWV0cnkgOiB0aGlzLmdlb2pzb24uZ2VvbWV0cnksXG4gICAgICAgIHByb3BlcnRpZXMgOiB7XG4gICAgICAgICAgICBpZCA6IGlkIHx8IHRoaXMuZ2VvanNvbi5wcm9wZXJ0aWVzLmlkXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSB0aGlzLmdlb2pzb24uZ2VvbWV0cnkudHlwZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNGZWF0dXJlOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9DYW52YXNGZWF0dXJlJyk7XG5cbmZ1bmN0aW9uIENhbnZhc0ZlYXR1cmVzKGdlb2pzb24pIHtcbiAgICAvLyBxdWljayB0eXBlIGZsYWdcbiAgICB0aGlzLmlzQ2FudmFzRmVhdHVyZXMgPSB0cnVlO1xuICAgIFxuICAgIHRoaXMuY2FudmFzRmVhdHVyZXMgPSBbXTtcbiAgICBcbiAgICAvLyBhY3R1YWwgZ2VvanNvbiBvYmplY3QsIHdpbGwgbm90IGJlIG1vZGlmZWQsIGp1c3Qgc3RvcmVkXG4gICAgdGhpcy5nZW9qc29uID0gZ2VvanNvbjtcbiAgICBcbiAgICAvLyBwZXJmb3JtYW5jZSBmbGFnLCB3aWxsIGtlZXAgaW52aXNpYmxlIGZlYXR1cmVzIGZvciByZWNhbGMgXG4gICAgLy8gZXZlbnRzIGFzIHdlbGwgYXMgbm90IGJlaW5nIHJlbmRlcmVkXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmNhbnZhc0ZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNGZWF0dXJlc1tpXS5jbGVhckNhY2hlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIHRoaXMuZ2VvanNvbiApIHtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmdlb2pzb24uZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzLnB1c2gobmV3IENhbnZhc0ZlYXR1cmUodGhpcy5nZW9qc29uLmZlYXR1cmVzW2ldKSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRmVhdHVyZXM7IiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZXMnKTtcblxuZnVuY3Rpb24gZmFjdG9yeShhcmcpIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheShhcmcpICkge1xuICAgICAgICByZXR1cm4gYXJnLm1hcChnZW5lcmF0ZSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBnZW5lcmF0ZShhcmcpO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZShnZW9qc29uKSB7XG4gICAgaWYoIGdlb2pzb24udHlwZSA9PT0gJ0ZlYXR1cmVDb2xsZWN0aW9uJyApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNGZWF0dXJlcyhnZW9qc29uKTtcbiAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlJyApIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDYW52YXNGZWF0dXJlKGdlb2pzb24pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIEdlb0pTT046ICcrZ2VvanNvbi50eXBlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5OyIsInZhciBjdHg7XG5cbi8qKlxuICogRnVjdGlvbiBjYWxsZWQgaW4gc2NvcGUgb2YgQ2FudmFzRmVhdHVyZVxuICovXG5mdW5jdGlvbiByZW5kZXIoY29udGV4dCwgeHlQb2ludHMsIG1hcCwgY2FudmFzRmVhdHVyZSkge1xuICAgIGN0eCA9IGNvbnRleHQ7XG4gICAgXG4gICAgaWYoIGNhbnZhc0ZlYXR1cmUudHlwZSA9PT0gJ1BvaW50JyApIHtcbiAgICAgICAgcmVuZGVyUG9pbnQoeHlQb2ludHMsIHRoaXMuc2l6ZSk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgcmVuZGVyTGluZSh4eVBvaW50cyk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdQb2x5Z29uJyApIHtcbiAgICAgICAgcmVuZGVyUG9seWdvbih4eVBvaW50cyk7XG4gICAgfSBlbHNlIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgICB4eVBvaW50cy5mb3JFYWNoKHJlbmRlclBvbHlnb24pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyUG9pbnQoeHlQb2ludCwgc2l6ZSkge1xuICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgIGN0eC5hcmMoeHlQb2ludC54LCB4eVBvaW50LnksIHNpemUsIDAsIDIgKiBNYXRoLlBJLCBmYWxzZSk7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdncmVlbic7XG5cbiAgICBjdHguc3Ryb2tlKCk7XG4gICAgY3R4LmZpbGwoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTGluZSh4eVBvaW50cykge1xuXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdvcmFuZ2UnO1xuICAgIGN0eC5maWxsU3R5bGUgPSAncmdiYSgwLCAwLCAwLCAuMyknO1xuICAgIGN0eC5saW5lV2lkdGggPSAyO1xuXG4gICAgdmFyIGo7XG4gICAgY3R4Lm1vdmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcbiAgICBmb3IoIGogPSAxOyBqIDwgeHlQb2ludHMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgIGN0eC5saW5lVG8oeHlQb2ludHNbal0ueCwgeHlQb2ludHNbal0ueSk7XG4gICAgfVxuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBvbHlnb24oeHlQb2ludHMpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ3doaXRlJztcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMjU1LCAxNTIsIDAsLjgpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcblxuICAgIHZhciBqO1xuICAgIGN0eC5tb3ZlVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG4gICAgZm9yKCBqID0gMTsgaiA8IHh5UG9pbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjdHgubGluZVRvKHh5UG9pbnRzW2pdLngsIHh5UG9pbnRzW2pdLnkpO1xuICAgIH1cbiAgICBjdHgubGluZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlcycpO1xuXG5mdW5jdGlvbiBDYW52YXNMYXllcigpIHtcbiAgLy8gc2hvdyBsYXllciB0aW1pbmdcbiAgdGhpcy5kZWJ1ZyA9IGZhbHNlO1xuXG4gIC8vIGluY2x1ZGUgZXZlbnRzXG4gIHRoaXMuaW5jbHVkZXMgPSBbTC5NaXhpbi5FdmVudHNdO1xuXG4gIC8vIGdlb21ldHJ5IGhlbHBlcnNcbiAgdGhpcy51dGlscyA9IHJlcXVpcmUoJy4vbGliL3V0aWxzJyk7XG5cbiAgLy8gcmVjb21tZW5kZWQgeW91IG92ZXJyaWRlIHRoaXMuICB5b3UgY2FuIGFsc28gc2V0IGEgY3VzdG9tIHJlbmRlcmVyXG4gIC8vIGZvciBlYWNoIENhbnZhc0ZlYXR1cmUgaWYgeW91IHdpc2hcbiAgdGhpcy5yZW5kZXJlciA9IHJlcXVpcmUoJy4vZGVmYXVsdFJlbmRlcmVyJyk7XG5cbiAgdGhpcy5nZXRDYW52YXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xuICB9O1xuXG4gIHRoaXMuZHJhdyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfTtcblxuICB0aGlzLmFkZFRvID0gZnVuY3Rpb24gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHJlc2V0IGFjdHVhbCBjYW52YXMgc2l6ZVxuICAgIHZhciBzaXplID0gdGhpcy5fbWFwLmdldFNpemUoKTtcbiAgICB0aGlzLl9jYW52YXMud2lkdGggPSBzaXplLng7XG4gICAgdGhpcy5fY2FudmFzLmhlaWdodCA9IHNpemUueTtcbiAgfTtcblxuICAvLyBjbGVhciBjYW52YXNcbiAgdGhpcy5jbGVhckNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG5cbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhpcyBpcyBjYWxsZWQgYWZ0ZXIuLi5cbiAgICB0aGlzLnJlcG9zaXRpb24oKTtcbiAgfVxuXG4gIHRoaXMucmVwb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b3BMZWZ0ID0gdGhpcy5fbWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnRvcCA9IHRvcExlZnQueSsncHgnO1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS5sZWZ0ID0gdG9wTGVmdC54KydweCc7XG4gICAgLy9MLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB0b3BMZWZ0KTtcbiAgfVxuXG4gIC8vIGNsZWFyIGVhY2ggZmVhdHVyZXMgY2FjaGVcbiAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8ga2lsbCB0aGUgZmVhdHVyZSBwb2ludCBjYWNoZVxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBnZXQgbGF5ZXIgZmVhdHVyZSB2aWEgZ2VvanNvbiBvYmplY3RcbiAgdGhpcy5nZXRDYW52YXNGZWF0dXJlQnlJZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuZmVhdHVyZUluZGV4W2lkXTtcbiAgfVxuXG4gIC8vIGdldCB0aGUgbWV0ZXJzIHBlciBweCBhbmQgYSBjZXJ0YWluIHBvaW50O1xuICB0aGlzLmdldE1ldGVyc1BlclB4ID0gZnVuY3Rpb24obGF0bG5nKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubWV0ZXJzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICB9XG5cbiAgdGhpcy5nZXREZWdyZWVzUGVyUHggPSBmdW5jdGlvbihsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5kZWdyZWVzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICB9XG59O1xuXG52YXIgbGF5ZXIgPSBuZXcgQ2FudmFzTGF5ZXIoKTtcblxuXG5yZXF1aXJlKCcuL2xpYi9pbml0JykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvcmVkcmF3JykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvYWRkRmVhdHVyZScpKGxheWVyKTtcbnJlcXVpcmUoJy4vbGliL3RvQ2FudmFzWFknKShsYXllcik7XG5cbkwuQ2FudmFzRmVhdHVyZUZhY3RvcnkgPSByZXF1aXJlKCcuL2NsYXNzZXMvZmFjdG9yeScpO1xuTC5DYW52YXNGZWF0dXJlID0gQ2FudmFzRmVhdHVyZTtcbkwuQ2FudmFzRmVhdHVyZUNvbGxlY3Rpb24gPSBDYW52YXNGZWF0dXJlcztcbkwuQ2FudmFzR2VvanNvbkxheWVyID0gTC5DbGFzcy5leHRlbmQobGF5ZXIpO1xuIiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4uL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICBsYXllci5hZGRDYW52YXNGZWF0dXJlcyA9IGZ1bmN0aW9uKGZlYXR1cmVzKSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuYWRkQ2FudmFzRmVhdHVyZShmZWF0dXJlc1tpXSwgZmFsc2UsIG51bGwsIGZhbHNlKTtcbiAgICB9XG5cbiAgICB0aGlzLnJlYnVpbGRJbmRleCh0aGlzLmZlYXR1cmVzKTtcbiAgfTtcblxuICBsYXllci5hZGRDYW52YXNGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSwgYm90dG9tLCBjYWxsYmFjaykge1xuICAgIGlmKCAhKGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlKSAmJiAhKGZlYXR1cmUgaW5zdGFuY2VvZiBDYW52YXNGZWF0dXJlcykgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZlYXR1cmUgbXVzdCBiZSBpbnN0YW5jZSBvZiBDYW52YXNGZWF0dXJlIG9yIENhbnZhc0ZlYXR1cmVzJyk7XG4gICAgfVxuXG4gICAgaWYoIGJvdHRvbSApIHsgLy8gYm90dG9tIG9yIGluZGV4XG4gICAgICBpZiggdHlwZW9mIGJvdHRvbSA9PT0gJ251bWJlcicpIHRoaXMuZmVhdHVyZXMuc3BsaWNlKGJvdHRvbSwgMCwgZmVhdHVyZSk7XG4gICAgICBlbHNlIHRoaXMuZmVhdHVyZXMudW5zaGlmdChmZWF0dXJlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mZWF0dXJlcy5wdXNoKGZlYXR1cmUpO1xuICAgIH1cblxuICAgIHRoaXMuZmVhdHVyZUluZGV4W2ZlYXR1cmUuaWRdID0gZmVhdHVyZTtcblxuICAgIHRoaXMuYWRkVG9JbmRleChmZWF0dXJlKTtcblxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmVhdHVyZXNbaV0ub3JkZXIgPSBpO1xuICAgIH1cbiAgfSxcblxuICAvLyByZXR1cm5zIHRydWUgaWYgcmUtcmVuZGVyIHJlcXVpcmVkLiAgaWUgdGhlIGZlYXR1cmUgd2FzIHZpc2libGU7XG4gIGxheWVyLnJlbW92ZUNhbnZhc0ZlYXR1cmUgPSBmdW5jdGlvbihmZWF0dXJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5mZWF0dXJlcy5pbmRleE9mKGZlYXR1cmUpO1xuICAgIGlmKCBpbmRleCA9PSAtMSApIHJldHVybjtcblxuICAgIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIHRoaXMucmVidWlsZEluZGV4KHRoaXMuZmVhdHVyZXMpO1xuXG4gICAgaWYoIHRoaXMuZmVhdHVyZS52aXNpYmxlICkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICBcbiAgbGF5ZXIucmVtb3ZlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IHRydWU7XG4gICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICAgIHRoaXMucmVidWlsZEluZGV4KHRoaXMuZmVhdHVyZXMpO1xuICB9XG59IiwidmFyIGludGVyc2VjdFV0aWxzID0gcmVxdWlyZSgnLi9pbnRlcnNlY3RzJyk7XG52YXIgUlRyZWUgPSByZXF1aXJlKCdydHJlZScpO1xudmFyIGNvdW50ID0gMDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgIFxuICAgIGxheWVyLmluaXRpYWxpemUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc2hvd2luZyA9IHRydWU7XG5cbiAgICAgICAgLy8gbGlzdCBvZiBnZW9qc29uIGZlYXR1cmVzIHRvIGRyYXdcbiAgICAgICAgLy8gICAtIHRoZXNlIHdpbGwgZHJhdyBpbiBvcmRlclxuICAgICAgICB0aGlzLmZlYXR1cmVzID0gW107XG4gICAgICAgIC8vIGxvb2t1cCBpbmRleFxuICAgICAgICB0aGlzLmZlYXR1cmVJbmRleCA9IHt9O1xuXG4gICAgICAgIC8vIGxpc3Qgb2YgY3VycmVudCBmZWF0dXJlcyB1bmRlciB0aGUgbW91c2VcbiAgICAgICAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gW107XG5cbiAgICAgICAgLy8gdXNlZCB0byBjYWxjdWxhdGUgcGl4ZWxzIG1vdmVkIGZyb20gY2VudGVyXG4gICAgICAgIHRoaXMubGFzdENlbnRlckxMID0gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubW92aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgd29ya1xuICAgICAgICB0aGlzLmFsbG93UGFuUmVuZGVyaW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy8gc2V0IG9wdGlvbnNcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIG1vdmUgbW91c2UgZXZlbnQgaGFuZGxlcnMgdG8gbGF5ZXIgc2NvcGVcbiAgICAgICAgdmFyIG1vdXNlRXZlbnRzID0gWydvbk1vdXNlT3ZlcicsICdvbk1vdXNlTW92ZScsICdvbk1vdXNlT3V0JywgJ29uQ2xpY2snXTtcbiAgICAgICAgbW91c2VFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGlmKCAhdGhpcy5vcHRpb25zW2VdICkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpc1tlXSA9IHRoaXMub3B0aW9uc1tlXTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnNbZV07XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5yVHJlZSA9IG5ldyBSVHJlZSgpO1xuXG4gICAgICAgIC8vIHNldCBjYW52YXMgYW5kIGNhbnZhcyBjb250ZXh0IHNob3J0Y3V0c1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBjcmVhdGVDYW52YXMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2N0eCA9IHRoaXMuX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIH07XG5cbiAgICBpbnRlcnNlY3RVdGlscyhsYXllcik7XG4gICAgXG4gICAgbGF5ZXIub25BZGQgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuXG4gICAgICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAgICAgLy8gdGhlIGNvbnRhaW5lciBpcyBtb3ZlZCBpbiB0aGUgb3Bvc2l0ZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgICAgIC8vIG1hcCBwYW5lIHRvIGtlZXAgdGhlIGNhbnZhcyBhbHdheXMgaW4gKDAsIDApXG4gICAgICAgIC8vdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcbiAgICAgICAgdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy5tYXJrZXJQYW5lO1xuICAgICAgICB2YXIgX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWxheWVyLScrY291bnQpO1xuICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgIF9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fY2FudmFzKTtcbiAgICAgICAgdGlsZVBhbmUuYXBwZW5kQ2hpbGQoX2NvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgICAgICAvLyBoYWNrOiBsaXN0ZW4gdG8gcHJlZHJhZyBldmVudCBsYXVuY2hlZCBieSBkcmFnZ2luZyB0b1xuICAgICAgICAvLyBzZXQgY29udGFpbmVyIGluIHBvc2l0aW9uICgwLCAwKSBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICAgICAgLy8gaWYgKG1hcC5kcmFnZ2luZy5lbmFibGVkKCkpIHtcbiAgICAgICAgLy8gICAgIG1hcC5kcmFnZ2luZy5fZHJhZ2dhYmxlLm9uKCdwcmVkcmFnJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICAgICAgdmFyIGQgPSBtYXAuZHJhZ2dpbmcuX2RyYWdnYWJsZTtcbiAgICAgICAgLy8gICAgICAgICBMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB7IHg6IC1kLl9uZXdQb3MueCwgeTogLWQuX25ld1Bvcy55IH0pO1xuICAgICAgICAvLyAgICAgfSwgdGhpcyk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBtYXAub24oe1xuICAgICAgICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLm9uUmVzaXplLFxuICAgICAgICAgICAgJ3Jlc2l6ZScgICAgOiB0aGlzLm9uUmVzaXplLFxuICAgICAgICAgICAgJ3pvb21zdGFydCcgOiBzdGFydFpvb20sXG4gICAgICAgICAgICAnem9vbWVuZCcgICA6IGVuZFpvb20sXG4gICAgICAgIC8vICAgICdtb3Zlc3RhcnQnIDogbW92ZVN0YXJ0LFxuICAgICAgICAgICAgJ21vdmVlbmQnICAgOiBtb3ZlRW5kLFxuICAgICAgICAgICAgJ21vdXNlbW92ZScgOiB0aGlzLmludGVyc2VjdHMsXG4gICAgICAgICAgICAnY2xpY2snICAgICA6IHRoaXMuaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcblxuICAgICAgICBpZiggdGhpcy56SW5kZXggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0WkluZGV4KHRoaXMuekluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsYXllci5vblJlbW92ZSA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgICBtYXAub2ZmKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5vblJlc2l6ZSxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5vblJlc2l6ZSxcbiAgICAgICAgIC8vICAgJ21vdmVzdGFydCcgOiBtb3ZlU3RhcnQsXG4gICAgICAgICAgICAnbW92ZWVuZCcgICA6IG1vdmVFbmQsXG4gICAgICAgICAgICAnem9vbXN0YXJ0JyA6IHN0YXJ0Wm9vbSxcbiAgICAgICAgICAgICd6b29tZW5kJyAgIDogZW5kWm9vbSxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogdGhpcy5pbnRlcnNlY3RzLFxuICAgICAgICAgICAgJ2NsaWNrJyAgICAgOiB0aGlzLmludGVyc2VjdHNcbiAgICAgICAgfSwgdGhpcyk7XG4gICAgfVxuXG4gICAgdmFyIHJlc2l6ZVRpbWVyID0gLTE7XG4gICAgbGF5ZXIub25SZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYoIHJlc2l6ZVRpbWVyICE9PSAtMSApIGNsZWFyVGltZW91dChyZXNpemVUaW1lcik7XG5cbiAgICAgICAgcmVzaXplVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXNpemVUaW1lciA9IC0xO1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9LmJpbmQodGhpcyksIDEwMCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDYW52YXMob3B0aW9ucykge1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgIGNhbnZhcy5zdHlsZS50b3AgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICBjYW52YXMuc3R5bGUucG9pbnRlckV2ZW50cyA9IFwibm9uZVwiO1xuICAgIGNhbnZhcy5zdHlsZS56SW5kZXggPSBvcHRpb25zLnpJbmRleCB8fCAwO1xuICAgIHZhciBjbGFzc05hbWUgPSAnbGVhZmxldC10aWxlLWNvbnRhaW5lciBsZWFmbGV0LXpvb20tYW5pbWF0ZWQnO1xuICAgIGNhbnZhcy5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY2xhc3NOYW1lKTtcbiAgICByZXR1cm4gY2FudmFzO1xufVxuXG5mdW5jdGlvbiBzdGFydFpvb20oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAnaGlkZGVuJztcbiAgICB0aGlzLnpvb21pbmcgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBlbmRab29tKCkge1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xuICAgIHNldFRpbWVvdXQodGhpcy5yZW5kZXIuYmluZCh0aGlzKSwgNTApO1xufVxuXG5mdW5jdGlvbiBtb3ZlU3RhcnQoKSB7XG4gICAgaWYoIHRoaXMubW92aW5nICkgcmV0dXJuO1xuICAgIHRoaXMubW92aW5nID0gdHJ1ZTtcbiAgICBcbiAgICAvL2lmKCAhdGhpcy5hbGxvd1BhblJlbmRlcmluZyApIHJldHVybjtcbiAgICByZXR1cm47XG4gICAgLy8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbn1cblxuZnVuY3Rpb24gbW92ZUVuZChlKSB7XG4gICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcihlKTtcbn07XG5cbmZ1bmN0aW9uIGZyYW1lUmVuZGVyKCkge1xuICAgIGlmKCAhdGhpcy5tb3ZpbmcgKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgXG4gICAgaWYoIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCA+IDc1ICkge1xuICAgICAgICBpZiggdGhpcy5kZWJ1ZyApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEaXNhYmxlZCByZW5kZXJpbmcgd2hpbGUgcGFuaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKCAhdGhpcy5tb3ZpbmcgKSByZXR1cm47XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWVSZW5kZXIuYmluZCh0aGlzKSk7XG4gICAgfS5iaW5kKHRoaXMpLCA3NTApO1xufSIsInZhciBSVHJlZSA9IHJlcXVpcmUoJ3J0cmVlJyk7XG5cblxuLyoqIFxuICogSGFuZGxlIG1vdXNlIGludGVyc2VjdGlvbiBldmVudHNcbiAqIGUgLSBsZWFmbGV0IGV2ZW50XG4gKiovXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGUpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIHZhciBkcHAgPSB0aGlzLmdldERlZ3JlZXNQZXJQeChlLmxhdGxuZyk7XG5cbiAgICB2YXIgbXBwID0gdGhpcy5nZXRNZXRlcnNQZXJQeChlLmxhdGxuZyk7XG4gICAgdmFyIHIgPSBtcHAgKiA1OyAvLyA1IHB4IHJhZGl1cyBidWZmZXI7XG5cbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgdHlwZSA6ICdQb2ludCcsXG4gICAgICBjb29yZGluYXRlcyA6IFtlLmxhdGxuZy5sbmcsIGUubGF0bG5nLmxhdF1cbiAgICB9O1xuXG4gICAgdmFyIGNvbnRhaW5lclBvaW50ID0gZS5jb250YWluZXJQb2ludDtcblxuICAgIHZhciB4MSA9IGUubGF0bG5nLmxuZyAtIGRwcDtcbiAgICB2YXIgeDIgPSBlLmxhdGxuZy5sbmcgKyBkcHA7XG4gICAgdmFyIHkxID0gZS5sYXRsbmcubGF0IC0gZHBwO1xuICAgIHZhciB5MiA9IGUubGF0bG5nLmxhdCArIGRwcDtcblxuICAgIHZhciBpbnRlcnNlY3RzID0gdGhpcy5pbnRlcnNlY3RzQmJveChbW3gxLCB5MV0sIFt4MiwgeTJdXSwgciwgY2VudGVyLCBjb250YWluZXJQb2ludCk7XG5cbiAgICBvbkludGVyc2VjdHNMaXN0Q3JlYXRlZC5jYWxsKHRoaXMsIGUsIGludGVyc2VjdHMpO1xufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RzQmJveChiYm94LCBwcmVjaXNpb24sIGNlbnRlciwgY29udGFpbmVyUG9pbnQpIHtcbiAgICB2YXIgY2xGZWF0dXJlcyA9IFtdO1xuICAgIHZhciBmZWF0dXJlcyA9IHRoaXMuclRyZWUuYmJveChiYm94KTtcbiAgICB2YXIgaSwgZiwgY2xGZWF0dXJlO1xuXG4gICAgZm9yKCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY2xGZWF0dXJlID0gdGhpcy5nZXRDYW52YXNGZWF0dXJlQnlJZChmZWF0dXJlc1tpXS5wcm9wZXJ0aWVzLmlkKTtcbiAgICAgIGlmKCAhY2xGZWF0dXJlLnZpc2libGUgKSBjb250aW51ZTtcbiAgICAgIGNsRmVhdHVyZXMucHVzaChjbEZlYXR1cmUpO1xuICAgIH1cblxuICAgIC8vIG5vdyBtYWtlIHN1cmUgdGhpcyBhY3R1YWxseSBvdmVybGFwIGlmIHByZWNpc2lvbiBpcyBnaXZlblxuICAgIGlmKCBwcmVjaXNpb24gKSB7XG4gICAgICBmb3IoIHZhciBpID0gY2xGZWF0dXJlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgZiA9IGNsRmVhdHVyZXNbaV07XG4gICAgICAgIGlmKCAhdGhpcy51dGlscy5nZW9tZXRyeVdpdGhpblJhZGl1cyhmLmdlb2pzb24uZ2VvbWV0cnksIGYuZ2V0Q2FudmFzWFkoKSwgY2VudGVyLCBjb250YWluZXJQb2ludCwgcHJlY2lzaW9uKSApIHtcbiAgICAgICAgICBjbEZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbEZlYXR1cmVzO1xufVxuXG5mdW5jdGlvbiBvbkludGVyc2VjdHNMaXN0Q3JlYXRlZChlLCBpbnRlcnNlY3RzKSB7XG4gIGlmKCBlLnR5cGUgPT0gJ2NsaWNrJyAmJiB0aGlzLm9uQ2xpY2sgKSB7XG4gICAgdGhpcy5vbkNsaWNrKGludGVyc2VjdHMpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBtb3VzZW92ZXIgPSBbXSwgbW91c2VvdXQgPSBbXSwgbW91c2Vtb3ZlID0gW107XG5cbiAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrICkge1xuICAgIGlmKCB0aGlzLmludGVyc2VjdExpc3QuaW5kZXhPZihpbnRlcnNlY3RzW2ldKSA+IC0xICkge1xuICAgICAgbW91c2Vtb3ZlLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgbW91c2VvdmVyLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgfVxuICB9XG5cbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmludGVyc2VjdExpc3QubGVuZ3RoOyBpKysgKSB7XG4gICAgaWYoIGludGVyc2VjdHMuaW5kZXhPZih0aGlzLmludGVyc2VjdExpc3RbaV0pID09IC0xICkge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICBtb3VzZW91dC5wdXNoKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gaW50ZXJzZWN0cztcblxuICBpZiggdGhpcy5vbk1vdXNlT3ZlciAmJiBtb3VzZW92ZXIubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU92ZXIuY2FsbCh0aGlzLCBtb3VzZW92ZXIsIGUpO1xuICBpZiggdGhpcy5vbk1vdXNlTW92ZSApIHRoaXMub25Nb3VzZU1vdmUuY2FsbCh0aGlzLCBtb3VzZW1vdmUsIGUpOyAvLyBhbHdheXMgZmlyZVxuICBpZiggdGhpcy5vbk1vdXNlT3V0ICYmIG1vdXNlb3V0Lmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VPdXQuY2FsbCh0aGlzLCBtb3VzZW91dCwgZSk7XG59XG5cbmZ1bmN0aW9uIHJlYnVpbGQoY2xGZWF0dXJlcykge1xuICB2YXIgZmVhdHVyZXMgPSBbXTtcblxuICBmb3IoIHZhciBpID0gMDsgaSA8IGNsRmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgZmVhdHVyZXMucHVzaChjbEZlYXR1cmVzW2ldLl9ydHJlZUdlb2pzb24pOyBcbiAgICBjbEZlYXR1cmVzW2ldLm9yZGVyID0gaTtcbiAgfVxuXG4gIHRoaXMuclRyZWUgPSBuZXcgUlRyZWUoKTtcbiAgdGhpcy5yVHJlZS5nZW9KU09OKHtcbiAgICB0eXBlIDogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICBmZWF0dXJlcyA6IGZlYXR1cmVzXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGQoY2xGZWF0dXJlKSB7XG4gIHRoaXMuclRyZWUuZ2VvSlNPTihjbEZlYXR1cmUuX3J0cmVlR2VvanNvbik7XG59XG5cbi8vIFRPRE86IG5lZWQgdG8gcHJvdG90eXBlIHRoZXNlIGZ1bmN0aW9uc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICBsYXllci5pbnRlcnNlY3RzID0gaW50ZXJzZWN0cztcbiAgbGF5ZXIuaW50ZXJzZWN0c0Jib3ggPSBpbnRlcnNlY3RzQmJveDtcbiAgbGF5ZXIucmVidWlsZEluZGV4ID0gcmVidWlsZDtcbiAgbGF5ZXIuYWRkVG9JbmRleCA9IGFkZDtcbn1cbiIsInZhciBydW5uaW5nID0gZmFsc2U7XG52YXIgcmVzY2hlZHVsZSA9IG51bGw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgbGF5ZXIucmVuZGVyID0gZnVuY3Rpb24oZSkge1xuICAgIGlmKCAhdGhpcy5hbGxvd1BhblJlbmRlcmluZyAmJiB0aGlzLm1vdmluZyApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdCwgZGlmZlxuICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgICB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfVxuXG4gICAgdmFyIGRpZmYgPSBudWxsO1xuICAgIHZhciBjZW50ZXIgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XG5cbiAgICBpZiggZSAmJiBlLnR5cGUgPT0gJ21vdmVlbmQnICkge1xuICAgICAgdmFyIHB0ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoY2VudGVyKTtcblxuICAgICAgaWYoIHRoaXMubGFzdENlbnRlckxMICkge1xuICAgICAgICB2YXIgbGFzdFh5ID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQodGhpcy5sYXN0Q2VudGVyTEwpO1xuICAgICAgICBkaWZmID0ge1xuICAgICAgICAgIHggOiBsYXN0WHkueCAtIHB0LngsXG4gICAgICAgICAgeSA6IGxhc3RYeS55IC0gcHQueVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIHRoaXMubGFzdENlbnRlckxMID0gY2VudGVyO1xuXG4gICAgaWYoICF0aGlzLnpvb21pbmcgKSB7XG4gICAgICB0aGlzLnJlZHJhdyhkaWZmKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jbGVhckNhbnZhcygpO1xuICAgIH1cblxuICB9LFxuICAgIFxuXG4gIC8vIHJlZHJhdyBhbGwgZmVhdHVyZXMuICBUaGlzIGRvZXMgbm90IGhhbmRsZSBjbGVhcmluZyB0aGUgY2FudmFzIG9yIHNldHRpbmdcbiAgLy8gdGhlIGNhbnZhcyBjb3JyZWN0IHBvc2l0aW9uLiAgVGhhdCBpcyBoYW5kbGVkIGJ5IHJlbmRlclxuICBsYXllci5yZWRyYXcgPSBmdW5jdGlvbihkaWZmKSB7XG4gICAgaWYoICF0aGlzLnNob3dpbmcgKSByZXR1cm47XG5cbiAgICAvLyBpZiggcnVubmluZyApIHtcbiAgICAvLyAgIHJlc2NoZWR1bGUgPSB0cnVlO1xuICAgIC8vICAgcmV0dXJuO1xuICAgIC8vIH1cbiAgICAvLyBydW5uaW5nID0gdHJ1ZTtcblxuICAgIC8vIG9iamVjdHMgc2hvdWxkIGtlZXAgdHJhY2sgb2YgbGFzdCBiYm94IGFuZCB6b29tIG9mIG1hcFxuICAgIC8vIGlmIHRoaXMgaGFzbid0IGNoYW5nZWQgdGhlIGxsIC0+IGNvbnRhaW5lciBwdCBpcyBub3QgbmVlZGVkXG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuX21hcC5nZXRCb3VuZHMoKTtcbiAgICB2YXIgem9vbSA9IHRoaXMuX21hcC5nZXRab29tKCk7XG5cbiAgICB2YXIgZiwgaSwgc3ViZmVhdHVyZSwgajtcbiAgICBmb3IoIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGYgPSB0aGlzLmZlYXR1cmVzW2ldO1xuXG4gICAgICBpZiggZi5pc0NhbnZhc0ZlYXR1cmVzICkge1xuXG4gICAgICAgIGZvciggaiA9IDA7IGogPCBmLmNhbnZhc0ZlYXR1cmVzLmxlbmd0aDsgaisrICkge1xuICAgICAgICAgIHRoaXMucHJlcGFyZUZvclJlZHJhdyhmLmNhbnZhc0ZlYXR1cmVzW2pdLCBib3VuZHMsIHpvb20sIGRpZmYpO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJlcGFyZUZvclJlZHJhdyhmLCBib3VuZHMsIHpvb20sIGRpZmYpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBmZWF0dXJlcyA9IHRoaXMuaW50ZXJzZWN0c0Jib3goW1tib3VuZHMuZ2V0V2VzdCgpLCBib3VuZHMuZ2V0U291dGgoKV0sIFtib3VuZHMuZ2V0RWFzdCgpLCBib3VuZHMuZ2V0Tm9ydGgoKV1dLCBudWxsLCBudWxsLCBudWxsKTtcbiAgICB0aGlzLnJlZHJhd0ZlYXR1cmVzKGZlYXR1cmVzKTtcbiAgfSxcblxuICBsYXllci5yZWRyYXdGZWF0dXJlcyA9IGZ1bmN0aW9uKGZlYXR1cmVzKSB7XG4gICAgdGhpcy5jbGVhckNhbnZhcygpO1xuXG5cbiAgICBmZWF0dXJlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgaWYoIGEub3JkZXIgPiBiLm9yZGVyICkgcmV0dXJuIDE7XG4gICAgICBpZiggYS5vcmRlciA8IGIub3JkZXIgKSByZXR1cm4gLTE7XG4gICAgICByZXR1cm4gMDtcbiAgICB9KTtcbiAgICBcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoICFmZWF0dXJlc1tpXS52aXNpYmxlICkgY29udGludWU7XG4gICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUoZmVhdHVyZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIGxheWVyLnJlZHJhd0ZlYXR1cmUgPSBmdW5jdGlvbihjYW52YXNGZWF0dXJlKSB7XG4gICAgICB2YXIgcmVuZGVyZXIgPSBjYW52YXNGZWF0dXJlLnJlbmRlcmVyID8gY2FudmFzRmVhdHVyZS5yZW5kZXJlciA6IHRoaXMucmVuZGVyZXI7XG4gICAgICB2YXIgeHkgPSBjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCk7XG5cbiAgICAgIC8vIGJhZG5lc3MuLi5cbiAgICAgIGlmKCAheHkgKSByZXR1cm47XG5cbiAgICAgIC8vIGNhbGwgZmVhdHVyZSByZW5kZXIgZnVuY3Rpb24gaW4gZmVhdHVyZSBzY29wZTsgZmVhdHVyZSBpcyBwYXNzZWQgYXMgd2VsbFxuICAgICAgcmVuZGVyZXIuY2FsbChcbiAgICAgICAgICBjYW52YXNGZWF0dXJlLCAvLyBzY29wZSAoY2FudmFzIGZlYXR1cmUpXG4gICAgICAgICAgdGhpcy5fY3R4LCAgICAgLy8gY2FudmFzIDJkIGNvbnRleHRcbiAgICAgICAgICB4eSwgICAgICAgICAgICAvLyB4eSBwb2ludHMgdG8gZHJhd1xuICAgICAgICAgIHRoaXMuX21hcCwgICAgIC8vIGxlYWZsZXQgbWFwIGluc3RhbmNlXG4gICAgICAgICAgY2FudmFzRmVhdHVyZSAgLy8gY2FudmFzIGZlYXR1cmVcbiAgICAgICk7XG4gIH1cblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIGxheWVyLnByZXBhcmVGb3JSZWRyYXcgPSBmdW5jdGlvbihjYW52YXNGZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYpIHtcbiAgICAvL2lmKCBmZWF0dXJlLmdlb2pzb24ucHJvcGVydGllcy5kZWJ1ZyApIGRlYnVnZ2VyO1xuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIGZsYWdnZWQgYXMgaGlkZGVuXG4gICAgLy8gd2UgZG8gbmVlZCB0byBjbGVhciB0aGUgY2FjaGUgaW4gdGhpcyBjYXNlXG4gICAgaWYoICFjYW52YXNGZWF0dXJlLnZpc2libGUgKSB7XG4gICAgICBjYW52YXNGZWF0dXJlLmNsZWFyQ2FjaGUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZ2VvanNvbiA9IGNhbnZhc0ZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeTtcblxuICAgIC8vIG5vdyBsZXRzIGNoZWNrIGNhY2hlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlcHJvamVjdCB0aGVcbiAgICAvLyB4eSBjb29yZGluYXRlc1xuICAgIC8vIGFjdHVhbGx5IHByb2plY3QgdG8geHkgaWYgbmVlZGVkXG4gICAgdmFyIHJlcHJvamVjdCA9IGNhbnZhc0ZlYXR1cmUucmVxdWlyZXNSZXByb2plY3Rpb24oem9vbSk7XG4gICAgaWYoIHJlcHJvamVjdCApIHtcbiAgICAgIHRoaXMudG9DYW52YXNYWShjYW52YXNGZWF0dXJlLCBnZW9qc29uLCB6b29tKTtcbiAgICB9ICAvLyBlbmQgcmVwcm9qZWN0XG5cbiAgICAvLyBpZiB0aGlzIHdhcyBhIHNpbXBsZSBwYW4gZXZlbnQgKGEgZGlmZiB3YXMgcHJvdmlkZWQpIGFuZCB3ZSBkaWQgbm90IHJlcHJvamVjdFxuICAgIC8vIG1vdmUgdGhlIGZlYXR1cmUgYnkgZGlmZiB4L3lcbiAgICBpZiggZGlmZiAmJiAhcmVwcm9qZWN0ICkge1xuICAgICAgaWYoIGdlb2pzb24udHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgIHZhciB4eSA9IGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKVxuICAgICAgICB4eS54ICs9IGRpZmYueDtcbiAgICAgICAgeHkueSArPSBkaWZmLnk7XG5cbiAgICAgIH0gZWxzZSBpZiggZ2VvanNvbi50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKSwgZGlmZik7XG5cbiAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICBcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCksIGRpZmYpO1xuICAgICAgXG4gICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgIHZhciB4eSA9IGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKTtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB4eS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKHh5W2ldLCBkaWZmKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgIH07XG59IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgIGxheWVyLnRvQ2FudmFzWFkgPSBmdW5jdGlvbihmZWF0dXJlLCBnZW9qc29uLCB6b29tKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgY2FjaGUgbmFtZXNwYWNlIGFuZCBzZXQgdGhlIHpvb20gbGV2ZWxcbiAgICAgICAgaWYoICFmZWF0dXJlLmNhY2hlICkgZmVhdHVyZS5jYWNoZSA9IHt9O1xuICAgICAgICB2YXIgY2FudmFzWFk7XG5cbiAgICAgICAgaWYoIGdlb2pzb24udHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgIGNhbnZhc1hZID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoW1xuICAgICAgICAgICAgZ2VvanNvbi5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgIGdlb2pzb24uY29vcmRpbmF0ZXNbMF1cbiAgICAgICAgXSk7XG5cbiAgICAgICAgaWYoIGZlYXR1cmUuc2l6ZSApIHtcbiAgICAgICAgICAgIGNhbnZhc1hZWzBdID0gY2FudmFzWFlbMF0gLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgICAgICAgY2FudmFzWFlbMV0gPSBjYW52YXNYWVsxXSAtIGZlYXR1cmUuc2l6ZSAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYoIGdlb2pzb24udHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgY2FudmFzWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGdlb2pzb24uY29vcmRpbmF0ZXMsIHRoaXMuX21hcCk7XG4gICAgICAgIHRyaW1DYW52YXNYWShjYW52YXNYWSk7XG4gICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAgIFxuICAgICAgICBjYW52YXNYWSA9IHRoaXMudXRpbHMucHJvamVjdExpbmUoZ2VvanNvbi5jb29yZGluYXRlc1swXSwgdGhpcy5fbWFwKTtcbiAgICAgICAgdHJpbUNhbnZhc1hZKGNhbnZhc1hZKTtcbiAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgICAgIGNhbnZhc1hZID0gW107XG4gICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBnZW9qc29uLmNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIHZhciB4eSA9IHRoaXMudXRpbHMucHJvamVjdExpbmUoZ2VvanNvbi5jb29yZGluYXRlc1tpXVswXSwgdGhpcy5fbWFwKTtcbiAgICAgICAgICAgICAgICB0cmltQ2FudmFzWFkoeHkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1hZLnB1c2goeHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmZWF0dXJlLnNldENhbnZhc1hZKGNhbnZhc1hZLCB6b29tKTtcbiAgICB9O1xufVxuXG4vLyBnaXZlbiBhbiBhcnJheSBvZiBnZW8geHkgY29vcmRpbmF0ZXMsIG1ha2Ugc3VyZSBlYWNoIHBvaW50IGlzIGF0IGxlYXN0IG1vcmUgdGhhbiAxcHggYXBhcnRcbmZ1bmN0aW9uIHRyaW1DYW52YXNYWSh4eSkge1xuICAgIGlmKCB4eS5sZW5ndGggPT09IDAgKSByZXR1cm47XG4gICAgdmFyIGxhc3QgPSB4eVt4eS5sZW5ndGgtMV0sIGksIHBvaW50O1xuXG4gICAgdmFyIGMgPSAwO1xuICAgIGZvciggaSA9IHh5Lmxlbmd0aC0yOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgcG9pbnQgPSB4eVtpXTtcbiAgICAgICAgaWYoIE1hdGguYWJzKGxhc3QueCAtIHBvaW50LngpID09PSAwICYmIE1hdGguYWJzKGxhc3QueSAtIHBvaW50LnkpID09PSAwICkge1xuICAgICAgICAgICAgeHkuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYysrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGFzdCA9IHBvaW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHh5Lmxlbmd0aCA8PSAxICkge1xuICAgICAgICB4eS5wdXNoKGxhc3QpO1xuICAgICAgICBjLS07XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbW92ZUxpbmUgOiBmdW5jdGlvbihjb29yZHMsIGRpZmYpIHtcbiAgICB2YXIgaSwgbGVuID0gY29vcmRzLmxlbmd0aDtcbiAgICBmb3IoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBjb29yZHNbaV0ueCArPSBkaWZmLng7XG4gICAgICBjb29yZHNbaV0ueSArPSBkaWZmLnk7XG4gICAgfVxuICB9LFxuXG4gIHByb2plY3RMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBtYXApIHtcbiAgICB2YXIgeHlMaW5lID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHh5TGluZS5wdXNoKG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICBjb29yZHNbaV1bMV0sIGNvb3Jkc1tpXVswXVxuICAgICAgXSkpO1xuICAgIH1cblxuICAgIHJldHVybiB4eUxpbmU7XG4gIH0sXG5cbiAgY2FsY0JvdW5kcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4bWluID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB4bWF4ID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB5bWluID0gY29vcmRzWzBdWzBdO1xuICAgIHZhciB5bWF4ID0gY29vcmRzWzBdWzBdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDE7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggeG1pbiA+IGNvb3Jkc1tpXVsxXSApIHhtaW4gPSBjb29yZHNbaV1bMV07XG4gICAgICBpZiggeG1heCA8IGNvb3Jkc1tpXVsxXSApIHhtYXggPSBjb29yZHNbaV1bMV07XG5cbiAgICAgIGlmKCB5bWluID4gY29vcmRzW2ldWzBdICkgeW1pbiA9IGNvb3Jkc1tpXVswXTtcbiAgICAgIGlmKCB5bWF4IDwgY29vcmRzW2ldWzBdICkgeW1heCA9IGNvb3Jkc1tpXVswXTtcbiAgICB9XG5cbiAgICB2YXIgc291dGhXZXN0ID0gTC5sYXRMbmcoeG1pbi0uMDEsIHltaW4tLjAxKTtcbiAgICB2YXIgbm9ydGhFYXN0ID0gTC5sYXRMbmcoeG1heCsuMDEsIHltYXgrLjAxKTtcblxuICAgIHJldHVybiBMLmxhdExuZ0JvdW5kcyhzb3V0aFdlc3QsIG5vcnRoRWFzdCk7XG4gIH0sXG5cbiAgZ2VvbWV0cnlXaXRoaW5SYWRpdXMgOiBmdW5jdGlvbihnZW9tZXRyeSwgeHlQb2ludHMsIGNlbnRlciwgeHlQb2ludCwgcmFkaXVzKSB7XG4gICAgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnREaXN0YW5jZShnZW9tZXRyeSwgY2VudGVyKSA8PSByYWRpdXM7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgZm9yKCB2YXIgaSA9IDE7IGkgPCB4eVBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoIHRoaXMubGluZUludGVyc2VjdHNDaXJjbGUoeHlQb2ludHNbaS0xXSwgeHlQb2ludHNbaV0sIHh5UG9pbnQsIDMpICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50SW5Qb2x5Z29uKGNlbnRlciwgZ2VvbWV0cnkpO1xuICAgIH1cbiAgfSxcblxuICAvLyBodHRwOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMjc1NTI5L2NoZWNrLWlmLWxpbmUtaW50ZXJzZWN0cy13aXRoLWNpcmNsZXMtcGVyaW1ldGVyXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Rpc3RhbmNlX2Zyb21fYV9wb2ludF90b19hX2xpbmVcbiAgLy8gW2xuZyB4LCBsYXQsIHldXG4gIGxpbmVJbnRlcnNlY3RzQ2lyY2xlIDogZnVuY3Rpb24obGluZVAxLCBsaW5lUDIsIHBvaW50LCByYWRpdXMpIHtcbiAgICB2YXIgZGlzdGFuY2UgPVxuICAgICAgTWF0aC5hYnMoXG4gICAgICAgICgobGluZVAyLnkgLSBsaW5lUDEueSkqcG9pbnQueCkgLSAoKGxpbmVQMi54IC0gbGluZVAxLngpKnBvaW50LnkpICsgKGxpbmVQMi54KmxpbmVQMS55KSAtIChsaW5lUDIueSpsaW5lUDEueClcbiAgICAgICkgL1xuICAgICAgTWF0aC5zcXJ0KFxuICAgICAgICBNYXRoLnBvdyhsaW5lUDIueSAtIGxpbmVQMS55LCAyKSArIE1hdGgucG93KGxpbmVQMi54IC0gbGluZVAxLngsIDIpXG4gICAgICApO1xuICAgIHJldHVybiBkaXN0YW5jZSA8PSByYWRpdXM7XG4gIH0sXG5cbiAgLy8gaHR0cDovL3dpa2kub3BlbnN0cmVldG1hcC5vcmcvd2lraS9ab29tX2xldmVsc1xuICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI3NTQ1MDk4L2xlYWZsZXQtY2FsY3VsYXRpbmctbWV0ZXJzLXBlci1waXhlbC1hdC16b29tLWxldmVsXG4gIG1ldGVyc1BlclB4IDogZnVuY3Rpb24obGwsIG1hcCkge1xuICAgIHZhciBwb2ludEMgPSBtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChsbCk7IC8vIGNvbnZlcnQgdG8gY29udGFpbmVycG9pbnQgKHBpeGVscylcbiAgICB2YXIgcG9pbnRYID0gW3BvaW50Qy54ICsgMSwgcG9pbnRDLnldOyAvLyBhZGQgb25lIHBpeGVsIHRvIHhcblxuICAgIC8vIGNvbnZlcnQgY29udGFpbmVycG9pbnRzIHRvIGxhdGxuZydzXG4gICAgdmFyIGxhdExuZ0MgPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludEMpO1xuICAgIHZhciBsYXRMbmdYID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRYKTtcblxuICAgIHZhciBkaXN0YW5jZVggPSBsYXRMbmdDLmRpc3RhbmNlVG8obGF0TG5nWCk7IC8vIGNhbGN1bGF0ZSBkaXN0YW5jZSBiZXR3ZWVuIGMgYW5kIHggKGxhdGl0dWRlKVxuICAgIHJldHVybiBkaXN0YW5jZVg7XG4gIH0sXG5cbiAgZGVncmVlc1BlclB4IDogZnVuY3Rpb24obGwsIG1hcCkge1xuICAgIHZhciBwb2ludEMgPSBtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChsbCk7IC8vIGNvbnZlcnQgdG8gY29udGFpbmVycG9pbnQgKHBpeGVscylcbiAgICB2YXIgcG9pbnRYID0gW3BvaW50Qy54ICsgMSwgcG9pbnRDLnldOyAvLyBhZGQgb25lIHBpeGVsIHRvIHhcblxuICAgIC8vIGNvbnZlcnQgY29udGFpbmVycG9pbnRzIHRvIGxhdGxuZydzXG4gICAgdmFyIGxhdExuZ0MgPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludEMpO1xuICAgIHZhciBsYXRMbmdYID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRYKTtcblxuICAgIHJldHVybiBNYXRoLmFicyhsYXRMbmdDLmxuZyAtIGxhdExuZ1gubG5nKTsgLy8gY2FsY3VsYXRlIGRpc3RhbmNlIGJldHdlZW4gYyBhbmQgeCAobGF0aXR1ZGUpXG4gIH0sXG5cbiAgLy8gZnJvbSBodHRwOi8vd3d3Lm1vdmFibGUtdHlwZS5jby51ay9zY3JpcHRzL2xhdGxvbmcuaHRtbFxuICBwb2ludERpc3RhbmNlIDogZnVuY3Rpb24gKHB0MSwgcHQyKSB7XG4gICAgdmFyIGxvbjEgPSBwdDEuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQxID0gcHQxLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgbG9uMiA9IHB0Mi5jb29yZGluYXRlc1swXSxcbiAgICAgIGxhdDIgPSBwdDIuY29vcmRpbmF0ZXNbMV0sXG4gICAgICBkTGF0ID0gdGhpcy5udW1iZXJUb1JhZGl1cyhsYXQyIC0gbGF0MSksXG4gICAgICBkTG9uID0gdGhpcy5udW1iZXJUb1JhZGl1cyhsb24yIC0gbG9uMSksXG4gICAgICBhID0gTWF0aC5wb3coTWF0aC5zaW4oZExhdCAvIDIpLCAyKSArIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MSkpXG4gICAgICAgICogTWF0aC5jb3ModGhpcy5udW1iZXJUb1JhZGl1cyhsYXQyKSkgKiBNYXRoLnBvdyhNYXRoLnNpbihkTG9uIC8gMiksIDIpLFxuICAgICAgYyA9IDIgKiBNYXRoLmF0YW4yKE1hdGguc3FydChhKSwgTWF0aC5zcXJ0KDEgLSBhKSk7XG4gICAgcmV0dXJuICg2MzcxICogYykgKiAxMDAwOyAvLyByZXR1cm5zIG1ldGVyc1xuICB9LFxuXG4gIHBvaW50SW5Qb2x5Z29uIDogZnVuY3Rpb24gKHAsIHBvbHkpIHtcbiAgICB2YXIgY29vcmRzID0gKHBvbHkudHlwZSA9PSBcIlBvbHlnb25cIikgPyBbIHBvbHkuY29vcmRpbmF0ZXMgXSA6IHBvbHkuY29vcmRpbmF0ZXNcblxuICAgIHZhciBpbnNpZGVCb3ggPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wb2ludEluQm91bmRpbmdCb3gocCwgdGhpcy5ib3VuZGluZ0JveEFyb3VuZFBvbHlDb29yZHMoY29vcmRzW2ldKSkpIGluc2lkZUJveCA9IHRydWVcbiAgICB9XG4gICAgaWYgKCFpbnNpZGVCb3gpIHJldHVybiBmYWxzZVxuXG4gICAgdmFyIGluc2lkZVBvbHkgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wbnBvbHkocC5jb29yZGluYXRlc1sxXSwgcC5jb29yZGluYXRlc1swXSwgY29vcmRzW2ldKSkgaW5zaWRlUG9seSA9IHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zaWRlUG9seVxuICB9LFxuXG4gIHBvaW50SW5Cb3VuZGluZ0JveCA6IGZ1bmN0aW9uIChwb2ludCwgYm91bmRzKSB7XG4gICAgcmV0dXJuICEocG9pbnQuY29vcmRpbmF0ZXNbMV0gPCBib3VuZHNbMF1bMF0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMV0gPiBib3VuZHNbMV1bMF0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMF0gPCBib3VuZHNbMF1bMV0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMF0gPiBib3VuZHNbMV1bMV0pXG4gIH0sXG5cbiAgYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzIDogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgdmFyIHhBbGwgPSBbXSwgeUFsbCA9IFtdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkc1swXS5sZW5ndGg7IGkrKykge1xuICAgICAgeEFsbC5wdXNoKGNvb3Jkc1swXVtpXVsxXSlcbiAgICAgIHlBbGwucHVzaChjb29yZHNbMF1baV1bMF0pXG4gICAgfVxuXG4gICAgeEFsbCA9IHhBbGwuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgIHlBbGwgPSB5QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcblxuICAgIHJldHVybiBbIFt4QWxsWzBdLCB5QWxsWzBdXSwgW3hBbGxbeEFsbC5sZW5ndGggLSAxXSwgeUFsbFt5QWxsLmxlbmd0aCAtIDFdXSBdXG4gIH0sXG5cbiAgLy8gUG9pbnQgaW4gUG9seWdvblxuICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sI0xpc3RpbmcgdGhlIFZlcnRpY2VzXG4gIHBucG9seSA6IGZ1bmN0aW9uKHgseSxjb29yZHMpIHtcbiAgICB2YXIgdmVydCA9IFsgWzAsMF0gXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29vcmRzW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZlcnQucHVzaChjb29yZHNbaV1bal0pXG4gICAgICB9XG4gICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldWzBdKVxuICAgICAgdmVydC5wdXNoKFswLDBdKVxuICAgIH1cblxuICAgIHZhciBpbnNpZGUgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdmVydC5sZW5ndGggLSAxOyBpIDwgdmVydC5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgIGlmICgoKHZlcnRbaV1bMF0gPiB5KSAhPSAodmVydFtqXVswXSA+IHkpKSAmJiAoeCA8ICh2ZXJ0W2pdWzFdIC0gdmVydFtpXVsxXSkgKiAoeSAtIHZlcnRbaV1bMF0pIC8gKHZlcnRbal1bMF0gLSB2ZXJ0W2ldWzBdKSArIHZlcnRbaV1bMV0pKSBpbnNpZGUgPSAhaW5zaWRlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVxuICB9LFxuXG4gIG51bWJlclRvUmFkaXVzIDogZnVuY3Rpb24gKG51bWJlcikge1xuICAgIHJldHVybiBudW1iZXIgKiBNYXRoLlBJIC8gMTgwO1xuICB9XG59O1xuIl19
