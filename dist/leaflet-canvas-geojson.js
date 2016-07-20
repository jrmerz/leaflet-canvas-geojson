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

    if (geojson.geometry) {
        this.geojson = {
            type: 'Feature',
            geometry: geojson.geometry,
            properties: {
                id: id || geojson.properties.id
            }
        };
        this.id = id;
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

    this.type = this.geojson.geometry.type;

    // optional, per feature, renderer
    this.renderer = null;
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

  // list of geojson features to draw
  //   - these will draw in order
  this.features = [];
  // lookup index
  this.featureIndex = {};

  // list of current features under the mouse
  this.intersectList = [];

  // used to calculate pixels moved from center
  this.lastCenterLL = null;

  // geometry helpers
  this.utils = require('./lib/utils');

  this.moving = false;
  this.zooming = false;
  // TODO: make this work
  this.allowPanRendering = false;

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
var intersectUtils = require('./intersects');

module.exports = function (layer) {
  layer.addCanvasFeatures = function (features) {
    for (var i = 0; i < features.length; i++) {
      this.addCanvasFeature(features[i], false, null, false);
    }

    intersectUtils.rebuild(this.features);
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

    intersectUtils.add(feature);
  },

  // returns true if re-render required.  ie the feature was visible;
  layer.removeCanvasFeature = function (feature) {
    var index = this.features.indexOf(feature);
    if (index == -1) return;

    this.splice(index, 1);

    intersectUtils.rebuild(this.features);

    if (this.feature.visible) return true;
    return false;
  };

  layer.removeAll = function () {
    this.allowPanRendering = true;
    this.features = [];
    intersectUtils.rebuild(this.features);
  };
};

},{"../classes/CanvasFeature":5,"../classes/CanvasFeatures":6,"./intersects":12}],11:[function(require,module,exports){
'use strict';

var intersectUtils = require('./intersects');
var count = 0;

module.exports = function (layer) {

    layer.initialize = function (options) {
        this.features = [];
        this.featureIndex = {};
        this.intersectList = [];
        this.showing = true;

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

        // set canvas and canvas context shortcuts
        this._canvas = createCanvas(options);
        this._ctx = this._canvas.getContext('2d');

        intersectUtils.setLayer(this);
    };

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
        /*if (map.dragging.enabled()) {
            map.dragging._draggable.on('predrag', function() {
                moveStart.apply(this);
            }, this);
        }*/

        map.on({
            'viewreset': this.reset,
            'resize': this.reset,
            'zoomstart': startZoom,
            'zoomend': endZoom,
            //    'movestart' : moveStart,
            'moveend': moveEnd,
            'mousemove': intersectUtils.intersects,
            'click': intersectUtils.intersects
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
            'viewreset': this.reset,
            'resize': this.reset,
            //   'movestart' : moveStart,
            'moveend': moveEnd,
            'zoomstart': startZoom,
            'zoomend': endZoom,
            'mousemove': intersectUtils.intersects,
            'click': intersectUtils.intersects
        }, this);
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

},{"./intersects":12}],12:[function(require,module,exports){
'use strict';

var RTree = require('rtree');
var rTree = new RTree();
var layer;

/** 
 * Handle mouse intersection events
 * e - leaflet event
 **/
function intersects(e) {
  if (!this.showing) return;

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
  for (var i = 0; i < features.length; i++) {
    clFeatures.push(layer.getCanvasFeatureById(features[i].properties.id));
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
    features.push(clFeatures[i].geojson);
  }

  rTree = new RTree();
  rTree.geoJSON({
    type: 'FeatureCollection',
    features: features
  });
}

function add(clFeature) {
  rTree.geoJSON(clFeature.geojson);
}

module.exports = {
  intersects: intersects,
  intersectsBbox: intersectsBbox,
  rebuild: rebuild,
  add: add,
  setLayer: function setLayer(l) {
    layer = l;
  }
};

},{"rtree":2}],13:[function(require,module,exports){
'use strict';

var intersectsUtils = require('./intersects');
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
    if (e && e.type == 'moveend') {
      var center = this._map.getCenter();

      var pt = this._map.latLngToContainerPoint(center);
      if (this.lastCenterLL) {
        var lastXy = this._map.latLngToContainerPoint(this.lastCenterLL);
        diff = {
          x: lastXy.x - pt.x,
          y: lastXy.y - pt.y
        };
      }

      this.lastCenterLL = center;
    }

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

    var features = intersectsUtils.intersectsBbox([[bounds.getWest(), bounds.getSouth()], [bounds.getEast(), bounds.getNorth()]]);
    this.redrawFeatures(features);
  }, layer.redrawFeatures = function (features) {
    this.clearCanvas();

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

},{"./intersects":12}],14:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvZ2VvanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRyZWUvbGliL3JlY3RhbmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvcnRyZWUuanMiLCJzcmMvY2xhc3Nlcy9DYW52YXNGZWF0dXJlLmpzIiwic3JjL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMuanMiLCJzcmMvY2xhc3Nlcy9mYWN0b3J5LmpzIiwic3JjL2RlZmF1bHRSZW5kZXJlci9pbmRleC5qcyIsInNyYy9sYXllci5qcyIsInNyYy9saWIvYWRkRmVhdHVyZS5qcyIsInNyYy9saWIvaW5pdC5qcyIsInNyYy9saWIvaW50ZXJzZWN0cy5qcyIsInNyYy9saWIvcmVkcmF3LmpzIiwic3JjL2xpYi90b0NhbnZhc1hZLmpzIiwic3JjL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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ektjLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcbnZhciByZWN0YW5nbGUgPSByZXF1aXJlKCcuL3JlY3RhbmdsZScpO1xudmFyIGJib3ggPSBmdW5jdGlvbiAoYXIsIG9iaikge1xuICBpZiAob2JqICYmIG9iai5iYm94KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlYWY6IG9iaixcbiAgICAgIHg6IG9iai5iYm94WzBdLFxuICAgICAgeTogb2JqLmJib3hbMV0sXG4gICAgICB3OiBvYmouYmJveFsyXSAtIG9iai5iYm94WzBdLFxuICAgICAgaDogb2JqLmJib3hbM10gLSBvYmouYmJveFsxXVxuICAgIH07XG4gIH1cbiAgdmFyIGxlbiA9IGFyLmxlbmd0aDtcbiAgdmFyIGkgPSAwO1xuICB2YXIgYSA9IG5ldyBBcnJheShsZW4pO1xuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIGFbaV0gPSBbYXJbaV1bMF0sIGFyW2ldWzFdXTtcbiAgICBpKys7XG4gIH1cbiAgdmFyIGZpcnN0ID0gYVswXTtcbiAgbGVuID0gYS5sZW5ndGg7XG4gIGkgPSAxO1xuICB2YXIgdGVtcCA9IHtcbiAgICBtaW46IFtdLmNvbmNhdChmaXJzdCksXG4gICAgbWF4OiBbXS5jb25jYXQoZmlyc3QpXG4gIH07XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgaWYgKGFbaV1bMF0gPCB0ZW1wLm1pblswXSkge1xuICAgICAgdGVtcC5taW5bMF0gPSBhW2ldWzBdO1xuICAgIH1cbiAgICBlbHNlIGlmIChhW2ldWzBdID4gdGVtcC5tYXhbMF0pIHtcbiAgICAgIHRlbXAubWF4WzBdID0gYVtpXVswXTtcbiAgICB9XG4gICAgaWYgKGFbaV1bMV0gPCB0ZW1wLm1pblsxXSkge1xuICAgICAgdGVtcC5taW5bMV0gPSBhW2ldWzFdO1xuICAgIH1cbiAgICBlbHNlIGlmIChhW2ldWzFdID4gdGVtcC5tYXhbMV0pIHtcbiAgICAgIHRlbXAubWF4WzFdID0gYVtpXVsxXTtcbiAgICB9XG4gICAgaSsrO1xuICB9XG4gIHZhciBvdXQgPSB7XG4gICAgeDogdGVtcC5taW5bMF0sXG4gICAgeTogdGVtcC5taW5bMV0sXG4gICAgdzogKHRlbXAubWF4WzBdIC0gdGVtcC5taW5bMF0pLFxuICAgIGg6ICh0ZW1wLm1heFsxXSAtIHRlbXAubWluWzFdKVxuICB9O1xuICBpZiAob2JqKSB7XG4gICAgb3V0LmxlYWYgPSBvYmo7XG4gIH1cbiAgcmV0dXJuIG91dDtcbn07XG52YXIgZ2VvSlNPTiA9IHt9O1xuZ2VvSlNPTi5wb2ludCA9IGZ1bmN0aW9uIChvYmosIHNlbGYpIHtcbiAgcmV0dXJuIChzZWxmLmluc2VydFN1YnRyZWUoe1xuICAgIHg6IG9iai5nZW9tZXRyeS5jb29yZGluYXRlc1swXSxcbiAgICB5OiBvYmouZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sXG4gICAgdzogMCxcbiAgICBoOiAwLFxuICAgIGxlYWY6IG9ialxuICB9LCBzZWxmLnJvb3QpKTtcbn07XG5nZW9KU09OLm11bHRpUG9pbnRMaW5lU3RyaW5nID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZShiYm94KG9iai5nZW9tZXRyeS5jb29yZGluYXRlcywgb2JqKSwgc2VsZi5yb290KSk7XG59O1xuZ2VvSlNPTi5tdWx0aUxpbmVTdHJpbmdQb2x5Z29uID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZShiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIG9iai5nZW9tZXRyeS5jb29yZGluYXRlcyksIG9iaiksIHNlbGYucm9vdCkpO1xufTtcbmdlb0pTT04ubXVsdGlQb2x5Z29uID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZShiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIG9iai5nZW9tZXRyeS5jb29yZGluYXRlcykpLCBvYmopLCBzZWxmLnJvb3QpKTtcbn07XG5nZW9KU09OLm1ha2VSZWMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiByZWN0YW5nbGUob2JqLngsIG9iai55LCBvYmoudywgb2JqLmgpO1xufTtcbmdlb0pTT04uZ2VvbWV0cnlDb2xsZWN0aW9uID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICBpZiAob2JqLmJib3gpIHtcbiAgICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZSh7XG4gICAgICBsZWFmOiBvYmosXG4gICAgICB4OiBvYmouYmJveFswXSxcbiAgICAgIHk6IG9iai5iYm94WzFdLFxuICAgICAgdzogb2JqLmJib3hbMl0gLSBvYmouYmJveFswXSxcbiAgICAgIGg6IG9iai5iYm94WzNdIC0gb2JqLmJib3hbMV1cbiAgICB9LCBzZWxmLnJvb3QpKTtcbiAgfVxuICB2YXIgZ2VvcyA9IG9iai5nZW9tZXRyeS5nZW9tZXRyaWVzO1xuICB2YXIgaSA9IDA7XG4gIHZhciBsZW4gPSBnZW9zLmxlbmd0aDtcbiAgdmFyIHRlbXAgPSBbXTtcbiAgdmFyIGc7XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgZyA9IGdlb3NbaV07XG4gICAgc3dpdGNoIChnLnR5cGUpIHtcbiAgICBjYXNlICdQb2ludCc6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKHtcbiAgICAgICAgeDogZy5jb29yZGluYXRlc1swXSxcbiAgICAgICAgeTogZy5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgdzogMCxcbiAgICAgICAgaDogMFxuICAgICAgfSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTXVsdGlQb2ludCc6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKGJib3goZy5jb29yZGluYXRlcykpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0xpbmVTdHJpbmcnOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyhiYm94KGcuY29vcmRpbmF0ZXMpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNdWx0aUxpbmVTdHJpbmcnOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyhiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIGcuY29vcmRpbmF0ZXMpKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnUG9seWdvbic6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKGJib3goQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgZy5jb29yZGluYXRlcykpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNdWx0aVBvbHlnb24nOlxuICAgICAgdGVtcC5wdXNoKGdlb0pTT04ubWFrZVJlYyhiYm94KEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIGcuY29vcmRpbmF0ZXMpKSkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0dlb21ldHJ5Q29sbGVjdGlvbic6XG4gICAgICBnZW9zID0gZ2Vvcy5jb25jYXQoZy5nZW9tZXRyaWVzKTtcbiAgICAgIGxlbiA9IGdlb3MubGVuZ3RoO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGkrKztcbiAgfVxuICB2YXIgZmlyc3QgPSB0ZW1wWzBdO1xuICBpID0gMTtcbiAgbGVuID0gdGVtcC5sZW5ndGg7XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgZmlyc3QuZXhwYW5kKHRlbXBbaV0pO1xuICAgIGkrKztcbiAgfVxuICByZXR1cm4gc2VsZi5pbnNlcnRTdWJ0cmVlKHtcbiAgICBsZWFmOiBvYmosXG4gICAgeDogZmlyc3QueCgpLFxuICAgIHk6IGZpcnN0LnkoKSxcbiAgICBoOiBmaXJzdC5oKCksXG4gICAgdzogZmlyc3QudygpXG4gIH0sIHNlbGYucm9vdCk7XG59O1xuZXhwb3J0cy5nZW9KU09OID0gZnVuY3Rpb24gKHByZWxpbSkge1xuICB2YXIgdGhhdCA9IHRoaXM7XG4gIHZhciBmZWF0dXJlcywgZmVhdHVyZTtcbiAgaWYgKEFycmF5LmlzQXJyYXkocHJlbGltKSkge1xuICAgIGZlYXR1cmVzID0gcHJlbGltLnNsaWNlKCk7XG4gIH1cbiAgZWxzZSBpZiAocHJlbGltLmZlYXR1cmVzICYmIEFycmF5LmlzQXJyYXkocHJlbGltLmZlYXR1cmVzKSkge1xuICAgIGZlYXR1cmVzID0gcHJlbGltLmZlYXR1cmVzLnNsaWNlKCk7XG4gIH1cbiAgZWxzZSBpZiAocHJlbGltIGluc3RhbmNlb2YgT2JqZWN0KSB7XG4gICAgZmVhdHVyZXMgPSBbcHJlbGltXTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyAoJ3RoaXMgaXNuXFwndCB3aGF0IHdlXFwncmUgbG9va2luZyBmb3InKTtcbiAgfVxuICB2YXIgbGVuID0gZmVhdHVyZXMubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgZmVhdHVyZSA9IGZlYXR1cmVzW2ldO1xuICAgIGlmIChmZWF0dXJlLnR5cGUgPT09ICdGZWF0dXJlJykge1xuICAgICAgc3dpdGNoIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUpIHtcbiAgICAgIGNhc2UgJ1BvaW50JzpcbiAgICAgICAgZ2VvSlNPTi5wb2ludChmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdNdWx0aVBvaW50JzpcbiAgICAgICAgZ2VvSlNPTi5tdWx0aVBvaW50TGluZVN0cmluZyhmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdMaW5lU3RyaW5nJzpcbiAgICAgICAgZ2VvSlNPTi5tdWx0aVBvaW50TGluZVN0cmluZyhmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdNdWx0aUxpbmVTdHJpbmcnOlxuICAgICAgICBnZW9KU09OLm11bHRpTGluZVN0cmluZ1BvbHlnb24oZmVhdHVyZSwgdGhhdCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnUG9seWdvbic6XG4gICAgICAgIGdlb0pTT04ubXVsdGlMaW5lU3RyaW5nUG9seWdvbihmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdNdWx0aVBvbHlnb24nOlxuICAgICAgICBnZW9KU09OLm11bHRpUG9seWdvbihmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdHZW9tZXRyeUNvbGxlY3Rpb24nOlxuICAgICAgICBnZW9KU09OLmdlb21ldHJ5Q29sbGVjdGlvbihmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGkrKztcbiAgfVxufTtcbmV4cG9ydHMuYmJveCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHgxLCB5MSwgeDIsIHkyO1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgY2FzZSAxOlxuICAgIHgxID0gYXJndW1lbnRzWzBdWzBdWzBdO1xuICAgIHkxID0gYXJndW1lbnRzWzBdWzBdWzFdO1xuICAgIHgyID0gYXJndW1lbnRzWzBdWzFdWzBdO1xuICAgIHkyID0gYXJndW1lbnRzWzBdWzFdWzFdO1xuICAgIGJyZWFrO1xuICBjYXNlIDI6XG4gICAgeDEgPSBhcmd1bWVudHNbMF1bMF07XG4gICAgeTEgPSBhcmd1bWVudHNbMF1bMV07XG4gICAgeDIgPSBhcmd1bWVudHNbMV1bMF07XG4gICAgeTIgPSBhcmd1bWVudHNbMV1bMV07XG4gICAgYnJlYWs7XG4gIGNhc2UgNDpcbiAgICB4MSA9IGFyZ3VtZW50c1swXTtcbiAgICB5MSA9IGFyZ3VtZW50c1sxXTtcbiAgICB4MiA9IGFyZ3VtZW50c1syXTtcbiAgICB5MiA9IGFyZ3VtZW50c1szXTtcbiAgICBicmVhaztcbiAgfVxuXG4gIHJldHVybiB0aGlzLnNlYXJjaCh7XG4gICAgeDogeDEsXG4gICAgeTogeTEsXG4gICAgdzogeDIgLSB4MSxcbiAgICBoOiB5MiAtIHkxXG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBSVHJlZSA9IHJlcXVpcmUoJy4vcnRyZWUnKTtcbnZhciBnZW9qc29uID0gcmVxdWlyZSgnLi9nZW9qc29uJyk7XG5SVHJlZS5wcm90b3R5cGUuYmJveCA9IGdlb2pzb24uYmJveDtcblJUcmVlLnByb3RvdHlwZS5nZW9KU09OID0gZ2VvanNvbi5nZW9KU09OO1xuUlRyZWUuUmVjdGFuZ2xlID0gcmVxdWlyZSgnLi9yZWN0YW5nbGUnKTtcbm1vZHVsZS5leHBvcnRzID0gUlRyZWU7IiwiJ3VzZSBzdHJpY3QnO1xuZnVuY3Rpb24gUmVjdGFuZ2xlKHgsIHksIHcsIGgpIHsgLy8gbmV3IFJlY3RhbmdsZShib3VuZHMpIG9yIG5ldyBSZWN0YW5nbGUoeCwgeSwgdywgaClcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlY3RhbmdsZSkpIHtcbiAgICByZXR1cm4gbmV3IFJlY3RhbmdsZSh4LCB5LCB3LCBoKTtcbiAgfVxuICB2YXIgeDIsIHkyLCBwO1xuXG4gIGlmICh4LngpIHtcbiAgICB3ID0geC53O1xuICAgIGggPSB4Lmg7XG4gICAgeSA9IHgueTtcbiAgICBpZiAoeC53ICE9PSAwICYmICF4LncgJiYgeC54Mikge1xuICAgICAgdyA9IHgueDIgLSB4Lng7XG4gICAgICBoID0geC55MiAtIHgueTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB3ID0geC53O1xuICAgICAgaCA9IHguaDtcbiAgICB9XG4gICAgeCA9IHgueDtcbiAgICAvLyBGb3IgZXh0cmEgZmFzdGl0dWRlXG4gICAgeDIgPSB4ICsgdztcbiAgICB5MiA9IHkgKyBoO1xuICAgIHAgPSAoaCArIHcpID8gZmFsc2UgOiB0cnVlO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIEZvciBleHRyYSBmYXN0aXR1ZGVcbiAgICB4MiA9IHggKyB3O1xuICAgIHkyID0geSArIGg7XG4gICAgcCA9IChoICsgdykgPyBmYWxzZSA6IHRydWU7XG4gIH1cblxuICB0aGlzLngxID0gdGhpcy54ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xuICB0aGlzLnkxID0gdGhpcy55ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB5O1xuICB9O1xuICB0aGlzLngyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB4MjtcbiAgfTtcbiAgdGhpcy55MiA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geTI7XG4gIH07XG4gIHRoaXMudyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdztcbiAgfTtcbiAgdGhpcy5oID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBoO1xuICB9O1xuICB0aGlzLnAgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHA7XG4gIH07XG5cbiAgdGhpcy5vdmVybGFwID0gZnVuY3Rpb24gKGEpIHtcbiAgICBpZiAocCB8fCBhLnAoKSkge1xuICAgICAgcmV0dXJuIHggPD0gYS54MigpICYmIHgyID49IGEueCgpICYmIHkgPD0gYS55MigpICYmIHkyID49IGEueSgpO1xuICAgIH1cbiAgICByZXR1cm4geCA8IGEueDIoKSAmJiB4MiA+IGEueCgpICYmIHkgPCBhLnkyKCkgJiYgeTIgPiBhLnkoKTtcbiAgfTtcblxuICB0aGlzLmV4cGFuZCA9IGZ1bmN0aW9uIChhKSB7XG4gICAgdmFyIG54LCBueTtcbiAgICB2YXIgYXggPSBhLngoKTtcbiAgICB2YXIgYXkgPSBhLnkoKTtcbiAgICB2YXIgYXgyID0gYS54MigpO1xuICAgIHZhciBheTIgPSBhLnkyKCk7XG4gICAgaWYgKHggPiBheCkge1xuICAgICAgbnggPSBheDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBueCA9IHg7XG4gICAgfVxuICAgIGlmICh5ID4gYXkpIHtcbiAgICAgIG55ID0gYXk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbnkgPSB5O1xuICAgIH1cbiAgICBpZiAoeDIgPiBheDIpIHtcbiAgICAgIHcgPSB4MiAtIG54O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHcgPSBheDIgLSBueDtcbiAgICB9XG4gICAgaWYgKHkyID4gYXkyKSB7XG4gICAgICBoID0geTIgLSBueTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBoID0gYXkyIC0gbnk7XG4gICAgfVxuICAgIHggPSBueDtcbiAgICB5ID0gbnk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy9FbmQgb2YgUlRyZWUuUmVjdGFuZ2xlXG59XG5cblxuLyogcmV0dXJucyB0cnVlIGlmIHJlY3RhbmdsZSAxIG92ZXJsYXBzIHJlY3RhbmdsZSAyXG4gKiBbIGJvb2xlYW4gXSA9IG92ZXJsYXBSZWN0YW5nbGUocmVjdGFuZ2xlIGEsIHJlY3RhbmdsZSBiKVxuICogQHN0YXRpYyBmdW5jdGlvblxuICovXG5SZWN0YW5nbGUub3ZlcmxhcFJlY3RhbmdsZSA9IGZ1bmN0aW9uIChhLCBiKSB7XG4gIC8vaWYoISgoYS5ofHxhLncpJiYoYi5ofHxiLncpKSl7IG5vdCBmYXN0ZXIgcmVzaXN0IHRoZSB1cmdlIVxuICBpZiAoKGEuaCA9PT0gMCAmJiBhLncgPT09IDApIHx8IChiLmggPT09IDAgJiYgYi53ID09PSAwKSkge1xuICAgIHJldHVybiBhLnggPD0gKGIueCArIGIudykgJiYgKGEueCArIGEudykgPj0gYi54ICYmIGEueSA8PSAoYi55ICsgYi5oKSAmJiAoYS55ICsgYS5oKSA+PSBiLnk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGEueCA8IChiLnggKyBiLncpICYmIChhLnggKyBhLncpID4gYi54ICYmIGEueSA8IChiLnkgKyBiLmgpICYmIChhLnkgKyBhLmgpID4gYi55O1xuICB9XG59O1xuXG4vKiByZXR1cm5zIHRydWUgaWYgcmVjdGFuZ2xlIGEgaXMgY29udGFpbmVkIGluIHJlY3RhbmdsZSBiXG4gKiBbIGJvb2xlYW4gXSA9IGNvbnRhaW5zUmVjdGFuZ2xlKHJlY3RhbmdsZSBhLCByZWN0YW5nbGUgYilcbiAqIEBzdGF0aWMgZnVuY3Rpb25cbiAqL1xuUmVjdGFuZ2xlLmNvbnRhaW5zUmVjdGFuZ2xlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgcmV0dXJuIChhLnggKyBhLncpIDw9IChiLnggKyBiLncpICYmIGEueCA+PSBiLnggJiYgKGEueSArIGEuaCkgPD0gKGIueSArIGIuaCkgJiYgYS55ID49IGIueTtcbn07XG5cbi8qIGV4cGFuZHMgcmVjdGFuZ2xlIEEgdG8gaW5jbHVkZSByZWN0YW5nbGUgQiwgcmVjdGFuZ2xlIEIgaXMgdW50b3VjaGVkXG4gKiBbIHJlY3RhbmdsZSBhIF0gPSBleHBhbmRSZWN0YW5nbGUocmVjdGFuZ2xlIGEsIHJlY3RhbmdsZSBiKVxuICogQHN0YXRpYyBmdW5jdGlvblxuICovXG5SZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgdmFyIG54LCBueTtcbiAgdmFyIGF4dyA9IGEueCArIGEudztcbiAgdmFyIGJ4dyA9IGIueCArIGIudztcbiAgdmFyIGF5aCA9IGEueSArIGEuaDtcbiAgdmFyIGJ5aCA9IGIueSArIGIuaDtcbiAgaWYgKGEueCA+IGIueCkge1xuICAgIG54ID0gYi54O1xuICB9XG4gIGVsc2Uge1xuICAgIG54ID0gYS54O1xuICB9XG4gIGlmIChhLnkgPiBiLnkpIHtcbiAgICBueSA9IGIueTtcbiAgfVxuICBlbHNlIHtcbiAgICBueSA9IGEueTtcbiAgfVxuICBpZiAoYXh3ID4gYnh3KSB7XG4gICAgYS53ID0gYXh3IC0gbng7XG4gIH1cbiAgZWxzZSB7XG4gICAgYS53ID0gYnh3IC0gbng7XG4gIH1cbiAgaWYgKGF5aCA+IGJ5aCkge1xuICAgIGEuaCA9IGF5aCAtIG55O1xuICB9XG4gIGVsc2Uge1xuICAgIGEuaCA9IGJ5aCAtIG55O1xuICB9XG4gIGEueCA9IG54O1xuICBhLnkgPSBueTtcbiAgcmV0dXJuIGE7XG59O1xuXG4vKiBnZW5lcmF0ZXMgYSBtaW5pbWFsbHkgYm91bmRpbmcgcmVjdGFuZ2xlIGZvciBhbGwgcmVjdGFuZ2xlcyBpblxuICogYXJyYXkgJ25vZGVzJy4gSWYgcmVjdCBpcyBzZXQsIGl0IGlzIG1vZGlmaWVkIGludG8gdGhlIE1CUi4gT3RoZXJ3aXNlLFxuICogYSBuZXcgcmVjdGFuZ2xlIGlzIGdlbmVyYXRlZCBhbmQgcmV0dXJuZWQuXG4gKiBbIHJlY3RhbmdsZSBhIF0gPSBtYWtlTUJSKHJlY3RhbmdsZSBhcnJheSBub2RlcywgcmVjdGFuZ2xlIHJlY3QpXG4gKiBAc3RhdGljIGZ1bmN0aW9uXG4gKi9cblJlY3RhbmdsZS5tYWtlTUJSID0gZnVuY3Rpb24gKG5vZGVzLCByZWN0KSB7XG4gIGlmICghbm9kZXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgdzogMCxcbiAgICAgIGg6IDBcbiAgICB9O1xuICB9XG4gIHJlY3QgPSByZWN0IHx8IHt9O1xuICByZWN0LnggPSBub2Rlc1swXS54O1xuICByZWN0LnkgPSBub2Rlc1swXS55O1xuICByZWN0LncgPSBub2Rlc1swXS53O1xuICByZWN0LmggPSBub2Rlc1swXS5oO1xuXG4gIGZvciAodmFyIGkgPSAxLCBsZW4gPSBub2Rlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIFJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUocmVjdCwgbm9kZXNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIHJlY3Q7XG59O1xuUmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyA9IGZ1bmN0aW9uIChsLCB3LCBmaWxsKSB7XG4gIC8vIEFyZWEgb2YgbmV3IGVubGFyZ2VkIHJlY3RhbmdsZVxuICB2YXIgbHBlcmkgPSAobCArIHcpIC8gMi4wOyAvLyBBdmVyYWdlIHNpemUgb2YgYSBzaWRlIG9mIHRoZSBuZXcgcmVjdGFuZ2xlXG4gIHZhciBsYXJlYSA9IGwgKiB3OyAvLyBBcmVhIG9mIG5ldyByZWN0YW5nbGVcbiAgLy8gcmV0dXJuIHRoZSByYXRpbyBvZiB0aGUgcGVyaW1ldGVyIHRvIHRoZSBhcmVhIC0gdGhlIGNsb3NlciB0byAxIHdlIGFyZSxcbiAgLy8gdGhlIG1vcmUgJ3NxdWFyZScgYSByZWN0YW5nbGUgaXMuIGNvbnZlcnNseSwgd2hlbiBhcHByb2FjaGluZyB6ZXJvIHRoZVxuICAvLyBtb3JlIGVsb25nYXRlZCBhIHJlY3RhbmdsZSBpc1xuICB2YXIgbGdlbyA9IGxhcmVhIC8gKGxwZXJpICogbHBlcmkpO1xuICByZXR1cm4gbGFyZWEgKiBmaWxsIC8gbGdlbztcbn07XG5tb2R1bGUuZXhwb3J0cyA9IFJlY3RhbmdsZTsiLCIndXNlIHN0cmljdCc7XG52YXIgcmVjdGFuZ2xlID0gcmVxdWlyZSgnLi9yZWN0YW5nbGUnKTtcbmZ1bmN0aW9uIFJUcmVlKHdpZHRoKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSVHJlZSkpIHtcbiAgICByZXR1cm4gbmV3IFJUcmVlKHdpZHRoKTtcbiAgfVxuICAvLyBWYXJpYWJsZXMgdG8gY29udHJvbCB0cmVlLWRpbWVuc2lvbnNcbiAgdmFyIG1pbldpZHRoID0gMzsgIC8vIE1pbmltdW0gd2lkdGggb2YgYW55IG5vZGUgYmVmb3JlIGEgbWVyZ2VcbiAgdmFyIG1heFdpZHRoID0gNjsgIC8vIE1heGltdW0gd2lkdGggb2YgYW55IG5vZGUgYmVmb3JlIGEgc3BsaXRcbiAgaWYgKCFpc05hTih3aWR0aCkpIHtcbiAgICBtaW5XaWR0aCA9IE1hdGguZmxvb3Iod2lkdGggLyAyLjApO1xuICAgIG1heFdpZHRoID0gd2lkdGg7XG4gIH1cbiAgLy8gU3RhcnQgd2l0aCBhbiBlbXB0eSByb290LXRyZWVcbiAgdmFyIHJvb3RUcmVlID0ge3g6IDAsIHk6IDAsIHc6IDAsIGg6IDAsIGlkOiAncm9vdCcsIG5vZGVzOiBbXSB9O1xuICB0aGlzLnJvb3QgPSByb290VHJlZTtcblxuXG4gIC8vIFRoaXMgaXMgbXkgc3BlY2lhbCBhZGRpdGlvbiB0byB0aGUgd29ybGQgb2Ygci10cmVlc1xuICAvLyBldmVyeSBvdGhlciAoc2ltcGxlKSBtZXRob2QgSSBmb3VuZCBwcm9kdWNlZCBjcmFwIHRyZWVzXG4gIC8vIHRoaXMgc2tld3MgaW5zZXJ0aW9ucyB0byBwcmVmZXJpbmcgc3F1YXJlciBhbmQgZW1wdGllciBub2Rlc1xuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uICh0cmVlKSB7XG4gICAgdmFyIHRvZG8gPSB0cmVlLnNsaWNlKCk7XG4gICAgdmFyIGRvbmUgPSBbXTtcbiAgICB2YXIgY3VycmVudDtcbiAgICB3aGlsZSAodG9kby5sZW5ndGgpIHtcbiAgICAgIGN1cnJlbnQgPSB0b2RvLnBvcCgpO1xuICAgICAgaWYgKGN1cnJlbnQubm9kZXMpIHtcbiAgICAgICAgdG9kbyA9IHRvZG8uY29uY2F0KGN1cnJlbnQubm9kZXMpO1xuICAgICAgfSBlbHNlIGlmIChjdXJyZW50LmxlYWYpIHtcbiAgICAgICAgZG9uZS5wdXNoKGN1cnJlbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZG9uZTtcbiAgfTtcbiAgLyogZmluZCB0aGUgYmVzdCBzcGVjaWZpYyBub2RlKHMpIGZvciBvYmplY3QgdG8gYmUgZGVsZXRlZCBmcm9tXG4gICAqIFsgbGVhZiBub2RlIHBhcmVudCBdID0gcmVtb3ZlU3VidHJlZShyZWN0YW5nbGUsIG9iamVjdCwgcm9vdClcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciByZW1vdmVTdWJ0cmVlID0gZnVuY3Rpb24gKHJlY3QsIG9iaiwgcm9vdCkge1xuICAgIHZhciBoaXRTdGFjayA9IFtdOyAvLyBDb250YWlucyB0aGUgZWxlbWVudHMgdGhhdCBvdmVybGFwXG4gICAgdmFyIGNvdW50U3RhY2sgPSBbXTsgLy8gQ29udGFpbnMgdGhlIGVsZW1lbnRzIHRoYXQgb3ZlcmxhcFxuICAgIHZhciByZXRBcnJheSA9IFtdO1xuICAgIHZhciBjdXJyZW50RGVwdGggPSAxO1xuICAgIHZhciB0cmVlLCBpLCBsdHJlZTtcbiAgICBpZiAoIXJlY3QgfHwgIXJlY3RhbmdsZS5vdmVybGFwUmVjdGFuZ2xlKHJlY3QsIHJvb3QpKSB7XG4gICAgICByZXR1cm4gcmV0QXJyYXk7XG4gICAgfVxuICAgIHZhciByZXRPYmogPSB7eDogcmVjdC54LCB5OiByZWN0LnksIHc6IHJlY3QudywgaDogcmVjdC5oLCB0YXJnZXQ6IG9ian07XG5cbiAgICBjb3VudFN0YWNrLnB1c2gocm9vdC5ub2Rlcy5sZW5ndGgpO1xuICAgIGhpdFN0YWNrLnB1c2gocm9vdCk7XG4gICAgd2hpbGUgKGhpdFN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIHRyZWUgPSBoaXRTdGFjay5wb3AoKTtcbiAgICAgIGkgPSBjb3VudFN0YWNrLnBvcCgpIC0gMTtcbiAgICAgIGlmICgndGFyZ2V0JyBpbiByZXRPYmopIHsgLy8gd2lsbCB0aGlzIGV2ZXIgYmUgZmFsc2U/XG4gICAgICAgIHdoaWxlIChpID49IDApIHtcbiAgICAgICAgICBsdHJlZSA9IHRyZWUubm9kZXNbaV07XG4gICAgICAgICAgaWYgKHJlY3RhbmdsZS5vdmVybGFwUmVjdGFuZ2xlKHJldE9iaiwgbHRyZWUpKSB7XG4gICAgICAgICAgICBpZiAoKHJldE9iai50YXJnZXQgJiYgJ2xlYWYnIGluIGx0cmVlICYmIGx0cmVlLmxlYWYgPT09IHJldE9iai50YXJnZXQpIHx8ICghcmV0T2JqLnRhcmdldCAmJiAoJ2xlYWYnIGluIGx0cmVlIHx8IHJlY3RhbmdsZS5jb250YWluc1JlY3RhbmdsZShsdHJlZSwgcmV0T2JqKSkpKSB7XG4gICAgICAgICAgICAgIC8vIEEgTWF0Y2ggISFcbiAgICAgICAgICAgIC8vIFl1cCB3ZSBmb3VuZCBhIG1hdGNoLi4uXG4gICAgICAgICAgICAvLyB3ZSBjYW4gY2FuY2VsIHNlYXJjaCBhbmQgc3RhcnQgd2Fsa2luZyB1cCB0aGUgbGlzdFxuICAgICAgICAgICAgICBpZiAoJ25vZGVzJyBpbiBsdHJlZSkgey8vIElmIHdlIGFyZSBkZWxldGluZyBhIG5vZGUgbm90IGEgbGVhZi4uLlxuICAgICAgICAgICAgICAgIHJldEFycmF5ID0gZmxhdHRlbih0cmVlLm5vZGVzLnNwbGljZShpLCAxKSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0QXJyYXkgPSB0cmVlLm5vZGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBSZXNpemUgTUJSIGRvd24uLi5cbiAgICAgICAgICAgICAgcmVjdGFuZ2xlLm1ha2VNQlIodHJlZS5ub2RlcywgdHJlZSk7XG4gICAgICAgICAgICAgIGRlbGV0ZSByZXRPYmoudGFyZ2V0O1xuICAgICAgICAgICAgICAvL2lmICh0cmVlLm5vZGVzLmxlbmd0aCA8IG1pbldpZHRoKSB7IC8vIFVuZGVyZmxvd1xuICAgICAgICAgICAgICAvLyAgcmV0T2JqLm5vZGVzID0gc2VhcmNoU3VidHJlZSh0cmVlLCB0cnVlLCBbXSwgdHJlZSk7XG4gICAgICAgICAgICAgIC8vfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoJ25vZGVzJyBpbiBsdHJlZSkgeyAvLyBOb3QgYSBMZWFmXG4gICAgICAgICAgICAgIGN1cnJlbnREZXB0aCsrO1xuICAgICAgICAgICAgICBjb3VudFN0YWNrLnB1c2goaSk7XG4gICAgICAgICAgICAgIGhpdFN0YWNrLnB1c2godHJlZSk7XG4gICAgICAgICAgICAgIHRyZWUgPSBsdHJlZTtcbiAgICAgICAgICAgICAgaSA9IGx0cmVlLm5vZGVzLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaS0tO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSBpZiAoJ25vZGVzJyBpbiByZXRPYmopIHsgLy8gV2UgYXJlIHVuc3BsaXR0aW5nXG5cbiAgICAgICAgdHJlZS5ub2Rlcy5zcGxpY2UoaSArIDEsIDEpOyAvLyBSZW1vdmUgdW5zcGxpdCBub2RlXG4gICAgICAgIGlmICh0cmVlLm5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZWN0YW5nbGUubWFrZU1CUih0cmVlLm5vZGVzLCB0cmVlKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciB0ID0gMDt0IDwgcmV0T2JqLm5vZGVzLmxlbmd0aDt0KyspIHtcbiAgICAgICAgICBpbnNlcnRTdWJ0cmVlKHJldE9iai5ub2Rlc1t0XSwgdHJlZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0T2JqLm5vZGVzID0gW107XG4gICAgICAgIGlmIChoaXRTdGFjay5sZW5ndGggPT09IDAgJiYgdHJlZS5ub2Rlcy5sZW5ndGggPD0gMSkgeyAvLyBVbmRlcmZsb3cuLm9uIHJvb3QhXG4gICAgICAgICAgcmV0T2JqLm5vZGVzID0gc2VhcmNoU3VidHJlZSh0cmVlLCB0cnVlLCByZXRPYmoubm9kZXMsIHRyZWUpO1xuICAgICAgICAgIHRyZWUubm9kZXMgPSBbXTtcbiAgICAgICAgICBoaXRTdGFjay5wdXNoKHRyZWUpO1xuICAgICAgICAgIGNvdW50U3RhY2sucHVzaCgxKTtcbiAgICAgICAgfSBlbHNlIGlmIChoaXRTdGFjay5sZW5ndGggPiAwICYmIHRyZWUubm9kZXMubGVuZ3RoIDwgbWluV2lkdGgpIHsgLy8gVW5kZXJmbG93Li5BR0FJTiFcbiAgICAgICAgICByZXRPYmoubm9kZXMgPSBzZWFyY2hTdWJ0cmVlKHRyZWUsIHRydWUsIHJldE9iai5ub2RlcywgdHJlZSk7XG4gICAgICAgICAgdHJlZS5ub2RlcyA9IFtdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSByZXRPYmoubm9kZXM7IC8vIEp1c3Qgc3RhcnQgcmVzaXppbmdcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gd2UgYXJlIGp1c3QgcmVzaXppbmdcbiAgICAgICAgcmVjdGFuZ2xlLm1ha2VNQlIodHJlZS5ub2RlcywgdHJlZSk7XG4gICAgICB9XG4gICAgICBjdXJyZW50RGVwdGggLT0gMTtcbiAgICB9XG4gICAgcmV0dXJuIHJldEFycmF5O1xuICB9O1xuXG4gIC8qIGNob29zZSB0aGUgYmVzdCBkYW1uIG5vZGUgZm9yIHJlY3RhbmdsZSB0byBiZSBpbnNlcnRlZCBpbnRvXG4gICAqIFsgbGVhZiBub2RlIHBhcmVudCBdID0gY2hvb3NlTGVhZlN1YnRyZWUocmVjdGFuZ2xlLCByb290IHRvIHN0YXJ0IHNlYXJjaCBhdClcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciBjaG9vc2VMZWFmU3VidHJlZSA9IGZ1bmN0aW9uIChyZWN0LCByb290KSB7XG4gICAgdmFyIGJlc3RDaG9pY2VJbmRleCA9IC0xO1xuICAgIHZhciBiZXN0Q2hvaWNlU3RhY2sgPSBbXTtcbiAgICB2YXIgYmVzdENob2ljZUFyZWE7XG4gICAgdmFyIGZpcnN0ID0gdHJ1ZTtcbiAgICBiZXN0Q2hvaWNlU3RhY2sucHVzaChyb290KTtcbiAgICB2YXIgbm9kZXMgPSByb290Lm5vZGVzO1xuXG4gICAgd2hpbGUgKGZpcnN0IHx8IGJlc3RDaG9pY2VJbmRleCAhPT0gLTEpIHtcbiAgICAgIGlmIChmaXJzdCkge1xuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmVzdENob2ljZVN0YWNrLnB1c2gobm9kZXNbYmVzdENob2ljZUluZGV4XSk7XG4gICAgICAgIG5vZGVzID0gbm9kZXNbYmVzdENob2ljZUluZGV4XS5ub2RlcztcbiAgICAgICAgYmVzdENob2ljZUluZGV4ID0gLTE7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgbHRyZWUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKCdsZWFmJyBpbiBsdHJlZSkge1xuICAgICAgICAgIC8vIEJhaWwgb3V0IG9mIGV2ZXJ5dGhpbmcgYW5kIHN0YXJ0IGluc2VydGluZ1xuICAgICAgICAgIGJlc3RDaG9pY2VJbmRleCA9IC0xO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIEFyZWEgb2YgbmV3IGVubGFyZ2VkIHJlY3RhbmdsZVxuICAgICAgICB2YXIgb2xkTFJhdGlvID0gcmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyhsdHJlZS53LCBsdHJlZS5oLCBsdHJlZS5ub2Rlcy5sZW5ndGggKyAxKTtcblxuICAgICAgICAvLyBFbmxhcmdlIHJlY3RhbmdsZSB0byBmaXQgbmV3IHJlY3RhbmdsZVxuICAgICAgICB2YXIgbncgPSBNYXRoLm1heChsdHJlZS54ICsgbHRyZWUudywgcmVjdC54ICsgcmVjdC53KSAtIE1hdGgubWluKGx0cmVlLngsIHJlY3QueCk7XG4gICAgICAgIHZhciBuaCA9IE1hdGgubWF4KGx0cmVlLnkgKyBsdHJlZS5oLCByZWN0LnkgKyByZWN0LmgpIC0gTWF0aC5taW4obHRyZWUueSwgcmVjdC55KTtcblxuICAgICAgICAvLyBBcmVhIG9mIG5ldyBlbmxhcmdlZCByZWN0YW5nbGVcbiAgICAgICAgdmFyIGxyYXRpbyA9IHJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8obncsIG5oLCBsdHJlZS5ub2Rlcy5sZW5ndGggKyAyKTtcblxuICAgICAgICBpZiAoYmVzdENob2ljZUluZGV4IDwgMCB8fCBNYXRoLmFicyhscmF0aW8gLSBvbGRMUmF0aW8pIDwgYmVzdENob2ljZUFyZWEpIHtcbiAgICAgICAgICBiZXN0Q2hvaWNlQXJlYSA9IE1hdGguYWJzKGxyYXRpbyAtIG9sZExSYXRpbyk7XG4gICAgICAgICAgYmVzdENob2ljZUluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBiZXN0Q2hvaWNlU3RhY2s7XG4gIH07XG5cbiAgLyogc3BsaXQgYSBzZXQgb2Ygbm9kZXMgaW50byB0d28gcm91Z2hseSBlcXVhbGx5LWZpbGxlZCBub2Rlc1xuICAgKiBbIGFuIGFycmF5IG9mIHR3byBuZXcgYXJyYXlzIG9mIG5vZGVzIF0gPSBsaW5lYXJTcGxpdChhcnJheSBvZiBub2RlcylcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciBsaW5lYXJTcGxpdCA9IGZ1bmN0aW9uIChub2Rlcykge1xuICAgIHZhciBuID0gcGlja0xpbmVhcihub2Rlcyk7XG4gICAgd2hpbGUgKG5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHBpY2tOZXh0KG5vZGVzLCBuWzBdLCBuWzFdKTtcbiAgICB9XG4gICAgcmV0dXJuIG47XG4gIH07XG5cbiAgLyogaW5zZXJ0IHRoZSBiZXN0IHNvdXJjZSByZWN0YW5nbGUgaW50byB0aGUgYmVzdCBmaXR0aW5nIHBhcmVudCBub2RlOiBhIG9yIGJcbiAgICogW10gPSBwaWNrTmV4dChhcnJheSBvZiBzb3VyY2Ugbm9kZXMsIHRhcmdldCBub2RlIGFycmF5IGEsIHRhcmdldCBub2RlIGFycmF5IGIpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgcGlja05leHQgPSBmdW5jdGlvbiAobm9kZXMsIGEsIGIpIHtcbiAgLy8gQXJlYSBvZiBuZXcgZW5sYXJnZWQgcmVjdGFuZ2xlXG4gICAgdmFyIGFyZWFBID0gcmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyhhLncsIGEuaCwgYS5ub2Rlcy5sZW5ndGggKyAxKTtcbiAgICB2YXIgYXJlYUIgPSByZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvKGIudywgYi5oLCBiLm5vZGVzLmxlbmd0aCArIDEpO1xuICAgIHZhciBoaWdoQXJlYURlbHRhO1xuICAgIHZhciBoaWdoQXJlYU5vZGU7XG4gICAgdmFyIGxvd2VzdEdyb3d0aEdyb3VwO1xuXG4gICAgZm9yICh2YXIgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDtpLS0pIHtcbiAgICAgIHZhciBsID0gbm9kZXNbaV07XG4gICAgICB2YXIgbmV3QXJlYUEgPSB7fTtcbiAgICAgIG5ld0FyZWFBLnggPSBNYXRoLm1pbihhLngsIGwueCk7XG4gICAgICBuZXdBcmVhQS55ID0gTWF0aC5taW4oYS55LCBsLnkpO1xuICAgICAgbmV3QXJlYUEudyA9IE1hdGgubWF4KGEueCArIGEudywgbC54ICsgbC53KSAtIG5ld0FyZWFBLng7XG4gICAgICBuZXdBcmVhQS5oID0gTWF0aC5tYXgoYS55ICsgYS5oLCBsLnkgKyBsLmgpIC0gbmV3QXJlYUEueTtcbiAgICAgIHZhciBjaGFuZ2VOZXdBcmVhQSA9IE1hdGguYWJzKHJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8obmV3QXJlYUEudywgbmV3QXJlYUEuaCwgYS5ub2Rlcy5sZW5ndGggKyAyKSAtIGFyZWFBKTtcblxuICAgICAgdmFyIG5ld0FyZWFCID0ge307XG4gICAgICBuZXdBcmVhQi54ID0gTWF0aC5taW4oYi54LCBsLngpO1xuICAgICAgbmV3QXJlYUIueSA9IE1hdGgubWluKGIueSwgbC55KTtcbiAgICAgIG5ld0FyZWFCLncgPSBNYXRoLm1heChiLnggKyBiLncsIGwueCArIGwudykgLSBuZXdBcmVhQi54O1xuICAgICAgbmV3QXJlYUIuaCA9IE1hdGgubWF4KGIueSArIGIuaCwgbC55ICsgbC5oKSAtIG5ld0FyZWFCLnk7XG4gICAgICB2YXIgY2hhbmdlTmV3QXJlYUIgPSBNYXRoLmFicyhyZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvKG5ld0FyZWFCLncsIG5ld0FyZWFCLmgsIGIubm9kZXMubGVuZ3RoICsgMikgLSBhcmVhQik7XG5cbiAgICAgIGlmICghaGlnaEFyZWFOb2RlIHx8ICFoaWdoQXJlYURlbHRhIHx8IE1hdGguYWJzKGNoYW5nZU5ld0FyZWFCIC0gY2hhbmdlTmV3QXJlYUEpIDwgaGlnaEFyZWFEZWx0YSkge1xuICAgICAgICBoaWdoQXJlYU5vZGUgPSBpO1xuICAgICAgICBoaWdoQXJlYURlbHRhID0gTWF0aC5hYnMoY2hhbmdlTmV3QXJlYUIgLSBjaGFuZ2VOZXdBcmVhQSk7XG4gICAgICAgIGxvd2VzdEdyb3d0aEdyb3VwID0gY2hhbmdlTmV3QXJlYUIgPCBjaGFuZ2VOZXdBcmVhQSA/IGIgOiBhO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgdGVtcE5vZGUgPSBub2Rlcy5zcGxpY2UoaGlnaEFyZWFOb2RlLCAxKVswXTtcbiAgICBpZiAoYS5ub2Rlcy5sZW5ndGggKyBub2Rlcy5sZW5ndGggKyAxIDw9IG1pbldpZHRoKSB7XG4gICAgICBhLm5vZGVzLnB1c2godGVtcE5vZGUpO1xuICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShhLCB0ZW1wTm9kZSk7XG4gICAgfSAgZWxzZSBpZiAoYi5ub2Rlcy5sZW5ndGggKyBub2Rlcy5sZW5ndGggKyAxIDw9IG1pbldpZHRoKSB7XG4gICAgICBiLm5vZGVzLnB1c2godGVtcE5vZGUpO1xuICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShiLCB0ZW1wTm9kZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbG93ZXN0R3Jvd3RoR3JvdXAubm9kZXMucHVzaCh0ZW1wTm9kZSk7XG4gICAgICByZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlKGxvd2VzdEdyb3d0aEdyb3VwLCB0ZW1wTm9kZSk7XG4gICAgfVxuICB9O1xuXG4gIC8qIHBpY2sgdGhlICdiZXN0JyB0d28gc3RhcnRlciBub2RlcyB0byB1c2UgYXMgc2VlZHMgdXNpbmcgdGhlICdsaW5lYXInIGNyaXRlcmlhXG4gICAqIFsgYW4gYXJyYXkgb2YgdHdvIG5ldyBhcnJheXMgb2Ygbm9kZXMgXSA9IHBpY2tMaW5lYXIoYXJyYXkgb2Ygc291cmNlIG5vZGVzKVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIHBpY2tMaW5lYXIgPSBmdW5jdGlvbiAobm9kZXMpIHtcbiAgICB2YXIgbG93ZXN0SGlnaFggPSBub2Rlcy5sZW5ndGggLSAxO1xuICAgIHZhciBoaWdoZXN0TG93WCA9IDA7XG4gICAgdmFyIGxvd2VzdEhpZ2hZID0gbm9kZXMubGVuZ3RoIC0gMTtcbiAgICB2YXIgaGlnaGVzdExvd1kgPSAwO1xuICAgIHZhciB0MSwgdDI7XG5cbiAgICBmb3IgKHZhciBpID0gbm9kZXMubGVuZ3RoIC0gMjsgaSA+PSAwO2ktLSkge1xuICAgICAgdmFyIGwgPSBub2Rlc1tpXTtcbiAgICAgIGlmIChsLnggPiBub2Rlc1toaWdoZXN0TG93WF0ueCkge1xuICAgICAgICBoaWdoZXN0TG93WCA9IGk7XG4gICAgICB9IGVsc2UgaWYgKGwueCArIGwudyA8IG5vZGVzW2xvd2VzdEhpZ2hYXS54ICsgbm9kZXNbbG93ZXN0SGlnaFhdLncpIHtcbiAgICAgICAgbG93ZXN0SGlnaFggPSBpO1xuICAgICAgfVxuICAgICAgaWYgKGwueSA+IG5vZGVzW2hpZ2hlc3RMb3dZXS55KSB7XG4gICAgICAgIGhpZ2hlc3RMb3dZID0gaTtcbiAgICAgIH0gZWxzZSBpZiAobC55ICsgbC5oIDwgbm9kZXNbbG93ZXN0SGlnaFldLnkgKyBub2Rlc1tsb3dlc3RIaWdoWV0uaCkge1xuICAgICAgICBsb3dlc3RIaWdoWSA9IGk7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBkeCA9IE1hdGguYWJzKChub2Rlc1tsb3dlc3RIaWdoWF0ueCArIG5vZGVzW2xvd2VzdEhpZ2hYXS53KSAtIG5vZGVzW2hpZ2hlc3RMb3dYXS54KTtcbiAgICB2YXIgZHkgPSBNYXRoLmFicygobm9kZXNbbG93ZXN0SGlnaFldLnkgKyBub2Rlc1tsb3dlc3RIaWdoWV0uaCkgLSBub2Rlc1toaWdoZXN0TG93WV0ueSk7XG4gICAgaWYgKGR4ID4gZHkpICB7XG4gICAgICBpZiAobG93ZXN0SGlnaFggPiBoaWdoZXN0TG93WCkgIHtcbiAgICAgICAgdDEgPSBub2Rlcy5zcGxpY2UobG93ZXN0SGlnaFgsIDEpWzBdO1xuICAgICAgICB0MiA9IG5vZGVzLnNwbGljZShoaWdoZXN0TG93WCwgMSlbMF07XG4gICAgICB9ICBlbHNlIHtcbiAgICAgICAgdDIgPSBub2Rlcy5zcGxpY2UoaGlnaGVzdExvd1gsIDEpWzBdO1xuICAgICAgICB0MSA9IG5vZGVzLnNwbGljZShsb3dlc3RIaWdoWCwgMSlbMF07XG4gICAgICB9XG4gICAgfSAgZWxzZSB7XG4gICAgICBpZiAobG93ZXN0SGlnaFkgPiBoaWdoZXN0TG93WSkgIHtcbiAgICAgICAgdDEgPSBub2Rlcy5zcGxpY2UobG93ZXN0SGlnaFksIDEpWzBdO1xuICAgICAgICB0MiA9IG5vZGVzLnNwbGljZShoaWdoZXN0TG93WSwgMSlbMF07XG4gICAgICB9ICBlbHNlIHtcbiAgICAgICAgdDIgPSBub2Rlcy5zcGxpY2UoaGlnaGVzdExvd1ksIDEpWzBdO1xuICAgICAgICB0MSA9IG5vZGVzLnNwbGljZShsb3dlc3RIaWdoWSwgMSlbMF07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICB7eDogdDEueCwgeTogdDEueSwgdzogdDEudywgaDogdDEuaCwgbm9kZXM6IFt0MV19LFxuICAgICAge3g6IHQyLngsIHk6IHQyLnksIHc6IHQyLncsIGg6IHQyLmgsIG5vZGVzOiBbdDJdfVxuICAgIF07XG4gIH07XG5cbiAgdmFyIGF0dGFjaERhdGEgPSBmdW5jdGlvbiAobm9kZSwgbW9yZVRyZWUpIHtcbiAgICBub2RlLm5vZGVzID0gbW9yZVRyZWUubm9kZXM7XG4gICAgbm9kZS54ID0gbW9yZVRyZWUueDtcbiAgICBub2RlLnkgPSBtb3JlVHJlZS55O1xuICAgIG5vZGUudyA9IG1vcmVUcmVlLnc7XG4gICAgbm9kZS5oID0gbW9yZVRyZWUuaDtcbiAgICByZXR1cm4gbm9kZTtcbiAgfTtcblxuICAvKiBub24tcmVjdXJzaXZlIGludGVybmFsIHNlYXJjaCBmdW5jdGlvblxuICAqIFsgbm9kZXMgfCBvYmplY3RzIF0gPSBzZWFyY2hTdWJ0cmVlKHJlY3RhbmdsZSwgW3JldHVybiBub2RlIGRhdGFdLCBbYXJyYXkgdG8gZmlsbF0sIHJvb3QgdG8gYmVnaW4gc2VhcmNoIGF0KVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIHNlYXJjaFN1YnRyZWUgPSBmdW5jdGlvbiAocmVjdCwgcmV0dXJuTm9kZSwgcmV0dXJuQXJyYXksIHJvb3QpIHtcbiAgICB2YXIgaGl0U3RhY2sgPSBbXTsgLy8gQ29udGFpbnMgdGhlIGVsZW1lbnRzIHRoYXQgb3ZlcmxhcFxuXG4gICAgaWYgKCFyZWN0YW5nbGUub3ZlcmxhcFJlY3RhbmdsZShyZWN0LCByb290KSkge1xuICAgICAgcmV0dXJuIHJldHVybkFycmF5O1xuICAgIH1cblxuXG4gICAgaGl0U3RhY2sucHVzaChyb290Lm5vZGVzKTtcblxuICAgIHdoaWxlIChoaXRTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgbm9kZXMgPSBoaXRTdGFjay5wb3AoKTtcblxuICAgICAgZm9yICh2YXIgaSA9IG5vZGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIHZhciBsdHJlZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAocmVjdGFuZ2xlLm92ZXJsYXBSZWN0YW5nbGUocmVjdCwgbHRyZWUpKSB7XG4gICAgICAgICAgaWYgKCdub2RlcycgaW4gbHRyZWUpIHsgLy8gTm90IGEgTGVhZlxuICAgICAgICAgICAgaGl0U3RhY2sucHVzaChsdHJlZS5ub2Rlcyk7XG4gICAgICAgICAgfSBlbHNlIGlmICgnbGVhZicgaW4gbHRyZWUpIHsgLy8gQSBMZWFmICEhXG4gICAgICAgICAgICBpZiAoIXJldHVybk5vZGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuQXJyYXkucHVzaChsdHJlZS5sZWFmKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybkFycmF5LnB1c2gobHRyZWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiByZXR1cm5BcnJheTtcbiAgfTtcblxuICAvKiBub24tcmVjdXJzaXZlIGludGVybmFsIGluc2VydCBmdW5jdGlvblxuICAgKiBbXSA9IGluc2VydFN1YnRyZWUocmVjdGFuZ2xlLCBvYmplY3QgdG8gaW5zZXJ0LCByb290IHRvIGJlZ2luIGluc2VydGlvbiBhdClcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciBpbnNlcnRTdWJ0cmVlID0gZnVuY3Rpb24gKG5vZGUsIHJvb3QpIHtcbiAgICB2YXIgYmM7IC8vIEJlc3QgQ3VycmVudCBub2RlXG4gICAgLy8gSW5pdGlhbCBpbnNlcnRpb24gaXMgc3BlY2lhbCBiZWNhdXNlIHdlIHJlc2l6ZSB0aGUgVHJlZSBhbmQgd2UgZG9uJ3RcbiAgICAvLyBjYXJlIGFib3V0IGFueSBvdmVyZmxvdyAoc2VyaW91c2x5LCBob3cgY2FuIHRoZSBmaXJzdCBvYmplY3Qgb3ZlcmZsb3c/KVxuICAgIGlmIChyb290Lm5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcm9vdC54ID0gbm9kZS54O1xuICAgICAgcm9vdC55ID0gbm9kZS55O1xuICAgICAgcm9vdC53ID0gbm9kZS53O1xuICAgICAgcm9vdC5oID0gbm9kZS5oO1xuICAgICAgcm9vdC5ub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEZpbmQgdGhlIGJlc3QgZml0dGluZyBsZWFmIG5vZGVcbiAgICAvLyBjaG9vc2VMZWFmIHJldHVybnMgYW4gYXJyYXkgb2YgYWxsIHRyZWUgbGV2ZWxzIChpbmNsdWRpbmcgcm9vdClcbiAgICAvLyB0aGF0IHdlcmUgdHJhdmVyc2VkIHdoaWxlIHRyeWluZyB0byBmaW5kIHRoZSBsZWFmXG4gICAgdmFyIHRyZWVTdGFjayA9IGNob29zZUxlYWZTdWJ0cmVlKG5vZGUsIHJvb3QpO1xuICAgIHZhciByZXRPYmogPSBub2RlOy8ve3g6cmVjdC54LHk6cmVjdC55LHc6cmVjdC53LGg6cmVjdC5oLCBsZWFmOm9ian07XG4gICAgdmFyIHBiYztcbiAgICAvLyBXYWxrIGJhY2sgdXAgdGhlIHRyZWUgcmVzaXppbmcgYW5kIGluc2VydGluZyBhcyBuZWVkZWRcbiAgICB3aGlsZSAodHJlZVN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vaGFuZGxlIHRoZSBjYXNlIG9mIGFuIGVtcHR5IG5vZGUgKGZyb20gYSBzcGxpdClcbiAgICAgIGlmIChiYyAmJiAnbm9kZXMnIGluIGJjICYmIGJjLm5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBwYmMgPSBiYzsgLy8gUGFzdCBiY1xuICAgICAgICBiYyA9IHRyZWVTdGFjay5wb3AoKTtcbiAgICAgICAgZm9yICh2YXIgdCA9IDA7dCA8IGJjLm5vZGVzLmxlbmd0aDt0KyspIHtcbiAgICAgICAgICBpZiAoYmMubm9kZXNbdF0gPT09IHBiYyB8fCBiYy5ub2Rlc1t0XS5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGJjLm5vZGVzLnNwbGljZSh0LCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYmMgPSB0cmVlU3RhY2sucG9wKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZXJlIGlzIGRhdGEgYXR0YWNoZWQgdG8gdGhpcyByZXRPYmpcbiAgICAgIGlmICgnbGVhZicgaW4gcmV0T2JqIHx8ICdub2RlcycgaW4gcmV0T2JqIHx8IEFycmF5LmlzQXJyYXkocmV0T2JqKSkge1xuICAgICAgICAvLyBEbyBJbnNlcnRcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmV0T2JqKSkge1xuICAgICAgICAgIGZvciAodmFyIGFpID0gMDsgYWkgPCByZXRPYmoubGVuZ3RoOyBhaSsrKSB7XG4gICAgICAgICAgICByZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlKGJjLCByZXRPYmpbYWldKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYmMubm9kZXMgPSBiYy5ub2Rlcy5jb25jYXQocmV0T2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlKGJjLCByZXRPYmopO1xuICAgICAgICAgIGJjLm5vZGVzLnB1c2gocmV0T2JqKTsgLy8gRG8gSW5zZXJ0XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmMubm9kZXMubGVuZ3RoIDw9IG1heFdpZHRoKSAgeyAvLyBTdGFydCBSZXNpemVpbmcgVXAgdGhlIFRyZWVcbiAgICAgICAgICByZXRPYmogPSB7eDogYmMueCwgeTogYmMueSwgdzogYmMudywgaDogYmMuaH07XG4gICAgICAgIH0gIGVsc2UgeyAvLyBPdGhlcndpc2UgU3BsaXQgdGhpcyBOb2RlXG4gICAgICAgICAgLy8gbGluZWFyU3BsaXQoKSByZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgdHdvIG5ldyBub2Rlc1xuICAgICAgICAgIC8vIGZvcm1lZCBmcm9tIHRoZSBzcGxpdCBvZiB0aGUgcHJldmlvdXMgbm9kZSdzIG92ZXJmbG93XG4gICAgICAgICAgdmFyIGEgPSBsaW5lYXJTcGxpdChiYy5ub2Rlcyk7XG4gICAgICAgICAgcmV0T2JqID0gYTsvL1sxXTtcblxuICAgICAgICAgIGlmICh0cmVlU3RhY2subGVuZ3RoIDwgMSkgIHsgLy8gSWYgYXJlIHNwbGl0dGluZyB0aGUgcm9vdC4uXG4gICAgICAgICAgICBiYy5ub2Rlcy5wdXNoKGFbMF0pO1xuICAgICAgICAgICAgdHJlZVN0YWNrLnB1c2goYmMpOyAgLy8gUmVjb25zaWRlciB0aGUgcm9vdCBlbGVtZW50XG4gICAgICAgICAgICByZXRPYmogPSBhWzFdO1xuICAgICAgICAgIH0gLyplbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSBiYztcbiAgICAgICAgICB9Ki9cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHsgLy8gT3RoZXJ3aXNlIERvIFJlc2l6ZVxuICAgICAgICAvL0p1c3Qga2VlcCBhcHBseWluZyB0aGUgbmV3IGJvdW5kaW5nIHJlY3RhbmdsZSB0byB0aGUgcGFyZW50cy4uXG4gICAgICAgIHJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUoYmMsIHJldE9iaik7XG4gICAgICAgIHJldE9iaiA9IHt4OiBiYy54LCB5OiBiYy55LCB3OiBiYy53LCBoOiBiYy5ofTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdGhpcy5pbnNlcnRTdWJ0cmVlID0gaW5zZXJ0U3VidHJlZTtcbiAgLyogcXVpY2sgJ24nIGRpcnR5IGZ1bmN0aW9uIGZvciBwbHVnaW5zIG9yIG1hbnVhbGx5IGRyYXdpbmcgdGhlIHRyZWVcbiAgICogWyB0cmVlIF0gPSBSVHJlZS5nZXRUcmVlKCk6IHJldHVybnMgdGhlIHJhdyB0cmVlIGRhdGEuIHVzZWZ1bCBmb3IgYWRkaW5nXG4gICAqIEBwdWJsaWNcbiAgICogISEgREVQUkVDQVRFRCAhIVxuICAgKi9cbiAgdGhpcy5nZXRUcmVlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByb290VHJlZTtcbiAgfTtcblxuICAvKiBxdWljayAnbicgZGlydHkgZnVuY3Rpb24gZm9yIHBsdWdpbnMgb3IgbWFudWFsbHkgbG9hZGluZyB0aGUgdHJlZVxuICAgKiBbIHRyZWUgXSA9IFJUcmVlLnNldFRyZWUoc3ViLXRyZWUsIHdoZXJlIHRvIGF0dGFjaCk6IHJldHVybnMgdGhlIHJhdyB0cmVlIGRhdGEuIHVzZWZ1bCBmb3IgYWRkaW5nXG4gICAqIEBwdWJsaWNcbiAgICogISEgREVQUkVDQVRFRCAhIVxuICAgKi9cbiAgdGhpcy5zZXRUcmVlID0gZnVuY3Rpb24gKG5ld1RyZWUsIHdoZXJlKSB7XG4gICAgaWYgKCF3aGVyZSkge1xuICAgICAgd2hlcmUgPSByb290VHJlZTtcbiAgICB9XG4gICAgcmV0dXJuIGF0dGFjaERhdGEod2hlcmUsIG5ld1RyZWUpO1xuICB9O1xuXG4gIC8qIG5vbi1yZWN1cnNpdmUgc2VhcmNoIGZ1bmN0aW9uXG4gICogWyBub2RlcyB8IG9iamVjdHMgXSA9IFJUcmVlLnNlYXJjaChyZWN0YW5nbGUsIFtyZXR1cm4gbm9kZSBkYXRhXSwgW2FycmF5IHRvIGZpbGxdKVxuICAgKiBAcHVibGljXG4gICAqL1xuICB0aGlzLnNlYXJjaCA9IGZ1bmN0aW9uIChyZWN0LCByZXR1cm5Ob2RlLCByZXR1cm5BcnJheSkge1xuICAgIHJldHVybkFycmF5ID0gcmV0dXJuQXJyYXkgfHwgW107XG4gICAgcmV0dXJuIHNlYXJjaFN1YnRyZWUocmVjdCwgcmV0dXJuTm9kZSwgcmV0dXJuQXJyYXksIHJvb3RUcmVlKTtcbiAgfTtcblxuXG4gIHZhciByZW1vdmVBcmVhID0gZnVuY3Rpb24gKHJlY3QpIHtcbiAgICB2YXIgbnVtYmVyRGVsZXRlZCA9IDEsXG4gICAgcmV0QXJyYXkgPSBbXSxcbiAgICBkZWxldGVkO1xuICAgIHdoaWxlIChudW1iZXJEZWxldGVkID4gMCkge1xuICAgICAgZGVsZXRlZCA9IHJlbW92ZVN1YnRyZWUocmVjdCwgZmFsc2UsIHJvb3RUcmVlKTtcbiAgICAgIG51bWJlckRlbGV0ZWQgPSBkZWxldGVkLmxlbmd0aDtcbiAgICAgIHJldEFycmF5ID0gcmV0QXJyYXkuY29uY2F0KGRlbGV0ZWQpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0QXJyYXk7XG4gIH07XG5cbiAgdmFyIHJlbW92ZU9iaiA9IGZ1bmN0aW9uIChyZWN0LCBvYmopIHtcbiAgICB2YXIgcmV0QXJyYXkgPSByZW1vdmVTdWJ0cmVlKHJlY3QsIG9iaiwgcm9vdFRyZWUpO1xuICAgIHJldHVybiByZXRBcnJheTtcbiAgfTtcbiAgICAvKiBub24tcmVjdXJzaXZlIGRlbGV0ZSBmdW5jdGlvblxuICAgKiBbZGVsZXRlZCBvYmplY3RdID0gUlRyZWUucmVtb3ZlKHJlY3RhbmdsZSwgW29iamVjdCB0byBkZWxldGVdKVxuICAgKi9cbiAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbiAocmVjdCwgb2JqKSB7XG4gICAgaWYgKCFvYmogfHwgdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIHJlbW92ZUFyZWEocmVjdCwgb2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlbW92ZU9iaihyZWN0LCBvYmopO1xuICAgIH1cbiAgfTtcblxuICAvKiBub24tcmVjdXJzaXZlIGluc2VydCBmdW5jdGlvblxuICAgKiBbXSA9IFJUcmVlLmluc2VydChyZWN0YW5nbGUsIG9iamVjdCB0byBpbnNlcnQpXG4gICAqL1xuICB0aGlzLmluc2VydCA9IGZ1bmN0aW9uIChyZWN0LCBvYmopIHtcbiAgICB2YXIgcmV0QXJyYXkgPSBpbnNlcnRTdWJ0cmVlKHt4OiByZWN0LngsIHk6IHJlY3QueSwgdzogcmVjdC53LCBoOiByZWN0LmgsIGxlYWY6IG9ian0sIHJvb3RUcmVlKTtcbiAgICByZXR1cm4gcmV0QXJyYXk7XG4gIH07XG59XG5SVHJlZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKHByaW50aW5nKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnJvb3QsIGZhbHNlLCBwcmludGluZyk7XG59O1xuXG5SVHJlZS5mcm9tSlNPTiA9IGZ1bmN0aW9uIChqc29uKSB7XG4gIHZhciBydCA9IG5ldyBSVHJlZSgpO1xuICBydC5zZXRUcmVlKEpTT04ucGFyc2UoanNvbikpO1xuICByZXR1cm4gcnQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJUcmVlO1xuXG5cbi8qKlxuICogUG9seWZpbGwgZm9yIHRoZSBBcnJheS5pc0FycmF5IGZ1bmN0aW9uXG4gKiB0b2RvOiBUZXN0IG9uIElFNyBhbmQgSUU4XG4gKiBUYWtlbiBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9nZXJhaW50bHVmZi90djQvaXNzdWVzLzIwXG4gKi9cbmlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSAhPT0gJ2Z1bmN0aW9uJykge1xuICBBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24gKGEpIHtcbiAgICByZXR1cm4gdHlwZW9mIGEgPT09ICdvYmplY3QnICYmIHt9LnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG59XG4iLCJmdW5jdGlvbiBDYW52YXNGZWF0dXJlKGdlb2pzb24sIGlkKSB7XG4gICAgXG4gICAgLy8gcmFkaXVzIGZvciBwb2ludCBmZWF0dXJlc1xuICAgIC8vIHVzZSB0byBjYWxjdWxhdGUgbW91c2Ugb3Zlci9vdXQgYW5kIGNsaWNrIGV2ZW50cyBmb3IgcG9pbnRzXG4gICAgLy8gdGhpcyB2YWx1ZSBzaG91bGQgbWF0Y2ggdGhlIHZhbHVlIHVzZWQgZm9yIHJlbmRlcmluZyBwb2ludHNcbiAgICB0aGlzLnNpemUgPSA1O1xuICAgIFxuICAgIC8vIFVzZXIgc3BhY2Ugb2JqZWN0IGZvciBzdG9yZSB2YXJpYWJsZXMgdXNlZCBmb3IgcmVuZGVyaW5nIGdlb21ldHJ5XG4gICAgdGhpcy5yZW5kZXIgPSB7fTtcblxuICAgIHZhciBjYWNoZSA9IHtcbiAgICAgICAgLy8gcHJvamVjdGVkIHBvaW50cyBvbiBjYW52YXNcbiAgICAgICAgY2FudmFzWFkgOiBudWxsLFxuICAgICAgICAvLyB6b29tIGxldmVsIGNhbnZhc1hZIHBvaW50cyBhcmUgY2FsY3VsYXRlZCB0b1xuICAgICAgICB6b29tIDogLTFcbiAgICB9XG4gICAgXG4gICAgLy8gcGVyZm9ybWFuY2UgZmxhZywgd2lsbCBrZWVwIGludmlzaWJsZSBmZWF0dXJlcyBmb3IgcmVjYWxjIFxuICAgIC8vIGV2ZW50cyBhcyB3ZWxsIGFzIG5vdCBiZWluZyByZW5kZXJlZFxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgXG4gICAgLy8gYm91bmRpbmcgYm94IGZvciBnZW9tZXRyeSwgdXNlZCBmb3IgaW50ZXJzZWN0aW9uIGFuZFxuICAgIC8vIHZpc2libGlsaXR5IG9wdGltaXphdGlvbnNcbiAgICB0aGlzLmJvdW5kcyA9IG51bGw7XG4gICAgXG4gICAgLy8gTGVhZmxldCBMYXRMbmcsIHVzZWQgZm9yIHBvaW50cyB0byBxdWlja2x5IGxvb2sgZm9yIGludGVyc2VjdGlvblxuICAgIHRoaXMubGF0bG5nID0gbnVsbDtcbiAgICBcbiAgICAvLyBjbGVhciB0aGUgY2FudmFzWFkgc3RvcmVkIHZhbHVlc1xuICAgIHRoaXMuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkZWxldGUgY2FjaGUuY2FudmFzWFk7XG4gICAgICAgIGNhY2hlLnpvb20gPSAtMTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zZXRDYW52YXNYWSA9IGZ1bmN0aW9uKGNhbnZhc1hZLCB6b29tKSB7XG4gICAgICAgIGNhY2hlLmNhbnZhc1hZID0gY2FudmFzWFk7XG4gICAgICAgIGNhY2hlLnpvb20gPSB6b29tO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLmdldENhbnZhc1hZID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjYWNoZS5jYW52YXNYWTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5yZXF1aXJlc1JlcHJvamVjdGlvbiA9IGZ1bmN0aW9uKHpvb20pIHtcbiAgICAgIGlmKCBjYWNoZS56b29tID09IHpvb20gJiYgY2FjaGUuY2FudmFzWFkgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG4gICAgaWYoIGdlb2pzb24uZ2VvbWV0cnkgKSB7XG4gICAgICAgIHRoaXMuZ2VvanNvbiA9IHtcbiAgICAgICAgICAgIHR5cGUgOiAnRmVhdHVyZScsXG4gICAgICAgICAgICBnZW9tZXRyeSA6IGdlb2pzb24uZ2VvbWV0cnksXG4gICAgICAgICAgICBwcm9wZXJ0aWVzIDoge1xuICAgICAgICAgICAgICAgIGlkIDogaWQgfHwgZ2VvanNvbi5wcm9wZXJ0aWVzLmlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZ2VvanNvbiA9IHtcbiAgICAgICAgICAgIHR5cGUgOiAnRmVhdHVyZScsXG4gICAgICAgICAgICBnZW9tZXRyeSA6IGdlb2pzb24sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzIDoge1xuICAgICAgICAgICAgICAgIGlkIDogaWRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gdGhpcy5nZW9qc29uLmdlb21ldHJ5LnR5cGU7XG5cbiAgICAvLyBvcHRpb25hbCwgcGVyIGZlYXR1cmUsIHJlbmRlcmVyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRmVhdHVyZTsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZScpO1xuXG5mdW5jdGlvbiBDYW52YXNGZWF0dXJlcyhnZW9qc29uKSB7XG4gICAgLy8gcXVpY2sgdHlwZSBmbGFnXG4gICAgdGhpcy5pc0NhbnZhc0ZlYXR1cmVzID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzID0gW107XG4gICAgXG4gICAgLy8gYWN0dWFsIGdlb2pzb24gb2JqZWN0LCB3aWxsIG5vdCBiZSBtb2RpZmVkLCBqdXN0IHN0b3JlZFxuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgXG4gICAgLy8gcGVyZm9ybWFuY2UgZmxhZywgd2lsbCBrZWVwIGludmlzaWJsZSBmZWF0dXJlcyBmb3IgcmVjYWxjIFxuICAgIC8vIGV2ZW50cyBhcyB3ZWxsIGFzIG5vdCBiZWluZyByZW5kZXJlZFxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgXG4gICAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5jYW52YXNGZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzRmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCB0aGlzLmdlb2pzb24gKSB7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9qc29uLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNGZWF0dXJlcy5wdXNoKG5ldyBDYW52YXNGZWF0dXJlKHRoaXMuZ2VvanNvbi5mZWF0dXJlc1tpXSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0ZlYXR1cmVzOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmVzJyk7XG5cbmZ1bmN0aW9uIGZhY3RvcnkoYXJnKSB7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoYXJnKSApIHtcbiAgICAgICAgcmV0dXJuIGFyZy5tYXAoZ2VuZXJhdGUpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZ2VuZXJhdGUoYXJnKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGUoZ2VvanNvbikge1xuICAgIGlmKCBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicgKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzRmVhdHVyZXMoZ2VvanNvbik7XG4gICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09PSAnRmVhdHVyZScgKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzRmVhdHVyZShnZW9qc29uKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBHZW9KU09OOiAnK2dlb2pzb24udHlwZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTsiLCJ2YXIgY3R4O1xuXG4vKipcbiAqIEZ1Y3Rpb24gY2FsbGVkIGluIHNjb3BlIG9mIENhbnZhc0ZlYXR1cmVcbiAqL1xuZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQsIHh5UG9pbnRzLCBtYXAsIGNhbnZhc0ZlYXR1cmUpIHtcbiAgICBjdHggPSBjb250ZXh0O1xuICAgIFxuICAgIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdQb2ludCcgKSB7XG4gICAgICAgIHJlbmRlclBvaW50KHh5UG9pbnRzLCB0aGlzLnNpemUpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnTGluZVN0cmluZycgKSB7XG4gICAgICAgIHJlbmRlckxpbmUoeHlQb2ludHMpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnUG9seWdvbicgKSB7XG4gICAgICAgIHJlbmRlclBvbHlnb24oeHlQb2ludHMpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgeHlQb2ludHMuZm9yRWFjaChyZW5kZXJQb2x5Z29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBvaW50KHh5UG9pbnQsIHNpemUpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICBjdHguYXJjKHh5UG9pbnQueCwgeHlQb2ludC55LCBzaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAgJ3JnYmEoMCwgMCwgMCwgLjMpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxpbmUoeHlQb2ludHMpIHtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJztcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwgMCwgMCwgLjMpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcblxuICAgIHZhciBqO1xuICAgIGN0eC5tb3ZlVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG4gICAgZm9yKCBqID0gMTsgaiA8IHh5UG9pbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjdHgubGluZVRvKHh5UG9pbnRzW2pdLngsIHh5UG9pbnRzW2pdLnkpO1xuICAgIH1cblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQb2x5Z29uKHh5UG9pbnRzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwgMTUyLCAwLC44KSc7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG5cbiAgICB2YXIgajtcbiAgICBjdHgubW92ZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuICAgIGZvciggaiA9IDE7IGogPCB4eVBvaW50cy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgY3R4LmxpbmVUbyh4eVBvaW50c1tqXS54LCB4eVBvaW50c1tqXS55KTtcbiAgICB9XG4gICAgY3R4LmxpbmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlcjsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcblxuZnVuY3Rpb24gQ2FudmFzTGF5ZXIoKSB7XG4gIC8vIHNob3cgbGF5ZXIgdGltaW5nXG4gIHRoaXMuZGVidWcgPSBmYWxzZTtcblxuICAvLyBpbmNsdWRlIGV2ZW50c1xuICB0aGlzLmluY2x1ZGVzID0gW0wuTWl4aW4uRXZlbnRzXTtcblxuICAvLyBsaXN0IG9mIGdlb2pzb24gZmVhdHVyZXMgdG8gZHJhd1xuICAvLyAgIC0gdGhlc2Ugd2lsbCBkcmF3IGluIG9yZGVyXG4gIHRoaXMuZmVhdHVyZXMgPSBbXTtcbiAgLy8gbG9va3VwIGluZGV4XG4gIHRoaXMuZmVhdHVyZUluZGV4ID0ge307XG5cbiAgLy8gbGlzdCBvZiBjdXJyZW50IGZlYXR1cmVzIHVuZGVyIHRoZSBtb3VzZVxuICB0aGlzLmludGVyc2VjdExpc3QgPSBbXTtcblxuICAvLyB1c2VkIHRvIGNhbGN1bGF0ZSBwaXhlbHMgbW92ZWQgZnJvbSBjZW50ZXJcbiAgdGhpcy5sYXN0Q2VudGVyTEwgPSBudWxsO1xuXG4gIC8vIGdlb21ldHJ5IGhlbHBlcnNcbiAgdGhpcy51dGlscyA9IHJlcXVpcmUoJy4vbGliL3V0aWxzJyk7XG4gIFxuICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgLy8gVE9ETzogbWFrZSB0aGlzIHdvcmtcbiAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IGZhbHNlO1xuICBcbiAgLy8gcmVjb21tZW5kZWQgeW91IG92ZXJyaWRlIHRoaXMuICB5b3UgY2FuIGFsc28gc2V0IGEgY3VzdG9tIHJlbmRlcmVyXG4gIC8vIGZvciBlYWNoIENhbnZhc0ZlYXR1cmUgaWYgeW91IHdpc2hcbiAgdGhpcy5yZW5kZXJlciA9IHJlcXVpcmUoJy4vZGVmYXVsdFJlbmRlcmVyJyk7XG5cbiAgdGhpcy5nZXRDYW52YXMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FudmFzO1xuICB9O1xuXG4gIHRoaXMuZHJhdyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfTtcblxuICB0aGlzLmFkZFRvID0gZnVuY3Rpb24gKG1hcCkge1xuICAgIG1hcC5hZGRMYXllcih0aGlzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICB0aGlzLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIHJlc2V0IGFjdHVhbCBjYW52YXMgc2l6ZVxuICAgIHZhciBzaXplID0gdGhpcy5fbWFwLmdldFNpemUoKTtcbiAgICB0aGlzLl9jYW52YXMud2lkdGggPSBzaXplLng7XG4gICAgdGhpcy5fY2FudmFzLmhlaWdodCA9IHNpemUueTtcbiAgfTtcblxuICAvLyBjbGVhciBjYW52YXNcbiAgdGhpcy5jbGVhckNhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjYW52YXMgPSB0aGlzLmdldENhbnZhcygpO1xuICAgIHZhciBjdHggPSB0aGlzLl9jdHg7XG5cbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAvLyBtYWtlIHN1cmUgdGhpcyBpcyBjYWxsZWQgYWZ0ZXIuLi5cbiAgICB0aGlzLnJlcG9zaXRpb24oKTtcbiAgfVxuXG4gIHRoaXMucmVwb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0b3BMZWZ0ID0gdGhpcy5fbWFwLmNvbnRhaW5lclBvaW50VG9MYXllclBvaW50KFswLCAwXSk7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnRvcCA9IHRvcExlZnQueSsncHgnO1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS5sZWZ0ID0gdG9wTGVmdC54KydweCc7XG4gICAgLy9MLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB0b3BMZWZ0KTtcbiAgfVxuXG4gIC8vIGNsZWFyIGVhY2ggZmVhdHVyZXMgY2FjaGVcbiAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8ga2lsbCB0aGUgZmVhdHVyZSBwb2ludCBjYWNoZVxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuZmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgIH1cbiAgfTtcblxuICAvLyBnZXQgbGF5ZXIgZmVhdHVyZSB2aWEgZ2VvanNvbiBvYmplY3RcbiAgdGhpcy5nZXRDYW52YXNGZWF0dXJlQnlJZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIHRoaXMuZmVhdHVyZUluZGV4W2lkXTtcbiAgfVxuXG4gIC8vIGdldCB0aGUgbWV0ZXJzIHBlciBweCBhbmQgYSBjZXJ0YWluIHBvaW50O1xuICB0aGlzLmdldE1ldGVyc1BlclB4ID0gZnVuY3Rpb24obGF0bG5nKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubWV0ZXJzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICB9XG5cbiAgdGhpcy5nZXREZWdyZWVzUGVyUHggPSBmdW5jdGlvbihsYXRsbmcpIHtcbiAgICByZXR1cm4gdGhpcy51dGlscy5kZWdyZWVzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICB9XG59O1xuXG52YXIgbGF5ZXIgPSBuZXcgQ2FudmFzTGF5ZXIoKTtcblxuXG5yZXF1aXJlKCcuL2xpYi9pbml0JykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvcmVkcmF3JykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvYWRkRmVhdHVyZScpKGxheWVyKTtcbnJlcXVpcmUoJy4vbGliL3RvQ2FudmFzWFknKShsYXllcik7XG5cbkwuQ2FudmFzRmVhdHVyZUZhY3RvcnkgPSByZXF1aXJlKCcuL2NsYXNzZXMvZmFjdG9yeScpO1xuTC5DYW52YXNGZWF0dXJlID0gQ2FudmFzRmVhdHVyZTtcbkwuQ2FudmFzRmVhdHVyZUNvbGxlY3Rpb24gPSBDYW52YXNGZWF0dXJlcztcbkwuQ2FudmFzR2VvanNvbkxheWVyID0gTC5DbGFzcy5leHRlbmQobGF5ZXIpO1xuIiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4uL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcbnZhciBpbnRlcnNlY3RVdGlscyA9IHJlcXVpcmUoJy4vaW50ZXJzZWN0cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gIGxheWVyLmFkZENhbnZhc0ZlYXR1cmVzID0gZnVuY3Rpb24oZmVhdHVyZXMpIHtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdGhpcy5hZGRDYW52YXNGZWF0dXJlKGZlYXR1cmVzW2ldLCBmYWxzZSwgbnVsbCwgZmFsc2UpO1xuICAgIH1cblxuICAgIGludGVyc2VjdFV0aWxzLnJlYnVpbGQodGhpcy5mZWF0dXJlcyk7XG4gIH07XG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZSA9IGZ1bmN0aW9uKGZlYXR1cmUsIGJvdHRvbSwgY2FsbGJhY2spIHtcbiAgICBpZiggIShmZWF0dXJlIGluc3RhbmNlb2YgQ2FudmFzRmVhdHVyZSkgJiYgIShmZWF0dXJlIGluc3RhbmNlb2YgQ2FudmFzRmVhdHVyZXMpICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGZWF0dXJlIG11c3QgYmUgaW5zdGFuY2Ugb2YgQ2FudmFzRmVhdHVyZSBvciBDYW52YXNGZWF0dXJlcycpO1xuICAgIH1cblxuICAgIGlmKCBib3R0b20gKSB7IC8vIGJvdHRvbSBvciBpbmRleFxuICAgICAgaWYoIHR5cGVvZiBib3R0b20gPT09ICdudW1iZXInKSB0aGlzLmZlYXR1cmVzLnNwbGljZShib3R0b20sIDAsIGZlYXR1cmUpO1xuICAgICAgZWxzZSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICB9XG5cbiAgICB0aGlzLmZlYXR1cmVJbmRleFtmZWF0dXJlLmlkXSA9IGZlYXR1cmU7XG5cbiAgICBpbnRlcnNlY3RVdGlscy5hZGQoZmVhdHVyZSk7XG4gIH0sXG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHJlLXJlbmRlciByZXF1aXJlZC4gIGllIHRoZSBmZWF0dXJlIHdhcyB2aXNpYmxlO1xuICBsYXllci5yZW1vdmVDYW52YXNGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZmVhdHVyZXMuaW5kZXhPZihmZWF0dXJlKTtcbiAgICBpZiggaW5kZXggPT0gLTEgKSByZXR1cm47XG5cbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpbnRlcnNlY3RVdGlscy5yZWJ1aWxkKHRoaXMuZmVhdHVyZXMpO1xuXG4gICAgaWYoIHRoaXMuZmVhdHVyZS52aXNpYmxlICkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuICBcbiAgbGF5ZXIucmVtb3ZlQWxsID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IHRydWU7XG4gICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICAgIGludGVyc2VjdFV0aWxzLnJlYnVpbGQodGhpcy5mZWF0dXJlcyk7XG4gIH1cbn0iLCJ2YXIgaW50ZXJzZWN0VXRpbHMgPSByZXF1aXJlKCcuL2ludGVyc2VjdHMnKTtcbnZhciBjb3VudCA9IDA7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBcbiAgICBsYXllci5pbml0aWFsaXplID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLmZlYXR1cmVzID0gW107XG4gICAgICAgIHRoaXMuZmVhdHVyZUluZGV4ID0ge307XG4gICAgICAgIHRoaXMuaW50ZXJzZWN0TGlzdCA9IFtdO1xuICAgICAgICB0aGlzLnNob3dpbmcgPSB0cnVlO1xuXG4gICAgICAgIC8vIHNldCBvcHRpb25zXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcblxuICAgICAgICAvLyBtb3ZlIG1vdXNlIGV2ZW50IGhhbmRsZXJzIHRvIGxheWVyIHNjb3BlXG4gICAgICAgIHZhciBtb3VzZUV2ZW50cyA9IFsnb25Nb3VzZU92ZXInLCAnb25Nb3VzZU1vdmUnLCAnb25Nb3VzZU91dCcsICdvbkNsaWNrJ107XG4gICAgICAgIG1vdXNlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBpZiggIXRoaXMub3B0aW9uc1tlXSApIHJldHVybjtcbiAgICAgICAgICAgIHRoaXNbZV0gPSB0aGlzLm9wdGlvbnNbZV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRpb25zW2VdO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8vIHNldCBjYW52YXMgYW5kIGNhbnZhcyBjb250ZXh0IHNob3J0Y3V0c1xuICAgICAgICB0aGlzLl9jYW52YXMgPSBjcmVhdGVDYW52YXMob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuX2N0eCA9IHRoaXMuX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgIGludGVyc2VjdFV0aWxzLnNldExheWVyKHRoaXMpO1xuICAgIH07XG4gICAgXG4gICAgbGF5ZXIub25BZGQgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuXG4gICAgICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAgICAgLy8gdGhlIGNvbnRhaW5lciBpcyBtb3ZlZCBpbiB0aGUgb3Bvc2l0ZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgICAgIC8vIG1hcCBwYW5lIHRvIGtlZXAgdGhlIGNhbnZhcyBhbHdheXMgaW4gKDAsIDApXG4gICAgICAgIC8vdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcbiAgICAgICAgdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy5tYXJrZXJQYW5lO1xuICAgICAgICB2YXIgX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWxheWVyLScrY291bnQpO1xuICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgIF9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fY2FudmFzKTtcbiAgICAgICAgdGlsZVBhbmUuYXBwZW5kQ2hpbGQoX2NvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgICAgICAvLyBoYWNrOiBsaXN0ZW4gdG8gcHJlZHJhZyBldmVudCBsYXVuY2hlZCBieSBkcmFnZ2luZyB0b1xuICAgICAgICAvLyBzZXQgY29udGFpbmVyIGluIHBvc2l0aW9uICgwLCAwKSBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICAgICAgLyppZiAobWFwLmRyYWdnaW5nLmVuYWJsZWQoKSkge1xuICAgICAgICAgICAgbWFwLmRyYWdnaW5nLl9kcmFnZ2FibGUub24oJ3ByZWRyYWcnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBtb3ZlU3RhcnQuYXBwbHkodGhpcyk7XG4gICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSovXG5cbiAgICAgICAgbWFwLm9uKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICd6b29tc3RhcnQnIDogc3RhcnRab29tLFxuICAgICAgICAgICAgJ3pvb21lbmQnICAgOiBlbmRab29tLFxuICAgICAgICAvLyAgICAnbW92ZXN0YXJ0JyA6IG1vdmVTdGFydCxcbiAgICAgICAgICAgICdtb3ZlZW5kJyAgIDogbW92ZUVuZCxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogaW50ZXJzZWN0VXRpbHMuaW50ZXJzZWN0cyxcbiAgICAgICAgICAgICdjbGljaycgICAgIDogaW50ZXJzZWN0VXRpbHMuaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcblxuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcblxuICAgICAgICBpZiggdGhpcy56SW5kZXggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0WkluZGV4KHRoaXMuekluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsYXllci5vblJlbW92ZSA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgICBtYXAub2ZmKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5yZXNldCxcbiAgICAgICAgIC8vICAgJ21vdmVzdGFydCcgOiBtb3ZlU3RhcnQsXG4gICAgICAgICAgICAnbW92ZWVuZCcgICA6IG1vdmVFbmQsXG4gICAgICAgICAgICAnem9vbXN0YXJ0JyA6IHN0YXJ0Wm9vbSxcbiAgICAgICAgICAgICd6b29tZW5kJyAgIDogZW5kWm9vbSxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogaW50ZXJzZWN0VXRpbHMuaW50ZXJzZWN0cyxcbiAgICAgICAgICAgICdjbGljaycgICAgIDogaW50ZXJzZWN0VXRpbHMuaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbnZhcyhvcHRpb25zKSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IG9wdGlvbnMuekluZGV4IHx8IDA7XG4gICAgdmFyIGNsYXNzTmFtZSA9ICdsZWFmbGV0LXRpbGUtY29udGFpbmVyIGxlYWZsZXQtem9vbS1hbmltYXRlZCc7XG4gICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiBjYW52YXM7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0Wm9vbSgpIHtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGVuZFpvb20oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgdGhpcy5jbGVhckNhY2hlKCk7XG4gICAgc2V0VGltZW91dCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpLCA1MCk7XG59XG5cbmZ1bmN0aW9uIG1vdmVTdGFydCgpIHtcbiAgICBpZiggdGhpcy5tb3ZpbmcgKSByZXR1cm47XG4gICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgIFxuICAgIC8vaWYoICF0aGlzLmFsbG93UGFuUmVuZGVyaW5nICkgcmV0dXJuO1xuICAgIHJldHVybjtcbiAgICAvLyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVuZGVyLmJpbmQodGhpcykpO1xufVxuXG5mdW5jdGlvbiBtb3ZlRW5kKGUpIHtcbiAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVuZGVyKGUpO1xufTtcblxuZnVuY3Rpb24gZnJhbWVSZW5kZXIoKSB7XG4gICAgaWYoICF0aGlzLm1vdmluZyApIHJldHVybjtcblxuICAgIHZhciB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICBcbiAgICBpZiggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0ID4gNzUgKSB7XG4gICAgICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2FibGVkIHJlbmRlcmluZyB3aGlsZSBwYW5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoICF0aGlzLm1vdmluZyApIHJldHVybjtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcyksIDc1MCk7XG59IiwidmFyIFJUcmVlID0gcmVxdWlyZSgncnRyZWUnKTtcbnZhciByVHJlZSA9IG5ldyBSVHJlZSgpO1xudmFyIGxheWVyO1xuXG4vKiogXG4gKiBIYW5kbGUgbW91c2UgaW50ZXJzZWN0aW9uIGV2ZW50c1xuICogZSAtIGxlYWZsZXQgZXZlbnRcbiAqKi9cbmZ1bmN0aW9uIGludGVyc2VjdHMoZSkge1xuICAgIGlmKCAhdGhpcy5zaG93aW5nICkgcmV0dXJuO1xuXG4gICAgdmFyIGRwcCA9IHRoaXMuZ2V0RGVncmVlc1BlclB4KGUubGF0bG5nKTtcblxuICAgIHZhciB4MSA9IGUubGF0bG5nLmxuZyAtIGRwcDtcbiAgICB2YXIgeDIgPSBlLmxhdGxuZy5sbmcgKyBkcHA7XG4gICAgdmFyIHkxID0gZS5sYXRsbmcubGF0IC0gZHBwO1xuICAgIHZhciB5MiA9IGUubGF0bG5nLmxhdCArIGRwcDtcblxuICAgIHZhciBpbnRlcnNlY3RzID0gaW50ZXJzZWN0c0Jib3goW1t4MSwgeTFdLCBbeDIsIHkyXV0pO1xuXG4gICAgb25JbnRlcnNlY3RzTGlzdENyZWF0ZWQuY2FsbCh0aGlzLCBlLCBpbnRlcnNlY3RzKTtcbn1cblxuZnVuY3Rpb24gaW50ZXJzZWN0c0Jib3goYmJveCkge1xuICAgIHZhciBjbEZlYXR1cmVzID0gW107XG4gICAgdmFyIGZlYXR1cmVzID0gclRyZWUuYmJveChiYm94KTtcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY2xGZWF0dXJlcy5wdXNoKGxheWVyLmdldENhbnZhc0ZlYXR1cmVCeUlkKGZlYXR1cmVzW2ldLnByb3BlcnRpZXMuaWQpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNsRmVhdHVyZXM7XG59XG5cbmZ1bmN0aW9uIG9uSW50ZXJzZWN0c0xpc3RDcmVhdGVkKGUsIGludGVyc2VjdHMpIHtcbiAgaWYoIGUudHlwZSA9PSAnY2xpY2snICYmIHRoaXMub25DbGljayApIHtcbiAgICB0aGlzLm9uQ2xpY2soaW50ZXJzZWN0cyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1vdXNlb3ZlciA9IFtdLCBtb3VzZW91dCA9IFtdLCBtb3VzZW1vdmUgPSBbXTtcblxuICB2YXIgY2hhbmdlZCA9IGZhbHNlO1xuICBmb3IoIHZhciBpID0gMDsgaSA8IGludGVyc2VjdHMubGVuZ3RoOyBpKysgKSB7XG4gICAgaWYoIHRoaXMuaW50ZXJzZWN0TGlzdC5pbmRleE9mKGludGVyc2VjdHNbaV0pID4gLTEgKSB7XG4gICAgICBtb3VzZW1vdmUucHVzaChpbnRlcnNlY3RzW2ldKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICBtb3VzZW92ZXIucHVzaChpbnRlcnNlY3RzW2ldKTtcbiAgICB9XG4gIH1cblxuICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuaW50ZXJzZWN0TGlzdC5sZW5ndGg7IGkrKyApIHtcbiAgICBpZiggaW50ZXJzZWN0cy5pbmRleE9mKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSkgPT0gLTEgKSB7XG4gICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIG1vdXNlb3V0LnB1c2godGhpcy5pbnRlcnNlY3RMaXN0W2ldKTtcbiAgICB9XG4gIH1cblxuICB0aGlzLmludGVyc2VjdExpc3QgPSBpbnRlcnNlY3RzO1xuXG4gIGlmKCB0aGlzLm9uTW91c2VPdmVyICYmIG1vdXNlb3Zlci5sZW5ndGggPiAwICkgdGhpcy5vbk1vdXNlT3Zlci5jYWxsKHRoaXMsIG1vdXNlb3ZlciwgZSk7XG4gIGlmKCB0aGlzLm9uTW91c2VNb3ZlICkgdGhpcy5vbk1vdXNlTW92ZS5jYWxsKHRoaXMsIG1vdXNlbW92ZSwgZSk7IC8vIGFsd2F5cyBmaXJlXG4gIGlmKCB0aGlzLm9uTW91c2VPdXQgJiYgbW91c2VvdXQubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU91dC5jYWxsKHRoaXMsIG1vdXNlb3V0LCBlKTtcbn1cblxuZnVuY3Rpb24gcmVidWlsZChjbEZlYXR1cmVzKSB7XG4gIHZhciBmZWF0dXJlcyA9IFtdO1xuICBmb3IoIHZhciBpID0gMDsgaSA8IGNsRmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgZmVhdHVyZXMucHVzaChjbEZlYXR1cmVzW2ldLmdlb2pzb24pOyBcbiAgfVxuXG4gIHJUcmVlID0gbmV3IFJUcmVlKCk7XG4gIHJUcmVlLmdlb0pTT04oe1xuICAgIHR5cGUgOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxuICAgIGZlYXR1cmVzIDogZmVhdHVyZXNcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZChjbEZlYXR1cmUpIHtcbiAgclRyZWUuZ2VvSlNPTihjbEZlYXR1cmUuZ2VvanNvbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbnRlcnNlY3RzIDogaW50ZXJzZWN0cyxcbiAgaW50ZXJzZWN0c0Jib3ggOiBpbnRlcnNlY3RzQmJveCxcbiAgcmVidWlsZCA6IHJlYnVpbGQsXG4gIGFkZCA6IGFkZCxcbiAgc2V0TGF5ZXIgOiBmdW5jdGlvbihsKSB7XG4gICAgbGF5ZXIgPSBsO1xuICB9XG59IiwidmFyIGludGVyc2VjdHNVdGlscyA9IHJlcXVpcmUoJy4vaW50ZXJzZWN0cycpO1xudmFyIHJ1bm5pbmcgPSBmYWxzZTtcbnZhciByZXNjaGVkdWxlID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICBsYXllci5yZW5kZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYoICF0aGlzLmFsbG93UGFuUmVuZGVyaW5nICYmIHRoaXMubW92aW5nICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0LCBkaWZmXG4gICAgaWYoIHRoaXMuZGVidWcgKSB7XG4gICAgICAgIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB9XG5cbiAgICB2YXIgZGlmZiA9IG51bGw7XG4gICAgaWYoIGUgJiYgZS50eXBlID09ICdtb3ZlZW5kJyApIHtcbiAgICAgIHZhciBjZW50ZXIgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XG5cbiAgICAgIHZhciBwdCA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGNlbnRlcik7XG4gICAgICBpZiggdGhpcy5sYXN0Q2VudGVyTEwgKSB7XG4gICAgICAgIHZhciBsYXN0WHkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludCh0aGlzLmxhc3RDZW50ZXJMTCk7XG4gICAgICAgIGRpZmYgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYeS54IC0gcHQueCxcbiAgICAgICAgICB5IDogbGFzdFh5LnkgLSBwdC55XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5sYXN0Q2VudGVyTEwgPSBjZW50ZXI7XG4gICAgfVxuXG5cbiAgICBpZiggIXRoaXMuem9vbWluZyApIHtcbiAgICAgIHRoaXMucmVkcmF3KGRpZmYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgfVxuXG4gIH0sXG4gICAgXG5cbiAgLy8gcmVkcmF3IGFsbCBmZWF0dXJlcy4gIFRoaXMgZG9lcyBub3QgaGFuZGxlIGNsZWFyaW5nIHRoZSBjYW52YXMgb3Igc2V0dGluZ1xuICAvLyB0aGUgY2FudmFzIGNvcnJlY3QgcG9zaXRpb24uICBUaGF0IGlzIGhhbmRsZWQgYnkgcmVuZGVyXG4gIGxheWVyLnJlZHJhdyA9IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIC8vIGlmKCBydW5uaW5nICkge1xuICAgIC8vICAgcmVzY2hlZHVsZSA9IHRydWU7XG4gICAgLy8gICByZXR1cm47XG4gICAgLy8gfVxuICAgIC8vIHJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgLy8gb2JqZWN0cyBzaG91bGQga2VlcCB0cmFjayBvZiBsYXN0IGJib3ggYW5kIHpvb20gb2YgbWFwXG4gICAgLy8gaWYgdGhpcyBoYXNuJ3QgY2hhbmdlZCB0aGUgbGwgLT4gY29udGFpbmVyIHB0IGlzIG5vdCBuZWVkZWRcbiAgICB2YXIgYm91bmRzID0gdGhpcy5fbWFwLmdldEJvdW5kcygpO1xuICAgIHZhciB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcblxuICAgIHZhciBmLCBpLCBzdWJmZWF0dXJlLCBqO1xuICAgIGZvciggaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG5cbiAgICAgIGlmKCBmLmlzQ2FudmFzRmVhdHVyZXMgKSB7XG5cbiAgICAgICAgZm9yKCBqID0gMDsgaiA8IGYuY2FudmFzRmVhdHVyZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgdGhpcy5wcmVwYXJlRm9yUmVkcmF3KGYuY2FudmFzRmVhdHVyZXNbal0sIGJvdW5kcywgem9vbSwgZGlmZik7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcmVwYXJlRm9yUmVkcmF3KGYsIGJvdW5kcywgem9vbSwgZGlmZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGZlYXR1cmVzID0gaW50ZXJzZWN0c1V0aWxzLmludGVyc2VjdHNCYm94KFtbYm91bmRzLmdldFdlc3QoKSwgYm91bmRzLmdldFNvdXRoKCldLCBbYm91bmRzLmdldEVhc3QoKSwgYm91bmRzLmdldE5vcnRoKCldXSk7XG4gICAgdGhpcy5yZWRyYXdGZWF0dXJlcyhmZWF0dXJlcyk7XG4gIH0sXG5cbiAgbGF5ZXIucmVkcmF3RmVhdHVyZXMgPSBmdW5jdGlvbihmZWF0dXJlcykge1xuICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcbiAgICBcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoICFmZWF0dXJlc1tpXS52aXNpYmxlICkgY29udGludWU7XG4gICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUoZmVhdHVyZXNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIGxheWVyLnJlZHJhd0ZlYXR1cmUgPSBmdW5jdGlvbihjYW52YXNGZWF0dXJlKSB7XG4gICAgICB2YXIgcmVuZGVyZXIgPSBjYW52YXNGZWF0dXJlLnJlbmRlcmVyID8gY2FudmFzRmVhdHVyZS5yZW5kZXJlciA6IHRoaXMucmVuZGVyZXI7XG4gICAgICB2YXIgeHkgPSBjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCk7XG5cbiAgICAgIC8vIGJhZG5lc3MuLi5cbiAgICAgIGlmKCAheHkgKSByZXR1cm47XG5cbiAgICAgIC8vIGNhbGwgZmVhdHVyZSByZW5kZXIgZnVuY3Rpb24gaW4gZmVhdHVyZSBzY29wZTsgZmVhdHVyZSBpcyBwYXNzZWQgYXMgd2VsbFxuICAgICAgcmVuZGVyZXIuY2FsbChcbiAgICAgICAgICBjYW52YXNGZWF0dXJlLCAvLyBzY29wZSAoY2FudmFzIGZlYXR1cmUpXG4gICAgICAgICAgdGhpcy5fY3R4LCAgICAgLy8gY2FudmFzIDJkIGNvbnRleHRcbiAgICAgICAgICB4eSwgICAgICAgICAgICAvLyB4eSBwb2ludHMgdG8gZHJhd1xuICAgICAgICAgIHRoaXMuX21hcCwgICAgIC8vIGxlYWZsZXQgbWFwIGluc3RhbmNlXG4gICAgICAgICAgY2FudmFzRmVhdHVyZSAgLy8gY2FudmFzIGZlYXR1cmVcbiAgICAgICk7XG4gIH1cblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIGxheWVyLnByZXBhcmVGb3JSZWRyYXcgPSBmdW5jdGlvbihjYW52YXNGZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYpIHtcbiAgICAvL2lmKCBmZWF0dXJlLmdlb2pzb24ucHJvcGVydGllcy5kZWJ1ZyApIGRlYnVnZ2VyO1xuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIGZsYWdnZWQgYXMgaGlkZGVuXG4gICAgLy8gd2UgZG8gbmVlZCB0byBjbGVhciB0aGUgY2FjaGUgaW4gdGhpcyBjYXNlXG4gICAgaWYoICFjYW52YXNGZWF0dXJlLnZpc2libGUgKSB7XG4gICAgICBjYW52YXNGZWF0dXJlLmNsZWFyQ2FjaGUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZ2VvanNvbiA9IGNhbnZhc0ZlYXR1cmUuZ2VvanNvbi5nZW9tZXRyeTtcblxuICAgIC8vIG5vdyBsZXRzIGNoZWNrIGNhY2hlIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlcHJvamVjdCB0aGVcbiAgICAvLyB4eSBjb29yZGluYXRlc1xuICAgIC8vIGFjdHVhbGx5IHByb2plY3QgdG8geHkgaWYgbmVlZGVkXG4gICAgdmFyIHJlcHJvamVjdCA9IGNhbnZhc0ZlYXR1cmUucmVxdWlyZXNSZXByb2plY3Rpb24oem9vbSk7XG4gICAgaWYoIHJlcHJvamVjdCApIHtcbiAgICAgIHRoaXMudG9DYW52YXNYWShjYW52YXNGZWF0dXJlLCBnZW9qc29uLCB6b29tKTtcbiAgICB9ICAvLyBlbmQgcmVwcm9qZWN0XG5cbiAgICAvLyBpZiB0aGlzIHdhcyBhIHNpbXBsZSBwYW4gZXZlbnQgKGEgZGlmZiB3YXMgcHJvdmlkZWQpIGFuZCB3ZSBkaWQgbm90IHJlcHJvamVjdFxuICAgIC8vIG1vdmUgdGhlIGZlYXR1cmUgYnkgZGlmZiB4L3lcbiAgICBpZiggZGlmZiAmJiAhcmVwcm9qZWN0ICkge1xuICAgICAgaWYoIGdlb2pzb24udHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgIHZhciB4eSA9IGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKVxuICAgICAgICB4eS54ICs9IGRpZmYueDtcbiAgICAgICAgeHkueSArPSBkaWZmLnk7XG5cbiAgICAgIH0gZWxzZSBpZiggZ2VvanNvbi50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKSwgZGlmZik7XG5cbiAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICBcbiAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCksIGRpZmYpO1xuICAgICAgXG4gICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgIHZhciB4eSA9IGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKTtcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB4eS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICB0aGlzLnV0aWxzLm1vdmVMaW5lKHh5W2ldLCBkaWZmKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgIH07XG59IiwiXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gICAgIGxheWVyLnRvQ2FudmFzWFkgPSBmdW5jdGlvbihmZWF0dXJlLCBnZW9qc29uLCB6b29tKSB7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgY2FjaGUgbmFtZXNwYWNlIGFuZCBzZXQgdGhlIHpvb20gbGV2ZWxcbiAgICAgICAgaWYoICFmZWF0dXJlLmNhY2hlICkgZmVhdHVyZS5jYWNoZSA9IHt9O1xuICAgICAgICB2YXIgY2FudmFzWFk7XG5cbiAgICAgICAgaWYoIGdlb2pzb24udHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgIGNhbnZhc1hZID0gdGhpcy5fbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQoW1xuICAgICAgICAgICAgZ2VvanNvbi5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgIGdlb2pzb24uY29vcmRpbmF0ZXNbMF1cbiAgICAgICAgXSk7XG5cbiAgICAgICAgaWYoIGZlYXR1cmUuc2l6ZSApIHtcbiAgICAgICAgICAgIGNhbnZhc1hZWzBdID0gY2FudmFzWFlbMF0gLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgICAgICAgY2FudmFzWFlbMV0gPSBjYW52YXNYWVsxXSAtIGZlYXR1cmUuc2l6ZSAvIDI7XG4gICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYoIGdlb2pzb24udHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgY2FudmFzWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGdlb2pzb24uY29vcmRpbmF0ZXMsIHRoaXMuX21hcCk7XG4gICAgICAgIHRyaW1DYW52YXNYWShjYW52YXNYWSk7XG4gICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAgIFxuICAgICAgICBjYW52YXNYWSA9IHRoaXMudXRpbHMucHJvamVjdExpbmUoZ2VvanNvbi5jb29yZGluYXRlc1swXSwgdGhpcy5fbWFwKTtcbiAgICAgICAgdHJpbUNhbnZhc1hZKGNhbnZhc1hZKTtcbiAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24udHlwZSA9PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgICAgIGNhbnZhc1hZID0gW107XG4gICAgICAgIFxuICAgICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBnZW9qc29uLmNvb3JkaW5hdGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgICAgIHZhciB4eSA9IHRoaXMudXRpbHMucHJvamVjdExpbmUoZ2VvanNvbi5jb29yZGluYXRlc1tpXVswXSwgdGhpcy5fbWFwKTtcbiAgICAgICAgICAgICAgICB0cmltQ2FudmFzWFkoeHkpO1xuICAgICAgICAgICAgICAgIGNhbnZhc1hZLnB1c2goeHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBmZWF0dXJlLnNldENhbnZhc1hZKGNhbnZhc1hZLCB6b29tKTtcbiAgICB9O1xufVxuXG4vLyBnaXZlbiBhbiBhcnJheSBvZiBnZW8geHkgY29vcmRpbmF0ZXMsIG1ha2Ugc3VyZSBlYWNoIHBvaW50IGlzIGF0IGxlYXN0IG1vcmUgdGhhbiAxcHggYXBhcnRcbmZ1bmN0aW9uIHRyaW1DYW52YXNYWSh4eSkge1xuICAgIGlmKCB4eS5sZW5ndGggPT09IDAgKSByZXR1cm47XG4gICAgdmFyIGxhc3QgPSB4eVt4eS5sZW5ndGgtMV0sIGksIHBvaW50O1xuXG4gICAgdmFyIGMgPSAwO1xuICAgIGZvciggaSA9IHh5Lmxlbmd0aC0yOyBpID49IDA7IGktLSApIHtcbiAgICAgICAgcG9pbnQgPSB4eVtpXTtcbiAgICAgICAgaWYoIE1hdGguYWJzKGxhc3QueCAtIHBvaW50LngpID09PSAwICYmIE1hdGguYWJzKGxhc3QueSAtIHBvaW50LnkpID09PSAwICkge1xuICAgICAgICAgICAgeHkuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYysrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGFzdCA9IHBvaW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYoIHh5Lmxlbmd0aCA8PSAxICkge1xuICAgICAgICB4eS5wdXNoKGxhc3QpO1xuICAgICAgICBjLS07XG4gICAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgbW92ZUxpbmUgOiBmdW5jdGlvbihjb29yZHMsIGRpZmYpIHtcbiAgICB2YXIgaSwgbGVuID0gY29vcmRzLmxlbmd0aDtcbiAgICBmb3IoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBjb29yZHNbaV0ueCArPSBkaWZmLng7XG4gICAgICBjb29yZHNbaV0ueSArPSBkaWZmLnk7XG4gICAgfVxuICB9LFxuXG4gIHByb2plY3RMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBtYXApIHtcbiAgICB2YXIgeHlMaW5lID0gW107XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHh5TGluZS5wdXNoKG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICBjb29yZHNbaV1bMV0sIGNvb3Jkc1tpXVswXVxuICAgICAgXSkpO1xuICAgIH1cblxuICAgIHJldHVybiB4eUxpbmU7XG4gIH0sXG5cbiAgY2FsY0JvdW5kcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4bWluID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB4bWF4ID0gY29vcmRzWzBdWzFdO1xuICAgIHZhciB5bWluID0gY29vcmRzWzBdWzBdO1xuICAgIHZhciB5bWF4ID0gY29vcmRzWzBdWzBdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDE7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBpZiggeG1pbiA+IGNvb3Jkc1tpXVsxXSApIHhtaW4gPSBjb29yZHNbaV1bMV07XG4gICAgICBpZiggeG1heCA8IGNvb3Jkc1tpXVsxXSApIHhtYXggPSBjb29yZHNbaV1bMV07XG5cbiAgICAgIGlmKCB5bWluID4gY29vcmRzW2ldWzBdICkgeW1pbiA9IGNvb3Jkc1tpXVswXTtcbiAgICAgIGlmKCB5bWF4IDwgY29vcmRzW2ldWzBdICkgeW1heCA9IGNvb3Jkc1tpXVswXTtcbiAgICB9XG5cbiAgICB2YXIgc291dGhXZXN0ID0gTC5sYXRMbmcoeG1pbi0uMDEsIHltaW4tLjAxKTtcbiAgICB2YXIgbm9ydGhFYXN0ID0gTC5sYXRMbmcoeG1heCsuMDEsIHltYXgrLjAxKTtcblxuICAgIHJldHVybiBMLmxhdExuZ0JvdW5kcyhzb3V0aFdlc3QsIG5vcnRoRWFzdCk7XG4gIH0sXG5cbiAgZ2VvbWV0cnlXaXRoaW5SYWRpdXMgOiBmdW5jdGlvbihnZW9tZXRyeSwgeHlQb2ludHMsIGNlbnRlciwgeHlQb2ludCwgcmFkaXVzKSB7XG4gICAgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgcmV0dXJuIHRoaXMucG9pbnREaXN0YW5jZShnZW9tZXRyeSwgY2VudGVyKSA8PSByYWRpdXM7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcblxuICAgICAgZm9yKCB2YXIgaSA9IDE7IGkgPCB4eVBvaW50cy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgaWYoIHRoaXMubGluZUludGVyc2VjdHNDaXJjbGUoeHlQb2ludHNbaS0xXSwgeHlQb2ludHNbaV0sIHh5UG9pbnQsIDMpICkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50SW5Qb2x5Z29uKGNlbnRlciwgZ2VvbWV0cnkpO1xuICAgIH1cbiAgfSxcblxuICAvLyBodHRwOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMjc1NTI5L2NoZWNrLWlmLWxpbmUtaW50ZXJzZWN0cy13aXRoLWNpcmNsZXMtcGVyaW1ldGVyXG4gIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Rpc3RhbmNlX2Zyb21fYV9wb2ludF90b19hX2xpbmVcbiAgLy8gW2xuZyB4LCBsYXQsIHldXG4gIGxpbmVJbnRlcnNlY3RzQ2lyY2xlIDogZnVuY3Rpb24obGluZVAxLCBsaW5lUDIsIHBvaW50LCByYWRpdXMpIHtcbiAgICB2YXIgZGlzdGFuY2UgPVxuICAgICAgTWF0aC5hYnMoXG4gICAgICAgICgobGluZVAyLnkgLSBsaW5lUDEueSkqcG9pbnQueCkgLSAoKGxpbmVQMi54IC0gbGluZVAxLngpKnBvaW50LnkpICsgKGxpbmVQMi54KmxpbmVQMS55KSAtIChsaW5lUDIueSpsaW5lUDEueClcbiAgICAgICkgL1xuICAgICAgTWF0aC5zcXJ0KFxuICAgICAgICBNYXRoLnBvdyhsaW5lUDIueSAtIGxpbmVQMS55LCAyKSArIE1hdGgucG93KGxpbmVQMi54IC0gbGluZVAxLngsIDIpXG4gICAgICApO1xuICAgIHJldHVybiBkaXN0YW5jZSA8PSByYWRpdXM7XG4gIH0sXG5cbiAgLy8gaHR0cDovL3dpa2kub3BlbnN0cmVldG1hcC5vcmcvd2lraS9ab29tX2xldmVsc1xuICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI3NTQ1MDk4L2xlYWZsZXQtY2FsY3VsYXRpbmctbWV0ZXJzLXBlci1waXhlbC1hdC16b29tLWxldmVsXG4gIG1ldGVyc1BlclB4IDogZnVuY3Rpb24obGwsIG1hcCkge1xuICAgIHZhciBwb2ludEMgPSBtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChsbCk7IC8vIGNvbnZlcnQgdG8gY29udGFpbmVycG9pbnQgKHBpeGVscylcbiAgICB2YXIgcG9pbnRYID0gW3BvaW50Qy54ICsgMSwgcG9pbnRDLnldOyAvLyBhZGQgb25lIHBpeGVsIHRvIHhcblxuICAgIC8vIGNvbnZlcnQgY29udGFpbmVycG9pbnRzIHRvIGxhdGxuZydzXG4gICAgdmFyIGxhdExuZ0MgPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludEMpO1xuICAgIHZhciBsYXRMbmdYID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRYKTtcblxuICAgIHZhciBkaXN0YW5jZVggPSBsYXRMbmdDLmRpc3RhbmNlVG8obGF0TG5nWCk7IC8vIGNhbGN1bGF0ZSBkaXN0YW5jZSBiZXR3ZWVuIGMgYW5kIHggKGxhdGl0dWRlKVxuICAgIHJldHVybiBkaXN0YW5jZVg7XG4gIH0sXG5cbiAgZGVncmVlc1BlclB4IDogZnVuY3Rpb24obGwsIG1hcCkge1xuICAgIHZhciBwb2ludEMgPSBtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChsbCk7IC8vIGNvbnZlcnQgdG8gY29udGFpbmVycG9pbnQgKHBpeGVscylcbiAgICB2YXIgcG9pbnRYID0gW3BvaW50Qy54ICsgMSwgcG9pbnRDLnldOyAvLyBhZGQgb25lIHBpeGVsIHRvIHhcblxuICAgIC8vIGNvbnZlcnQgY29udGFpbmVycG9pbnRzIHRvIGxhdGxuZydzXG4gICAgdmFyIGxhdExuZ0MgPSBtYXAuY29udGFpbmVyUG9pbnRUb0xhdExuZyhwb2ludEMpO1xuICAgIHZhciBsYXRMbmdYID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRYKTtcblxuICAgIHJldHVybiBNYXRoLmFicyhsYXRMbmdDLmxuZyAtIGxhdExuZ1gubG5nKTsgLy8gY2FsY3VsYXRlIGRpc3RhbmNlIGJldHdlZW4gYyBhbmQgeCAobGF0aXR1ZGUpXG4gIH0sXG5cbiAgLy8gZnJvbSBodHRwOi8vd3d3Lm1vdmFibGUtdHlwZS5jby51ay9zY3JpcHRzL2xhdGxvbmcuaHRtbFxuICBwb2ludERpc3RhbmNlIDogZnVuY3Rpb24gKHB0MSwgcHQyKSB7XG4gICAgdmFyIGxvbjEgPSBwdDEuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQxID0gcHQxLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgbG9uMiA9IHB0Mi5jb29yZGluYXRlc1swXSxcbiAgICAgIGxhdDIgPSBwdDIuY29vcmRpbmF0ZXNbMV0sXG4gICAgICBkTGF0ID0gdGhpcy5udW1iZXJUb1JhZGl1cyhsYXQyIC0gbGF0MSksXG4gICAgICBkTG9uID0gdGhpcy5udW1iZXJUb1JhZGl1cyhsb24yIC0gbG9uMSksXG4gICAgICBhID0gTWF0aC5wb3coTWF0aC5zaW4oZExhdCAvIDIpLCAyKSArIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MSkpXG4gICAgICAgICogTWF0aC5jb3ModGhpcy5udW1iZXJUb1JhZGl1cyhsYXQyKSkgKiBNYXRoLnBvdyhNYXRoLnNpbihkTG9uIC8gMiksIDIpLFxuICAgICAgYyA9IDIgKiBNYXRoLmF0YW4yKE1hdGguc3FydChhKSwgTWF0aC5zcXJ0KDEgLSBhKSk7XG4gICAgcmV0dXJuICg2MzcxICogYykgKiAxMDAwOyAvLyByZXR1cm5zIG1ldGVyc1xuICB9LFxuXG4gIHBvaW50SW5Qb2x5Z29uIDogZnVuY3Rpb24gKHAsIHBvbHkpIHtcbiAgICB2YXIgY29vcmRzID0gKHBvbHkudHlwZSA9PSBcIlBvbHlnb25cIikgPyBbIHBvbHkuY29vcmRpbmF0ZXMgXSA6IHBvbHkuY29vcmRpbmF0ZXNcblxuICAgIHZhciBpbnNpZGVCb3ggPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wb2ludEluQm91bmRpbmdCb3gocCwgdGhpcy5ib3VuZGluZ0JveEFyb3VuZFBvbHlDb29yZHMoY29vcmRzW2ldKSkpIGluc2lkZUJveCA9IHRydWVcbiAgICB9XG4gICAgaWYgKCFpbnNpZGVCb3gpIHJldHVybiBmYWxzZVxuXG4gICAgdmFyIGluc2lkZVBvbHkgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodGhpcy5wbnBvbHkocC5jb29yZGluYXRlc1sxXSwgcC5jb29yZGluYXRlc1swXSwgY29vcmRzW2ldKSkgaW5zaWRlUG9seSA9IHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zaWRlUG9seVxuICB9LFxuXG4gIHBvaW50SW5Cb3VuZGluZ0JveCA6IGZ1bmN0aW9uIChwb2ludCwgYm91bmRzKSB7XG4gICAgcmV0dXJuICEocG9pbnQuY29vcmRpbmF0ZXNbMV0gPCBib3VuZHNbMF1bMF0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMV0gPiBib3VuZHNbMV1bMF0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMF0gPCBib3VuZHNbMF1bMV0gfHwgcG9pbnQuY29vcmRpbmF0ZXNbMF0gPiBib3VuZHNbMV1bMV0pXG4gIH0sXG5cbiAgYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzIDogZnVuY3Rpb24oY29vcmRzKSB7XG4gICAgdmFyIHhBbGwgPSBbXSwgeUFsbCA9IFtdXG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkc1swXS5sZW5ndGg7IGkrKykge1xuICAgICAgeEFsbC5wdXNoKGNvb3Jkc1swXVtpXVsxXSlcbiAgICAgIHlBbGwucHVzaChjb29yZHNbMF1baV1bMF0pXG4gICAgfVxuXG4gICAgeEFsbCA9IHhBbGwuc29ydChmdW5jdGlvbiAoYSxiKSB7IHJldHVybiBhIC0gYiB9KVxuICAgIHlBbGwgPSB5QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcblxuICAgIHJldHVybiBbIFt4QWxsWzBdLCB5QWxsWzBdXSwgW3hBbGxbeEFsbC5sZW5ndGggLSAxXSwgeUFsbFt5QWxsLmxlbmd0aCAtIDFdXSBdXG4gIH0sXG5cbiAgLy8gUG9pbnQgaW4gUG9seWdvblxuICAvLyBodHRwOi8vd3d3LmVjc2UucnBpLmVkdS9Ib21lcGFnZXMvd3JmL1Jlc2VhcmNoL1Nob3J0X05vdGVzL3BucG9seS5odG1sI0xpc3RpbmcgdGhlIFZlcnRpY2VzXG4gIHBucG9seSA6IGZ1bmN0aW9uKHgseSxjb29yZHMpIHtcbiAgICB2YXIgdmVydCA9IFsgWzAsMF0gXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29vcmRzW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZlcnQucHVzaChjb29yZHNbaV1bal0pXG4gICAgICB9XG4gICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldWzBdKVxuICAgICAgdmVydC5wdXNoKFswLDBdKVxuICAgIH1cblxuICAgIHZhciBpbnNpZGUgPSBmYWxzZVxuICAgIGZvciAodmFyIGkgPSAwLCBqID0gdmVydC5sZW5ndGggLSAxOyBpIDwgdmVydC5sZW5ndGg7IGogPSBpKyspIHtcbiAgICAgIGlmICgoKHZlcnRbaV1bMF0gPiB5KSAhPSAodmVydFtqXVswXSA+IHkpKSAmJiAoeCA8ICh2ZXJ0W2pdWzFdIC0gdmVydFtpXVsxXSkgKiAoeSAtIHZlcnRbaV1bMF0pIC8gKHZlcnRbal1bMF0gLSB2ZXJ0W2ldWzBdKSArIHZlcnRbaV1bMV0pKSBpbnNpZGUgPSAhaW5zaWRlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVxuICB9LFxuXG4gIG51bWJlclRvUmFkaXVzIDogZnVuY3Rpb24gKG51bWJlcikge1xuICAgIHJldHVybiBudW1iZXIgKiBNYXRoLlBJIC8gMTgwO1xuICB9XG59O1xuIl19
