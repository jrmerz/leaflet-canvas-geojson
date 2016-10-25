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

    if (this.id === null || this.id === undefined) {
        this.id = geojson.id;
    }

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
        if (this.id === undefined) return;
    } else {
        this.geojson = {
            type: 'Feature',
            geometry: geojson,
            properties: {
                id: this.id
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
                id: this.id || this.geojson.properties.id
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

            if (!this.geojson.features[i].hasOwnProperty('id') || this.geojson.features[i].id === null) {
                this.geojson.features[i].id = i;
            }

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
require('./lib/controls')(layer);

L.CanvasFeatureFactory = require('./classes/factory');
L.CanvasFeature = CanvasFeature;
L.CanvasFeatureCollection = CanvasFeatures;
L.CanvasGeojsonLayer = L.Class.extend(layer);

},{"./classes/CanvasFeature":5,"./classes/CanvasFeatures":6,"./classes/factory":7,"./defaultRenderer":8,"./lib/addFeature":10,"./lib/controls":11,"./lib/init":12,"./lib/redraw":14,"./lib/toCanvasXY":15,"./lib/utils":16}],10:[function(require,module,exports){
'use strict';

var CanvasFeature = require('../classes/CanvasFeature');
var CanvasFeatures = require('../classes/CanvasFeatures');

module.exports = function (layer) {
  layer.addCanvasFeatures = function (features) {
    for (var i = 0; i < features.canvasFeatures.length; i++) {

      if (features.canvasFeatures[i].id === undefined || features.canvasFeatures[i].id === null) {
        features.canvasFeatures[i].id = i;
      }

      this.addCanvasFeature(features.canvasFeatures[i], false, null, false);
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

module.exports = function (layer) {
    layer.removeAll = function () {
        this.features = [];
        this.featureIndex = {};
        this.intersectList = [];
        this.rebuildIndex([]);
        this.reset();
    };

    layer.hide = function () {
        this._canvas.style.display = 'none';
        this.showing = false;
    };

    layer.show = function () {
        this._canvas.style.display = 'block';
        this.showing = true;
        if (this._map) this.redraw();
    };

    layer.setZIndex = function (index) {
        this.zIndex = index;
        if (this._container) {
            this._container.style.zIndex = index;
        }
    };
};

},{}],12:[function(require,module,exports){
'use strict';

var intersectUtils = require('./intersects');
var RTree = require('rtree');
var count = 0;

module.exports = function (layer) {

    layer.initialize = function (options) {
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

        this.show();
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
            'move': this.render,
            'mousemove': this.intersects,
            'click': this.intersects
        }, this);

        this.reset();
        this.clearCanvas();

        if (this.zIndex !== undefined) {
            this.setZIndex(this.zIndex);
        }
        //re-display layer if it's been removed and then re-added
        if (this._hasBeenRemoved === true) {
            this.render();
            this._hasBeenRemoved = false;
        }
    };

    layer.onRemove = function (map) {
        this._container.parentNode.removeChild(this._container);
        map.off({
            'viewreset': this.onResize,
            'resize': this.onResize,
            //   'movestart' : moveStart,
            'moveend': moveEnd,
            'move': this.render,
            'zoomstart': startZoom,
            'zoomend': endZoom,
            'mousemove': this.intersects,
            'click': this.intersects
        }, this);

        this._hasBeenRemoved = true;
    };

    layer.resizeTimer = -1;
    layer.onResize = function () {
        if (this.resizeTimer !== -1) clearTimeout(this.resizeTimer);
        var ref = this;

        this.resizeTimer = setTimeout(function () {
            ref.resizeTimer = -1;
            ref.reset();
            ref.clearCache();
            ref.render();
        }, 100);
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

},{"./intersects":13,"rtree":2}],13:[function(require,module,exports){
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

    if (!clFeature) continue;
    if (!clFeature.visible) continue;

    clFeatures.push(clFeature);
  }

  // now make sure this actually overlap if precision is given
  if (precision) {
    for (var i = clFeatures.length - 1; i >= 0; i--) {
      f = clFeatures[i];
      if (f && !this.utils.geometryWithinRadius(f._rtreeGeojson.geometry, f.getCanvasXY(), center, containerPoint, precision)) {
        clFeatures.splice(i, 1);
      }
    }
  }

  return clFeatures;
}

function onIntersectsListCreated(e, intersects) {
  if (e.type == 'click' && this.onClick) {
    var latlng = e.latlng;
    this.onClick(intersects, latlng);
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

},{"rtree":2}],14:[function(require,module,exports){
'use strict';

var running = false;
var reschedule = null;

module.exports = function (layer) {
  layer.render = function (e) {
    if (!this.showing) return;

    if (!this.allowPanRendering && this.moving) {
      return;
    }

    if (e && e.type == 'move' && !this.animating) {
      return;
    }

    var t, diff;
    if (this.debug) {
      t = new Date().getTime();
    }

    var diff = null;
    map = this._map, center = map.getCenter();

    if (e && e.type == 'moveend' || e && e.type == 'move' && this.animating) {
      if (this.lastCenterLL === null) {
        this.lastCenterLL = map._initialCenter;
      }
      var pt = this._map.latLngToContainerPoint(center);

      if (this.lastCenterLL) {
        var lastXy = map.latLngToContainerPoint(this.lastCenterLL);
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

    // objects should keep track of last bbox and zoom of map
    // if this hasn't changed the ll -> container pt is not needed
    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    var features = this.intersectsBbox([[bounds.getWest(), bounds.getSouth()], [bounds.getEast(), bounds.getNorth()]], null, null, null);

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

},{}],15:[function(require,module,exports){
'use strict';

module.exports = function (layer) {
    layer.toCanvasXY = function (feature, geojson, zoom) {
        // make sure we have a cache namespace and set the zoom level
        if (!feature.cache) feature.cache = {};
        var canvasXY;

        if (geojson.type == 'Point') {

            canvasXY = this._map.latLngToContainerPoint([geojson.coordinates[1], geojson.coordinates[0]]);

            // if( feature.size ) {
            //     canvasXY.x = canvasXY.x - feature.size / 2;
            //     canvasXY.y = canvasXY.y - feature.size / 2;
            // }
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

},{}],16:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvZ2VvanNvbi5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRyZWUvbGliL3JlY3RhbmdsZS5qcyIsIm5vZGVfbW9kdWxlcy9ydHJlZS9saWIvcnRyZWUuanMiLCJzcmMvY2xhc3Nlcy9DYW52YXNGZWF0dXJlLmpzIiwic3JjL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMuanMiLCJzcmMvY2xhc3Nlcy9mYWN0b3J5LmpzIiwic3JjL2RlZmF1bHRSZW5kZXJlci9pbmRleC5qcyIsInNyYy9sYXllci5qcyIsInNyYy9saWIvYWRkRmVhdHVyZS5qcyIsInNyYy9saWIvY29udHJvbHMuanMiLCJzcmMvbGliL2luaXQuanMiLCJzcmMvbGliL2ludGVyc2VjdHMuanMiLCJzcmMvbGliL3JlZHJhdy5qcyIsInNyYy9saWIvdG9DYW52YXNYWS5qcyIsInNyYy9saWIvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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LEVBQWdCLElBQUksT0FBTyxDQUFQLEVBQVUsTUFBOUIsRUFBc0MsR0FBdEMsRUFBMkM7QUFDekMsYUFBSyxJQUFMLENBQVUsT0FBTyxDQUFQLEVBQVUsQ0FBVixDQUFWO0FBQ0Q7QUFDRCxXQUFLLElBQUwsQ0FBVSxPQUFPLENBQVAsRUFBVSxDQUFWLENBQVY7QUFDQSxXQUFLLElBQUwsQ0FBVSxDQUFDLENBQUQsRUFBRyxDQUFILENBQVY7QUFDRDs7QUFFRCxRQUFJLFNBQVMsS0FBYjtBQUNBLFNBQUssSUFBSSxJQUFJLENBQVIsRUFBVyxJQUFJLEtBQUssTUFBTCxHQUFjLENBQWxDLEVBQXFDLElBQUksS0FBSyxNQUE5QyxFQUFzRCxJQUFJLEdBQTFELEVBQStEO0FBQzdELFVBQU0sS0FBSyxDQUFMLEVBQVEsQ0FBUixJQUFhLENBQWQsSUFBcUIsS0FBSyxDQUFMLEVBQVEsQ0FBUixJQUFhLENBQW5DLElBQTJDLElBQUksQ0FBQyxLQUFLLENBQUwsRUFBUSxDQUFSLElBQWEsS0FBSyxDQUFMLEVBQVEsQ0FBUixDQUFkLEtBQTZCLElBQUksS0FBSyxDQUFMLEVBQVEsQ0FBUixDQUFqQyxLQUFnRCxLQUFLLENBQUwsRUFBUSxDQUFSLElBQWEsS0FBSyxDQUFMLEVBQVEsQ0FBUixDQUE3RCxJQUEyRSxLQUFLLENBQUwsRUFBUSxDQUFSLENBQTlILEVBQTJJLFNBQVMsQ0FBQyxNQUFWO0FBQzVJOztBQUVELFdBQU8sTUFBUDtBQUNELEdBcktjOztBQXVLZixrQkFBaUIsd0JBQVUsTUFBVixFQUFrQjtBQUNqQyxXQUFPLFNBQVMsS0FBSyxFQUFkLEdBQW1CLEdBQTFCO0FBQ0Q7QUF6S2MsQ0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHJlY3RhbmdsZSA9IHJlcXVpcmUoJy4vcmVjdGFuZ2xlJyk7XG52YXIgYmJveCA9IGZ1bmN0aW9uIChhciwgb2JqKSB7XG4gIGlmIChvYmogJiYgb2JqLmJib3gpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGVhZjogb2JqLFxuICAgICAgeDogb2JqLmJib3hbMF0sXG4gICAgICB5OiBvYmouYmJveFsxXSxcbiAgICAgIHc6IG9iai5iYm94WzJdIC0gb2JqLmJib3hbMF0sXG4gICAgICBoOiBvYmouYmJveFszXSAtIG9iai5iYm94WzFdXG4gICAgfTtcbiAgfVxuICB2YXIgbGVuID0gYXIubGVuZ3RoO1xuICB2YXIgaSA9IDA7XG4gIHZhciBhID0gbmV3IEFycmF5KGxlbik7XG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgYVtpXSA9IFthcltpXVswXSwgYXJbaV1bMV1dO1xuICAgIGkrKztcbiAgfVxuICB2YXIgZmlyc3QgPSBhWzBdO1xuICBsZW4gPSBhLmxlbmd0aDtcbiAgaSA9IDE7XG4gIHZhciB0ZW1wID0ge1xuICAgIG1pbjogW10uY29uY2F0KGZpcnN0KSxcbiAgICBtYXg6IFtdLmNvbmNhdChmaXJzdClcbiAgfTtcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICBpZiAoYVtpXVswXSA8IHRlbXAubWluWzBdKSB7XG4gICAgICB0ZW1wLm1pblswXSA9IGFbaV1bMF07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFbaV1bMF0gPiB0ZW1wLm1heFswXSkge1xuICAgICAgdGVtcC5tYXhbMF0gPSBhW2ldWzBdO1xuICAgIH1cbiAgICBpZiAoYVtpXVsxXSA8IHRlbXAubWluWzFdKSB7XG4gICAgICB0ZW1wLm1pblsxXSA9IGFbaV1bMV07XG4gICAgfVxuICAgIGVsc2UgaWYgKGFbaV1bMV0gPiB0ZW1wLm1heFsxXSkge1xuICAgICAgdGVtcC5tYXhbMV0gPSBhW2ldWzFdO1xuICAgIH1cbiAgICBpKys7XG4gIH1cbiAgdmFyIG91dCA9IHtcbiAgICB4OiB0ZW1wLm1pblswXSxcbiAgICB5OiB0ZW1wLm1pblsxXSxcbiAgICB3OiAodGVtcC5tYXhbMF0gLSB0ZW1wLm1pblswXSksXG4gICAgaDogKHRlbXAubWF4WzFdIC0gdGVtcC5taW5bMV0pXG4gIH07XG4gIGlmIChvYmopIHtcbiAgICBvdXQubGVhZiA9IG9iajtcbiAgfVxuICByZXR1cm4gb3V0O1xufTtcbnZhciBnZW9KU09OID0ge307XG5nZW9KU09OLnBvaW50ID0gZnVuY3Rpb24gKG9iaiwgc2VsZikge1xuICByZXR1cm4gKHNlbGYuaW5zZXJ0U3VidHJlZSh7XG4gICAgeDogb2JqLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdLFxuICAgIHk6IG9iai5nZW9tZXRyeS5jb29yZGluYXRlc1sxXSxcbiAgICB3OiAwLFxuICAgIGg6IDAsXG4gICAgbGVhZjogb2JqXG4gIH0sIHNlbGYucm9vdCkpO1xufTtcbmdlb0pTT04ubXVsdGlQb2ludExpbmVTdHJpbmcgPSBmdW5jdGlvbiAob2JqLCBzZWxmKSB7XG4gIHJldHVybiAoc2VsZi5pbnNlcnRTdWJ0cmVlKGJib3gob2JqLmdlb21ldHJ5LmNvb3JkaW5hdGVzLCBvYmopLCBzZWxmLnJvb3QpKTtcbn07XG5nZW9KU09OLm11bHRpTGluZVN0cmluZ1BvbHlnb24gPSBmdW5jdGlvbiAob2JqLCBzZWxmKSB7XG4gIHJldHVybiAoc2VsZi5pbnNlcnRTdWJ0cmVlKGJib3goQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgb2JqLmdlb21ldHJ5LmNvb3JkaW5hdGVzKSwgb2JqKSwgc2VsZi5yb290KSk7XG59O1xuZ2VvSlNPTi5tdWx0aVBvbHlnb24gPSBmdW5jdGlvbiAob2JqLCBzZWxmKSB7XG4gIHJldHVybiAoc2VsZi5pbnNlcnRTdWJ0cmVlKGJib3goQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgb2JqLmdlb21ldHJ5LmNvb3JkaW5hdGVzKSksIG9iaiksIHNlbGYucm9vdCkpO1xufTtcbmdlb0pTT04ubWFrZVJlYyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHJlY3RhbmdsZShvYmoueCwgb2JqLnksIG9iai53LCBvYmouaCk7XG59O1xuZ2VvSlNPTi5nZW9tZXRyeUNvbGxlY3Rpb24gPSBmdW5jdGlvbiAob2JqLCBzZWxmKSB7XG4gIGlmIChvYmouYmJveCkge1xuICAgIHJldHVybiAoc2VsZi5pbnNlcnRTdWJ0cmVlKHtcbiAgICAgIGxlYWY6IG9iaixcbiAgICAgIHg6IG9iai5iYm94WzBdLFxuICAgICAgeTogb2JqLmJib3hbMV0sXG4gICAgICB3OiBvYmouYmJveFsyXSAtIG9iai5iYm94WzBdLFxuICAgICAgaDogb2JqLmJib3hbM10gLSBvYmouYmJveFsxXVxuICAgIH0sIHNlbGYucm9vdCkpO1xuICB9XG4gIHZhciBnZW9zID0gb2JqLmdlb21ldHJ5Lmdlb21ldHJpZXM7XG4gIHZhciBpID0gMDtcbiAgdmFyIGxlbiA9IGdlb3MubGVuZ3RoO1xuICB2YXIgdGVtcCA9IFtdO1xuICB2YXIgZztcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICBnID0gZ2Vvc1tpXTtcbiAgICBzd2l0Y2ggKGcudHlwZSkge1xuICAgIGNhc2UgJ1BvaW50JzpcbiAgICAgIHRlbXAucHVzaChnZW9KU09OLm1ha2VSZWMoe1xuICAgICAgICB4OiBnLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgICB5OiBnLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgICB3OiAwLFxuICAgICAgICBoOiAwXG4gICAgICB9KSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNdWx0aVBvaW50JzpcbiAgICAgIHRlbXAucHVzaChnZW9KU09OLm1ha2VSZWMoYmJveChnLmNvb3JkaW5hdGVzKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTGluZVN0cmluZyc6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKGJib3goZy5jb29yZGluYXRlcykpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ011bHRpTGluZVN0cmluZyc6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKGJib3goQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgZy5jb29yZGluYXRlcykpKSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdQb2x5Z29uJzpcbiAgICAgIHRlbXAucHVzaChnZW9KU09OLm1ha2VSZWMoYmJveChBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBnLmNvb3JkaW5hdGVzKSkpKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ011bHRpUG9seWdvbic6XG4gICAgICB0ZW1wLnB1c2goZ2VvSlNPTi5tYWtlUmVjKGJib3goQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgZy5jb29yZGluYXRlcykpKSkpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnR2VvbWV0cnlDb2xsZWN0aW9uJzpcbiAgICAgIGdlb3MgPSBnZW9zLmNvbmNhdChnLmdlb21ldHJpZXMpO1xuICAgICAgbGVuID0gZ2Vvcy5sZW5ndGg7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgaSsrO1xuICB9XG4gIHZhciBmaXJzdCA9IHRlbXBbMF07XG4gIGkgPSAxO1xuICBsZW4gPSB0ZW1wLmxlbmd0aDtcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICBmaXJzdC5leHBhbmQodGVtcFtpXSk7XG4gICAgaSsrO1xuICB9XG4gIHJldHVybiBzZWxmLmluc2VydFN1YnRyZWUoe1xuICAgIGxlYWY6IG9iaixcbiAgICB4OiBmaXJzdC54KCksXG4gICAgeTogZmlyc3QueSgpLFxuICAgIGg6IGZpcnN0LmgoKSxcbiAgICB3OiBmaXJzdC53KClcbiAgfSwgc2VsZi5yb290KTtcbn07XG5leHBvcnRzLmdlb0pTT04gPSBmdW5jdGlvbiAocHJlbGltKSB7XG4gIHZhciB0aGF0ID0gdGhpcztcbiAgdmFyIGZlYXR1cmVzLCBmZWF0dXJlO1xuICBpZiAoQXJyYXkuaXNBcnJheShwcmVsaW0pKSB7XG4gICAgZmVhdHVyZXMgPSBwcmVsaW0uc2xpY2UoKTtcbiAgfVxuICBlbHNlIGlmIChwcmVsaW0uZmVhdHVyZXMgJiYgQXJyYXkuaXNBcnJheShwcmVsaW0uZmVhdHVyZXMpKSB7XG4gICAgZmVhdHVyZXMgPSBwcmVsaW0uZmVhdHVyZXMuc2xpY2UoKTtcbiAgfVxuICBlbHNlIGlmIChwcmVsaW0gaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICBmZWF0dXJlcyA9IFtwcmVsaW1dO1xuICB9IGVsc2Uge1xuICAgIHRocm93ICgndGhpcyBpc25cXCd0IHdoYXQgd2VcXCdyZSBsb29raW5nIGZvcicpO1xuICB9XG4gIHZhciBsZW4gPSBmZWF0dXJlcy5sZW5ndGg7XG4gIHZhciBpID0gMDtcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICBmZWF0dXJlID0gZmVhdHVyZXNbaV07XG4gICAgaWYgKGZlYXR1cmUudHlwZSA9PT0gJ0ZlYXR1cmUnKSB7XG4gICAgICBzd2l0Y2ggKGZlYXR1cmUuZ2VvbWV0cnkudHlwZSkge1xuICAgICAgY2FzZSAnUG9pbnQnOlxuICAgICAgICBnZW9KU09OLnBvaW50KGZlYXR1cmUsIHRoYXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ011bHRpUG9pbnQnOlxuICAgICAgICBnZW9KU09OLm11bHRpUG9pbnRMaW5lU3RyaW5nKGZlYXR1cmUsIHRoYXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0xpbmVTdHJpbmcnOlxuICAgICAgICBnZW9KU09OLm11bHRpUG9pbnRMaW5lU3RyaW5nKGZlYXR1cmUsIHRoYXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ011bHRpTGluZVN0cmluZyc6XG4gICAgICAgIGdlb0pTT04ubXVsdGlMaW5lU3RyaW5nUG9seWdvbihmZWF0dXJlLCB0aGF0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdQb2x5Z29uJzpcbiAgICAgICAgZ2VvSlNPTi5tdWx0aUxpbmVTdHJpbmdQb2x5Z29uKGZlYXR1cmUsIHRoYXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ011bHRpUG9seWdvbic6XG4gICAgICAgIGdlb0pTT04ubXVsdGlQb2x5Z29uKGZlYXR1cmUsIHRoYXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ0dlb21ldHJ5Q29sbGVjdGlvbic6XG4gICAgICAgIGdlb0pTT04uZ2VvbWV0cnlDb2xsZWN0aW9uKGZlYXR1cmUsIHRoYXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaSsrO1xuICB9XG59O1xuZXhwb3J0cy5iYm94ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgeDEsIHkxLCB4MiwgeTI7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICBjYXNlIDE6XG4gICAgeDEgPSBhcmd1bWVudHNbMF1bMF1bMF07XG4gICAgeTEgPSBhcmd1bWVudHNbMF1bMF1bMV07XG4gICAgeDIgPSBhcmd1bWVudHNbMF1bMV1bMF07XG4gICAgeTIgPSBhcmd1bWVudHNbMF1bMV1bMV07XG4gICAgYnJlYWs7XG4gIGNhc2UgMjpcbiAgICB4MSA9IGFyZ3VtZW50c1swXVswXTtcbiAgICB5MSA9IGFyZ3VtZW50c1swXVsxXTtcbiAgICB4MiA9IGFyZ3VtZW50c1sxXVswXTtcbiAgICB5MiA9IGFyZ3VtZW50c1sxXVsxXTtcbiAgICBicmVhaztcbiAgY2FzZSA0OlxuICAgIHgxID0gYXJndW1lbnRzWzBdO1xuICAgIHkxID0gYXJndW1lbnRzWzFdO1xuICAgIHgyID0gYXJndW1lbnRzWzJdO1xuICAgIHkyID0gYXJndW1lbnRzWzNdO1xuICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuc2VhcmNoKHtcbiAgICB4OiB4MSxcbiAgICB5OiB5MSxcbiAgICB3OiB4MiAtIHgxLFxuICAgIGg6IHkyIC0geTFcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIFJUcmVlID0gcmVxdWlyZSgnLi9ydHJlZScpO1xudmFyIGdlb2pzb24gPSByZXF1aXJlKCcuL2dlb2pzb24nKTtcblJUcmVlLnByb3RvdHlwZS5iYm94ID0gZ2VvanNvbi5iYm94O1xuUlRyZWUucHJvdG90eXBlLmdlb0pTT04gPSBnZW9qc29uLmdlb0pTT047XG5SVHJlZS5SZWN0YW5nbGUgPSByZXF1aXJlKCcuL3JlY3RhbmdsZScpO1xubW9kdWxlLmV4cG9ydHMgPSBSVHJlZTsiLCIndXNlIHN0cmljdCc7XG5mdW5jdGlvbiBSZWN0YW5nbGUoeCwgeSwgdywgaCkgeyAvLyBuZXcgUmVjdGFuZ2xlKGJvdW5kcykgb3IgbmV3IFJlY3RhbmdsZSh4LCB5LCB3LCBoKVxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmVjdGFuZ2xlKSkge1xuICAgIHJldHVybiBuZXcgUmVjdGFuZ2xlKHgsIHksIHcsIGgpO1xuICB9XG4gIHZhciB4MiwgeTIsIHA7XG5cbiAgaWYgKHgueCkge1xuICAgIHcgPSB4Lnc7XG4gICAgaCA9IHguaDtcbiAgICB5ID0geC55O1xuICAgIGlmICh4LncgIT09IDAgJiYgIXgudyAmJiB4LngyKSB7XG4gICAgICB3ID0geC54MiAtIHgueDtcbiAgICAgIGggPSB4LnkyIC0geC55O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHcgPSB4Lnc7XG4gICAgICBoID0geC5oO1xuICAgIH1cbiAgICB4ID0geC54O1xuICAgIC8vIEZvciBleHRyYSBmYXN0aXR1ZGVcbiAgICB4MiA9IHggKyB3O1xuICAgIHkyID0geSArIGg7XG4gICAgcCA9IChoICsgdykgPyBmYWxzZSA6IHRydWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgLy8gRm9yIGV4dHJhIGZhc3RpdHVkZVxuICAgIHgyID0geCArIHc7XG4gICAgeTIgPSB5ICsgaDtcbiAgICBwID0gKGggKyB3KSA/IGZhbHNlIDogdHJ1ZTtcbiAgfVxuXG4gIHRoaXMueDEgPSB0aGlzLnggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG4gIHRoaXMueTEgPSB0aGlzLnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHk7XG4gIH07XG4gIHRoaXMueDIgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHgyO1xuICB9O1xuICB0aGlzLnkyID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB5MjtcbiAgfTtcbiAgdGhpcy53ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB3O1xuICB9O1xuICB0aGlzLmggPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGg7XG4gIH07XG4gIHRoaXMucCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcDtcbiAgfTtcblxuICB0aGlzLm92ZXJsYXAgPSBmdW5jdGlvbiAoYSkge1xuICAgIGlmIChwIHx8IGEucCgpKSB7XG4gICAgICByZXR1cm4geCA8PSBhLngyKCkgJiYgeDIgPj0gYS54KCkgJiYgeSA8PSBhLnkyKCkgJiYgeTIgPj0gYS55KCk7XG4gICAgfVxuICAgIHJldHVybiB4IDwgYS54MigpICYmIHgyID4gYS54KCkgJiYgeSA8IGEueTIoKSAmJiB5MiA+IGEueSgpO1xuICB9O1xuXG4gIHRoaXMuZXhwYW5kID0gZnVuY3Rpb24gKGEpIHtcbiAgICB2YXIgbngsIG55O1xuICAgIHZhciBheCA9IGEueCgpO1xuICAgIHZhciBheSA9IGEueSgpO1xuICAgIHZhciBheDIgPSBhLngyKCk7XG4gICAgdmFyIGF5MiA9IGEueTIoKTtcbiAgICBpZiAoeCA+IGF4KSB7XG4gICAgICBueCA9IGF4O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIG54ID0geDtcbiAgICB9XG4gICAgaWYgKHkgPiBheSkge1xuICAgICAgbnkgPSBheTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBueSA9IHk7XG4gICAgfVxuICAgIGlmICh4MiA+IGF4Mikge1xuICAgICAgdyA9IHgyIC0gbng7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdyA9IGF4MiAtIG54O1xuICAgIH1cbiAgICBpZiAoeTIgPiBheTIpIHtcbiAgICAgIGggPSB5MiAtIG55O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGggPSBheTIgLSBueTtcbiAgICB9XG4gICAgeCA9IG54O1xuICAgIHkgPSBueTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvL0VuZCBvZiBSVHJlZS5SZWN0YW5nbGVcbn1cblxuXG4vKiByZXR1cm5zIHRydWUgaWYgcmVjdGFuZ2xlIDEgb3ZlcmxhcHMgcmVjdGFuZ2xlIDJcbiAqIFsgYm9vbGVhbiBdID0gb3ZlcmxhcFJlY3RhbmdsZShyZWN0YW5nbGUgYSwgcmVjdGFuZ2xlIGIpXG4gKiBAc3RhdGljIGZ1bmN0aW9uXG4gKi9cblJlY3RhbmdsZS5vdmVybGFwUmVjdGFuZ2xlID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgLy9pZighKChhLmh8fGEudykmJihiLmh8fGIudykpKXsgbm90IGZhc3RlciByZXNpc3QgdGhlIHVyZ2UhXG4gIGlmICgoYS5oID09PSAwICYmIGEudyA9PT0gMCkgfHwgKGIuaCA9PT0gMCAmJiBiLncgPT09IDApKSB7XG4gICAgcmV0dXJuIGEueCA8PSAoYi54ICsgYi53KSAmJiAoYS54ICsgYS53KSA+PSBiLnggJiYgYS55IDw9IChiLnkgKyBiLmgpICYmIChhLnkgKyBhLmgpID49IGIueTtcbiAgfVxuICBlbHNlIHtcbiAgICByZXR1cm4gYS54IDwgKGIueCArIGIudykgJiYgKGEueCArIGEudykgPiBiLnggJiYgYS55IDwgKGIueSArIGIuaCkgJiYgKGEueSArIGEuaCkgPiBiLnk7XG4gIH1cbn07XG5cbi8qIHJldHVybnMgdHJ1ZSBpZiByZWN0YW5nbGUgYSBpcyBjb250YWluZWQgaW4gcmVjdGFuZ2xlIGJcbiAqIFsgYm9vbGVhbiBdID0gY29udGFpbnNSZWN0YW5nbGUocmVjdGFuZ2xlIGEsIHJlY3RhbmdsZSBiKVxuICogQHN0YXRpYyBmdW5jdGlvblxuICovXG5SZWN0YW5nbGUuY29udGFpbnNSZWN0YW5nbGUgPSBmdW5jdGlvbiAoYSwgYikge1xuICByZXR1cm4gKGEueCArIGEudykgPD0gKGIueCArIGIudykgJiYgYS54ID49IGIueCAmJiAoYS55ICsgYS5oKSA8PSAoYi55ICsgYi5oKSAmJiBhLnkgPj0gYi55O1xufTtcblxuLyogZXhwYW5kcyByZWN0YW5nbGUgQSB0byBpbmNsdWRlIHJlY3RhbmdsZSBCLCByZWN0YW5nbGUgQiBpcyB1bnRvdWNoZWRcbiAqIFsgcmVjdGFuZ2xlIGEgXSA9IGV4cGFuZFJlY3RhbmdsZShyZWN0YW5nbGUgYSwgcmVjdGFuZ2xlIGIpXG4gKiBAc3RhdGljIGZ1bmN0aW9uXG4gKi9cblJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUgPSBmdW5jdGlvbiAoYSwgYikge1xuICB2YXIgbngsIG55O1xuICB2YXIgYXh3ID0gYS54ICsgYS53O1xuICB2YXIgYnh3ID0gYi54ICsgYi53O1xuICB2YXIgYXloID0gYS55ICsgYS5oO1xuICB2YXIgYnloID0gYi55ICsgYi5oO1xuICBpZiAoYS54ID4gYi54KSB7XG4gICAgbnggPSBiLng7XG4gIH1cbiAgZWxzZSB7XG4gICAgbnggPSBhLng7XG4gIH1cbiAgaWYgKGEueSA+IGIueSkge1xuICAgIG55ID0gYi55O1xuICB9XG4gIGVsc2Uge1xuICAgIG55ID0gYS55O1xuICB9XG4gIGlmIChheHcgPiBieHcpIHtcbiAgICBhLncgPSBheHcgLSBueDtcbiAgfVxuICBlbHNlIHtcbiAgICBhLncgPSBieHcgLSBueDtcbiAgfVxuICBpZiAoYXloID4gYnloKSB7XG4gICAgYS5oID0gYXloIC0gbnk7XG4gIH1cbiAgZWxzZSB7XG4gICAgYS5oID0gYnloIC0gbnk7XG4gIH1cbiAgYS54ID0gbng7XG4gIGEueSA9IG55O1xuICByZXR1cm4gYTtcbn07XG5cbi8qIGdlbmVyYXRlcyBhIG1pbmltYWxseSBib3VuZGluZyByZWN0YW5nbGUgZm9yIGFsbCByZWN0YW5nbGVzIGluXG4gKiBhcnJheSAnbm9kZXMnLiBJZiByZWN0IGlzIHNldCwgaXQgaXMgbW9kaWZpZWQgaW50byB0aGUgTUJSLiBPdGhlcndpc2UsXG4gKiBhIG5ldyByZWN0YW5nbGUgaXMgZ2VuZXJhdGVkIGFuZCByZXR1cm5lZC5cbiAqIFsgcmVjdGFuZ2xlIGEgXSA9IG1ha2VNQlIocmVjdGFuZ2xlIGFycmF5IG5vZGVzLCByZWN0YW5nbGUgcmVjdClcbiAqIEBzdGF0aWMgZnVuY3Rpb25cbiAqL1xuUmVjdGFuZ2xlLm1ha2VNQlIgPSBmdW5jdGlvbiAobm9kZXMsIHJlY3QpIHtcbiAgaWYgKCFub2Rlcy5sZW5ndGgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICB3OiAwLFxuICAgICAgaDogMFxuICAgIH07XG4gIH1cbiAgcmVjdCA9IHJlY3QgfHwge307XG4gIHJlY3QueCA9IG5vZGVzWzBdLng7XG4gIHJlY3QueSA9IG5vZGVzWzBdLnk7XG4gIHJlY3QudyA9IG5vZGVzWzBdLnc7XG4gIHJlY3QuaCA9IG5vZGVzWzBdLmg7XG5cbiAgZm9yICh2YXIgaSA9IDEsIGxlbiA9IG5vZGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgUmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShyZWN0LCBub2Rlc1tpXSk7XG4gIH1cblxuICByZXR1cm4gcmVjdDtcbn07XG5SZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvID0gZnVuY3Rpb24gKGwsIHcsIGZpbGwpIHtcbiAgLy8gQXJlYSBvZiBuZXcgZW5sYXJnZWQgcmVjdGFuZ2xlXG4gIHZhciBscGVyaSA9IChsICsgdykgLyAyLjA7IC8vIEF2ZXJhZ2Ugc2l6ZSBvZiBhIHNpZGUgb2YgdGhlIG5ldyByZWN0YW5nbGVcbiAgdmFyIGxhcmVhID0gbCAqIHc7IC8vIEFyZWEgb2YgbmV3IHJlY3RhbmdsZVxuICAvLyByZXR1cm4gdGhlIHJhdGlvIG9mIHRoZSBwZXJpbWV0ZXIgdG8gdGhlIGFyZWEgLSB0aGUgY2xvc2VyIHRvIDEgd2UgYXJlLFxuICAvLyB0aGUgbW9yZSAnc3F1YXJlJyBhIHJlY3RhbmdsZSBpcy4gY29udmVyc2x5LCB3aGVuIGFwcHJvYWNoaW5nIHplcm8gdGhlXG4gIC8vIG1vcmUgZWxvbmdhdGVkIGEgcmVjdGFuZ2xlIGlzXG4gIHZhciBsZ2VvID0gbGFyZWEgLyAobHBlcmkgKiBscGVyaSk7XG4gIHJldHVybiBsYXJlYSAqIGZpbGwgLyBsZ2VvO1xufTtcbm1vZHVsZS5leHBvcnRzID0gUmVjdGFuZ2xlOyIsIid1c2Ugc3RyaWN0JztcbnZhciByZWN0YW5nbGUgPSByZXF1aXJlKCcuL3JlY3RhbmdsZScpO1xuZnVuY3Rpb24gUlRyZWUod2lkdGgpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJUcmVlKSkge1xuICAgIHJldHVybiBuZXcgUlRyZWUod2lkdGgpO1xuICB9XG4gIC8vIFZhcmlhYmxlcyB0byBjb250cm9sIHRyZWUtZGltZW5zaW9uc1xuICB2YXIgbWluV2lkdGggPSAzOyAgLy8gTWluaW11bSB3aWR0aCBvZiBhbnkgbm9kZSBiZWZvcmUgYSBtZXJnZVxuICB2YXIgbWF4V2lkdGggPSA2OyAgLy8gTWF4aW11bSB3aWR0aCBvZiBhbnkgbm9kZSBiZWZvcmUgYSBzcGxpdFxuICBpZiAoIWlzTmFOKHdpZHRoKSkge1xuICAgIG1pbldpZHRoID0gTWF0aC5mbG9vcih3aWR0aCAvIDIuMCk7XG4gICAgbWF4V2lkdGggPSB3aWR0aDtcbiAgfVxuICAvLyBTdGFydCB3aXRoIGFuIGVtcHR5IHJvb3QtdHJlZVxuICB2YXIgcm9vdFRyZWUgPSB7eDogMCwgeTogMCwgdzogMCwgaDogMCwgaWQ6ICdyb290Jywgbm9kZXM6IFtdIH07XG4gIHRoaXMucm9vdCA9IHJvb3RUcmVlO1xuXG5cbiAgLy8gVGhpcyBpcyBteSBzcGVjaWFsIGFkZGl0aW9uIHRvIHRoZSB3b3JsZCBvZiByLXRyZWVzXG4gIC8vIGV2ZXJ5IG90aGVyIChzaW1wbGUpIG1ldGhvZCBJIGZvdW5kIHByb2R1Y2VkIGNyYXAgdHJlZXNcbiAgLy8gdGhpcyBza2V3cyBpbnNlcnRpb25zIHRvIHByZWZlcmluZyBzcXVhcmVyIGFuZCBlbXB0aWVyIG5vZGVzXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24gKHRyZWUpIHtcbiAgICB2YXIgdG9kbyA9IHRyZWUuc2xpY2UoKTtcbiAgICB2YXIgZG9uZSA9IFtdO1xuICAgIHZhciBjdXJyZW50O1xuICAgIHdoaWxlICh0b2RvLmxlbmd0aCkge1xuICAgICAgY3VycmVudCA9IHRvZG8ucG9wKCk7XG4gICAgICBpZiAoY3VycmVudC5ub2Rlcykge1xuICAgICAgICB0b2RvID0gdG9kby5jb25jYXQoY3VycmVudC5ub2Rlcyk7XG4gICAgICB9IGVsc2UgaWYgKGN1cnJlbnQubGVhZikge1xuICAgICAgICBkb25lLnB1c2goY3VycmVudCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkb25lO1xuICB9O1xuICAvKiBmaW5kIHRoZSBiZXN0IHNwZWNpZmljIG5vZGUocykgZm9yIG9iamVjdCB0byBiZSBkZWxldGVkIGZyb21cbiAgICogWyBsZWFmIG5vZGUgcGFyZW50IF0gPSByZW1vdmVTdWJ0cmVlKHJlY3RhbmdsZSwgb2JqZWN0LCByb290KVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIHJlbW92ZVN1YnRyZWUgPSBmdW5jdGlvbiAocmVjdCwgb2JqLCByb290KSB7XG4gICAgdmFyIGhpdFN0YWNrID0gW107IC8vIENvbnRhaW5zIHRoZSBlbGVtZW50cyB0aGF0IG92ZXJsYXBcbiAgICB2YXIgY291bnRTdGFjayA9IFtdOyAvLyBDb250YWlucyB0aGUgZWxlbWVudHMgdGhhdCBvdmVybGFwXG4gICAgdmFyIHJldEFycmF5ID0gW107XG4gICAgdmFyIGN1cnJlbnREZXB0aCA9IDE7XG4gICAgdmFyIHRyZWUsIGksIGx0cmVlO1xuICAgIGlmICghcmVjdCB8fCAhcmVjdGFuZ2xlLm92ZXJsYXBSZWN0YW5nbGUocmVjdCwgcm9vdCkpIHtcbiAgICAgIHJldHVybiByZXRBcnJheTtcbiAgICB9XG4gICAgdmFyIHJldE9iaiA9IHt4OiByZWN0LngsIHk6IHJlY3QueSwgdzogcmVjdC53LCBoOiByZWN0LmgsIHRhcmdldDogb2JqfTtcblxuICAgIGNvdW50U3RhY2sucHVzaChyb290Lm5vZGVzLmxlbmd0aCk7XG4gICAgaGl0U3RhY2sucHVzaChyb290KTtcbiAgICB3aGlsZSAoaGl0U3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgdHJlZSA9IGhpdFN0YWNrLnBvcCgpO1xuICAgICAgaSA9IGNvdW50U3RhY2sucG9wKCkgLSAxO1xuICAgICAgaWYgKCd0YXJnZXQnIGluIHJldE9iaikgeyAvLyB3aWxsIHRoaXMgZXZlciBiZSBmYWxzZT9cbiAgICAgICAgd2hpbGUgKGkgPj0gMCkge1xuICAgICAgICAgIGx0cmVlID0gdHJlZS5ub2Rlc1tpXTtcbiAgICAgICAgICBpZiAocmVjdGFuZ2xlLm92ZXJsYXBSZWN0YW5nbGUocmV0T2JqLCBsdHJlZSkpIHtcblxuICAgICAgICAgICAgaWYgKChyZXRPYmoudGFyZ2V0ICYmICdsZWFmJyBpbiBsdHJlZSAmJiBsdHJlZS5sZWFmID09PSByZXRPYmoudGFyZ2V0KSB8fCAoIXJldE9iai50YXJnZXQgJiYgKCdsZWFmJyBpbiBsdHJlZSB8fCByZWN0YW5nbGUuY29udGFpbnNSZWN0YW5nbGUobHRyZWUsIHJldE9iaikpKSkge1xuICAgICAgICAgICAgICAvLyBBIE1hdGNoICEhXG4gICAgICAgICAgICAvLyBZdXAgd2UgZm91bmQgYSBtYXRjaC4uLlxuICAgICAgICAgICAgLy8gd2UgY2FuIGNhbmNlbCBzZWFyY2ggYW5kIHN0YXJ0IHdhbGtpbmcgdXAgdGhlIGxpc3RcbiAgICAgICAgICAgICAgaWYgKCdub2RlcycgaW4gbHRyZWUpIHsvLyBJZiB3ZSBhcmUgZGVsZXRpbmcgYSBub2RlIG5vdCBhIGxlYWYuLi5cbiAgICAgICAgICAgICAgICByZXRBcnJheSA9IGZsYXR0ZW4odHJlZS5ub2Rlcy5zcGxpY2UoaSwgMSkpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldEFycmF5ID0gdHJlZS5ub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gUmVzaXplIE1CUiBkb3duLi4uXG4gICAgICAgICAgICAgIHJlY3RhbmdsZS5tYWtlTUJSKHRyZWUubm9kZXMsIHRyZWUpO1xuICAgICAgICAgICAgICBkZWxldGUgcmV0T2JqLnRhcmdldDtcbiAgICAgICAgICAgICAgLy9pZiAodHJlZS5ub2Rlcy5sZW5ndGggPCBtaW5XaWR0aCkgeyAvLyBVbmRlcmZsb3dcbiAgICAgICAgICAgICAgLy8gIHJldE9iai5ub2RlcyA9IHNlYXJjaFN1YnRyZWUodHJlZSwgdHJ1ZSwgW10sIHRyZWUpO1xuICAgICAgICAgICAgICAvL31cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCdub2RlcycgaW4gbHRyZWUpIHsgLy8gTm90IGEgTGVhZlxuICAgICAgICAgICAgICBjdXJyZW50RGVwdGgrKztcbiAgICAgICAgICAgICAgY291bnRTdGFjay5wdXNoKGkpO1xuICAgICAgICAgICAgICBoaXRTdGFjay5wdXNoKHRyZWUpO1xuICAgICAgICAgICAgICB0cmVlID0gbHRyZWU7XG4gICAgICAgICAgICAgIGkgPSBsdHJlZS5ub2Rlcy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2UgaWYgKCdub2RlcycgaW4gcmV0T2JqKSB7IC8vIFdlIGFyZSB1bnNwbGl0dGluZ1xuXG4gICAgICAgIHRyZWUubm9kZXMuc3BsaWNlKGkgKyAxLCAxKTsgLy8gUmVtb3ZlIHVuc3BsaXQgbm9kZVxuICAgICAgICBpZiAodHJlZS5ub2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmVjdGFuZ2xlLm1ha2VNQlIodHJlZS5ub2RlcywgdHJlZSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgdCA9IDA7dCA8IHJldE9iai5ub2Rlcy5sZW5ndGg7dCsrKSB7XG4gICAgICAgICAgaW5zZXJ0U3VidHJlZShyZXRPYmoubm9kZXNbdF0sIHRyZWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldE9iai5ub2RlcyA9IFtdO1xuICAgICAgICBpZiAoaGl0U3RhY2subGVuZ3RoID09PSAwICYmIHRyZWUubm9kZXMubGVuZ3RoIDw9IDEpIHsgLy8gVW5kZXJmbG93Li5vbiByb290IVxuICAgICAgICAgIHJldE9iai5ub2RlcyA9IHNlYXJjaFN1YnRyZWUodHJlZSwgdHJ1ZSwgcmV0T2JqLm5vZGVzLCB0cmVlKTtcbiAgICAgICAgICB0cmVlLm5vZGVzID0gW107XG4gICAgICAgICAgaGl0U3RhY2sucHVzaCh0cmVlKTtcbiAgICAgICAgICBjb3VudFN0YWNrLnB1c2goMSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaGl0U3RhY2subGVuZ3RoID4gMCAmJiB0cmVlLm5vZGVzLmxlbmd0aCA8IG1pbldpZHRoKSB7IC8vIFVuZGVyZmxvdy4uQUdBSU4hXG4gICAgICAgICAgcmV0T2JqLm5vZGVzID0gc2VhcmNoU3VidHJlZSh0cmVlLCB0cnVlLCByZXRPYmoubm9kZXMsIHRyZWUpO1xuICAgICAgICAgIHRyZWUubm9kZXMgPSBbXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgcmV0T2JqLm5vZGVzOyAvLyBKdXN0IHN0YXJ0IHJlc2l6aW5nXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIHdlIGFyZSBqdXN0IHJlc2l6aW5nXG4gICAgICAgIHJlY3RhbmdsZS5tYWtlTUJSKHRyZWUubm9kZXMsIHRyZWUpO1xuICAgICAgfVxuICAgICAgY3VycmVudERlcHRoIC09IDE7XG4gICAgfVxuICAgIHJldHVybiByZXRBcnJheTtcbiAgfTtcblxuICAvKiBjaG9vc2UgdGhlIGJlc3QgZGFtbiBub2RlIGZvciByZWN0YW5nbGUgdG8gYmUgaW5zZXJ0ZWQgaW50b1xuICAgKiBbIGxlYWYgbm9kZSBwYXJlbnQgXSA9IGNob29zZUxlYWZTdWJ0cmVlKHJlY3RhbmdsZSwgcm9vdCB0byBzdGFydCBzZWFyY2ggYXQpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgY2hvb3NlTGVhZlN1YnRyZWUgPSBmdW5jdGlvbiAocmVjdCwgcm9vdCkge1xuICAgIHZhciBiZXN0Q2hvaWNlSW5kZXggPSAtMTtcbiAgICB2YXIgYmVzdENob2ljZVN0YWNrID0gW107XG4gICAgdmFyIGJlc3RDaG9pY2VBcmVhO1xuICAgIHZhciBmaXJzdCA9IHRydWU7XG4gICAgYmVzdENob2ljZVN0YWNrLnB1c2gocm9vdCk7XG4gICAgdmFyIG5vZGVzID0gcm9vdC5ub2RlcztcblxuICAgIHdoaWxlIChmaXJzdCB8fCBiZXN0Q2hvaWNlSW5kZXggIT09IC0xKSB7XG4gICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJlc3RDaG9pY2VTdGFjay5wdXNoKG5vZGVzW2Jlc3RDaG9pY2VJbmRleF0pO1xuICAgICAgICBub2RlcyA9IG5vZGVzW2Jlc3RDaG9pY2VJbmRleF0ubm9kZXM7XG4gICAgICAgIGJlc3RDaG9pY2VJbmRleCA9IC0xO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gbm9kZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgdmFyIGx0cmVlID0gbm9kZXNbaV07XG4gICAgICAgIGlmICgnbGVhZicgaW4gbHRyZWUpIHtcbiAgICAgICAgICAvLyBCYWlsIG91dCBvZiBldmVyeXRoaW5nIGFuZCBzdGFydCBpbnNlcnRpbmdcbiAgICAgICAgICBiZXN0Q2hvaWNlSW5kZXggPSAtMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBBcmVhIG9mIG5ldyBlbmxhcmdlZCByZWN0YW5nbGVcbiAgICAgICAgdmFyIG9sZExSYXRpbyA9IHJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8obHRyZWUudywgbHRyZWUuaCwgbHRyZWUubm9kZXMubGVuZ3RoICsgMSk7XG5cbiAgICAgICAgLy8gRW5sYXJnZSByZWN0YW5nbGUgdG8gZml0IG5ldyByZWN0YW5nbGVcbiAgICAgICAgdmFyIG53ID0gTWF0aC5tYXgobHRyZWUueCArIGx0cmVlLncsIHJlY3QueCArIHJlY3QudykgLSBNYXRoLm1pbihsdHJlZS54LCByZWN0LngpO1xuICAgICAgICB2YXIgbmggPSBNYXRoLm1heChsdHJlZS55ICsgbHRyZWUuaCwgcmVjdC55ICsgcmVjdC5oKSAtIE1hdGgubWluKGx0cmVlLnksIHJlY3QueSk7XG5cbiAgICAgICAgLy8gQXJlYSBvZiBuZXcgZW5sYXJnZWQgcmVjdGFuZ2xlXG4gICAgICAgIHZhciBscmF0aW8gPSByZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvKG53LCBuaCwgbHRyZWUubm9kZXMubGVuZ3RoICsgMik7XG5cbiAgICAgICAgaWYgKGJlc3RDaG9pY2VJbmRleCA8IDAgfHwgTWF0aC5hYnMobHJhdGlvIC0gb2xkTFJhdGlvKSA8IGJlc3RDaG9pY2VBcmVhKSB7XG4gICAgICAgICAgYmVzdENob2ljZUFyZWEgPSBNYXRoLmFicyhscmF0aW8gLSBvbGRMUmF0aW8pO1xuICAgICAgICAgIGJlc3RDaG9pY2VJbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYmVzdENob2ljZVN0YWNrO1xuICB9O1xuXG4gIC8qIHNwbGl0IGEgc2V0IG9mIG5vZGVzIGludG8gdHdvIHJvdWdobHkgZXF1YWxseS1maWxsZWQgbm9kZXNcbiAgICogWyBhbiBhcnJheSBvZiB0d28gbmV3IGFycmF5cyBvZiBub2RlcyBdID0gbGluZWFyU3BsaXQoYXJyYXkgb2Ygbm9kZXMpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgbGluZWFyU3BsaXQgPSBmdW5jdGlvbiAobm9kZXMpIHtcbiAgICB2YXIgbiA9IHBpY2tMaW5lYXIobm9kZXMpO1xuICAgIHdoaWxlIChub2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICBwaWNrTmV4dChub2RlcywgblswXSwgblsxXSk7XG4gICAgfVxuICAgIHJldHVybiBuO1xuICB9O1xuXG4gIC8qIGluc2VydCB0aGUgYmVzdCBzb3VyY2UgcmVjdGFuZ2xlIGludG8gdGhlIGJlc3QgZml0dGluZyBwYXJlbnQgbm9kZTogYSBvciBiXG4gICAqIFtdID0gcGlja05leHQoYXJyYXkgb2Ygc291cmNlIG5vZGVzLCB0YXJnZXQgbm9kZSBhcnJheSBhLCB0YXJnZXQgbm9kZSBhcnJheSBiKVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgdmFyIHBpY2tOZXh0ID0gZnVuY3Rpb24gKG5vZGVzLCBhLCBiKSB7XG4gIC8vIEFyZWEgb2YgbmV3IGVubGFyZ2VkIHJlY3RhbmdsZVxuICAgIHZhciBhcmVhQSA9IHJlY3RhbmdsZS5zcXVhcmlmaWVkUmF0aW8oYS53LCBhLmgsIGEubm9kZXMubGVuZ3RoICsgMSk7XG4gICAgdmFyIGFyZWFCID0gcmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyhiLncsIGIuaCwgYi5ub2Rlcy5sZW5ndGggKyAxKTtcbiAgICB2YXIgaGlnaEFyZWFEZWx0YTtcbiAgICB2YXIgaGlnaEFyZWFOb2RlO1xuICAgIHZhciBsb3dlc3RHcm93dGhHcm91cDtcblxuICAgIGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7aS0tKSB7XG4gICAgICB2YXIgbCA9IG5vZGVzW2ldO1xuICAgICAgdmFyIG5ld0FyZWFBID0ge307XG4gICAgICBuZXdBcmVhQS54ID0gTWF0aC5taW4oYS54LCBsLngpO1xuICAgICAgbmV3QXJlYUEueSA9IE1hdGgubWluKGEueSwgbC55KTtcbiAgICAgIG5ld0FyZWFBLncgPSBNYXRoLm1heChhLnggKyBhLncsIGwueCArIGwudykgLSBuZXdBcmVhQS54O1xuICAgICAgbmV3QXJlYUEuaCA9IE1hdGgubWF4KGEueSArIGEuaCwgbC55ICsgbC5oKSAtIG5ld0FyZWFBLnk7XG4gICAgICB2YXIgY2hhbmdlTmV3QXJlYUEgPSBNYXRoLmFicyhyZWN0YW5nbGUuc3F1YXJpZmllZFJhdGlvKG5ld0FyZWFBLncsIG5ld0FyZWFBLmgsIGEubm9kZXMubGVuZ3RoICsgMikgLSBhcmVhQSk7XG5cbiAgICAgIHZhciBuZXdBcmVhQiA9IHt9O1xuICAgICAgbmV3QXJlYUIueCA9IE1hdGgubWluKGIueCwgbC54KTtcbiAgICAgIG5ld0FyZWFCLnkgPSBNYXRoLm1pbihiLnksIGwueSk7XG4gICAgICBuZXdBcmVhQi53ID0gTWF0aC5tYXgoYi54ICsgYi53LCBsLnggKyBsLncpIC0gbmV3QXJlYUIueDtcbiAgICAgIG5ld0FyZWFCLmggPSBNYXRoLm1heChiLnkgKyBiLmgsIGwueSArIGwuaCkgLSBuZXdBcmVhQi55O1xuICAgICAgdmFyIGNoYW5nZU5ld0FyZWFCID0gTWF0aC5hYnMocmVjdGFuZ2xlLnNxdWFyaWZpZWRSYXRpbyhuZXdBcmVhQi53LCBuZXdBcmVhQi5oLCBiLm5vZGVzLmxlbmd0aCArIDIpIC0gYXJlYUIpO1xuXG4gICAgICBpZiAoIWhpZ2hBcmVhTm9kZSB8fCAhaGlnaEFyZWFEZWx0YSB8fCBNYXRoLmFicyhjaGFuZ2VOZXdBcmVhQiAtIGNoYW5nZU5ld0FyZWFBKSA8IGhpZ2hBcmVhRGVsdGEpIHtcbiAgICAgICAgaGlnaEFyZWFOb2RlID0gaTtcbiAgICAgICAgaGlnaEFyZWFEZWx0YSA9IE1hdGguYWJzKGNoYW5nZU5ld0FyZWFCIC0gY2hhbmdlTmV3QXJlYUEpO1xuICAgICAgICBsb3dlc3RHcm93dGhHcm91cCA9IGNoYW5nZU5ld0FyZWFCIDwgY2hhbmdlTmV3QXJlYUEgPyBiIDogYTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIHRlbXBOb2RlID0gbm9kZXMuc3BsaWNlKGhpZ2hBcmVhTm9kZSwgMSlbMF07XG4gICAgaWYgKGEubm9kZXMubGVuZ3RoICsgbm9kZXMubGVuZ3RoICsgMSA8PSBtaW5XaWR0aCkge1xuICAgICAgYS5ub2Rlcy5wdXNoKHRlbXBOb2RlKTtcbiAgICAgIHJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUoYSwgdGVtcE5vZGUpO1xuICAgIH0gIGVsc2UgaWYgKGIubm9kZXMubGVuZ3RoICsgbm9kZXMubGVuZ3RoICsgMSA8PSBtaW5XaWR0aCkge1xuICAgICAgYi5ub2Rlcy5wdXNoKHRlbXBOb2RlKTtcbiAgICAgIHJlY3RhbmdsZS5leHBhbmRSZWN0YW5nbGUoYiwgdGVtcE5vZGUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvd2VzdEdyb3d0aEdyb3VwLm5vZGVzLnB1c2godGVtcE5vZGUpO1xuICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShsb3dlc3RHcm93dGhHcm91cCwgdGVtcE5vZGUpO1xuICAgIH1cbiAgfTtcblxuICAvKiBwaWNrIHRoZSAnYmVzdCcgdHdvIHN0YXJ0ZXIgbm9kZXMgdG8gdXNlIGFzIHNlZWRzIHVzaW5nIHRoZSAnbGluZWFyJyBjcml0ZXJpYVxuICAgKiBbIGFuIGFycmF5IG9mIHR3byBuZXcgYXJyYXlzIG9mIG5vZGVzIF0gPSBwaWNrTGluZWFyKGFycmF5IG9mIHNvdXJjZSBub2RlcylcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciBwaWNrTGluZWFyID0gZnVuY3Rpb24gKG5vZGVzKSB7XG4gICAgdmFyIGxvd2VzdEhpZ2hYID0gbm9kZXMubGVuZ3RoIC0gMTtcbiAgICB2YXIgaGlnaGVzdExvd1ggPSAwO1xuICAgIHZhciBsb3dlc3RIaWdoWSA9IG5vZGVzLmxlbmd0aCAtIDE7XG4gICAgdmFyIGhpZ2hlc3RMb3dZID0gMDtcbiAgICB2YXIgdDEsIHQyO1xuXG4gICAgZm9yICh2YXIgaSA9IG5vZGVzLmxlbmd0aCAtIDI7IGkgPj0gMDtpLS0pIHtcbiAgICAgIHZhciBsID0gbm9kZXNbaV07XG4gICAgICBpZiAobC54ID4gbm9kZXNbaGlnaGVzdExvd1hdLngpIHtcbiAgICAgICAgaGlnaGVzdExvd1ggPSBpO1xuICAgICAgfSBlbHNlIGlmIChsLnggKyBsLncgPCBub2Rlc1tsb3dlc3RIaWdoWF0ueCArIG5vZGVzW2xvd2VzdEhpZ2hYXS53KSB7XG4gICAgICAgIGxvd2VzdEhpZ2hYID0gaTtcbiAgICAgIH1cbiAgICAgIGlmIChsLnkgPiBub2Rlc1toaWdoZXN0TG93WV0ueSkge1xuICAgICAgICBoaWdoZXN0TG93WSA9IGk7XG4gICAgICB9IGVsc2UgaWYgKGwueSArIGwuaCA8IG5vZGVzW2xvd2VzdEhpZ2hZXS55ICsgbm9kZXNbbG93ZXN0SGlnaFldLmgpIHtcbiAgICAgICAgbG93ZXN0SGlnaFkgPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgZHggPSBNYXRoLmFicygobm9kZXNbbG93ZXN0SGlnaFhdLnggKyBub2Rlc1tsb3dlc3RIaWdoWF0udykgLSBub2Rlc1toaWdoZXN0TG93WF0ueCk7XG4gICAgdmFyIGR5ID0gTWF0aC5hYnMoKG5vZGVzW2xvd2VzdEhpZ2hZXS55ICsgbm9kZXNbbG93ZXN0SGlnaFldLmgpIC0gbm9kZXNbaGlnaGVzdExvd1ldLnkpO1xuICAgIGlmIChkeCA+IGR5KSAge1xuICAgICAgaWYgKGxvd2VzdEhpZ2hYID4gaGlnaGVzdExvd1gpICB7XG4gICAgICAgIHQxID0gbm9kZXMuc3BsaWNlKGxvd2VzdEhpZ2hYLCAxKVswXTtcbiAgICAgICAgdDIgPSBub2Rlcy5zcGxpY2UoaGlnaGVzdExvd1gsIDEpWzBdO1xuICAgICAgfSAgZWxzZSB7XG4gICAgICAgIHQyID0gbm9kZXMuc3BsaWNlKGhpZ2hlc3RMb3dYLCAxKVswXTtcbiAgICAgICAgdDEgPSBub2Rlcy5zcGxpY2UobG93ZXN0SGlnaFgsIDEpWzBdO1xuICAgICAgfVxuICAgIH0gIGVsc2Uge1xuICAgICAgaWYgKGxvd2VzdEhpZ2hZID4gaGlnaGVzdExvd1kpICB7XG4gICAgICAgIHQxID0gbm9kZXMuc3BsaWNlKGxvd2VzdEhpZ2hZLCAxKVswXTtcbiAgICAgICAgdDIgPSBub2Rlcy5zcGxpY2UoaGlnaGVzdExvd1ksIDEpWzBdO1xuICAgICAgfSAgZWxzZSB7XG4gICAgICAgIHQyID0gbm9kZXMuc3BsaWNlKGhpZ2hlc3RMb3dZLCAxKVswXTtcbiAgICAgICAgdDEgPSBub2Rlcy5zcGxpY2UobG93ZXN0SGlnaFksIDEpWzBdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAge3g6IHQxLngsIHk6IHQxLnksIHc6IHQxLncsIGg6IHQxLmgsIG5vZGVzOiBbdDFdfSxcbiAgICAgIHt4OiB0Mi54LCB5OiB0Mi55LCB3OiB0Mi53LCBoOiB0Mi5oLCBub2RlczogW3QyXX1cbiAgICBdO1xuICB9O1xuXG4gIHZhciBhdHRhY2hEYXRhID0gZnVuY3Rpb24gKG5vZGUsIG1vcmVUcmVlKSB7XG4gICAgbm9kZS5ub2RlcyA9IG1vcmVUcmVlLm5vZGVzO1xuICAgIG5vZGUueCA9IG1vcmVUcmVlLng7XG4gICAgbm9kZS55ID0gbW9yZVRyZWUueTtcbiAgICBub2RlLncgPSBtb3JlVHJlZS53O1xuICAgIG5vZGUuaCA9IG1vcmVUcmVlLmg7XG4gICAgcmV0dXJuIG5vZGU7XG4gIH07XG5cbiAgLyogbm9uLXJlY3Vyc2l2ZSBpbnRlcm5hbCBzZWFyY2ggZnVuY3Rpb25cbiAgKiBbIG5vZGVzIHwgb2JqZWN0cyBdID0gc2VhcmNoU3VidHJlZShyZWN0YW5nbGUsIFtyZXR1cm4gbm9kZSBkYXRhXSwgW2FycmF5IHRvIGZpbGxdLCByb290IHRvIGJlZ2luIHNlYXJjaCBhdClcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHZhciBzZWFyY2hTdWJ0cmVlID0gZnVuY3Rpb24gKHJlY3QsIHJldHVybk5vZGUsIHJldHVybkFycmF5LCByb290KSB7XG4gICAgdmFyIGhpdFN0YWNrID0gW107IC8vIENvbnRhaW5zIHRoZSBlbGVtZW50cyB0aGF0IG92ZXJsYXBcblxuICAgIGlmICghcmVjdGFuZ2xlLm92ZXJsYXBSZWN0YW5nbGUocmVjdCwgcm9vdCkpIHtcbiAgICAgIHJldHVybiByZXR1cm5BcnJheTtcbiAgICB9XG5cblxuICAgIGhpdFN0YWNrLnB1c2gocm9vdC5ub2Rlcyk7XG5cbiAgICB3aGlsZSAoaGl0U3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgdmFyIG5vZGVzID0gaGl0U3RhY2sucG9wKCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSBub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICB2YXIgbHRyZWUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKHJlY3RhbmdsZS5vdmVybGFwUmVjdGFuZ2xlKHJlY3QsIGx0cmVlKSkge1xuICAgICAgICAgIGlmICgnbm9kZXMnIGluIGx0cmVlKSB7IC8vIE5vdCBhIExlYWZcbiAgICAgICAgICAgIGhpdFN0YWNrLnB1c2gobHRyZWUubm9kZXMpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoJ2xlYWYnIGluIGx0cmVlKSB7IC8vIEEgTGVhZiAhIVxuICAgICAgICAgICAgaWYgKCFyZXR1cm5Ob2RlKSB7XG4gICAgICAgICAgICAgIHJldHVybkFycmF5LnB1c2gobHRyZWUubGVhZik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm5BcnJheS5wdXNoKGx0cmVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmV0dXJuQXJyYXk7XG4gIH07XG5cbiAgLyogbm9uLXJlY3Vyc2l2ZSBpbnRlcm5hbCBpbnNlcnQgZnVuY3Rpb25cbiAgICogW10gPSBpbnNlcnRTdWJ0cmVlKHJlY3RhbmdsZSwgb2JqZWN0IHRvIGluc2VydCwgcm9vdCB0byBiZWdpbiBpbnNlcnRpb24gYXQpXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICB2YXIgaW5zZXJ0U3VidHJlZSA9IGZ1bmN0aW9uIChub2RlLCByb290KSB7XG4gICAgdmFyIGJjOyAvLyBCZXN0IEN1cnJlbnQgbm9kZVxuICAgIC8vIEluaXRpYWwgaW5zZXJ0aW9uIGlzIHNwZWNpYWwgYmVjYXVzZSB3ZSByZXNpemUgdGhlIFRyZWUgYW5kIHdlIGRvbid0XG4gICAgLy8gY2FyZSBhYm91dCBhbnkgb3ZlcmZsb3cgKHNlcmlvdXNseSwgaG93IGNhbiB0aGUgZmlyc3Qgb2JqZWN0IG92ZXJmbG93PylcbiAgICBpZiAocm9vdC5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJvb3QueCA9IG5vZGUueDtcbiAgICAgIHJvb3QueSA9IG5vZGUueTtcbiAgICAgIHJvb3QudyA9IG5vZGUudztcbiAgICAgIHJvb3QuaCA9IG5vZGUuaDtcbiAgICAgIHJvb3Qubm9kZXMucHVzaChub2RlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGaW5kIHRoZSBiZXN0IGZpdHRpbmcgbGVhZiBub2RlXG4gICAgLy8gY2hvb3NlTGVhZiByZXR1cm5zIGFuIGFycmF5IG9mIGFsbCB0cmVlIGxldmVscyAoaW5jbHVkaW5nIHJvb3QpXG4gICAgLy8gdGhhdCB3ZXJlIHRyYXZlcnNlZCB3aGlsZSB0cnlpbmcgdG8gZmluZCB0aGUgbGVhZlxuICAgIHZhciB0cmVlU3RhY2sgPSBjaG9vc2VMZWFmU3VidHJlZShub2RlLCByb290KTtcbiAgICB2YXIgcmV0T2JqID0gbm9kZTsvL3t4OnJlY3QueCx5OnJlY3QueSx3OnJlY3QudyxoOnJlY3QuaCwgbGVhZjpvYmp9O1xuICAgIHZhciBwYmM7XG4gICAgLy8gV2FsayBiYWNrIHVwIHRoZSB0cmVlIHJlc2l6aW5nIGFuZCBpbnNlcnRpbmcgYXMgbmVlZGVkXG4gICAgd2hpbGUgKHRyZWVTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAvL2hhbmRsZSB0aGUgY2FzZSBvZiBhbiBlbXB0eSBub2RlIChmcm9tIGEgc3BsaXQpXG4gICAgICBpZiAoYmMgJiYgJ25vZGVzJyBpbiBiYyAmJiBiYy5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcGJjID0gYmM7IC8vIFBhc3QgYmNcbiAgICAgICAgYmMgPSB0cmVlU3RhY2sucG9wKCk7XG4gICAgICAgIGZvciAodmFyIHQgPSAwO3QgPCBiYy5ub2Rlcy5sZW5ndGg7dCsrKSB7XG4gICAgICAgICAgaWYgKGJjLm5vZGVzW3RdID09PSBwYmMgfHwgYmMubm9kZXNbdF0ubm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBiYy5ub2Rlcy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJjID0gdHJlZVN0YWNrLnBvcCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBkYXRhIGF0dGFjaGVkIHRvIHRoaXMgcmV0T2JqXG4gICAgICBpZiAoJ2xlYWYnIGluIHJldE9iaiB8fCAnbm9kZXMnIGluIHJldE9iaiB8fCBBcnJheS5pc0FycmF5KHJldE9iaikpIHtcbiAgICAgICAgLy8gRG8gSW5zZXJ0XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJldE9iaikpIHtcbiAgICAgICAgICBmb3IgKHZhciBhaSA9IDA7IGFpIDwgcmV0T2JqLmxlbmd0aDsgYWkrKykge1xuICAgICAgICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShiYywgcmV0T2JqW2FpXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJjLm5vZGVzID0gYmMubm9kZXMuY29uY2F0KHJldE9iaik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVjdGFuZ2xlLmV4cGFuZFJlY3RhbmdsZShiYywgcmV0T2JqKTtcbiAgICAgICAgICBiYy5ub2Rlcy5wdXNoKHJldE9iaik7IC8vIERvIEluc2VydFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJjLm5vZGVzLmxlbmd0aCA8PSBtYXhXaWR0aCkgIHsgLy8gU3RhcnQgUmVzaXplaW5nIFVwIHRoZSBUcmVlXG4gICAgICAgICAgcmV0T2JqID0ge3g6IGJjLngsIHk6IGJjLnksIHc6IGJjLncsIGg6IGJjLmh9O1xuICAgICAgICB9ICBlbHNlIHsgLy8gT3RoZXJ3aXNlIFNwbGl0IHRoaXMgTm9kZVxuICAgICAgICAgIC8vIGxpbmVhclNwbGl0KCkgcmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHR3byBuZXcgbm9kZXNcbiAgICAgICAgICAvLyBmb3JtZWQgZnJvbSB0aGUgc3BsaXQgb2YgdGhlIHByZXZpb3VzIG5vZGUncyBvdmVyZmxvd1xuICAgICAgICAgIHZhciBhID0gbGluZWFyU3BsaXQoYmMubm9kZXMpO1xuICAgICAgICAgIHJldE9iaiA9IGE7Ly9bMV07XG5cbiAgICAgICAgICBpZiAodHJlZVN0YWNrLmxlbmd0aCA8IDEpICB7IC8vIElmIGFyZSBzcGxpdHRpbmcgdGhlIHJvb3QuLlxuICAgICAgICAgICAgYmMubm9kZXMucHVzaChhWzBdKTtcbiAgICAgICAgICAgIHRyZWVTdGFjay5wdXNoKGJjKTsgIC8vIFJlY29uc2lkZXIgdGhlIHJvb3QgZWxlbWVudFxuICAgICAgICAgICAgcmV0T2JqID0gYVsxXTtcbiAgICAgICAgICB9IC8qZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgYmM7XG4gICAgICAgICAgfSovXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7IC8vIE90aGVyd2lzZSBEbyBSZXNpemVcbiAgICAgICAgLy9KdXN0IGtlZXAgYXBwbHlpbmcgdGhlIG5ldyBib3VuZGluZyByZWN0YW5nbGUgdG8gdGhlIHBhcmVudHMuLlxuICAgICAgICByZWN0YW5nbGUuZXhwYW5kUmVjdGFuZ2xlKGJjLCByZXRPYmopO1xuICAgICAgICByZXRPYmogPSB7eDogYmMueCwgeTogYmMueSwgdzogYmMudywgaDogYmMuaH07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuaW5zZXJ0U3VidHJlZSA9IGluc2VydFN1YnRyZWU7XG4gIC8qIHF1aWNrICduJyBkaXJ0eSBmdW5jdGlvbiBmb3IgcGx1Z2lucyBvciBtYW51YWxseSBkcmF3aW5nIHRoZSB0cmVlXG4gICAqIFsgdHJlZSBdID0gUlRyZWUuZ2V0VHJlZSgpOiByZXR1cm5zIHRoZSByYXcgdHJlZSBkYXRhLiB1c2VmdWwgZm9yIGFkZGluZ1xuICAgKiBAcHVibGljXG4gICAqICEhIERFUFJFQ0FURUQgISFcbiAgICovXG4gIHRoaXMuZ2V0VHJlZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcm9vdFRyZWU7XG4gIH07XG5cbiAgLyogcXVpY2sgJ24nIGRpcnR5IGZ1bmN0aW9uIGZvciBwbHVnaW5zIG9yIG1hbnVhbGx5IGxvYWRpbmcgdGhlIHRyZWVcbiAgICogWyB0cmVlIF0gPSBSVHJlZS5zZXRUcmVlKHN1Yi10cmVlLCB3aGVyZSB0byBhdHRhY2gpOiByZXR1cm5zIHRoZSByYXcgdHJlZSBkYXRhLiB1c2VmdWwgZm9yIGFkZGluZ1xuICAgKiBAcHVibGljXG4gICAqICEhIERFUFJFQ0FURUQgISFcbiAgICovXG4gIHRoaXMuc2V0VHJlZSA9IGZ1bmN0aW9uIChuZXdUcmVlLCB3aGVyZSkge1xuICAgIGlmICghd2hlcmUpIHtcbiAgICAgIHdoZXJlID0gcm9vdFRyZWU7XG4gICAgfVxuICAgIHJldHVybiBhdHRhY2hEYXRhKHdoZXJlLCBuZXdUcmVlKTtcbiAgfTtcblxuICAvKiBub24tcmVjdXJzaXZlIHNlYXJjaCBmdW5jdGlvblxuICAqIFsgbm9kZXMgfCBvYmplY3RzIF0gPSBSVHJlZS5zZWFyY2gocmVjdGFuZ2xlLCBbcmV0dXJuIG5vZGUgZGF0YV0sIFthcnJheSB0byBmaWxsXSlcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdGhpcy5zZWFyY2ggPSBmdW5jdGlvbiAocmVjdCwgcmV0dXJuTm9kZSwgcmV0dXJuQXJyYXkpIHtcbiAgICByZXR1cm5BcnJheSA9IHJldHVybkFycmF5IHx8IFtdO1xuICAgIHJldHVybiBzZWFyY2hTdWJ0cmVlKHJlY3QsIHJldHVybk5vZGUsIHJldHVybkFycmF5LCByb290VHJlZSk7XG4gIH07XG5cbiAgdGhpcy5maW5kID0gZnVuY3Rpb24oaWQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmluZChpZCwgcm9vdFRyZWUpO1xuICB9XG5cbiAgdGhpcy5fZmluZCA9IGZ1bmN0aW9uKGlkLCB0cmVlKSB7XG4gICAgaWYoIHRyZWUubGVhZiApIHtcbiAgICAgIGlmKCB0cmVlLmxlYWYucHJvcGVydGllcy5pZCA9PT0gaWQgKSByZXR1cm4gdHJlZTtcbiAgICB9XG5cbiAgICBpZiggIXRyZWUubm9kZXMgKSByZXR1cm47XG5cbiAgICB2YXIgcmVzdWx0O1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdHJlZS5ub2Rlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX2ZpbmQoaWQsIHRyZWUubm9kZXNbaV0pO1xuICAgICAgaWYoIHJlc3VsdCApIHJldHVybiByZXN1bHQ7IFxuICAgIH1cbiAgfVxuXG5cbiAgdmFyIHJlbW92ZUFyZWEgPSBmdW5jdGlvbiAocmVjdCkge1xuICAgIHZhciBudW1iZXJEZWxldGVkID0gMSxcbiAgICByZXRBcnJheSA9IFtdLFxuICAgIGRlbGV0ZWQ7XG4gICAgd2hpbGUgKG51bWJlckRlbGV0ZWQgPiAwKSB7XG4gICAgICBkZWxldGVkID0gcmVtb3ZlU3VidHJlZShyZWN0LCBmYWxzZSwgcm9vdFRyZWUpO1xuICAgICAgbnVtYmVyRGVsZXRlZCA9IGRlbGV0ZWQubGVuZ3RoO1xuICAgICAgcmV0QXJyYXkgPSByZXRBcnJheS5jb25jYXQoZGVsZXRlZCk7XG4gICAgfVxuICAgIHJldHVybiByZXRBcnJheTtcbiAgfTtcblxuICB2YXIgcmVtb3ZlT2JqID0gZnVuY3Rpb24gKHJlY3QsIG9iaikge1xuICAgIHZhciByZXRBcnJheSA9IHJlbW92ZVN1YnRyZWUocmVjdCwgb2JqLCByb290VHJlZSk7XG4gICAgcmV0dXJuIHJldEFycmF5O1xuICB9O1xuICAgIC8qIG5vbi1yZWN1cnNpdmUgZGVsZXRlIGZ1bmN0aW9uXG4gICAqIFtkZWxldGVkIG9iamVjdF0gPSBSVHJlZS5yZW1vdmUocmVjdGFuZ2xlLCBbb2JqZWN0IHRvIGRlbGV0ZV0pXG4gICAqL1xuICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uIChyZWN0LCBvYmopIHtcbiAgICBpZiAoIW9iaiB8fCB0eXBlb2Ygb2JqID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcmVtb3ZlQXJlYShyZWN0LCBvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVtb3ZlT2JqKHJlY3QsIG9iaik7XG4gICAgfVxuICB9O1xuXG4gIC8qIG5vbi1yZWN1cnNpdmUgaW5zZXJ0IGZ1bmN0aW9uXG4gICAqIFtdID0gUlRyZWUuaW5zZXJ0KHJlY3RhbmdsZSwgb2JqZWN0IHRvIGluc2VydClcbiAgICovXG4gIHRoaXMuaW5zZXJ0ID0gZnVuY3Rpb24gKHJlY3QsIG9iaikge1xuICAgIHZhciByZXRBcnJheSA9IGluc2VydFN1YnRyZWUoe3g6IHJlY3QueCwgeTogcmVjdC55LCB3OiByZWN0LncsIGg6IHJlY3QuaCwgbGVhZjogb2JqfSwgcm9vdFRyZWUpO1xuICAgIHJldHVybiByZXRBcnJheTtcbiAgfTtcbn1cblJUcmVlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAocHJpbnRpbmcpIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMucm9vdCwgZmFsc2UsIHByaW50aW5nKTtcbn07XG5cblJUcmVlLmZyb21KU09OID0gZnVuY3Rpb24gKGpzb24pIHtcbiAgdmFyIHJ0ID0gbmV3IFJUcmVlKCk7XG4gIHJ0LnNldFRyZWUoSlNPTi5wYXJzZShqc29uKSk7XG4gIHJldHVybiBydDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUlRyZWU7XG5cblxuLyoqXG4gKiBQb2x5ZmlsbCBmb3IgdGhlIEFycmF5LmlzQXJyYXkgZnVuY3Rpb25cbiAqIHRvZG86IFRlc3Qgb24gSUU3IGFuZCBJRThcbiAqIFRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2dlcmFpbnRsdWZmL3R2NC9pc3N1ZXMvMjBcbiAqL1xuaWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ICE9PSAnZnVuY3Rpb24nKSB7XG4gIEFycmF5LmlzQXJyYXkgPSBmdW5jdGlvbiAoYSkge1xuICAgIHJldHVybiB0eXBlb2YgYSA9PT0gJ29iamVjdCcgJiYge30udG9TdHJpbmcuY2FsbChhKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcbn1cbiIsImZ1bmN0aW9uIENhbnZhc0ZlYXR1cmUoZ2VvanNvbiwgaWQpIHtcbiAgICBcbiAgICAvLyByYWRpdXMgZm9yIHBvaW50IGZlYXR1cmVzXG4gICAgLy8gdXNlIHRvIGNhbGN1bGF0ZSBtb3VzZSBvdmVyL291dCBhbmQgY2xpY2sgZXZlbnRzIGZvciBwb2ludHNcbiAgICAvLyB0aGlzIHZhbHVlIHNob3VsZCBtYXRjaCB0aGUgdmFsdWUgdXNlZCBmb3IgcmVuZGVyaW5nIHBvaW50c1xuICAgIHRoaXMuc2l6ZSA9IDU7XG4gICAgdGhpcy5pc1BvaW50ID0gZmFsc2U7XG5cbiAgICAvLyBVc2VyIHNwYWNlIG9iamVjdCBmb3Igc3RvcmUgdmFyaWFibGVzIHVzZWQgZm9yIHJlbmRlcmluZyBnZW9tZXRyeVxuICAgIHRoaXMucmVuZGVyID0ge307XG5cbiAgICB2YXIgY2FjaGUgPSB7XG4gICAgICAgIC8vIHByb2plY3RlZCBwb2ludHMgb24gY2FudmFzXG4gICAgICAgIGNhbnZhc1hZIDogbnVsbCxcbiAgICAgICAgLy8gem9vbSBsZXZlbCBjYW52YXNYWSBwb2ludHMgYXJlIGNhbGN1bGF0ZWQgdG9cbiAgICAgICAgem9vbSA6IC0xXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmlkID09PSBudWxsIHx8IHRoaXMuaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5pZCA9IGdlb2pzb24uaWRcbiAgICB9XG4gICAgXG4gICAgLy8gcGVyZm9ybWFuY2UgZmxhZywgd2lsbCBrZWVwIGludmlzaWJsZSBmZWF0dXJlcyBmb3IgcmVjYWxjIFxuICAgIC8vIGV2ZW50cyBhcyB3ZWxsIGFzIG5vdCBiZWluZyByZW5kZXJlZFxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgXG4gICAgLy8gYm91bmRpbmcgYm94IGZvciBnZW9tZXRyeSwgdXNlZCBmb3IgaW50ZXJzZWN0aW9uIGFuZFxuICAgIC8vIHZpc2libGlsaXR5IG9wdGltaXphdGlvbnNcbiAgICB0aGlzLmJvdW5kcyA9IG51bGw7XG4gICAgXG4gICAgLy8gTGVhZmxldCBMYXRMbmcsIHVzZWQgZm9yIHBvaW50cyB0byBxdWlja2x5IGxvb2sgZm9yIGludGVyc2VjdGlvblxuICAgIHRoaXMubGF0bG5nID0gbnVsbDtcbiAgICBcbiAgICAvLyBjbGVhciB0aGUgY2FudmFzWFkgc3RvcmVkIHZhbHVlc1xuICAgIHRoaXMuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkZWxldGUgY2FjaGUuY2FudmFzWFk7XG4gICAgICAgIGNhY2hlLnpvb20gPSAtMTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5zZXRDYW52YXNYWSA9IGZ1bmN0aW9uKGNhbnZhc1hZLCB6b29tLCBsYXllcikge1xuICAgICAgICBjYWNoZS5jYW52YXNYWSA9IGNhbnZhc1hZO1xuICAgICAgICBjYWNoZS56b29tID0gem9vbTtcblxuICAgICAgICBpZiggdGhpcy5pc1BvaW50ICkgdGhpcy51cGRhdGVQb2ludEluUlRyZWUobGF5ZXIpO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLmdldENhbnZhc1hZID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjYWNoZS5jYW52YXNYWTtcbiAgICB9XG4gICAgXG4gICAgdGhpcy5yZXF1aXJlc1JlcHJvamVjdGlvbiA9IGZ1bmN0aW9uKHpvb20pIHtcbiAgICAgIGlmKCBjYWNoZS56b29tID09IHpvb20gJiYgY2FjaGUuY2FudmFzWFkgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMudXBkYXRlUG9pbnRJblJUcmVlID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICAgICAgdmFyIGNvb3JkcyA9IHRoaXMuZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgdmFyIGRwcCA9IGxheWVyLmdldERlZ3JlZXNQZXJQeChbY29vcmRzWzFdLCBjb29yZHNbMF1dKTtcblxuICAgICAgICBpZiggdGhpcy5fcnRyZWVHZW9qc29uICkge1xuICAgICAgICAgICAgdmFyIHJUcmVlQ29vcmRzID0gdGhpcy5fcnRyZWVHZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IGxheWVyLnJUcmVlLnJlbW92ZShcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHggOiByVHJlZUNvb3Jkc1swXVswXVswXSAtIDEsXG4gICAgICAgICAgICAgICAgICAgIHkgOiByVHJlZUNvb3Jkc1swXVsxXVsxXSAtIDEsXG4gICAgICAgICAgICAgICAgICAgIHcgOiBNYXRoLmFicyhyVHJlZUNvb3Jkc1swXVswXVswXSAtIHJUcmVlQ29vcmRzWzBdWzFdWzBdKSArIDIsXG4gICAgICAgICAgICAgICAgICAgIGggOiBNYXRoLmFicyhyVHJlZUNvb3Jkc1swXVsxXVsxXSAtIHJUcmVlQ29vcmRzWzBdWzJdWzFdKSArIDJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRoaXMuX3J0cmVlR2VvanNvblxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmKCByZXN1bHQubGVuZ3RoID09PSAwICkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignVW5hYmxlIHRvIGZpbmQ6ICcrdGhpcy5fcnRyZWVHZW9qc29uLmdlb21ldHJ5LnByb3BlcnRpZXMuaWQrJyBpbiByVHJlZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocmVzdWx0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvZmZzZXQgPSBkcHAgKiAodGhpcy5zaXplIC8gMik7XG5cbiAgICAgICAgdmFyIGxlZnQgPSBjb29yZHNbMF0gLSBvZmZzZXQ7XG4gICAgICAgIHZhciB0b3AgPSBjb29yZHNbMV0gKyBvZmZzZXQ7XG4gICAgICAgIHZhciByaWdodCA9IGNvb3Jkc1swXSArIG9mZnNldDtcbiAgICAgICAgdmFyIGJvdHRvbSA9IGNvb3Jkc1sxXSAtIG9mZnNldDtcblxuICAgICAgICB0aGlzLl9ydHJlZUdlb2pzb24gPSB7XG4gICAgICAgICAgICB0eXBlIDogJ0ZlYXR1cmUnLFxuICAgICAgICAgICAgZ2VvbWV0cnkgOiB7XG4gICAgICAgICAgICAgICAgdHlwZSA6ICdQb2x5Z29uJyxcbiAgICAgICAgICAgICAgICBjb29yZGluYXRlcyA6IFtbXG4gICAgICAgICAgICAgICAgICAgIFtsZWZ0LCB0b3BdLFxuICAgICAgICAgICAgICAgICAgICBbcmlnaHQsIHRvcF0sXG4gICAgICAgICAgICAgICAgICAgIFtyaWdodCwgYm90dG9tXSxcbiAgICAgICAgICAgICAgICAgICAgW2xlZnQsIGJvdHRvbV0sXG4gICAgICAgICAgICAgICAgICAgIFtsZWZ0LCB0b3BdXG4gICAgICAgICAgICAgICAgXV1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9wZXJ0aWVzIDoge1xuICAgICAgICAgICAgICAgIGlkIDogdGhpcy5pZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGF5ZXIuclRyZWUuZ2VvSlNPTih0aGlzLl9ydHJlZUdlb2pzb24pO1xuICAgIH1cblxuICAgIC8vIG9wdGlvbmFsLCBwZXIgZmVhdHVyZSwgcmVuZGVyZXJcbiAgICB0aGlzLnJlbmRlcmVyID0gbnVsbDtcblxuICAgIC8vIGdlb2pzb24gd2FzIG9wdGlvbnMgb2JqZWN0XG4gICAgaWYoIGdlb2pzb24uZ2VvanNvbiApIHtcbiAgICAgICAgdGhpcy5yZW5kZXJlciA9IGdlb2pzb24ucmVuZGVyZXI7XG4gICAgICAgIGlmKCBnZW9qc29uLnNpemUgKSB0aGlzLnNpemUgPSBnZW9qc29uLnNpemU7XG4gICAgICAgIGdlb2pzb24gPSBnZW9qc29uLmdlb2pzb247XG4gICAgfVxuICAgIFxuICAgIGlmKCBnZW9qc29uLmdlb21ldHJ5ICkge1xuICAgICAgICB0aGlzLmdlb2pzb24gPSBnZW9qc29uO1xuICAgICAgICBpZiAodGhpcy5pZCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5nZW9qc29uID0ge1xuICAgICAgICAgICAgdHlwZSA6ICdGZWF0dXJlJyxcbiAgICAgICAgICAgIGdlb21ldHJ5IDogZ2VvanNvbixcbiAgICAgICAgICAgIHByb3BlcnRpZXMgOiB7XG4gICAgICAgICAgICAgICAgaWQgOiB0aGlzLmlkXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pZCA9IGlkO1xuICAgIH1cblxuICAgIC8vIHBvaW50cyBoYXZlIHRvIGJlIHJlcHJvamVjdGVkIHcvIGJ1ZmZlciBhZnRlciB6b29tXG4gICAgaWYoIHRoaXMuZ2VvanNvbi5nZW9tZXRyeS50eXBlID09PSAnUG9pbnQnICkge1xuICAgICAgICB0aGlzLmlzUG9pbnQgPSB0cnVlOyBcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9ydHJlZUdlb2pzb24gPSB7XG4gICAgICAgICAgICB0eXBlIDogJ0ZlYXR1cmUnLFxuICAgICAgICAgICAgZ2VvbWV0cnkgOiB0aGlzLmdlb2pzb24uZ2VvbWV0cnksXG4gICAgICAgICAgICBwcm9wZXJ0aWVzIDoge1xuICAgICAgICAgICAgICAgIGlkIDogdGhpcy5pZCB8fCB0aGlzLmdlb2pzb24ucHJvcGVydGllcy5pZFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gdGhpcy5nZW9qc29uLmdlb21ldHJ5LnR5cGU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRmVhdHVyZTsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZScpO1xuXG5mdW5jdGlvbiBDYW52YXNGZWF0dXJlcyhnZW9qc29uKSB7XG4gICAgLy8gcXVpY2sgdHlwZSBmbGFnXG4gICAgdGhpcy5pc0NhbnZhc0ZlYXR1cmVzID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzID0gW107XG4gICAgXG4gICAgLy8gYWN0dWFsIGdlb2pzb24gb2JqZWN0LCB3aWxsIG5vdCBiZSBtb2RpZmVkLCBqdXN0IHN0b3JlZFxuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgXG4gICAgLy8gcGVyZm9ybWFuY2UgZmxhZywgd2lsbCBrZWVwIGludmlzaWJsZSBmZWF0dXJlcyBmb3IgcmVjYWxjIFxuICAgIC8vIGV2ZW50cyBhcyB3ZWxsIGFzIG5vdCBiZWluZyByZW5kZXJlZFxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgXG4gICAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5jYW52YXNGZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzRmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCB0aGlzLmdlb2pzb24gKSB7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9qc29uLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoIXRoaXMuZ2VvanNvbi5mZWF0dXJlc1tpXS5oYXNPd25Qcm9wZXJ0eSgnaWQnKSB8fCB0aGlzLmdlb2pzb24uZmVhdHVyZXNbaV0uaWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgdGhpcy5nZW9qc29uLmZlYXR1cmVzW2ldLmlkID0gaTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5jYW52YXNGZWF0dXJlcy5wdXNoKG5ldyBDYW52YXNGZWF0dXJlKHRoaXMuZ2VvanNvbi5mZWF0dXJlc1tpXSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0ZlYXR1cmVzOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmVzJyk7XG5cbmZ1bmN0aW9uIGZhY3RvcnkoYXJnKSB7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoYXJnKSApIHtcbiAgICAgICAgcmV0dXJuIGFyZy5tYXAoZ2VuZXJhdGUpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZ2VuZXJhdGUoYXJnKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGUoZ2VvanNvbikge1xuICAgIGlmKCBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicgKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzRmVhdHVyZXMoZ2VvanNvbik7XG4gICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09PSAnRmVhdHVyZScgKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzRmVhdHVyZShnZW9qc29uKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBHZW9KU09OOiAnK2dlb2pzb24udHlwZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTsiLCJ2YXIgY3R4O1xuXG4vKipcbiAqIEZ1Y3Rpb24gY2FsbGVkIGluIHNjb3BlIG9mIENhbnZhc0ZlYXR1cmVcbiAqL1xuZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQsIHh5UG9pbnRzLCBtYXAsIGNhbnZhc0ZlYXR1cmUpIHtcbiAgICBjdHggPSBjb250ZXh0O1xuICAgIFxuICAgIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdQb2ludCcgKSB7XG4gICAgICAgIHJlbmRlclBvaW50KHh5UG9pbnRzLCB0aGlzLnNpemUpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnTGluZVN0cmluZycgKSB7XG4gICAgICAgIHJlbmRlckxpbmUoeHlQb2ludHMpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnUG9seWdvbicgKSB7XG4gICAgICAgIHJlbmRlclBvbHlnb24oeHlQb2ludHMpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgeHlQb2ludHMuZm9yRWFjaChyZW5kZXJQb2x5Z29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBvaW50KHh5UG9pbnQsIHNpemUpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICBjdHguYXJjKHh5UG9pbnQueCwgeHlQb2ludC55LCBzaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAgJ3JnYmEoMCwgMCwgMCwgLjMpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxpbmUoeHlQb2ludHMpIHtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJztcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwgMCwgMCwgLjMpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcblxuICAgIHZhciBqO1xuICAgIGN0eC5tb3ZlVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG4gICAgZm9yKCBqID0gMTsgaiA8IHh5UG9pbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjdHgubGluZVRvKHh5UG9pbnRzW2pdLngsIHh5UG9pbnRzW2pdLnkpO1xuICAgIH1cblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQb2x5Z29uKHh5UG9pbnRzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwgMTUyLCAwLC44KSc7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG5cbiAgICB2YXIgajtcbiAgICBjdHgubW92ZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuICAgIGZvciggaiA9IDE7IGogPCB4eVBvaW50cy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgY3R4LmxpbmVUbyh4eVBvaW50c1tqXS54LCB4eVBvaW50c1tqXS55KTtcbiAgICB9XG4gICAgY3R4LmxpbmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlcjsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcblxuZnVuY3Rpb24gQ2FudmFzTGF5ZXIoKSB7XG4gIC8vIHNob3cgbGF5ZXIgdGltaW5nXG4gIHRoaXMuZGVidWcgPSBmYWxzZTtcblxuICAvLyBpbmNsdWRlIGV2ZW50c1xuICB0aGlzLmluY2x1ZGVzID0gW0wuTWl4aW4uRXZlbnRzXTtcblxuICAvLyBnZW9tZXRyeSBoZWxwZXJzXG4gIHRoaXMudXRpbHMgPSByZXF1aXJlKCcuL2xpYi91dGlscycpO1xuXG4gIC8vIHJlY29tbWVuZGVkIHlvdSBvdmVycmlkZSB0aGlzLiAgeW91IGNhbiBhbHNvIHNldCBhIGN1c3RvbSByZW5kZXJlclxuICAvLyBmb3IgZWFjaCBDYW52YXNGZWF0dXJlIGlmIHlvdSB3aXNoXG4gIHRoaXMucmVuZGVyZXIgPSByZXF1aXJlKCcuL2RlZmF1bHRSZW5kZXJlcicpO1xuXG4gIHRoaXMuZ2V0Q2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhbnZhcztcbiAgfTtcblxuICB0aGlzLmRyYXcgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH07XG5cbiAgdGhpcy5hZGRUbyA9IGZ1bmN0aW9uIChtYXApIHtcbiAgICBtYXAuYWRkTGF5ZXIodGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdGhpcy5yZXNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyByZXNldCBhY3R1YWwgY2FudmFzIHNpemVcbiAgICB2YXIgc2l6ZSA9IHRoaXMuX21hcC5nZXRTaXplKCk7XG4gICAgdGhpcy5fY2FudmFzLndpZHRoID0gc2l6ZS54O1xuICAgIHRoaXMuX2NhbnZhcy5oZWlnaHQgPSBzaXplLnk7XG4gIH07XG5cbiAgLy8gY2xlYXIgY2FudmFzXG4gIHRoaXMuY2xlYXJDYW52YXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2FudmFzID0gdGhpcy5nZXRDYW52YXMoKTtcbiAgICB2YXIgY3R4ID0gdGhpcy5fY3R4O1xuXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgLy8gbWFrZSBzdXJlIHRoaXMgaXMgY2FsbGVkIGFmdGVyLi4uXG4gICAgdGhpcy5yZXBvc2l0aW9uKCk7XG4gIH1cblxuICB0aGlzLnJlcG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9wTGVmdCA9IHRoaXMuX21hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS50b3AgPSB0b3BMZWZ0LnkrJ3B4JztcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUubGVmdCA9IHRvcExlZnQueCsncHgnO1xuICAgIC8vTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2NhbnZhcywgdG9wTGVmdCk7XG4gIH1cblxuICAvLyBjbGVhciBlYWNoIGZlYXR1cmVzIGNhY2hlXG4gIHRoaXMuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGtpbGwgdGhlIGZlYXR1cmUgcG9pbnQgY2FjaGVcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmZlYXR1cmVzW2ldLmNsZWFyQ2FjaGUoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gZ2V0IGxheWVyIGZlYXR1cmUgdmlhIGdlb2pzb24gb2JqZWN0XG4gIHRoaXMuZ2V0Q2FudmFzRmVhdHVyZUJ5SWQgPSBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiB0aGlzLmZlYXR1cmVJbmRleFtpZF07XG4gIH1cblxuICAvLyBnZXQgdGhlIG1ldGVycyBwZXIgcHggYW5kIGEgY2VydGFpbiBwb2ludDtcbiAgdGhpcy5nZXRNZXRlcnNQZXJQeCA9IGZ1bmN0aW9uKGxhdGxuZykge1xuICAgIHJldHVybiB0aGlzLnV0aWxzLm1ldGVyc1BlclB4KGxhdGxuZywgdGhpcy5fbWFwKTtcbiAgfVxuXG4gIHRoaXMuZ2V0RGVncmVlc1BlclB4ID0gZnVuY3Rpb24obGF0bG5nKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZGVncmVlc1BlclB4KGxhdGxuZywgdGhpcy5fbWFwKTtcbiAgfVxufTtcblxudmFyIGxheWVyID0gbmV3IENhbnZhc0xheWVyKCk7XG5cblxucmVxdWlyZSgnLi9saWIvaW5pdCcpKGxheWVyKTtcbnJlcXVpcmUoJy4vbGliL3JlZHJhdycpKGxheWVyKTtcbnJlcXVpcmUoJy4vbGliL2FkZEZlYXR1cmUnKShsYXllcik7XG5yZXF1aXJlKCcuL2xpYi90b0NhbnZhc1hZJykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvY29udHJvbHMnKShsYXllcik7XG5cbkwuQ2FudmFzRmVhdHVyZUZhY3RvcnkgPSByZXF1aXJlKCcuL2NsYXNzZXMvZmFjdG9yeScpO1xuTC5DYW52YXNGZWF0dXJlID0gQ2FudmFzRmVhdHVyZTtcbkwuQ2FudmFzRmVhdHVyZUNvbGxlY3Rpb24gPSBDYW52YXNGZWF0dXJlcztcbkwuQ2FudmFzR2VvanNvbkxheWVyID0gTC5DbGFzcy5leHRlbmQobGF5ZXIpO1xuIiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4uL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICBsYXllci5hZGRDYW52YXNGZWF0dXJlcyA9IGZ1bmN0aW9uKGZlYXR1cmVzKSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5jYW52YXNGZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcblxuICAgICAgaWYgKGZlYXR1cmVzLmNhbnZhc0ZlYXR1cmVzW2ldLmlkID09PSB1bmRlZmluZWQgfHwgZmVhdHVyZXMuY2FudmFzRmVhdHVyZXNbaV0uaWQgPT09IG51bGwpIHtcbiAgICAgICAgZmVhdHVyZXMuY2FudmFzRmVhdHVyZXNbaV0uaWQgPSBpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFkZENhbnZhc0ZlYXR1cmUoZmVhdHVyZXMuY2FudmFzRmVhdHVyZXNbaV0sIGZhbHNlLCBudWxsLCBmYWxzZSk7XG4gICAgfVxuXG4gICAgdGhpcy5yZWJ1aWxkSW5kZXgodGhpcy5mZWF0dXJlcyk7XG4gIH07XG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZSA9IGZ1bmN0aW9uKGZlYXR1cmUsIGJvdHRvbSwgY2FsbGJhY2spIHtcbiAgICBpZiggIShmZWF0dXJlIGluc3RhbmNlb2YgQ2FudmFzRmVhdHVyZSkgJiYgIShmZWF0dXJlIGluc3RhbmNlb2YgQ2FudmFzRmVhdHVyZXMpICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdGZWF0dXJlIG11c3QgYmUgaW5zdGFuY2Ugb2YgQ2FudmFzRmVhdHVyZSBvciBDYW52YXNGZWF0dXJlcycpO1xuICAgIH1cblxuICAgIGlmKCBib3R0b20gKSB7IC8vIGJvdHRvbSBvciBpbmRleFxuICAgICAgaWYoIHR5cGVvZiBib3R0b20gPT09ICdudW1iZXInKSB0aGlzLmZlYXR1cmVzLnNwbGljZShib3R0b20sIDAsIGZlYXR1cmUpO1xuICAgICAgZWxzZSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmVhdHVyZXMucHVzaChmZWF0dXJlKTtcbiAgICB9XG5cbiAgICB0aGlzLmZlYXR1cmVJbmRleFtmZWF0dXJlLmlkXSA9IGZlYXR1cmU7XG5cbiAgICB0aGlzLmFkZFRvSW5kZXgoZmVhdHVyZSk7XG5cbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmZlYXR1cmVzW2ldLm9yZGVyID0gaTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHJlLXJlbmRlciByZXF1aXJlZC4gIGllIHRoZSBmZWF0dXJlIHdhcyB2aXNpYmxlO1xuICBsYXllci5yZW1vdmVDYW52YXNGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZmVhdHVyZXMuaW5kZXhPZihmZWF0dXJlKTtcbiAgICBpZiggaW5kZXggPT0gLTEgKSByZXR1cm47XG5cbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICB0aGlzLnJlYnVpbGRJbmRleCh0aGlzLmZlYXR1cmVzKTtcblxuICAgIGlmKCB0aGlzLmZlYXR1cmUudmlzaWJsZSApIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbiAgXG4gIGxheWVyLnJlbW92ZUFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgPSB0cnVlO1xuICAgIHRoaXMuZmVhdHVyZXMgPSBbXTtcbiAgICB0aGlzLnJlYnVpbGRJbmRleCh0aGlzLmZlYXR1cmVzKTtcbiAgfVxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgICBsYXllci5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICAgICAgICB0aGlzLmZlYXR1cmVJbmRleCA9IHt9O1xuICAgICAgICB0aGlzLmludGVyc2VjdExpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5yZWJ1aWxkSW5kZXgoW10pO1xuICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfVxuICAgIFxuICAgIGxheWVyLmhpZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5fY2FudmFzLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIHRoaXMuc2hvd2luZyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBsYXllci5zaG93ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX2NhbnZhcy5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgdGhpcy5zaG93aW5nID0gdHJ1ZTtcbiAgICAgICAgaWYoIHRoaXMuX21hcCApIHRoaXMucmVkcmF3KCk7XG4gICAgfTtcblxuXG4gICAgbGF5ZXIuc2V0WkluZGV4ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdGhpcy56SW5kZXggPSBpbmRleDtcbiAgICAgICAgaWYoIHRoaXMuX2NvbnRhaW5lciApIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbnRhaW5lci5zdHlsZS56SW5kZXggPSBpbmRleDtcbiAgICAgICAgfVxuICAgIH07XG59IiwidmFyIGludGVyc2VjdFV0aWxzID0gcmVxdWlyZSgnLi9pbnRlcnNlY3RzJyk7XG52YXIgUlRyZWUgPSByZXF1aXJlKCdydHJlZScpO1xudmFyIGNvdW50ID0gMDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuXG4gICAgbGF5ZXIuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgLy8gbGlzdCBvZiBnZW9qc29uIGZlYXR1cmVzIHRvIGRyYXdcbiAgICAgICAgLy8gICAtIHRoZXNlIHdpbGwgZHJhdyBpbiBvcmRlclxuICAgICAgICB0aGlzLmZlYXR1cmVzID0gW107XG4gICAgICAgIC8vIGxvb2t1cCBpbmRleFxuICAgICAgICB0aGlzLmZlYXR1cmVJbmRleCA9IHt9O1xuXG4gICAgICAgIC8vIGxpc3Qgb2YgY3VycmVudCBmZWF0dXJlcyB1bmRlciB0aGUgbW91c2VcbiAgICAgICAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gW107XG5cbiAgICAgICAgLy8gdXNlZCB0byBjYWxjdWxhdGUgcGl4ZWxzIG1vdmVkIGZyb20gY2VudGVyXG4gICAgICAgIHRoaXMubGFzdENlbnRlckxMID0gbnVsbDtcblxuICAgICAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgICAgICAgLy8gVE9ETzogbWFrZSB0aGlzIHdvcmtcbiAgICAgICAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IGZhbHNlO1xuXG4gICAgICAgIC8vIHNldCBvcHRpb25zXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBMLlV0aWwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcblxuICAgICAgICAvLyBtb3ZlIG1vdXNlIGV2ZW50IGhhbmRsZXJzIHRvIGxheWVyIHNjb3BlXG4gICAgICAgIHZhciBtb3VzZUV2ZW50cyA9IFsnb25Nb3VzZU92ZXInLCAnb25Nb3VzZU1vdmUnLCAnb25Nb3VzZU91dCcsICdvbkNsaWNrJ107XG4gICAgICAgIG1vdXNlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBpZiggIXRoaXMub3B0aW9uc1tlXSApIHJldHVybjtcbiAgICAgICAgICAgIHRoaXNbZV0gPSB0aGlzLm9wdGlvbnNbZV07XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5vcHRpb25zW2VdO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuclRyZWUgPSBuZXcgUlRyZWUoKTtcblxuICAgICAgICAvLyBzZXQgY2FudmFzIGFuZCBjYW52YXMgY29udGV4dCBzaG9ydGN1dHNcbiAgICAgICAgdGhpcy5fY2FudmFzID0gY3JlYXRlQ2FudmFzKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLl9jdHggPSB0aGlzLl9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICB0aGlzLnNob3coKTtcbiAgICB9O1xuXG4gICAgaW50ZXJzZWN0VXRpbHMobGF5ZXIpO1xuXG4gICAgbGF5ZXIub25BZGQgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgdGhpcy5fbWFwID0gbWFwO1xuXG4gICAgICAgIC8vIGFkZCBjb250YWluZXIgd2l0aCB0aGUgY2FudmFzIHRvIHRoZSB0aWxlIHBhbmVcbiAgICAgICAgLy8gdGhlIGNvbnRhaW5lciBpcyBtb3ZlZCBpbiB0aGUgb3Bvc2l0ZSBkaXJlY3Rpb24gb2YgdGhlXG4gICAgICAgIC8vIG1hcCBwYW5lIHRvIGtlZXAgdGhlIGNhbnZhcyBhbHdheXMgaW4gKDAsIDApXG4gICAgICAgIC8vdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy50aWxlUGFuZTtcbiAgICAgICAgdmFyIHRpbGVQYW5lID0gdGhpcy5fbWFwLl9wYW5lcy5tYXJrZXJQYW5lO1xuICAgICAgICB2YXIgX2NvbnRhaW5lciA9IEwuRG9tVXRpbC5jcmVhdGUoJ2RpdicsICdsZWFmbGV0LWxheWVyLScrY291bnQpO1xuICAgICAgICBjb3VudCsrO1xuXG4gICAgICAgIF9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fY2FudmFzKTtcbiAgICAgICAgdGlsZVBhbmUuYXBwZW5kQ2hpbGQoX2NvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5fY29udGFpbmVyID0gX2NvbnRhaW5lcjtcblxuICAgICAgICAvLyBoYWNrOiBsaXN0ZW4gdG8gcHJlZHJhZyBldmVudCBsYXVuY2hlZCBieSBkcmFnZ2luZyB0b1xuICAgICAgICAvLyBzZXQgY29udGFpbmVyIGluIHBvc2l0aW9uICgwLCAwKSBpbiBzY3JlZW4gY29vcmRpbmF0ZXNcbiAgICAgICAgLy8gaWYgKG1hcC5kcmFnZ2luZy5lbmFibGVkKCkpIHtcbiAgICAgICAgLy8gICAgIG1hcC5kcmFnZ2luZy5fZHJhZ2dhYmxlLm9uKCdwcmVkcmFnJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vICAgICAgICAgdmFyIGQgPSBtYXAuZHJhZ2dpbmcuX2RyYWdnYWJsZTtcbiAgICAgICAgLy8gICAgICAgICBMLkRvbVV0aWwuc2V0UG9zaXRpb24odGhpcy5fY2FudmFzLCB7IHg6IC1kLl9uZXdQb3MueCwgeTogLWQuX25ld1Bvcy55IH0pO1xuICAgICAgICAvLyAgICAgfSwgdGhpcyk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBtYXAub24oe1xuICAgICAgICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLm9uUmVzaXplLFxuICAgICAgICAgICAgJ3Jlc2l6ZScgICAgOiB0aGlzLm9uUmVzaXplLFxuICAgICAgICAgICAgJ3pvb21zdGFydCcgOiBzdGFydFpvb20sXG4gICAgICAgICAgICAnem9vbWVuZCcgICA6IGVuZFpvb20sXG4gICAgICAgIC8vICAgICdtb3Zlc3RhcnQnIDogbW92ZVN0YXJ0LFxuICAgICAgICAgICAgJ21vdmVlbmQnICAgOiBtb3ZlRW5kLFxuICAgICAgICAgICAgJ21vdmUnICAgICAgOiB0aGlzLnJlbmRlcixcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogdGhpcy5pbnRlcnNlY3RzLFxuICAgICAgICAgICAgJ2NsaWNrJyAgICAgOiB0aGlzLmludGVyc2VjdHNcbiAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG5cbiAgICAgICAgaWYoIHRoaXMuekluZGV4ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICB0aGlzLnNldFpJbmRleCh0aGlzLnpJbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9yZS1kaXNwbGF5IGxheWVyIGlmIGl0J3MgYmVlbiByZW1vdmVkIGFuZCB0aGVuIHJlLWFkZGVkXG4gICAgICAgIGlmICh0aGlzLl9oYXNCZWVuUmVtb3ZlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2hhc0JlZW5SZW1vdmVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsYXllci5vblJlbW92ZSA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgICBtYXAub2ZmKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5vblJlc2l6ZSxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5vblJlc2l6ZSxcbiAgICAgICAgIC8vICAgJ21vdmVzdGFydCcgOiBtb3ZlU3RhcnQsXG4gICAgICAgICAgICAnbW92ZWVuZCcgICA6IG1vdmVFbmQsXG4gICAgICAgICAgICAnbW92ZScgICAgICA6IHRoaXMucmVuZGVyLFxuICAgICAgICAgICAgJ3pvb21zdGFydCcgOiBzdGFydFpvb20sXG4gICAgICAgICAgICAnem9vbWVuZCcgICA6IGVuZFpvb20sXG4gICAgICAgICAgICAnbW91c2Vtb3ZlJyA6IHRoaXMuaW50ZXJzZWN0cyxcbiAgICAgICAgICAgICdjbGljaycgICAgIDogdGhpcy5pbnRlcnNlY3RzXG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX2hhc0JlZW5SZW1vdmVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBsYXllci5yZXNpemVUaW1lciA9IC0xO1xuICAgIGxheWVyLm9uUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmKCB0aGlzLnJlc2l6ZVRpbWVyICE9PSAtMSApIGNsZWFyVGltZW91dCh0aGlzLnJlc2l6ZVRpbWVyKTtcbiAgICAgICAgdmFyIHJlZiA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5yZXNpemVUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJlZi5yZXNpemVUaW1lciA9IC0xO1xuICAgICAgICAgICAgcmVmLnJlc2V0KCk7XG4gICAgICAgICAgICByZWYuY2xlYXJDYWNoZSgpO1xuICAgICAgICAgICAgcmVmLnJlbmRlcigpO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2FudmFzKG9wdGlvbnMpIHtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICBjYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICBjYW52YXMuc3R5bGUubGVmdCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLnBvaW50ZXJFdmVudHMgPSBcIm5vbmVcIjtcbiAgICBjYW52YXMuc3R5bGUuekluZGV4ID0gb3B0aW9ucy56SW5kZXggfHwgMDtcbiAgICB2YXIgY2xhc3NOYW1lID0gJ2xlYWZsZXQtdGlsZS1jb250YWluZXIgbGVhZmxldC16b29tLWFuaW1hdGVkJztcbiAgICBjYW52YXMuc2V0QXR0cmlidXRlKCdjbGFzcycsIGNsYXNzTmFtZSk7XG4gICAgcmV0dXJuIGNhbnZhcztcbn1cblxuZnVuY3Rpb24gc3RhcnRab29tKCkge1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XG4gICAgdGhpcy56b29taW5nID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZW5kWm9vbSgpIHtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICB0aGlzLnpvb21pbmcgPSBmYWxzZTtcbiAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICBzZXRUaW1lb3V0KHRoaXMucmVuZGVyLmJpbmQodGhpcyksIDUwKTtcbn1cblxuZnVuY3Rpb24gbW92ZVN0YXJ0KCkge1xuICAgIGlmKCB0aGlzLm1vdmluZyApIHJldHVybjtcbiAgICB0aGlzLm1vdmluZyA9IHRydWU7XG5cbiAgICAvL2lmKCAhdGhpcy5hbGxvd1BhblJlbmRlcmluZyApIHJldHVybjtcbiAgICByZXR1cm47XG4gICAgLy8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbn1cblxuZnVuY3Rpb24gbW92ZUVuZChlKSB7XG4gICAgdGhpcy5tb3ZpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcihlKTtcbn07XG5cbmZ1bmN0aW9uIGZyYW1lUmVuZGVyKCkge1xuICAgIGlmKCAhdGhpcy5tb3ZpbmcgKSByZXR1cm47XG5cbiAgICB2YXIgdCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG5cbiAgICBpZiggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0ID4gNzUgKSB7XG4gICAgICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2FibGVkIHJlbmRlcmluZyB3aGlsZSBwYW5pbmcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoICF0aGlzLm1vdmluZyApIHJldHVybjtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcyksIDc1MCk7XG59XG4iLCJ2YXIgUlRyZWUgPSByZXF1aXJlKCdydHJlZScpO1xuXG5cbi8qKlxuICogSGFuZGxlIG1vdXNlIGludGVyc2VjdGlvbiBldmVudHNcbiAqIGUgLSBsZWFmbGV0IGV2ZW50XG4gKiovXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGUpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIHZhciBkcHAgPSB0aGlzLmdldERlZ3JlZXNQZXJQeChlLmxhdGxuZyk7XG5cbiAgICB2YXIgbXBwID0gdGhpcy5nZXRNZXRlcnNQZXJQeChlLmxhdGxuZyk7XG4gICAgdmFyIHIgPSBtcHAgKiA1OyAvLyA1IHB4IHJhZGl1cyBidWZmZXI7XG5cbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgdHlwZSA6ICdQb2ludCcsXG4gICAgICBjb29yZGluYXRlcyA6IFtlLmxhdGxuZy5sbmcsIGUubGF0bG5nLmxhdF1cbiAgICB9O1xuXG4gICAgdmFyIGNvbnRhaW5lclBvaW50ID0gZS5jb250YWluZXJQb2ludDtcblxuICAgIHZhciB4MSA9IGUubGF0bG5nLmxuZyAtIGRwcDtcbiAgICB2YXIgeDIgPSBlLmxhdGxuZy5sbmcgKyBkcHA7XG4gICAgdmFyIHkxID0gZS5sYXRsbmcubGF0IC0gZHBwO1xuICAgIHZhciB5MiA9IGUubGF0bG5nLmxhdCArIGRwcDtcblxuICAgIHZhciBpbnRlcnNlY3RzID0gdGhpcy5pbnRlcnNlY3RzQmJveChbW3gxLCB5MV0sIFt4MiwgeTJdXSwgciwgY2VudGVyLCBjb250YWluZXJQb2ludCk7XG5cbiAgICBvbkludGVyc2VjdHNMaXN0Q3JlYXRlZC5jYWxsKHRoaXMsIGUsIGludGVyc2VjdHMpO1xufVxuXG5mdW5jdGlvbiBpbnRlcnNlY3RzQmJveChiYm94LCBwcmVjaXNpb24sIGNlbnRlciwgY29udGFpbmVyUG9pbnQpIHtcbiAgICB2YXIgY2xGZWF0dXJlcyA9IFtdO1xuICAgIHZhciBmZWF0dXJlcyA9IHRoaXMuclRyZWUuYmJveChiYm94KTtcbiAgICB2YXIgaSwgZiwgY2xGZWF0dXJlO1xuXG4gICAgZm9yKCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgY2xGZWF0dXJlID0gdGhpcy5nZXRDYW52YXNGZWF0dXJlQnlJZChmZWF0dXJlc1tpXS5wcm9wZXJ0aWVzLmlkKTtcblxuICAgICAgaWYoICFjbEZlYXR1cmUgKSBjb250aW51ZTtcbiAgICAgIGlmKCAhY2xGZWF0dXJlLnZpc2libGUgKSBjb250aW51ZTtcbiAgICAgIFxuICAgICAgY2xGZWF0dXJlcy5wdXNoKGNsRmVhdHVyZSk7XG4gICAgfVxuXG4gICAgLy8gbm93IG1ha2Ugc3VyZSB0aGlzIGFjdHVhbGx5IG92ZXJsYXAgaWYgcHJlY2lzaW9uIGlzIGdpdmVuXG4gICAgaWYoIHByZWNpc2lvbiApIHtcbiAgICAgIGZvciggdmFyIGkgPSBjbEZlYXR1cmVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tICkge1xuICAgICAgICBmID0gY2xGZWF0dXJlc1tpXTtcbiAgICAgICAgaWYoZiAmJiAhdGhpcy51dGlscy5nZW9tZXRyeVdpdGhpblJhZGl1cyhmLl9ydHJlZUdlb2pzb24uZ2VvbWV0cnksIGYuZ2V0Q2FudmFzWFkoKSwgY2VudGVyLCBjb250YWluZXJQb2ludCwgcHJlY2lzaW9uKSApIHtcbiAgICAgICAgICBjbEZlYXR1cmVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjbEZlYXR1cmVzO1xufVxuXG5mdW5jdGlvbiBvbkludGVyc2VjdHNMaXN0Q3JlYXRlZChlLCBpbnRlcnNlY3RzKSB7XG4gIGlmKCBlLnR5cGUgPT0gJ2NsaWNrJyAmJiB0aGlzLm9uQ2xpY2sgKSB7XG4gICAgdmFyIGxhdGxuZyA9IGUubGF0bG5nO1xuICAgIHRoaXMub25DbGljayhpbnRlcnNlY3RzLCBsYXRsbmcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBtb3VzZW92ZXIgPSBbXSwgbW91c2VvdXQgPSBbXSwgbW91c2Vtb3ZlID0gW107XG5cbiAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrICkge1xuICAgIGlmKCB0aGlzLmludGVyc2VjdExpc3QuaW5kZXhPZihpbnRlcnNlY3RzW2ldKSA+IC0xICkge1xuICAgICAgbW91c2Vtb3ZlLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgbW91c2VvdmVyLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgfVxuICB9XG5cbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmludGVyc2VjdExpc3QubGVuZ3RoOyBpKysgKSB7XG4gICAgaWYoIGludGVyc2VjdHMuaW5kZXhPZih0aGlzLmludGVyc2VjdExpc3RbaV0pID09IC0xICkge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICBtb3VzZW91dC5wdXNoKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gaW50ZXJzZWN0cztcblxuICBpZiggdGhpcy5vbk1vdXNlT3ZlciAmJiBtb3VzZW92ZXIubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU92ZXIuY2FsbCh0aGlzLCBtb3VzZW92ZXIsIGUpO1xuICBpZiggdGhpcy5vbk1vdXNlTW92ZSApIHRoaXMub25Nb3VzZU1vdmUuY2FsbCh0aGlzLCBtb3VzZW1vdmUsIGUpOyAvLyBhbHdheXMgZmlyZVxuICBpZiggdGhpcy5vbk1vdXNlT3V0ICYmIG1vdXNlb3V0Lmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VPdXQuY2FsbCh0aGlzLCBtb3VzZW91dCwgZSk7XG59XG5cbmZ1bmN0aW9uIHJlYnVpbGQoY2xGZWF0dXJlcykge1xuICB2YXIgZmVhdHVyZXMgPSBbXTtcblxuICBmb3IoIHZhciBpID0gMDsgaSA8IGNsRmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgZmVhdHVyZXMucHVzaChjbEZlYXR1cmVzW2ldLl9ydHJlZUdlb2pzb24pO1xuICAgIGNsRmVhdHVyZXNbaV0ub3JkZXIgPSBpO1xuICB9XG5cbiAgdGhpcy5yVHJlZSA9IG5ldyBSVHJlZSgpO1xuICB0aGlzLnJUcmVlLmdlb0pTT04oe1xuICAgIHR5cGUgOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxuICAgIGZlYXR1cmVzIDogZmVhdHVyZXNcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZChjbEZlYXR1cmUpIHtcbiAgaWYoIGNsRmVhdHVyZS5pc1BvaW50ICkge1xuICAgIGNsRmVhdHVyZS51cGRhdGVQb2ludEluUlRyZWUodGhpcyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5yVHJlZS5nZW9KU09OKGNsRmVhdHVyZS5fcnRyZWVHZW9qc29uKTtcbiAgfVxufVxuXG4vLyBUT0RPOiBuZWVkIHRvIHByb3RvdHlwZSB0aGVzZSBmdW5jdGlvbnNcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obGF5ZXIpIHtcbiAgbGF5ZXIuaW50ZXJzZWN0cyA9IGludGVyc2VjdHM7XG4gIGxheWVyLmludGVyc2VjdHNCYm94ID0gaW50ZXJzZWN0c0Jib3g7XG4gIGxheWVyLnJlYnVpbGRJbmRleCA9IHJlYnVpbGQ7XG4gIGxheWVyLmFkZFRvSW5kZXggPSBhZGQ7XG59XG4iLCJ2YXIgcnVubmluZyA9IGZhbHNlO1xudmFyIHJlc2NoZWR1bGUgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGxheWVyKSB7XG4gIGxheWVyLnJlbmRlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIGlmKCAhdGhpcy5hbGxvd1BhblJlbmRlcmluZyAmJiB0aGlzLm1vdmluZyApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiggZSAmJiBlLnR5cGUgPT0gJ21vdmUnICYmICF0aGlzLmFuaW1hdGluZyApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgdCwgZGlmZlxuICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgICB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfVxuXG4gICAgdmFyIGRpZmYgPSBudWxsO1xuICAgICAgICBtYXAgPSB0aGlzLl9tYXAsXG4gICAgICAgIGNlbnRlciA9IG1hcC5nZXRDZW50ZXIoKTtcblxuICAgIGlmKCAoZSAmJiBlLnR5cGUgPT0gJ21vdmVlbmQnKSB8fCAoZSAmJiBlLnR5cGUgPT0gJ21vdmUnICYmIHRoaXMuYW5pbWF0aW5nKSApIHtcbiAgICAgIGlmICh0aGlzLmxhc3RDZW50ZXJMTCA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLmxhc3RDZW50ZXJMTCA9IG1hcC5faW5pdGlhbENlbnRlcjtcbiAgICAgIH1cbiAgICAgIHZhciBwdCA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGNlbnRlcik7XG5cbiAgICAgIGlmKCB0aGlzLmxhc3RDZW50ZXJMTCApIHtcbiAgICAgICAgdmFyIGxhc3RYeSA9IG1hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KHRoaXMubGFzdENlbnRlckxMKTtcbiAgICAgICAgZGlmZiA9IHtcbiAgICAgICAgICB4IDogbGFzdFh5LnggLSBwdC54LFxuICAgICAgICAgIHkgOiBsYXN0WHkueSAtIHB0LnlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB0aGlzLmxhc3RDZW50ZXJMTCA9IGNlbnRlcjtcblxuICAgIGlmKCAhdGhpcy56b29taW5nICkge1xuICAgICAgdGhpcy5yZWRyYXcoZGlmZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcbiAgICB9XG5cbiAgfSxcbiAgICBcblxuICAvLyByZWRyYXcgYWxsIGZlYXR1cmVzLiAgVGhpcyBkb2VzIG5vdCBoYW5kbGUgY2xlYXJpbmcgdGhlIGNhbnZhcyBvciBzZXR0aW5nXG4gIC8vIHRoZSBjYW52YXMgY29ycmVjdCBwb3NpdGlvbi4gIFRoYXQgaXMgaGFuZGxlZCBieSByZW5kZXJcbiAgbGF5ZXIucmVkcmF3ID0gZnVuY3Rpb24oZGlmZikge1xuICAgIGlmKCAhdGhpcy5zaG93aW5nICkgcmV0dXJuO1xuXG4gICAgLy8gb2JqZWN0cyBzaG91bGQga2VlcCB0cmFjayBvZiBsYXN0IGJib3ggYW5kIHpvb20gb2YgbWFwXG4gICAgLy8gaWYgdGhpcyBoYXNuJ3QgY2hhbmdlZCB0aGUgbGwgLT4gY29udGFpbmVyIHB0IGlzIG5vdCBuZWVkZWRcbiAgICB2YXIgYm91bmRzID0gdGhpcy5fbWFwLmdldEJvdW5kcygpO1xuICAgIHZhciB6b29tID0gdGhpcy5fbWFwLmdldFpvb20oKTtcblxuICAgIHZhciBmZWF0dXJlcyA9IHRoaXMuaW50ZXJzZWN0c0Jib3goW1tib3VuZHMuZ2V0V2VzdCgpLCBib3VuZHMuZ2V0U291dGgoKV0sIFtib3VuZHMuZ2V0RWFzdCgpLCBib3VuZHMuZ2V0Tm9ydGgoKV1dLCBudWxsLCBudWxsLCBudWxsKTtcblxuICAgIHZhciBmLCBpLCBzdWJmZWF0dXJlLCBqO1xuICAgIGZvciggaSA9IDA7IGkgPCB0aGlzLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG5cbiAgICAgIGlmKCBmLmlzQ2FudmFzRmVhdHVyZXMgKSB7XG5cbiAgICAgICAgZm9yKCBqID0gMDsgaiA8IGYuY2FudmFzRmVhdHVyZXMubGVuZ3RoOyBqKysgKSB7XG4gICAgICAgICAgdGhpcy5wcmVwYXJlRm9yUmVkcmF3KGYuY2FudmFzRmVhdHVyZXNbal0sIGJvdW5kcywgem9vbSwgZGlmZik7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcmVwYXJlRm9yUmVkcmF3KGYsIGJvdW5kcywgem9vbSwgZGlmZik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZWRyYXdGZWF0dXJlcyhmZWF0dXJlcyk7XG4gIH0sXG5cbiAgbGF5ZXIucmVkcmF3RmVhdHVyZXMgPSBmdW5jdGlvbihmZWF0dXJlcykge1xuICAgIHRoaXMuY2xlYXJDYW52YXMoKTtcblxuXG4gICAgZmVhdHVyZXMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAgIGlmKCBhLm9yZGVyID4gYi5vcmRlciApIHJldHVybiAxO1xuICAgICAgaWYoIGEub3JkZXIgPCBiLm9yZGVyICkgcmV0dXJuIC0xO1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSk7XG4gICAgXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCAhZmVhdHVyZXNbaV0udmlzaWJsZSApIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZWRyYXdGZWF0dXJlKGZlYXR1cmVzW2ldKTtcbiAgICB9XG4gIH1cblxuICBsYXllci5yZWRyYXdGZWF0dXJlID0gZnVuY3Rpb24oY2FudmFzRmVhdHVyZSkge1xuICAgICAgdmFyIHJlbmRlcmVyID0gY2FudmFzRmVhdHVyZS5yZW5kZXJlciA/IGNhbnZhc0ZlYXR1cmUucmVuZGVyZXIgOiB0aGlzLnJlbmRlcmVyO1xuICAgICAgdmFyIHh5ID0gY2FudmFzRmVhdHVyZS5nZXRDYW52YXNYWSgpO1xuXG4gICAgICAvLyBiYWRuZXNzLi4uXG4gICAgICBpZiggIXh5ICkgcmV0dXJuO1xuXG4gICAgICAvLyBjYWxsIGZlYXR1cmUgcmVuZGVyIGZ1bmN0aW9uIGluIGZlYXR1cmUgc2NvcGU7IGZlYXR1cmUgaXMgcGFzc2VkIGFzIHdlbGxcbiAgICAgIHJlbmRlcmVyLmNhbGwoXG4gICAgICAgICAgY2FudmFzRmVhdHVyZSwgLy8gc2NvcGUgKGNhbnZhcyBmZWF0dXJlKVxuICAgICAgICAgIHRoaXMuX2N0eCwgICAgIC8vIGNhbnZhcyAyZCBjb250ZXh0XG4gICAgICAgICAgeHksICAgICAgICAgICAgLy8geHkgcG9pbnRzIHRvIGRyYXdcbiAgICAgICAgICB0aGlzLl9tYXAsICAgICAvLyBsZWFmbGV0IG1hcCBpbnN0YW5jZVxuICAgICAgICAgIGNhbnZhc0ZlYXR1cmUgIC8vIGNhbnZhcyBmZWF0dXJlXG4gICAgICApO1xuICB9XG5cbiAgLy8gcmVkcmF3IGFuIGluZGl2aWR1YWwgZmVhdHVyZVxuICBsYXllci5wcmVwYXJlRm9yUmVkcmF3ID0gZnVuY3Rpb24oY2FudmFzRmVhdHVyZSwgYm91bmRzLCB6b29tLCBkaWZmKSB7XG4gICAgLy9pZiggZmVhdHVyZS5nZW9qc29uLnByb3BlcnRpZXMuZGVidWcgKSBkZWJ1Z2dlcjtcblxuICAgIC8vIGlnbm9yZSBhbnl0aGluZyBmbGFnZ2VkIGFzIGhpZGRlblxuICAgIC8vIHdlIGRvIG5lZWQgdG8gY2xlYXIgdGhlIGNhY2hlIGluIHRoaXMgY2FzZVxuICAgIGlmKCAhY2FudmFzRmVhdHVyZS52aXNpYmxlICkge1xuICAgICAgY2FudmFzRmVhdHVyZS5jbGVhckNhY2hlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGdlb2pzb24gPSBjYW52YXNGZWF0dXJlLmdlb2pzb24uZ2VvbWV0cnk7XG5cbiAgICAvLyBub3cgbGV0cyBjaGVjayBjYWNoZSB0byBzZWUgaWYgd2UgbmVlZCB0byByZXByb2plY3QgdGhlXG4gICAgLy8geHkgY29vcmRpbmF0ZXNcbiAgICAvLyBhY3R1YWxseSBwcm9qZWN0IHRvIHh5IGlmIG5lZWRlZFxuICAgIHZhciByZXByb2plY3QgPSBjYW52YXNGZWF0dXJlLnJlcXVpcmVzUmVwcm9qZWN0aW9uKHpvb20pO1xuICAgIGlmKCByZXByb2plY3QgKSB7XG4gICAgICB0aGlzLnRvQ2FudmFzWFkoY2FudmFzRmVhdHVyZSwgZ2VvanNvbiwgem9vbSk7XG4gICAgfSAgLy8gZW5kIHJlcHJvamVjdFxuXG4gICAgLy8gaWYgdGhpcyB3YXMgYSBzaW1wbGUgcGFuIGV2ZW50IChhIGRpZmYgd2FzIHByb3ZpZGVkKSBhbmQgd2UgZGlkIG5vdCByZXByb2plY3RcbiAgICAvLyBtb3ZlIHRoZSBmZWF0dXJlIGJ5IGRpZmYgeC95XG4gICAgaWYoIGRpZmYgJiYgIXJlcHJvamVjdCApIHtcbiAgICAgIGlmKCBnZW9qc29uLnR5cGUgPT0gJ1BvaW50JyApIHtcblxuICAgICAgICB2YXIgeHkgPSBjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKClcbiAgICAgICAgeHkueCArPSBkaWZmLng7XG4gICAgICAgIHh5LnkgKz0gZGlmZi55O1xuXG4gICAgICB9IGVsc2UgaWYoIGdlb2pzb24udHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCksIGRpZmYpO1xuXG4gICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgXG4gICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoY2FudmFzRmVhdHVyZS5nZXRDYW52YXNYWSgpLCBkaWZmKTtcbiAgICAgIFxuICAgICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09ICdNdWx0aVBvbHlnb24nICkge1xuICAgICAgICB2YXIgeHkgPSBjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCk7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgeHkubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZSh4eVtpXSwgZGlmZik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICB9O1xufSIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgICBsYXllci50b0NhbnZhc1hZID0gZnVuY3Rpb24oZmVhdHVyZSwgZ2VvanNvbiwgem9vbSkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhIGNhY2hlIG5hbWVzcGFjZSBhbmQgc2V0IHRoZSB6b29tIGxldmVsXG4gICAgICAgIGlmKCAhZmVhdHVyZS5jYWNoZSApIGZlYXR1cmUuY2FjaGUgPSB7fTtcbiAgICAgICAgdmFyIGNhbnZhc1hZO1xuXG4gICAgICAgIGlmKCBnZW9qc29uLnR5cGUgPT0gJ1BvaW50JyApIHtcblxuICAgICAgICAgICAgY2FudmFzWFkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgICAgICAgZ2VvanNvbi5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICBnZW9qc29uLmNvb3JkaW5hdGVzWzBdXG4gICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgLy8gaWYoIGZlYXR1cmUuc2l6ZSApIHtcbiAgICAgICAgICAgIC8vICAgICBjYW52YXNYWS54ID0gY2FudmFzWFkueCAtIGZlYXR1cmUuc2l6ZSAvIDI7XG4gICAgICAgICAgICAvLyAgICAgY2FudmFzWFkueSA9IGNhbnZhc1hZLnkgLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgIH0gZWxzZSBpZiggZ2VvanNvbi50eXBlID09ICdMaW5lU3RyaW5nJyApIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY2FudmFzWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGdlb2pzb24uY29vcmRpbmF0ZXMsIHRoaXMuX21hcCk7XG4gICAgICAgICAgICB0cmltQ2FudmFzWFkoY2FudmFzWFkpO1xuICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgICBcbiAgICAgICAgICAgIGNhbnZhc1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShnZW9qc29uLmNvb3JkaW5hdGVzWzBdLCB0aGlzLl9tYXApO1xuICAgICAgICAgICAgdHJpbUNhbnZhc1hZKGNhbnZhc1hZKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgICAgICBjYW52YXNYWSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZ2VvanNvbi5jb29yZGluYXRlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICB2YXIgeHkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGdlb2pzb24uY29vcmRpbmF0ZXNbaV1bMF0sIHRoaXMuX21hcCk7XG4gICAgICAgICAgICAgICAgdHJpbUNhbnZhc1hZKHh5KTtcbiAgICAgICAgICAgICAgICBjYW52YXNYWS5wdXNoKHh5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZmVhdHVyZS5zZXRDYW52YXNYWShjYW52YXNYWSwgem9vbSwgdGhpcyk7XG4gICAgfTtcbn1cblxuLy8gZ2l2ZW4gYW4gYXJyYXkgb2YgZ2VvIHh5IGNvb3JkaW5hdGVzLCBtYWtlIHN1cmUgZWFjaCBwb2ludCBpcyBhdCBsZWFzdCBtb3JlIHRoYW4gMXB4IGFwYXJ0XG5mdW5jdGlvbiB0cmltQ2FudmFzWFkoeHkpIHtcbiAgICBpZiggeHkubGVuZ3RoID09PSAwICkgcmV0dXJuO1xuICAgIHZhciBsYXN0ID0geHlbeHkubGVuZ3RoLTFdLCBpLCBwb2ludDtcblxuICAgIHZhciBjID0gMDtcbiAgICBmb3IoIGkgPSB4eS5sZW5ndGgtMjsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgIHBvaW50ID0geHlbaV07XG4gICAgICAgIGlmKCBNYXRoLmFicyhsYXN0LnggLSBwb2ludC54KSA9PT0gMCAmJiBNYXRoLmFicyhsYXN0LnkgLSBwb2ludC55KSA9PT0gMCApIHtcbiAgICAgICAgICAgIHh5LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGMrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhc3QgPSBwb2ludDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmKCB4eS5sZW5ndGggPD0gMSApIHtcbiAgICAgICAgeHkucHVzaChsYXN0KTtcbiAgICAgICAgYy0tO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vdmVMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBkaWZmKSB7XG4gICAgdmFyIGksIGxlbiA9IGNvb3Jkcy5sZW5ndGg7XG4gICAgZm9yKCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgY29vcmRzW2ldLnggKz0gZGlmZi54O1xuICAgICAgY29vcmRzW2ldLnkgKz0gZGlmZi55O1xuICAgIH1cbiAgfSxcblxuICBwcm9qZWN0TGluZSA6IGZ1bmN0aW9uKGNvb3JkcywgbWFwKSB7XG4gICAgdmFyIHh5TGluZSA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB4eUxpbmUucHVzaChtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgY29vcmRzW2ldWzFdLCBjb29yZHNbaV1bMF1cbiAgICAgIF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4geHlMaW5lO1xuICB9LFxuXG4gIGNhbGNCb3VuZHMgOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICB2YXIgeG1pbiA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeG1heCA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeW1pbiA9IGNvb3Jkc1swXVswXTtcbiAgICB2YXIgeW1heCA9IGNvb3Jkc1swXVswXTtcblxuICAgIGZvciggdmFyIGkgPSAxOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHhtaW4gPiBjb29yZHNbaV1bMV0gKSB4bWluID0gY29vcmRzW2ldWzFdO1xuICAgICAgaWYoIHhtYXggPCBjb29yZHNbaV1bMV0gKSB4bWF4ID0gY29vcmRzW2ldWzFdO1xuXG4gICAgICBpZiggeW1pbiA+IGNvb3Jkc1tpXVswXSApIHltaW4gPSBjb29yZHNbaV1bMF07XG4gICAgICBpZiggeW1heCA8IGNvb3Jkc1tpXVswXSApIHltYXggPSBjb29yZHNbaV1bMF07XG4gICAgfVxuXG4gICAgdmFyIHNvdXRoV2VzdCA9IEwubGF0TG5nKHhtaW4tLjAxLCB5bWluLS4wMSk7XG4gICAgdmFyIG5vcnRoRWFzdCA9IEwubGF0TG5nKHhtYXgrLjAxLCB5bWF4Ky4wMSk7XG5cbiAgICByZXR1cm4gTC5sYXRMbmdCb3VuZHMoc291dGhXZXN0LCBub3J0aEVhc3QpO1xuICB9LFxuXG4gIGdlb21ldHJ5V2l0aGluUmFkaXVzIDogZnVuY3Rpb24oZ2VvbWV0cnksIHh5UG9pbnRzLCBjZW50ZXIsIHh5UG9pbnQsIHJhZGl1cykge1xuICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50RGlzdGFuY2UoZ2VvbWV0cnksIGNlbnRlcikgPD0gcmFkaXVzO1xuICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgIGZvciggdmFyIGkgPSAxOyBpIDwgeHlQb2ludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmKCB0aGlzLmxpbmVJbnRlcnNlY3RzQ2lyY2xlKHh5UG9pbnRzW2ktMV0sIHh5UG9pbnRzW2ldLCB4eVBvaW50LCAzKSApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludEluUG9seWdvbihjZW50ZXIsIGdlb21ldHJ5KTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzI3NTUyOS9jaGVjay1pZi1saW5lLWludGVyc2VjdHMtd2l0aC1jaXJjbGVzLXBlcmltZXRlclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EaXN0YW5jZV9mcm9tX2FfcG9pbnRfdG9fYV9saW5lXG4gIC8vIFtsbmcgeCwgbGF0LCB5XVxuICBsaW5lSW50ZXJzZWN0c0NpcmNsZSA6IGZ1bmN0aW9uKGxpbmVQMSwgbGluZVAyLCBwb2ludCwgcmFkaXVzKSB7XG4gICAgdmFyIGRpc3RhbmNlID1cbiAgICAgIE1hdGguYWJzKFxuICAgICAgICAoKGxpbmVQMi55IC0gbGluZVAxLnkpKnBvaW50LngpIC0gKChsaW5lUDIueCAtIGxpbmVQMS54KSpwb2ludC55KSArIChsaW5lUDIueCpsaW5lUDEueSkgLSAobGluZVAyLnkqbGluZVAxLngpXG4gICAgICApIC9cbiAgICAgIE1hdGguc3FydChcbiAgICAgICAgTWF0aC5wb3cobGluZVAyLnkgLSBsaW5lUDEueSwgMikgKyBNYXRoLnBvdyhsaW5lUDIueCAtIGxpbmVQMS54LCAyKVxuICAgICAgKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPD0gcmFkaXVzO1xuICB9LFxuXG4gIC8vIGh0dHA6Ly93aWtpLm9wZW5zdHJlZXRtYXAub3JnL3dpa2kvWm9vbV9sZXZlbHNcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzU0NTA5OC9sZWFmbGV0LWNhbGN1bGF0aW5nLW1ldGVycy1wZXItcGl4ZWwtYXQtem9vbS1sZXZlbFxuICBtZXRlcnNQZXJQeCA6IGZ1bmN0aW9uKGxsLCBtYXApIHtcbiAgICB2YXIgcG9pbnRDID0gbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGwpOyAvLyBjb252ZXJ0IHRvIGNvbnRhaW5lcnBvaW50IChwaXhlbHMpXG4gICAgdmFyIHBvaW50WCA9IFtwb2ludEMueCArIDEsIHBvaW50Qy55XTsgLy8gYWRkIG9uZSBwaXhlbCB0byB4XG5cbiAgICAvLyBjb252ZXJ0IGNvbnRhaW5lcnBvaW50cyB0byBsYXRsbmcnc1xuICAgIHZhciBsYXRMbmdDID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRDKTtcbiAgICB2YXIgbGF0TG5nWCA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50WCk7XG5cbiAgICB2YXIgZGlzdGFuY2VYID0gbGF0TG5nQy5kaXN0YW5jZVRvKGxhdExuZ1gpOyAvLyBjYWxjdWxhdGUgZGlzdGFuY2UgYmV0d2VlbiBjIGFuZCB4IChsYXRpdHVkZSlcbiAgICByZXR1cm4gZGlzdGFuY2VYO1xuICB9LFxuXG4gIGRlZ3JlZXNQZXJQeCA6IGZ1bmN0aW9uKGxsLCBtYXApIHtcbiAgICB2YXIgcG9pbnRDID0gbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGwpOyAvLyBjb252ZXJ0IHRvIGNvbnRhaW5lcnBvaW50IChwaXhlbHMpXG4gICAgdmFyIHBvaW50WCA9IFtwb2ludEMueCArIDEsIHBvaW50Qy55XTsgLy8gYWRkIG9uZSBwaXhlbCB0byB4XG5cbiAgICAvLyBjb252ZXJ0IGNvbnRhaW5lcnBvaW50cyB0byBsYXRsbmcnc1xuICAgIHZhciBsYXRMbmdDID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRDKTtcbiAgICB2YXIgbGF0TG5nWCA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50WCk7XG5cbiAgICByZXR1cm4gTWF0aC5hYnMobGF0TG5nQy5sbmcgLSBsYXRMbmdYLmxuZyk7IC8vIGNhbGN1bGF0ZSBkaXN0YW5jZSBiZXR3ZWVuIGMgYW5kIHggKGxhdGl0dWRlKVxuICB9LFxuXG4gIC8vIGZyb20gaHR0cDovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWxcbiAgcG9pbnREaXN0YW5jZSA6IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHZhciBsb24xID0gcHQxLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MSA9IHB0MS5jb29yZGluYXRlc1sxXSxcbiAgICAgIGxvbjIgPSBwdDIuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQyID0gcHQyLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgZExhdCA9IHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MiAtIGxhdDEpLFxuICAgICAgZExvbiA9IHRoaXMubnVtYmVyVG9SYWRpdXMobG9uMiAtIGxvbjEpLFxuICAgICAgYSA9IE1hdGgucG93KE1hdGguc2luKGRMYXQgLyAyKSwgMikgKyBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDEpKVxuICAgICAgICAqIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MikpICogTWF0aC5wb3coTWF0aC5zaW4oZExvbiAvIDIpLCAyKSxcbiAgICAgIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xuICAgIHJldHVybiAoNjM3MSAqIGMpICogMTAwMDsgLy8gcmV0dXJucyBtZXRlcnNcbiAgfSxcblxuICBwb2ludEluUG9seWdvbiA6IGZ1bmN0aW9uIChwLCBwb2x5KSB7XG4gICAgdmFyIGNvb3JkcyA9IChwb2x5LnR5cGUgPT0gXCJQb2x5Z29uXCIpID8gWyBwb2x5LmNvb3JkaW5hdGVzIF0gOiBwb2x5LmNvb3JkaW5hdGVzXG5cbiAgICB2YXIgaW5zaWRlQm94ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG9pbnRJbkJvdW5kaW5nQm94KHAsIHRoaXMuYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzKGNvb3Jkc1tpXSkpKSBpbnNpZGVCb3ggPSB0cnVlXG4gICAgfVxuICAgIGlmICghaW5zaWRlQm94KSByZXR1cm4gZmFsc2VcblxuICAgIHZhciBpbnNpZGVQb2x5ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG5wb2x5KHAuY29vcmRpbmF0ZXNbMV0sIHAuY29vcmRpbmF0ZXNbMF0sIGNvb3Jkc1tpXSkpIGluc2lkZVBvbHkgPSB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVBvbHlcbiAgfSxcblxuICBwb2ludEluQm91bmRpbmdCb3ggOiBmdW5jdGlvbiAocG9pbnQsIGJvdW5kcykge1xuICAgIHJldHVybiAhKHBvaW50LmNvb3JkaW5hdGVzWzFdIDwgYm91bmRzWzBdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzFdID4gYm91bmRzWzFdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdIDwgYm91bmRzWzBdWzFdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdID4gYm91bmRzWzFdWzFdKVxuICB9LFxuXG4gIGJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3JkcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4QWxsID0gW10sIHlBbGwgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHNbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHhBbGwucHVzaChjb29yZHNbMF1baV1bMV0pXG4gICAgICB5QWxsLnB1c2goY29vcmRzWzBdW2ldWzBdKVxuICAgIH1cblxuICAgIHhBbGwgPSB4QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICB5QWxsID0geUFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG5cbiAgICByZXR1cm4gWyBbeEFsbFswXSwgeUFsbFswXV0sIFt4QWxsW3hBbGwubGVuZ3RoIC0gMV0sIHlBbGxbeUFsbC5sZW5ndGggLSAxXV0gXVxuICB9LFxuXG4gIC8vIFBvaW50IGluIFBvbHlnb25cbiAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbCNMaXN0aW5nIHRoZSBWZXJ0aWNlc1xuICBwbnBvbHkgOiBmdW5jdGlvbih4LHksY29vcmRzKSB7XG4gICAgdmFyIHZlcnQgPSBbIFswLDBdIF1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvb3Jkc1tpXS5sZW5ndGg7IGorKykge1xuICAgICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldW2pdKVxuICAgICAgfVxuICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVswXSlcbiAgICAgIHZlcnQucHVzaChbMCwwXSlcbiAgICB9XG5cbiAgICB2YXIgaW5zaWRlID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZlcnQubGVuZ3RoIC0gMTsgaSA8IHZlcnQubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICBpZiAoKCh2ZXJ0W2ldWzBdID4geSkgIT0gKHZlcnRbal1bMF0gPiB5KSkgJiYgKHggPCAodmVydFtqXVsxXSAtIHZlcnRbaV1bMV0pICogKHkgLSB2ZXJ0W2ldWzBdKSAvICh2ZXJ0W2pdWzBdIC0gdmVydFtpXVswXSkgKyB2ZXJ0W2ldWzFdKSkgaW5zaWRlID0gIWluc2lkZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVcbiAgfSxcblxuICBudW1iZXJUb1JhZGl1cyA6IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICByZXR1cm4gbnVtYmVyICogTWF0aC5QSSAvIDE4MDtcbiAgfVxufTtcbiJdfQ==
