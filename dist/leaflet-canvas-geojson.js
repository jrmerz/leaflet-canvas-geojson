(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.async = global.async || {})));
}(this, function (exports) { 'use strict';

    /**
     * A faster alternative to `Function#apply`, this function invokes `func`
     * with the `this` binding of `thisArg` and the arguments of `args`.
     *
     * @private
     * @param {Function} func The function to invoke.
     * @param {*} thisArg The `this` binding of `func`.
     * @param {Array} args The arguments to invoke `func` with.
     * @returns {*} Returns the result of `func`.
     */
    function apply(func, thisArg, args) {
      var length = args.length;
      switch (length) {
        case 0: return func.call(thisArg);
        case 1: return func.call(thisArg, args[0]);
        case 2: return func.call(thisArg, args[0], args[1]);
        case 3: return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/6.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == 'object' || type == 'function');
    }

    var funcTag = '[object Function]';
    var genTag = '[object GeneratorFunction]';
    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto.toString;

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 8 which returns 'object' for typed array and weak map constructors,
      // and PhantomJS 1.9 which returns 'function' for `NodeList` instances.
      var tag = isObject(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag;
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return !!value && typeof value == 'object';
    }

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$1 = objectProto$1.toString;

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && objectToString$1.call(value) == symbolTag);
    }

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = isFunction(value.valueOf) ? value.valueOf() : value;
        value = isObject(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    var INFINITY = 1 / 0;
    var MAX_INTEGER = 1.7976931348623157e+308;
    /**
     * Converts `value` to a finite number.
     *
     * @static
     * @memberOf _
     * @since 4.12.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted number.
     * @example
     *
     * _.toFinite(3.2);
     * // => 3.2
     *
     * _.toFinite(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toFinite(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toFinite('3.2');
     * // => 3.2
     */
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = (value < 0 ? -1 : 1);
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }

    /**
     * Converts `value` to an integer.
     *
     * **Note:** This method is loosely based on
     * [`ToInteger`](http://www.ecma-international.org/ecma-262/6.0/#sec-tointeger).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to convert.
     * @returns {number} Returns the converted integer.
     * @example
     *
     * _.toInteger(3.2);
     * // => 3
     *
     * _.toInteger(Number.MIN_VALUE);
     * // => 0
     *
     * _.toInteger(Infinity);
     * // => 1.7976931348623157e+308
     *
     * _.toInteger('3.2');
     * // => 3
     */
    function toInteger(value) {
      var result = toFinite(value),
          remainder = result % 1;

      return result === result ? (remainder ? result - remainder : result) : 0;
    }

    /** Used as the `TypeError` message for "Functions" methods. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max;

    /**
     * Creates a function that invokes `func` with the `this` binding of the
     * created function and arguments from `start` and beyond provided as
     * an array.
     *
     * **Note:** This method is based on the
     * [rest parameter](https://mdn.io/rest_parameters).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Function
     * @param {Function} func The function to apply a rest parameter to.
     * @param {number} [start=func.length-1] The start position of the rest parameter.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var say = _.rest(function(what, names) {
     *   return what + ' ' + _.initial(names).join(', ') +
     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
     * });
     *
     * say('hello', 'fred', 'barney', 'pebbles');
     * // => 'hello fred, barney, & pebbles'
     */
    function rest(func, start) {
      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      start = nativeMax(start === undefined ? (func.length - 1) : toInteger(start), 0);
      return function() {
        var args = arguments,
            index = -1,
            length = nativeMax(args.length - start, 0),
            array = Array(length);

        while (++index < length) {
          array[index] = args[start + index];
        }
        switch (start) {
          case 0: return func.call(this, array);
          case 1: return func.call(this, args[0], array);
          case 2: return func.call(this, args[0], args[1], array);
        }
        var otherArgs = Array(start + 1);
        index = -1;
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = array;
        return apply(func, this, otherArgs);
      };
    }

    function initialParams (fn) {
        return rest(function (args /*..., callback*/) {
            var callback = args.pop();
            fn.call(this, args, callback);
        });
    }

    function applyEach$1(eachfn) {
        return rest(function (fns, args) {
            var go = initialParams(function (args, callback) {
                var that = this;
                return eachfn(fns, function (fn, cb) {
                    fn.apply(that, args.concat([cb]));
                }, callback);
            });
            if (args.length) {
                return go.apply(this, args);
            } else {
                return go;
            }
        });
    }

    /**
     * A method that returns `undefined`.
     *
     * @static
     * @memberOf _
     * @since 2.3.0
     * @category Util
     * @example
     *
     * _.times(2, _.noop);
     * // => [undefined, undefined]
     */
    function noop() {
      // No operation performed.
    }

    function once(fn) {
        return function () {
            if (fn === null) return;
            var callFn = fn;
            fn = null;
            callFn.apply(this, arguments);
        };
    }

    /**
     * The base implementation of `_.property` without support for deep paths.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function baseProperty(key) {
      return function(object) {
        return object == null ? undefined : object[key];
      };
    }

    /**
     * Gets the "length" property value of `object`.
     *
     * **Note:** This function is used to avoid a
     * [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792) that affects
     * Safari on at least iOS 8.1-8.3 ARM64.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {*} Returns the "length" value.
     */
    var getLength = baseProperty('length');

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This function is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length,
     *  else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(getLength(value)) && !isFunction(value);
    }

    var iteratorSymbol = typeof Symbol === 'function' && Symbol.iterator;

    function getIterator (coll) {
        return iteratorSymbol && coll[iteratorSymbol] && coll[iteratorSymbol]();
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetPrototype = Object.getPrototypeOf;

    /**
     * Gets the `[[Prototype]]` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {null|Object} Returns the `[[Prototype]]`.
     */
    function getPrototype(value) {
      return nativeGetPrototype(Object(value));
    }

    /** Used for built-in method references. */
    var objectProto$2 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto$2.hasOwnProperty;

    /**
     * The base implementation of `_.has` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHas(object, key) {
      // Avoid a bug in IE 10-11 where objects with a [[Prototype]] of `null`,
      // that are composed entirely of index properties, return `false` for
      // `hasOwnProperty` checks of them.
      return object != null &&
        (hasOwnProperty.call(object, key) ||
          (typeof object == 'object' && key in object && getPrototype(object) === null));
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeKeys = Object.keys;

    /**
     * The base implementation of `_.keys` which doesn't skip the constructor
     * property of prototypes or treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      return nativeKeys(Object(object));
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]';

    /** Used for built-in method references. */
    var objectProto$3 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto$3.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$2 = objectProto$3.toString;

    /** Built-in value references. */
    var propertyIsEnumerable = objectProto$3.propertyIsEnumerable;

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      // Safari 8.1 incorrectly makes `arguments.callee` enumerable in strict mode.
      return isArrayLikeObject(value) && hasOwnProperty$1.call(value, 'callee') &&
        (!propertyIsEnumerable.call(value, 'callee') || objectToString$2.call(value) == argsTag);
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @type {Function}
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /** `Object#toString` result references. */
    var stringTag = '[object String]';

    /** Used for built-in method references. */
    var objectProto$4 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$3 = objectProto$4.toString;

    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */
    function isString(value) {
      return typeof value == 'string' ||
        (!isArray(value) && isObjectLike(value) && objectToString$3.call(value) == stringTag);
    }

    /**
     * Creates an array of index keys for `object` values of arrays,
     * `arguments` objects, and strings, otherwise `null` is returned.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array|null} Returns index keys, else `null`.
     */
    function indexKeys(object) {
      var length = object ? object.length : undefined;
      if (isLength(length) &&
          (isArray(object) || isString(object) || isArguments(object))) {
        return baseTimes(length, String);
      }
      return null;
    }

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER$1 = 9007199254740991;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER$1 : length;
      return !!length &&
        (typeof value == 'number' || reIsUint.test(value)) &&
        (value > -1 && value % 1 == 0 && value < length);
    }

    /** Used for built-in method references. */
    var objectProto$5 = Object.prototype;

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

      return value === proto;
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      var isProto = isPrototype(object);
      if (!(isProto || isArrayLike(object))) {
        return baseKeys(object);
      }
      var indexes = indexKeys(object),
          skipIndexes = !!indexes,
          result = indexes || [],
          length = result.length;

      for (var key in object) {
        if (baseHas(object, key) &&
            !(skipIndexes && (key == 'length' || isIndex(key, length))) &&
            !(isProto && key == 'constructor')) {
          result.push(key);
        }
      }
      return result;
    }

    function iterator(coll) {
        var i = -1;
        var len;
        if (isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? { value: coll[i], key: i } : null;
            };
        }

        var iterate = getIterator(coll);
        if (iterate) {
            return function next() {
                var item = iterate.next();
                if (item.done) return null;
                i++;
                return { value: item.value, key: i };
            };
        }

        var okeys = keys(coll);
        len = okeys.length;
        return function next() {
            i++;
            var key = okeys[i];
            return i < len ? { value: coll[key], key: key } : null;
        };
    }

    function onlyOnce(fn) {
        return function () {
            if (fn === null) throw new Error("Callback was already called.");
            var callFn = fn;
            fn = null;
            callFn.apply(this, arguments);
        };
    }

    function _eachOfLimit(limit) {
        return function (obj, iteratee, callback) {
            callback = once(callback || noop);
            obj = obj || [];
            var nextElem = iterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish() {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var elem = nextElem();
                    if (elem === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iteratee(elem.value, elem.key, onlyOnce(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        } else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }

    function doParallelLimit(fn) {
        return function (obj, limit, iteratee, callback) {
            return fn(_eachOfLimit(limit), obj, iteratee, callback);
        };
    }

    function _asyncMap(eachfn, arr, iteratee, callback) {
        callback = once(callback || noop);
        arr = arr || [];
        var results = [];
        var counter = 0;

        eachfn(arr, function (value, _, callback) {
            var index = counter++;
            iteratee(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    /**
     * The same as `map` but runs a maximum of `limit` async operations at a time.
     *
     * @name mapLimit
     * @static
     * @memberOf async
     * @see async.map
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a transformed
     * item. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an array of the
     * transformed items from the `coll`. Invoked with (err, results).
     */
    var mapLimit = doParallelLimit(_asyncMap);

    function doLimit(fn, limit) {
        return function (iterable, iteratee, callback) {
            return fn(iterable, limit, iteratee, callback);
        };
    }

    /**
     * Produces a new collection of values by mapping each value in `coll` through
     * the `iteratee` function. The `iteratee` is called with an item from `coll`
     * and a callback for when it has finished processing. Each of these callback
     * takes 2 arguments: an `error`, and the transformed item from `coll`. If
     * `iteratee` passes an error to its callback, the main `callback` (for the
     * `map` function) is immediately called with the error.
     *
     * Note, that since this function applies the `iteratee` to each item in
     * parallel, there is no guarantee that the `iteratee` functions will complete
     * in order. However, the results array will be in the same order as the
     * original `coll`.
     *
     * If `map` is passed an Object, the results will be an Array.  The results
     * will roughly be in the order of the original Objects' keys (but this can
     * vary across JavaScript engines)
     *
     * @name map
     * @static
     * @memberOf async
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a
     * transformed item. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an Array of the
     * transformed items from the `coll`. Invoked with (err, results).
     * @example
     *
     * async.map(['file1','file2','file3'], fs.stat, function(err, results) {
     *     // results is now an array of stats for each file
     * });
     */
    var map = doLimit(mapLimit, Infinity);

    /**
     * Applies the provided arguments to each function in the array, calling
     * `callback` after all functions have completed. If you only provide the first
     * argument, then it will return a function which lets you pass in the
     * arguments as if it were a single function call.
     *
     * @name applyEach
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Array|Object} fns - A collection of asynchronous functions to all
     * call with the same arguments
     * @param {...*} [args] - any number of separate arguments to pass to the
     * function.
     * @param {Function} [callback] - the final argument should be the callback,
     * called when all functions have completed processing.
     * @returns {Function} - If only the first argument is provided, it will return
     * a function which lets you pass in the arguments as if it were a single
     * function call.
     * @example
     *
     * async.applyEach([enableSearch, updateSchema], 'bucket', callback);
     *
     * // partial application example:
     * async.each(
     *     buckets,
     *     async.applyEach([enableSearch, updateSchema]),
     *     callback
     * );
     */
    var applyEach = applyEach$1(map);

    /**
     * The same as `map` but runs only a single async operation at a time.
     *
     * @name mapSeries
     * @static
     * @memberOf async
     * @see async.map
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a
     * transformed item. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an array of the
     * transformed items from the `coll`. Invoked with (err, results).
     */
    var mapSeries = doLimit(mapLimit, 1);

    /**
     * The same as `applyEach` but runs only a single async operation at a time.
     *
     * @name applyEachSeries
     * @static
     * @memberOf async
     * @see async.applyEach
     * @category Control Flow
     * @param {Array|Object} fns - A collection of asynchronous functions to all
     * call with the same arguments
     * @param {...*} [args] - any number of separate arguments to pass to the
     * function.
     * @param {Function} [callback] - the final argument should be the callback,
     * called when all functions have completed processing.
     * @returns {Function} - If only the first argument is provided, it will return
     * a function which lets you pass in the arguments as if it were a single
     * function call.
     */
    var applyEachSeries = applyEach$1(mapSeries);

    /**
     * Creates a continuation function with some arguments already applied.
     *
     * Useful as a shorthand when combined with other control flow functions. Any
     * arguments passed to the returned function are added to the arguments
     * originally passed to apply.
     *
     * @name apply
     * @static
     * @memberOf async
     * @category Util
     * @param {Function} function - The function you want to eventually apply all
     * arguments to. Invokes with (arguments...).
     * @param {...*} arguments... - Any number of arguments to automatically apply
     * when the continuation is called.
     * @example
     *
     * // using apply
     * async.parallel([
     *     async.apply(fs.writeFile, 'testfile1', 'test1'),
     *     async.apply(fs.writeFile, 'testfile2', 'test2')
     * ]);
     *
     *
     * // the same process without using apply
     * async.parallel([
     *     function(callback) {
     *         fs.writeFile('testfile1', 'test1', callback);
     *     },
     *     function(callback) {
     *         fs.writeFile('testfile2', 'test2', callback);
     *     }
     * ]);
     *
     * // It's possible to pass any number of additional arguments when calling the
     * // continuation:
     *
     * node> var fn = async.apply(sys.puts, 'one');
     * node> fn('two', 'three');
     * one
     * two
     * three
     */
    var apply$1 = rest(function (fn, args) {
        return rest(function (callArgs) {
            return fn.apply(null, args.concat(callArgs));
        });
    });

    /**
     * Take a sync function and make it async, passing its return value to a
     * callback. This is useful for plugging sync functions into a waterfall,
     * series, or other async functions. Any arguments passed to the generated
     * function will be passed to the wrapped function (except for the final
     * callback argument). Errors thrown will be passed to the callback.
     *
     * If the function passed to `asyncify` returns a Promise, that promises's
     * resolved/rejected state will be used to call the callback, rather than simply
     * the synchronous return value.
     *
     * This also means you can asyncify ES2016 `async` functions.
     *
     * @name asyncify
     * @static
     * @memberOf async
     * @alias wrapSync
     * @category Util
     * @param {Function} func - The synchronous function to convert to an
     * asynchronous function.
     * @returns {Function} An asynchronous wrapper of the `func`. To be invoked with
     * (callback).
     * @example
     *
     * // passing a regular synchronous function
     * async.waterfall([
     *     async.apply(fs.readFile, filename, "utf8"),
     *     async.asyncify(JSON.parse),
     *     function (data, next) {
     *         // data is the result of parsing the text.
     *         // If there was a parsing error, it would have been caught.
     *     }
     * ], callback);
     *
     * // passing a function returning a promise
     * async.waterfall([
     *     async.apply(fs.readFile, filename, "utf8"),
     *     async.asyncify(function (contents) {
     *         return db.model.create(contents);
     *     }),
     *     function (model, next) {
     *         // `model` is the instantiated model object.
     *         // If there was an error, this function would be skipped.
     *     }
     * ], callback);
     *
     * // es6 example
     * var q = async.queue(async.asyncify(async function(file) {
     *     var intermediateStep = await processFile(file);
     *     return await somePromise(intermediateStep)
     * }));
     *
     * q.push(files);
     */
    function asyncify(func) {
        return initialParams(function (args, callback) {
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (isObject(result) && typeof result.then === 'function') {
                result.then(function (value) {
                    callback(null, value);
                })['catch'](function (err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    }

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array ? array.length : 0;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * Creates a base function for methods like `_.forIn` and `_.forOwn`.
     *
     * @private
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1,
            iterable = Object(object),
            props = keysFunc(object),
            length = props.length;

        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }

    /**
     * The base implementation of `baseForOwn` which iterates over `object`
     * properties returned by `keysFunc` and invokes `iteratee` for each property.
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @returns {Object} Returns `object`.
     */
    var baseFor = createBaseFor();

    /**
     * The base implementation of `_.forOwn` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Object} Returns `object`.
     */
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'user': 'fred' };
     * var other = { 'user': 'fred' };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype;

    /** Built-in value references. */
    var splice = arrayProto.splice;

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      return this.__data__['delete'](key);
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Checks if `value` is a host object in IE < 9.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
     */
    function isHostObject(value) {
      // Many host objects are `Object` objects that can coerce to strings
      // despite having improperly defined `toString` methods.
      var result = false;
      if (value != null && typeof value.toString != 'function') {
        try {
          result = !!(value + '');
        } catch (e) {}
      }
      return result;
    }

    /**
     * Checks if `value` is a global object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {null|Object} Returns `value` if it's a global object, else `null`.
     */
    function checkGlobal(value) {
      return (value && value.Object === Object) ? value : null;
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = checkGlobal(typeof global == 'object' && global);

    /** Detect free variable `self`. */
    var freeSelf = checkGlobal(typeof self == 'object' && self);

    /** Detect `this` as the global object. */
    var thisGlobal = checkGlobal(typeof this == 'object' && this);

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || thisGlobal || Function('return this')();

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /** Used to resolve the decompiled source of functions. */
    var funcToString$1 = Function.prototype.toString;

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to process.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used for built-in method references. */
    var objectProto$6 = Object.prototype;

    /** Used to resolve the decompiled source of functions. */
    var funcToString = Function.prototype.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty$2 = objectProto$6.hasOwnProperty;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /* Built-in method references that are verified to be native. */
    var nativeCreate = getNative(Object, 'create');

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used for built-in method references. */
    var objectProto$7 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$3 = objectProto$7.hasOwnProperty;

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
    }

    /** Used for built-in method references. */
    var objectProto$8 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$4 = objectProto$8.hasOwnProperty;

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty$4.call(data, key);
    }

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
      return this;
    }

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /* Built-in method references that are verified to be native. */
    var Map = getNative(root, 'Map');

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      return getMapData(this, key)['delete'](key);
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var cache = this.__data__;
      if (cache instanceof ListCache && cache.__data__.length == LARGE_ARRAY_SIZE) {
        cache = this.__data__ = new MapCache(cache.__data__);
      }
      cache.set(key, value);
      return this;
    }

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      this.__data__ = new ListCache(entries);
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED$2);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values ? values.length : 0;

      this.__data__ = new MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array ? array.length : 0;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    var UNORDERED_COMPARE_FLAG$1 = 1;
    var PARTIAL_COMPARE_FLAG$2 = 2;
    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG$2,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = (bitmask & UNORDERED_COMPARE_FLAG$1) ? new SetCache : undefined;

      stack.set(array, other);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function(othValue, othIndex) {
                if (!seen.has(othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
                  return seen.add(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, customizer, bitmask, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      return result;
    }

    /** Built-in value references. */
    var Symbol$1 = root.Symbol;

    /** Built-in value references. */
    var Uint8Array = root.Uint8Array;

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    var UNORDERED_COMPARE_FLAG$2 = 1;
    var PARTIAL_COMPARE_FLAG$3 = 2;
    var boolTag = '[object Boolean]';
    var dateTag = '[object Date]';
    var errorTag = '[object Error]';
    var mapTag = '[object Map]';
    var numberTag = '[object Number]';
    var regexpTag = '[object RegExp]';
    var setTag = '[object Set]';
    var stringTag$1 = '[object String]';
    var symbolTag$1 = '[object Symbol]';
    var arrayBufferTag = '[object ArrayBuffer]';
    var dataViewTag = '[object DataView]';
    var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
      switch (tag) {
        case dataViewTag:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag:
        case dateTag:
          // Coerce dates and booleans to numbers, dates to milliseconds and
          // booleans to `1` or `0` treating invalid dates coerced to `NaN` as
          // not equal.
          return +object == +other;

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case numberTag:
          // Treat `NaN` vs. `NaN` as equal.
          return (object != +object) ? other != +other : object == +other;

        case regexpTag:
        case stringTag$1:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/6.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag:
          var convert = mapToArray;

        case setTag:
          var isPartial = bitmask & PARTIAL_COMPARE_FLAG$3;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= UNORDERED_COMPARE_FLAG$2;
          stack.set(object, other);

          // Recursively compare objects (susceptible to call stack limits).
          return equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);

        case symbolTag$1:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /** Used to compose bitmasks for comparison styles. */
    var PARTIAL_COMPARE_FLAG$4 = 2;

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} customizer The function to customize comparisons.
     * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG$4,
          objProps = keys(object),
          objLength = objProps.length,
          othProps = keys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : baseHas(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      return result;
    }

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView');

    /* Built-in method references that are verified to be native. */
    var Promise = getNative(root, 'Promise');

    /* Built-in method references that are verified to be native. */
    var Set = getNative(root, 'Set');

    /* Built-in method references that are verified to be native. */
    var WeakMap = getNative(root, 'WeakMap');

    var mapTag$1 = '[object Map]';
    var objectTag$1 = '[object Object]';
    var promiseTag = '[object Promise]';
    var setTag$1 = '[object Set]';
    var weakMapTag = '[object WeakMap]';
    var dataViewTag$1 = '[object DataView]';

    /** Used for built-in method references. */
    var objectProto$10 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$4 = objectProto$10.toString;

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView);
    var mapCtorString = toSource(Map);
    var promiseCtorString = toSource(Promise);
    var setCtorString = toSource(Set);
    var weakMapCtorString = toSource(WeakMap);
    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function getTag(value) {
      return objectToString$4.call(value);
    }

    // Fallback for data views, maps, sets, and weak maps in IE 11,
    // for data views in Edge, and promises in Node.js.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
        (Map && getTag(new Map) != mapTag$1) ||
        (Promise && getTag(Promise.resolve()) != promiseTag) ||
        (Set && getTag(new Set) != setTag$1) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = objectToString$4.call(value),
            Ctor = result == objectTag$1 ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : undefined;

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag$1;
            case mapCtorString: return mapTag$1;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag$1;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    var getTag$1 = getTag;

    var argsTag$2 = '[object Arguments]';
    var arrayTag$1 = '[object Array]';
    var boolTag$1 = '[object Boolean]';
    var dateTag$1 = '[object Date]';
    var errorTag$1 = '[object Error]';
    var funcTag$1 = '[object Function]';
    var mapTag$2 = '[object Map]';
    var numberTag$1 = '[object Number]';
    var objectTag$2 = '[object Object]';
    var regexpTag$1 = '[object RegExp]';
    var setTag$2 = '[object Set]';
    var stringTag$2 = '[object String]';
    var weakMapTag$1 = '[object WeakMap]';
    var arrayBufferTag$1 = '[object ArrayBuffer]';
    var dataViewTag$2 = '[object DataView]';
    var float32Tag = '[object Float32Array]';
    var float64Tag = '[object Float64Array]';
    var int8Tag = '[object Int8Array]';
    var int16Tag = '[object Int16Array]';
    var int32Tag = '[object Int32Array]';
    var uint8Tag = '[object Uint8Array]';
    var uint8ClampedTag = '[object Uint8ClampedArray]';
    var uint16Tag = '[object Uint16Array]';
    var uint32Tag = '[object Uint32Array]';
    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$1] =
    typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] =
    typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] =
    typedArrayTags[errorTag$1] = typedArrayTags[funcTag$1] =
    typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] =
    typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] =
    typedArrayTags[setTag$2] = typedArrayTags[stringTag$2] =
    typedArrayTags[weakMapTag$1] = false;

    /** Used for built-in method references. */
    var objectProto$11 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString$5 = objectProto$11.toString;

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified,
     *  else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    function isTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[objectToString$5.call(value)];
    }

    /** Used to compose bitmasks for comparison styles. */
    var PARTIAL_COMPARE_FLAG$1 = 2;

    /** `Object#toString` result references. */
    var argsTag$1 = '[object Arguments]';
    var arrayTag = '[object Array]';
    var objectTag = '[object Object]';
    /** Used for built-in method references. */
    var objectProto$9 = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$5 = objectProto$9.hasOwnProperty;

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
     *  for more details.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = arrayTag,
          othTag = arrayTag;

      if (!objIsArr) {
        objTag = getTag$1(object);
        objTag = objTag == argsTag$1 ? objectTag : objTag;
      }
      if (!othIsArr) {
        othTag = getTag$1(other);
        othTag = othTag == argsTag$1 ? objectTag : othTag;
      }
      var objIsObj = objTag == objectTag && !isHostObject(object),
          othIsObj = othTag == objectTag && !isHostObject(other),
          isSameTag = objTag == othTag;

      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, equalFunc, customizer, bitmask, stack)
          : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
      }
      if (!(bitmask & PARTIAL_COMPARE_FLAG$1)) {
        var objIsWrapped = objIsObj && hasOwnProperty$5.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty$5.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack);
          return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack);
      return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {boolean} [bitmask] The bitmask of comparison flags.
     *  The bitmask may be composed of the following flags:
     *     1 - Unordered comparison
     *     2 - Partial comparison
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, customizer, bitmask, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
    }

    var UNORDERED_COMPARE_FLAG = 1;
    var PARTIAL_COMPARE_FLAG = 2;
    /**
     * The base implementation of `_.isMatch` without support for iteratee shorthands.
     *
     * @private
     * @param {Object} object The object to inspect.
     * @param {Object} source The object of property values to match.
     * @param {Array} matchData The property names, values, and compare flags to match.
     * @param {Function} [customizer] The function to customize comparisons.
     * @returns {boolean} Returns `true` if `object` is a match, else `false`.
     */
    function baseIsMatch(object, source, matchData, customizer) {
      var index = matchData.length,
          length = index,
          noCustomizer = !customizer;

      if (object == null) {
        return !length;
      }
      object = Object(object);
      while (index--) {
        var data = matchData[index];
        if ((noCustomizer && data[2])
              ? data[1] !== object[data[0]]
              : !(data[0] in object)
            ) {
          return false;
        }
      }
      while (++index < length) {
        data = matchData[index];
        var key = data[0],
            objValue = object[key],
            srcValue = data[1];

        if (noCustomizer && data[2]) {
          if (objValue === undefined && !(key in object)) {
            return false;
          }
        } else {
          var stack = new Stack;
          if (customizer) {
            var result = customizer(objValue, srcValue, key, object, source, stack);
          }
          if (!(result === undefined
                ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack)
                : result
              )) {
            return false;
          }
        }
      }
      return true;
    }

    /**
     * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` if suitable for strict
     *  equality comparisons, else `false`.
     */
    function isStrictComparable(value) {
      return value === value && !isObject(value);
    }

    /**
     * Gets the property names, values, and compare flags of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the match data of `object`.
     */
    function getMatchData(object) {
      var result = keys(object),
          length = result.length;

      while (length--) {
        var key = result[length],
            value = object[key];

        result[length] = [key, value, isStrictComparable(value)];
      }
      return result;
    }

    /**
     * A specialized version of `matchesProperty` for source values suitable
     * for strict equality comparisons, i.e. `===`.
     *
     * @private
     * @param {string} key The key of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function matchesStrictComparable(key, srcValue) {
      return function(object) {
        if (object == null) {
          return false;
        }
        return object[key] === srcValue &&
          (srcValue !== undefined || (key in Object(object)));
      };
    }

    /**
     * The base implementation of `_.matches` which doesn't clone `source`.
     *
     * @private
     * @param {Object} source The object of property values to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatches(source) {
      var matchData = getMatchData(source);
      if (matchData.length == 1 && matchData[0][2]) {
        return matchesStrictComparable(matchData[0][0], matchData[0][1]);
      }
      return function(object) {
        return object === source || baseIsMatch(object, source, matchData);
      };
    }

    /** Used as the `TypeError` message for "Functions" methods. */
    var FUNC_ERROR_TEXT$1 = 'Expected a function';

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT$1);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache);
      return memoized;
    }

    // Assign cache to `_.memoize`.
    memoize.Cache = MapCache;

    /** Used as references for various `Number` constants. */
    var INFINITY$1 = 1 / 0;

    /** Used to convert symbols to primitives and strings. */
    var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined;
    var symbolToString = symbolProto$1 ? symbolProto$1.toString : undefined;
    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
    }

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : baseToString(value);
    }

    /** Used to match property names within property paths. */
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(\.|\[\])(?:\4|$))/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = memoize(function(string) {
      var result = [];
      toString(string).replace(rePropName, function(match, number, quote, string) {
        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value) {
      return isArray(value) ? value : stringToPath(value);
    }

    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    var reIsPlainProp = /^\w*$/;
    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    /** Used as references for various `Number` constants. */
    var INFINITY$2 = 1 / 0;

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY$2) ? '-0' : result;
    }

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = isKey(path, object) ? [path] : castPath(path);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is used in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    /**
     * The base implementation of `_.hasIn` without support for deep paths.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {Array|string} key The key to check.
     * @returns {boolean} Returns `true` if `key` exists, else `false`.
     */
    function baseHasIn(object, key) {
      return object != null && key in Object(object);
    }

    /**
     * Checks if `path` exists on `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @param {Function} hasFunc The function to check properties.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     */
    function hasPath(object, path, hasFunc) {
      path = isKey(path, object) ? [path] : castPath(path);

      var result,
          index = -1,
          length = path.length;

      while (++index < length) {
        var key = toKey(path[index]);
        if (!(result = object != null && hasFunc(object, key))) {
          break;
        }
        object = object[key];
      }
      if (result) {
        return result;
      }
      var length = object ? object.length : 0;
      return !!length && isLength(length) && isIndex(key, length) &&
        (isArray(object) || isString(object) || isArguments(object));
    }

    /**
     * Checks if `path` is a direct or inherited property of `object`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path to check.
     * @returns {boolean} Returns `true` if `path` exists, else `false`.
     * @example
     *
     * var object = _.create({ 'a': _.create({ 'b': 2 }) });
     *
     * _.hasIn(object, 'a');
     * // => true
     *
     * _.hasIn(object, 'a.b');
     * // => true
     *
     * _.hasIn(object, ['a', 'b']);
     * // => true
     *
     * _.hasIn(object, 'b');
     * // => false
     */
    function hasIn(object, path) {
      return object != null && hasPath(object, path, baseHasIn);
    }

    var UNORDERED_COMPARE_FLAG$3 = 1;
    var PARTIAL_COMPARE_FLAG$5 = 2;
    /**
     * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
     *
     * @private
     * @param {string} path The path of the property to get.
     * @param {*} srcValue The value to match.
     * @returns {Function} Returns the new spec function.
     */
    function baseMatchesProperty(path, srcValue) {
      if (isKey(path) && isStrictComparable(srcValue)) {
        return matchesStrictComparable(toKey(path), srcValue);
      }
      return function(object) {
        var objValue = get(object, path);
        return (objValue === undefined && objValue === srcValue)
          ? hasIn(object, path)
          : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG$3 | PARTIAL_COMPARE_FLAG$5);
      };
    }

    /**
     * This method returns the first argument given to it.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Util
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'user': 'fred' };
     *
     * console.log(_.identity(object) === object);
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * A specialized version of `baseProperty` which supports deep paths.
     *
     * @private
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     */
    function basePropertyDeep(path) {
      return function(object) {
        return baseGet(object, path);
      };
    }

    /**
     * Creates a function that returns the value at `path` of a given object.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {Array|string} path The path of the property to get.
     * @returns {Function} Returns the new accessor function.
     * @example
     *
     * var objects = [
     *   { 'a': { 'b': 2 } },
     *   { 'a': { 'b': 1 } }
     * ];
     *
     * _.map(objects, _.property('a.b'));
     * // => [2, 1]
     *
     * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
     * // => [1, 2]
     */
    function property(path) {
      return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
    }

    /**
     * The base implementation of `_.iteratee`.
     *
     * @private
     * @param {*} [value=_.identity] The value to convert to an iteratee.
     * @returns {Function} Returns the iteratee.
     */
    function baseIteratee(value) {
      // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
      // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
      if (typeof value == 'function') {
        return value;
      }
      if (value == null) {
        return identity;
      }
      if (typeof value == 'object') {
        return isArray(value)
          ? baseMatchesProperty(value[0], value[1])
          : baseMatches(value);
      }
      return property(value);
    }

    /**
     * Iterates over own enumerable string keyed properties of an object and
     * invokes `iteratee` for each property. The iteratee is invoked with three
     * arguments: (value, key, object). Iteratee functions may exit iteration
     * early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @since 0.3.0
     * @category Object
     * @param {Object} object The object to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Object} Returns `object`.
     * @see _.forOwnRight
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.forOwn(new Foo, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forOwn(object, iteratee) {
      return object && baseForOwn(object, baseIteratee(iteratee, 3));
    }

    /**
     * Gets the index at which the first occurrence of `NaN` is found in `array`.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched `NaN`, else `-1`.
     */
    function indexOfNaN(array, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        var other = array[index];
        if (other !== other) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @private
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      if (value !== value) {
        return indexOfNaN(array, fromIndex);
      }
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Determines the best order for running the functions in `tasks`, based on
     * their requirements. Each function can optionally depend on other functions
     * being completed first, and each function is run as soon as its requirements
     * are satisfied.
     *
     * If any of the functions pass an error to their callback, the `auto` sequence
     * will stop. Further tasks will not execute (so any other functions depending
     * on it will not run), and the main `callback` is immediately called with the
     * error.
     *
     * Functions also receive an object containing the results of functions which
     * have completed so far as the first argument, if they have dependencies. If a
     * task function has no dependencies, it will only be passed a callback.
     *
     * @name auto
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Object} tasks - An object. Each of its properties is either a
     * function or an array of requirements, with the function itself the last item
     * in the array. The object's key of a property serves as the name of the task
     * defined by that property, i.e. can be used when specifying requirements for
     * other tasks. The function receives one or two arguments:
     * * a `results` object, containing the results of the previously executed
     *   functions, only passed if the task has any dependencies,
     * * a `callback(err, result)` function, which must be called when finished,
     *   passing an `error` (which can be `null`) and the result of the function's
     *   execution.
     * @param {number} [concurrency=Infinity] - An optional `integer` for
     * determining the maximum number of tasks that can be run in parallel. By
     * default, as many as possible.
     * @param {Function} [callback] - An optional callback which is called when all
     * the tasks have been completed. It receives the `err` argument if any `tasks`
     * pass an error to their callback. Results are always returned; however, if an
     * error occurs, no further `tasks` will be performed, and the results object
     * will only contain partial results. Invoked with (err, results).
     * @example
     *
     * async.auto({
     *     // this function will just be passed a callback
     *     readData: async.apply(fs.readFile, 'data.txt', 'utf-8'),
     *     showData: ['readData', function(results, cb) {
     *         // results.readData is the file's contents
     *         // ...
     *     }]
     * }, callback);
     *
     * async.auto({
     *     get_data: function(callback) {
     *         console.log('in get_data');
     *         // async code to get some data
     *         callback(null, 'data', 'converted to array');
     *     },
     *     make_folder: function(callback) {
     *         console.log('in make_folder');
     *         // async code to create a directory to store a file in
     *         // this is run at the same time as getting the data
     *         callback(null, 'folder');
     *     },
     *     write_file: ['get_data', 'make_folder', function(results, callback) {
     *         console.log('in write_file', JSON.stringify(results));
     *         // once there is some data and the directory exists,
     *         // write the data to a file in the directory
     *         callback(null, 'filename');
     *     }],
     *     email_link: ['write_file', function(results, callback) {
     *         console.log('in email_link', JSON.stringify(results));
     *         // once the file is written let's email a link to it...
     *         // results.write_file contains the filename returned by write_file.
     *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
     *     }]
     * }, function(err, results) {
     *     console.log('err = ', err);
     *     console.log('results = ', results);
     * });
     */
    function auto (tasks, concurrency, callback) {
        if (typeof concurrency === 'function') {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = once(callback || noop);
        var keys$$ = keys(tasks);
        var numTasks = keys$$.length;
        if (!numTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = numTasks;
        }

        var results = {};
        var runningTasks = 0;
        var hasError = false;

        var listeners = {};

        var readyTasks = [];

        // for cycle detection:
        var readyToCheck = []; // tasks that have been identified as reachable
        // without the possibility of returning to an ancestor task
        var uncheckedDependencies = {};

        forOwn(tasks, function (task, key) {
            if (!isArray(task)) {
                // no dependencies
                enqueueTask(key, [task]);
                readyToCheck.push(key);
                return;
            }

            var dependencies = task.slice(0, task.length - 1);
            var remainingDependencies = dependencies.length;
            if (remainingDependencies === 0) {
                enqueueTask(key, task);
                readyToCheck.push(key);
                return;
            }
            uncheckedDependencies[key] = remainingDependencies;

            arrayEach(dependencies, function (dependencyName) {
                if (!tasks[dependencyName]) {
                    throw new Error('async.auto task `' + key + '` has a non-existent dependency in ' + dependencies.join(', '));
                }
                addListener(dependencyName, function () {
                    remainingDependencies--;
                    if (remainingDependencies === 0) {
                        enqueueTask(key, task);
                    }
                });
            });
        });

        checkForDeadlocks();
        processQueue();

        function enqueueTask(key, task) {
            readyTasks.push(function () {
                runTask(key, task);
            });
        }

        function processQueue() {
            if (readyTasks.length === 0 && runningTasks === 0) {
                return callback(null, results);
            }
            while (readyTasks.length && runningTasks < concurrency) {
                var run = readyTasks.shift();
                run();
            }
        }

        function addListener(taskName, fn) {
            var taskListeners = listeners[taskName];
            if (!taskListeners) {
                taskListeners = listeners[taskName] = [];
            }

            taskListeners.push(fn);
        }

        function taskComplete(taskName) {
            var taskListeners = listeners[taskName] || [];
            arrayEach(taskListeners, function (fn) {
                fn();
            });
            processQueue();
        }

        function runTask(key, task) {
            if (hasError) return;

            var taskCallback = onlyOnce(rest(function (err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    forOwn(results, function (val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[key] = args;
                    hasError = true;
                    listeners = [];

                    callback(err, safeResults);
                } else {
                    results[key] = args;
                    taskComplete(key);
                }
            }));

            runningTasks++;
            var taskFn = task[task.length - 1];
            if (task.length > 1) {
                taskFn(results, taskCallback);
            } else {
                taskFn(taskCallback);
            }
        }

        function checkForDeadlocks() {
            // Kahn's algorithm
            // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
            // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
            var currentTask;
            var counter = 0;
            while (readyToCheck.length) {
                currentTask = readyToCheck.pop();
                counter++;
                arrayEach(getDependents(currentTask), function (dependent) {
                    if (! --uncheckedDependencies[dependent]) {
                        readyToCheck.push(dependent);
                    }
                });
            }

            if (counter !== numTasks) {
                throw new Error('async.auto cannot execute tasks due to a recursive dependency');
            }
        }

        function getDependents(taskName) {
            var result = [];
            forOwn(tasks, function (task, key) {
                if (isArray(task) && baseIndexOf(task, taskName, 0) >= 0) {
                    result.push(key);
                }
            });
            return result;
        }
    }

    /**
     * A specialized version of `_.map` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the new mapped array.
     */
    function arrayMap(array, iteratee) {
      var index = -1,
          length = array ? array.length : 0,
          result = Array(length);

      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * The base implementation of `_.slice` without an iteratee call guard.
     *
     * @private
     * @param {Array} array The array to slice.
     * @param {number} [start=0] The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the slice of `array`.
     */
    function baseSlice(array, start, end) {
      var index = -1,
          length = array.length;

      if (start < 0) {
        start = -start > length ? 0 : (length + start);
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : ((end - start) >>> 0);
      start >>>= 0;

      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }

    /**
     * Casts `array` to a slice if it's needed.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {number} start The start position.
     * @param {number} [end=array.length] The end position.
     * @returns {Array} Returns the cast slice.
     */
    function castSlice(array, start, end) {
      var length = array.length;
      end = end === undefined ? length : end;
      return (!start && end >= length) ? array : baseSlice(array, start, end);
    }

    /**
     * Used by `_.trim` and `_.trimEnd` to get the index of the last string symbol
     * that is not found in the character symbols.
     *
     * @private
     * @param {Array} strSymbols The string symbols to inspect.
     * @param {Array} chrSymbols The character symbols to find.
     * @returns {number} Returns the index of the last unmatched string symbol.
     */
    function charsEndIndex(strSymbols, chrSymbols) {
      var index = strSymbols.length;

      while (index-- && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
      return index;
    }

    /**
     * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
     * that is not found in the character symbols.
     *
     * @private
     * @param {Array} strSymbols The string symbols to inspect.
     * @param {Array} chrSymbols The character symbols to find.
     * @returns {number} Returns the index of the first unmatched string symbol.
     */
    function charsStartIndex(strSymbols, chrSymbols) {
      var index = -1,
          length = strSymbols.length;

      while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
      return index;
    }

    /** Used to compose unicode character classes. */
    var rsAstralRange = '\\ud800-\\udfff';
    var rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23';
    var rsComboSymbolsRange = '\\u20d0-\\u20f0';
    var rsVarRange = '\\ufe0e\\ufe0f';
    var rsAstral = '[' + rsAstralRange + ']';
    var rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']';
    var rsFitz = '\\ud83c[\\udffb-\\udfff]';
    var rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')';
    var rsNonAstral = '[^' + rsAstralRange + ']';
    var rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}';
    var rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]';
    var rsZWJ = '\\u200d';
    var reOptMod = rsModifier + '?';
    var rsOptVar = '[' + rsVarRange + ']?';
    var rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*';
    var rsSeq = rsOptVar + reOptMod + rsOptJoin;
    var rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';
    /** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
    var reComplexSymbol = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

    /**
     * Converts `string` to an array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the converted array.
     */
    function stringToArray(string) {
      return string.match(reComplexSymbol);
    }

    /** Used to match leading and trailing whitespace. */
    var reTrim$1 = /^\s+|\s+$/g;

    /**
     * Removes leading and trailing whitespace or specified characters from `string`.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category String
     * @param {string} [string=''] The string to trim.
     * @param {string} [chars=whitespace] The characters to trim.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
     * @returns {string} Returns the trimmed string.
     * @example
     *
     * _.trim('  abc  ');
     * // => 'abc'
     *
     * _.trim('-_-abc-_-', '_-');
     * // => 'abc'
     *
     * _.map(['  foo  ', '  bar  '], _.trim);
     * // => ['foo', 'bar']
     */
    function trim(string, chars, guard) {
      string = toString(string);
      if (string && (guard || chars === undefined)) {
        return string.replace(reTrim$1, '');
      }
      if (!string || !(chars = baseToString(chars))) {
        return string;
      }
      var strSymbols = stringToArray(string),
          chrSymbols = stringToArray(chars),
          start = charsStartIndex(strSymbols, chrSymbols),
          end = charsEndIndex(strSymbols, chrSymbols) + 1;

      return castSlice(strSymbols, start, end).join('');
    }

    var argsRegex = /^(function[^\(]*)?\(?\s*([^\)=]*)/m;

    function parseParams(func) {
        return trim(func.toString().match(argsRegex)[2]).split(/\s*\,\s*/);
    }

    /**
     * A dependency-injected version of the {@link async.auto} function. Dependent
     * tasks are specified as parameters to the function, after the usual callback
     * parameter, with the parameter names matching the names of the tasks it
     * depends on. This can provide even more readable task graphs which can be
     * easier to maintain.
     *
     * If a final callback is specified, the task results are similarly injected,
     * specified as named parameters after the initial error parameter.
     *
     * The autoInject function is purely syntactic sugar and its semantics are
     * otherwise equivalent to {@link async.auto}.
     *
     * @name autoInject
     * @static
     * @memberOf async
     * @see async.auto
     * @category Control Flow
     * @param {Object} tasks - An object, each of whose properties is a function of
     * the form 'func([dependencies...], callback). The object's key of a property
     * serves as the name of the task defined by that property, i.e. can be used
     * when specifying requirements for other tasks.
     * * The `callback` parameter is a `callback(err, result)` which must be called
     *   when finished, passing an `error` (which can be `null`) and the result of
     *   the function's execution. The remaining parameters name other tasks on
     *   which the task is dependent, and the results from those tasks are the
     *   arguments of those parameters.
     * @param {Function} [callback] - An optional callback which is called when all
     * the tasks have been completed. It receives the `err` argument if any `tasks`
     * pass an error to their callback. The remaining parameters are task names
     * whose results you are interested in. This callback will only be called when
     * all tasks have finished or an error has occurred, and so do not specify
     * dependencies in the same way as `tasks` do. If an error occurs, no further
     * `tasks` will be performed, and `results` will only be valid for those tasks
     * which managed to complete. Invoked with (err, [results...]).
     * @example
     *
     * //  The example from `auto` can be rewritten as follows:
     * async.autoInject({
     *     get_data: function(callback) {
     *         // async code to get some data
     *         callback(null, 'data', 'converted to array');
     *     },
     *     make_folder: function(callback) {
     *         // async code to create a directory to store a file in
     *         // this is run at the same time as getting the data
     *         callback(null, 'folder');
     *     },
     *     write_file: function(get_data, make_folder, callback) {
     *         // once there is some data and the directory exists,
     *         // write the data to a file in the directory
     *         callback(null, 'filename');
     *     },
     *     email_link: function(write_file, callback) {
     *         // once the file is written let's email a link to it...
     *         // write_file contains the filename returned by write_file.
     *         callback(null, {'file':write_file, 'email':'user@example.com'});
     *     }
     * }, function(err, email_link) {
     *     console.log('err = ', err);
     *     console.log('email_link = ', email_link);
     * });
     *
     * // If you are using a JS minifier that mangles parameter names, `autoInject`
     * // will not work with plain functions, since the parameter names will be
     * // collapsed to a single letter identifier.  To work around this, you can
     * // explicitly specify the names of the parameters your task function needs
     * // in an array, similar to Angular.js dependency injection.  The final
     * // results callback can be provided as an array in the same way.
     *
     * // This still has an advantage over plain `auto`, since the results a task
     * // depends on are still spread into arguments.
     * async.autoInject({
     *     //...
     *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
     *         callback(null, 'filename');
     *     }],
     *     email_link: ['write_file', function(write_file, callback) {
     *         callback(null, {'file':write_file, 'email':'user@example.com'});
     *     }]
     *     //...
     * }, ['email_link', function(err, email_link) {
     *     console.log('err = ', err);
     *     console.log('email_link = ', email_link);
     * }]);
     */
    function autoInject(tasks, callback) {
        var newTasks = {};

        forOwn(tasks, function (taskFn, key) {
            var params;

            if (isArray(taskFn)) {
                params = copyArray(taskFn);
                taskFn = params.pop();

                newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
            } else if (taskFn.length === 0) {
                throw new Error("autoInject task functions require explicit parameters.");
            } else if (taskFn.length === 1) {
                // no dependencies, use the function as-is
                newTasks[key] = taskFn;
            } else {
                params = parseParams(taskFn);
                params.pop();

                newTasks[key] = params.concat(newTask);
            }

            function newTask(results, taskCb) {
                var newArgs = arrayMap(params, function (name) {
                    return results[name];
                });
                newArgs.push(taskCb);
                taskFn.apply(null, newArgs);
            }
        });

        auto(newTasks, callback);
    }

    var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
    var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

    function fallback(fn) {
        setTimeout(fn, 0);
    }

    function wrap(defer) {
        return rest(function (fn, args) {
            defer(function () {
                fn.apply(null, args);
            });
        });
    }

    var _defer;

    if (hasSetImmediate) {
        _defer = setImmediate;
    } else if (hasNextTick) {
        _defer = process.nextTick;
    } else {
        _defer = fallback;
    }

    var setImmediate$1 = wrap(_defer);

    function queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        } else if (concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== 'function') {
                throw new Error('task callback must be a function');
            }
            q.started = true;
            if (!isArray(data)) {
                data = [data];
            }
            if (data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return setImmediate$1(function () {
                    q.drain();
                });
            }
            arrayEach(data, function (task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }
            });
            setImmediate$1(q.process);
        }
        function _next(q, tasks) {
            return function () {
                workers -= 1;

                var removed = false;
                var args = arguments;
                arrayEach(tasks, function (task) {
                    arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);

                    if (args[0] != null) {
                        q.error(args[0], task.data);
                    }
                });

                if (workers <= q.concurrency - q.buffer) {
                    q.unsaturated();
                }

                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            unsaturated: noop,
            buffer: concurrency / 4,
            empty: noop,
            drain: noop,
            error: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                while (!q.paused && workers < q.concurrency && q.tasks.length) {

                    var tasks = q.payload ? q.tasks.splice(0, q.payload) : q.tasks.splice(0, q.tasks.length);

                    var data = arrayMap(tasks, baseProperty('data'));

                    if (q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    workersList.push(tasks[0]);

                    if (workers === q.concurrency) {
                        q.saturated();
                    }

                    var cb = onlyOnce(_next(q, tasks));
                    worker(data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function () {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) {
                    return;
                }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    setImmediate$1(q.process);
                }
            }
        };
        return q;
    }

    /**
     * A cargo of tasks for the worker function to complete. Cargo inherits all of
     * the same methods and event callbacks as {@link async.queue}.
     * @typedef {Object} cargo
     * @property {Function} length - A function returning the number of items
     * waiting to be processed. Invoke with ().
     * @property {number} payload - An `integer` for determining how many tasks
     * should be process per round. This property can be changed after a `cargo` is
     * created to alter the payload on-the-fly.
     * @property {Function} push - Adds `task` to the `queue`. The callback is
     * called once the `worker` has finished processing the task. Instead of a
     * single task, an array of `tasks` can be submitted. The respective callback is
     * used for every task in the list. Invoke with (task, [callback]).
     * @property {Function} saturated - A callback that is called when the
     * `queue.length()` hits the concurrency and further tasks will be queued.
     * @property {Function} empty - A callback that is called when the last item
     * from the `queue` is given to a `worker`.
     * @property {Function} drain - A callback that is called when the last item
     * from the `queue` has returned from the `worker`.
     * @property {Function} idle - a function returning false if there are items
     * waiting or being processed, or true if not. Invoke with ().
     * @property {Function} pause - a function that pauses the processing of tasks
     * until `resume()` is called. Invoke with ().
     * @property {Function} resume - a function that resumes the processing of
     * queued tasks when the queue is paused. Invoke with ().
     * @property {Function} kill - a function that removes the `drain` callback and
     * empties remaining tasks from the queue forcing it to go idle. Invoke with ().
     */

    /**
     * Creates a `cargo` object with the specified payload. Tasks added to the
     * cargo will be processed altogether (up to the `payload` limit). If the
     * `worker` is in progress, the task is queued until it becomes available. Once
     * the `worker` has completed some tasks, each callback of those tasks is
     * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
     * for how `cargo` and `queue` work.
     *
     * While [queue](#queue) passes only one task to one of a group of workers
     * at a time, cargo passes an array of tasks to a single worker, repeating
     * when the worker is finished.
     *
     * @name cargo
     * @static
     * @memberOf async
     * @see async.queue
     * @category Control Flow
     * @param {Function} worker - An asynchronous function for processing an array
     * of queued tasks, which must call its `callback(err)` argument when finished,
     * with an optional `err` argument. Invoked with (tasks, callback).
     * @param {number} [payload=Infinity] - An optional `integer` for determining
     * how many tasks should be processed per round; if omitted, the default is
     * unlimited.
     * @returns {cargo} A cargo object to manage the tasks. Callbacks can
     * attached as certain properties to listen for specific events during the
     * lifecycle of the cargo and inner queue.
     * @example
     *
     * // create a cargo object with payload 2
     * var cargo = async.cargo(function(tasks, callback) {
     *     for (var i=0; i<tasks.length; i++) {
     *         console.log('hello ' + tasks[i].name);
     *     }
     *     callback();
     * }, 2);
     *
     * // add some items
     * cargo.push({name: 'foo'}, function(err) {
     *     console.log('finished processing foo');
     * });
     * cargo.push({name: 'bar'}, function(err) {
     *     console.log('finished processing bar');
     * });
     * cargo.push({name: 'baz'}, function(err) {
     *     console.log('finished processing baz');
     * });
     */
    function cargo(worker, payload) {
      return queue(worker, 1, payload);
    }

    /**
     * The same as `eachOf` but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name eachOfLimit
     * @static
     * @memberOf async
     * @see async.eachOf
     * @alias forEachOfLimit
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A function to apply to each
     * item in `coll`. The `key` is the item's key, or index in the case of an
     * array. The iteratee is passed a `callback(err)` which must be called once it
     * has completed. If no error has occurred, the callback should be run without
     * arguments or with an explicit `null` argument. Invoked with
     * (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     */
    function eachOfLimit(obj, limit, iteratee, cb) {
      _eachOfLimit(limit)(obj, iteratee, cb);
    }

    /**
     * The same as `eachOf` but runs only a single async operation at a time.
     *
     * @name eachOfSeries
     * @static
     * @memberOf async
     * @see async.eachOf
     * @alias forEachOfSeries
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`. The
     * `key` is the item's key, or index in the case of an array. The iteratee is
     * passed a `callback(err)` which must be called once it has completed. If no
     * error has occurred, the callback should be run without arguments or with an
     * explicit `null` argument. Invoked with (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Invoked with (err).
     */
    var eachOfSeries = doLimit(eachOfLimit, 1);

    /**
     * Reduces `coll` into a single value using an async `iteratee` to return each
     * successive step. `memo` is the initial state of the reduction. This function
     * only operates in series.
     *
     * For performance reasons, it may make sense to split a call to this function
     * into a parallel map, and then use the normal `Array.prototype.reduce` on the
     * results. This function is for situations where each step in the reduction
     * needs to be async; if you can get the data before reducing it, then it's
     * probably a good idea to do so.
     *
     * @name reduce
     * @static
     * @memberOf async
     * @alias inject, foldl
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {*} memo - The initial state of the reduction.
     * @param {Function} iteratee - A function applied to each item in the
     * array to produce the next step in the reduction. The `iteratee` is passed a
     * `callback(err, reduction)` which accepts an optional error as its first
     * argument, and the state of the reduction as the second. If an error is
     * passed to the callback, the reduction is stopped and the main `callback` is
     * immediately called with the error. Invoked with (memo, item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the reduced value. Invoked with
     * (err, result).
     * @example
     *
     * async.reduce([1,2,3], 0, function(memo, item, callback) {
     *     // pointless async:
     *     process.nextTick(function() {
     *         callback(null, memo + item)
     *     });
     * }, function(err, result) {
     *     // result is now equal to the last value of memo, which is 6
     * });
     */
    function reduce(arr, memo, iteratee, cb) {
        eachOfSeries(arr, function (x, i, cb) {
            iteratee(memo, x, function (err, v) {
                memo = v;
                cb(err);
            });
        }, function (err) {
            cb(err, memo);
        });
    }

    /**
     * Version of the compose function that is more natural to read. Each function
     * consumes the return value of the previous function. It is the equivalent of
     * {@link async.compose} with the arguments reversed.
     *
     * Each function is executed with the `this` binding of the composed function.
     *
     * @name seq
     * @static
     * @memberOf async
     * @see async.compose
     * @category Control Flow
     * @param {...Function} functions - the asynchronous functions to compose
     * @example
     *
     * // Requires lodash (or underscore), express3 and dresende's orm2.
     * // Part of an app, that fetches cats of the logged user.
     * // This example uses `seq` function to avoid overnesting and error
     * // handling clutter.
     * app.get('/cats', function(request, response) {
     *     var User = request.models.User;
     *     async.seq(
     *         _.bind(User.get, User),  // 'User.get' has signature (id, callback(err, data))
     *         function(user, fn) {
     *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
     *         }
     *     )(req.session.user_id, function (err, cats) {
     *         if (err) {
     *             console.error(err);
     *             response.json({ status: 'error', message: err.message });
     *         } else {
     *             response.json({ status: 'ok', message: 'Cats found', data: cats });
     *         }
     *     });
     * });
     */
    function seq() /* functions... */{
        var fns = arguments;
        return rest(function (args) {
            var that = this;

            var cb = args[args.length - 1];
            if (typeof cb == 'function') {
                args.pop();
            } else {
                cb = noop;
            }

            reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([rest(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            }, function (err, results) {
                cb.apply(that, [err].concat(results));
            });
        });
    }

    var reverse = Array.prototype.reverse;

    /**
     * Creates a function which is a composition of the passed asynchronous
     * functions. Each function consumes the return value of the function that
     * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
     * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
     *
     * Each function is executed with the `this` binding of the composed function.
     *
     * @name compose
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {...Function} functions - the asynchronous functions to compose
     * @example
     *
     * function add1(n, callback) {
     *     setTimeout(function () {
     *         callback(null, n + 1);
     *     }, 10);
     * }
     *
     * function mul3(n, callback) {
     *     setTimeout(function () {
     *         callback(null, n * 3);
     *     }, 10);
     * }
     *
     * var add1mul3 = async.compose(mul3, add1);
     * add1mul3(4, function (err, result) {
     *     // result now equals 15
     * });
     */
    function compose() /* functions... */{
      return seq.apply(null, reverse.call(arguments));
    }

    function concat$1(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }

    /**
     * Like `each`, except that it passes the key (or index) as the second argument
     * to the iteratee.
     *
     * @name eachOf
     * @static
     * @memberOf async
     * @alias forEachOf
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each
     * item in `coll`. The `key` is the item's key, or index in the case of an
     * array. The iteratee is passed a `callback(err)` which must be called once it
     * has completed. If no error has occurred, the callback should be run without
     * arguments or with an explicit `null` argument. Invoked with
     * (item, key, callback).
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @example
     *
     * var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
     * var configs = {};
     *
     * async.forEachOf(obj, function (value, key, callback) {
     *     fs.readFile(__dirname + value, "utf8", function (err, data) {
     *         if (err) return callback(err);
     *         try {
     *             configs[key] = JSON.parse(data);
     *         } catch (e) {
     *             return callback(e);
     *         }
     *         callback();
     *     });
     * }, function (err) {
     *     if (err) console.error(err.message);
     *     // configs is now a map of JSON data
     *     doSomethingWith(configs);
     * });
     */
    var eachOf = doLimit(eachOfLimit, Infinity);

    function doParallel(fn) {
        return function (obj, iteratee, callback) {
            return fn(eachOf, obj, iteratee, callback);
        };
    }

    /**
     * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
     * the concatenated list. The `iteratee`s are called in parallel, and the
     * results are concatenated as they return. There is no guarantee that the
     * results array will be returned in the original order of `coll` passed to the
     * `iteratee` function.
     *
     * @name concat
     * @static
     * @memberOf async
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, results)` which must be called once
     * it has completed with an error (which can be `null`) and an array of results.
     * Invoked with (item, callback).
     * @param {Function} [callback(err)] - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is an array
     * containing the concatenated results of the `iteratee` function. Invoked with
     * (err, results).
     * @example
     *
     * async.concat(['dir1','dir2','dir3'], fs.readdir, function(err, files) {
     *     // files is now a list of filenames that exist in the 3 directories
     * });
     */
    var concat = doParallel(concat$1);

    function doSeries(fn) {
        return function (obj, iteratee, callback) {
            return fn(eachOfSeries, obj, iteratee, callback);
        };
    }

    /**
     * The same as `concat` but runs only a single async operation at a time.
     *
     * @name concatSeries
     * @static
     * @memberOf async
     * @see async.concat
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, results)` which must be called once
     * it has completed with an error (which can be `null`) and an array of results.
     * Invoked with (item, callback).
     * @param {Function} [callback(err)] - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is an array
     * containing the concatenated results of the `iteratee` function. Invoked with
     * (err, results).
     */
    var concatSeries = doSeries(concat$1);

    /**
     * Returns a function that when called, calls-back with the values provided.
     * Useful as the first function in a `waterfall`, or for plugging values in to
     * `auto`.
     *
     * @name constant
     * @static
     * @memberOf async
     * @category Util
     * @param {...*} arguments... - Any number of arguments to automatically invoke
     * callback with.
     * @returns {Function} Returns a function that when invoked, automatically
     * invokes the callback with the previous given arguments.
     * @example
     *
     * async.waterfall([
     *     async.constant(42),
     *     function (value, next) {
     *         // value === 42
     *     },
     *     //...
     * ], callback);
     *
     * async.waterfall([
     *     async.constant(filename, "utf8"),
     *     fs.readFile,
     *     function (fileData, next) {
     *         //...
     *     }
     *     //...
     * ], callback);
     *
     * async.auto({
     *     hostname: async.constant("https://server.net/"),
     *     port: findFreePort,
     *     launchServer: ["hostname", "port", function (options, cb) {
     *         startServer(options, cb);
     *     }],
     *     //...
     * }, callback);
     */
    var constant = rest(function (values) {
        var args = [null].concat(values);
        return initialParams(function (ignoredArgs, callback) {
            return callback.apply(this, args);
        });
    });

    function _createTester(eachfn, check, getResult) {
        return function (arr, limit, iteratee, cb) {
            function done(err) {
                if (cb) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, getResult(false));
                    }
                }
            }
            function wrappedIteratee(x, _, callback) {
                if (!cb) return callback();
                iteratee(x, function (err, v) {
                    if (cb) {
                        if (err) {
                            cb(err);
                            cb = iteratee = false;
                        } else if (check(v)) {
                            cb(null, getResult(true, x));
                            cb = iteratee = false;
                        }
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                cb = cb || noop;
                eachfn(arr, limit, wrappedIteratee, done);
            } else {
                cb = iteratee;
                cb = cb || noop;
                iteratee = limit;
                eachfn(arr, wrappedIteratee, done);
            }
        };
    }

    function _findGetResult(v, x) {
        return x;
    }

    /**
     * Returns the first value in `coll` that passes an async truth test. The
     * `iteratee` is applied in parallel, meaning the first iteratee to return
     * `true` will fire the detect `callback` with that result. That means the
     * result might not be the first item in the original `coll` (in terms of order)
     * that passes the test.

     * If order within the original `coll` is important, then look at
     * `detectSeries`.
     *
     * @name detect
     * @static
     * @memberOf async
     * @alias find
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, truthValue)` which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     * @example
     *
     * async.detect(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, result) {
     *     // result now equals the first file in the list that exists
     * });
     */
    var detect = _createTester(eachOf, identity, _findGetResult);

    /**
     * The same as `detect` but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name detectLimit
     * @static
     * @memberOf async
     * @see async.detect
     * @alias findLimit
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, truthValue)` which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     */
    var detectLimit = _createTester(eachOfLimit, identity, _findGetResult);

    /**
     * The same as `detect` but runs only a single async operation at a time.
     *
     * @name detectSeries
     * @static
     * @memberOf async
     * @see async.detect
     * @alias findSeries
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, truthValue)` which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the `iteratee` functions have finished.
     * Result will be the first item in the array that passes the truth test
     * (iteratee) or the value `undefined` if none passed. Invoked with
     * (err, result).
     */
    var detectSeries = _createTester(eachOfSeries, identity, _findGetResult);

    function consoleFunc(name) {
        return rest(function (fn, args) {
            fn.apply(null, args.concat([rest(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    } else if (console[name]) {
                        arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }

    /**
     * Logs the result of an `async` function to the `console` using `console.dir`
     * to display the properties of the resulting object. Only works in Node.js or
     * in browsers that support `console.dir` and `console.error` (such as FF and
     * Chrome). If multiple arguments are returned from the async function,
     * `console.dir` is called on each argument in order.
     *
     * @name log
     * @static
     * @memberOf async
     * @category Util
     * @param {Function} function - The function you want to eventually apply all
     * arguments to.
     * @param {...*} arguments... - Any number of arguments to apply to the function.
     * @example
     *
     * // in a module
     * var hello = function(name, callback) {
     *     setTimeout(function() {
     *         callback(null, {hello: name});
     *     }, 1000);
     * };
     *
     * // in the node repl
     * node> async.dir(hello, 'world');
     * {hello: 'world'}
     */
    var dir = consoleFunc('dir');

    /**
     * Like {@link async.whilst}, except the `test` is an asynchronous function that
     * is passed a callback in the form of `function (err, truth)`. If error is
     * passed to `test` or `fn`, the main callback is immediately called with the
     * value of the error.
     *
     * @name during
     * @static
     * @memberOf async
     * @see async.whilst
     * @category Control Flow
     * @param {Function} test - asynchronous truth test to perform before each
     * execution of `fn`. Invoked with (callback).
     * @param {Function} fn - A function which is called each time `test` passes.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     * @example
     *
     * var count = 0;
     *
     * async.during(
     *     function (callback) {
     *         return callback(null, count < 5);
     *     },
     *     function (callback) {
     *         count++;
     *         setTimeout(callback, 1000);
     *     },
     *     function (err) {
     *         // 5 seconds have passed
     *     }
     * );
     */
    function during(test, iteratee, cb) {
        cb = cb || noop;

        var next = rest(function (err, args) {
            if (err) {
                cb(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function (err, truth) {
            if (err) return cb(err);
            if (!truth) return cb(null);
            iteratee(next);
        };

        test(check);
    }

    /**
     * The post-check version of {@link async.during}. To reflect the difference in
     * the order of operations, the arguments `test` and `fn` are switched.
     *
     * Also a version of {@link async.doWhilst} with asynchronous `test` function.
     * @name doDuring
     * @static
     * @memberOf async
     * @see async.during
     * @category Control Flow
     * @param {Function} fn - A function which is called each time `test` passes.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} test - asynchronous truth test to perform before each
     * execution of `fn`. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     */
    function doDuring(iteratee, test, cb) {
        var calls = 0;

        during(function (next) {
            if (calls++ < 1) return next(null, true);
            test.apply(this, arguments);
        }, iteratee, cb);
    }

    /**
     * Repeatedly call `fn`, while `test` returns `true`. Calls `callback` when
     * stopped, or an error occurs.
     *
     * @name whilst
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Function} test - synchronous truth test to perform before each
     * execution of `fn`. Invoked with ().
     * @param {Function} fn - A function which is called each time `test` passes.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     * @example
     *
     * var count = 0;
     * async.whilst(
     *     function() { return count < 5; },
     *     function(callback) {
     *         count++;
     *         setTimeout(function() {
     *             callback(null, count);
     *         }, 1000);
     *     },
     *     function (err, n) {
     *         // 5 seconds have passed, n = 5
     *     }
     * );
     */
    function whilst(test, iteratee, cb) {
        cb = cb || noop;
        if (!test()) return cb(null);
        var next = rest(function (err, args) {
            if (err) return cb(err);
            if (test.apply(this, args)) return iteratee(next);
            cb.apply(null, [null].concat(args));
        });
        iteratee(next);
    }

    /**
     * The post-check version of {@link async.whilst}. To reflect the difference in
     * the order of operations, the arguments `test` and `fn` are switched.
     *
     * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
     *
     * @name doWhilst
     * @static
     * @memberOf async
     * @see async.whilst
     * @category Control Flow
     * @param {Function} fn - A function which is called each time `test` passes.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} test - synchronous truth test to perform after each
     * execution of `fn`. Invoked with Invoked with the non-error callback results
     * of `fn`.
     * @param {Function} [callback] - A callback which is called after the test
     * function has failed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     */
    function doWhilst(iteratee, test, cb) {
        var calls = 0;
        return whilst(function () {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iteratee, cb);
    }

    /**
     * Like {@link async.doWhilst}, except the `test` is inverted. Note the
     * argument ordering differs from `until`.
     *
     * @name doUntil
     * @static
     * @memberOf async
     * @see async.doWhilst
     * @category Control Flow
     * @param {Function} fn - A function which is called each time `test` fails.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} test - synchronous truth test to perform after each
     * execution of `fn`. Invoked with the non-error callback results of `fn`.
     * @param {Function} [callback] - A callback which is called after the test
     * function has passed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     */
    function doUntil(iteratee, test, cb) {
        return doWhilst(iteratee, function () {
            return !test.apply(this, arguments);
        }, cb);
    }

    function _withoutIndex(iteratee) {
        return function (value, index, callback) {
            return iteratee(value, callback);
        };
    }

    /**
     * The same as `each` but runs a maximum of `limit` async operations at a time.
     *
     * @name eachLimit
     * @static
     * @memberOf async
     * @see async.each
     * @alias forEachLimit
     * @category Collection
     * @param {Array|Object} coll - A colleciton to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A function to apply to each item in `coll`. The
     * iteratee is passed a `callback(err)` which must be called once it has
     * completed. If no error has occurred, the `callback` should be run without
     * arguments or with an explicit `null` argument. The array index is not passed
     * to the iteratee. Invoked with (item, callback). If you need the index, use
     * `eachOfLimit`.
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     */
    function eachLimit(arr, limit, iteratee, cb) {
      return _eachOfLimit(limit)(arr, _withoutIndex(iteratee), cb);
    }

    /**
     * Applies the function `iteratee` to each item in `coll`, in parallel.
     * The `iteratee` is called with an item from the list, and a callback for when
     * it has finished. If the `iteratee` passes an error to its `callback`, the
     * main `callback` (for the `each` function) is immediately called with the
     * error.
     *
     * Note, that since this function applies `iteratee` to each item in parallel,
     * there is no guarantee that the iteratee functions will complete in order.
     *
     * @name each
     * @static
     * @memberOf async
     * @alias forEach
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item
     * in `coll`. The iteratee is passed a `callback(err)` which must be called once
     * it has completed. If no error has occurred, the `callback` should be run
     * without arguments or with an explicit `null` argument. The array index is not
     * passed to the iteratee. Invoked with (item, callback). If you need the index,
     * use `eachOf`.
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     * @example
     *
     * // assuming openFiles is an array of file names and saveFile is a function
     * // to save the modified contents of that file:
     *
     * async.each(openFiles, saveFile, function(err){
     *   // if any of the saves produced an error, err would equal that error
     * });
     *
     * // assuming openFiles is an array of file names
     * async.each(openFiles, function(file, callback) {
     *
     *     // Perform operation on file here.
     *     console.log('Processing file ' + file);
     *
     *     if( file.length > 32 ) {
     *       console.log('This file name is too long');
     *       callback('File name too long');
     *     } else {
     *       // Do work to process file here
     *       console.log('File processed');
     *       callback();
     *     }
     * }, function(err) {
     *     // if any of the file processing produced an error, err would equal that error
     *     if( err ) {
     *       // One of the iterations produced an error.
     *       // All processing will now stop.
     *       console.log('A file failed to process');
     *     } else {
     *       console.log('All files have been processed successfully');
     *     }
     * });
     */
    var each = doLimit(eachLimit, Infinity);

    /**
     * The same as `each` but runs only a single async operation at a time.
     *
     * @name eachSeries
     * @static
     * @memberOf async
     * @see async.each
     * @alias forEachSeries
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each
     * item in `coll`. The iteratee is passed a `callback(err)` which must be called
     * once it has completed. If no error has occurred, the `callback` should be run
     * without arguments or with an explicit `null` argument. The array index is
     * not passed to the iteratee. Invoked with (item, callback). If you need the
     * index, use `eachOfSeries`.
     * @param {Function} [callback] - A callback which is called when all
     * `iteratee` functions have finished, or an error occurs. Invoked with (err).
     */
    var eachSeries = doLimit(eachLimit, 1);

    /**
     * Wrap an async function and ensure it calls its callback on a later tick of
     * the event loop.  If the function already calls its callback on a next tick,
     * no extra deferral is added. This is useful for preventing stack overflows
     * (`RangeError: Maximum call stack size exceeded`) and generally keeping
     * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
     * contained.
     *
     * @name ensureAsync
     * @static
     * @memberOf async
     * @category Util
     * @param {Function} fn - an async function, one that expects a node-style
     * callback as its last argument.
     * @returns {Function} Returns a wrapped function with the exact same call
     * signature as the function passed in.
     * @example
     *
     * function sometimesAsync(arg, callback) {
     *     if (cache[arg]) {
     *         return callback(null, cache[arg]); // this would be synchronous!!
     *     } else {
     *         doSomeIO(arg, callback); // this IO would be asynchronous
     *     }
     * }
     *
     * // this has a risk of stack overflows if many results are cached in a row
     * async.mapSeries(args, sometimesAsync, done);
     *
     * // this will defer sometimesAsync's callback if necessary,
     * // preventing stack overflows
     * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
     */
    function ensureAsync(fn) {
        return initialParams(function (args, callback) {
            var sync = true;
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    setImmediate$1(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            fn.apply(this, args);
            sync = false;
        });
    }

    function notId(v) {
        return !v;
    }

    /**
     * The same as `every` but runs a maximum of `limit` async operations at a time.
     *
     * @name everyLimit
     * @static
     * @memberOf async
     * @see async.every
     * @alias allLimit
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in the
     * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
     * which must be called with a  boolean argument once it has completed. Invoked
     * with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     */
    var everyLimit = _createTester(eachOfLimit, notId, notId);

    /**
     * Returns `true` if every element in `coll` satisfies an async test. If any
     * iteratee call returns `false`, the main `callback` is immediately called.
     *
     * @name every
     * @static
     * @memberOf async
     * @alias all
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in the
     * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
     * which must be called with a  boolean argument once it has completed. Invoked
     * with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     * @example
     *
     * async.every(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, result) {
     *     // if result is true then every file exists
     * });
     */
    var every = doLimit(everyLimit, Infinity);

    /**
     * The same as `every` but runs only a single async operation at a time.
     *
     * @name everySeries
     * @static
     * @memberOf async
     * @see async.every
     * @alias allSeries
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in the
     * collection in parallel. The iteratee is passed a `callback(err, truthValue)`
     * which must be called with a  boolean argument once it has completed. Invoked
     * with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result will be either `true` or `false`
     * depending on the values of the async tests. Invoked with (err, result).
     */
    var everySeries = doLimit(everyLimit, 1);

    function _filter(eachfn, arr, iteratee, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iteratee(x, function (err, v) {
                if (err) {
                    callback(err);
                } else {
                    if (v) {
                        results.push({ index: index, value: x });
                    }
                    callback();
                }
            });
        }, function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, arrayMap(results.sort(function (a, b) {
                    return a.index - b.index;
                }), baseProperty('value')));
            }
        });
    }

    /**
     * The same as `filter` but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name filterLimit
     * @static
     * @memberOf async
     * @see async.filter
     * @alias selectLimit
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     */
    var filterLimit = doParallelLimit(_filter);

    /**
     * Returns a new array of all the values in `coll` which pass an async truth
     * test. This operation is performed in parallel, but the results array will be
     * in the same order as the original.
     *
     * @name filter
     * @static
     * @memberOf async
     * @alias select
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @example
     *
     * async.filter(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, results) {
     *     // results now equals an array of the existing files
     * });
     */
    var filter = doLimit(filterLimit, Infinity);

    /**
     * The same as `filter` but runs only a single async operation at a time.
     *
     * @name filterSeries
     * @static
     * @memberOf async
     * @see async.filter
     * @alias selectSeries
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results)
     */
    var filterSeries = doLimit(filterLimit, 1);

    /**
     * Calls the asynchronous function `fn` with a callback parameter that allows it
     * to call itself again, in series, indefinitely.

     * If an error is passed to the
     * callback then `errback` is called with the error, and execution stops,
     * otherwise it will never be called.
     *
     * @name forever
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Function} fn - a function to call repeatedly. Invoked with (next).
     * @param {Function} [errback] - when `fn` passes an error to it's callback,
     * this function will be called, and execution stops. Invoked with (err).
     * @example
     *
     * async.forever(
     *     function(next) {
     *         // next is suitable for passing to things that need a callback(err [, whatever]);
     *         // it will result in this function being called again.
     *     },
     *     function(err) {
     *         // if next is called with a value in its first parameter, it will appear
     *         // in here as 'err', and execution will stop.
     *     }
     * );
     */
    function forever(fn, cb) {
        var done = onlyOnce(cb || noop);
        var task = ensureAsync(fn);

        function next(err) {
            if (err) return done(err);
            task(next);
        }
        next();
    }

    /**
     * Creates an iterator function which calls the next function in the `tasks`
     * array, returning a continuation to call the next one after that. It's also
     * possible to “peek” at the next iterator with `iterator.next()`.
     *
     * This function is used internally by the `async` module, but can be useful
     * when you want to manually control the flow of functions in series.
     *
     * @name iterator
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Array} tasks - An array of functions to run.
     * @returns The next function to run in the series.
     * @example
     *
     * var iterator = async.iterator([
     *     function() { sys.p('one'); },
     *     function() { sys.p('two'); },
     *     function() { sys.p('three'); }
     * ]);
     *
     * node> var iterator2 = iterator();
     * 'one'
     * node> var iterator3 = iterator2();
     * 'two'
     * node> iterator3();
     * 'three'
     * node> var nextfn = iterator2.next();
     * node> nextfn();
     * 'three'
     */
    function iterator$1 (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return index < tasks.length - 1 ? makeCallback(index + 1) : null;
            };
            return fn;
        }
        return makeCallback(0);
    }

    /**
     * Logs the result of an `async` function to the `console`. Only works in
     * Node.js or in browsers that support `console.log` and `console.error` (such
     * as FF and Chrome). If multiple arguments are returned from the async
     * function, `console.log` is called on each argument in order.
     *
     * @name log
     * @static
     * @memberOf async
     * @category Util
     * @param {Function} function - The function you want to eventually apply all
     * arguments to.
     * @param {...*} arguments... - Any number of arguments to apply to the function.
     * @example
     *
     * // in a module
     * var hello = function(name, callback) {
     *     setTimeout(function() {
     *         callback(null, 'hello ' + name);
     *     }, 1000);
     * };
     *
     * // in the node repl
     * node> async.log(hello, 'world');
     * 'hello world'
     */
    var log = consoleFunc('log');

    /**
     * The same as `mapValues` but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name mapValuesLimit
     * @static
     * @memberOf async
     * @see async.mapValues
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A function to apply to each value in `obj`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a
     * transformed value. Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Result is an object of the
     * transformed values from the `obj`. Invoked with (err, result).
     */
    function mapValuesLimit(obj, limit, iteratee, callback) {
        var newObj = {};
        eachOfLimit(obj, limit, function (val, key, next) {
            iteratee(val, key, function (err, result) {
                if (err) return next(err);
                newObj[key] = result;
                next();
            });
        }, function (err) {
            callback(err, newObj);
        });
    }

    /**
     * A relative of `map`, designed for use with objects.
     *
     * Produces a new Object by mapping each value of `obj` through the `iteratee`
     * function. The `iteratee` is called each `value` and `key` from `obj` and a
     * callback for when it has finished processing. Each of these callbacks takes
     * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
     * passes an error to its callback, the main `callback` (for the `mapValues`
     * function) is immediately called with the error.
     *
     * Note, the order of the keys in the result is not guaranteed.  The keys will
     * be roughly in the order they complete, (but this is very engine-specific)
     *
     * @name mapValues
     * @static
     * @memberOf async
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each value and key in
     * `coll`. The iteratee is passed a `callback(err, transformed)` which must be
     * called once it has completed with an error (which can be `null`) and a
     * transformed value. Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Results is an array of the
     * transformed items from the `obj`. Invoked with (err, result).
     * @example
     *
     * async.mapValues({
     *     f1: 'file1',
     *     f2: 'file2',
     *     f3: 'file3'
     * }, fs.stat, function(err, result) {
     *     // results is now a map of stats for each file, e.g.
     *     // {
     *     //     f1: [stats for file1],
     *     //     f2: [stats for file2],
     *     //     f3: [stats for file3]
     *     // }
     * });
     */

    var mapValues = doLimit(mapValuesLimit, Infinity);

    /**
     * The same as `mapValues` but runs only a single async operation at a time.
     *
     * @name mapValuesSeries
     * @static
     * @memberOf async
     * @see async.mapValues
     * @category Collection
     * @param {Object} obj - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each value in `obj`.
     * The iteratee is passed a `callback(err, transformed)` which must be called
     * once it has completed with an error (which can be `null`) and a
     * transformed value. Invoked with (value, key, callback).
     * @param {Function} [callback] - A callback which is called when all `iteratee`
     * functions have finished, or an error occurs. Result is an object of the
     * transformed values from the `obj`. Invoked with (err, result).
     */
    var mapValuesSeries = doLimit(mapValuesLimit, 1);

    function has(obj, key) {
        return key in obj;
    }

    /**
     * Caches the results of an `async` function. When creating a hash to store
     * function results against, the callback is omitted from the hash and an
     * optional hash function can be used.
     *
     * If no hash function is specified, the first argument is used as a hash key,
     * which may work reasonably if it is a string or a data type that converts to a
     * distinct string. Note that objects and arrays will not behave reasonably.
     * Neither will cases where the other arguments are significant. In such cases,
     * specify your own hash function.
     *
     * The cache of results is exposed as the `memo` property of the function
     * returned by `memoize`.
     *
     * @name memoize
     * @static
     * @memberOf async
     * @category Util
     * @param {Function} fn - The function to proxy and cache results from.
     * @param {Function} hasher - An optional function for generating a custom hash
     * for storing results. It has all the arguments applied to it apart from the
     * callback, and must be synchronous.
     * @example
     *
     * var slow_fn = function(name, callback) {
     *     // do something
     *     callback(null, result);
     * };
     * var fn = async.memoize(slow_fn);
     *
     * // fn can now be used as if it were slow_fn
     * fn('some name', function() {
     *     // callback
     * });
     */
    function memoize$1(fn, hasher) {
        var memo = Object.create(null);
        var queues = Object.create(null);
        hasher = hasher || identity;
        var memoized = initialParams(function memoized(args, callback) {
            var key = hasher.apply(null, args);
            if (has(memo, key)) {
                setImmediate$1(function () {
                    callback.apply(null, memo[key]);
                });
            } else if (has(queues, key)) {
                queues[key].push(callback);
            } else {
                queues[key] = [callback];
                fn.apply(null, args.concat([rest(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    }

    /**
     * Calls `callback` on a later loop around the event loop. In Node.js this just
     * calls `setImmediate`.  In the browser it will use `setImmediate` if
     * available, otherwise `setTimeout(callback, 0)`, which means other higher
     * priority events may precede the execution of `callback`.
     *
     * This is used internally for browser-compatibility purposes.
     *
     * @name nextTick
     * @static
     * @memberOf async
     * @alias setImmediate
     * @category Util
     * @param {Function} callback - The function to call on a later loop around
     * the event loop. Invoked with (args...).
     * @param {...*} args... - any number of additional arguments to pass to the
     * callback on the next tick.
     * @example
     *
     * var call_order = [];
     * async.nextTick(function() {
     *     call_order.push('two');
     *     // call_order now equals ['one','two']
     * });
     * call_order.push('one');
     *
     * async.setImmediate(function (a, b, c) {
     *     // a, b, and c equal 1, 2, and 3
     * }, 1, 2, 3);
     */
    var _defer$1;

    if (hasNextTick) {
        _defer$1 = process.nextTick;
    } else if (hasSetImmediate) {
        _defer$1 = setImmediate;
    } else {
        _defer$1 = fallback;
    }

    var nextTick = wrap(_defer$1);

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(rest(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    /**
     * The same as `parallel` but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name parallel
     * @static
     * @memberOf async
     * @see async.parallel
     * @category Control Flow
     * @param {Array|Collection} tasks - A collection containing functions to run.
     * Each function is passed a `callback(err, result)` which it must call on
     * completion with an error `err` (which can be `null`) and an optional `result`
     * value.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed successfully. This function gets a results array
     * (or object) containing all the result arguments passed to the task callbacks.
     * Invoked with (err, results).
     */
    function parallelLimit(tasks, limit, cb) {
      return _parallel(_eachOfLimit(limit), tasks, cb);
    }

    /**
     * Run the `tasks` collection of functions in parallel, without waiting until
     * the previous function has completed. If any of the functions pass an error to
     * its callback, the main `callback` is immediately called with the value of the
     * error. Once the `tasks` have completed, the results are passed to the final
     * `callback` as an array.
     *
     * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
     * parallel execution of code.  If your tasks do not use any timers or perform
     * any I/O, they will actually be executed in series.  Any synchronous setup
     * sections for each task will happen one after the other.  JavaScript remains
     * single-threaded.
     *
     * It is also possible to use an object instead of an array. Each property will
     * be run as a function and the results will be passed to the final `callback`
     * as an object instead of an array. This can be a more readable way of handling
     * results from {@link async.parallel}.
     *
     * @name parallel
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Array|Object} tasks - A collection containing functions to run.
     * Each function is passed a `callback(err, result)` which it must call on
     * completion with an error `err` (which can be `null`) and an optional `result`
     * value.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed successfully. This function gets a results array
     * (or object) containing all the result arguments passed to the task callbacks.
     * Invoked with (err, results).
     * @example
     * async.parallel([
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ],
     * // optional callback
     * function(err, results) {
     *     // the results array will equal ['one','two'] even though
     *     // the second function had a shorter timeout.
     * });
     *
     * // an example using an object instead of an array
     * async.parallel({
     *     one: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 1);
     *         }, 200);
     *     },
     *     two: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 2);
     *         }, 100);
     *     }
     * }, function(err, results) {
     *     // results is now equals to: {one: 1, two: 2}
     * });
     */
    var parallel = doLimit(parallelLimit, Infinity);

    /**
     * A queue of tasks for the worker function to complete.
     * @typedef {Object} queue
     * @property {Function} length - a function returning the number of items
     * waiting to be processed. Invoke with ().
     * @property {Function} started - a function returning whether or not any
     * items have been pushed and processed by the queue. Invoke with ().
     * @property {Function} running - a function returning the number of items
     * currently being processed. Invoke with ().
     * @property {Function} workersList - a function returning the array of items
     * currently being processed. Invoke with ().
     * @property {Function} idle - a function returning false if there are items
     * waiting or being processed, or true if not. Invoke with ().
     * @property {number} concurrency - an integer for determining how many `worker`
     * functions should be run in parallel. This property can be changed after a
     * `queue` is created to alter the concurrency on-the-fly.
     * @property {Function} push - add a new task to the `queue`. Calls `callback`
     * once the `worker` has finished processing the task. Instead of a single task,
     * a `tasks` array can be submitted. The respective callback is used for every
     * task in the list. Invoke with (task, [callback]),
     * @property {Function} unshift - add a new task to the front of the `queue`.
     * Invoke with (task, [callback]).
     * @property {Function} saturated - a callback that is called when the number of
     * running workers hits the `concurrency` limit, and further tasks will be
     * queued.
     * @property {Function} unsaturated - a callback that is called when the number
     * of running workers is less than the `concurrency` & `buffer` limits, and
     * further tasks will not be queued.
     * @property {number} buffer - A minimum threshold buffer in order to say that
     * the `queue` is `unsaturated`.
     * @property {Function} empty - a callback that is called when the last item
     * from the `queue` is given to a `worker`.
     * @property {Function} drain - a callback that is called when the last item
     * from the `queue` has returned from the `worker`.
     * @property {Function} error - a callback that is called when a task errors.
     * Has the signature `function(error, task)`.
     * @property {boolean} paused - a boolean for determining whether the queue is
     * in a paused state.
     * @property {Function} pause - a function that pauses the processing of tasks
     * until `resume()` is called. Invoke with ().
     * @property {Function} resume - a function that resumes the processing of
     * queued tasks when the queue is paused. Invoke with ().
     * @property {Function} kill - a function that removes the `drain` callback and
     * empties remaining tasks from the queue forcing it to go idle. Invoke with ().
     */

    /**
     * Creates a `queue` object with the specified `concurrency`. Tasks added to the
     * `queue` are processed in parallel (up to the `concurrency` limit). If all
     * `worker`s are in progress, the task is queued until one becomes available.
     * Once a `worker` completes a `task`, that `task`'s callback is called.
     *
     * @name queue
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Function} worker - An asynchronous function for processing a queued
     * task, which must call its `callback(err)` argument when finished, with an
     * optional `error` as an argument.  If you want to handle errors from an
     * individual task, pass a callback to `q.push()`. Invoked with
     * (task, callback).
     * @param {number} [concurrency=1] - An `integer` for determining how many
     * `worker` functions should be run in parallel.  If omitted, the concurrency
     * defaults to `1`.  If the concurrency is `0`, an error is thrown.
     * @returns {queue} A queue object to manage the tasks. Callbacks can
     * attached as certain properties to listen for specific events during the
     * lifecycle of the queue.
     * @example
     *
     * // create a queue object with concurrency 2
     * var q = async.queue(function(task, callback) {
     *     console.log('hello ' + task.name);
     *     callback();
     * }, 2);
     *
     * // assign a callback
     * q.drain = function() {
     *     console.log('all items have been processed');
     * };
     *
     * // add some items to the queue
     * q.push({name: 'foo'}, function(err) {
     *     console.log('finished processing foo');
     * });
     * q.push({name: 'bar'}, function (err) {
     *     console.log('finished processing bar');
     * });
     *
     * // add some items to the queue (batch-wise)
     * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
     *     console.log('finished processing item');
     * });
     *
     * // add some items to the front of the queue
     * q.unshift({name: 'bar'}, function (err) {
     *     console.log('finished processing bar');
     * });
     */
    function queue$1 (worker, concurrency) {
      return queue(function (items, cb) {
        worker(items[0], cb);
      }, concurrency, 1);
    }

    /**
     * The same as {@link async.queue} only tasks are assigned a priority and
     * completed in ascending priority order.
     *
     * @name priorityQueue
     * @static
     * @memberOf async
     * @see async.queue
     * @category Control Flow
     * @param {Function} worker - An asynchronous function for processing a queued
     * task, which must call its `callback(err)` argument when finished, with an
     * optional `error` as an argument.  If you want to handle errors from an
     * individual task, pass a callback to `q.push()`. Invoked with
     * (task, callback).
     * @param {number} concurrency - An `integer` for determining how many `worker`
     * functions should be run in parallel.  If omitted, the concurrency defaults to
     * `1`.  If the concurrency is `0`, an error is thrown.
     * @returns {queue} A priorityQueue object to manage the tasks. There are two
     * differences between `queue` and `priorityQueue` objects:
     * * `push(task, priority, [callback])` - `priority` should be a number. If an
     *   array of `tasks` is given, all tasks will be assigned the same priority.
     * * The `unshift` method was removed.
     */
    function priorityQueue (worker, concurrency) {
        function _compareTasks(a, b) {
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + (end - beg + 1 >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== 'function') {
                throw new Error('task callback must be a function');
            }
            q.started = true;
            if (!isArray(data)) {
                data = [data];
            }
            if (data.length === 0) {
                // call drain immediately if there are no tasks
                return setImmediate$1(function () {
                    q.drain();
                });
            }
            arrayEach(data, function (task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                setImmediate$1(q.process);
            });
        }

        // Start with a normal queue
        var q = queue$1(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    }

    /**
     * Creates a `baseEach` or `baseEachRight` function.
     *
     * @private
     * @param {Function} eachFunc The function to iterate over a collection.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Function} Returns the new base function.
     */
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length,
            index = fromRight ? length : -1,
            iterable = Object(collection);

        while ((fromRight ? index-- : ++index < length)) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }

    /**
     * The base implementation of `_.forEach` without support for iteratee shorthands.
     *
     * @private
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     */
    var baseEach = createBaseEach(baseForOwn);

    /**
     * Iterates over elements of `collection` and invokes `iteratee` for each element.
     * The iteratee is invoked with three arguments: (value, index|key, collection).
     * Iteratee functions may exit iteration early by explicitly returning `false`.
     *
     * **Note:** As with other "Collections" methods, objects with a "length"
     * property are iterated like arrays. To avoid this behavior use `_.forIn`
     * or `_.forOwn` for object iteration.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @alias each
     * @category Collection
     * @param {Array|Object} collection The collection to iterate over.
     * @param {Function} [iteratee=_.identity] The function invoked per iteration.
     * @returns {Array|Object} Returns `collection`.
     * @see _.forEachRight
     * @example
     *
     * _([1, 2]).forEach(function(value) {
     *   console.log(value);
     * });
     * // => Logs `1` then `2`.
     *
     * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
     *   console.log(key);
     * });
     * // => Logs 'a' then 'b' (iteration order is not guaranteed).
     */
    function forEach(collection, iteratee) {
      var func = isArray(collection) ? arrayEach : baseEach;
      return func(collection, baseIteratee(iteratee, 3));
    }

    /**
     * Runs the `tasks` array of functions in parallel, without waiting until the
     * previous function has completed. Once any the `tasks` completed or pass an
     * error to its callback, the main `callback` is immediately called. It's
     * equivalent to `Promise.race()`.
     *
     * @name race
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Array} tasks - An array containing functions to run. Each function
     * is passed a `callback(err, result)` which it must call on completion with an
     * error `err` (which can be `null`) and an optional `result` value.
     * @param {Function} callback - A callback to run once any of the functions have
     * completed. This function gets an error or result from the first function that
     * completed. Invoked with (err, result).
     * @example
     *
     * async.race([
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ],
     * // main callback
     * function(err, result) {
     *     // the result will be equal to 'two' as it finishes earlier
     * });
     */
    function race(tasks, cb) {
        cb = once(cb || noop);
        if (!isArray(tasks)) return cb(new TypeError('First argument to race must be an array of functions'));
        if (!tasks.length) return cb();
        forEach(tasks, function (task) {
            task(cb);
        });
    }

    var slice = Array.prototype.slice;

    /**
     * Same as `reduce`, only operates on `coll` in reverse order.
     *
     * @name reduceRight
     * @static
     * @memberOf async
     * @see async.reduce
     * @alias foldr
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {*} memo - The initial state of the reduction.
     * @param {Function} iteratee - A function applied to each item in the
     * array to produce the next step in the reduction. The `iteratee` is passed a
     * `callback(err, reduction)` which accepts an optional error as its first
     * argument, and the state of the reduction as the second. If an error is
     * passed to the callback, the reduction is stopped and the main `callback` is
     * immediately called with the error. Invoked with (memo, item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the reduced value. Invoked with
     * (err, result).
     */
    function reduceRight(arr, memo, iteratee, cb) {
      var reversed = slice.call(arr).reverse();
      reduce(reversed, memo, iteratee, cb);
    }

    /**
     * Wraps the function in another function that always returns data even when it
     * errors.
     *
     * The object returned has either the property `error` or `value`.
     *
     * @name reflect
     * @static
     * @memberOf async
     * @category Util
     * @param {Function} function - The function you want to wrap
     * @returns {Function} - A function that always passes null to it's callback as
     * the error. The second argument to the callback will be an `object` with
     * either an `error` or a `value` property.
     * @example
     *
     * async.parallel([
     *     async.reflect(function(callback) {
     *         // do some stuff ...
     *         callback(null, 'one');
     *     }),
     *     async.reflect(function(callback) {
     *         // do some more stuff but error ...
     *         callback('bad stuff happened');
     *     }),
     *     async.reflect(function(callback) {
     *         // do some more stuff ...
     *         callback(null, 'two');
     *     })
     * ],
     * // optional callback
     * function(err, results) {
     *     // values
     *     // results[0].value = 'one'
     *     // results[1].error = 'bad stuff happened'
     *     // results[2].value = 'two'
     * });
     */
    function reflect(fn) {
        return initialParams(function reflectOn(args, reflectCallback) {
            args.push(rest(function callback(err, cbArgs) {
                if (err) {
                    reflectCallback(null, {
                        error: err
                    });
                } else {
                    var value = null;
                    if (cbArgs.length === 1) {
                        value = cbArgs[0];
                    } else if (cbArgs.length > 1) {
                        value = cbArgs;
                    }
                    reflectCallback(null, {
                        value: value
                    });
                }
            }));

            return fn.apply(this, args);
        });
    }

    function reject$1(eachfn, arr, iteratee, callback) {
        _filter(eachfn, arr, function (value, cb) {
            iteratee(value, function (err, v) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, !v);
                }
            });
        }, callback);
    }

    /**
     * The same as `reject` but runs a maximum of `limit` async operations at a
     * time.
     *
     * @name rejectLimit
     * @static
     * @memberOf async
     * @see async.reject
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     */
    var rejectLimit = doParallelLimit(reject$1);

    /**
     * The opposite of `filter`. Removes values that pass an `async` truth test.
     *
     * @name reject
     * @static
     * @memberOf async
     * @see async.filter
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     * @example
     *
     * async.reject(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, results) {
     *     // results now equals an array of missing files
     *     createFiles(results);
     * });
     */
    var reject = doLimit(rejectLimit, Infinity);

    /**
     * A helper function that wraps an array of functions with reflect.
     *
     * @name reflectAll
     * @static
     * @memberOf async
     * @see async.reflect
     * @category Util
     * @param {Array} tasks - The array of functions to wrap in `async.reflect`.
     * @returns {Array} Returns an array of functions, each function wrapped in
     * `async.reflect`
     * @example
     *
     * let tasks = [
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'one');
     *         }, 200);
     *     },
     *     function(callback) {
     *         // do some more stuff but error ...
     *         callback(new Error('bad stuff happened'));
     *     },
     *     function(callback) {
     *         setTimeout(function() {
     *             callback(null, 'two');
     *         }, 100);
     *     }
     * ];
     *
     * async.parallel(async.reflectAll(tasks),
     * // optional callback
     * function(err, results) {
     *     // values
     *     // results[0].value = 'one'
     *     // results[1].error = Error('bad stuff happened')
     *     // results[2].value = 'two'
     * });
     */
    function reflectAll(tasks) {
      return tasks.map(reflect);
    }

    /**
     * The same as `reject` but runs only a single async operation at a time.
     *
     * @name rejectSeries
     * @static
     * @memberOf async
     * @see async.reject
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in `coll`.
     * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
     * with a boolean argument once it has completed. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Invoked with (err, results).
     */
    var rejectSeries = doLimit(rejectLimit, 1);

    /**
     * Run the functions in the `tasks` collection in series, each one running once
     * the previous function has completed. If any functions in the series pass an
     * error to its callback, no more functions are run, and `callback` is
     * immediately called with the value of the error. Otherwise, `callback`
     * receives an array of results when `tasks` have completed.
     *
     * It is also possible to use an object instead of an array. Each property will
     * be run as a function, and the results will be passed to the final `callback`
     * as an object instead of an array. This can be a more readable way of handling
     *  results from {@link async.series}.
     *
     * **Note** that while many implementations preserve the order of object
     * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
     * explicitly states that
     *
     * > The mechanics and order of enumerating the properties is not specified.
     *
     * So if you rely on the order in which your series of functions are executed,
     * and want this to work on all platforms, consider using an array.
     *
     * @name series
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Array|Object} tasks - A collection containing functions to run, each
     * function is passed a `callback(err, result)` it must call on completion with
     * an error `err` (which can be `null`) and an optional `result` value.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed. This function gets a results array (or object)
     * containing all the result arguments passed to the `task` callbacks. Invoked
     * with (err, result).
     * @example
     * async.series([
     *     function(callback) {
     *         // do some stuff ...
     *         callback(null, 'one');
     *     },
     *     function(callback) {
     *         // do some more stuff ...
     *         callback(null, 'two');
     *     }
     * ],
     * // optional callback
     * function(err, results) {
     *     // results is now equal to ['one', 'two']
     * });
     *
     * async.series({
     *     one: function(callback) {
     *         setTimeout(function() {
     *             callback(null, 1);
     *         }, 200);
     *     },
     *     two: function(callback){
     *         setTimeout(function() {
     *             callback(null, 2);
     *         }, 100);
     *     }
     * }, function(err, results) {
     *     // results is now equal to: {one: 1, two: 2}
     * });
     */
    function series(tasks, cb) {
      return _parallel(eachOfSeries, tasks, cb);
    }

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Util
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new constant function.
     * @example
     *
     * var objects = _.times(2, _.constant({ 'a': 1 }));
     *
     * console.log(objects);
     * // => [{ 'a': 1 }, { 'a': 1 }]
     *
     * console.log(objects[0] === objects[1]);
     * // => true
     */
    function constant$1(value) {
      return function() {
        return value;
      };
    }

    /**
     * Attempts to get a successful response from `task` no more than `times` times
     * before returning an error. If the task is successful, the `callback` will be
     * passed the result of the successful task. If all attempts fail, the callback
     * will be passed the error and result (if any) of the final attempt.
     *
     * @name retry
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
     * object with `times` and `interval` or a number.
     * * `times` - The number of attempts to make before giving up.  The default
     *   is `5`.
     * * `interval` - The time to wait between retries, in milliseconds.  The
     *   default is `0`. The interval may also be specified as a function of the
     *   retry count (see example).
     * * If `opts` is a number, the number specifies the number of times to retry,
     *   with the default interval of `0`.
     * @param {Function} task - A function which receives two arguments: (1) a
     * `callback(err, result)` which must be called when finished, passing `err`
     * (which can be `null`) and the `result` of the function's execution, and (2)
     * a `results` object, containing the results of the previously executed
     * functions (if nested inside another control flow). Invoked with
     * (callback, results).
     * @param {Function} [callback] - An optional callback which is called when the
     * task has succeeded, or after the final failed attempt. It receives the `err`
     * and `result` arguments of the last attempt at completing the `task`. Invoked
     * with (err, results).
     * @example
     *
     * // The `retry` function can be used as a stand-alone control flow by passing
     * // a callback, as shown below:
     *
     * // try calling apiMethod 3 times
     * async.retry(3, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod 3 times, waiting 200 ms between each retry
     * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod 10 times with exponential backoff
     * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
     * async.retry({
     *   times: 10,
     *   interval: function(retryCount) {
     *     return 50 * Math.pow(2, retryCount);
     *   }
     * }, apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // try calling apiMethod the default 5 times no delay between each retry
     * async.retry(apiMethod, function(err, result) {
     *     // do something with the result
     * });
     *
     * // It can also be embedded within other control flow functions to retry
     * // individual methods that are not as reliable, like this:
     * async.auto({
     *     users: api.getUsers.bind(api),
     *     payments: async.retry(3, api.getPayments.bind(api))
     * }, function(err, results) {
     *     // do something with the results
     * });
     */
    function retry(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var opts = {
            times: DEFAULT_TIMES,
            intervalFunc: constant$1(DEFAULT_INTERVAL)
        };

        function parseTimes(acc, t) {
            if (typeof t === 'object') {
                acc.times = +t.times || DEFAULT_TIMES;

                acc.intervalFunc = typeof t.interval === 'function' ? t.interval : constant$1(+t.interval || DEFAULT_INTERVAL);
            } else if (typeof t === 'number' || typeof t === 'string') {
                acc.times = +t || DEFAULT_TIMES;
            } else {
                throw new Error("Invalid arguments for async.retry");
            }
        }

        if (arguments.length < 3 && typeof times === 'function') {
            callback = task || noop;
            task = times;
        } else {
            parseTimes(opts, times);
            callback = callback || noop;
        }

        if (typeof task !== 'function') {
            throw new Error("Invalid arguments for async.retry");
        }

        var attempts = [];
        for (var i = 1; i < opts.times + 1; i++) {
            var isFinalAttempt = i == opts.times;
            attempts.push(retryAttempt(isFinalAttempt));
            var interval = opts.intervalFunc(i);
            if (!isFinalAttempt && interval > 0) {
                attempts.push(retryInterval(interval));
            }
        }

        series(attempts, function (done, data) {
            data = data[data.length - 1];
            callback(data.err, data.result);
        });

        function retryAttempt(isFinalAttempt) {
            return function (seriesCallback) {
                task(function (err, result) {
                    seriesCallback(!err || isFinalAttempt, {
                        err: err,
                        result: result
                    });
                });
            };
        }

        function retryInterval(interval) {
            return function (seriesCallback) {
                setTimeout(function () {
                    seriesCallback(null);
                }, interval);
            };
        }
    }

    /**
     * A close relative of `retry`.  This method wraps a task and makes it
     * retryable, rather than immediately calling it with retries.
     *
     * @name retryable
     * @static
     * @memberOf async
     * @see async.retry
     * @category Control Flow
     * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
     * options, exactly the same as from `retry`
     * @param {Function} task - the asynchronous function to wrap
     * @returns {Functions} The wrapped function, which when invoked, will retry on
     * an error, based on the parameters specified in `opts`.
     * @example
     *
     * async.auto({
     *     dep1: async.retryable(3, getFromFlakyService),
     *     process: ["dep1", async.retryable(3, function (results, cb) {
     *         maybeProcessData(results.dep1, cb);
     *     })]
     * }, callback);
     */
    function retryable (opts, task) {
        if (!task) {
            task = opts;
            opts = null;
        }
        return initialParams(function (args, callback) {
            function taskFn(cb) {
                task.apply(null, args.concat([cb]));
            }

            if (opts) retry(opts, taskFn, callback);else retry(taskFn, callback);
        });
    }

    /**
     * The same as `some` but runs a maximum of `limit` async operations at a time.
     *
     * @name someLimit
     * @static
     * @memberOf async
     * @see async.some
     * @alias anyLimit
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - A truth test to apply to each item in the array
     * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
     * be called with a boolean argument once it has completed. Invoked with
     * (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     */
    var someLimit = _createTester(eachOfLimit, Boolean, identity);

    /**
     * Returns `true` if at least one element in the `coll` satisfies an async test.
     * If any iteratee call returns `true`, the main `callback` is immediately
     * called.
     *
     * @name some
     * @static
     * @memberOf async
     * @alias any
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in the array
     * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
     * be called with a boolean argument once it has completed. Invoked with
     * (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     * @example
     *
     * async.some(['file1','file2','file3'], function(filePath, callback) {
     *     fs.access(filePath, function(err) {
     *         callback(null, !err)
     *     });
     * }, function(err, result) {
     *     // if result is true then at least one of the files exists
     * });
     */
    var some = doLimit(someLimit, Infinity);

    /**
     * The same as `some` but runs only a single async operation at a time.
     *
     * @name someSeries
     * @static
     * @memberOf async
     * @see async.some
     * @alias anySeries
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A truth test to apply to each item in the array
     * in parallel. The iteratee is passed a `callback(err, truthValue)` which must
     * be called with a boolean argument once it has completed. Invoked with
     * (item, callback).
     * @param {Function} [callback] - A callback which is called as soon as any
     * iteratee returns `true`, or after all the iteratee functions have finished.
     * Result will be either `true` or `false` depending on the values of the async
     * tests. Invoked with (err, result).
     */
    var someSeries = doLimit(someLimit, 1);

    /**
     * Sorts a list by the results of running each `coll` value through an async
     * `iteratee`.
     *
     * @name sortBy
     * @static
     * @memberOf async
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {Function} iteratee - A function to apply to each item in `coll`.
     * The iteratee is passed a `callback(err, sortValue)` which must be called once
     * it has completed with an error (which can be `null`) and a value to use as
     * the sort criteria. Invoked with (item, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished, or an error occurs. Results is the items
     * from the original `coll` sorted by the values returned by the `iteratee`
     * calls. Invoked with (err, results).
     * @example
     *
     * async.sortBy(['file1','file2','file3'], function(file, callback) {
     *     fs.stat(file, function(err, stats) {
     *         callback(err, stats.mtime);
     *     });
     * }, function(err, results) {
     *     // results is now the original array of files sorted by
     *     // modified date
     * });
     *
     * // By modifying the callback parameter the
     * // sorting order can be influenced:
     *
     * // ascending order
     * async.sortBy([1,9,3,5], function(x, callback) {
     *     callback(null, x);
     * }, function(err,result) {
     *     // result callback
     * });
     *
     * // descending order
     * async.sortBy([1,9,3,5], function(x, callback) {
     *     callback(null, x*-1);    //<- x*-1 instead of x, turns the order around
     * }, function(err,result) {
     *     // result callback
     * });
     */
    function sortBy(arr, iteratee, cb) {
        map(arr, function (x, cb) {
            iteratee(x, function (err, criteria) {
                if (err) return cb(err);
                cb(null, { value: x, criteria: criteria });
            });
        }, function (err, results) {
            if (err) return cb(err);
            cb(null, arrayMap(results.sort(comparator), baseProperty('value')));
        });

        function comparator(left, right) {
            var a = left.criteria,
                b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    }

    /**
     * Sets a time limit on an asynchronous function. If the function does not call
     * its callback within the specified miliseconds, it will be called with a
     * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
     *
     * @name timeout
     * @static
     * @memberOf async
     * @category Util
     * @param {Function} function - The asynchronous function you want to set the
     * time limit.
     * @param {number} miliseconds - The specified time limit.
     * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
     * to timeout Error for more information..
     * @returns {Function} Returns a wrapped function that can be used with any of
     * the control flow functions.
     * @example
     *
     * async.timeout(function(callback) {
     *     doAsyncTask(callback);
     * }, 1000);
     */
    function timeout(asyncFn, miliseconds, info) {
        var originalCallback, timer;
        var timedOut = false;

        function injectedCallback() {
            if (!timedOut) {
                originalCallback.apply(null, arguments);
                clearTimeout(timer);
            }
        }

        function timeoutCallback() {
            var name = asyncFn.name || 'anonymous';
            var error = new Error('Callback function "' + name + '" timed out.');
            error.code = 'ETIMEDOUT';
            if (info) {
                error.info = info;
            }
            timedOut = true;
            originalCallback(error);
        }

        return initialParams(function (args, origCallback) {
            originalCallback = origCallback;
            // setup timer and call original function
            timer = setTimeout(timeoutCallback, miliseconds);
            asyncFn.apply(null, args.concat(injectedCallback));
        });
    }

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeCeil = Math.ceil;
    var nativeMax$1 = Math.max;
    /**
     * The base implementation of `_.range` and `_.rangeRight` which doesn't
     * coerce arguments to numbers.
     *
     * @private
     * @param {number} start The start of the range.
     * @param {number} end The end of the range.
     * @param {number} step The value to increment or decrement by.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {Array} Returns the range of numbers.
     */
    function baseRange(start, end, step, fromRight) {
      var index = -1,
          length = nativeMax$1(nativeCeil((end - start) / (step || 1)), 0),
          result = Array(length);

      while (length--) {
        result[fromRight ? length : ++index] = start;
        start += step;
      }
      return result;
    }

    /**
    * The same as {@link times} but runs a maximum of `limit` async operations at a
    * time.
     *
     * @name timesLimit
     * @static
     * @memberOf async
     * @see async.times
     * @category Control Flow
     * @param {number} n - The number of times to run the function.
     * @param {number} limit - The maximum number of async operations at a time.
     * @param {Function} iteratee - The function to call `n` times. Invoked with the
     * iteration index and a callback (n, next).
     * @param {Function} callback - see {@link async.map}.
     */
    function timeLimit(count, limit, iteratee, cb) {
      return mapLimit(baseRange(0, count, 1), limit, iteratee, cb);
    }

    /**
     * Calls the `iteratee` function `n` times, and accumulates results in the same
     * manner you would use with {@link async.map}.
     *
     * @name times
     * @static
     * @memberOf async
     * @see async.map
     * @category Control Flow
     * @param {number} n - The number of times to run the function.
     * @param {Function} iteratee - The function to call `n` times. Invoked with the
     * iteration index and a callback (n, next).
     * @param {Function} callback - see {@link async.map}.
     * @example
     *
     * // Pretend this is some complicated async factory
     * var createUser = function(id, callback) {
     *     callback(null, {
     *         id: 'user' + id
     *     });
     * };
     *
     * // generate 5 users
     * async.times(5, function(n, next) {
     *     createUser(n, function(err, user) {
     *         next(err, user);
     *     });
     * }, function(err, users) {
     *     // we should now have 5 users
     * });
     */
    var times = doLimit(timeLimit, Infinity);

    /**
     * The same as {@link async.times} but runs only a single async operation at a time.
     *
     * @name timesSeries
     * @static
     * @memberOf async
     * @see async.times
     * @category Control Flow
     * @param {number} n - The number of times to run the function.
     * @param {Function} iteratee - The function to call `n` times. Invoked with the
     * iteration index and a callback (n, next).
     * @param {Function} callback - see {@link async.map}.
     */
    var timesSeries = doLimit(timeLimit, 1);

    /**
     * A relative of `reduce`.  Takes an Object or Array, and iterates over each
     * element in series, each step potentially mutating an `accumulator` value.
     * The type of the accumulator defaults to the type of collection passed in.
     *
     * @name transform
     * @static
     * @memberOf async
     * @category Collection
     * @param {Array|Object} coll - A collection to iterate over.
     * @param {*} [accumulator] - The initial state of the transform.  If omitted,
     * it will default to an empty Object or Array, depending on the type of `coll`
     * @param {Function} iteratee - A function applied to each item in the
     * collection that potentially modifies the accumulator. The `iteratee` is
     * passed a `callback(err)` which accepts an optional error as its first
     * argument. If an error is passed to the callback, the transform is stopped
     * and the main `callback` is immediately called with the error.
     * Invoked with (accumulator, item, key, callback).
     * @param {Function} [callback] - A callback which is called after all the
     * `iteratee` functions have finished. Result is the transformed accumulator.
     * Invoked with (err, result).
     * @example
     *
     * async.transform([1,2,3], function(acc, item, index, callback) {
     *     // pointless async:
     *     process.nextTick(function() {
     *         acc.push(item * 2)
     *         callback(null)
     *     });
     * }, function(err, result) {
     *     // result is now equal to [2, 4, 6]
     * });
     *
     * @example
     *
     * async.transform({a: 1, b: 2, c: 3}, function (obj, val, key, callback) {
     *     setImmediate(function () {
     *         obj[key] = val * 2;
     *         callback();
     *     })
     * }, function (err, result) {
     *     // result is equal to {a: 2, b: 4, c: 6}
     * })
     */
    function transform(arr, acc, iteratee, callback) {
        if (arguments.length === 3) {
            callback = iteratee;
            iteratee = acc;
            acc = isArray(arr) ? [] : {};
        }

        eachOf(arr, function (v, k, cb) {
            iteratee(acc, v, k, cb);
        }, function (err) {
            callback(err, acc);
        });
    }

    /**
     * Undoes a {@link async.memoize}d function, reverting it to the original,
     * unmemoized form. Handy for testing.
     *
     * @name unmemoize
     * @static
     * @memberOf async
     * @see async.memoize
     * @category Util
     * @param {Function} fn - the memoized function
     */
    function unmemoize(fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    }

    /**
     * Repeatedly call `fn` until `test` returns `true`. Calls `callback` when
     * stopped, or an error occurs. `callback` will be passed an error and any
     * arguments passed to the final `fn`'s callback.
     *
     * The inverse of {@link async.whilst}.
     *
     * @name until
     * @static
     * @memberOf async
     * @see async.whilst
     * @category Control Flow
     * @param {Function} test - synchronous truth test to perform before each
     * execution of `fn`. Invoked with ().
     * @param {Function} fn - A function which is called each time `test` fails.
     * The function is passed a `callback(err)`, which must be called once it has
     * completed with an optional `err` argument. Invoked with (callback).
     * @param {Function} [callback] - A callback which is called after the test
     * function has passed and repeated execution of `fn` has stopped. `callback`
     * will be passed an error and any arguments passed to the final `fn`'s
     * callback. Invoked with (err, [results]);
     */
    function until(test, iteratee, cb) {
        return whilst(function () {
            return !test.apply(this, arguments);
        }, iteratee, cb);
    }

    /**
     * Runs the `tasks` array of functions in series, each passing their results to
     * the next in the array. However, if any of the `tasks` pass an error to their
     * own callback, the next function is not executed, and the main `callback` is
     * immediately called with the error.
     *
     * @name waterfall
     * @static
     * @memberOf async
     * @category Control Flow
     * @param {Array} tasks - An array of functions to run, each function is passed
     * a `callback(err, result1, result2, ...)` it must call on completion. The
     * first argument is an error (which can be `null`) and any further arguments
     * will be passed as arguments in order to the next task.
     * @param {Function} [callback] - An optional callback to run once all the
     * functions have completed. This will be passed the results of the last task's
     * callback. Invoked with (err, [results]).
     * @example
     *
     * async.waterfall([
     *     function(callback) {
     *         callback(null, 'one', 'two');
     *     },
     *     function(arg1, arg2, callback) {
     *         // arg1 now equals 'one' and arg2 now equals 'two'
     *         callback(null, 'three');
     *     },
     *     function(arg1, callback) {
     *         // arg1 now equals 'three'
     *         callback(null, 'done');
     *     }
     * ], function (err, result) {
     *     // result now equals 'done'
     * });
     *
     * // Or, with named functions:
     * async.waterfall([
     *     myFirstFunction,
     *     mySecondFunction,
     *     myLastFunction,
     * ], function (err, result) {
     *     // result now equals 'done'
     * });
     * function myFirstFunction(callback) {
     *     callback(null, 'one', 'two');
     * }
     * function mySecondFunction(arg1, arg2, callback) {
     *     // arg1 now equals 'one' and arg2 now equals 'two'
     *     callback(null, 'three');
     * }
     * function myLastFunction(arg1, callback) {
     *     // arg1 now equals 'three'
     *     callback(null, 'done');
     * }
     */
    function waterfall (tasks, cb) {
        cb = once(cb || noop);
        if (!isArray(tasks)) return cb(new Error('First argument to waterfall must be an array of functions'));
        if (!tasks.length) return cb();
        var taskIndex = 0;

        function nextTask(args) {
            if (taskIndex === tasks.length) {
                return cb.apply(null, [null].concat(args));
            }

            var taskCallback = onlyOnce(rest(function (err, args) {
                if (err) {
                    return cb.apply(null, [err].concat(args));
                }
                nextTask(args);
            }));

            args.push(taskCallback);

            var task = tasks[taskIndex++];
            task.apply(null, args);
        }

        nextTask([]);
    }

    var index = {
        applyEach: applyEach,
        applyEachSeries: applyEachSeries,
        apply: apply$1,
        asyncify: asyncify,
        auto: auto,
        autoInject: autoInject,
        cargo: cargo,
        compose: compose,
        concat: concat,
        concatSeries: concatSeries,
        constant: constant,
        detect: detect,
        detectLimit: detectLimit,
        detectSeries: detectSeries,
        dir: dir,
        doDuring: doDuring,
        doUntil: doUntil,
        doWhilst: doWhilst,
        during: during,
        each: each,
        eachLimit: eachLimit,
        eachOf: eachOf,
        eachOfLimit: eachOfLimit,
        eachOfSeries: eachOfSeries,
        eachSeries: eachSeries,
        ensureAsync: ensureAsync,
        every: every,
        everyLimit: everyLimit,
        everySeries: everySeries,
        filter: filter,
        filterLimit: filterLimit,
        filterSeries: filterSeries,
        forever: forever,
        iterator: iterator$1,
        log: log,
        map: map,
        mapLimit: mapLimit,
        mapSeries: mapSeries,
        mapValues: mapValues,
        mapValuesLimit: mapValuesLimit,
        mapValuesSeries: mapValuesSeries,
        memoize: memoize$1,
        nextTick: nextTick,
        parallel: parallel,
        parallelLimit: parallelLimit,
        priorityQueue: priorityQueue,
        queue: queue$1,
        race: race,
        reduce: reduce,
        reduceRight: reduceRight,
        reflect: reflect,
        reflectAll: reflectAll,
        reject: reject,
        rejectLimit: rejectLimit,
        rejectSeries: rejectSeries,
        retry: retry,
        retryable: retryable,
        seq: seq,
        series: series,
        setImmediate: setImmediate$1,
        some: some,
        someLimit: someLimit,
        someSeries: someSeries,
        sortBy: sortBy,
        timeout: timeout,
        times: times,
        timesLimit: timeLimit,
        timesSeries: timesSeries,
        transform: transform,
        unmemoize: unmemoize,
        until: until,
        waterfall: waterfall,
        whilst: whilst,

        // aliases
        all: every,
        any: some,
        forEach: each,
        forEachSeries: eachSeries,
        forEachLimit: eachLimit,
        forEachOf: eachOf,
        forEachOfSeries: eachOfSeries,
        forEachOfLimit: eachOfLimit,
        inject: reduce,
        foldl: reduce,
        foldr: reduceRight,
        select: filter,
        selectLimit: filterLimit,
        selectSeries: filterSeries,
        wrapSync: asyncify
    };

    exports['default'] = index;
    exports.applyEach = applyEach;
    exports.applyEachSeries = applyEachSeries;
    exports.apply = apply$1;
    exports.asyncify = asyncify;
    exports.auto = auto;
    exports.autoInject = autoInject;
    exports.cargo = cargo;
    exports.compose = compose;
    exports.concat = concat;
    exports.concatSeries = concatSeries;
    exports.constant = constant;
    exports.detect = detect;
    exports.detectLimit = detectLimit;
    exports.detectSeries = detectSeries;
    exports.dir = dir;
    exports.doDuring = doDuring;
    exports.doUntil = doUntil;
    exports.doWhilst = doWhilst;
    exports.during = during;
    exports.each = each;
    exports.eachLimit = eachLimit;
    exports.eachOf = eachOf;
    exports.eachOfLimit = eachOfLimit;
    exports.eachOfSeries = eachOfSeries;
    exports.eachSeries = eachSeries;
    exports.ensureAsync = ensureAsync;
    exports.every = every;
    exports.everyLimit = everyLimit;
    exports.everySeries = everySeries;
    exports.filter = filter;
    exports.filterLimit = filterLimit;
    exports.filterSeries = filterSeries;
    exports.forever = forever;
    exports.iterator = iterator$1;
    exports.log = log;
    exports.map = map;
    exports.mapLimit = mapLimit;
    exports.mapSeries = mapSeries;
    exports.mapValues = mapValues;
    exports.mapValuesLimit = mapValuesLimit;
    exports.mapValuesSeries = mapValuesSeries;
    exports.memoize = memoize$1;
    exports.nextTick = nextTick;
    exports.parallel = parallel;
    exports.parallelLimit = parallelLimit;
    exports.priorityQueue = priorityQueue;
    exports.queue = queue$1;
    exports.race = race;
    exports.reduce = reduce;
    exports.reduceRight = reduceRight;
    exports.reflect = reflect;
    exports.reflectAll = reflectAll;
    exports.reject = reject;
    exports.rejectLimit = rejectLimit;
    exports.rejectSeries = rejectSeries;
    exports.retry = retry;
    exports.retryable = retryable;
    exports.seq = seq;
    exports.series = series;
    exports.setImmediate = setImmediate$1;
    exports.some = some;
    exports.someLimit = someLimit;
    exports.someSeries = someSeries;
    exports.sortBy = sortBy;
    exports.timeout = timeout;
    exports.times = times;
    exports.timesLimit = timeLimit;
    exports.timesSeries = timesSeries;
    exports.transform = transform;
    exports.unmemoize = unmemoize;
    exports.until = until;
    exports.waterfall = waterfall;
    exports.whilst = whilst;
    exports.all = every;
    exports.allLimit = everyLimit;
    exports.allSeries = everySeries;
    exports.any = some;
    exports.anyLimit = someLimit;
    exports.anySeries = someSeries;
    exports.find = detect;
    exports.findLimit = detectLimit;
    exports.findSeries = detectSeries;
    exports.forEach = each;
    exports.forEachSeries = eachSeries;
    exports.forEachLimit = eachLimit;
    exports.forEachOf = eachOf;
    exports.forEachOfSeries = eachOfSeries;
    exports.forEachOfLimit = eachOfLimit;
    exports.inject = reduce;
    exports.foldl = reduce;
    exports.foldr = reduceRight;
    exports.select = filter;
    exports.selectLimit = filterLimit;
    exports.selectSeries = filterSeries;
    exports.wrapSync = asyncify;

}));
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":13}],2:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function CanvasFeature(geojson, id) {
    var _this = this;

    // radius for point features
    // use to calculate mouse over/out and click events for points
    // this value should match the value used for rendering points
    this.size = 5;

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
        cache.canvasXY = null;
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

    /**
     * To options for wrapper.  One, you provide a geojson object.
     * Two, you provide a accessor method and id.  When this class
     * needs access to the GeoJSON, the id will be passed, as well
     * as the callback.
     */
    if ((typeof geojson === 'undefined' ? 'undefined' : _typeof(geojson)) === 'object') {
        this._geojson = geojson;

        // TODO: allow user to override default variable
        this.id = geojson.properties.id;

        this.type = geojson.type;
        this._getGeoJson = function (id, callback) {
            callback(this._geojson);
        };
    } else {
        this._getGeoJson = geojson;
        this._id = id;
    }

    this.getGeoJson = function (callback) {
        this._getGeoJson(this._id, callback);
    };

    this.getGeoJson(function (geojson) {
        if (geojson.geometry) {
            _this.type = geojson.geometry.type;
        } else {
            _this.type = geojson.type;
        }
    });

    // optional, per feature, renderer
    this.renderer = null;
}

module.exports = CanvasFeature;

},{}],3:[function(require,module,exports){
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

},{"./CanvasFeature":2}],4:[function(require,module,exports){
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

},{"./CanvasFeature":2,"./CanvasFeatures":3}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

    this.clearCache();

    this.render();
  };

  // clear canvas
  this.clearCanvas = function () {
    var canvas = this.getCanvas();
    var ctx = this._ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.reposition();
  };

  this.reposition = function () {
    console.log('resposition!');
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
    for (var i = 0; i < this.features.length; i++) {
      if (this.features[i].id == id) {
        return this.features[i];
      }
    }

    return null;
  };

  // get the meters per px and a certain point;
  this.getMetersPerPx = function (latlng) {
    return this.utils.metersPerPx(latlng, this._map);
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

},{"./classes/CanvasFeature":2,"./classes/CanvasFeatures":3,"./classes/factory":4,"./defaultRenderer":5,"./lib/addFeature":7,"./lib/init":8,"./lib/redraw":10,"./lib/toCanvasXY":11,"./lib/utils":12}],7:[function(require,module,exports){
'use strict';

var CanvasFeature = require('../classes/CanvasFeature');
var CanvasFeatures = require('../classes/CanvasFeatures');

module.exports = function (layer) {
  layer.addCanvasFeatures = function (features) {
    for (var i = 0; i < features.length; i++) {
      this.addCanvasFeature(features[i]);
    }
  };

  layer.addCanvasFeature = function (feature, bottom, callback) {
    var _this = this;

    if (!(feature instanceof CanvasFeature) && !(feature instanceof CanvasFeatures)) {
      throw new Error('Feature must be instance of CanvasFeature or CanvasFeatures');
    }

    prepareCanvasFeature(this, feature, function () {
      if (bottom) {
        // bottom or index
        if (typeof bottom === 'number') _this.features.splice(bottom, 0, feature);else _this.features.unshift(feature);
      } else {
        _this.features.push(feature);
      }

      if (callback) callback();
    });
  }, layer.addCanvasFeatureBottom = function (feature) {
    this.addFeature(feature, true);
  };

  // returns true if re-render required.  ie the feature was visible;
  layer.removeCanvasFeature = function (feature) {
    var index = this.features.indexOf(feature);
    if (index == -1) return;

    this.splice(index, 1);

    if (this.feature.visible) return true;
    return false;
  };

  layer.removeAll = function () {
    this.allowPanRendering = true;
    this.features = [];
  };
};

function prepareCanvasFeature(layer, canvasFeature, callback) {

  canvasFeature.getGeoJson(function (geojson) {
    var geometry = geojson.geometry;

    if (geometry.type == 'LineString') {

      canvasFeature.bounds = layer.utils.calcBounds(geometry.coordinates);
    } else if (geometry.type == 'Polygon') {
      // TODO: we only support outer rings out the moment, no inner rings.  Thus coordinates[0]
      canvasFeature.bounds = layer.utils.calcBounds(geometry.coordinates[0]);
    } else if (geometry.type == 'Point') {

      canvasFeature.latlng = L.latLng(geometry.coordinates[1], geometry.coordinates[0]);
    } else if (geometry.type == 'MultiPolygon') {

      canvasFeature.bounds = [];
      for (var i = 0; i < geometry.coordinates.length; i++) {
        canvasFeature.bounds.push(layer.utils.calcBounds(geometry.coordinates[i][0]));
      }
    } else {
      throw new Error('GeoJSON feature type "' + geometry.type + '" not supported.');
    }

    callback();
  });
}

},{"../classes/CanvasFeature":2,"../classes/CanvasFeatures":3}],8:[function(require,module,exports){
'use strict';

var intersects = require('./intersects');
var count = 0;

module.exports = function (layer) {

    layer.initialize = function (options) {
        this.features = [];
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
            'mousemove': intersects,
            'click': intersects
        }, this);

        this.reset();

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
            'mousemove': intersects,
            'click': intersects
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

},{"./intersects":9}],9:[function(require,module,exports){
'use strict';

var async = require('async');

var running = false;
var reschedule = null;

/** 
 * Handle mouse intersection events
 * e - leaflet event
 **/
function intersects(e) {
  var _this = this;

  if (!this.showing) return;

  if (running) {
    reschedule = e;
    return;
  }
  running = true;

  var t = new Date().getTime();
  var mpp = this.getMetersPerPx(e.latlng);
  var r = mpp * 5; // 5 px radius buffer;

  var center = {
    type: 'Point',
    coordinates: [e.latlng.lng, e.latlng.lat]
  };

  var f;
  var intersects = [];

  async.eachSeries(this.features, function (f, next) {
    f = _this.features[i];

    if (!f.visible) {
      return next();
    }
    if (!f.getCanvasXY()) {
      return next();
    }
    if (!isInBounds(f, e.latlng)) {
      return next();
    }

    f.getGeoJson(function (geojson) {
      if (_this.utils.geometryWithinRadius(geojson.geometry, f.getCanvasXY(), center, e.containerPoint, f.size ? f.size * mpp : r)) {
        intersects.push(f.geojson);
        next();
      }
    });
  }, function (err) {
    onIntersectsListCreated.call(_this, e, intersects);
  });
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

  if (this.debug) console.log('intersects time: ' + (new Date().getTime() - t) + 'ms');

  running = false;
  if (reschedule) {
    var e = reschedule;
    reschedule = null;
    this.intersects(e);
  }
}

function isInBounds(feature, latlng) {
  if (feature.bounds) {
    if (Array.isArray(feature.bounds)) {

      for (var i = 0; i < feature.bounds.length; i++) {
        if (feature.bounds[i].contains(latlng)) return true;
      }
    } else if (feature.bounds.contains(latlng)) {
      return true;
    }

    return false;
  }
  return true;
}

module.exports = intersects;

},{"async":1}],10:[function(require,module,exports){
'use strict';

var async = require('async');

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
    var _this = this;

    if (!this.showing) return;

    if (running) {
      reschedule = true;
      return;
    }
    running = true;

    this.reposition();

    // objects should keep track of last bbox and zoom of map
    // if this hasn't changed the ll -> container pt is not needed
    var bounds = this._map.getBounds();
    var zoom = this._map.getZoom();

    if (this.debug) t = new Date().getTime();

    var i = 0;
    async.eachSeries(this.features, function (f, next) {
      // handle single or multiple features
      if (f.isCanvasFeatures) {

        async.eachSeries(f.canvasFeatures, function (subfeature, callback) {
          _this.prepareForRedraw(subfeature, bounds, zoom, diff, callback);
        }, function (err) {
          next();
        });
      } else {
        _this.prepareForRedraw(f, bounds, zoom, diff, function () {
          // there are 'decent' reasons for this
          i++;
          if (i % 500 === 0) {
            setTimeout(function () {
              next();
            }, 0);
          } else {
            next();
          }
        });
      }
    }, function (err) {
      _this.redrawFeatures();
    });
  }, layer.redrawFeatures = function () {
    this.clearCanvas();

    for (var i = 0; i < this.features.length; i++) {
      if (!this.features[i].visible) continue;
      this.redrawFeature(this.features[i]);
    }

    if (this.debug) console.log('Render time: ' + (new Date().getTime() - t) + 'ms; avg: ' + (new Date().getTime() - t) / this.features.length + 'ms');

    running = false;
    if (reschedule) {
      console.log('reschedule');
      reschedule = false;
      this.redraw();
    }
  };

  layer.redrawFeature = function (canvasFeature) {
    var renderer = canvasFeature.renderer ? canvasFeature.renderer : this.renderer;

    // call feature render function in feature scope; feature is passed as well
    renderer.call(canvasFeature, // scope
    this._ctx, canvasFeature.getCanvasXY(), this._map, canvasFeature);
  };

  // redraw an individual feature
  layer.prepareForRedraw = function (canvasFeature, bounds, zoom, diff, next) {
    var _this2 = this;

    //if( feature.geojson.properties.debug ) debugger;

    // ignore anything flagged as hidden
    // we do need to clear the cache in this case
    if (!canvasFeature.visible) {
      canvasFeature.clearCache();
      return next();
    }

    canvasFeature.getGeoJson(function (geojson) {
      // now lets check cache to see if we need to reproject the
      // xy coordinates
      // actually project to xy if needed
      var reproject = canvasFeature.requiresReprojection(zoom);
      if (reproject) {
        _this2.toCanvasXY(canvasFeature, geojson, zoom);
      } // end reproject

      // if this was a simple pan event (a diff was provided) and we did not reproject
      // move the feature by diff x/y
      if (diff && !reproject) {
        if (geojson.geometry.type == 'Point') {

          var xy = canvasFeature.getCanvasXY();
          xy.x += diff.x;
          xy.y += diff.y;
        } else if (geojson.geometry.type == 'LineString') {

          _this2.utils.moveLine(canvasFeature.getCanvasXY(), diff);
        } else if (geojson.geometry.type == 'Polygon') {

          _this2.utils.moveLine(canvasFeature.getCanvasXY(), diff);
        } else if (geojson.geometry.type == 'MultiPolygon') {
          var xy = canvasFeature.getCanvasXY();
          for (var i = 0; i < xy.length; i++) {
            _this2.utils.moveLine(xy[i], diff);
          }
        }
      }

      // ignore anything not in bounds
      if (geojson.geometry.type == 'Point') {
        if (!bounds.contains(canvasFeature.latlng)) {
          return next();
        }
      } else if (geojson.geometry.type == 'MultiPolygon') {

        // just make sure at least one polygon is within range
        var found = false;
        for (var i = 0; i < canvasFeature.bounds.length; i++) {
          if (bounds.contains(canvasFeature.bounds[i]) || bounds.intersects(canvasFeature.bounds[i])) {
            found = true;
            break;
          }
        }
        if (!found) {
          return next();
        }
      } else {
        if (!bounds.contains(canvasFeature.bounds) && !bounds.intersects(canvasFeature.bounds)) {
          return next();
        }
      }

      next();
    });
  };
};

},{"async":1}],11:[function(require,module,exports){
'use strict';

module.exports = function (layer) {
    layer.toCanvasXY = function (feature, geojson, zoom) {
        // make sure we have a cache namespace and set the zoom level
        if (!feature.cache) feature.cache = {};
        var canvasXY;

        if (geojson.geometry.type == 'Point') {

            canvasXY = this._map.latLngToContainerPoint([geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]]);

            if (feature.size) {
                canvasXY[0] = canvasXY[0] - feature.size / 2;
                canvasXY[1] = canvasXY[1] - feature.size / 2;
            }
        } else if (geojson.geometry.type == 'LineString') {

            canvasXY = this.utils.projectLine(geojson.geometry.coordinates, this._map);
            trimCanvasXY(canvasXY);
        } else if (geojson.geometry.type == 'Polygon') {

            canvasXY = this.utils.projectLine(geojson.geometry.coordinates[0], this._map);
            trimCanvasXY(canvasXY);
        } else if (geojson.geometry.type == 'MultiPolygon') {
            canvasXY = [];

            for (var i = 0; i < geojson.geometry.coordinates.length; i++) {
                var xy = this.utils.projectLine(geojson.geometry.coordinates[i][0], this._map);
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy9hc3luYy9kaXN0L2FzeW5jLmpzIiwic3JjL2NsYXNzZXMvQ2FudmFzRmVhdHVyZS5qcyIsInNyYy9jbGFzc2VzL0NhbnZhc0ZlYXR1cmVzLmpzIiwic3JjL2NsYXNzZXMvZmFjdG9yeS5qcyIsInNyYy9kZWZhdWx0UmVuZGVyZXIvaW5kZXguanMiLCJzcmMvbGF5ZXIuanMiLCJzcmMvbGliL2FkZEZlYXR1cmUuanMiLCJzcmMvbGliL2luaXQuanMiLCJzcmMvbGliL2ludGVyc2VjdHMuanMiLCJzcmMvbGliL3JlZHJhdy5qcyIsInNyYy9saWIvdG9DYW52YXNYWS5qcyIsInNyYy9saWIvdXRpbHMuanMiLCIuLi8uLi8uLi8uLi8uLi91c3IvbG9jYWwvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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dGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gICAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gICAgKGZhY3RvcnkoKGdsb2JhbC5hc3luYyA9IGdsb2JhbC5hc3luYyB8fCB7fSkpKTtcbn0odGhpcywgZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLyoqXG4gICAgICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICAgICAqIHdpdGggdGhlIGB0aGlzYCBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgdGhlIGFyZ3VtZW50cyBvZiBgYXJnc2AuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGludm9rZS5cbiAgICAgKiBAcGFyYW0geyp9IHRoaXNBcmcgVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXN1bHQgb2YgYGZ1bmNgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgICAgIHZhciBsZW5ndGggPSBhcmdzLmxlbmd0aDtcbiAgICAgIHN3aXRjaCAobGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0pO1xuICAgICAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSwgYXJnc1sxXSk7XG4gICAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICAgICAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAgICAgKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAc2luY2UgMC4xLjBcbiAgICAgKiBAY2F0ZWdvcnkgTGFuZ1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0KHt9KTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc09iamVjdChfLm5vb3ApO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIF8uaXNPYmplY3QobnVsbCk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xuICAgIH1cblxuICAgIHZhciBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB2YXIgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJztcbiAgICAvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG4gICAgdmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAgICAgKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAgICAgKiBvZiB2YWx1ZXMuXG4gICAgICovXG4gICAgdmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAc2luY2UgMC4xLjBcbiAgICAgKiBAY2F0ZWdvcnkgTGFuZ1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGNvcnJlY3RseSBjbGFzc2lmaWVkLFxuICAgICAqICBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8uaXNGdW5jdGlvbihfKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgICAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gICAgICAvLyBpbiBTYWZhcmkgOCB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheSBhbmQgd2VhayBtYXAgY29uc3RydWN0b3JzLFxuICAgICAgLy8gYW5kIFBoYW50b21KUyAxLjkgd2hpY2ggcmV0dXJucyAnZnVuY3Rpb24nIGZvciBgTm9kZUxpc3RgIGluc3RhbmNlcy5cbiAgICAgIHZhciB0YWcgPSBpc09iamVjdCh2YWx1ZSkgPyBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICAgICAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gICAgICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHNpbmNlIDQuMC4wXG4gICAgICogQGNhdGVnb3J5IExhbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xuICAgIH1cblxuICAgIC8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbiAgICB2YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbiAgICAvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG4gICAgdmFyIG9iamVjdFByb3RvJDEgPSBPYmplY3QucHJvdG90eXBlO1xuXG4gICAgLyoqXG4gICAgICogVXNlZCB0byByZXNvbHZlIHRoZVxuICAgICAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICAgICAqIG9mIHZhbHVlcy5cbiAgICAgKi9cbiAgICB2YXIgb2JqZWN0VG9TdHJpbmckMSA9IG9iamVjdFByb3RvJDEudG9TdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYFN5bWJvbGAgcHJpbWl0aXZlIG9yIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSA0LjAuMFxuICAgICAqIEBjYXRlZ29yeSBMYW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgY29ycmVjdGx5IGNsYXNzaWZpZWQsXG4gICAgICogIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAgICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgb2JqZWN0VG9TdHJpbmckMS5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xuICAgIH1cblxuICAgIC8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xuICAgIHZhciBOQU4gPSAwIC8gMDtcblxuICAgIC8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuICovXG4gICAgdmFyIHJlVHJpbSA9IC9eXFxzK3xcXHMrJC9nO1xuXG4gICAgLyoqIFVzZWQgdG8gZGV0ZWN0IGJhZCBzaWduZWQgaGV4YWRlY2ltYWwgc3RyaW5nIHZhbHVlcy4gKi9cbiAgICB2YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4gICAgLyoqIFVzZWQgdG8gZGV0ZWN0IGJpbmFyeSBzdHJpbmcgdmFsdWVzLiAqL1xuICAgIHZhciByZUlzQmluYXJ5ID0gL14wYlswMV0rJC9pO1xuXG4gICAgLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG4gICAgdmFyIHJlSXNPY3RhbCA9IC9eMG9bMC03XSskL2k7XG5cbiAgICAvKiogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgd2l0aG91dCBhIGRlcGVuZGVuY3kgb24gYHJvb3RgLiAqL1xuICAgIHZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAc2luY2UgNC4wLjBcbiAgICAgKiBAY2F0ZWdvcnkgTGFuZ1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gICAgICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgbnVtYmVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnRvTnVtYmVyKDMuMik7XG4gICAgICogLy8gPT4gMy4yXG4gICAgICpcbiAgICAgKiBfLnRvTnVtYmVyKE51bWJlci5NSU5fVkFMVUUpO1xuICAgICAqIC8vID0+IDVlLTMyNFxuICAgICAqXG4gICAgICogXy50b051bWJlcihJbmZpbml0eSk7XG4gICAgICogLy8gPT4gSW5maW5pdHlcbiAgICAgKlxuICAgICAqIF8udG9OdW1iZXIoJzMuMicpO1xuICAgICAqIC8vID0+IDMuMlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRvTnVtYmVyKHZhbHVlKSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE5BTjtcbiAgICAgIH1cbiAgICAgIGlmIChpc09iamVjdCh2YWx1ZSkpIHtcbiAgICAgICAgdmFyIG90aGVyID0gaXNGdW5jdGlvbih2YWx1ZS52YWx1ZU9mKSA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgICAgICB2YWx1ZSA9IGlzT2JqZWN0KG90aGVyKSA/IChvdGhlciArICcnKSA6IG90aGVyO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gdmFsdWUgPT09IDAgPyB2YWx1ZSA6ICt2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgICAgIHZhciBpc0JpbmFyeSA9IHJlSXNCaW5hcnkudGVzdCh2YWx1ZSk7XG4gICAgICByZXR1cm4gKGlzQmluYXJ5IHx8IHJlSXNPY3RhbC50ZXN0KHZhbHVlKSlcbiAgICAgICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgICAgIDogKHJlSXNCYWRIZXgudGVzdCh2YWx1ZSkgPyBOQU4gOiArdmFsdWUpO1xuICAgIH1cblxuICAgIHZhciBJTkZJTklUWSA9IDEgLyAwO1xuICAgIHZhciBNQVhfSU5URUdFUiA9IDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4O1xuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBmaW5pdGUgbnVtYmVyLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHNpbmNlIDQuMTIuMFxuICAgICAqIEBjYXRlZ29yeSBMYW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgbnVtYmVyLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnRvRmluaXRlKDMuMik7XG4gICAgICogLy8gPT4gMy4yXG4gICAgICpcbiAgICAgKiBfLnRvRmluaXRlKE51bWJlci5NSU5fVkFMVUUpO1xuICAgICAqIC8vID0+IDVlLTMyNFxuICAgICAqXG4gICAgICogXy50b0Zpbml0ZShJbmZpbml0eSk7XG4gICAgICogLy8gPT4gMS43OTc2OTMxMzQ4NjIzMTU3ZSszMDhcbiAgICAgKlxuICAgICAqIF8udG9GaW5pdGUoJzMuMicpO1xuICAgICAqIC8vID0+IDMuMlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRvRmluaXRlKHZhbHVlKSB7XG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogMDtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gdG9OdW1iZXIodmFsdWUpO1xuICAgICAgaWYgKHZhbHVlID09PSBJTkZJTklUWSB8fCB2YWx1ZSA9PT0gLUlORklOSVRZKSB7XG4gICAgICAgIHZhciBzaWduID0gKHZhbHVlIDwgMCA/IC0xIDogMSk7XG4gICAgICAgIHJldHVybiBzaWduICogTUFYX0lOVEVHRVI7XG4gICAgICB9XG4gICAgICByZXR1cm4gdmFsdWUgPT09IHZhbHVlID8gdmFsdWUgOiAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYW4gaW50ZWdlci5cbiAgICAgKlxuICAgICAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBpcyBsb29zZWx5IGJhc2VkIG9uXG4gICAgICogW2BUb0ludGVnZXJgXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtdG9pbnRlZ2VyKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSA0LjAuMFxuICAgICAqIEBjYXRlZ29yeSBMYW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgaW50ZWdlci5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy50b0ludGVnZXIoMy4yKTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICpcbiAgICAgKiBfLnRvSW50ZWdlcihOdW1iZXIuTUlOX1ZBTFVFKTtcbiAgICAgKiAvLyA9PiAwXG4gICAgICpcbiAgICAgKiBfLnRvSW50ZWdlcihJbmZpbml0eSk7XG4gICAgICogLy8gPT4gMS43OTc2OTMxMzQ4NjIzMTU3ZSszMDhcbiAgICAgKlxuICAgICAqIF8udG9JbnRlZ2VyKCczLjInKTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICovXG4gICAgZnVuY3Rpb24gdG9JbnRlZ2VyKHZhbHVlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gdG9GaW5pdGUodmFsdWUpLFxuICAgICAgICAgIHJlbWFpbmRlciA9IHJlc3VsdCAlIDE7XG5cbiAgICAgIHJldHVybiByZXN1bHQgPT09IHJlc3VsdCA/IChyZW1haW5kZXIgPyByZXN1bHQgLSByZW1haW5kZXIgOiByZXN1bHQpIDogMDtcbiAgICB9XG5cbiAgICAvKiogVXNlZCBhcyB0aGUgYFR5cGVFcnJvcmAgbWVzc2FnZSBmb3IgXCJGdW5jdGlvbnNcIiBtZXRob2RzLiAqL1xuICAgIHZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbiAgICAvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG4gICAgdmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlXG4gICAgICogY3JlYXRlZCBmdW5jdGlvbiBhbmQgYXJndW1lbnRzIGZyb20gYHN0YXJ0YCBhbmQgYmV5b25kIHByb3ZpZGVkIGFzXG4gICAgICogYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgYmFzZWQgb24gdGhlXG4gICAgICogW3Jlc3QgcGFyYW1ldGVyXShodHRwczovL21kbi5pby9yZXN0X3BhcmFtZXRlcnMpLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHNpbmNlIDQuMC4wXG4gICAgICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gYXBwbHkgYSByZXN0IHBhcmFtZXRlciB0by5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBzYXkgPSBfLnJlc3QoZnVuY3Rpb24od2hhdCwgbmFtZXMpIHtcbiAgICAgKiAgIHJldHVybiB3aGF0ICsgJyAnICsgXy5pbml0aWFsKG5hbWVzKS5qb2luKCcsICcpICtcbiAgICAgKiAgICAgKF8uc2l6ZShuYW1lcykgPiAxID8gJywgJiAnIDogJycpICsgXy5sYXN0KG5hbWVzKTtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIHNheSgnaGVsbG8nLCAnZnJlZCcsICdiYXJuZXknLCAncGViYmxlcycpO1xuICAgICAqIC8vID0+ICdoZWxsbyBmcmVkLCBiYXJuZXksICYgcGViYmxlcydcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXN0KGZ1bmMsIHN0YXJ0KSB7XG4gICAgICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gICAgICB9XG4gICAgICBzdGFydCA9IG5hdGl2ZU1heChzdGFydCA9PT0gdW5kZWZpbmVkID8gKGZ1bmMubGVuZ3RoIC0gMSkgOiB0b0ludGVnZXIoc3RhcnQpLCAwKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHMsXG4gICAgICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gbmF0aXZlTWF4KGFyZ3MubGVuZ3RoIC0gc3RhcnQsIDApLFxuICAgICAgICAgICAgYXJyYXkgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgYXJyYXlbaW5kZXhdID0gYXJnc1tzdGFydCArIGluZGV4XTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHN0YXJ0KSB7XG4gICAgICAgICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIGFycmF5KTtcbiAgICAgICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJnc1swXSwgYXJyYXkpO1xuICAgICAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmdzWzBdLCBhcmdzWzFdLCBhcnJheSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG90aGVyQXJncyA9IEFycmF5KHN0YXJ0ICsgMSk7XG4gICAgICAgIGluZGV4ID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgICAgICBvdGhlckFyZ3NbaW5kZXhdID0gYXJnc1tpbmRleF07XG4gICAgICAgIH1cbiAgICAgICAgb3RoZXJBcmdzW3N0YXJ0XSA9IGFycmF5O1xuICAgICAgICByZXR1cm4gYXBwbHkoZnVuYywgdGhpcywgb3RoZXJBcmdzKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbFBhcmFtcyAoZm4pIHtcbiAgICAgICAgcmV0dXJuIHJlc3QoZnVuY3Rpb24gKGFyZ3MgLyouLi4sIGNhbGxiYWNrKi8pIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGFyZ3MsIGNhbGxiYWNrKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwbHlFYWNoJDEoZWFjaGZuKSB7XG4gICAgICAgIHJldHVybiByZXN0KGZ1bmN0aW9uIChmbnMsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBnbyA9IGluaXRpYWxQYXJhbXMoZnVuY3Rpb24gKGFyZ3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHJldHVybiBlYWNoZm4oZm5zLCBmdW5jdGlvbiAoZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MuY29uY2F0KFtjYl0pKTtcbiAgICAgICAgICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnby5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIG1ldGhvZCB0aGF0IHJldHVybnMgYHVuZGVmaW5lZGAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAc2luY2UgMi4zLjBcbiAgICAgKiBAY2F0ZWdvcnkgVXRpbFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnRpbWVzKDIsIF8ubm9vcCk7XG4gICAgICogLy8gPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG5vb3AoKSB7XG4gICAgICAvLyBObyBvcGVyYXRpb24gcGVyZm9ybWVkLlxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGNhbGxGbiA9IGZuO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICAgICAgY2FsbEZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucHJvcGVydHlgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZVByb3BlcnR5KGtleSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgXCJsZW5ndGhcIiBwcm9wZXJ0eSB2YWx1ZSBvZiBgb2JqZWN0YC5cbiAgICAgKlxuICAgICAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gYXZvaWQgYVxuICAgICAqIFtKSVQgYnVnXShodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTQyNzkyKSB0aGF0IGFmZmVjdHNcbiAgICAgKiBTYWZhcmkgb24gYXQgbGVhc3QgaU9TIDguMS04LjMgQVJNNjQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgXCJsZW5ndGhcIiB2YWx1ZS5cbiAgICAgKi9cbiAgICB2YXIgZ2V0TGVuZ3RoID0gYmFzZVByb3BlcnR5KCdsZW5ndGgnKTtcblxuICAgIC8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xuICAgIHZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gICAgICpcbiAgICAgKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBpcyBsb29zZWx5IGJhc2VkIG9uXG4gICAgICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLXRvbGVuZ3RoKS5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSA0LjAuMFxuICAgICAqIEBjYXRlZ29yeSBMYW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsXG4gICAgICogIGVsc2UgYGZhbHNlYC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogXy5pc0xlbmd0aCgzKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICpcbiAgICAgKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5pc0xlbmd0aCgnMycpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiZcbiAgICAgICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAgICAgKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gICAgICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSA0LjAuMFxuICAgICAqIEBjYXRlZ29yeSBMYW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgoZ2V0TGVuZ3RoKHZhbHVlKSkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xuICAgIH1cblxuICAgIHZhciBpdGVyYXRvclN5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgU3ltYm9sLml0ZXJhdG9yO1xuXG4gICAgZnVuY3Rpb24gZ2V0SXRlcmF0b3IgKGNvbGwpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yU3ltYm9sICYmIGNvbGxbaXRlcmF0b3JTeW1ib2xdICYmIGNvbGxbaXRlcmF0b3JTeW1ib2xdKCk7XG4gICAgfVxuXG4gICAgLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xuICAgIHZhciBuYXRpdmVHZXRQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBgW1tQcm90b3R5cGVdXWAgb2YgYHZhbHVlYC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gICAgICogQHJldHVybnMge251bGx8T2JqZWN0fSBSZXR1cm5zIHRoZSBgW1tQcm90b3R5cGVdXWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0UHJvdG90eXBlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gbmF0aXZlR2V0UHJvdG90eXBlKE9iamVjdCh2YWx1ZSkpO1xuICAgIH1cblxuICAgIC8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbiAgICB2YXIgb2JqZWN0UHJvdG8kMiA9IE9iamVjdC5wcm90b3R5cGU7XG5cbiAgICAvKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbiAgICB2YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90byQyLmhhc093blByb3BlcnR5O1xuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaGFzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGRlZXAgcGF0aHMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBrZXkgVGhlIGtleSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUhhcyhvYmplY3QsIGtleSkge1xuICAgICAgLy8gQXZvaWQgYSBidWcgaW4gSUUgMTAtMTEgd2hlcmUgb2JqZWN0cyB3aXRoIGEgW1tQcm90b3R5cGVdXSBvZiBgbnVsbGAsXG4gICAgICAvLyB0aGF0IGFyZSBjb21wb3NlZCBlbnRpcmVseSBvZiBpbmRleCBwcm9wZXJ0aWVzLCByZXR1cm4gYGZhbHNlYCBmb3JcbiAgICAgIC8vIGBoYXNPd25Qcm9wZXJ0eWAgY2hlY2tzIG9mIHRoZW0uXG4gICAgICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiZcbiAgICAgICAgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpIHx8XG4gICAgICAgICAgKHR5cGVvZiBvYmplY3QgPT0gJ29iamVjdCcgJiYga2V5IGluIG9iamVjdCAmJiBnZXRQcm90b3R5cGUob2JqZWN0KSA9PT0gbnVsbCkpO1xuICAgIH1cblxuICAgIC8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbiAgICB2YXIgbmF0aXZlS2V5cyA9IE9iamVjdC5rZXlzO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCBza2lwIHRoZSBjb25zdHJ1Y3RvclxuICAgICAqIHByb3BlcnR5IG9mIHByb3RvdHlwZXMgb3IgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gICAgICByZXR1cm4gbmF0aXZlS2V5cyhPYmplY3Qob2JqZWN0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICAgICAqIG9yIG1heCBhcnJheSBsZW5ndGggY2hlY2tzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSBgaXRlcmF0ZWVgLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgICAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmlzQXJyYXlMaWtlYCBleGNlcHQgdGhhdCBpdCBhbHNvIGNoZWNrcyBpZiBgdmFsdWVgXG4gICAgICogaXMgYW4gb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHNpbmNlIDQuMC4wXG4gICAgICogQGNhdGVnb3J5IExhbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheS1saWtlIG9iamVjdCxcbiAgICAgKiAgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXlMaWtlT2JqZWN0KFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc0FycmF5TGlrZU9iamVjdChkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXlMaWtlT2JqZWN0KCdhYmMnKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5pc0FycmF5TGlrZU9iamVjdChfLm5vb3ApO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNBcnJheUxpa2VPYmplY3QodmFsdWUpIHtcbiAgICAgIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGlzQXJyYXlMaWtlKHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG4gICAgdmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuICAgIC8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbiAgICB2YXIgb2JqZWN0UHJvdG8kMyA9IE9iamVjdC5wcm90b3R5cGU7XG5cbiAgICAvKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbiAgICB2YXIgaGFzT3duUHJvcGVydHkkMSA9IG9iamVjdFByb3RvJDMuaGFzT3duUHJvcGVydHk7XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gICAgICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gICAgICogb2YgdmFsdWVzLlxuICAgICAqL1xuICAgIHZhciBvYmplY3RUb1N0cmluZyQyID0gb2JqZWN0UHJvdG8kMy50b1N0cmluZztcblxuICAgIC8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xuICAgIHZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvJDMucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHNpbmNlIDAuMS4wXG4gICAgICogQGNhdGVnb3J5IExhbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAgICAgKiAgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbHVlKSB7XG4gICAgICAvLyBTYWZhcmkgOC4xIGluY29ycmVjdGx5IG1ha2VzIGBhcmd1bWVudHMuY2FsbGVlYCBlbnVtZXJhYmxlIGluIHN0cmljdCBtb2RlLlxuICAgICAgcmV0dXJuIGlzQXJyYXlMaWtlT2JqZWN0KHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eSQxLmNhbGwodmFsdWUsICdjYWxsZWUnKSAmJlxuICAgICAgICAoIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKSB8fCBvYmplY3RUb1N0cmluZyQyLmNhbGwodmFsdWUpID09IGFyZ3NUYWcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAc2luY2UgMC4xLjBcbiAgICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAgICogQGNhdGVnb3J5IExhbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAgICAgKiAgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNBcnJheSgnYWJjJyk7XG4gICAgICogLy8gPT4gZmFsc2VcbiAgICAgKlxuICAgICAqIF8uaXNBcnJheShfLm5vb3ApO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG4gICAgLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xuICAgIHZhciBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJztcblxuICAgIC8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbiAgICB2YXIgb2JqZWN0UHJvdG8kNCA9IE9iamVjdC5wcm90b3R5cGU7XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gICAgICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gICAgICogb2YgdmFsdWVzLlxuICAgICAqL1xuICAgIHZhciBvYmplY3RUb1N0cmluZyQzID0gb2JqZWN0UHJvdG8kNC50b1N0cmluZztcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3RyaW5nYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBzaW5jZSAwLjEuMFxuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQGNhdGVnb3J5IExhbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAgICAgKiAgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzU3RyaW5nKCdhYmMnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmlzU3RyaW5nKDEpO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHxcbiAgICAgICAgKCFpc0FycmF5KHZhbHVlKSAmJiBpc09iamVjdExpa2UodmFsdWUpICYmIG9iamVjdFRvU3RyaW5nJDMuY2FsbCh2YWx1ZSkgPT0gc3RyaW5nVGFnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIGluZGV4IGtleXMgZm9yIGBvYmplY3RgIHZhbHVlcyBvZiBhcnJheXMsXG4gICAgICogYGFyZ3VtZW50c2Agb2JqZWN0cywgYW5kIHN0cmluZ3MsIG90aGVyd2lzZSBgbnVsbGAgaXMgcmV0dXJuZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl8bnVsbH0gUmV0dXJucyBpbmRleCBrZXlzLCBlbHNlIGBudWxsYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbmRleEtleXMob2JqZWN0KSB7XG4gICAgICB2YXIgbGVuZ3RoID0gb2JqZWN0ID8gb2JqZWN0Lmxlbmd0aCA6IHVuZGVmaW5lZDtcbiAgICAgIGlmIChpc0xlbmd0aChsZW5ndGgpICYmXG4gICAgICAgICAgKGlzQXJyYXkob2JqZWN0KSB8fCBpc1N0cmluZyhvYmplY3QpIHx8IGlzQXJndW1lbnRzKG9iamVjdCkpKSB7XG4gICAgICAgIHJldHVybiBiYXNlVGltZXMobGVuZ3RoLCBTdHJpbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG4gICAgdmFyIE1BWF9TQUZFX0lOVEVHRVIkMSA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbiAgICAvKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG4gICAgdmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiQxIDogbGVuZ3RoO1xuICAgICAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgICAgICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHwgcmVJc1VpbnQudGVzdCh2YWx1ZSkpICYmXG4gICAgICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbiAgICB9XG5cbiAgICAvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG4gICAgdmFyIG9iamVjdFByb3RvJDUgPSBPYmplY3QucHJvdG90eXBlO1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICAgICAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90byQ1O1xuXG4gICAgICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICAgICAqXG4gICAgICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAgICAgKiBbRVMgc3BlY10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LmtleXMpXG4gICAgICogZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAc2luY2UgMC4xLjBcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBjYXRlZ29yeSBPYmplY3RcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gRm9vKCkge1xuICAgICAqICAgdGhpcy5hID0gMTtcbiAgICAgKiAgIHRoaXMuYiA9IDI7XG4gICAgICogfVxuICAgICAqXG4gICAgICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAgICAgKlxuICAgICAqIF8ua2V5cyhuZXcgRm9vKTtcbiAgICAgKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gICAgICpcbiAgICAgKiBfLmtleXMoJ2hpJyk7XG4gICAgICogLy8gPT4gWycwJywgJzEnXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gICAgICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCk7XG4gICAgICBpZiAoIShpc1Byb3RvIHx8IGlzQXJyYXlMaWtlKG9iamVjdCkpKSB7XG4gICAgICAgIHJldHVybiBiYXNlS2V5cyhvYmplY3QpO1xuICAgICAgfVxuICAgICAgdmFyIGluZGV4ZXMgPSBpbmRleEtleXMob2JqZWN0KSxcbiAgICAgICAgICBza2lwSW5kZXhlcyA9ICEhaW5kZXhlcyxcbiAgICAgICAgICByZXN1bHQgPSBpbmRleGVzIHx8IFtdLFxuICAgICAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgaWYgKGJhc2VIYXMob2JqZWN0LCBrZXkpICYmXG4gICAgICAgICAgICAhKHNraXBJbmRleGVzICYmIChrZXkgPT0gJ2xlbmd0aCcgfHwgaXNJbmRleChrZXksIGxlbmd0aCkpKSAmJlxuICAgICAgICAgICAgIShpc1Byb3RvICYmIGtleSA9PSAnY29uc3RydWN0b3InKSkge1xuICAgICAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXRlcmF0b3IoY29sbCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB2YXIgbGVuO1xuICAgICAgICBpZiAoaXNBcnJheUxpa2UoY29sbCkpIHtcbiAgICAgICAgICAgIGxlbiA9IGNvbGwubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8geyB2YWx1ZTogY29sbFtpXSwga2V5OiBpIH0gOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpdGVyYXRlID0gZ2V0SXRlcmF0b3IoY29sbCk7XG4gICAgICAgIGlmIChpdGVyYXRlKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IGl0ZXJhdGUubmV4dCgpO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLmRvbmUpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogaXRlbS52YWx1ZSwga2V5OiBpIH07XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9rZXlzID0ga2V5cyhjb2xsKTtcbiAgICAgICAgbGVuID0gb2tleXMubGVuZ3RoO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHZhciBrZXkgPSBva2V5c1tpXTtcbiAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8geyB2YWx1ZTogY29sbFtrZXldLCBrZXk6IGtleSB9IDogbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbmx5T25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgdmFyIGNhbGxGbiA9IGZuO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICAgICAgY2FsbEZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2VhY2hPZkxpbWl0KGxpbWl0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRlZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgICAgIHZhciBuZXh0RWxlbSA9IGl0ZXJhdG9yKG9iaik7XG4gICAgICAgICAgICBpZiAobGltaXQgPD0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgcnVubmluZyA9IDA7XG4gICAgICAgICAgICB2YXIgZXJyb3JlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAoZnVuY3Rpb24gcmVwbGVuaXNoKCkge1xuICAgICAgICAgICAgICAgIGlmIChkb25lICYmIHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHJ1bm5pbmcgPCBsaW1pdCAmJiAhZXJyb3JlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWxlbSA9IG5leHRFbGVtKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbGVtID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBydW5uaW5nICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdGVlKGVsZW0udmFsdWUsIGVsZW0ua2V5LCBvbmx5T25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGVuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdGVlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKF9lYWNoT2ZMaW1pdChsaW1pdCksIG9iaiwgaXRlcmF0ZWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXN5bmNNYXAoZWFjaGZuLCBhcnIsIGl0ZXJhdGVlLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IG9uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGFyciA9IGFyciB8fCBbXTtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuXG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGNvdW50ZXIrKztcbiAgICAgICAgICAgIGl0ZXJhdGVlKHZhbHVlLCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHNhbWUgYXMgYG1hcGAgYnV0IHJ1bnMgYSBtYXhpbXVtIG9mIGBsaW1pdGAgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSBtYXBMaW1pdFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLm1hcFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhc3luYyBvcGVyYXRpb25zIGF0IGEgdGltZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCBpdGVtIGluIGBjb2xsYC5cbiAgICAgKiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJhbnNmb3JtZWQpYCB3aGljaCBtdXN0IGJlIGNhbGxlZFxuICAgICAqIG9uY2UgaXQgaGFzIGNvbXBsZXRlZCB3aXRoIGFuIGVycm9yICh3aGljaCBjYW4gYmUgYG51bGxgKSBhbmQgYSB0cmFuc2Zvcm1lZFxuICAgICAqIGl0ZW0uIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIGFsbCBgaXRlcmF0ZWVgXG4gICAgICogZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQsIG9yIGFuIGVycm9yIG9jY3Vycy4gUmVzdWx0cyBpcyBhbiBhcnJheSBvZiB0aGVcbiAgICAgKiB0cmFuc2Zvcm1lZCBpdGVtcyBmcm9tIHRoZSBgY29sbGAuIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHRzKS5cbiAgICAgKi9cbiAgICB2YXIgbWFwTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2FzeW5jTWFwKTtcblxuICAgIGZ1bmN0aW9uIGRvTGltaXQoZm4sIGxpbWl0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoaXRlcmFibGUsIGl0ZXJhdGVlLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGl0ZXJhYmxlLCBsaW1pdCwgaXRlcmF0ZWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9kdWNlcyBhIG5ldyBjb2xsZWN0aW9uIG9mIHZhbHVlcyBieSBtYXBwaW5nIGVhY2ggdmFsdWUgaW4gYGNvbGxgIHRocm91Z2hcbiAgICAgKiB0aGUgYGl0ZXJhdGVlYCBmdW5jdGlvbi4gVGhlIGBpdGVyYXRlZWAgaXMgY2FsbGVkIHdpdGggYW4gaXRlbSBmcm9tIGBjb2xsYFxuICAgICAqIGFuZCBhIGNhbGxiYWNrIGZvciB3aGVuIGl0IGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nLiBFYWNoIG9mIHRoZXNlIGNhbGxiYWNrXG4gICAgICogdGFrZXMgMiBhcmd1bWVudHM6IGFuIGBlcnJvcmAsIGFuZCB0aGUgdHJhbnNmb3JtZWQgaXRlbSBmcm9tIGBjb2xsYC4gSWZcbiAgICAgKiBgaXRlcmF0ZWVgIHBhc3NlcyBhbiBlcnJvciB0byBpdHMgY2FsbGJhY2ssIHRoZSBtYWluIGBjYWxsYmFja2AgKGZvciB0aGVcbiAgICAgKiBgbWFwYCBmdW5jdGlvbikgaXMgaW1tZWRpYXRlbHkgY2FsbGVkIHdpdGggdGhlIGVycm9yLlxuICAgICAqXG4gICAgICogTm90ZSwgdGhhdCBzaW5jZSB0aGlzIGZ1bmN0aW9uIGFwcGxpZXMgdGhlIGBpdGVyYXRlZWAgdG8gZWFjaCBpdGVtIGluXG4gICAgICogcGFyYWxsZWwsIHRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHRoZSBgaXRlcmF0ZWVgIGZ1bmN0aW9ucyB3aWxsIGNvbXBsZXRlXG4gICAgICogaW4gb3JkZXIuIEhvd2V2ZXIsIHRoZSByZXN1bHRzIGFycmF5IHdpbGwgYmUgaW4gdGhlIHNhbWUgb3JkZXIgYXMgdGhlXG4gICAgICogb3JpZ2luYWwgYGNvbGxgLlxuICAgICAqXG4gICAgICogSWYgYG1hcGAgaXMgcGFzc2VkIGFuIE9iamVjdCwgdGhlIHJlc3VsdHMgd2lsbCBiZSBhbiBBcnJheS4gIFRoZSByZXN1bHRzXG4gICAgICogd2lsbCByb3VnaGx5IGJlIGluIHRoZSBvcmRlciBvZiB0aGUgb3JpZ2luYWwgT2JqZWN0cycga2V5cyAoYnV0IHRoaXMgY2FuXG4gICAgICogdmFyeSBhY3Jvc3MgSmF2YVNjcmlwdCBlbmdpbmVzKVxuICAgICAqXG4gICAgICogQG5hbWUgbWFwXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSBmdW5jdGlvbiB0byBhcHBseSB0byBlYWNoIGl0ZW0gaW4gYGNvbGxgLlxuICAgICAqIFRoZSBpdGVyYXRlZSBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyLCB0cmFuc2Zvcm1lZClgIHdoaWNoIG11c3QgYmUgY2FsbGVkXG4gICAgICogb25jZSBpdCBoYXMgY29tcGxldGVkIHdpdGggYW4gZXJyb3IgKHdoaWNoIGNhbiBiZSBgbnVsbGApIGFuZCBhXG4gICAgICogdHJhbnNmb3JtZWQgaXRlbS4gSW52b2tlZCB3aXRoIChpdGVtLCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gYWxsIGBpdGVyYXRlZWBcbiAgICAgKiBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZCwgb3IgYW4gZXJyb3Igb2NjdXJzLiBSZXN1bHRzIGlzIGFuIEFycmF5IG9mIHRoZVxuICAgICAqIHRyYW5zZm9ybWVkIGl0ZW1zIGZyb20gdGhlIGBjb2xsYC4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdHMpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBhc3luYy5tYXAoWydmaWxlMScsJ2ZpbGUyJywnZmlsZTMnXSwgZnMuc3RhdCwgZnVuY3Rpb24oZXJyLCByZXN1bHRzKSB7XG4gICAgICogICAgIC8vIHJlc3VsdHMgaXMgbm93IGFuIGFycmF5IG9mIHN0YXRzIGZvciBlYWNoIGZpbGVcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICB2YXIgbWFwID0gZG9MaW1pdChtYXBMaW1pdCwgSW5maW5pdHkpO1xuXG4gICAgLyoqXG4gICAgICogQXBwbGllcyB0aGUgcHJvdmlkZWQgYXJndW1lbnRzIHRvIGVhY2ggZnVuY3Rpb24gaW4gdGhlIGFycmF5LCBjYWxsaW5nXG4gICAgICogYGNhbGxiYWNrYCBhZnRlciBhbGwgZnVuY3Rpb25zIGhhdmUgY29tcGxldGVkLiBJZiB5b3Ugb25seSBwcm92aWRlIHRoZSBmaXJzdFxuICAgICAqIGFyZ3VtZW50LCB0aGVuIGl0IHdpbGwgcmV0dXJuIGEgZnVuY3Rpb24gd2hpY2ggbGV0cyB5b3UgcGFzcyBpbiB0aGVcbiAgICAgKiBhcmd1bWVudHMgYXMgaWYgaXQgd2VyZSBhIHNpbmdsZSBmdW5jdGlvbiBjYWxsLlxuICAgICAqXG4gICAgICogQG5hbWUgYXBwbHlFYWNoXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gZm5zIC0gQSBjb2xsZWN0aW9uIG9mIGFzeW5jaHJvbm91cyBmdW5jdGlvbnMgdG8gYWxsXG4gICAgICogY2FsbCB3aXRoIHRoZSBzYW1lIGFyZ3VtZW50c1xuICAgICAqIEBwYXJhbSB7Li4uKn0gW2FyZ3NdIC0gYW55IG51bWJlciBvZiBzZXBhcmF0ZSBhcmd1bWVudHMgdG8gcGFzcyB0byB0aGVcbiAgICAgKiBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gdGhlIGZpbmFsIGFyZ3VtZW50IHNob3VsZCBiZSB0aGUgY2FsbGJhY2ssXG4gICAgICogY2FsbGVkIHdoZW4gYWxsIGZ1bmN0aW9ucyBoYXZlIGNvbXBsZXRlZCBwcm9jZXNzaW5nLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gLSBJZiBvbmx5IHRoZSBmaXJzdCBhcmd1bWVudCBpcyBwcm92aWRlZCwgaXQgd2lsbCByZXR1cm5cbiAgICAgKiBhIGZ1bmN0aW9uIHdoaWNoIGxldHMgeW91IHBhc3MgaW4gdGhlIGFyZ3VtZW50cyBhcyBpZiBpdCB3ZXJlIGEgc2luZ2xlXG4gICAgICogZnVuY3Rpb24gY2FsbC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYXN5bmMuYXBwbHlFYWNoKFtlbmFibGVTZWFyY2gsIHVwZGF0ZVNjaGVtYV0sICdidWNrZXQnLCBjYWxsYmFjayk7XG4gICAgICpcbiAgICAgKiAvLyBwYXJ0aWFsIGFwcGxpY2F0aW9uIGV4YW1wbGU6XG4gICAgICogYXN5bmMuZWFjaChcbiAgICAgKiAgICAgYnVja2V0cyxcbiAgICAgKiAgICAgYXN5bmMuYXBwbHlFYWNoKFtlbmFibGVTZWFyY2gsIHVwZGF0ZVNjaGVtYV0pLFxuICAgICAqICAgICBjYWxsYmFja1xuICAgICAqICk7XG4gICAgICovXG4gICAgdmFyIGFwcGx5RWFjaCA9IGFwcGx5RWFjaCQxKG1hcCk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2FtZSBhcyBgbWFwYCBidXQgcnVucyBvbmx5IGEgc2luZ2xlIGFzeW5jIG9wZXJhdGlvbiBhdCBhIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSBtYXBTZXJpZXNcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5tYXBcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCBpdGVtIGluIGBjb2xsYC5cbiAgICAgKiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJhbnNmb3JtZWQpYCB3aGljaCBtdXN0IGJlIGNhbGxlZFxuICAgICAqIG9uY2UgaXQgaGFzIGNvbXBsZXRlZCB3aXRoIGFuIGVycm9yICh3aGljaCBjYW4gYmUgYG51bGxgKSBhbmQgYVxuICAgICAqIHRyYW5zZm9ybWVkIGl0ZW0uIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIGFsbCBgaXRlcmF0ZWVgXG4gICAgICogZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQsIG9yIGFuIGVycm9yIG9jY3Vycy4gUmVzdWx0cyBpcyBhbiBhcnJheSBvZiB0aGVcbiAgICAgKiB0cmFuc2Zvcm1lZCBpdGVtcyBmcm9tIHRoZSBgY29sbGAuIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHRzKS5cbiAgICAgKi9cbiAgICB2YXIgbWFwU2VyaWVzID0gZG9MaW1pdChtYXBMaW1pdCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2FtZSBhcyBgYXBwbHlFYWNoYCBidXQgcnVucyBvbmx5IGEgc2luZ2xlIGFzeW5jIG9wZXJhdGlvbiBhdCBhIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSBhcHBseUVhY2hTZXJpZXNcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5hcHBseUVhY2hcbiAgICAgKiBAY2F0ZWdvcnkgQ29udHJvbCBGbG93XG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGZucyAtIEEgY29sbGVjdGlvbiBvZiBhc3luY2hyb25vdXMgZnVuY3Rpb25zIHRvIGFsbFxuICAgICAqIGNhbGwgd2l0aCB0aGUgc2FtZSBhcmd1bWVudHNcbiAgICAgKiBAcGFyYW0gey4uLip9IFthcmdzXSAtIGFueSBudW1iZXIgb2Ygc2VwYXJhdGUgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlXG4gICAgICogZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIHRoZSBmaW5hbCBhcmd1bWVudCBzaG91bGQgYmUgdGhlIGNhbGxiYWNrLFxuICAgICAqIGNhbGxlZCB3aGVuIGFsbCBmdW5jdGlvbnMgaGF2ZSBjb21wbGV0ZWQgcHJvY2Vzc2luZy5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IC0gSWYgb25seSB0aGUgZmlyc3QgYXJndW1lbnQgaXMgcHJvdmlkZWQsIGl0IHdpbGwgcmV0dXJuXG4gICAgICogYSBmdW5jdGlvbiB3aGljaCBsZXRzIHlvdSBwYXNzIGluIHRoZSBhcmd1bWVudHMgYXMgaWYgaXQgd2VyZSBhIHNpbmdsZVxuICAgICAqIGZ1bmN0aW9uIGNhbGwuXG4gICAgICovXG4gICAgdmFyIGFwcGx5RWFjaFNlcmllcyA9IGFwcGx5RWFjaCQxKG1hcFNlcmllcyk7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgY29udGludWF0aW9uIGZ1bmN0aW9uIHdpdGggc29tZSBhcmd1bWVudHMgYWxyZWFkeSBhcHBsaWVkLlxuICAgICAqXG4gICAgICogVXNlZnVsIGFzIGEgc2hvcnRoYW5kIHdoZW4gY29tYmluZWQgd2l0aCBvdGhlciBjb250cm9sIGZsb3cgZnVuY3Rpb25zLiBBbnlcbiAgICAgKiBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSByZXR1cm5lZCBmdW5jdGlvbiBhcmUgYWRkZWQgdG8gdGhlIGFyZ3VtZW50c1xuICAgICAqIG9yaWdpbmFsbHkgcGFzc2VkIHRvIGFwcGx5LlxuICAgICAqXG4gICAgICogQG5hbWUgYXBwbHlcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IFV0aWxcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jdGlvbiAtIFRoZSBmdW5jdGlvbiB5b3Ugd2FudCB0byBldmVudHVhbGx5IGFwcGx5IGFsbFxuICAgICAqIGFyZ3VtZW50cyB0by4gSW52b2tlcyB3aXRoIChhcmd1bWVudHMuLi4pLlxuICAgICAqIEBwYXJhbSB7Li4uKn0gYXJndW1lbnRzLi4uIC0gQW55IG51bWJlciBvZiBhcmd1bWVudHMgdG8gYXV0b21hdGljYWxseSBhcHBseVxuICAgICAqIHdoZW4gdGhlIGNvbnRpbnVhdGlvbiBpcyBjYWxsZWQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIHVzaW5nIGFwcGx5XG4gICAgICogYXN5bmMucGFyYWxsZWwoW1xuICAgICAqICAgICBhc3luYy5hcHBseShmcy53cml0ZUZpbGUsICd0ZXN0ZmlsZTEnLCAndGVzdDEnKSxcbiAgICAgKiAgICAgYXN5bmMuYXBwbHkoZnMud3JpdGVGaWxlLCAndGVzdGZpbGUyJywgJ3Rlc3QyJylcbiAgICAgKiBdKTtcbiAgICAgKlxuICAgICAqXG4gICAgICogLy8gdGhlIHNhbWUgcHJvY2VzcyB3aXRob3V0IHVzaW5nIGFwcGx5XG4gICAgICogYXN5bmMucGFyYWxsZWwoW1xuICAgICAqICAgICBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAqICAgICAgICAgZnMud3JpdGVGaWxlKCd0ZXN0ZmlsZTEnLCAndGVzdDEnLCBjYWxsYmFjayk7XG4gICAgICogICAgIH0sXG4gICAgICogICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICBmcy53cml0ZUZpbGUoJ3Rlc3RmaWxlMicsICd0ZXN0MicsIGNhbGxiYWNrKTtcbiAgICAgKiAgICAgfVxuICAgICAqIF0pO1xuICAgICAqXG4gICAgICogLy8gSXQncyBwb3NzaWJsZSB0byBwYXNzIGFueSBudW1iZXIgb2YgYWRkaXRpb25hbCBhcmd1bWVudHMgd2hlbiBjYWxsaW5nIHRoZVxuICAgICAqIC8vIGNvbnRpbnVhdGlvbjpcbiAgICAgKlxuICAgICAqIG5vZGU+IHZhciBmbiA9IGFzeW5jLmFwcGx5KHN5cy5wdXRzLCAnb25lJyk7XG4gICAgICogbm9kZT4gZm4oJ3R3bycsICd0aHJlZScpO1xuICAgICAqIG9uZVxuICAgICAqIHR3b1xuICAgICAqIHRocmVlXG4gICAgICovXG4gICAgdmFyIGFwcGx5JDEgPSByZXN0KGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICByZXR1cm4gcmVzdChmdW5jdGlvbiAoY2FsbEFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChjYWxsQXJncykpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFRha2UgYSBzeW5jIGZ1bmN0aW9uIGFuZCBtYWtlIGl0IGFzeW5jLCBwYXNzaW5nIGl0cyByZXR1cm4gdmFsdWUgdG8gYVxuICAgICAqIGNhbGxiYWNrLiBUaGlzIGlzIHVzZWZ1bCBmb3IgcGx1Z2dpbmcgc3luYyBmdW5jdGlvbnMgaW50byBhIHdhdGVyZmFsbCxcbiAgICAgKiBzZXJpZXMsIG9yIG90aGVyIGFzeW5jIGZ1bmN0aW9ucy4gQW55IGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGdlbmVyYXRlZFxuICAgICAqIGZ1bmN0aW9uIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSB3cmFwcGVkIGZ1bmN0aW9uIChleGNlcHQgZm9yIHRoZSBmaW5hbFxuICAgICAqIGNhbGxiYWNrIGFyZ3VtZW50KS4gRXJyb3JzIHRocm93biB3aWxsIGJlIHBhc3NlZCB0byB0aGUgY2FsbGJhY2suXG4gICAgICpcbiAgICAgKiBJZiB0aGUgZnVuY3Rpb24gcGFzc2VkIHRvIGBhc3luY2lmeWAgcmV0dXJucyBhIFByb21pc2UsIHRoYXQgcHJvbWlzZXMnc1xuICAgICAqIHJlc29sdmVkL3JlamVjdGVkIHN0YXRlIHdpbGwgYmUgdXNlZCB0byBjYWxsIHRoZSBjYWxsYmFjaywgcmF0aGVyIHRoYW4gc2ltcGx5XG4gICAgICogdGhlIHN5bmNocm9ub3VzIHJldHVybiB2YWx1ZS5cbiAgICAgKlxuICAgICAqIFRoaXMgYWxzbyBtZWFucyB5b3UgY2FuIGFzeW5jaWZ5IEVTMjAxNiBgYXN5bmNgIGZ1bmN0aW9ucy5cbiAgICAgKlxuICAgICAqIEBuYW1lIGFzeW5jaWZ5XG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBhbGlhcyB3cmFwU3luY1xuICAgICAqIEBjYXRlZ29yeSBVdGlsXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIFRoZSBzeW5jaHJvbm91cyBmdW5jdGlvbiB0byBjb252ZXJ0IHRvIGFuXG4gICAgICogYXN5bmNocm9ub3VzIGZ1bmN0aW9uLlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQW4gYXN5bmNocm9ub3VzIHdyYXBwZXIgb2YgdGhlIGBmdW5jYC4gVG8gYmUgaW52b2tlZCB3aXRoXG4gICAgICogKGNhbGxiYWNrKS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gcGFzc2luZyBhIHJlZ3VsYXIgc3luY2hyb25vdXMgZnVuY3Rpb25cbiAgICAgKiBhc3luYy53YXRlcmZhbGwoW1xuICAgICAqICAgICBhc3luYy5hcHBseShmcy5yZWFkRmlsZSwgZmlsZW5hbWUsIFwidXRmOFwiKSxcbiAgICAgKiAgICAgYXN5bmMuYXN5bmNpZnkoSlNPTi5wYXJzZSksXG4gICAgICogICAgIGZ1bmN0aW9uIChkYXRhLCBuZXh0KSB7XG4gICAgICogICAgICAgICAvLyBkYXRhIGlzIHRoZSByZXN1bHQgb2YgcGFyc2luZyB0aGUgdGV4dC5cbiAgICAgKiAgICAgICAgIC8vIElmIHRoZXJlIHdhcyBhIHBhcnNpbmcgZXJyb3IsIGl0IHdvdWxkIGhhdmUgYmVlbiBjYXVnaHQuXG4gICAgICogICAgIH1cbiAgICAgKiBdLCBjYWxsYmFjayk7XG4gICAgICpcbiAgICAgKiAvLyBwYXNzaW5nIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGEgcHJvbWlzZVxuICAgICAqIGFzeW5jLndhdGVyZmFsbChbXG4gICAgICogICAgIGFzeW5jLmFwcGx5KGZzLnJlYWRGaWxlLCBmaWxlbmFtZSwgXCJ1dGY4XCIpLFxuICAgICAqICAgICBhc3luYy5hc3luY2lmeShmdW5jdGlvbiAoY29udGVudHMpIHtcbiAgICAgKiAgICAgICAgIHJldHVybiBkYi5tb2RlbC5jcmVhdGUoY29udGVudHMpO1xuICAgICAqICAgICB9KSxcbiAgICAgKiAgICAgZnVuY3Rpb24gKG1vZGVsLCBuZXh0KSB7XG4gICAgICogICAgICAgICAvLyBgbW9kZWxgIGlzIHRoZSBpbnN0YW50aWF0ZWQgbW9kZWwgb2JqZWN0LlxuICAgICAqICAgICAgICAgLy8gSWYgdGhlcmUgd2FzIGFuIGVycm9yLCB0aGlzIGZ1bmN0aW9uIHdvdWxkIGJlIHNraXBwZWQuXG4gICAgICogICAgIH1cbiAgICAgKiBdLCBjYWxsYmFjayk7XG4gICAgICpcbiAgICAgKiAvLyBlczYgZXhhbXBsZVxuICAgICAqIHZhciBxID0gYXN5bmMucXVldWUoYXN5bmMuYXN5bmNpZnkoYXN5bmMgZnVuY3Rpb24oZmlsZSkge1xuICAgICAqICAgICB2YXIgaW50ZXJtZWRpYXRlU3RlcCA9IGF3YWl0IHByb2Nlc3NGaWxlKGZpbGUpO1xuICAgICAqICAgICByZXR1cm4gYXdhaXQgc29tZVByb21pc2UoaW50ZXJtZWRpYXRlU3RlcClcbiAgICAgKiB9KSk7XG4gICAgICpcbiAgICAgKiBxLnB1c2goZmlsZXMpO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFzeW5jaWZ5KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGluaXRpYWxQYXJhbXMoZnVuY3Rpb24gKGFyZ3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHJlc3VsdCBpcyBQcm9taXNlIG9iamVjdFxuICAgICAgICAgICAgaWYgKGlzT2JqZWN0KHJlc3VsdCkgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KVsnY2F0Y2gnXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyci5tZXNzYWdlID8gZXJyIDogbmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZm9yRWFjaGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gICAgICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXJyYXlFYWNoKGFycmF5LCBpdGVyYXRlZSkge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGJhc2UgZnVuY3Rpb24gZm9yIG1ldGhvZHMgbGlrZSBgXy5mb3JJbmAgYW5kIGBfLmZvck93bmAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGJhc2UgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlQmFzZUZvcihmcm9tUmlnaHQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzRnVuYykge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KG9iamVjdCksXG4gICAgICAgICAgICBwcm9wcyA9IGtleXNGdW5jKG9iamVjdCksXG4gICAgICAgICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgICAgdmFyIGtleSA9IHByb3BzW2Zyb21SaWdodCA/IGxlbmd0aCA6ICsraW5kZXhdO1xuICAgICAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtrZXldLCBrZXksIGl0ZXJhYmxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICAgICAqIHByb3BlcnRpZXMgcmV0dXJuZWQgYnkgYGtleXNGdW5jYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIHByb3BlcnR5LlxuICAgICAqIEl0ZXJhdGVlIGZ1bmN0aW9ucyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnkgZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKi9cbiAgICB2YXIgYmFzZUZvciA9IGNyZWF0ZUJhc2VGb3IoKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvck93bmAgd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlRm9yT3duKG9iamVjdCwgaXRlcmF0ZWUpIHtcbiAgICAgIHJldHVybiBvYmplY3QgJiYgYmFzZUZvcihvYmplY3QsIGl0ZXJhdGVlLCBrZXlzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBjbGVhclxuICAgICAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsaXN0Q2FjaGVDbGVhcigpIHtcbiAgICAgIHRoaXMuX19kYXRhX18gPSBbXTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyBhXG4gICAgICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAgICAgKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSA0LjAuMFxuICAgICAqIEBjYXRlZ29yeSBMYW5nXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAgICAgKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICd1c2VyJzogJ2ZyZWQnIH07XG4gICAgICogdmFyIG90aGVyID0geyAndXNlcic6ICdmcmVkJyB9O1xuICAgICAqXG4gICAgICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5lcSgnYScsICdhJyk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqXG4gICAgICogXy5lcShOYU4sIE5hTik7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGBrZXlgIGlzIGZvdW5kIGluIGBhcnJheWAgb2Yga2V5LXZhbHVlIHBhaXJzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICAgICAqIEBwYXJhbSB7Kn0ga2V5IFRoZSBrZXkgdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSwgZWxzZSBgLTFgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFzc29jSW5kZXhPZihhcnJheSwga2V5KSB7XG4gICAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGlmIChlcShhcnJheVtsZW5ndGhdWzBdLCBrZXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIC8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbiAgICB2YXIgYXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxuICAgIC8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xuICAgIHZhciBzcGxpY2UgPSBhcnJheVByb3RvLnNwbGljZTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBkZWxldGVcbiAgICAgKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxpc3RDYWNoZURlbGV0ZShrZXkpIHtcbiAgICAgIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBsYXN0SW5kZXggPSBkYXRhLmxlbmd0aCAtIDE7XG4gICAgICBpZiAoaW5kZXggPT0gbGFzdEluZGV4KSB7XG4gICAgICAgIGRhdGEucG9wKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcGxpY2UuY2FsbChkYXRhLCBpbmRleCwgMSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG5hbWUgZ2V0XG4gICAgICogQG1lbWJlck9mIExpc3RDYWNoZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsaXN0Q2FjaGVHZXQoa2V5KSB7XG4gICAgICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICAgICAgcmV0dXJuIGluZGV4IDwgMCA/IHVuZGVmaW5lZCA6IGRhdGFbaW5kZXhdWzFdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG5hbWUgaGFzXG4gICAgICogQG1lbWJlck9mIExpc3RDYWNoZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsaXN0Q2FjaGVIYXMoa2V5KSB7XG4gICAgICByZXR1cm4gYXNzb2NJbmRleE9mKHRoaXMuX19kYXRhX18sIGtleSkgPiAtMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBsaXN0IGNhY2hlIGBrZXlgIHRvIGB2YWx1ZWAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBuYW1lIHNldFxuICAgICAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbGlzdCBjYWNoZSBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBsaXN0Q2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkYXRhW2luZGV4XVsxXSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBsaXN0IGNhY2hlIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gTGlzdENhY2hlKGVudHJpZXMpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgICAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBtZXRob2RzIHRvIGBMaXN0Q2FjaGVgLlxuICAgIExpc3RDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBsaXN0Q2FjaGVDbGVhcjtcbiAgICBMaXN0Q2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IGxpc3RDYWNoZURlbGV0ZTtcbiAgICBMaXN0Q2FjaGUucHJvdG90eXBlLmdldCA9IGxpc3RDYWNoZUdldDtcbiAgICBMaXN0Q2FjaGUucHJvdG90eXBlLmhhcyA9IGxpc3RDYWNoZUhhcztcbiAgICBMaXN0Q2FjaGUucHJvdG90eXBlLnNldCA9IGxpc3RDYWNoZVNldDtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIHN0YWNrLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBjbGVhclxuICAgICAqIEBtZW1iZXJPZiBTdGFja1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0YWNrQ2xlYXIoKSB7XG4gICAgICB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgc3RhY2suXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBuYW1lIGRlbGV0ZVxuICAgICAqIEBtZW1iZXJPZiBTdGFja1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdGFja0RlbGV0ZShrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fZGF0YV9fWydkZWxldGUnXShrZXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHN0YWNrIHZhbHVlIGZvciBga2V5YC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG5hbWUgZ2V0XG4gICAgICogQG1lbWJlck9mIFN0YWNrXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0YWNrR2V0KGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KGtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGEgc3RhY2sgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG5hbWUgaGFzXG4gICAgICogQG1lbWJlck9mIFN0YWNrXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0YWNrSGFzKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKGtleSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgaG9zdCBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgICAgIC8vIE1hbnkgaG9zdCBvYmplY3RzIGFyZSBgT2JqZWN0YCBvYmplY3RzIHRoYXQgY2FuIGNvZXJjZSB0byBzdHJpbmdzXG4gICAgICAvLyBkZXNwaXRlIGhhdmluZyBpbXByb3Blcmx5IGRlZmluZWQgYHRvU3RyaW5nYCBtZXRob2RzLlxuICAgICAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLnRvU3RyaW5nICE9ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBnbG9iYWwgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7bnVsbHxPYmplY3R9IFJldHVybnMgYHZhbHVlYCBpZiBpdCdzIGEgZ2xvYmFsIG9iamVjdCwgZWxzZSBgbnVsbGAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gY2hlY2tHbG9iYWwodmFsdWUpIHtcbiAgICAgIHJldHVybiAodmFsdWUgJiYgdmFsdWUuT2JqZWN0ID09PSBPYmplY3QpID8gdmFsdWUgOiBudWxsO1xuICAgIH1cblxuICAgIC8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG4gICAgdmFyIGZyZWVHbG9iYWwgPSBjaGVja0dsb2JhbCh0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCk7XG5cbiAgICAvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xuICAgIHZhciBmcmVlU2VsZiA9IGNoZWNrR2xvYmFsKHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYpO1xuXG4gICAgLyoqIERldGVjdCBgdGhpc2AgYXMgdGhlIGdsb2JhbCBvYmplY3QuICovXG4gICAgdmFyIHRoaXNHbG9iYWwgPSBjaGVja0dsb2JhbCh0eXBlb2YgdGhpcyA9PSAnb2JqZWN0JyAmJiB0aGlzKTtcblxuICAgIC8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xuICAgIHZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCB0aGlzR2xvYmFsIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbiAgICAvKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG4gICAgdmFyIGNvcmVKc0RhdGEgPSByb290WydfX2NvcmUtanNfc2hhcmVkX18nXTtcblxuICAgIC8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG4gICAgdmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICAgICAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xuICAgIH0oKSk7XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gICAgICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xuICAgIH1cblxuICAgIC8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbiAgICB2YXIgZnVuY1RvU3RyaW5nJDEgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBwcm9jZXNzLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgICAgIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gZnVuY1RvU3RyaW5nJDEuY2FsbChmdW5jKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICB9XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICAgICAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtcGF0dGVybnMpLlxuICAgICAqL1xuICAgIHZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbiAgICAvKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG4gICAgdmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbiAgICAvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG4gICAgdmFyIG9iamVjdFByb3RvJDYgPSBPYmplY3QucHJvdG90eXBlO1xuXG4gICAgLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xuICAgIHZhciBmdW5jVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICAvKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbiAgICB2YXIgaGFzT3duUHJvcGVydHkkMiA9IG9iamVjdFByb3RvJDYuaGFzT3duUHJvcGVydHk7XG5cbiAgICAvKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xuICAgIHZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gICAgICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSQyKS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gICAgICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbiAgICApO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAgICAgKiAgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICAgICAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBwYXR0ZXJuID0gKGlzRnVuY3Rpb24odmFsdWUpIHx8IGlzSG9zdE9iamVjdCh2YWx1ZSkpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgICAgIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gICAgICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICAgICAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICAgICAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG4gICAgdmFyIG5hdGl2ZUNyZWF0ZSA9IGdldE5hdGl2ZShPYmplY3QsICdjcmVhdGUnKTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGhhc2guXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBuYW1lIGNsZWFyXG4gICAgICogQG1lbWJlck9mIEhhc2hcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBoYXNoQ2xlYXIoKSB7XG4gICAgICB0aGlzLl9fZGF0YV9fID0gbmF0aXZlQ3JlYXRlID8gbmF0aXZlQ3JlYXRlKG51bGwpIDoge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBuYW1lIGRlbGV0ZVxuICAgICAqIEBtZW1iZXJPZiBIYXNoXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGhhc2ggVGhlIGhhc2ggdG8gbW9kaWZ5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuaGFzKGtleSkgJiYgZGVsZXRlIHRoaXMuX19kYXRhX19ba2V5XTtcbiAgICB9XG5cbiAgICAvKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG4gICAgdmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4gICAgLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xuICAgIHZhciBvYmplY3RQcm90byQ3ID0gT2JqZWN0LnByb3RvdHlwZTtcblxuICAgIC8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xuICAgIHZhciBoYXNPd25Qcm9wZXJ0eSQzID0gb2JqZWN0UHJvdG8kNy5oYXNPd25Qcm9wZXJ0eTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGhhc2ggdmFsdWUgZm9yIGBrZXlgLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBnZXRcbiAgICAgKiBAbWVtYmVyT2YgSGFzaFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBoYXNoR2V0KGtleSkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICAgICAgaWYgKG5hdGl2ZUNyZWF0ZSkge1xuICAgICAgICB2YXIgcmVzdWx0ID0gZGF0YVtrZXldO1xuICAgICAgICByZXR1cm4gcmVzdWx0ID09PSBIQVNIX1VOREVGSU5FRCA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBoYXNPd25Qcm9wZXJ0eSQzLmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG4gICAgdmFyIG9iamVjdFByb3RvJDggPSBPYmplY3QucHJvdG90eXBlO1xuXG4gICAgLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG4gICAgdmFyIGhhc093blByb3BlcnR5JDQgPSBvYmplY3RQcm90byQ4Lmhhc093blByb3BlcnR5O1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGEgaGFzaCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBoYXNcbiAgICAgKiBAbWVtYmVyT2YgSGFzaFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICAgICAgcmV0dXJuIG5hdGl2ZUNyZWF0ZSA/IGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkIDogaGFzT3duUHJvcGVydHkkNC5jYWxsKGRhdGEsIGtleSk7XG4gICAgfVxuXG4gICAgLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xuICAgIHZhciBIQVNIX1VOREVGSU5FRCQxID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgaGFzaCBga2V5YCB0byBgdmFsdWVgLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBzZXRcbiAgICAgKiBAbWVtYmVyT2YgSGFzaFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBoYXNoIGluc3RhbmNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGhhc2hTZXQoa2V5LCB2YWx1ZSkge1xuICAgICAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICAgICAgZGF0YVtrZXldID0gKG5hdGl2ZUNyZWF0ZSAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IEhBU0hfVU5ERUZJTkVEJDEgOiB2YWx1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBoYXNoIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gSGFzaChlbnRyaWVzKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBlbnRyaWVzID8gZW50cmllcy5sZW5ndGggOiAwO1xuXG4gICAgICB0aGlzLmNsZWFyKCk7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICAgICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgbWV0aG9kcyB0byBgSGFzaGAuXG4gICAgSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBoYXNoQ2xlYXI7XG4gICAgSGFzaC5wcm90b3R5cGVbJ2RlbGV0ZSddID0gaGFzaERlbGV0ZTtcbiAgICBIYXNoLnByb3RvdHlwZS5nZXQgPSBoYXNoR2V0O1xuICAgIEhhc2gucHJvdG90eXBlLmhhcyA9IGhhc2hIYXM7XG4gICAgSGFzaC5wcm90b3R5cGUuc2V0ID0gaGFzaFNldDtcblxuICAgIC8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbiAgICB2YXIgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIG1hcC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG5hbWUgY2xlYXJcbiAgICAgKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYXBDYWNoZUNsZWFyKCkge1xuICAgICAgdGhpcy5fX2RhdGFfXyA9IHtcbiAgICAgICAgJ2hhc2gnOiBuZXcgSGFzaCxcbiAgICAgICAgJ21hcCc6IG5ldyAoTWFwIHx8IExpc3RDYWNoZSksXG4gICAgICAgICdzdHJpbmcnOiBuZXcgSGFzaFxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3IgdXNlIGFzIHVuaXF1ZSBvYmplY3Qga2V5LlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzS2V5YWJsZSh2YWx1ZSkge1xuICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gICAgICByZXR1cm4gKHR5cGUgPT0gJ3N0cmluZycgfHwgdHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nKVxuICAgICAgICA/ICh2YWx1ZSAhPT0gJ19fcHJvdG9fXycpXG4gICAgICAgIDogKHZhbHVlID09PSBudWxsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkYXRhIGZvciBgbWFwYC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBrZXkuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldE1hcERhdGEobWFwLCBrZXkpIHtcbiAgICAgIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICAgICAgcmV0dXJuIGlzS2V5YWJsZShrZXkpXG4gICAgICAgID8gZGF0YVt0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8gJ3N0cmluZycgOiAnaGFzaCddXG4gICAgICAgIDogZGF0YS5tYXA7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIG1hcC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG5hbWUgZGVsZXRlXG4gICAgICogQG1lbWJlck9mIE1hcENhY2hlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hcENhY2hlRGVsZXRlKGtleSkge1xuICAgICAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KVsnZGVsZXRlJ10oa2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBtYXAgdmFsdWUgZm9yIGBrZXlgLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBnZXRcbiAgICAgKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAgICAgKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gICAgICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmdldChrZXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBhIG1hcCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBoYXNcbiAgICAgKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gICAgICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmhhcyhrZXkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIG1hcCBga2V5YCB0byBgdmFsdWVgLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAbmFtZSBzZXRcbiAgICAgKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbWFwIGNhY2hlIGluc3RhbmNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hcENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgICAgIGdldE1hcERhdGEodGhpcywga2V5KS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbWFwIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIE1hcENhY2hlKGVudHJpZXMpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGVudHJpZXMgPyBlbnRyaWVzLmxlbmd0aCA6IDA7XG5cbiAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgICAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkZCBtZXRob2RzIHRvIGBNYXBDYWNoZWAuXG4gICAgTWFwQ2FjaGUucHJvdG90eXBlLmNsZWFyID0gbWFwQ2FjaGVDbGVhcjtcbiAgICBNYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbWFwQ2FjaGVEZWxldGU7XG4gICAgTWFwQ2FjaGUucHJvdG90eXBlLmdldCA9IG1hcENhY2hlR2V0O1xuICAgIE1hcENhY2hlLnByb3RvdHlwZS5oYXMgPSBtYXBDYWNoZUhhcztcbiAgICBNYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gbWFwQ2FjaGVTZXQ7XG5cbiAgICAvKiogVXNlZCBhcyB0aGUgc2l6ZSB0byBlbmFibGUgbGFyZ2UgYXJyYXkgb3B0aW1pemF0aW9ucy4gKi9cbiAgICB2YXIgTEFSR0VfQVJSQVlfU0laRSA9IDIwMDtcblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHN0YWNrIGBrZXlgIHRvIGB2YWx1ZWAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBuYW1lIHNldFxuICAgICAqIEBtZW1iZXJPZiBTdGFja1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBzdGFjayBjYWNoZSBpbnN0YW5jZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdGFja1NldChrZXksIHZhbHVlKSB7XG4gICAgICB2YXIgY2FjaGUgPSB0aGlzLl9fZGF0YV9fO1xuICAgICAgaWYgKGNhY2hlIGluc3RhbmNlb2YgTGlzdENhY2hlICYmIGNhY2hlLl9fZGF0YV9fLmxlbmd0aCA9PSBMQVJHRV9BUlJBWV9TSVpFKSB7XG4gICAgICAgIGNhY2hlID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZShjYWNoZS5fX2RhdGFfXyk7XG4gICAgICB9XG4gICAgICBjYWNoZS5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgc3RhY2sgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gU3RhY2soZW50cmllcykge1xuICAgICAgdGhpcy5fX2RhdGFfXyA9IG5ldyBMaXN0Q2FjaGUoZW50cmllcyk7XG4gICAgfVxuXG4gICAgLy8gQWRkIG1ldGhvZHMgdG8gYFN0YWNrYC5cbiAgICBTdGFjay5wcm90b3R5cGUuY2xlYXIgPSBzdGFja0NsZWFyO1xuICAgIFN0YWNrLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBzdGFja0RlbGV0ZTtcbiAgICBTdGFjay5wcm90b3R5cGUuZ2V0ID0gc3RhY2tHZXQ7XG4gICAgU3RhY2sucHJvdG90eXBlLmhhcyA9IHN0YWNrSGFzO1xuICAgIFN0YWNrLnByb3RvdHlwZS5zZXQgPSBzdGFja1NldDtcblxuICAgIC8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbiAgICB2YXIgSEFTSF9VTkRFRklORUQkMiA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuICAgIC8qKlxuICAgICAqIEFkZHMgYHZhbHVlYCB0byB0aGUgYXJyYXkgY2FjaGUuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBuYW1lIGFkZFxuICAgICAqIEBtZW1iZXJPZiBTZXRDYWNoZVxuICAgICAqIEBhbGlhcyBwdXNoXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2FjaGUuXG4gICAgICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2FjaGUgaW5zdGFuY2UuXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0Q2FjaGVBZGQodmFsdWUpIHtcbiAgICAgIHRoaXMuX19kYXRhX18uc2V0KHZhbHVlLCBIQVNIX1VOREVGSU5FRCQyKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGluIHRoZSBhcnJheSBjYWNoZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQG5hbWUgaGFzXG4gICAgICogQG1lbWJlck9mIFNldENhY2hlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGZvdW5kLCBlbHNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2V0Q2FjaGVIYXModmFsdWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IGNhY2hlIG9iamVjdCB0byBzdG9yZSB1bmlxdWUgdmFsdWVzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbdmFsdWVzXSBUaGUgdmFsdWVzIHRvIGNhY2hlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFNldENhY2hlKHZhbHVlcykge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gdmFsdWVzID8gdmFsdWVzLmxlbmd0aCA6IDA7XG5cbiAgICAgIHRoaXMuX19kYXRhX18gPSBuZXcgTWFwQ2FjaGU7XG4gICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB0aGlzLmFkZCh2YWx1ZXNbaW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGQgbWV0aG9kcyB0byBgU2V0Q2FjaGVgLlxuICAgIFNldENhY2hlLnByb3RvdHlwZS5hZGQgPSBTZXRDYWNoZS5wcm90b3R5cGUucHVzaCA9IHNldENhY2hlQWRkO1xuICAgIFNldENhY2hlLnByb3RvdHlwZS5oYXMgPSBzZXRDYWNoZUhhcztcblxuICAgIC8qKlxuICAgICAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5zb21lYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAgICAgKiBzaG9ydGhhbmRzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFueSBlbGVtZW50IHBhc3NlcyB0aGUgcHJlZGljYXRlIGNoZWNrLFxuICAgICAqICBlbHNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXJyYXlTb21lKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5ID8gYXJyYXkubGVuZ3RoIDogMDtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBVTk9SREVSRURfQ09NUEFSRV9GTEFHJDEgPSAxO1xuICAgIHZhciBQQVJUSUFMX0NPTVBBUkVfRkxBRyQyID0gMjtcbiAgICAvKipcbiAgICAgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VJc0VxdWFsRGVlcGAgZm9yIGFycmF5cyB3aXRoIHN1cHBvcnQgZm9yXG4gICAgICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY29tcGFyZS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBvdGhlciBUaGUgb3RoZXIgYXJyYXkgdG8gY29tcGFyZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBlcXVhbEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGRldGVybWluZSBlcXVpdmFsZW50cyBvZiB2YWx1ZXMuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY3VzdG9taXplciBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvbXBhcmlzb25zLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBiaXRtYXNrIFRoZSBiaXRtYXNrIG9mIGNvbXBhcmlzb24gZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgXG4gICAgICogIGZvciBtb3JlIGRldGFpbHMuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHN0YWNrIFRyYWNrcyB0cmF2ZXJzZWQgYGFycmF5YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYXJyYXlzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZXF1YWxBcnJheXMoYXJyYXksIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gICAgICB2YXIgaXNQYXJ0aWFsID0gYml0bWFzayAmIFBBUlRJQUxfQ09NUEFSRV9GTEFHJDIsXG4gICAgICAgICAgYXJyTGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICAgIG90aExlbmd0aCA9IG90aGVyLmxlbmd0aDtcblxuICAgICAgaWYgKGFyckxlbmd0aCAhPSBvdGhMZW5ndGggJiYgIShpc1BhcnRpYWwgJiYgb3RoTGVuZ3RoID4gYXJyTGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAvLyBBc3N1bWUgY3ljbGljIHZhbHVlcyBhcmUgZXF1YWwuXG4gICAgICB2YXIgc3RhY2tlZCA9IHN0YWNrLmdldChhcnJheSk7XG4gICAgICBpZiAoc3RhY2tlZCkge1xuICAgICAgICByZXR1cm4gc3RhY2tlZCA9PSBvdGhlcjtcbiAgICAgIH1cbiAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgIHJlc3VsdCA9IHRydWUsXG4gICAgICAgICAgc2VlbiA9IChiaXRtYXNrICYgVU5PUkRFUkVEX0NPTVBBUkVfRkxBRyQxKSA/IG5ldyBTZXRDYWNoZSA6IHVuZGVmaW5lZDtcblxuICAgICAgc3RhY2suc2V0KGFycmF5LCBvdGhlcik7XG5cbiAgICAgIC8vIElnbm9yZSBub24taW5kZXggcHJvcGVydGllcy5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgYXJyTGVuZ3RoKSB7XG4gICAgICAgIHZhciBhcnJWYWx1ZSA9IGFycmF5W2luZGV4XSxcbiAgICAgICAgICAgIG90aFZhbHVlID0gb3RoZXJbaW5kZXhdO1xuXG4gICAgICAgIGlmIChjdXN0b21pemVyKSB7XG4gICAgICAgICAgdmFyIGNvbXBhcmVkID0gaXNQYXJ0aWFsXG4gICAgICAgICAgICA/IGN1c3RvbWl6ZXIob3RoVmFsdWUsIGFyclZhbHVlLCBpbmRleCwgb3RoZXIsIGFycmF5LCBzdGFjaylcbiAgICAgICAgICAgIDogY3VzdG9taXplcihhcnJWYWx1ZSwgb3RoVmFsdWUsIGluZGV4LCBhcnJheSwgb3RoZXIsIHN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcGFyZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmIChjb21wYXJlZCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdCA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgICAgIGlmIChzZWVuKSB7XG4gICAgICAgICAgaWYgKCFhcnJheVNvbWUob3RoZXIsIGZ1bmN0aW9uKG90aFZhbHVlLCBvdGhJbmRleCkge1xuICAgICAgICAgICAgICAgIGlmICghc2Vlbi5oYXMob3RoSW5kZXgpICYmXG4gICAgICAgICAgICAgICAgICAgIChhcnJWYWx1ZSA9PT0gb3RoVmFsdWUgfHwgZXF1YWxGdW5jKGFyclZhbHVlLCBvdGhWYWx1ZSwgY3VzdG9taXplciwgYml0bWFzaywgc3RhY2spKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlZW4uYWRkKG90aEluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghKFxuICAgICAgICAgICAgICBhcnJWYWx1ZSA9PT0gb3RoVmFsdWUgfHxcbiAgICAgICAgICAgICAgICBlcXVhbEZ1bmMoYXJyVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjaylcbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3RhY2tbJ2RlbGV0ZSddKGFycmF5KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG4gICAgdmFyIFN5bWJvbCQxID0gcm9vdC5TeW1ib2w7XG5cbiAgICAvKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbiAgICB2YXIgVWludDhBcnJheSA9IHJvb3QuVWludDhBcnJheTtcblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGBtYXBgIHRvIGl0cyBrZXktdmFsdWUgcGFpcnMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjb252ZXJ0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUga2V5LXZhbHVlIHBhaXJzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICByZXN1bHQgPSBBcnJheShtYXAuc2l6ZSk7XG5cbiAgICAgIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmVzdWx0WysraW5kZXhdID0gW2tleSwgdmFsdWVdO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGBzZXRgIHRvIGFuIGFycmF5IG9mIGl0cyB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjb252ZXJ0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgdmFsdWVzLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNldFRvQXJyYXkoc2V0KSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgICAgIHNldC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJlc3VsdFsrK2luZGV4XSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHZhciBVTk9SREVSRURfQ09NUEFSRV9GTEFHJDIgPSAxO1xuICAgIHZhciBQQVJUSUFMX0NPTVBBUkVfRkxBRyQzID0gMjtcbiAgICB2YXIgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgICB2YXIgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJztcbiAgICB2YXIgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nO1xuICAgIHZhciBtYXBUYWcgPSAnW29iamVjdCBNYXBdJztcbiAgICB2YXIgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXSc7XG4gICAgdmFyIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nO1xuICAgIHZhciBzZXRUYWcgPSAnW29iamVjdCBTZXRdJztcbiAgICB2YXIgc3RyaW5nVGFnJDEgPSAnW29iamVjdCBTdHJpbmddJztcbiAgICB2YXIgc3ltYm9sVGFnJDEgPSAnW29iamVjdCBTeW1ib2xdJztcbiAgICB2YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nO1xuICAgIHZhciBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XSc7XG4gICAgdmFyIHN5bWJvbFByb3RvID0gU3ltYm9sJDEgPyBTeW1ib2wkMS5wcm90b3R5cGUgOiB1bmRlZmluZWQ7XG4gICAgdmFyIHN5bWJvbFZhbHVlT2YgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnZhbHVlT2YgOiB1bmRlZmluZWQ7XG4gICAgLyoqXG4gICAgICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbERlZXBgIGZvciBjb21wYXJpbmcgb2JqZWN0cyBvZlxuICAgICAqIHRoZSBzYW1lIGB0b1N0cmluZ1RhZ2AuXG4gICAgICpcbiAgICAgKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBvbmx5IHN1cHBvcnRzIGNvbXBhcmluZyB2YWx1ZXMgd2l0aCB0YWdzIG9mXG4gICAgICogYEJvb2xlYW5gLCBgRGF0ZWAsIGBFcnJvcmAsIGBOdW1iZXJgLCBgUmVnRXhwYCwgb3IgYFN0cmluZ2AuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvdGhlciBUaGUgb3RoZXIgb2JqZWN0IHRvIGNvbXBhcmUuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgYHRvU3RyaW5nVGFnYCBvZiB0aGUgb2JqZWN0cyB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdXN0b21pemVyIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgY29tcGFyaXNvbiBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGBcbiAgICAgKiAgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhY2sgVHJhY2tzIHRyYXZlcnNlZCBgb2JqZWN0YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVxdWFsQnlUYWcob2JqZWN0LCBvdGhlciwgdGFnLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gICAgICBzd2l0Y2ggKHRhZykge1xuICAgICAgICBjYXNlIGRhdGFWaWV3VGFnOlxuICAgICAgICAgIGlmICgob2JqZWN0LmJ5dGVMZW5ndGggIT0gb3RoZXIuYnl0ZUxlbmd0aCkgfHxcbiAgICAgICAgICAgICAgKG9iamVjdC5ieXRlT2Zmc2V0ICE9IG90aGVyLmJ5dGVPZmZzZXQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIG9iamVjdCA9IG9iamVjdC5idWZmZXI7XG4gICAgICAgICAgb3RoZXIgPSBvdGhlci5idWZmZXI7XG5cbiAgICAgICAgY2FzZSBhcnJheUJ1ZmZlclRhZzpcbiAgICAgICAgICBpZiAoKG9iamVjdC5ieXRlTGVuZ3RoICE9IG90aGVyLmJ5dGVMZW5ndGgpIHx8XG4gICAgICAgICAgICAgICFlcXVhbEZ1bmMobmV3IFVpbnQ4QXJyYXkob2JqZWN0KSwgbmV3IFVpbnQ4QXJyYXkob3RoZXIpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgICBjYXNlIGJvb2xUYWc6XG4gICAgICAgIGNhc2UgZGF0ZVRhZzpcbiAgICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWJlcnMsIGRhdGVzIHRvIG1pbGxpc2Vjb25kcyBhbmRcbiAgICAgICAgICAvLyBib29sZWFucyB0byBgMWAgb3IgYDBgIHRyZWF0aW5nIGludmFsaWQgZGF0ZXMgY29lcmNlZCB0byBgTmFOYCBhc1xuICAgICAgICAgIC8vIG5vdCBlcXVhbC5cbiAgICAgICAgICByZXR1cm4gK29iamVjdCA9PSArb3RoZXI7XG5cbiAgICAgICAgY2FzZSBlcnJvclRhZzpcbiAgICAgICAgICByZXR1cm4gb2JqZWN0Lm5hbWUgPT0gb3RoZXIubmFtZSAmJiBvYmplY3QubWVzc2FnZSA9PSBvdGhlci5tZXNzYWdlO1xuXG4gICAgICAgIGNhc2UgbnVtYmVyVGFnOlxuICAgICAgICAgIC8vIFRyZWF0IGBOYU5gIHZzLiBgTmFOYCBhcyBlcXVhbC5cbiAgICAgICAgICByZXR1cm4gKG9iamVjdCAhPSArb2JqZWN0KSA/IG90aGVyICE9ICtvdGhlciA6IG9iamVjdCA9PSArb3RoZXI7XG5cbiAgICAgICAgY2FzZSByZWdleHBUYWc6XG4gICAgICAgIGNhc2Ugc3RyaW5nVGFnJDE6XG4gICAgICAgICAgLy8gQ29lcmNlIHJlZ2V4ZXMgdG8gc3RyaW5ncyBhbmQgdHJlYXQgc3RyaW5ncywgcHJpbWl0aXZlcyBhbmQgb2JqZWN0cyxcbiAgICAgICAgICAvLyBhcyBlcXVhbC4gU2VlIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1yZWdleHAucHJvdG90eXBlLnRvc3RyaW5nXG4gICAgICAgICAgLy8gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgICAgICByZXR1cm4gb2JqZWN0ID09IChvdGhlciArICcnKTtcblxuICAgICAgICBjYXNlIG1hcFRhZzpcbiAgICAgICAgICB2YXIgY29udmVydCA9IG1hcFRvQXJyYXk7XG5cbiAgICAgICAgY2FzZSBzZXRUYWc6XG4gICAgICAgICAgdmFyIGlzUGFydGlhbCA9IGJpdG1hc2sgJiBQQVJUSUFMX0NPTVBBUkVfRkxBRyQzO1xuICAgICAgICAgIGNvbnZlcnQgfHwgKGNvbnZlcnQgPSBzZXRUb0FycmF5KTtcblxuICAgICAgICAgIGlmIChvYmplY3Quc2l6ZSAhPSBvdGhlci5zaXplICYmICFpc1BhcnRpYWwpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gQXNzdW1lIGN5Y2xpYyB2YWx1ZXMgYXJlIGVxdWFsLlxuICAgICAgICAgIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KG9iamVjdCk7XG4gICAgICAgICAgaWYgKHN0YWNrZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGFja2VkID09IG90aGVyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBiaXRtYXNrIHw9IFVOT1JERVJFRF9DT01QQVJFX0ZMQUckMjtcbiAgICAgICAgICBzdGFjay5zZXQob2JqZWN0LCBvdGhlcik7XG5cbiAgICAgICAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICAgICAgICByZXR1cm4gZXF1YWxBcnJheXMoY29udmVydChvYmplY3QpLCBjb252ZXJ0KG90aGVyKSwgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjayk7XG5cbiAgICAgICAgY2FzZSBzeW1ib2xUYWckMTpcbiAgICAgICAgICBpZiAoc3ltYm9sVmFsdWVPZikge1xuICAgICAgICAgICAgcmV0dXJuIHN5bWJvbFZhbHVlT2YuY2FsbChvYmplY3QpID09IHN5bWJvbFZhbHVlT2YuY2FsbChvdGhlcik7XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNvbXBhcmlzb24gc3R5bGVzLiAqL1xuICAgIHZhciBQQVJUSUFMX0NPTVBBUkVfRkxBRyQ0ID0gMjtcblxuICAgIC8qKlxuICAgICAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUlzRXF1YWxEZWVwYCBmb3Igb2JqZWN0cyB3aXRoIHN1cHBvcnQgZm9yXG4gICAgICogcGFydGlhbCBkZWVwIGNvbXBhcmlzb25zLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdXN0b21pemVyIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJpdG1hc2sgVGhlIGJpdG1hc2sgb2YgY29tcGFyaXNvbiBmbGFncy4gU2VlIGBiYXNlSXNFcXVhbGBcbiAgICAgKiAgZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3RhY2sgVHJhY2tzIHRyYXZlcnNlZCBgb2JqZWN0YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVxdWFsT2JqZWN0cyhvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gICAgICB2YXIgaXNQYXJ0aWFsID0gYml0bWFzayAmIFBBUlRJQUxfQ09NUEFSRV9GTEFHJDQsXG4gICAgICAgICAgb2JqUHJvcHMgPSBrZXlzKG9iamVjdCksXG4gICAgICAgICAgb2JqTGVuZ3RoID0gb2JqUHJvcHMubGVuZ3RoLFxuICAgICAgICAgIG90aFByb3BzID0ga2V5cyhvdGhlciksXG4gICAgICAgICAgb3RoTGVuZ3RoID0gb3RoUHJvcHMubGVuZ3RoO1xuXG4gICAgICBpZiAob2JqTGVuZ3RoICE9IG90aExlbmd0aCAmJiAhaXNQYXJ0aWFsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBpbmRleCA9IG9iakxlbmd0aDtcbiAgICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICAgIHZhciBrZXkgPSBvYmpQcm9wc1tpbmRleF07XG4gICAgICAgIGlmICghKGlzUGFydGlhbCA/IGtleSBpbiBvdGhlciA6IGJhc2VIYXMob3RoZXIsIGtleSkpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBBc3N1bWUgY3ljbGljIHZhbHVlcyBhcmUgZXF1YWwuXG4gICAgICB2YXIgc3RhY2tlZCA9IHN0YWNrLmdldChvYmplY3QpO1xuICAgICAgaWYgKHN0YWNrZWQpIHtcbiAgICAgICAgcmV0dXJuIHN0YWNrZWQgPT0gb3RoZXI7XG4gICAgICB9XG4gICAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICAgIHN0YWNrLnNldChvYmplY3QsIG90aGVyKTtcblxuICAgICAgdmFyIHNraXBDdG9yID0gaXNQYXJ0aWFsO1xuICAgICAgd2hpbGUgKCsraW5kZXggPCBvYmpMZW5ndGgpIHtcbiAgICAgICAga2V5ID0gb2JqUHJvcHNbaW5kZXhdO1xuICAgICAgICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XSxcbiAgICAgICAgICAgIG90aFZhbHVlID0gb3RoZXJba2V5XTtcblxuICAgICAgICBpZiAoY3VzdG9taXplcikge1xuICAgICAgICAgIHZhciBjb21wYXJlZCA9IGlzUGFydGlhbFxuICAgICAgICAgICAgPyBjdXN0b21pemVyKG90aFZhbHVlLCBvYmpWYWx1ZSwga2V5LCBvdGhlciwgb2JqZWN0LCBzdGFjaylcbiAgICAgICAgICAgIDogY3VzdG9taXplcihvYmpWYWx1ZSwgb3RoVmFsdWUsIGtleSwgb2JqZWN0LCBvdGhlciwgc3RhY2spO1xuICAgICAgICB9XG4gICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgICAgICBpZiAoIShjb21wYXJlZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgID8gKG9ialZhbHVlID09PSBvdGhWYWx1ZSB8fCBlcXVhbEZ1bmMob2JqVmFsdWUsIG90aFZhbHVlLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjaykpXG4gICAgICAgICAgICAgIDogY29tcGFyZWRcbiAgICAgICAgICAgICkpIHtcbiAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBza2lwQ3RvciB8fCAoc2tpcEN0b3IgPSBrZXkgPT0gJ2NvbnN0cnVjdG9yJyk7XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0ICYmICFza2lwQ3Rvcikge1xuICAgICAgICB2YXIgb2JqQ3RvciA9IG9iamVjdC5jb25zdHJ1Y3RvcixcbiAgICAgICAgICAgIG90aEN0b3IgPSBvdGhlci5jb25zdHJ1Y3RvcjtcblxuICAgICAgICAvLyBOb24gYE9iamVjdGAgb2JqZWN0IGluc3RhbmNlcyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVhbC5cbiAgICAgICAgaWYgKG9iakN0b3IgIT0gb3RoQ3RvciAmJlxuICAgICAgICAgICAgKCdjb25zdHJ1Y3RvcicgaW4gb2JqZWN0ICYmICdjb25zdHJ1Y3RvcicgaW4gb3RoZXIpICYmXG4gICAgICAgICAgICAhKHR5cGVvZiBvYmpDdG9yID09ICdmdW5jdGlvbicgJiYgb2JqQ3RvciBpbnN0YW5jZW9mIG9iakN0b3IgJiZcbiAgICAgICAgICAgICAgdHlwZW9mIG90aEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBvdGhDdG9yIGluc3RhbmNlb2Ygb3RoQ3RvcikpIHtcbiAgICAgICAgICByZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc3RhY2tbJ2RlbGV0ZSddKG9iamVjdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIC8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbiAgICB2YXIgRGF0YVZpZXcgPSBnZXROYXRpdmUocm9vdCwgJ0RhdGFWaWV3Jyk7XG5cbiAgICAvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG4gICAgdmFyIFByb21pc2UgPSBnZXROYXRpdmUocm9vdCwgJ1Byb21pc2UnKTtcblxuICAgIC8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbiAgICB2YXIgU2V0ID0gZ2V0TmF0aXZlKHJvb3QsICdTZXQnKTtcblxuICAgIC8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbiAgICB2YXIgV2Vha01hcCA9IGdldE5hdGl2ZShyb290LCAnV2Vha01hcCcpO1xuXG4gICAgdmFyIG1hcFRhZyQxID0gJ1tvYmplY3QgTWFwXSc7XG4gICAgdmFyIG9iamVjdFRhZyQxID0gJ1tvYmplY3QgT2JqZWN0XSc7XG4gICAgdmFyIHByb21pc2VUYWcgPSAnW29iamVjdCBQcm9taXNlXSc7XG4gICAgdmFyIHNldFRhZyQxID0gJ1tvYmplY3QgU2V0XSc7XG4gICAgdmFyIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG4gICAgdmFyIGRhdGFWaWV3VGFnJDEgPSAnW29iamVjdCBEYXRhVmlld10nO1xuXG4gICAgLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xuICAgIHZhciBvYmplY3RQcm90byQxMCA9IE9iamVjdC5wcm90b3R5cGU7XG5cbiAgICAvKipcbiAgICAgKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gICAgICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gICAgICogb2YgdmFsdWVzLlxuICAgICAqL1xuICAgIHZhciBvYmplY3RUb1N0cmluZyQ0ID0gb2JqZWN0UHJvdG8kMTAudG9TdHJpbmc7XG5cbiAgICAvKiogVXNlZCB0byBkZXRlY3QgbWFwcywgc2V0cywgYW5kIHdlYWttYXBzLiAqL1xuICAgIHZhciBkYXRhVmlld0N0b3JTdHJpbmcgPSB0b1NvdXJjZShEYXRhVmlldyk7XG4gICAgdmFyIG1hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShNYXApO1xuICAgIHZhciBwcm9taXNlQ3RvclN0cmluZyA9IHRvU291cmNlKFByb21pc2UpO1xuICAgIHZhciBzZXRDdG9yU3RyaW5nID0gdG9Tb3VyY2UoU2V0KTtcbiAgICB2YXIgd2Vha01hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShXZWFrTWFwKTtcbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBgdG9TdHJpbmdUYWdgIG9mIGB2YWx1ZWAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0VGFnKHZhbHVlKSB7XG4gICAgICByZXR1cm4gb2JqZWN0VG9TdHJpbmckNC5jYWxsKHZhbHVlKTtcbiAgICB9XG5cbiAgICAvLyBGYWxsYmFjayBmb3IgZGF0YSB2aWV3cywgbWFwcywgc2V0cywgYW5kIHdlYWsgbWFwcyBpbiBJRSAxMSxcbiAgICAvLyBmb3IgZGF0YSB2aWV3cyBpbiBFZGdlLCBhbmQgcHJvbWlzZXMgaW4gTm9kZS5qcy5cbiAgICBpZiAoKERhdGFWaWV3ICYmIGdldFRhZyhuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDEpKSkgIT0gZGF0YVZpZXdUYWckMSkgfHxcbiAgICAgICAgKE1hcCAmJiBnZXRUYWcobmV3IE1hcCkgIT0gbWFwVGFnJDEpIHx8XG4gICAgICAgIChQcm9taXNlICYmIGdldFRhZyhQcm9taXNlLnJlc29sdmUoKSkgIT0gcHJvbWlzZVRhZykgfHxcbiAgICAgICAgKFNldCAmJiBnZXRUYWcobmV3IFNldCkgIT0gc2V0VGFnJDEpIHx8XG4gICAgICAgIChXZWFrTWFwICYmIGdldFRhZyhuZXcgV2Vha01hcCkgIT0gd2Vha01hcFRhZykpIHtcbiAgICAgIGdldFRhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBvYmplY3RUb1N0cmluZyQ0LmNhbGwodmFsdWUpLFxuICAgICAgICAgICAgQ3RvciA9IHJlc3VsdCA9PSBvYmplY3RUYWckMSA/IHZhbHVlLmNvbnN0cnVjdG9yIDogdW5kZWZpbmVkLFxuICAgICAgICAgICAgY3RvclN0cmluZyA9IEN0b3IgPyB0b1NvdXJjZShDdG9yKSA6IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAoY3RvclN0cmluZykge1xuICAgICAgICAgIHN3aXRjaCAoY3RvclN0cmluZykge1xuICAgICAgICAgICAgY2FzZSBkYXRhVmlld0N0b3JTdHJpbmc6IHJldHVybiBkYXRhVmlld1RhZyQxO1xuICAgICAgICAgICAgY2FzZSBtYXBDdG9yU3RyaW5nOiByZXR1cm4gbWFwVGFnJDE7XG4gICAgICAgICAgICBjYXNlIHByb21pc2VDdG9yU3RyaW5nOiByZXR1cm4gcHJvbWlzZVRhZztcbiAgICAgICAgICAgIGNhc2Ugc2V0Q3RvclN0cmluZzogcmV0dXJuIHNldFRhZyQxO1xuICAgICAgICAgICAgY2FzZSB3ZWFrTWFwQ3RvclN0cmluZzogcmV0dXJuIHdlYWtNYXBUYWc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBnZXRUYWckMSA9IGdldFRhZztcblxuICAgIHZhciBhcmdzVGFnJDIgPSAnW29iamVjdCBBcmd1bWVudHNdJztcbiAgICB2YXIgYXJyYXlUYWckMSA9ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgdmFyIGJvb2xUYWckMSA9ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgICB2YXIgZGF0ZVRhZyQxID0gJ1tvYmplY3QgRGF0ZV0nO1xuICAgIHZhciBlcnJvclRhZyQxID0gJ1tvYmplY3QgRXJyb3JdJztcbiAgICB2YXIgZnVuY1RhZyQxID0gJ1tvYmplY3QgRnVuY3Rpb25dJztcbiAgICB2YXIgbWFwVGFnJDIgPSAnW29iamVjdCBNYXBdJztcbiAgICB2YXIgbnVtYmVyVGFnJDEgPSAnW29iamVjdCBOdW1iZXJdJztcbiAgICB2YXIgb2JqZWN0VGFnJDIgPSAnW29iamVjdCBPYmplY3RdJztcbiAgICB2YXIgcmVnZXhwVGFnJDEgPSAnW29iamVjdCBSZWdFeHBdJztcbiAgICB2YXIgc2V0VGFnJDIgPSAnW29iamVjdCBTZXRdJztcbiAgICB2YXIgc3RyaW5nVGFnJDIgPSAnW29iamVjdCBTdHJpbmddJztcbiAgICB2YXIgd2Vha01hcFRhZyQxID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuICAgIHZhciBhcnJheUJ1ZmZlclRhZyQxID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJztcbiAgICB2YXIgZGF0YVZpZXdUYWckMiA9ICdbb2JqZWN0IERhdGFWaWV3XSc7XG4gICAgdmFyIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJztcbiAgICB2YXIgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nO1xuICAgIHZhciBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XSc7XG4gICAgdmFyIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nO1xuICAgIHZhciBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJztcbiAgICB2YXIgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XSc7XG4gICAgdmFyIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XSc7XG4gICAgdmFyIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XSc7XG4gICAgdmFyIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG4gICAgLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xuICAgIHZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xuICAgIHR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxuICAgIHR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbiAgICB0eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxuICAgIHR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbiAgICB0eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbiAgICB0eXBlZEFycmF5VGFnc1thcmdzVGFnJDJdID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWckMV0gPVxuICAgIHR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnJDFdID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZyQxXSA9XG4gICAgdHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWckMl0gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnJDFdID1cbiAgICB0eXBlZEFycmF5VGFnc1tlcnJvclRhZyQxXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWckMV0gPVxuICAgIHR5cGVkQXJyYXlUYWdzW21hcFRhZyQyXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZyQxXSA9XG4gICAgdHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnJDJdID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnJDFdID1cbiAgICB0eXBlZEFycmF5VGFnc1tzZXRUYWckMl0gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWckMl0gPVxuICAgIHR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWckMV0gPSBmYWxzZTtcblxuICAgIC8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbiAgICB2YXIgb2JqZWN0UHJvdG8kMTEgPSBPYmplY3QucHJvdG90eXBlO1xuXG4gICAgLyoqXG4gICAgICogVXNlZCB0byByZXNvbHZlIHRoZVxuICAgICAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICAgICAqIG9mIHZhbHVlcy5cbiAgICAgKi9cbiAgICB2YXIgb2JqZWN0VG9TdHJpbmckNSA9IG9iamVjdFByb3RvJDExLnRvU3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHNpbmNlIDMuMC4wXG4gICAgICogQGNhdGVnb3J5IExhbmdcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBjb3JyZWN0bHkgY2xhc3NpZmllZCxcbiAgICAgKiAgZWxzZSBgZmFsc2VgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqXG4gICAgICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICAgICAqIC8vID0+IGZhbHNlXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gICAgICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJlxuICAgICAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3Nbb2JqZWN0VG9TdHJpbmckNS5jYWxsKHZhbHVlKV07XG4gICAgfVxuXG4gICAgLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY29tcGFyaXNvbiBzdHlsZXMuICovXG4gICAgdmFyIFBBUlRJQUxfQ09NUEFSRV9GTEFHJDEgPSAyO1xuXG4gICAgLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xuICAgIHZhciBhcmdzVGFnJDEgPSAnW29iamVjdCBBcmd1bWVudHNdJztcbiAgICB2YXIgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nO1xuICAgIHZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcbiAgICAvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG4gICAgdmFyIG9iamVjdFByb3RvJDkgPSBPYmplY3QucHJvdG90eXBlO1xuXG4gICAgLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG4gICAgdmFyIGhhc093blByb3BlcnR5JDUgPSBvYmplY3RQcm90byQ5Lmhhc093blByb3BlcnR5O1xuXG4gICAgLyoqXG4gICAgICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlSXNFcXVhbGAgZm9yIGFycmF5cyBhbmQgb2JqZWN0cyB3aGljaCBwZXJmb3Jtc1xuICAgICAqIGRlZXAgY29tcGFyaXNvbnMgYW5kIHRyYWNrcyB0cmF2ZXJzZWQgb2JqZWN0cyBlbmFibGluZyBvYmplY3RzIHdpdGggY2lyY3VsYXJcbiAgICAgKiByZWZlcmVuY2VzIHRvIGJlIGNvbXBhcmVkLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY29tcGFyZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3RoZXIgVGhlIG90aGVyIG9iamVjdCB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGVxdWFsRnVuYyBUaGUgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGVxdWl2YWxlbnRzIG9mIHZhbHVlcy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2JpdG1hc2tdIFRoZSBiaXRtYXNrIG9mIGNvbXBhcmlzb24gZmxhZ3MuIFNlZSBgYmFzZUlzRXF1YWxgXG4gICAgICogIGZvciBtb3JlIGRldGFpbHMuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBgb2JqZWN0YCBhbmQgYG90aGVyYCBvYmplY3RzLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0cyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VJc0VxdWFsRGVlcChvYmplY3QsIG90aGVyLCBlcXVhbEZ1bmMsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gICAgICB2YXIgb2JqSXNBcnIgPSBpc0FycmF5KG9iamVjdCksXG4gICAgICAgICAgb3RoSXNBcnIgPSBpc0FycmF5KG90aGVyKSxcbiAgICAgICAgICBvYmpUYWcgPSBhcnJheVRhZyxcbiAgICAgICAgICBvdGhUYWcgPSBhcnJheVRhZztcblxuICAgICAgaWYgKCFvYmpJc0Fycikge1xuICAgICAgICBvYmpUYWcgPSBnZXRUYWckMShvYmplY3QpO1xuICAgICAgICBvYmpUYWcgPSBvYmpUYWcgPT0gYXJnc1RhZyQxID8gb2JqZWN0VGFnIDogb2JqVGFnO1xuICAgICAgfVxuICAgICAgaWYgKCFvdGhJc0Fycikge1xuICAgICAgICBvdGhUYWcgPSBnZXRUYWckMShvdGhlcik7XG4gICAgICAgIG90aFRhZyA9IG90aFRhZyA9PSBhcmdzVGFnJDEgPyBvYmplY3RUYWcgOiBvdGhUYWc7XG4gICAgICB9XG4gICAgICB2YXIgb2JqSXNPYmogPSBvYmpUYWcgPT0gb2JqZWN0VGFnICYmICFpc0hvc3RPYmplY3Qob2JqZWN0KSxcbiAgICAgICAgICBvdGhJc09iaiA9IG90aFRhZyA9PSBvYmplY3RUYWcgJiYgIWlzSG9zdE9iamVjdChvdGhlciksXG4gICAgICAgICAgaXNTYW1lVGFnID0gb2JqVGFnID09IG90aFRhZztcblxuICAgICAgaWYgKGlzU2FtZVRhZyAmJiAhb2JqSXNPYmopIHtcbiAgICAgICAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgICAgICAgcmV0dXJuIChvYmpJc0FyciB8fCBpc1R5cGVkQXJyYXkob2JqZWN0KSlcbiAgICAgICAgICA/IGVxdWFsQXJyYXlzKG9iamVjdCwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgYml0bWFzaywgc3RhY2spXG4gICAgICAgICAgOiBlcXVhbEJ5VGFnKG9iamVjdCwgb3RoZXIsIG9ialRhZywgZXF1YWxGdW5jLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjayk7XG4gICAgICB9XG4gICAgICBpZiAoIShiaXRtYXNrICYgUEFSVElBTF9DT01QQVJFX0ZMQUckMSkpIHtcbiAgICAgICAgdmFyIG9iaklzV3JhcHBlZCA9IG9iaklzT2JqICYmIGhhc093blByb3BlcnR5JDUuY2FsbChvYmplY3QsICdfX3dyYXBwZWRfXycpLFxuICAgICAgICAgICAgb3RoSXNXcmFwcGVkID0gb3RoSXNPYmogJiYgaGFzT3duUHJvcGVydHkkNS5jYWxsKG90aGVyLCAnX193cmFwcGVkX18nKTtcblxuICAgICAgICBpZiAob2JqSXNXcmFwcGVkIHx8IG90aElzV3JhcHBlZCkge1xuICAgICAgICAgIHZhciBvYmpVbndyYXBwZWQgPSBvYmpJc1dyYXBwZWQgPyBvYmplY3QudmFsdWUoKSA6IG9iamVjdCxcbiAgICAgICAgICAgICAgb3RoVW53cmFwcGVkID0gb3RoSXNXcmFwcGVkID8gb3RoZXIudmFsdWUoKSA6IG90aGVyO1xuXG4gICAgICAgICAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgICAgICAgICByZXR1cm4gZXF1YWxGdW5jKG9ialVud3JhcHBlZCwgb3RoVW53cmFwcGVkLCBjdXN0b21pemVyLCBiaXRtYXNrLCBzdGFjayk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICghaXNTYW1lVGFnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gICAgICByZXR1cm4gZXF1YWxPYmplY3RzKG9iamVjdCwgb3RoZXIsIGVxdWFsRnVuYywgY3VzdG9taXplciwgYml0bWFzaywgc3RhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzRXF1YWxgIHdoaWNoIHN1cHBvcnRzIHBhcnRpYWwgY29tcGFyaXNvbnNcbiAgICAgKiBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICAgICAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaXNvbnMuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbYml0bWFza10gVGhlIGJpdG1hc2sgb2YgY29tcGFyaXNvbiBmbGFncy5cbiAgICAgKiAgVGhlIGJpdG1hc2sgbWF5IGJlIGNvbXBvc2VkIG9mIHRoZSBmb2xsb3dpbmcgZmxhZ3M6XG4gICAgICogICAgIDEgLSBVbm9yZGVyZWQgY29tcGFyaXNvblxuICAgICAqICAgICAyIC0gUGFydGlhbCBjb21wYXJpc29uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBgdmFsdWVgIGFuZCBgb3RoZXJgIG9iamVjdHMuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlSXNFcXVhbCh2YWx1ZSwgb3RoZXIsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKSB7XG4gICAgICBpZiAodmFsdWUgPT09IG90aGVyKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKHZhbHVlID09IG51bGwgfHwgb3RoZXIgPT0gbnVsbCB8fCAoIWlzT2JqZWN0KHZhbHVlKSAmJiAhaXNPYmplY3RMaWtlKG90aGVyKSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFzZUlzRXF1YWxEZWVwKHZhbHVlLCBvdGhlciwgYmFzZUlzRXF1YWwsIGN1c3RvbWl6ZXIsIGJpdG1hc2ssIHN0YWNrKTtcbiAgICB9XG5cbiAgICB2YXIgVU5PUkRFUkVEX0NPTVBBUkVfRkxBRyA9IDE7XG4gICAgdmFyIFBBUlRJQUxfQ09NUEFSRV9GTEFHID0gMjtcbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc01hdGNoYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpbnNwZWN0LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBwcm9wZXJ0eSB2YWx1ZXMgdG8gbWF0Y2guXG4gICAgICogQHBhcmFtIHtBcnJheX0gbWF0Y2hEYXRhIFRoZSBwcm9wZXJ0eSBuYW1lcywgdmFsdWVzLCBhbmQgY29tcGFyZSBmbGFncyB0byBtYXRjaC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb21wYXJpc29ucy5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYG9iamVjdGAgaXMgYSBtYXRjaCwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VJc01hdGNoKG9iamVjdCwgc291cmNlLCBtYXRjaERhdGEsIGN1c3RvbWl6ZXIpIHtcbiAgICAgIHZhciBpbmRleCA9IG1hdGNoRGF0YS5sZW5ndGgsXG4gICAgICAgICAgbGVuZ3RoID0gaW5kZXgsXG4gICAgICAgICAgbm9DdXN0b21pemVyID0gIWN1c3RvbWl6ZXI7XG5cbiAgICAgIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gIWxlbmd0aDtcbiAgICAgIH1cbiAgICAgIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICAgICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgdmFyIGRhdGEgPSBtYXRjaERhdGFbaW5kZXhdO1xuICAgICAgICBpZiAoKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKVxuICAgICAgICAgICAgICA/IGRhdGFbMV0gIT09IG9iamVjdFtkYXRhWzBdXVxuICAgICAgICAgICAgICA6ICEoZGF0YVswXSBpbiBvYmplY3QpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIGRhdGEgPSBtYXRjaERhdGFbaW5kZXhdO1xuICAgICAgICB2YXIga2V5ID0gZGF0YVswXSxcbiAgICAgICAgICAgIG9ialZhbHVlID0gb2JqZWN0W2tleV0sXG4gICAgICAgICAgICBzcmNWYWx1ZSA9IGRhdGFbMV07XG5cbiAgICAgICAgaWYgKG5vQ3VzdG9taXplciAmJiBkYXRhWzJdKSB7XG4gICAgICAgICAgaWYgKG9ialZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgc3RhY2sgPSBuZXcgU3RhY2s7XG4gICAgICAgICAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBjdXN0b21pemVyKG9ialZhbHVlLCBzcmNWYWx1ZSwga2V5LCBvYmplY3QsIHNvdXJjZSwgc3RhY2spO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIShyZXN1bHQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgID8gYmFzZUlzRXF1YWwoc3JjVmFsdWUsIG9ialZhbHVlLCBjdXN0b21pemVyLCBVTk9SREVSRURfQ09NUEFSRV9GTEFHIHwgUEFSVElBTF9DT01QQVJFX0ZMQUcsIHN0YWNrKVxuICAgICAgICAgICAgICAgIDogcmVzdWx0XG4gICAgICAgICAgICAgICkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciBzdHJpY3QgZXF1YWxpdHkgY29tcGFyaXNvbnMsIGkuZS4gYD09PWAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlmIHN1aXRhYmxlIGZvciBzdHJpY3RcbiAgICAgKiAgZXF1YWxpdHkgY29tcGFyaXNvbnMsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc1N0cmljdENvbXBhcmFibGUodmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdmFsdWUgJiYgIWlzT2JqZWN0KHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBwcm9wZXJ0eSBuYW1lcywgdmFsdWVzLCBhbmQgY29tcGFyZSBmbGFncyBvZiBgb2JqZWN0YC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbWF0Y2ggZGF0YSBvZiBgb2JqZWN0YC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRNYXRjaERhdGEob2JqZWN0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0ga2V5cyhvYmplY3QpLFxuICAgICAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICB2YXIga2V5ID0gcmVzdWx0W2xlbmd0aF0sXG4gICAgICAgICAgICB2YWx1ZSA9IG9iamVjdFtrZXldO1xuXG4gICAgICAgIHJlc3VsdFtsZW5ndGhdID0gW2tleSwgdmFsdWUsIGlzU3RyaWN0Q29tcGFyYWJsZSh2YWx1ZSldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYG1hdGNoZXNQcm9wZXJ0eWAgZm9yIHNvdXJjZSB2YWx1ZXMgc3VpdGFibGVcbiAgICAgKiBmb3Igc3RyaWN0IGVxdWFsaXR5IGNvbXBhcmlzb25zLCBpLmUuIGA9PT1gLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAgICAgKiBAcGFyYW0geyp9IHNyY1ZhbHVlIFRoZSB2YWx1ZSB0byBtYXRjaC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzcGVjIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hdGNoZXNTdHJpY3RDb21wYXJhYmxlKGtleSwgc3JjVmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgICAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmplY3Rba2V5XSA9PT0gc3JjVmFsdWUgJiZcbiAgICAgICAgICAoc3JjVmFsdWUgIT09IHVuZGVmaW5lZCB8fCAoa2V5IGluIE9iamVjdChvYmplY3QpKSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLm1hdGNoZXNgIHdoaWNoIGRvZXNuJ3QgY2xvbmUgYHNvdXJjZWAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCBvZiBwcm9wZXJ0eSB2YWx1ZXMgdG8gbWF0Y2guXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc3BlYyBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlTWF0Y2hlcyhzb3VyY2UpIHtcbiAgICAgIHZhciBtYXRjaERhdGEgPSBnZXRNYXRjaERhdGEoc291cmNlKTtcbiAgICAgIGlmIChtYXRjaERhdGEubGVuZ3RoID09IDEgJiYgbWF0Y2hEYXRhWzBdWzJdKSB7XG4gICAgICAgIHJldHVybiBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZShtYXRjaERhdGFbMF1bMF0sIG1hdGNoRGF0YVswXVsxXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBvYmplY3QgPT09IHNvdXJjZSB8fCBiYXNlSXNNYXRjaChvYmplY3QsIHNvdXJjZSwgbWF0Y2hEYXRhKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbiAgICB2YXIgRlVOQ19FUlJPUl9URVhUJDEgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBtZW1vaXplcyB0aGUgcmVzdWx0IG9mIGBmdW5jYC4gSWYgYHJlc29sdmVyYCBpc1xuICAgICAqIHByb3ZpZGVkLCBpdCBkZXRlcm1pbmVzIHRoZSBjYWNoZSBrZXkgZm9yIHN0b3JpbmcgdGhlIHJlc3VsdCBiYXNlZCBvbiB0aGVcbiAgICAgKiBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIG1lbW9pemVkIGZ1bmN0aW9uLiBCeSBkZWZhdWx0LCB0aGUgZmlyc3QgYXJndW1lbnRcbiAgICAgKiBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24gaXMgdXNlZCBhcyB0aGUgbWFwIGNhY2hlIGtleS4gVGhlIGBmdW5jYFxuICAgICAqIGlzIGludm9rZWQgd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIG1lbW9pemVkIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogKipOb3RlOioqIFRoZSBjYWNoZSBpcyBleHBvc2VkIGFzIHRoZSBgY2FjaGVgIHByb3BlcnR5IG9uIHRoZSBtZW1vaXplZFxuICAgICAqIGZ1bmN0aW9uLiBJdHMgY3JlYXRpb24gbWF5IGJlIGN1c3RvbWl6ZWQgYnkgcmVwbGFjaW5nIHRoZSBgXy5tZW1vaXplLkNhY2hlYFxuICAgICAqIGNvbnN0cnVjdG9yIHdpdGggb25lIHdob3NlIGluc3RhbmNlcyBpbXBsZW1lbnQgdGhlXG4gICAgICogW2BNYXBgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1wcm9wZXJ0aWVzLW9mLXRoZS1tYXAtcHJvdG90eXBlLW9iamVjdClcbiAgICAgKiBtZXRob2QgaW50ZXJmYWNlIG9mIGBkZWxldGVgLCBgZ2V0YCwgYGhhc2AsIGFuZCBgc2V0YC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSAwLjEuMFxuICAgICAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGhhdmUgaXRzIG91dHB1dCBtZW1vaXplZC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbcmVzb2x2ZXJdIFRoZSBmdW5jdGlvbiB0byByZXNvbHZlIHRoZSBjYWNoZSBrZXkuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICdhJzogMSwgJ2InOiAyIH07XG4gICAgICogdmFyIG90aGVyID0geyAnYyc6IDMsICdkJzogNCB9O1xuICAgICAqXG4gICAgICogdmFyIHZhbHVlcyA9IF8ubWVtb2l6ZShfLnZhbHVlcyk7XG4gICAgICogdmFsdWVzKG9iamVjdCk7XG4gICAgICogLy8gPT4gWzEsIDJdXG4gICAgICpcbiAgICAgKiB2YWx1ZXMob3RoZXIpO1xuICAgICAqIC8vID0+IFszLCA0XVxuICAgICAqXG4gICAgICogb2JqZWN0LmEgPSAyO1xuICAgICAqIHZhbHVlcyhvYmplY3QpO1xuICAgICAqIC8vID0+IFsxLCAyXVxuICAgICAqXG4gICAgICogLy8gTW9kaWZ5IHRoZSByZXN1bHQgY2FjaGUuXG4gICAgICogdmFsdWVzLmNhY2hlLnNldChvYmplY3QsIFsnYScsICdiJ10pO1xuICAgICAqIHZhbHVlcyhvYmplY3QpO1xuICAgICAqIC8vID0+IFsnYScsICdiJ11cbiAgICAgKlxuICAgICAqIC8vIFJlcGxhY2UgYF8ubWVtb2l6ZS5DYWNoZWAuXG4gICAgICogXy5tZW1vaXplLkNhY2hlID0gV2Vha01hcDtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtZW1vaXplKGZ1bmMsIHJlc29sdmVyKSB7XG4gICAgICBpZiAodHlwZW9mIGZ1bmMgIT0gJ2Z1bmN0aW9uJyB8fCAocmVzb2x2ZXIgJiYgdHlwZW9mIHJlc29sdmVyICE9ICdmdW5jdGlvbicpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoRlVOQ19FUlJPUl9URVhUJDEpO1xuICAgICAgfVxuICAgICAgdmFyIG1lbW9pemVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICAgICAga2V5ID0gcmVzb2x2ZXIgPyByZXNvbHZlci5hcHBseSh0aGlzLCBhcmdzKSA6IGFyZ3NbMF0sXG4gICAgICAgICAgICBjYWNoZSA9IG1lbW9pemVkLmNhY2hlO1xuXG4gICAgICAgIGlmIChjYWNoZS5oYXMoa2V5KSkge1xuICAgICAgICAgIHJldHVybiBjYWNoZS5nZXQoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgbWVtb2l6ZWQuY2FjaGUgPSBjYWNoZS5zZXQoa2V5LCByZXN1bHQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfTtcbiAgICAgIG1lbW9pemVkLmNhY2hlID0gbmV3IChtZW1vaXplLkNhY2hlIHx8IE1hcENhY2hlKTtcbiAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9XG5cbiAgICAvLyBBc3NpZ24gY2FjaGUgdG8gYF8ubWVtb2l6ZWAuXG4gICAgbWVtb2l6ZS5DYWNoZSA9IE1hcENhY2hlO1xuXG4gICAgLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG4gICAgdmFyIElORklOSVRZJDEgPSAxIC8gMDtcblxuICAgIC8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xuICAgIHZhciBzeW1ib2xQcm90byQxID0gU3ltYm9sJDEgPyBTeW1ib2wkMS5wcm90b3R5cGUgOiB1bmRlZmluZWQ7XG4gICAgdmFyIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8kMSA/IHN5bWJvbFByb3RvJDEudG9TdHJpbmcgOiB1bmRlZmluZWQ7XG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udG9TdHJpbmdgIHdoaWNoIGRvZXNuJ3QgY29udmVydCBudWxsaXNoXG4gICAgICogdmFsdWVzIHRvIGVtcHR5IHN0cmluZ3MuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VUb1N0cmluZyh2YWx1ZSkge1xuICAgICAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgICAgaWYgKGlzU3ltYm9sKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICAgICAgfVxuICAgICAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgICAgIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkkMSkgPyAnLTAnIDogcmVzdWx0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcuIEFuIGVtcHR5IHN0cmluZyBpcyByZXR1cm5lZCBmb3IgYG51bGxgXG4gICAgICogYW5kIGB1bmRlZmluZWRgIHZhbHVlcy4gVGhlIHNpZ24gb2YgYC0wYCBpcyBwcmVzZXJ2ZWQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAc2luY2UgNC4wLjBcbiAgICAgKiBAY2F0ZWdvcnkgTGFuZ1xuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfLnRvU3RyaW5nKG51bGwpO1xuICAgICAqIC8vID0+ICcnXG4gICAgICpcbiAgICAgKiBfLnRvU3RyaW5nKC0wKTtcbiAgICAgKiAvLyA9PiAnLTAnXG4gICAgICpcbiAgICAgKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gICAgICogLy8gPT4gJzEsMiwzJ1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/ICcnIDogYmFzZVRvU3RyaW5nKHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKiogVXNlZCB0byBtYXRjaCBwcm9wZXJ0eSBuYW1lcyB3aXRoaW4gcHJvcGVydHkgcGF0aHMuICovXG4gICAgdmFyIHJlUHJvcE5hbWUgPSAvW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxcXF18XFxcXC4pKj8pXFwyKVxcXXwoPz0oXFwufFxcW1xcXSkoPzpcXDR8JCkpL2c7XG5cbiAgICAvKiogVXNlZCB0byBtYXRjaCBiYWNrc2xhc2hlcyBpbiBwcm9wZXJ0eSBwYXRocy4gKi9cbiAgICB2YXIgcmVFc2NhcGVDaGFyID0gL1xcXFwoXFxcXCk/L2c7XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBgc3RyaW5nYCB0byBhIHByb3BlcnR5IHBhdGggYXJyYXkuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBjb252ZXJ0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAgICAgKi9cbiAgICB2YXIgc3RyaW5nVG9QYXRoID0gbWVtb2l6ZShmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgIHRvU3RyaW5nKHN0cmluZykucmVwbGFjZShyZVByb3BOYW1lLCBmdW5jdGlvbihtYXRjaCwgbnVtYmVyLCBxdW90ZSwgc3RyaW5nKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHF1b3RlID8gc3RyaW5nLnJlcGxhY2UocmVFc2NhcGVDaGFyLCAnJDEnKSA6IChudW1iZXIgfHwgbWF0Y2gpKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIENhc3RzIGB2YWx1ZWAgdG8gYSBwYXRoIGFycmF5IGlmIGl0J3Mgbm90IG9uZS5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gaW5zcGVjdC5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGNhc3QgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjYXN0UGF0aCh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGlzQXJyYXkodmFsdWUpID8gdmFsdWUgOiBzdHJpbmdUb1BhdGgodmFsdWUpO1xuICAgIH1cblxuICAgIHZhciByZUlzRGVlcFByb3AgPSAvXFwufFxcWyg/OlteW1xcXV0qfChbXCInXSkoPzooPyFcXDEpW15cXFxcXXxcXFxcLikqP1xcMSlcXF0vO1xuICAgIHZhciByZUlzUGxhaW5Qcm9wID0gL15cXHcqJC87XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwcm9wZXJ0eSBuYW1lIGFuZCBub3QgYSBwcm9wZXJ0eSBwYXRoLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeSBrZXlzIG9uLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSwgZWxzZSBgZmFsc2VgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlzS2V5KHZhbHVlLCBvYmplY3QpIHtcbiAgICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgICAgIGlmICh0eXBlID09ICdudW1iZXInIHx8IHR5cGUgPT0gJ3N5bWJvbCcgfHwgdHlwZSA9PSAnYm9vbGVhbicgfHxcbiAgICAgICAgICB2YWx1ZSA9PSBudWxsIHx8IGlzU3ltYm9sKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZUlzUGxhaW5Qcm9wLnRlc3QodmFsdWUpIHx8ICFyZUlzRGVlcFByb3AudGVzdCh2YWx1ZSkgfHxcbiAgICAgICAgKG9iamVjdCAhPSBudWxsICYmIHZhbHVlIGluIE9iamVjdChvYmplY3QpKTtcbiAgICB9XG5cbiAgICAvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbiAgICB2YXIgSU5GSU5JVFkkMiA9IDEgLyAwO1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyBrZXkgaWYgaXQncyBub3QgYSBzdHJpbmcgb3Igc3ltYm9sLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd8c3ltYm9sfSBSZXR1cm5zIHRoZSBrZXkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gdG9LZXkodmFsdWUpIHtcbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHwgaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gICAgICByZXR1cm4gKHJlc3VsdCA9PSAnMCcgJiYgKDEgLyB2YWx1ZSkgPT0gLUlORklOSVRZJDIpID8gJy0wJyA6IHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5nZXRgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVmYXVsdCB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlR2V0KG9iamVjdCwgcGF0aCkge1xuICAgICAgcGF0aCA9IGlzS2V5KHBhdGgsIG9iamVjdCkgPyBbcGF0aF0gOiBjYXN0UGF0aChwYXRoKTtcblxuICAgICAgdmFyIGluZGV4ID0gMCxcbiAgICAgICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKG9iamVjdCAhPSBudWxsICYmIGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdFt0b0tleShwYXRoW2luZGV4KytdKV07XG4gICAgICB9XG4gICAgICByZXR1cm4gKGluZGV4ICYmIGluZGV4ID09IGxlbmd0aCkgPyBvYmplY3QgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgdmFsdWUgYXQgYHBhdGhgIG9mIGBvYmplY3RgLiBJZiB0aGUgcmVzb2x2ZWQgdmFsdWUgaXNcbiAgICAgKiBgdW5kZWZpbmVkYCwgdGhlIGBkZWZhdWx0VmFsdWVgIGlzIHVzZWQgaW4gaXRzIHBsYWNlLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHNpbmNlIDMuNy4wXG4gICAgICogQGNhdGVnb3J5IE9iamVjdFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICAgICAqIEBwYXJhbSB7Kn0gW2RlZmF1bHRWYWx1ZV0gVGhlIHZhbHVlIHJldHVybmVkIGZvciBgdW5kZWZpbmVkYCByZXNvbHZlZCB2YWx1ZXMuXG4gICAgICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc29sdmVkIHZhbHVlLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqZWN0ID0geyAnYSc6IFt7ICdiJzogeyAnYyc6IDMgfSB9XSB9O1xuICAgICAqXG4gICAgICogXy5nZXQob2JqZWN0LCAnYVswXS5iLmMnKTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICpcbiAgICAgKiBfLmdldChvYmplY3QsIFsnYScsICcwJywgJ2InLCAnYyddKTtcbiAgICAgKiAvLyA9PiAzXG4gICAgICpcbiAgICAgKiBfLmdldChvYmplY3QsICdhLmIuYycsICdkZWZhdWx0Jyk7XG4gICAgICogLy8gPT4gJ2RlZmF1bHQnXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0KG9iamVjdCwgcGF0aCwgZGVmYXVsdFZhbHVlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBiYXNlR2V0KG9iamVjdCwgcGF0aCk7XG4gICAgICByZXR1cm4gcmVzdWx0ID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsdWUgOiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaGFzSW5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVlcCBwYXRocy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gICAgICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IGtleSBUaGUga2V5IHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlSGFzSW4ob2JqZWN0LCBrZXkpIHtcbiAgICAgIHJldHVybiBvYmplY3QgIT0gbnVsbCAmJiBrZXkgaW4gT2JqZWN0KG9iamVjdCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGBwYXRoYCBleGlzdHMgb24gYG9iamVjdGAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAgICAgKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYXNGdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjayBwcm9wZXJ0aWVzLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGF0aGAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaGFzUGF0aChvYmplY3QsIHBhdGgsIGhhc0Z1bmMpIHtcbiAgICAgIHBhdGggPSBpc0tleShwYXRoLCBvYmplY3QpID8gW3BhdGhdIDogY2FzdFBhdGgocGF0aCk7XG5cbiAgICAgIHZhciByZXN1bHQsXG4gICAgICAgICAgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIGtleSA9IHRvS2V5KHBhdGhbaW5kZXhdKTtcbiAgICAgICAgaWYgKCEocmVzdWx0ID0gb2JqZWN0ICE9IG51bGwgJiYgaGFzRnVuYyhvYmplY3QsIGtleSkpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgb2JqZWN0ID0gb2JqZWN0W2tleV07XG4gICAgICB9XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICB2YXIgbGVuZ3RoID0gb2JqZWN0ID8gb2JqZWN0Lmxlbmd0aCA6IDA7XG4gICAgICByZXR1cm4gISFsZW5ndGggJiYgaXNMZW5ndGgobGVuZ3RoKSAmJiBpc0luZGV4KGtleSwgbGVuZ3RoKSAmJlxuICAgICAgICAoaXNBcnJheShvYmplY3QpIHx8IGlzU3RyaW5nKG9iamVjdCkgfHwgaXNBcmd1bWVudHMob2JqZWN0KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIGBwYXRoYCBpcyBhIGRpcmVjdCBvciBpbmhlcml0ZWQgcHJvcGVydHkgb2YgYG9iamVjdGAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAc2luY2UgNC4wLjBcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICAgICAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIGNoZWNrLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGF0aGAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSBfLmNyZWF0ZSh7ICdhJzogXy5jcmVhdGUoeyAnYic6IDIgfSkgfSk7XG4gICAgICpcbiAgICAgKiBfLmhhc0luKG9iamVjdCwgJ2EnKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmhhc0luKG9iamVjdCwgJ2EuYicpO1xuICAgICAqIC8vID0+IHRydWVcbiAgICAgKlxuICAgICAqIF8uaGFzSW4ob2JqZWN0LCBbJ2EnLCAnYiddKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICpcbiAgICAgKiBfLmhhc0luKG9iamVjdCwgJ2InKTtcbiAgICAgKiAvLyA9PiBmYWxzZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGhhc0luKG9iamVjdCwgcGF0aCkge1xuICAgICAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIGhhc1BhdGgob2JqZWN0LCBwYXRoLCBiYXNlSGFzSW4pO1xuICAgIH1cblxuICAgIHZhciBVTk9SREVSRURfQ09NUEFSRV9GTEFHJDMgPSAxO1xuICAgIHZhciBQQVJUSUFMX0NPTVBBUkVfRkxBRyQ1ID0gMjtcbiAgICAvKipcbiAgICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tYXRjaGVzUHJvcGVydHlgIHdoaWNoIGRvZXNuJ3QgY2xvbmUgYHNyY1ZhbHVlYC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAgICAgKiBAcGFyYW0geyp9IHNyY1ZhbHVlIFRoZSB2YWx1ZSB0byBtYXRjaC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBzcGVjIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGJhc2VNYXRjaGVzUHJvcGVydHkocGF0aCwgc3JjVmFsdWUpIHtcbiAgICAgIGlmIChpc0tleShwYXRoKSAmJiBpc1N0cmljdENvbXBhcmFibGUoc3JjVmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBtYXRjaGVzU3RyaWN0Q29tcGFyYWJsZSh0b0tleShwYXRoKSwgc3JjVmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICB2YXIgb2JqVmFsdWUgPSBnZXQob2JqZWN0LCBwYXRoKTtcbiAgICAgICAgcmV0dXJuIChvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkICYmIG9ialZhbHVlID09PSBzcmNWYWx1ZSlcbiAgICAgICAgICA/IGhhc0luKG9iamVjdCwgcGF0aClcbiAgICAgICAgICA6IGJhc2VJc0VxdWFsKHNyY1ZhbHVlLCBvYmpWYWx1ZSwgdW5kZWZpbmVkLCBVTk9SREVSRURfQ09NUEFSRV9GTEFHJDMgfCBQQVJUSUFMX0NPTVBBUkVfRkxBRyQ1KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgZmlyc3QgYXJndW1lbnQgZ2l2ZW4gdG8gaXQuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHNpbmNlIDAuMS4wXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAY2F0ZWdvcnkgVXRpbFxuICAgICAqIEBwYXJhbSB7Kn0gdmFsdWUgQW55IHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBvYmplY3QgPSB7ICd1c2VyJzogJ2ZyZWQnIH07XG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gICAgICogLy8gPT4gdHJ1ZVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlUHJvcGVydHlgIHdoaWNoIHN1cHBvcnRzIGRlZXAgcGF0aHMuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYWNjZXNzb3IgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZVByb3BlcnR5RGVlcChwYXRoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICAgIHJldHVybiBiYXNlR2V0KG9iamVjdCwgcGF0aCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIHZhbHVlIGF0IGBwYXRoYCBvZiBhIGdpdmVuIG9iamVjdC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSAyLjQuMFxuICAgICAqIEBjYXRlZ29yeSBVdGlsXG4gICAgICogQHBhcmFtIHtBcnJheXxzdHJpbmd9IHBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhY2Nlc3NvciBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9iamVjdHMgPSBbXG4gICAgICogICB7ICdhJzogeyAnYic6IDIgfSB9LFxuICAgICAqICAgeyAnYSc6IHsgJ2InOiAxIH0gfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiBfLm1hcChvYmplY3RzLCBfLnByb3BlcnR5KCdhLmInKSk7XG4gICAgICogLy8gPT4gWzIsIDFdXG4gICAgICpcbiAgICAgKiBfLm1hcChfLnNvcnRCeShvYmplY3RzLCBfLnByb3BlcnR5KFsnYScsICdiJ10pKSwgJ2EuYicpO1xuICAgICAqIC8vID0+IFsxLCAyXVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByb3BlcnR5KHBhdGgpIHtcbiAgICAgIHJldHVybiBpc0tleShwYXRoKSA/IGJhc2VQcm9wZXJ0eSh0b0tleShwYXRoKSkgOiBiYXNlUHJvcGVydHlEZWVwKHBhdGgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLml0ZXJhdGVlYC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHsqfSBbdmFsdWU9Xy5pZGVudGl0eV0gVGhlIHZhbHVlIHRvIGNvbnZlcnQgdG8gYW4gaXRlcmF0ZWUuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBpdGVyYXRlZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlSXRlcmF0ZWUodmFsdWUpIHtcbiAgICAgIC8vIERvbid0IHN0b3JlIHRoZSBgdHlwZW9mYCByZXN1bHQgaW4gYSB2YXJpYWJsZSB0byBhdm9pZCBhIEpJVCBidWcgaW4gU2FmYXJpIDkuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE1NjAzNCBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBpZGVudGl0eTtcbiAgICAgIH1cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIGlzQXJyYXkodmFsdWUpXG4gICAgICAgICAgPyBiYXNlTWF0Y2hlc1Byb3BlcnR5KHZhbHVlWzBdLCB2YWx1ZVsxXSlcbiAgICAgICAgICA6IGJhc2VNYXRjaGVzKHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9wZXJ0eSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXRlcmF0ZXMgb3ZlciBvd24gZW51bWVyYWJsZSBzdHJpbmcga2V5ZWQgcHJvcGVydGllcyBvZiBhbiBvYmplY3QgYW5kXG4gICAgICogaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgaXRlcmF0ZWUgaXMgaW52b2tlZCB3aXRoIHRocmVlXG4gICAgICogYXJndW1lbnRzOiAodmFsdWUsIGtleSwgb2JqZWN0KS4gSXRlcmF0ZWUgZnVuY3Rpb25zIG1heSBleGl0IGl0ZXJhdGlvblxuICAgICAqIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIF9cbiAgICAgKiBAc2luY2UgMC4zLjBcbiAgICAgKiBAY2F0ZWdvcnkgT2JqZWN0XG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbaXRlcmF0ZWU9Xy5pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICAgICAqIEBzZWUgXy5mb3JPd25SaWdodFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBGb28oKSB7XG4gICAgICogICB0aGlzLmEgPSAxO1xuICAgICAqICAgdGhpcy5iID0gMjtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICAgICAqXG4gICAgICogXy5mb3JPd24obmV3IEZvbywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAqICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBMb2dzICdhJyB0aGVuICdiJyAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmb3JPd24ob2JqZWN0LCBpdGVyYXRlZSkge1xuICAgICAgcmV0dXJuIG9iamVjdCAmJiBiYXNlRm9yT3duKG9iamVjdCwgYmFzZUl0ZXJhdGVlKGl0ZXJhdGVlLCAzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYE5hTmAgaXMgZm91bmQgaW4gYGFycmF5YC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZnJvbUluZGV4IFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtmcm9tUmlnaHRdIFNwZWNpZnkgaXRlcmF0aW5nIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCBgTmFOYCwgZWxzZSBgLTFgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGluZGV4T2ZOYU4oYXJyYXksIGZyb21JbmRleCwgZnJvbVJpZ2h0KSB7XG4gICAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZnJvbUluZGV4ICsgKGZyb21SaWdodCA/IDEgOiAtMSk7XG5cbiAgICAgIHdoaWxlICgoZnJvbVJpZ2h0ID8gaW5kZXgtLSA6ICsraW5kZXggPCBsZW5ndGgpKSB7XG4gICAgICAgIHZhciBvdGhlciA9IGFycmF5W2luZGV4XTtcbiAgICAgICAgaWYgKG90aGVyICE9PSBvdGhlcikge1xuICAgICAgICAgIHJldHVybiBpbmRleDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmluZGV4T2ZgIHdpdGhvdXQgYGZyb21JbmRleGAgYm91bmRzIGNoZWNrcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNlYXJjaC5cbiAgICAgKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBmcm9tSW5kZXggVGhlIGluZGV4IHRvIHNlYXJjaCBmcm9tLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZUluZGV4T2YoYXJyYXksIHZhbHVlLCBmcm9tSW5kZXgpIHtcbiAgICAgIGlmICh2YWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGluZGV4T2ZOYU4oYXJyYXksIGZyb21JbmRleCk7XG4gICAgICB9XG4gICAgICB2YXIgaW5kZXggPSBmcm9tSW5kZXggLSAxLFxuICAgICAgICAgIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgaWYgKGFycmF5W2luZGV4XSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSBiZXN0IG9yZGVyIGZvciBydW5uaW5nIHRoZSBmdW5jdGlvbnMgaW4gYHRhc2tzYCwgYmFzZWQgb25cbiAgICAgKiB0aGVpciByZXF1aXJlbWVudHMuIEVhY2ggZnVuY3Rpb24gY2FuIG9wdGlvbmFsbHkgZGVwZW5kIG9uIG90aGVyIGZ1bmN0aW9uc1xuICAgICAqIGJlaW5nIGNvbXBsZXRlZCBmaXJzdCwgYW5kIGVhY2ggZnVuY3Rpb24gaXMgcnVuIGFzIHNvb24gYXMgaXRzIHJlcXVpcmVtZW50c1xuICAgICAqIGFyZSBzYXRpc2ZpZWQuXG4gICAgICpcbiAgICAgKiBJZiBhbnkgb2YgdGhlIGZ1bmN0aW9ucyBwYXNzIGFuIGVycm9yIHRvIHRoZWlyIGNhbGxiYWNrLCB0aGUgYGF1dG9gIHNlcXVlbmNlXG4gICAgICogd2lsbCBzdG9wLiBGdXJ0aGVyIHRhc2tzIHdpbGwgbm90IGV4ZWN1dGUgKHNvIGFueSBvdGhlciBmdW5jdGlvbnMgZGVwZW5kaW5nXG4gICAgICogb24gaXQgd2lsbCBub3QgcnVuKSwgYW5kIHRoZSBtYWluIGBjYWxsYmFja2AgaXMgaW1tZWRpYXRlbHkgY2FsbGVkIHdpdGggdGhlXG4gICAgICogZXJyb3IuXG4gICAgICpcbiAgICAgKiBGdW5jdGlvbnMgYWxzbyByZWNlaXZlIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSByZXN1bHRzIG9mIGZ1bmN0aW9ucyB3aGljaFxuICAgICAqIGhhdmUgY29tcGxldGVkIHNvIGZhciBhcyB0aGUgZmlyc3QgYXJndW1lbnQsIGlmIHRoZXkgaGF2ZSBkZXBlbmRlbmNpZXMuIElmIGFcbiAgICAgKiB0YXNrIGZ1bmN0aW9uIGhhcyBubyBkZXBlbmRlbmNpZXMsIGl0IHdpbGwgb25seSBiZSBwYXNzZWQgYSBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIEBuYW1lIGF1dG9cbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0YXNrcyAtIEFuIG9iamVjdC4gRWFjaCBvZiBpdHMgcHJvcGVydGllcyBpcyBlaXRoZXIgYVxuICAgICAqIGZ1bmN0aW9uIG9yIGFuIGFycmF5IG9mIHJlcXVpcmVtZW50cywgd2l0aCB0aGUgZnVuY3Rpb24gaXRzZWxmIHRoZSBsYXN0IGl0ZW1cbiAgICAgKiBpbiB0aGUgYXJyYXkuIFRoZSBvYmplY3QncyBrZXkgb2YgYSBwcm9wZXJ0eSBzZXJ2ZXMgYXMgdGhlIG5hbWUgb2YgdGhlIHRhc2tcbiAgICAgKiBkZWZpbmVkIGJ5IHRoYXQgcHJvcGVydHksIGkuZS4gY2FuIGJlIHVzZWQgd2hlbiBzcGVjaWZ5aW5nIHJlcXVpcmVtZW50cyBmb3JcbiAgICAgKiBvdGhlciB0YXNrcy4gVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIG9uZSBvciB0d28gYXJndW1lbnRzOlxuICAgICAqICogYSBgcmVzdWx0c2Agb2JqZWN0LCBjb250YWluaW5nIHRoZSByZXN1bHRzIG9mIHRoZSBwcmV2aW91c2x5IGV4ZWN1dGVkXG4gICAgICogICBmdW5jdGlvbnMsIG9ubHkgcGFzc2VkIGlmIHRoZSB0YXNrIGhhcyBhbnkgZGVwZW5kZW5jaWVzLFxuICAgICAqICogYSBgY2FsbGJhY2soZXJyLCByZXN1bHQpYCBmdW5jdGlvbiwgd2hpY2ggbXVzdCBiZSBjYWxsZWQgd2hlbiBmaW5pc2hlZCxcbiAgICAgKiAgIHBhc3NpbmcgYW4gYGVycm9yYCAod2hpY2ggY2FuIGJlIGBudWxsYCkgYW5kIHRoZSByZXN1bHQgb2YgdGhlIGZ1bmN0aW9uJ3NcbiAgICAgKiAgIGV4ZWN1dGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW2NvbmN1cnJlbmN5PUluZmluaXR5XSAtIEFuIG9wdGlvbmFsIGBpbnRlZ2VyYCBmb3JcbiAgICAgKiBkZXRlcm1pbmluZyB0aGUgbWF4aW11bSBudW1iZXIgb2YgdGFza3MgdGhhdCBjYW4gYmUgcnVuIGluIHBhcmFsbGVsLiBCeVxuICAgICAqIGRlZmF1bHQsIGFzIG1hbnkgYXMgcG9zc2libGUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEFuIG9wdGlvbmFsIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIGFsbFxuICAgICAqIHRoZSB0YXNrcyBoYXZlIGJlZW4gY29tcGxldGVkLiBJdCByZWNlaXZlcyB0aGUgYGVycmAgYXJndW1lbnQgaWYgYW55IGB0YXNrc2BcbiAgICAgKiBwYXNzIGFuIGVycm9yIHRvIHRoZWlyIGNhbGxiYWNrLiBSZXN1bHRzIGFyZSBhbHdheXMgcmV0dXJuZWQ7IGhvd2V2ZXIsIGlmIGFuXG4gICAgICogZXJyb3Igb2NjdXJzLCBubyBmdXJ0aGVyIGB0YXNrc2Agd2lsbCBiZSBwZXJmb3JtZWQsIGFuZCB0aGUgcmVzdWx0cyBvYmplY3RcbiAgICAgKiB3aWxsIG9ubHkgY29udGFpbiBwYXJ0aWFsIHJlc3VsdHMuIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHRzKS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYXN5bmMuYXV0byh7XG4gICAgICogICAgIC8vIHRoaXMgZnVuY3Rpb24gd2lsbCBqdXN0IGJlIHBhc3NlZCBhIGNhbGxiYWNrXG4gICAgICogICAgIHJlYWREYXRhOiBhc3luYy5hcHBseShmcy5yZWFkRmlsZSwgJ2RhdGEudHh0JywgJ3V0Zi04JyksXG4gICAgICogICAgIHNob3dEYXRhOiBbJ3JlYWREYXRhJywgZnVuY3Rpb24ocmVzdWx0cywgY2IpIHtcbiAgICAgKiAgICAgICAgIC8vIHJlc3VsdHMucmVhZERhdGEgaXMgdGhlIGZpbGUncyBjb250ZW50c1xuICAgICAqICAgICAgICAgLy8gLi4uXG4gICAgICogICAgIH1dXG4gICAgICogfSwgY2FsbGJhY2spO1xuICAgICAqXG4gICAgICogYXN5bmMuYXV0byh7XG4gICAgICogICAgIGdldF9kYXRhOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAqICAgICAgICAgY29uc29sZS5sb2coJ2luIGdldF9kYXRhJyk7XG4gICAgICogICAgICAgICAvLyBhc3luYyBjb2RlIHRvIGdldCBzb21lIGRhdGFcbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICdkYXRhJywgJ2NvbnZlcnRlZCB0byBhcnJheScpO1xuICAgICAqICAgICB9LFxuICAgICAqICAgICBtYWtlX2ZvbGRlcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIGNvbnNvbGUubG9nKCdpbiBtYWtlX2ZvbGRlcicpO1xuICAgICAqICAgICAgICAgLy8gYXN5bmMgY29kZSB0byBjcmVhdGUgYSBkaXJlY3RvcnkgdG8gc3RvcmUgYSBmaWxlIGluXG4gICAgICogICAgICAgICAvLyB0aGlzIGlzIHJ1biBhdCB0aGUgc2FtZSB0aW1lIGFzIGdldHRpbmcgdGhlIGRhdGFcbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICdmb2xkZXInKTtcbiAgICAgKiAgICAgfSxcbiAgICAgKiAgICAgd3JpdGVfZmlsZTogWydnZXRfZGF0YScsICdtYWtlX2ZvbGRlcicsIGZ1bmN0aW9uKHJlc3VsdHMsIGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICBjb25zb2xlLmxvZygnaW4gd3JpdGVfZmlsZScsIEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpKTtcbiAgICAgKiAgICAgICAgIC8vIG9uY2UgdGhlcmUgaXMgc29tZSBkYXRhIGFuZCB0aGUgZGlyZWN0b3J5IGV4aXN0cyxcbiAgICAgKiAgICAgICAgIC8vIHdyaXRlIHRoZSBkYXRhIHRvIGEgZmlsZSBpbiB0aGUgZGlyZWN0b3J5XG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCAnZmlsZW5hbWUnKTtcbiAgICAgKiAgICAgfV0sXG4gICAgICogICAgIGVtYWlsX2xpbms6IFsnd3JpdGVfZmlsZScsIGZ1bmN0aW9uKHJlc3VsdHMsIGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICBjb25zb2xlLmxvZygnaW4gZW1haWxfbGluaycsIEpTT04uc3RyaW5naWZ5KHJlc3VsdHMpKTtcbiAgICAgKiAgICAgICAgIC8vIG9uY2UgdGhlIGZpbGUgaXMgd3JpdHRlbiBsZXQncyBlbWFpbCBhIGxpbmsgdG8gaXQuLi5cbiAgICAgKiAgICAgICAgIC8vIHJlc3VsdHMud3JpdGVfZmlsZSBjb250YWlucyB0aGUgZmlsZW5hbWUgcmV0dXJuZWQgYnkgd3JpdGVfZmlsZS5cbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsIHsnZmlsZSc6cmVzdWx0cy53cml0ZV9maWxlLCAnZW1haWwnOid1c2VyQGV4YW1wbGUuY29tJ30pO1xuICAgICAqICAgICB9XVxuICAgICAqIH0sIGZ1bmN0aW9uKGVyciwgcmVzdWx0cykge1xuICAgICAqICAgICBjb25zb2xlLmxvZygnZXJyID0gJywgZXJyKTtcbiAgICAgKiAgICAgY29uc29sZS5sb2coJ3Jlc3VsdHMgPSAnLCByZXN1bHRzKTtcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhdXRvICh0YXNrcywgY29uY3VycmVuY3ksIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY29uY3VycmVuY3kgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGNvbmN1cnJlbmN5IGlzIG9wdGlvbmFsLCBzaGlmdCB0aGUgYXJncy5cbiAgICAgICAgICAgIGNhbGxiYWNrID0gY29uY3VycmVuY3k7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgPSBvbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIga2V5cyQkID0ga2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciBudW1UYXNrcyA9IGtleXMkJC5sZW5ndGg7XG4gICAgICAgIGlmICghbnVtVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IG51bVRhc2tzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgdmFyIHJ1bm5pbmdUYXNrcyA9IDA7XG4gICAgICAgIHZhciBoYXNFcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSB7fTtcblxuICAgICAgICB2YXIgcmVhZHlUYXNrcyA9IFtdO1xuXG4gICAgICAgIC8vIGZvciBjeWNsZSBkZXRlY3Rpb246XG4gICAgICAgIHZhciByZWFkeVRvQ2hlY2sgPSBbXTsgLy8gdGFza3MgdGhhdCBoYXZlIGJlZW4gaWRlbnRpZmllZCBhcyByZWFjaGFibGVcbiAgICAgICAgLy8gd2l0aG91dCB0aGUgcG9zc2liaWxpdHkgb2YgcmV0dXJuaW5nIHRvIGFuIGFuY2VzdG9yIHRhc2tcbiAgICAgICAgdmFyIHVuY2hlY2tlZERlcGVuZGVuY2llcyA9IHt9O1xuXG4gICAgICAgIGZvck93bih0YXNrcywgZnVuY3Rpb24gKHRhc2ssIGtleSkge1xuICAgICAgICAgICAgaWYgKCFpc0FycmF5KHRhc2spKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gZGVwZW5kZW5jaWVzXG4gICAgICAgICAgICAgICAgZW5xdWV1ZVRhc2soa2V5LCBbdGFza10pO1xuICAgICAgICAgICAgICAgIHJlYWR5VG9DaGVjay5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgZGVwZW5kZW5jaWVzID0gdGFzay5zbGljZSgwLCB0YXNrLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgdmFyIHJlbWFpbmluZ0RlcGVuZGVuY2llcyA9IGRlcGVuZGVuY2llcy5sZW5ndGg7XG4gICAgICAgICAgICBpZiAocmVtYWluaW5nRGVwZW5kZW5jaWVzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZW5xdWV1ZVRhc2soa2V5LCB0YXNrKTtcbiAgICAgICAgICAgICAgICByZWFkeVRvQ2hlY2sucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVuY2hlY2tlZERlcGVuZGVuY2llc1trZXldID0gcmVtYWluaW5nRGVwZW5kZW5jaWVzO1xuXG4gICAgICAgICAgICBhcnJheUVhY2goZGVwZW5kZW5jaWVzLCBmdW5jdGlvbiAoZGVwZW5kZW5jeU5hbWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRhc2tzW2RlcGVuZGVuY3lOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FzeW5jLmF1dG8gdGFzayBgJyArIGtleSArICdgIGhhcyBhIG5vbi1leGlzdGVudCBkZXBlbmRlbmN5IGluICcgKyBkZXBlbmRlbmNpZXMuam9pbignLCAnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFkZExpc3RlbmVyKGRlcGVuZGVuY3lOYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbWFpbmluZ0RlcGVuZGVuY2llcy0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nRGVwZW5kZW5jaWVzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbnF1ZXVlVGFzayhrZXksIHRhc2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY2hlY2tGb3JEZWFkbG9ja3MoKTtcbiAgICAgICAgcHJvY2Vzc1F1ZXVlKCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZW5xdWV1ZVRhc2soa2V5LCB0YXNrKSB7XG4gICAgICAgICAgICByZWFkeVRhc2tzLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJ1blRhc2soa2V5LCB0YXNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc1F1ZXVlKCkge1xuICAgICAgICAgICAgaWYgKHJlYWR5VGFza3MubGVuZ3RoID09PSAwICYmIHJ1bm5pbmdUYXNrcyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChyZWFkeVRhc2tzLmxlbmd0aCAmJiBydW5uaW5nVGFza3MgPCBjb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgIHZhciBydW4gPSByZWFkeVRhc2tzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgcnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0YXNrTmFtZSwgZm4pIHtcbiAgICAgICAgICAgIHZhciB0YXNrTGlzdGVuZXJzID0gbGlzdGVuZXJzW3Rhc2tOYW1lXTtcbiAgICAgICAgICAgIGlmICghdGFza0xpc3RlbmVycykge1xuICAgICAgICAgICAgICAgIHRhc2tMaXN0ZW5lcnMgPSBsaXN0ZW5lcnNbdGFza05hbWVdID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhc2tMaXN0ZW5lcnMucHVzaChmbik7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0YXNrQ29tcGxldGUodGFza05hbWUpIHtcbiAgICAgICAgICAgIHZhciB0YXNrTGlzdGVuZXJzID0gbGlzdGVuZXJzW3Rhc2tOYW1lXSB8fCBbXTtcbiAgICAgICAgICAgIGFycmF5RWFjaCh0YXNrTGlzdGVuZXJzLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwcm9jZXNzUXVldWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJ1blRhc2soa2V5LCB0YXNrKSB7XG4gICAgICAgICAgICBpZiAoaGFzRXJyb3IpIHJldHVybjtcblxuICAgICAgICAgICAgdmFyIHRhc2tDYWxsYmFjayA9IG9ubHlPbmNlKHJlc3QoZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBmb3JPd24ocmVzdWx0cywgZnVuY3Rpb24gKHZhbCwgcmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNbcmtleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnMgPSBbXTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB0YXNrQ29tcGxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIHJ1bm5pbmdUYXNrcysrO1xuICAgICAgICAgICAgdmFyIHRhc2tGbiA9IHRhc2tbdGFzay5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICh0YXNrLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICB0YXNrRm4ocmVzdWx0cywgdGFza0NhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFza0ZuKHRhc2tDYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBjaGVja0ZvckRlYWRsb2NrcygpIHtcbiAgICAgICAgICAgIC8vIEthaG4ncyBhbGdvcml0aG1cbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1RvcG9sb2dpY2FsX3NvcnRpbmcjS2Fobi4yN3NfYWxnb3JpdGhtXG4gICAgICAgICAgICAvLyBodHRwOi8vY29ubmFsbGUuYmxvZ3Nwb3QuY29tLzIwMTMvMTAvdG9wb2xvZ2ljYWwtc29ydGluZ2thaG4tYWxnb3JpdGhtLmh0bWxcbiAgICAgICAgICAgIHZhciBjdXJyZW50VGFzaztcbiAgICAgICAgICAgIHZhciBjb3VudGVyID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChyZWFkeVRvQ2hlY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFRhc2sgPSByZWFkeVRvQ2hlY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgY291bnRlcisrO1xuICAgICAgICAgICAgICAgIGFycmF5RWFjaChnZXREZXBlbmRlbnRzKGN1cnJlbnRUYXNrKSwgZnVuY3Rpb24gKGRlcGVuZGVudCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISAtLXVuY2hlY2tlZERlcGVuZGVuY2llc1tkZXBlbmRlbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWFkeVRvQ2hlY2sucHVzaChkZXBlbmRlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb3VudGVyICE9PSBudW1UYXNrcykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYXN5bmMuYXV0byBjYW5ub3QgZXhlY3V0ZSB0YXNrcyBkdWUgdG8gYSByZWN1cnNpdmUgZGVwZW5kZW5jeScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0RGVwZW5kZW50cyh0YXNrTmFtZSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgZm9yT3duKHRhc2tzLCBmdW5jdGlvbiAodGFzaywga2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkodGFzaykgJiYgYmFzZUluZGV4T2YodGFzaywgdGFza05hbWUsIDApID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWFwYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAgICAgKiBzaG9ydGhhbmRzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYXJyYXlNYXAoYXJyYXksIGl0ZXJhdGVlKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDAsXG4gICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29waWVzIHRoZSB2YWx1ZXMgb2YgYHNvdXJjZWAgdG8gYGFycmF5YC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gc291cmNlIFRoZSBhcnJheSB0byBjb3B5IHZhbHVlcyBmcm9tLlxuICAgICAqIEBwYXJhbSB7QXJyYXl9IFthcnJheT1bXV0gVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIHRvLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvcHlBcnJheShzb3VyY2UsIGFycmF5KSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuXG4gICAgICBhcnJheSB8fCAoYXJyYXkgPSBBcnJheShsZW5ndGgpKTtcbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIGFycmF5W2luZGV4XSA9IHNvdXJjZVtpbmRleF07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uc2xpY2VgIHdpdGhvdXQgYW4gaXRlcmF0ZWUgY2FsbCBndWFyZC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIHNsaWNlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbc3RhcnQ9MF0gVGhlIHN0YXJ0IHBvc2l0aW9uLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbZW5kPWFycmF5Lmxlbmd0aF0gVGhlIGVuZCBwb3NpdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHNsaWNlIG9mIGBhcnJheWAuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYmFzZVNsaWNlKGFycmF5LCBzdGFydCwgZW5kKSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cbiAgICAgIGlmIChzdGFydCA8IDApIHtcbiAgICAgICAgc3RhcnQgPSAtc3RhcnQgPiBsZW5ndGggPyAwIDogKGxlbmd0aCArIHN0YXJ0KTtcbiAgICAgIH1cbiAgICAgIGVuZCA9IGVuZCA+IGxlbmd0aCA/IGxlbmd0aCA6IGVuZDtcbiAgICAgIGlmIChlbmQgPCAwKSB7XG4gICAgICAgIGVuZCArPSBsZW5ndGg7XG4gICAgICB9XG4gICAgICBsZW5ndGggPSBzdGFydCA+IGVuZCA/IDAgOiAoKGVuZCAtIHN0YXJ0KSA+Pj4gMCk7XG4gICAgICBzdGFydCA+Pj49IDA7XG5cbiAgICAgIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuICAgICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgICAgcmVzdWx0W2luZGV4XSA9IGFycmF5W2luZGV4ICsgc3RhcnRdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYXN0cyBgYXJyYXlgIHRvIGEgc2xpY2UgaWYgaXQncyBuZWVkZWQuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydCBUaGUgc3RhcnQgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtlbmQ9YXJyYXkubGVuZ3RoXSBUaGUgZW5kIHBvc2l0aW9uLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY2FzdCBzbGljZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjYXN0U2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpIHtcbiAgICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbmd0aCA6IGVuZDtcbiAgICAgIHJldHVybiAoIXN0YXJ0ICYmIGVuZCA+PSBsZW5ndGgpID8gYXJyYXkgOiBiYXNlU2xpY2UoYXJyYXksIHN0YXJ0LCBlbmQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZWQgYnkgYF8udHJpbWAgYW5kIGBfLnRyaW1FbmRgIHRvIGdldCB0aGUgaW5kZXggb2YgdGhlIGxhc3Qgc3RyaW5nIHN5bWJvbFxuICAgICAqIHRoYXQgaXMgbm90IGZvdW5kIGluIHRoZSBjaGFyYWN0ZXIgc3ltYm9scy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gc3RyU3ltYm9scyBUaGUgc3RyaW5nIHN5bWJvbHMgdG8gaW5zcGVjdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBjaHJTeW1ib2xzIFRoZSBjaGFyYWN0ZXIgc3ltYm9scyB0byBmaW5kLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IHVubWF0Y2hlZCBzdHJpbmcgc3ltYm9sLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNoYXJzRW5kSW5kZXgoc3RyU3ltYm9scywgY2hyU3ltYm9scykge1xuICAgICAgdmFyIGluZGV4ID0gc3RyU3ltYm9scy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlIChpbmRleC0tICYmIGJhc2VJbmRleE9mKGNoclN5bWJvbHMsIHN0clN5bWJvbHNbaW5kZXhdLCAwKSA+IC0xKSB7fVxuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVzZWQgYnkgYF8udHJpbWAgYW5kIGBfLnRyaW1TdGFydGAgdG8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZmlyc3Qgc3RyaW5nIHN5bWJvbFxuICAgICAqIHRoYXQgaXMgbm90IGZvdW5kIGluIHRoZSBjaGFyYWN0ZXIgc3ltYm9scy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheX0gc3RyU3ltYm9scyBUaGUgc3RyaW5nIHN5bWJvbHMgdG8gaW5zcGVjdC5cbiAgICAgKiBAcGFyYW0ge0FycmF5fSBjaHJTeW1ib2xzIFRoZSBjaGFyYWN0ZXIgc3ltYm9scyB0byBmaW5kLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCB1bm1hdGNoZWQgc3RyaW5nIHN5bWJvbC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjaGFyc1N0YXJ0SW5kZXgoc3RyU3ltYm9scywgY2hyU3ltYm9scykge1xuICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgbGVuZ3RoID0gc3RyU3ltYm9scy5sZW5ndGg7XG5cbiAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoICYmIGJhc2VJbmRleE9mKGNoclN5bWJvbHMsIHN0clN5bWJvbHNbaW5kZXhdLCAwKSA+IC0xKSB7fVxuICAgICAgcmV0dXJuIGluZGV4O1xuICAgIH1cblxuICAgIC8qKiBVc2VkIHRvIGNvbXBvc2UgdW5pY29kZSBjaGFyYWN0ZXIgY2xhc3Nlcy4gKi9cbiAgICB2YXIgcnNBc3RyYWxSYW5nZSA9ICdcXFxcdWQ4MDAtXFxcXHVkZmZmJztcbiAgICB2YXIgcnNDb21ib01hcmtzUmFuZ2UgPSAnXFxcXHUwMzAwLVxcXFx1MDM2ZlxcXFx1ZmUyMC1cXFxcdWZlMjMnO1xuICAgIHZhciByc0NvbWJvU3ltYm9sc1JhbmdlID0gJ1xcXFx1MjBkMC1cXFxcdTIwZjAnO1xuICAgIHZhciByc1ZhclJhbmdlID0gJ1xcXFx1ZmUwZVxcXFx1ZmUwZic7XG4gICAgdmFyIHJzQXN0cmFsID0gJ1snICsgcnNBc3RyYWxSYW5nZSArICddJztcbiAgICB2YXIgcnNDb21ibyA9ICdbJyArIHJzQ29tYm9NYXJrc1JhbmdlICsgcnNDb21ib1N5bWJvbHNSYW5nZSArICddJztcbiAgICB2YXIgcnNGaXR6ID0gJ1xcXFx1ZDgzY1tcXFxcdWRmZmItXFxcXHVkZmZmXSc7XG4gICAgdmFyIHJzTW9kaWZpZXIgPSAnKD86JyArIHJzQ29tYm8gKyAnfCcgKyByc0ZpdHogKyAnKSc7XG4gICAgdmFyIHJzTm9uQXN0cmFsID0gJ1teJyArIHJzQXN0cmFsUmFuZ2UgKyAnXSc7XG4gICAgdmFyIHJzUmVnaW9uYWwgPSAnKD86XFxcXHVkODNjW1xcXFx1ZGRlNi1cXFxcdWRkZmZdKXsyfSc7XG4gICAgdmFyIHJzU3VyclBhaXIgPSAnW1xcXFx1ZDgwMC1cXFxcdWRiZmZdW1xcXFx1ZGMwMC1cXFxcdWRmZmZdJztcbiAgICB2YXIgcnNaV0ogPSAnXFxcXHUyMDBkJztcbiAgICB2YXIgcmVPcHRNb2QgPSByc01vZGlmaWVyICsgJz8nO1xuICAgIHZhciByc09wdFZhciA9ICdbJyArIHJzVmFyUmFuZ2UgKyAnXT8nO1xuICAgIHZhciByc09wdEpvaW4gPSAnKD86JyArIHJzWldKICsgJyg/OicgKyBbcnNOb25Bc3RyYWwsIHJzUmVnaW9uYWwsIHJzU3VyclBhaXJdLmpvaW4oJ3wnKSArICcpJyArIHJzT3B0VmFyICsgcmVPcHRNb2QgKyAnKSonO1xuICAgIHZhciByc1NlcSA9IHJzT3B0VmFyICsgcmVPcHRNb2QgKyByc09wdEpvaW47XG4gICAgdmFyIHJzU3ltYm9sID0gJyg/OicgKyBbcnNOb25Bc3RyYWwgKyByc0NvbWJvICsgJz8nLCByc0NvbWJvLCByc1JlZ2lvbmFsLCByc1N1cnJQYWlyLCByc0FzdHJhbF0uam9pbignfCcpICsgJyknO1xuICAgIC8qKiBVc2VkIHRvIG1hdGNoIFtzdHJpbmcgc3ltYm9sc10oaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtdW5pY29kZSkuICovXG4gICAgdmFyIHJlQ29tcGxleFN5bWJvbCA9IFJlZ0V4cChyc0ZpdHogKyAnKD89JyArIHJzRml0eiArICcpfCcgKyByc1N5bWJvbCArIHJzU2VxLCAnZycpO1xuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYHN0cmluZ2AgdG8gYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGhlIHN0cmluZyB0byBjb252ZXJ0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgY29udmVydGVkIGFycmF5LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0cmluZ1RvQXJyYXkoc3RyaW5nKSB7XG4gICAgICByZXR1cm4gc3RyaW5nLm1hdGNoKHJlQ29tcGxleFN5bWJvbCk7XG4gICAgfVxuXG4gICAgLyoqIFVzZWQgdG8gbWF0Y2ggbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZS4gKi9cbiAgICB2YXIgcmVUcmltJDEgPSAvXlxccyt8XFxzKyQvZztcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSBvciBzcGVjaWZpZWQgY2hhcmFjdGVycyBmcm9tIGBzdHJpbmdgLlxuICAgICAqXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBfXG4gICAgICogQHNpbmNlIDMuMC4wXG4gICAgICogQGNhdGVnb3J5IFN0cmluZ1xuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbc3RyaW5nPScnXSBUaGUgc3RyaW5nIHRvIHRyaW0uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtjaGFycz13aGl0ZXNwYWNlXSBUaGUgY2hhcmFjdGVycyB0byB0cmltLlxuICAgICAqIEBwYXJhbS0ge09iamVjdH0gW2d1YXJkXSBFbmFibGVzIHVzZSBhcyBhbiBpdGVyYXRlZSBmb3IgbWV0aG9kcyBsaWtlIGBfLm1hcGAuXG4gICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgdHJpbW1lZCBzdHJpbmcuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIF8udHJpbSgnICBhYmMgICcpO1xuICAgICAqIC8vID0+ICdhYmMnXG4gICAgICpcbiAgICAgKiBfLnRyaW0oJy1fLWFiYy1fLScsICdfLScpO1xuICAgICAqIC8vID0+ICdhYmMnXG4gICAgICpcbiAgICAgKiBfLm1hcChbJyAgZm9vICAnLCAnICBiYXIgICddLCBfLnRyaW0pO1xuICAgICAqIC8vID0+IFsnZm9vJywgJ2JhciddXG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJpbShzdHJpbmcsIGNoYXJzLCBndWFyZCkge1xuICAgICAgc3RyaW5nID0gdG9TdHJpbmcoc3RyaW5nKTtcbiAgICAgIGlmIChzdHJpbmcgJiYgKGd1YXJkIHx8IGNoYXJzID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShyZVRyaW0kMSwgJycpO1xuICAgICAgfVxuICAgICAgaWYgKCFzdHJpbmcgfHwgIShjaGFycyA9IGJhc2VUb1N0cmluZyhjaGFycykpKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICB9XG4gICAgICB2YXIgc3RyU3ltYm9scyA9IHN0cmluZ1RvQXJyYXkoc3RyaW5nKSxcbiAgICAgICAgICBjaHJTeW1ib2xzID0gc3RyaW5nVG9BcnJheShjaGFycyksXG4gICAgICAgICAgc3RhcnQgPSBjaGFyc1N0YXJ0SW5kZXgoc3RyU3ltYm9scywgY2hyU3ltYm9scyksXG4gICAgICAgICAgZW5kID0gY2hhcnNFbmRJbmRleChzdHJTeW1ib2xzLCBjaHJTeW1ib2xzKSArIDE7XG5cbiAgICAgIHJldHVybiBjYXN0U2xpY2Uoc3RyU3ltYm9scywgc3RhcnQsIGVuZCkuam9pbignJyk7XG4gICAgfVxuXG4gICAgdmFyIGFyZ3NSZWdleCA9IC9eKGZ1bmN0aW9uW15cXChdKik/XFwoP1xccyooW15cXCk9XSopL207XG5cbiAgICBmdW5jdGlvbiBwYXJzZVBhcmFtcyhmdW5jKSB7XG4gICAgICAgIHJldHVybiB0cmltKGZ1bmMudG9TdHJpbmcoKS5tYXRjaChhcmdzUmVnZXgpWzJdKS5zcGxpdCgvXFxzKlxcLFxccyovKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIGRlcGVuZGVuY3ktaW5qZWN0ZWQgdmVyc2lvbiBvZiB0aGUge0BsaW5rIGFzeW5jLmF1dG99IGZ1bmN0aW9uLiBEZXBlbmRlbnRcbiAgICAgKiB0YXNrcyBhcmUgc3BlY2lmaWVkIGFzIHBhcmFtZXRlcnMgdG8gdGhlIGZ1bmN0aW9uLCBhZnRlciB0aGUgdXN1YWwgY2FsbGJhY2tcbiAgICAgKiBwYXJhbWV0ZXIsIHdpdGggdGhlIHBhcmFtZXRlciBuYW1lcyBtYXRjaGluZyB0aGUgbmFtZXMgb2YgdGhlIHRhc2tzIGl0XG4gICAgICogZGVwZW5kcyBvbi4gVGhpcyBjYW4gcHJvdmlkZSBldmVuIG1vcmUgcmVhZGFibGUgdGFzayBncmFwaHMgd2hpY2ggY2FuIGJlXG4gICAgICogZWFzaWVyIHRvIG1haW50YWluLlxuICAgICAqXG4gICAgICogSWYgYSBmaW5hbCBjYWxsYmFjayBpcyBzcGVjaWZpZWQsIHRoZSB0YXNrIHJlc3VsdHMgYXJlIHNpbWlsYXJseSBpbmplY3RlZCxcbiAgICAgKiBzcGVjaWZpZWQgYXMgbmFtZWQgcGFyYW1ldGVycyBhZnRlciB0aGUgaW5pdGlhbCBlcnJvciBwYXJhbWV0ZXIuXG4gICAgICpcbiAgICAgKiBUaGUgYXV0b0luamVjdCBmdW5jdGlvbiBpcyBwdXJlbHkgc3ludGFjdGljIHN1Z2FyIGFuZCBpdHMgc2VtYW50aWNzIGFyZVxuICAgICAqIG90aGVyd2lzZSBlcXVpdmFsZW50IHRvIHtAbGluayBhc3luYy5hdXRvfS5cbiAgICAgKlxuICAgICAqIEBuYW1lIGF1dG9JbmplY3RcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5hdXRvXG4gICAgICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0YXNrcyAtIEFuIG9iamVjdCwgZWFjaCBvZiB3aG9zZSBwcm9wZXJ0aWVzIGlzIGEgZnVuY3Rpb24gb2ZcbiAgICAgKiB0aGUgZm9ybSAnZnVuYyhbZGVwZW5kZW5jaWVzLi4uXSwgY2FsbGJhY2spLiBUaGUgb2JqZWN0J3Mga2V5IG9mIGEgcHJvcGVydHlcbiAgICAgKiBzZXJ2ZXMgYXMgdGhlIG5hbWUgb2YgdGhlIHRhc2sgZGVmaW5lZCBieSB0aGF0IHByb3BlcnR5LCBpLmUuIGNhbiBiZSB1c2VkXG4gICAgICogd2hlbiBzcGVjaWZ5aW5nIHJlcXVpcmVtZW50cyBmb3Igb3RoZXIgdGFza3MuXG4gICAgICogKiBUaGUgYGNhbGxiYWNrYCBwYXJhbWV0ZXIgaXMgYSBgY2FsbGJhY2soZXJyLCByZXN1bHQpYCB3aGljaCBtdXN0IGJlIGNhbGxlZFxuICAgICAqICAgd2hlbiBmaW5pc2hlZCwgcGFzc2luZyBhbiBgZXJyb3JgICh3aGljaCBjYW4gYmUgYG51bGxgKSBhbmQgdGhlIHJlc3VsdCBvZlxuICAgICAqICAgdGhlIGZ1bmN0aW9uJ3MgZXhlY3V0aW9uLiBUaGUgcmVtYWluaW5nIHBhcmFtZXRlcnMgbmFtZSBvdGhlciB0YXNrcyBvblxuICAgICAqICAgd2hpY2ggdGhlIHRhc2sgaXMgZGVwZW5kZW50LCBhbmQgdGhlIHJlc3VsdHMgZnJvbSB0aG9zZSB0YXNrcyBhcmUgdGhlXG4gICAgICogICBhcmd1bWVudHMgb2YgdGhvc2UgcGFyYW1ldGVycy5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQW4gb3B0aW9uYWwgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gYWxsXG4gICAgICogdGhlIHRhc2tzIGhhdmUgYmVlbiBjb21wbGV0ZWQuIEl0IHJlY2VpdmVzIHRoZSBgZXJyYCBhcmd1bWVudCBpZiBhbnkgYHRhc2tzYFxuICAgICAqIHBhc3MgYW4gZXJyb3IgdG8gdGhlaXIgY2FsbGJhY2suIFRoZSByZW1haW5pbmcgcGFyYW1ldGVycyBhcmUgdGFzayBuYW1lc1xuICAgICAqIHdob3NlIHJlc3VsdHMgeW91IGFyZSBpbnRlcmVzdGVkIGluLiBUaGlzIGNhbGxiYWNrIHdpbGwgb25seSBiZSBjYWxsZWQgd2hlblxuICAgICAqIGFsbCB0YXNrcyBoYXZlIGZpbmlzaGVkIG9yIGFuIGVycm9yIGhhcyBvY2N1cnJlZCwgYW5kIHNvIGRvIG5vdCBzcGVjaWZ5XG4gICAgICogZGVwZW5kZW5jaWVzIGluIHRoZSBzYW1lIHdheSBhcyBgdGFza3NgIGRvLiBJZiBhbiBlcnJvciBvY2N1cnMsIG5vIGZ1cnRoZXJcbiAgICAgKiBgdGFza3NgIHdpbGwgYmUgcGVyZm9ybWVkLCBhbmQgYHJlc3VsdHNgIHdpbGwgb25seSBiZSB2YWxpZCBmb3IgdGhvc2UgdGFza3NcbiAgICAgKiB3aGljaCBtYW5hZ2VkIHRvIGNvbXBsZXRlLiBJbnZva2VkIHdpdGggKGVyciwgW3Jlc3VsdHMuLi5dKS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gIFRoZSBleGFtcGxlIGZyb20gYGF1dG9gIGNhbiBiZSByZXdyaXR0ZW4gYXMgZm9sbG93czpcbiAgICAgKiBhc3luYy5hdXRvSW5qZWN0KHtcbiAgICAgKiAgICAgZ2V0X2RhdGE6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICAvLyBhc3luYyBjb2RlIHRvIGdldCBzb21lIGRhdGFcbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICdkYXRhJywgJ2NvbnZlcnRlZCB0byBhcnJheScpO1xuICAgICAqICAgICB9LFxuICAgICAqICAgICBtYWtlX2ZvbGRlcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIC8vIGFzeW5jIGNvZGUgdG8gY3JlYXRlIGEgZGlyZWN0b3J5IHRvIHN0b3JlIGEgZmlsZSBpblxuICAgICAqICAgICAgICAgLy8gdGhpcyBpcyBydW4gYXQgdGhlIHNhbWUgdGltZSBhcyBnZXR0aW5nIHRoZSBkYXRhXG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCAnZm9sZGVyJyk7XG4gICAgICogICAgIH0sXG4gICAgICogICAgIHdyaXRlX2ZpbGU6IGZ1bmN0aW9uKGdldF9kYXRhLCBtYWtlX2ZvbGRlciwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIC8vIG9uY2UgdGhlcmUgaXMgc29tZSBkYXRhIGFuZCB0aGUgZGlyZWN0b3J5IGV4aXN0cyxcbiAgICAgKiAgICAgICAgIC8vIHdyaXRlIHRoZSBkYXRhIHRvIGEgZmlsZSBpbiB0aGUgZGlyZWN0b3J5XG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCAnZmlsZW5hbWUnKTtcbiAgICAgKiAgICAgfSxcbiAgICAgKiAgICAgZW1haWxfbGluazogZnVuY3Rpb24od3JpdGVfZmlsZSwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIC8vIG9uY2UgdGhlIGZpbGUgaXMgd3JpdHRlbiBsZXQncyBlbWFpbCBhIGxpbmsgdG8gaXQuLi5cbiAgICAgKiAgICAgICAgIC8vIHdyaXRlX2ZpbGUgY29udGFpbnMgdGhlIGZpbGVuYW1lIHJldHVybmVkIGJ5IHdyaXRlX2ZpbGUuXG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCB7J2ZpbGUnOndyaXRlX2ZpbGUsICdlbWFpbCc6J3VzZXJAZXhhbXBsZS5jb20nfSk7XG4gICAgICogICAgIH1cbiAgICAgKiB9LCBmdW5jdGlvbihlcnIsIGVtYWlsX2xpbmspIHtcbiAgICAgKiAgICAgY29uc29sZS5sb2coJ2VyciA9ICcsIGVycik7XG4gICAgICogICAgIGNvbnNvbGUubG9nKCdlbWFpbF9saW5rID0gJywgZW1haWxfbGluayk7XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiAvLyBJZiB5b3UgYXJlIHVzaW5nIGEgSlMgbWluaWZpZXIgdGhhdCBtYW5nbGVzIHBhcmFtZXRlciBuYW1lcywgYGF1dG9JbmplY3RgXG4gICAgICogLy8gd2lsbCBub3Qgd29yayB3aXRoIHBsYWluIGZ1bmN0aW9ucywgc2luY2UgdGhlIHBhcmFtZXRlciBuYW1lcyB3aWxsIGJlXG4gICAgICogLy8gY29sbGFwc2VkIHRvIGEgc2luZ2xlIGxldHRlciBpZGVudGlmaWVyLiAgVG8gd29yayBhcm91bmQgdGhpcywgeW91IGNhblxuICAgICAqIC8vIGV4cGxpY2l0bHkgc3BlY2lmeSB0aGUgbmFtZXMgb2YgdGhlIHBhcmFtZXRlcnMgeW91ciB0YXNrIGZ1bmN0aW9uIG5lZWRzXG4gICAgICogLy8gaW4gYW4gYXJyYXksIHNpbWlsYXIgdG8gQW5ndWxhci5qcyBkZXBlbmRlbmN5IGluamVjdGlvbi4gIFRoZSBmaW5hbFxuICAgICAqIC8vIHJlc3VsdHMgY2FsbGJhY2sgY2FuIGJlIHByb3ZpZGVkIGFzIGFuIGFycmF5IGluIHRoZSBzYW1lIHdheS5cbiAgICAgKlxuICAgICAqIC8vIFRoaXMgc3RpbGwgaGFzIGFuIGFkdmFudGFnZSBvdmVyIHBsYWluIGBhdXRvYCwgc2luY2UgdGhlIHJlc3VsdHMgYSB0YXNrXG4gICAgICogLy8gZGVwZW5kcyBvbiBhcmUgc3RpbGwgc3ByZWFkIGludG8gYXJndW1lbnRzLlxuICAgICAqIGFzeW5jLmF1dG9JbmplY3Qoe1xuICAgICAqICAgICAvLy4uLlxuICAgICAqICAgICB3cml0ZV9maWxlOiBbJ2dldF9kYXRhJywgJ21ha2VfZm9sZGVyJywgZnVuY3Rpb24oZ2V0X2RhdGEsIG1ha2VfZm9sZGVyLCBjYWxsYmFjaykge1xuICAgICAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ2ZpbGVuYW1lJyk7XG4gICAgICogICAgIH1dLFxuICAgICAqICAgICBlbWFpbF9saW5rOiBbJ3dyaXRlX2ZpbGUnLCBmdW5jdGlvbih3cml0ZV9maWxlLCBjYWxsYmFjaykge1xuICAgICAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgeydmaWxlJzp3cml0ZV9maWxlLCAnZW1haWwnOid1c2VyQGV4YW1wbGUuY29tJ30pO1xuICAgICAqICAgICB9XVxuICAgICAqICAgICAvLy4uLlxuICAgICAqIH0sIFsnZW1haWxfbGluaycsIGZ1bmN0aW9uKGVyciwgZW1haWxfbGluaykge1xuICAgICAqICAgICBjb25zb2xlLmxvZygnZXJyID0gJywgZXJyKTtcbiAgICAgKiAgICAgY29uc29sZS5sb2coJ2VtYWlsX2xpbmsgPSAnLCBlbWFpbF9saW5rKTtcbiAgICAgKiB9XSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gYXV0b0luamVjdCh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5ld1Rhc2tzID0ge307XG5cbiAgICAgICAgZm9yT3duKHRhc2tzLCBmdW5jdGlvbiAodGFza0ZuLCBrZXkpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXM7XG5cbiAgICAgICAgICAgIGlmIChpc0FycmF5KHRhc2tGbikpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSBjb3B5QXJyYXkodGFza0ZuKTtcbiAgICAgICAgICAgICAgICB0YXNrRm4gPSBwYXJhbXMucG9wKCk7XG5cbiAgICAgICAgICAgICAgICBuZXdUYXNrc1trZXldID0gcGFyYW1zLmNvbmNhdChwYXJhbXMubGVuZ3RoID4gMCA/IG5ld1Rhc2sgOiB0YXNrRm4pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0YXNrRm4ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXV0b0luamVjdCB0YXNrIGZ1bmN0aW9ucyByZXF1aXJlIGV4cGxpY2l0IHBhcmFtZXRlcnMuXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0YXNrRm4ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gZGVwZW5kZW5jaWVzLCB1c2UgdGhlIGZ1bmN0aW9uIGFzLWlzXG4gICAgICAgICAgICAgICAgbmV3VGFza3Nba2V5XSA9IHRhc2tGbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zID0gcGFyc2VQYXJhbXModGFza0ZuKTtcbiAgICAgICAgICAgICAgICBwYXJhbXMucG9wKCk7XG5cbiAgICAgICAgICAgICAgICBuZXdUYXNrc1trZXldID0gcGFyYW1zLmNvbmNhdChuZXdUYXNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gbmV3VGFzayhyZXN1bHRzLCB0YXNrQ2IpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3QXJncyA9IGFycmF5TWFwKHBhcmFtcywgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHNbbmFtZV07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgbmV3QXJncy5wdXNoKHRhc2tDYik7XG4gICAgICAgICAgICAgICAgdGFza0ZuLmFwcGx5KG51bGwsIG5ld0FyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBhdXRvKG5ld1Rhc2tzLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgdmFyIGhhc1NldEltbWVkaWF0ZSA9IHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiYgc2V0SW1tZWRpYXRlO1xuICAgIHZhciBoYXNOZXh0VGljayA9IHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJztcblxuICAgIGZ1bmN0aW9uIGZhbGxiYWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdyYXAoZGVmZXIpIHtcbiAgICAgICAgcmV0dXJuIHJlc3QoZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgICAgICBkZWZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIF9kZWZlcjtcblxuICAgIGlmIChoYXNTZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgX2RlZmVyID0gc2V0SW1tZWRpYXRlO1xuICAgIH0gZWxzZSBpZiAoaGFzTmV4dFRpY2spIHtcbiAgICAgICAgX2RlZmVyID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICB9IGVsc2Uge1xuICAgICAgICBfZGVmZXIgPSBmYWxsYmFjaztcbiAgICB9XG5cbiAgICB2YXIgc2V0SW1tZWRpYXRlJDEgPSB3cmFwKF9kZWZlcik7XG5cbiAgICBmdW5jdGlvbiBxdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH0gZWxzZSBpZiAoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uY3VycmVuY3kgbXVzdCBub3QgYmUgemVybycpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcG9zLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXRJbW1lZGlhdGUkMShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFycmF5RWFjaChkYXRhLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2sgfHwgbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUkMShxLnByb2Nlc3MpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9uZXh0KHEsIHRhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcblxuICAgICAgICAgICAgICAgIHZhciByZW1vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgYXJyYXlFYWNoKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBhcnJheUVhY2god29ya2Vyc0xpc3QsIGZ1bmN0aW9uICh3b3JrZXIsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAod29ya2VyID09PSB0YXNrICYmICFyZW1vdmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd29ya2Vyc0xpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseSh0YXNrLCBhcmdzKTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJnc1swXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxLmVycm9yKGFyZ3NbMF0sIHRhc2suZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGlmICh3b3JrZXJzIDw9IHEuY29uY3VycmVuY3kgLSBxLmJ1ZmZlcikge1xuICAgICAgICAgICAgICAgICAgICBxLnVuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHdvcmtlcnNMaXN0ID0gW107XG4gICAgICAgIHZhciBxID0ge1xuICAgICAgICAgICAgdGFza3M6IFtdLFxuICAgICAgICAgICAgY29uY3VycmVuY3k6IGNvbmN1cnJlbmN5LFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogbm9vcCxcbiAgICAgICAgICAgIHVuc2F0dXJhdGVkOiBub29wLFxuICAgICAgICAgICAgYnVmZmVyOiBjb25jdXJyZW5jeSAvIDQsXG4gICAgICAgICAgICBlbXB0eTogbm9vcCxcbiAgICAgICAgICAgIGRyYWluOiBub29wLFxuICAgICAgICAgICAgZXJyb3I6IG5vb3AsXG4gICAgICAgICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBhdXNlZDogZmFsc2UsXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2lsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEuZHJhaW4gPSBub29wO1xuICAgICAgICAgICAgICAgIHEudGFza3MgPSBbXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bnNoaWZ0OiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKCFxLnBhdXNlZCAmJiB3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLnRhc2tzLmxlbmd0aCkge1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciB0YXNrcyA9IHEucGF5bG9hZCA/IHEudGFza3Muc3BsaWNlKDAsIHEucGF5bG9hZCkgOiBxLnRhc2tzLnNwbGljZSgwLCBxLnRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBhcnJheU1hcCh0YXNrcywgYmFzZVByb3BlcnR5KCdkYXRhJykpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Vyc0xpc3QucHVzaCh0YXNrc1swXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtlcnMgPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB2YXIgY2IgPSBvbmx5T25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXIoZGF0YSwgY2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdvcmtlcnNMaXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnNMaXN0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGggKyB3b3JrZXJzID09PSAwO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhdXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcS5wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlc3VtZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChxLnBhdXNlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bWVDb3VudCA9IE1hdGgubWluKHEuY29uY3VycmVuY3ksIHEudGFza3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIHcgPSAxOyB3IDw9IHJlc3VtZUNvdW50OyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0SW1tZWRpYXRlJDEocS5wcm9jZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBxO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgY2FyZ28gb2YgdGFza3MgZm9yIHRoZSB3b3JrZXIgZnVuY3Rpb24gdG8gY29tcGxldGUuIENhcmdvIGluaGVyaXRzIGFsbCBvZlxuICAgICAqIHRoZSBzYW1lIG1ldGhvZHMgYW5kIGV2ZW50IGNhbGxiYWNrcyBhcyB7QGxpbmsgYXN5bmMucXVldWV9LlxuICAgICAqIEB0eXBlZGVmIHtPYmplY3R9IGNhcmdvXG4gICAgICogQHByb3BlcnR5IHtGdW5jdGlvbn0gbGVuZ3RoIC0gQSBmdW5jdGlvbiByZXR1cm5pbmcgdGhlIG51bWJlciBvZiBpdGVtc1xuICAgICAqIHdhaXRpbmcgdG8gYmUgcHJvY2Vzc2VkLiBJbnZva2Ugd2l0aCAoKS5cbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gcGF5bG9hZCAtIEFuIGBpbnRlZ2VyYCBmb3IgZGV0ZXJtaW5pbmcgaG93IG1hbnkgdGFza3NcbiAgICAgKiBzaG91bGQgYmUgcHJvY2VzcyBwZXIgcm91bmQuIFRoaXMgcHJvcGVydHkgY2FuIGJlIGNoYW5nZWQgYWZ0ZXIgYSBgY2FyZ29gIGlzXG4gICAgICogY3JlYXRlZCB0byBhbHRlciB0aGUgcGF5bG9hZCBvbi10aGUtZmx5LlxuICAgICAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHB1c2ggLSBBZGRzIGB0YXNrYCB0byB0aGUgYHF1ZXVlYC4gVGhlIGNhbGxiYWNrIGlzXG4gICAgICogY2FsbGVkIG9uY2UgdGhlIGB3b3JrZXJgIGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nIHRoZSB0YXNrLiBJbnN0ZWFkIG9mIGFcbiAgICAgKiBzaW5nbGUgdGFzaywgYW4gYXJyYXkgb2YgYHRhc2tzYCBjYW4gYmUgc3VibWl0dGVkLiBUaGUgcmVzcGVjdGl2ZSBjYWxsYmFjayBpc1xuICAgICAqIHVzZWQgZm9yIGV2ZXJ5IHRhc2sgaW4gdGhlIGxpc3QuIEludm9rZSB3aXRoICh0YXNrLCBbY2FsbGJhY2tdKS5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBzYXR1cmF0ZWQgLSBBIGNhbGxiYWNrIHRoYXQgaXMgY2FsbGVkIHdoZW4gdGhlXG4gICAgICogYHF1ZXVlLmxlbmd0aCgpYCBoaXRzIHRoZSBjb25jdXJyZW5jeSBhbmQgZnVydGhlciB0YXNrcyB3aWxsIGJlIHF1ZXVlZC5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBlbXB0eSAtIEEgY2FsbGJhY2sgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgbGFzdCBpdGVtXG4gICAgICogZnJvbSB0aGUgYHF1ZXVlYCBpcyBnaXZlbiB0byBhIGB3b3JrZXJgLlxuICAgICAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGRyYWluIC0gQSBjYWxsYmFjayB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBsYXN0IGl0ZW1cbiAgICAgKiBmcm9tIHRoZSBgcXVldWVgIGhhcyByZXR1cm5lZCBmcm9tIHRoZSBgd29ya2VyYC5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBpZGxlIC0gYSBmdW5jdGlvbiByZXR1cm5pbmcgZmFsc2UgaWYgdGhlcmUgYXJlIGl0ZW1zXG4gICAgICogd2FpdGluZyBvciBiZWluZyBwcm9jZXNzZWQsIG9yIHRydWUgaWYgbm90LiBJbnZva2Ugd2l0aCAoKS5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBwYXVzZSAtIGEgZnVuY3Rpb24gdGhhdCBwYXVzZXMgdGhlIHByb2Nlc3Npbmcgb2YgdGFza3NcbiAgICAgKiB1bnRpbCBgcmVzdW1lKClgIGlzIGNhbGxlZC4gSW52b2tlIHdpdGggKCkuXG4gICAgICogQHByb3BlcnR5IHtGdW5jdGlvbn0gcmVzdW1lIC0gYSBmdW5jdGlvbiB0aGF0IHJlc3VtZXMgdGhlIHByb2Nlc3Npbmcgb2ZcbiAgICAgKiBxdWV1ZWQgdGFza3Mgd2hlbiB0aGUgcXVldWUgaXMgcGF1c2VkLiBJbnZva2Ugd2l0aCAoKS5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBraWxsIC0gYSBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgdGhlIGBkcmFpbmAgY2FsbGJhY2sgYW5kXG4gICAgICogZW1wdGllcyByZW1haW5pbmcgdGFza3MgZnJvbSB0aGUgcXVldWUgZm9yY2luZyBpdCB0byBnbyBpZGxlLiBJbnZva2Ugd2l0aCAoKS5cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBgY2FyZ29gIG9iamVjdCB3aXRoIHRoZSBzcGVjaWZpZWQgcGF5bG9hZC4gVGFza3MgYWRkZWQgdG8gdGhlXG4gICAgICogY2FyZ28gd2lsbCBiZSBwcm9jZXNzZWQgYWx0b2dldGhlciAodXAgdG8gdGhlIGBwYXlsb2FkYCBsaW1pdCkuIElmIHRoZVxuICAgICAqIGB3b3JrZXJgIGlzIGluIHByb2dyZXNzLCB0aGUgdGFzayBpcyBxdWV1ZWQgdW50aWwgaXQgYmVjb21lcyBhdmFpbGFibGUuIE9uY2VcbiAgICAgKiB0aGUgYHdvcmtlcmAgaGFzIGNvbXBsZXRlZCBzb21lIHRhc2tzLCBlYWNoIGNhbGxiYWNrIG9mIHRob3NlIHRhc2tzIGlzXG4gICAgICogY2FsbGVkLiBDaGVjayBvdXQgW3RoZXNlXShodHRwczovL2NhbW8uZ2l0aHVidXNlcmNvbnRlbnQuY29tLzZiYmQzNmY0Y2Y1YjM1YTBmMTFhOTZkY2QyZTk3NzExZmZjMmZiMzcvNjg3NDc0NzA3MzNhMmYyZjY2MmU2MzZjNmY3NTY0MmU2NzY5NzQ2ODc1NjIyZTYzNmY2ZDJmNjE3MzczNjU3NDczMmYzMTM2MzczNjM4MzczMTJmMzYzODMxMzAzODJmNjI2MjYzMzA2MzY2NjIzMDJkMzU2NjMyMzkyZDMxMzE2NTMyMmQzOTM3MzQ2NjJkMzMzMzM5Mzc2MzM2MzQ2NDYzMzgzNTM4MmU2NzY5NjYpIFthbmltYXRpb25zXShodHRwczovL2NhbW8uZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Y0ODEwZTAwZTFjNWY1ZjhhZGRiZTNlOWY0OTA2NGZkNWQxMDI2OTkvNjg3NDc0NzA3MzNhMmYyZjY2MmU2MzZjNmY3NTY0MmU2NzY5NzQ2ODc1NjIyZTYzNmY2ZDJmNjE3MzczNjU3NDczMmYzMTM2MzczNjM4MzczMTJmMzYzODMxMzAzMTJmMzgzNDYzMzkzMjMwMzYzNjJkMzU2NjMyMzkyZDMxMzE2NTMyMmQzODMxMzQ2NjJkMzk2NDMzNjQzMDMyMzQzMTMzNjI2NjY0MmU2NzY5NjYpXG4gICAgICogZm9yIGhvdyBgY2FyZ29gIGFuZCBgcXVldWVgIHdvcmsuXG4gICAgICpcbiAgICAgKiBXaGlsZSBbcXVldWVdKCNxdWV1ZSkgcGFzc2VzIG9ubHkgb25lIHRhc2sgdG8gb25lIG9mIGEgZ3JvdXAgb2Ygd29ya2Vyc1xuICAgICAqIGF0IGEgdGltZSwgY2FyZ28gcGFzc2VzIGFuIGFycmF5IG9mIHRhc2tzIHRvIGEgc2luZ2xlIHdvcmtlciwgcmVwZWF0aW5nXG4gICAgICogd2hlbiB0aGUgd29ya2VyIGlzIGZpbmlzaGVkLlxuICAgICAqXG4gICAgICogQG5hbWUgY2FyZ29cbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5xdWV1ZVxuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB3b3JrZXIgLSBBbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gZm9yIHByb2Nlc3NpbmcgYW4gYXJyYXlcbiAgICAgKiBvZiBxdWV1ZWQgdGFza3MsIHdoaWNoIG11c3QgY2FsbCBpdHMgYGNhbGxiYWNrKGVycilgIGFyZ3VtZW50IHdoZW4gZmluaXNoZWQsXG4gICAgICogd2l0aCBhbiBvcHRpb25hbCBgZXJyYCBhcmd1bWVudC4gSW52b2tlZCB3aXRoICh0YXNrcywgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbcGF5bG9hZD1JbmZpbml0eV0gLSBBbiBvcHRpb25hbCBgaW50ZWdlcmAgZm9yIGRldGVybWluaW5nXG4gICAgICogaG93IG1hbnkgdGFza3Mgc2hvdWxkIGJlIHByb2Nlc3NlZCBwZXIgcm91bmQ7IGlmIG9taXR0ZWQsIHRoZSBkZWZhdWx0IGlzXG4gICAgICogdW5saW1pdGVkLlxuICAgICAqIEByZXR1cm5zIHtjYXJnb30gQSBjYXJnbyBvYmplY3QgdG8gbWFuYWdlIHRoZSB0YXNrcy4gQ2FsbGJhY2tzIGNhblxuICAgICAqIGF0dGFjaGVkIGFzIGNlcnRhaW4gcHJvcGVydGllcyB0byBsaXN0ZW4gZm9yIHNwZWNpZmljIGV2ZW50cyBkdXJpbmcgdGhlXG4gICAgICogbGlmZWN5Y2xlIG9mIHRoZSBjYXJnbyBhbmQgaW5uZXIgcXVldWUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGNyZWF0ZSBhIGNhcmdvIG9iamVjdCB3aXRoIHBheWxvYWQgMlxuICAgICAqIHZhciBjYXJnbyA9IGFzeW5jLmNhcmdvKGZ1bmN0aW9uKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAqICAgICBmb3IgKHZhciBpPTA7IGk8dGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgKiAgICAgICAgIGNvbnNvbGUubG9nKCdoZWxsbyAnICsgdGFza3NbaV0ubmFtZSk7XG4gICAgICogICAgIH1cbiAgICAgKiAgICAgY2FsbGJhY2soKTtcbiAgICAgKiB9LCAyKTtcbiAgICAgKlxuICAgICAqIC8vIGFkZCBzb21lIGl0ZW1zXG4gICAgICogY2FyZ28ucHVzaCh7bmFtZTogJ2Zvbyd9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgKiAgICAgY29uc29sZS5sb2coJ2ZpbmlzaGVkIHByb2Nlc3NpbmcgZm9vJyk7XG4gICAgICogfSk7XG4gICAgICogY2FyZ28ucHVzaCh7bmFtZTogJ2Jhcid9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgKiAgICAgY29uc29sZS5sb2coJ2ZpbmlzaGVkIHByb2Nlc3NpbmcgYmFyJyk7XG4gICAgICogfSk7XG4gICAgICogY2FyZ28ucHVzaCh7bmFtZTogJ2Jheid9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgKiAgICAgY29uc29sZS5sb2coJ2ZpbmlzaGVkIHByb2Nlc3NpbmcgYmF6Jyk7XG4gICAgICogfSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gY2FyZ28od29ya2VyLCBwYXlsb2FkKSB7XG4gICAgICByZXR1cm4gcXVldWUod29ya2VyLCAxLCBwYXlsb2FkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2FtZSBhcyBgZWFjaE9mYCBidXQgcnVucyBhIG1heGltdW0gb2YgYGxpbWl0YCBhc3luYyBvcGVyYXRpb25zIGF0IGFcbiAgICAgKiB0aW1lLlxuICAgICAqXG4gICAgICogQG5hbWUgZWFjaE9mTGltaXRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5lYWNoT2ZcbiAgICAgKiBAYWxpYXMgZm9yRWFjaE9mTGltaXRcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXQgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBBIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIGVhY2hcbiAgICAgKiBpdGVtIGluIGBjb2xsYC4gVGhlIGBrZXlgIGlzIHRoZSBpdGVtJ3Mga2V5LCBvciBpbmRleCBpbiB0aGUgY2FzZSBvZiBhblxuICAgICAqIGFycmF5LiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVycilgIHdoaWNoIG11c3QgYmUgY2FsbGVkIG9uY2UgaXRcbiAgICAgKiBoYXMgY29tcGxldGVkLiBJZiBubyBlcnJvciBoYXMgb2NjdXJyZWQsIHRoZSBjYWxsYmFjayBzaG91bGQgYmUgcnVuIHdpdGhvdXRcbiAgICAgKiBhcmd1bWVudHMgb3Igd2l0aCBhbiBleHBsaWNpdCBgbnVsbGAgYXJndW1lbnQuIEludm9rZWQgd2l0aFxuICAgICAqIChpdGVtLCBrZXksIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiBhbGxcbiAgICAgKiBgaXRlcmF0ZWVgIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLCBvciBhbiBlcnJvciBvY2N1cnMuIEludm9rZWQgd2l0aCAoZXJyKS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlYWNoT2ZMaW1pdChvYmosIGxpbWl0LCBpdGVyYXRlZSwgY2IpIHtcbiAgICAgIF9lYWNoT2ZMaW1pdChsaW1pdCkob2JqLCBpdGVyYXRlZSwgY2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBzYW1lIGFzIGBlYWNoT2ZgIGJ1dCBydW5zIG9ubHkgYSBzaW5nbGUgYXN5bmMgb3BlcmF0aW9uIGF0IGEgdGltZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIGVhY2hPZlNlcmllc1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLmVhY2hPZlxuICAgICAqIEBhbGlhcyBmb3JFYWNoT2ZTZXJpZXNcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCBpdGVtIGluIGBjb2xsYC4gVGhlXG4gICAgICogYGtleWAgaXMgdGhlIGl0ZW0ncyBrZXksIG9yIGluZGV4IGluIHRoZSBjYXNlIG9mIGFuIGFycmF5LiBUaGUgaXRlcmF0ZWUgaXNcbiAgICAgKiBwYXNzZWQgYSBgY2FsbGJhY2soZXJyKWAgd2hpY2ggbXVzdCBiZSBjYWxsZWQgb25jZSBpdCBoYXMgY29tcGxldGVkLiBJZiBub1xuICAgICAqIGVycm9yIGhhcyBvY2N1cnJlZCwgdGhlIGNhbGxiYWNrIHNob3VsZCBiZSBydW4gd2l0aG91dCBhcmd1bWVudHMgb3Igd2l0aCBhblxuICAgICAqIGV4cGxpY2l0IGBudWxsYCBhcmd1bWVudC4gSW52b2tlZCB3aXRoIChpdGVtLCBrZXksIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiBhbGwgYGl0ZXJhdGVlYFxuICAgICAqIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLCBvciBhbiBlcnJvciBvY2N1cnMuIEludm9rZWQgd2l0aCAoZXJyKS5cbiAgICAgKi9cbiAgICB2YXIgZWFjaE9mU2VyaWVzID0gZG9MaW1pdChlYWNoT2ZMaW1pdCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBSZWR1Y2VzIGBjb2xsYCBpbnRvIGEgc2luZ2xlIHZhbHVlIHVzaW5nIGFuIGFzeW5jIGBpdGVyYXRlZWAgdG8gcmV0dXJuIGVhY2hcbiAgICAgKiBzdWNjZXNzaXZlIHN0ZXAuIGBtZW1vYCBpcyB0aGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgcmVkdWN0aW9uLiBUaGlzIGZ1bmN0aW9uXG4gICAgICogb25seSBvcGVyYXRlcyBpbiBzZXJpZXMuXG4gICAgICpcbiAgICAgKiBGb3IgcGVyZm9ybWFuY2UgcmVhc29ucywgaXQgbWF5IG1ha2Ugc2Vuc2UgdG8gc3BsaXQgYSBjYWxsIHRvIHRoaXMgZnVuY3Rpb25cbiAgICAgKiBpbnRvIGEgcGFyYWxsZWwgbWFwLCBhbmQgdGhlbiB1c2UgdGhlIG5vcm1hbCBgQXJyYXkucHJvdG90eXBlLnJlZHVjZWAgb24gdGhlXG4gICAgICogcmVzdWx0cy4gVGhpcyBmdW5jdGlvbiBpcyBmb3Igc2l0dWF0aW9ucyB3aGVyZSBlYWNoIHN0ZXAgaW4gdGhlIHJlZHVjdGlvblxuICAgICAqIG5lZWRzIHRvIGJlIGFzeW5jOyBpZiB5b3UgY2FuIGdldCB0aGUgZGF0YSBiZWZvcmUgcmVkdWNpbmcgaXQsIHRoZW4gaXQnc1xuICAgICAqIHByb2JhYmx5IGEgZ29vZCBpZGVhIHRvIGRvIHNvLlxuICAgICAqXG4gICAgICogQG5hbWUgcmVkdWNlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBhbGlhcyBpbmplY3QsIGZvbGRsXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbCAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHsqfSBtZW1vIC0gVGhlIGluaXRpYWwgc3RhdGUgb2YgdGhlIHJlZHVjdGlvbi5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gYXBwbGllZCB0byBlYWNoIGl0ZW0gaW4gdGhlXG4gICAgICogYXJyYXkgdG8gcHJvZHVjZSB0aGUgbmV4dCBzdGVwIGluIHRoZSByZWR1Y3Rpb24uIFRoZSBgaXRlcmF0ZWVgIGlzIHBhc3NlZCBhXG4gICAgICogYGNhbGxiYWNrKGVyciwgcmVkdWN0aW9uKWAgd2hpY2ggYWNjZXB0cyBhbiBvcHRpb25hbCBlcnJvciBhcyBpdHMgZmlyc3RcbiAgICAgKiBhcmd1bWVudCwgYW5kIHRoZSBzdGF0ZSBvZiB0aGUgcmVkdWN0aW9uIGFzIHRoZSBzZWNvbmQuIElmIGFuIGVycm9yIGlzXG4gICAgICogcGFzc2VkIHRvIHRoZSBjYWxsYmFjaywgdGhlIHJlZHVjdGlvbiBpcyBzdG9wcGVkIGFuZCB0aGUgbWFpbiBgY2FsbGJhY2tgIGlzXG4gICAgICogaW1tZWRpYXRlbHkgY2FsbGVkIHdpdGggdGhlIGVycm9yLiBJbnZva2VkIHdpdGggKG1lbW8sIGl0ZW0sIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgYWZ0ZXIgYWxsIHRoZVxuICAgICAqIGBpdGVyYXRlZWAgZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQuIFJlc3VsdCBpcyB0aGUgcmVkdWNlZCB2YWx1ZS4gSW52b2tlZCB3aXRoXG4gICAgICogKGVyciwgcmVzdWx0KS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYXN5bmMucmVkdWNlKFsxLDIsM10sIDAsIGZ1bmN0aW9uKG1lbW8sIGl0ZW0sIGNhbGxiYWNrKSB7XG4gICAgICogICAgIC8vIHBvaW50bGVzcyBhc3luYzpcbiAgICAgKiAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsIG1lbW8gKyBpdGVtKVxuICAgICAqICAgICB9KTtcbiAgICAgKiB9LCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAqICAgICAvLyByZXN1bHQgaXMgbm93IGVxdWFsIHRvIHRoZSBsYXN0IHZhbHVlIG9mIG1lbW8sIHdoaWNoIGlzIDZcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWR1Y2UoYXJyLCBtZW1vLCBpdGVyYXRlZSwgY2IpIHtcbiAgICAgICAgZWFjaE9mU2VyaWVzKGFyciwgZnVuY3Rpb24gKHgsIGksIGNiKSB7XG4gICAgICAgICAgICBpdGVyYXRlZShtZW1vLCB4LCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgbWVtbyA9IHY7XG4gICAgICAgICAgICAgICAgY2IoZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYihlcnIsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBWZXJzaW9uIG9mIHRoZSBjb21wb3NlIGZ1bmN0aW9uIHRoYXQgaXMgbW9yZSBuYXR1cmFsIHRvIHJlYWQuIEVhY2ggZnVuY3Rpb25cbiAgICAgKiBjb25zdW1lcyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBwcmV2aW91cyBmdW5jdGlvbi4gSXQgaXMgdGhlIGVxdWl2YWxlbnQgb2ZcbiAgICAgKiB7QGxpbmsgYXN5bmMuY29tcG9zZX0gd2l0aCB0aGUgYXJndW1lbnRzIHJldmVyc2VkLlxuICAgICAqXG4gICAgICogRWFjaCBmdW5jdGlvbiBpcyBleGVjdXRlZCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgY29tcG9zZWQgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbmFtZSBzZXFcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5jb21wb3NlXG4gICAgICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICAgICAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IGZ1bmN0aW9ucyAtIHRoZSBhc3luY2hyb25vdXMgZnVuY3Rpb25zIHRvIGNvbXBvc2VcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gUmVxdWlyZXMgbG9kYXNoIChvciB1bmRlcnNjb3JlKSwgZXhwcmVzczMgYW5kIGRyZXNlbmRlJ3Mgb3JtMi5cbiAgICAgKiAvLyBQYXJ0IG9mIGFuIGFwcCwgdGhhdCBmZXRjaGVzIGNhdHMgb2YgdGhlIGxvZ2dlZCB1c2VyLlxuICAgICAqIC8vIFRoaXMgZXhhbXBsZSB1c2VzIGBzZXFgIGZ1bmN0aW9uIHRvIGF2b2lkIG92ZXJuZXN0aW5nIGFuZCBlcnJvclxuICAgICAqIC8vIGhhbmRsaW5nIGNsdXR0ZXIuXG4gICAgICogYXBwLmdldCgnL2NhdHMnLCBmdW5jdGlvbihyZXF1ZXN0LCByZXNwb25zZSkge1xuICAgICAqICAgICB2YXIgVXNlciA9IHJlcXVlc3QubW9kZWxzLlVzZXI7XG4gICAgICogICAgIGFzeW5jLnNlcShcbiAgICAgKiAgICAgICAgIF8uYmluZChVc2VyLmdldCwgVXNlciksICAvLyAnVXNlci5nZXQnIGhhcyBzaWduYXR1cmUgKGlkLCBjYWxsYmFjayhlcnIsIGRhdGEpKVxuICAgICAqICAgICAgICAgZnVuY3Rpb24odXNlciwgZm4pIHtcbiAgICAgKiAgICAgICAgICAgICB1c2VyLmdldENhdHMoZm4pOyAgICAgIC8vICdnZXRDYXRzJyBoYXMgc2lnbmF0dXJlIChjYWxsYmFjayhlcnIsIGRhdGEpKVxuICAgICAqICAgICAgICAgfVxuICAgICAqICAgICApKHJlcS5zZXNzaW9uLnVzZXJfaWQsIGZ1bmN0aW9uIChlcnIsIGNhdHMpIHtcbiAgICAgKiAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgKiAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICogICAgICAgICAgICAgcmVzcG9uc2UuanNvbih7IHN0YXR1czogJ2Vycm9yJywgbWVzc2FnZTogZXJyLm1lc3NhZ2UgfSk7XG4gICAgICogICAgICAgICB9IGVsc2Uge1xuICAgICAqICAgICAgICAgICAgIHJlc3BvbnNlLmpzb24oeyBzdGF0dXM6ICdvaycsIG1lc3NhZ2U6ICdDYXRzIGZvdW5kJywgZGF0YTogY2F0cyB9KTtcbiAgICAgKiAgICAgICAgIH1cbiAgICAgKiAgICAgfSk7XG4gICAgICogfSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gc2VxKCkgLyogZnVuY3Rpb25zLi4uICove1xuICAgICAgICB2YXIgZm5zID0gYXJndW1lbnRzO1xuICAgICAgICByZXR1cm4gcmVzdChmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICB2YXIgY2IgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNiID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYiA9IG5vb3A7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlZHVjZShmbnMsIGFyZ3MsIGZ1bmN0aW9uIChuZXdhcmdzLCBmbiwgY2IpIHtcbiAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBuZXdhcmdzLmNvbmNhdChbcmVzdChmdW5jdGlvbiAoZXJyLCBuZXh0YXJncykge1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIsIG5leHRhcmdzKTtcbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjYi5hcHBseSh0aGF0LCBbZXJyXS5jb25jYXQocmVzdWx0cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciByZXZlcnNlID0gQXJyYXkucHJvdG90eXBlLnJldmVyc2U7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZnVuY3Rpb24gd2hpY2ggaXMgYSBjb21wb3NpdGlvbiBvZiB0aGUgcGFzc2VkIGFzeW5jaHJvbm91c1xuICAgICAqIGZ1bmN0aW9ucy4gRWFjaCBmdW5jdGlvbiBjb25zdW1lcyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0XG4gICAgICogZm9sbG93cy4gQ29tcG9zaW5nIGZ1bmN0aW9ucyBgZigpYCwgYGcoKWAsIGFuZCBgaCgpYCB3b3VsZCBwcm9kdWNlIHRoZSByZXN1bHRcbiAgICAgKiBvZiBgZihnKGgoKSkpYCwgb25seSB0aGlzIHZlcnNpb24gdXNlcyBjYWxsYmFja3MgdG8gb2J0YWluIHRoZSByZXR1cm4gdmFsdWVzLlxuICAgICAqXG4gICAgICogRWFjaCBmdW5jdGlvbiBpcyBleGVjdXRlZCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgY29tcG9zZWQgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAbmFtZSBjb21wb3NlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jdGlvbnMgLSB0aGUgYXN5bmNocm9ub3VzIGZ1bmN0aW9ucyB0byBjb21wb3NlXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGZ1bmN0aW9uIGFkZDEobiwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCBuICsgMSk7XG4gICAgICogICAgIH0sIDEwKTtcbiAgICAgKiB9XG4gICAgICpcbiAgICAgKiBmdW5jdGlvbiBtdWwzKG4sIGNhbGxiYWNrKSB7XG4gICAgICogICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgbiAqIDMpO1xuICAgICAqICAgICB9LCAxMCk7XG4gICAgICogfVxuICAgICAqXG4gICAgICogdmFyIGFkZDFtdWwzID0gYXN5bmMuY29tcG9zZShtdWwzLCBhZGQxKTtcbiAgICAgKiBhZGQxbXVsMyg0LCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAgICAgKiAgICAgLy8gcmVzdWx0IG5vdyBlcXVhbHMgMTVcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb21wb3NlKCkgLyogZnVuY3Rpb25zLi4uICove1xuICAgICAgcmV0dXJuIHNlcS5hcHBseShudWxsLCByZXZlcnNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29uY2F0JDEoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaWtlIGBlYWNoYCwgZXhjZXB0IHRoYXQgaXQgcGFzc2VzIHRoZSBrZXkgKG9yIGluZGV4KSBhcyB0aGUgc2Vjb25kIGFyZ3VtZW50XG4gICAgICogdG8gdGhlIGl0ZXJhdGVlLlxuICAgICAqXG4gICAgICogQG5hbWUgZWFjaE9mXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBhbGlhcyBmb3JFYWNoT2ZcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaFxuICAgICAqIGl0ZW0gaW4gYGNvbGxgLiBUaGUgYGtleWAgaXMgdGhlIGl0ZW0ncyBrZXksIG9yIGluZGV4IGluIHRoZSBjYXNlIG9mIGFuXG4gICAgICogYXJyYXkuIFRoZSBpdGVyYXRlZSBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyKWAgd2hpY2ggbXVzdCBiZSBjYWxsZWQgb25jZSBpdFxuICAgICAqIGhhcyBjb21wbGV0ZWQuIElmIG5vIGVycm9yIGhhcyBvY2N1cnJlZCwgdGhlIGNhbGxiYWNrIHNob3VsZCBiZSBydW4gd2l0aG91dFxuICAgICAqIGFyZ3VtZW50cyBvciB3aXRoIGFuIGV4cGxpY2l0IGBudWxsYCBhcmd1bWVudC4gSW52b2tlZCB3aXRoXG4gICAgICogKGl0ZW0sIGtleSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIGFsbFxuICAgICAqIGBpdGVyYXRlZWAgZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQsIG9yIGFuIGVycm9yIG9jY3Vycy4gSW52b2tlZCB3aXRoIChlcnIpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgb2JqID0ge2RldjogXCIvZGV2Lmpzb25cIiwgdGVzdDogXCIvdGVzdC5qc29uXCIsIHByb2Q6IFwiL3Byb2QuanNvblwifTtcbiAgICAgKiB2YXIgY29uZmlncyA9IHt9O1xuICAgICAqXG4gICAgICogYXN5bmMuZm9yRWFjaE9mKG9iaiwgZnVuY3Rpb24gKHZhbHVlLCBrZXksIGNhbGxiYWNrKSB7XG4gICAgICogICAgIGZzLnJlYWRGaWxlKF9fZGlybmFtZSArIHZhbHVlLCBcInV0ZjhcIiwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAqICAgICAgICAgaWYgKGVycikgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICogICAgICAgICB0cnkge1xuICAgICAqICAgICAgICAgICAgIGNvbmZpZ3Nba2V5XSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICogICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICogICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgICAqICAgICAgICAgfVxuICAgICAqICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgKiAgICAgfSk7XG4gICAgICogfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAqICAgICBpZiAoZXJyKSBjb25zb2xlLmVycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgKiAgICAgLy8gY29uZmlncyBpcyBub3cgYSBtYXAgb2YgSlNPTiBkYXRhXG4gICAgICogICAgIGRvU29tZXRoaW5nV2l0aChjb25maWdzKTtcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICB2YXIgZWFjaE9mID0gZG9MaW1pdChlYWNoT2ZMaW1pdCwgSW5maW5pdHkpO1xuXG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0ZWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oZWFjaE9mLCBvYmosIGl0ZXJhdGVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwbGllcyBgaXRlcmF0ZWVgIHRvIGVhY2ggaXRlbSBpbiBgY29sbGAsIGNvbmNhdGVuYXRpbmcgdGhlIHJlc3VsdHMuIFJldHVybnNcbiAgICAgKiB0aGUgY29uY2F0ZW5hdGVkIGxpc3QuIFRoZSBgaXRlcmF0ZWVgcyBhcmUgY2FsbGVkIGluIHBhcmFsbGVsLCBhbmQgdGhlXG4gICAgICogcmVzdWx0cyBhcmUgY29uY2F0ZW5hdGVkIGFzIHRoZXkgcmV0dXJuLiBUaGVyZSBpcyBubyBndWFyYW50ZWUgdGhhdCB0aGVcbiAgICAgKiByZXN1bHRzIGFycmF5IHdpbGwgYmUgcmV0dXJuZWQgaW4gdGhlIG9yaWdpbmFsIG9yZGVyIG9mIGBjb2xsYCBwYXNzZWQgdG8gdGhlXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBuYW1lIGNvbmNhdFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCBpdGVtIGluIGBjb2xsYC5cbiAgICAgKiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgcmVzdWx0cylgIHdoaWNoIG11c3QgYmUgY2FsbGVkIG9uY2VcbiAgICAgKiBpdCBoYXMgY29tcGxldGVkIHdpdGggYW4gZXJyb3IgKHdoaWNoIGNhbiBiZSBgbnVsbGApIGFuZCBhbiBhcnJheSBvZiByZXN1bHRzLlxuICAgICAqIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjayhlcnIpXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIGFmdGVyIGFsbCB0aGVcbiAgICAgKiBgaXRlcmF0ZWVgIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLCBvciBhbiBlcnJvciBvY2N1cnMuIFJlc3VsdHMgaXMgYW4gYXJyYXlcbiAgICAgKiBjb250YWluaW5nIHRoZSBjb25jYXRlbmF0ZWQgcmVzdWx0cyBvZiB0aGUgYGl0ZXJhdGVlYCBmdW5jdGlvbi4gSW52b2tlZCB3aXRoXG4gICAgICogKGVyciwgcmVzdWx0cykuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGFzeW5jLmNvbmNhdChbJ2RpcjEnLCdkaXIyJywnZGlyMyddLCBmcy5yZWFkZGlyLCBmdW5jdGlvbihlcnIsIGZpbGVzKSB7XG4gICAgICogICAgIC8vIGZpbGVzIGlzIG5vdyBhIGxpc3Qgb2YgZmlsZW5hbWVzIHRoYXQgZXhpc3QgaW4gdGhlIDMgZGlyZWN0b3JpZXNcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICB2YXIgY29uY2F0ID0gZG9QYXJhbGxlbChjb25jYXQkMSk7XG5cbiAgICBmdW5jdGlvbiBkb1Nlcmllcyhmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0ZWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oZWFjaE9mU2VyaWVzLCBvYmosIGl0ZXJhdGVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHNhbWUgYXMgYGNvbmNhdGAgYnV0IHJ1bnMgb25seSBhIHNpbmdsZSBhc3luYyBvcGVyYXRpb24gYXQgYSB0aW1lLlxuICAgICAqXG4gICAgICogQG5hbWUgY29uY2F0U2VyaWVzXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBzZWUgYXN5bmMuY29uY2F0XG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbCAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBBIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBpbiBgY29sbGAuXG4gICAgICogVGhlIGl0ZXJhdGVlIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHJlc3VsdHMpYCB3aGljaCBtdXN0IGJlIGNhbGxlZCBvbmNlXG4gICAgICogaXQgaGFzIGNvbXBsZXRlZCB3aXRoIGFuIGVycm9yICh3aGljaCBjYW4gYmUgYG51bGxgKSBhbmQgYW4gYXJyYXkgb2YgcmVzdWx0cy5cbiAgICAgKiBJbnZva2VkIHdpdGggKGl0ZW0sIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2soZXJyKV0gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciBhbGwgdGhlXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZCwgb3IgYW4gZXJyb3Igb2NjdXJzLiBSZXN1bHRzIGlzIGFuIGFycmF5XG4gICAgICogY29udGFpbmluZyB0aGUgY29uY2F0ZW5hdGVkIHJlc3VsdHMgb2YgdGhlIGBpdGVyYXRlZWAgZnVuY3Rpb24uIEludm9rZWQgd2l0aFxuICAgICAqIChlcnIsIHJlc3VsdHMpLlxuICAgICAqL1xuICAgIHZhciBjb25jYXRTZXJpZXMgPSBkb1Nlcmllcyhjb25jYXQkMSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aGVuIGNhbGxlZCwgY2FsbHMtYmFjayB3aXRoIHRoZSB2YWx1ZXMgcHJvdmlkZWQuXG4gICAgICogVXNlZnVsIGFzIHRoZSBmaXJzdCBmdW5jdGlvbiBpbiBhIGB3YXRlcmZhbGxgLCBvciBmb3IgcGx1Z2dpbmcgdmFsdWVzIGluIHRvXG4gICAgICogYGF1dG9gLlxuICAgICAqXG4gICAgICogQG5hbWUgY29uc3RhbnRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IFV0aWxcbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3VtZW50cy4uLiAtIEFueSBudW1iZXIgb2YgYXJndW1lbnRzIHRvIGF1dG9tYXRpY2FsbHkgaW52b2tlXG4gICAgICogY2FsbGJhY2sgd2l0aC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdoZW4gaW52b2tlZCwgYXV0b21hdGljYWxseVxuICAgICAqIGludm9rZXMgdGhlIGNhbGxiYWNrIHdpdGggdGhlIHByZXZpb3VzIGdpdmVuIGFyZ3VtZW50cy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYXN5bmMud2F0ZXJmYWxsKFtcbiAgICAgKiAgICAgYXN5bmMuY29uc3RhbnQoNDIpLFxuICAgICAqICAgICBmdW5jdGlvbiAodmFsdWUsIG5leHQpIHtcbiAgICAgKiAgICAgICAgIC8vIHZhbHVlID09PSA0MlxuICAgICAqICAgICB9LFxuICAgICAqICAgICAvLy4uLlxuICAgICAqIF0sIGNhbGxiYWNrKTtcbiAgICAgKlxuICAgICAqIGFzeW5jLndhdGVyZmFsbChbXG4gICAgICogICAgIGFzeW5jLmNvbnN0YW50KGZpbGVuYW1lLCBcInV0ZjhcIiksXG4gICAgICogICAgIGZzLnJlYWRGaWxlLFxuICAgICAqICAgICBmdW5jdGlvbiAoZmlsZURhdGEsIG5leHQpIHtcbiAgICAgKiAgICAgICAgIC8vLi4uXG4gICAgICogICAgIH1cbiAgICAgKiAgICAgLy8uLi5cbiAgICAgKiBdLCBjYWxsYmFjayk7XG4gICAgICpcbiAgICAgKiBhc3luYy5hdXRvKHtcbiAgICAgKiAgICAgaG9zdG5hbWU6IGFzeW5jLmNvbnN0YW50KFwiaHR0cHM6Ly9zZXJ2ZXIubmV0L1wiKSxcbiAgICAgKiAgICAgcG9ydDogZmluZEZyZWVQb3J0LFxuICAgICAqICAgICBsYXVuY2hTZXJ2ZXI6IFtcImhvc3RuYW1lXCIsIFwicG9ydFwiLCBmdW5jdGlvbiAob3B0aW9ucywgY2IpIHtcbiAgICAgKiAgICAgICAgIHN0YXJ0U2VydmVyKG9wdGlvbnMsIGNiKTtcbiAgICAgKiAgICAgfV0sXG4gICAgICogICAgIC8vLi4uXG4gICAgICogfSwgY2FsbGJhY2spO1xuICAgICAqL1xuICAgIHZhciBjb25zdGFudCA9IHJlc3QoZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICB2YXIgYXJncyA9IFtudWxsXS5jb25jYXQodmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGluaXRpYWxQYXJhbXMoZnVuY3Rpb24gKGlnbm9yZWRBcmdzLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVUZXN0ZXIoZWFjaGZuLCBjaGVjaywgZ2V0UmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYXJyLCBsaW1pdCwgaXRlcmF0ZWUsIGNiKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IobnVsbCwgZ2V0UmVzdWx0KGZhbHNlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiB3cmFwcGVkSXRlcmF0ZWUoeCwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNiKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRlZSh4LCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRlZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaGVjayh2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNiKG51bGwsIGdldFJlc3VsdCh0cnVlLCB4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRlZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICBjYiA9IGNiIHx8IG5vb3A7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgbGltaXQsIHdyYXBwZWRJdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0ZWU7XG4gICAgICAgICAgICAgICAgY2IgPSBjYiB8fCBub29wO1xuICAgICAgICAgICAgICAgIGl0ZXJhdGVlID0gbGltaXQ7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgd3JhcHBlZEl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfZmluZEdldFJlc3VsdCh2LCB4KSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IHZhbHVlIGluIGBjb2xsYCB0aGF0IHBhc3NlcyBhbiBhc3luYyB0cnV0aCB0ZXN0LiBUaGVcbiAgICAgKiBgaXRlcmF0ZWVgIGlzIGFwcGxpZWQgaW4gcGFyYWxsZWwsIG1lYW5pbmcgdGhlIGZpcnN0IGl0ZXJhdGVlIHRvIHJldHVyblxuICAgICAqIGB0cnVlYCB3aWxsIGZpcmUgdGhlIGRldGVjdCBgY2FsbGJhY2tgIHdpdGggdGhhdCByZXN1bHQuIFRoYXQgbWVhbnMgdGhlXG4gICAgICogcmVzdWx0IG1pZ2h0IG5vdCBiZSB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgb3JpZ2luYWwgYGNvbGxgIChpbiB0ZXJtcyBvZiBvcmRlcilcbiAgICAgKiB0aGF0IHBhc3NlcyB0aGUgdGVzdC5cblxuICAgICAqIElmIG9yZGVyIHdpdGhpbiB0aGUgb3JpZ2luYWwgYGNvbGxgIGlzIGltcG9ydGFudCwgdGhlbiBsb29rIGF0XG4gICAgICogYGRldGVjdFNlcmllc2AuXG4gICAgICpcbiAgICAgKiBAbmFtZSBkZXRlY3RcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGFsaWFzIGZpbmRcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgdHJ1dGggdGVzdCB0byBhcHBseSB0byBlYWNoIGl0ZW0gaW4gYGNvbGxgLlxuICAgICAqIFRoZSBpdGVyYXRlZSBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyLCB0cnV0aFZhbHVlKWAgd2hpY2ggbXVzdCBiZSBjYWxsZWRcbiAgICAgKiB3aXRoIGEgYm9vbGVhbiBhcmd1bWVudCBvbmNlIGl0IGhhcyBjb21wbGV0ZWQuIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhcyBzb29uIGFzIGFueVxuICAgICAqIGl0ZXJhdGVlIHJldHVybnMgYHRydWVgLCBvciBhZnRlciBhbGwgdGhlIGBpdGVyYXRlZWAgZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQuXG4gICAgICogUmVzdWx0IHdpbGwgYmUgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGFycmF5IHRoYXQgcGFzc2VzIHRoZSB0cnV0aCB0ZXN0XG4gICAgICogKGl0ZXJhdGVlKSBvciB0aGUgdmFsdWUgYHVuZGVmaW5lZGAgaWYgbm9uZSBwYXNzZWQuIEludm9rZWQgd2l0aFxuICAgICAqIChlcnIsIHJlc3VsdCkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGFzeW5jLmRldGVjdChbJ2ZpbGUxJywnZmlsZTInLCdmaWxlMyddLCBmdW5jdGlvbihmaWxlUGF0aCwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgZnMuYWNjZXNzKGZpbGVQYXRoLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICFlcnIpXG4gICAgICogICAgIH0pO1xuICAgICAqIH0sIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgICogICAgIC8vIHJlc3VsdCBub3cgZXF1YWxzIHRoZSBmaXJzdCBmaWxlIGluIHRoZSBsaXN0IHRoYXQgZXhpc3RzXG4gICAgICogfSk7XG4gICAgICovXG4gICAgdmFyIGRldGVjdCA9IF9jcmVhdGVUZXN0ZXIoZWFjaE9mLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNhbWUgYXMgYGRldGVjdGAgYnV0IHJ1bnMgYSBtYXhpbXVtIG9mIGBsaW1pdGAgYXN5bmMgb3BlcmF0aW9ucyBhdCBhXG4gICAgICogdGltZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIGRldGVjdExpbWl0XG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBzZWUgYXN5bmMuZGV0ZWN0XG4gICAgICogQGFsaWFzIGZpbmRMaW1pdFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhc3luYyBvcGVyYXRpb25zIGF0IGEgdGltZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgdHJ1dGggdGVzdCB0byBhcHBseSB0byBlYWNoIGl0ZW0gaW4gYGNvbGxgLlxuICAgICAqIFRoZSBpdGVyYXRlZSBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyLCB0cnV0aFZhbHVlKWAgd2hpY2ggbXVzdCBiZSBjYWxsZWRcbiAgICAgKiB3aXRoIGEgYm9vbGVhbiBhcmd1bWVudCBvbmNlIGl0IGhhcyBjb21wbGV0ZWQuIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhcyBzb29uIGFzIGFueVxuICAgICAqIGl0ZXJhdGVlIHJldHVybnMgYHRydWVgLCBvciBhZnRlciBhbGwgdGhlIGBpdGVyYXRlZWAgZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQuXG4gICAgICogUmVzdWx0IHdpbGwgYmUgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGFycmF5IHRoYXQgcGFzc2VzIHRoZSB0cnV0aCB0ZXN0XG4gICAgICogKGl0ZXJhdGVlKSBvciB0aGUgdmFsdWUgYHVuZGVmaW5lZGAgaWYgbm9uZSBwYXNzZWQuIEludm9rZWQgd2l0aFxuICAgICAqIChlcnIsIHJlc3VsdCkuXG4gICAgICovXG4gICAgdmFyIGRldGVjdExpbWl0ID0gX2NyZWF0ZVRlc3RlcihlYWNoT2ZMaW1pdCwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzYW1lIGFzIGBkZXRlY3RgIGJ1dCBydW5zIG9ubHkgYSBzaW5nbGUgYXN5bmMgb3BlcmF0aW9uIGF0IGEgdGltZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIGRldGVjdFNlcmllc1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLmRldGVjdFxuICAgICAqIEBhbGlhcyBmaW5kU2VyaWVzXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbCAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBBIHRydXRoIHRlc3QgdG8gYXBwbHkgdG8gZWFjaCBpdGVtIGluIGBjb2xsYC5cbiAgICAgKiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJ1dGhWYWx1ZSlgIHdoaWNoIG11c3QgYmUgY2FsbGVkXG4gICAgICogd2l0aCBhIGJvb2xlYW4gYXJndW1lbnQgb25jZSBpdCBoYXMgY29tcGxldGVkLiBJbnZva2VkIHdpdGggKGl0ZW0sIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgYXMgc29vbiBhcyBhbnlcbiAgICAgKiBpdGVyYXRlZSByZXR1cm5zIGB0cnVlYCwgb3IgYWZ0ZXIgYWxsIHRoZSBgaXRlcmF0ZWVgIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLlxuICAgICAqIFJlc3VsdCB3aWxsIGJlIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBhcnJheSB0aGF0IHBhc3NlcyB0aGUgdHJ1dGggdGVzdFxuICAgICAqIChpdGVyYXRlZSkgb3IgdGhlIHZhbHVlIGB1bmRlZmluZWRgIGlmIG5vbmUgcGFzc2VkLiBJbnZva2VkIHdpdGhcbiAgICAgKiAoZXJyLCByZXN1bHQpLlxuICAgICAqL1xuICAgIHZhciBkZXRlY3RTZXJpZXMgPSBfY3JlYXRlVGVzdGVyKGVhY2hPZlNlcmllcywgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcblxuICAgIGZ1bmN0aW9uIGNvbnNvbGVGdW5jKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHJlc3QoZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbcmVzdChmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29uc29sZS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb25zb2xlW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9ncyB0aGUgcmVzdWx0IG9mIGFuIGBhc3luY2AgZnVuY3Rpb24gdG8gdGhlIGBjb25zb2xlYCB1c2luZyBgY29uc29sZS5kaXJgXG4gICAgICogdG8gZGlzcGxheSB0aGUgcHJvcGVydGllcyBvZiB0aGUgcmVzdWx0aW5nIG9iamVjdC4gT25seSB3b3JrcyBpbiBOb2RlLmpzIG9yXG4gICAgICogaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IGBjb25zb2xlLmRpcmAgYW5kIGBjb25zb2xlLmVycm9yYCAoc3VjaCBhcyBGRiBhbmRcbiAgICAgKiBDaHJvbWUpLiBJZiBtdWx0aXBsZSBhcmd1bWVudHMgYXJlIHJldHVybmVkIGZyb20gdGhlIGFzeW5jIGZ1bmN0aW9uLFxuICAgICAqIGBjb25zb2xlLmRpcmAgaXMgY2FsbGVkIG9uIGVhY2ggYXJndW1lbnQgaW4gb3JkZXIuXG4gICAgICpcbiAgICAgKiBAbmFtZSBsb2dcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IFV0aWxcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jdGlvbiAtIFRoZSBmdW5jdGlvbiB5b3Ugd2FudCB0byBldmVudHVhbGx5IGFwcGx5IGFsbFxuICAgICAqIGFyZ3VtZW50cyB0by5cbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3VtZW50cy4uLiAtIEFueSBudW1iZXIgb2YgYXJndW1lbnRzIHRvIGFwcGx5IHRvIHRoZSBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogLy8gaW4gYSBtb2R1bGVcbiAgICAgKiB2YXIgaGVsbG8gPSBmdW5jdGlvbihuYW1lLCBjYWxsYmFjaykge1xuICAgICAqICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgY2FsbGJhY2sobnVsbCwge2hlbGxvOiBuYW1lfSk7XG4gICAgICogICAgIH0sIDEwMDApO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyBpbiB0aGUgbm9kZSByZXBsXG4gICAgICogbm9kZT4gYXN5bmMuZGlyKGhlbGxvLCAnd29ybGQnKTtcbiAgICAgKiB7aGVsbG86ICd3b3JsZCd9XG4gICAgICovXG4gICAgdmFyIGRpciA9IGNvbnNvbGVGdW5jKCdkaXInKTtcblxuICAgIC8qKlxuICAgICAqIExpa2Uge0BsaW5rIGFzeW5jLndoaWxzdH0sIGV4Y2VwdCB0aGUgYHRlc3RgIGlzIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbiB0aGF0XG4gICAgICogaXMgcGFzc2VkIGEgY2FsbGJhY2sgaW4gdGhlIGZvcm0gb2YgYGZ1bmN0aW9uIChlcnIsIHRydXRoKWAuIElmIGVycm9yIGlzXG4gICAgICogcGFzc2VkIHRvIGB0ZXN0YCBvciBgZm5gLCB0aGUgbWFpbiBjYWxsYmFjayBpcyBpbW1lZGlhdGVseSBjYWxsZWQgd2l0aCB0aGVcbiAgICAgKiB2YWx1ZSBvZiB0aGUgZXJyb3IuXG4gICAgICpcbiAgICAgKiBAbmFtZSBkdXJpbmdcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy53aGlsc3RcbiAgICAgKiBAY2F0ZWdvcnkgQ29udHJvbCBGbG93XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gdGVzdCAtIGFzeW5jaHJvbm91cyB0cnV0aCB0ZXN0IHRvIHBlcmZvcm0gYmVmb3JlIGVhY2hcbiAgICAgKiBleGVjdXRpb24gb2YgYGZuYC4gSW52b2tlZCB3aXRoIChjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gLSBBIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCBlYWNoIHRpbWUgYHRlc3RgIHBhc3Nlcy5cbiAgICAgKiBUaGUgZnVuY3Rpb24gaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVycilgLCB3aGljaCBtdXN0IGJlIGNhbGxlZCBvbmNlIGl0IGhhc1xuICAgICAqIGNvbXBsZXRlZCB3aXRoIGFuIG9wdGlvbmFsIGBlcnJgIGFyZ3VtZW50LiBJbnZva2VkIHdpdGggKGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgYWZ0ZXIgdGhlIHRlc3RcbiAgICAgKiBmdW5jdGlvbiBoYXMgZmFpbGVkIGFuZCByZXBlYXRlZCBleGVjdXRpb24gb2YgYGZuYCBoYXMgc3RvcHBlZC4gYGNhbGxiYWNrYFxuICAgICAqIHdpbGwgYmUgcGFzc2VkIGFuIGVycm9yIGFuZCBhbnkgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgZmluYWwgYGZuYCdzXG4gICAgICogY2FsbGJhY2suIEludm9rZWQgd2l0aCAoZXJyLCBbcmVzdWx0c10pO1xuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiB2YXIgY291bnQgPSAwO1xuICAgICAqXG4gICAgICogYXN5bmMuZHVyaW5nKFxuICAgICAqICAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsLCBjb3VudCA8IDUpO1xuICAgICAqICAgICB9LFxuICAgICAqICAgICBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIGNvdW50Kys7XG4gICAgICogICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwKTtcbiAgICAgKiAgICAgfSxcbiAgICAgKiAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAqICAgICAgICAgLy8gNSBzZWNvbmRzIGhhdmUgcGFzc2VkXG4gICAgICogICAgIH1cbiAgICAgKiApO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGR1cmluZyh0ZXN0LCBpdGVyYXRlZSwgY2IpIHtcbiAgICAgICAgY2IgPSBjYiB8fCBub29wO1xuXG4gICAgICAgIHZhciBuZXh0ID0gcmVzdChmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2IoZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGNoZWNrKTtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbiAoZXJyLCB0cnV0aCkge1xuICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICBpZiAoIXRydXRoKSByZXR1cm4gY2IobnVsbCk7XG4gICAgICAgICAgICBpdGVyYXRlZShuZXh0KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0KGNoZWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcG9zdC1jaGVjayB2ZXJzaW9uIG9mIHtAbGluayBhc3luYy5kdXJpbmd9LiBUbyByZWZsZWN0IHRoZSBkaWZmZXJlbmNlIGluXG4gICAgICogdGhlIG9yZGVyIG9mIG9wZXJhdGlvbnMsIHRoZSBhcmd1bWVudHMgYHRlc3RgIGFuZCBgZm5gIGFyZSBzd2l0Y2hlZC5cbiAgICAgKlxuICAgICAqIEFsc28gYSB2ZXJzaW9uIG9mIHtAbGluayBhc3luYy5kb1doaWxzdH0gd2l0aCBhc3luY2hyb25vdXMgYHRlc3RgIGZ1bmN0aW9uLlxuICAgICAqIEBuYW1lIGRvRHVyaW5nXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBzZWUgYXN5bmMuZHVyaW5nXG4gICAgICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIC0gQSBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgZWFjaCB0aW1lIGB0ZXN0YCBwYXNzZXMuXG4gICAgICogVGhlIGZ1bmN0aW9uIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIpYCwgd2hpY2ggbXVzdCBiZSBjYWxsZWQgb25jZSBpdCBoYXNcbiAgICAgKiBjb21wbGV0ZWQgd2l0aCBhbiBvcHRpb25hbCBgZXJyYCBhcmd1bWVudC4gSW52b2tlZCB3aXRoIChjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gdGVzdCAtIGFzeW5jaHJvbm91cyB0cnV0aCB0ZXN0IHRvIHBlcmZvcm0gYmVmb3JlIGVhY2hcbiAgICAgKiBleGVjdXRpb24gb2YgYGZuYC4gSW52b2tlZCB3aXRoIChjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIGFmdGVyIHRoZSB0ZXN0XG4gICAgICogZnVuY3Rpb24gaGFzIGZhaWxlZCBhbmQgcmVwZWF0ZWQgZXhlY3V0aW9uIG9mIGBmbmAgaGFzIHN0b3BwZWQuIGBjYWxsYmFja2BcbiAgICAgKiB3aWxsIGJlIHBhc3NlZCBhbiBlcnJvciBhbmQgYW55IGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGZpbmFsIGBmbmAnc1xuICAgICAqIGNhbGxiYWNrLiBJbnZva2VkIHdpdGggKGVyciwgW3Jlc3VsdHNdKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkb0R1cmluZyhpdGVyYXRlZSwgdGVzdCwgY2IpIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcblxuICAgICAgICBkdXJpbmcoZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgICAgICAgIGlmIChjYWxscysrIDwgMSkgcmV0dXJuIG5leHQobnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdGVlLCBjYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVwZWF0ZWRseSBjYWxsIGBmbmAsIHdoaWxlIGB0ZXN0YCByZXR1cm5zIGB0cnVlYC4gQ2FsbHMgYGNhbGxiYWNrYCB3aGVuXG4gICAgICogc3RvcHBlZCwgb3IgYW4gZXJyb3Igb2NjdXJzLlxuICAgICAqXG4gICAgICogQG5hbWUgd2hpbHN0XG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0ZXN0IC0gc3luY2hyb25vdXMgdHJ1dGggdGVzdCB0byBwZXJmb3JtIGJlZm9yZSBlYWNoXG4gICAgICogZXhlY3V0aW9uIG9mIGBmbmAuIEludm9rZWQgd2l0aCAoKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiAtIEEgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIGVhY2ggdGltZSBgdGVzdGAgcGFzc2VzLlxuICAgICAqIFRoZSBmdW5jdGlvbiBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyKWAsIHdoaWNoIG11c3QgYmUgY2FsbGVkIG9uY2UgaXQgaGFzXG4gICAgICogY29tcGxldGVkIHdpdGggYW4gb3B0aW9uYWwgYGVycmAgYXJndW1lbnQuIEludm9rZWQgd2l0aCAoY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciB0aGUgdGVzdFxuICAgICAqIGZ1bmN0aW9uIGhhcyBmYWlsZWQgYW5kIHJlcGVhdGVkIGV4ZWN1dGlvbiBvZiBgZm5gIGhhcyBzdG9wcGVkLiBgY2FsbGJhY2tgXG4gICAgICogd2lsbCBiZSBwYXNzZWQgYW4gZXJyb3IgYW5kIGFueSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBmaW5hbCBgZm5gJ3NcbiAgICAgKiBjYWxsYmFjay4gSW52b2tlZCB3aXRoIChlcnIsIFtyZXN1bHRzXSk7XG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBjb3VudCA9IDA7XG4gICAgICogYXN5bmMud2hpbHN0KFxuICAgICAqICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNvdW50IDwgNTsgfSxcbiAgICAgKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIGNvdW50Kys7XG4gICAgICogICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGNvdW50KTtcbiAgICAgKiAgICAgICAgIH0sIDEwMDApO1xuICAgICAqICAgICB9LFxuICAgICAqICAgICBmdW5jdGlvbiAoZXJyLCBuKSB7XG4gICAgICogICAgICAgICAvLyA1IHNlY29uZHMgaGF2ZSBwYXNzZWQsIG4gPSA1XG4gICAgICogICAgIH1cbiAgICAgKiApO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdoaWxzdCh0ZXN0LCBpdGVyYXRlZSwgY2IpIHtcbiAgICAgICAgY2IgPSBjYiB8fCBub29wO1xuICAgICAgICBpZiAoIXRlc3QoKSkgcmV0dXJuIGNiKG51bGwpO1xuICAgICAgICB2YXIgbmV4dCA9IHJlc3QoZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICBpZiAodGVzdC5hcHBseSh0aGlzLCBhcmdzKSkgcmV0dXJuIGl0ZXJhdGVlKG5leHQpO1xuICAgICAgICAgICAgY2IuYXBwbHkobnVsbCwgW251bGxdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpdGVyYXRlZShuZXh0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgcG9zdC1jaGVjayB2ZXJzaW9uIG9mIHtAbGluayBhc3luYy53aGlsc3R9LiBUbyByZWZsZWN0IHRoZSBkaWZmZXJlbmNlIGluXG4gICAgICogdGhlIG9yZGVyIG9mIG9wZXJhdGlvbnMsIHRoZSBhcmd1bWVudHMgYHRlc3RgIGFuZCBgZm5gIGFyZSBzd2l0Y2hlZC5cbiAgICAgKlxuICAgICAqIGBkb1doaWxzdGAgaXMgdG8gYHdoaWxzdGAgYXMgYGRvIHdoaWxlYCBpcyB0byBgd2hpbGVgIGluIHBsYWluIEphdmFTY3JpcHQuXG4gICAgICpcbiAgICAgKiBAbmFtZSBkb1doaWxzdFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLndoaWxzdFxuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiAtIEEgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIGVhY2ggdGltZSBgdGVzdGAgcGFzc2VzLlxuICAgICAqIFRoZSBmdW5jdGlvbiBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyKWAsIHdoaWNoIG11c3QgYmUgY2FsbGVkIG9uY2UgaXQgaGFzXG4gICAgICogY29tcGxldGVkIHdpdGggYW4gb3B0aW9uYWwgYGVycmAgYXJndW1lbnQuIEludm9rZWQgd2l0aCAoY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IHRlc3QgLSBzeW5jaHJvbm91cyB0cnV0aCB0ZXN0IHRvIHBlcmZvcm0gYWZ0ZXIgZWFjaFxuICAgICAqIGV4ZWN1dGlvbiBvZiBgZm5gLiBJbnZva2VkIHdpdGggSW52b2tlZCB3aXRoIHRoZSBub24tZXJyb3IgY2FsbGJhY2sgcmVzdWx0c1xuICAgICAqIG9mIGBmbmAuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIGFmdGVyIHRoZSB0ZXN0XG4gICAgICogZnVuY3Rpb24gaGFzIGZhaWxlZCBhbmQgcmVwZWF0ZWQgZXhlY3V0aW9uIG9mIGBmbmAgaGFzIHN0b3BwZWQuIGBjYWxsYmFja2BcbiAgICAgKiB3aWxsIGJlIHBhc3NlZCBhbiBlcnJvciBhbmQgYW55IGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGZpbmFsIGBmbmAnc1xuICAgICAqIGNhbGxiYWNrLiBJbnZva2VkIHdpdGggKGVyciwgW3Jlc3VsdHNdKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBkb1doaWxzdChpdGVyYXRlZSwgdGVzdCwgY2IpIHtcbiAgICAgICAgdmFyIGNhbGxzID0gMDtcbiAgICAgICAgcmV0dXJuIHdoaWxzdChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKytjYWxscyA8PSAxIHx8IHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0ZWUsIGNiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMaWtlIHtAbGluayBhc3luYy5kb1doaWxzdH0sIGV4Y2VwdCB0aGUgYHRlc3RgIGlzIGludmVydGVkLiBOb3RlIHRoZVxuICAgICAqIGFyZ3VtZW50IG9yZGVyaW5nIGRpZmZlcnMgZnJvbSBgdW50aWxgLlxuICAgICAqXG4gICAgICogQG5hbWUgZG9VbnRpbFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLmRvV2hpbHN0XG4gICAgICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIC0gQSBmdW5jdGlvbiB3aGljaCBpcyBjYWxsZWQgZWFjaCB0aW1lIGB0ZXN0YCBmYWlscy5cbiAgICAgKiBUaGUgZnVuY3Rpb24gaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVycilgLCB3aGljaCBtdXN0IGJlIGNhbGxlZCBvbmNlIGl0IGhhc1xuICAgICAqIGNvbXBsZXRlZCB3aXRoIGFuIG9wdGlvbmFsIGBlcnJgIGFyZ3VtZW50LiBJbnZva2VkIHdpdGggKGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0ZXN0IC0gc3luY2hyb25vdXMgdHJ1dGggdGVzdCB0byBwZXJmb3JtIGFmdGVyIGVhY2hcbiAgICAgKiBleGVjdXRpb24gb2YgYGZuYC4gSW52b2tlZCB3aXRoIHRoZSBub24tZXJyb3IgY2FsbGJhY2sgcmVzdWx0cyBvZiBgZm5gLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciB0aGUgdGVzdFxuICAgICAqIGZ1bmN0aW9uIGhhcyBwYXNzZWQgYW5kIHJlcGVhdGVkIGV4ZWN1dGlvbiBvZiBgZm5gIGhhcyBzdG9wcGVkLiBgY2FsbGJhY2tgXG4gICAgICogd2lsbCBiZSBwYXNzZWQgYW4gZXJyb3IgYW5kIGFueSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBmaW5hbCBgZm5gJ3NcbiAgICAgKiBjYWxsYmFjay4gSW52b2tlZCB3aXRoIChlcnIsIFtyZXN1bHRzXSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gZG9VbnRpbChpdGVyYXRlZSwgdGVzdCwgY2IpIHtcbiAgICAgICAgcmV0dXJuIGRvV2hpbHN0KGl0ZXJhdGVlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgY2IpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93aXRob3V0SW5kZXgoaXRlcmF0ZWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZWUodmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2FtZSBhcyBgZWFjaGAgYnV0IHJ1bnMgYSBtYXhpbXVtIG9mIGBsaW1pdGAgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSBlYWNoTGltaXRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5lYWNoXG4gICAgICogQGFsaWFzIGZvckVhY2hMaW1pdFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY2l0b24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhc3luYyBvcGVyYXRpb25zIGF0IGEgdGltZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCBpdGVtIGluIGBjb2xsYC4gVGhlXG4gICAgICogaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVycilgIHdoaWNoIG11c3QgYmUgY2FsbGVkIG9uY2UgaXQgaGFzXG4gICAgICogY29tcGxldGVkLiBJZiBubyBlcnJvciBoYXMgb2NjdXJyZWQsIHRoZSBgY2FsbGJhY2tgIHNob3VsZCBiZSBydW4gd2l0aG91dFxuICAgICAqIGFyZ3VtZW50cyBvciB3aXRoIGFuIGV4cGxpY2l0IGBudWxsYCBhcmd1bWVudC4gVGhlIGFycmF5IGluZGV4IGlzIG5vdCBwYXNzZWRcbiAgICAgKiB0byB0aGUgaXRlcmF0ZWUuIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLiBJZiB5b3UgbmVlZCB0aGUgaW5kZXgsIHVzZVxuICAgICAqIGBlYWNoT2ZMaW1pdGAuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gYWxsXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZCwgb3IgYW4gZXJyb3Igb2NjdXJzLiBJbnZva2VkIHdpdGggKGVycikuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZWFjaExpbWl0KGFyciwgbGltaXQsIGl0ZXJhdGVlLCBjYikge1xuICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdGVlKSwgY2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcGxpZXMgdGhlIGZ1bmN0aW9uIGBpdGVyYXRlZWAgdG8gZWFjaCBpdGVtIGluIGBjb2xsYCwgaW4gcGFyYWxsZWwuXG4gICAgICogVGhlIGBpdGVyYXRlZWAgaXMgY2FsbGVkIHdpdGggYW4gaXRlbSBmcm9tIHRoZSBsaXN0LCBhbmQgYSBjYWxsYmFjayBmb3Igd2hlblxuICAgICAqIGl0IGhhcyBmaW5pc2hlZC4gSWYgdGhlIGBpdGVyYXRlZWAgcGFzc2VzIGFuIGVycm9yIHRvIGl0cyBgY2FsbGJhY2tgLCB0aGVcbiAgICAgKiBtYWluIGBjYWxsYmFja2AgKGZvciB0aGUgYGVhY2hgIGZ1bmN0aW9uKSBpcyBpbW1lZGlhdGVseSBjYWxsZWQgd2l0aCB0aGVcbiAgICAgKiBlcnJvci5cbiAgICAgKlxuICAgICAqIE5vdGUsIHRoYXQgc2luY2UgdGhpcyBmdW5jdGlvbiBhcHBsaWVzIGBpdGVyYXRlZWAgdG8gZWFjaCBpdGVtIGluIHBhcmFsbGVsLFxuICAgICAqIHRoZXJlIGlzIG5vIGd1YXJhbnRlZSB0aGF0IHRoZSBpdGVyYXRlZSBmdW5jdGlvbnMgd2lsbCBjb21wbGV0ZSBpbiBvcmRlci5cbiAgICAgKlxuICAgICAqIEBuYW1lIGVhY2hcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGFsaWFzIGZvckVhY2hcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCBpdGVtXG4gICAgICogaW4gYGNvbGxgLiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVycilgIHdoaWNoIG11c3QgYmUgY2FsbGVkIG9uY2VcbiAgICAgKiBpdCBoYXMgY29tcGxldGVkLiBJZiBubyBlcnJvciBoYXMgb2NjdXJyZWQsIHRoZSBgY2FsbGJhY2tgIHNob3VsZCBiZSBydW5cbiAgICAgKiB3aXRob3V0IGFyZ3VtZW50cyBvciB3aXRoIGFuIGV4cGxpY2l0IGBudWxsYCBhcmd1bWVudC4gVGhlIGFycmF5IGluZGV4IGlzIG5vdFxuICAgICAqIHBhc3NlZCB0byB0aGUgaXRlcmF0ZWUuIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLiBJZiB5b3UgbmVlZCB0aGUgaW5kZXgsXG4gICAgICogdXNlIGBlYWNoT2ZgLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIGFsbFxuICAgICAqIGBpdGVyYXRlZWAgZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQsIG9yIGFuIGVycm9yIG9jY3Vycy4gSW52b2tlZCB3aXRoIChlcnIpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAvLyBhc3N1bWluZyBvcGVuRmlsZXMgaXMgYW4gYXJyYXkgb2YgZmlsZSBuYW1lcyBhbmQgc2F2ZUZpbGUgaXMgYSBmdW5jdGlvblxuICAgICAqIC8vIHRvIHNhdmUgdGhlIG1vZGlmaWVkIGNvbnRlbnRzIG9mIHRoYXQgZmlsZTpcbiAgICAgKlxuICAgICAqIGFzeW5jLmVhY2gob3BlbkZpbGVzLCBzYXZlRmlsZSwgZnVuY3Rpb24oZXJyKXtcbiAgICAgKiAgIC8vIGlmIGFueSBvZiB0aGUgc2F2ZXMgcHJvZHVjZWQgYW4gZXJyb3IsIGVyciB3b3VsZCBlcXVhbCB0aGF0IGVycm9yXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiAvLyBhc3N1bWluZyBvcGVuRmlsZXMgaXMgYW4gYXJyYXkgb2YgZmlsZSBuYW1lc1xuICAgICAqIGFzeW5jLmVhY2gob3BlbkZpbGVzLCBmdW5jdGlvbihmaWxlLCBjYWxsYmFjaykge1xuICAgICAqXG4gICAgICogICAgIC8vIFBlcmZvcm0gb3BlcmF0aW9uIG9uIGZpbGUgaGVyZS5cbiAgICAgKiAgICAgY29uc29sZS5sb2coJ1Byb2Nlc3NpbmcgZmlsZSAnICsgZmlsZSk7XG4gICAgICpcbiAgICAgKiAgICAgaWYoIGZpbGUubGVuZ3RoID4gMzIgKSB7XG4gICAgICogICAgICAgY29uc29sZS5sb2coJ1RoaXMgZmlsZSBuYW1lIGlzIHRvbyBsb25nJyk7XG4gICAgICogICAgICAgY2FsbGJhY2soJ0ZpbGUgbmFtZSB0b28gbG9uZycpO1xuICAgICAqICAgICB9IGVsc2Uge1xuICAgICAqICAgICAgIC8vIERvIHdvcmsgdG8gcHJvY2VzcyBmaWxlIGhlcmVcbiAgICAgKiAgICAgICBjb25zb2xlLmxvZygnRmlsZSBwcm9jZXNzZWQnKTtcbiAgICAgKiAgICAgICBjYWxsYmFjaygpO1xuICAgICAqICAgICB9XG4gICAgICogfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICogICAgIC8vIGlmIGFueSBvZiB0aGUgZmlsZSBwcm9jZXNzaW5nIHByb2R1Y2VkIGFuIGVycm9yLCBlcnIgd291bGQgZXF1YWwgdGhhdCBlcnJvclxuICAgICAqICAgICBpZiggZXJyICkge1xuICAgICAqICAgICAgIC8vIE9uZSBvZiB0aGUgaXRlcmF0aW9ucyBwcm9kdWNlZCBhbiBlcnJvci5cbiAgICAgKiAgICAgICAvLyBBbGwgcHJvY2Vzc2luZyB3aWxsIG5vdyBzdG9wLlxuICAgICAqICAgICAgIGNvbnNvbGUubG9nKCdBIGZpbGUgZmFpbGVkIHRvIHByb2Nlc3MnKTtcbiAgICAgKiAgICAgfSBlbHNlIHtcbiAgICAgKiAgICAgICBjb25zb2xlLmxvZygnQWxsIGZpbGVzIGhhdmUgYmVlbiBwcm9jZXNzZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgICogICAgIH1cbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICB2YXIgZWFjaCA9IGRvTGltaXQoZWFjaExpbWl0LCBJbmZpbml0eSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2FtZSBhcyBgZWFjaGAgYnV0IHJ1bnMgb25seSBhIHNpbmdsZSBhc3luYyBvcGVyYXRpb24gYXQgYSB0aW1lLlxuICAgICAqXG4gICAgICogQG5hbWUgZWFjaFNlcmllc1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLmVhY2hcbiAgICAgKiBAYWxpYXMgZm9yRWFjaFNlcmllc1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSBmdW5jdGlvbiB0byBhcHBseSB0byBlYWNoXG4gICAgICogaXRlbSBpbiBgY29sbGAuIFRoZSBpdGVyYXRlZSBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyKWAgd2hpY2ggbXVzdCBiZSBjYWxsZWRcbiAgICAgKiBvbmNlIGl0IGhhcyBjb21wbGV0ZWQuIElmIG5vIGVycm9yIGhhcyBvY2N1cnJlZCwgdGhlIGBjYWxsYmFja2Agc2hvdWxkIGJlIHJ1blxuICAgICAqIHdpdGhvdXQgYXJndW1lbnRzIG9yIHdpdGggYW4gZXhwbGljaXQgYG51bGxgIGFyZ3VtZW50LiBUaGUgYXJyYXkgaW5kZXggaXNcbiAgICAgKiBub3QgcGFzc2VkIHRvIHRoZSBpdGVyYXRlZS4gSW52b2tlZCB3aXRoIChpdGVtLCBjYWxsYmFjaykuIElmIHlvdSBuZWVkIHRoZVxuICAgICAqIGluZGV4LCB1c2UgYGVhY2hPZlNlcmllc2AuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gYWxsXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZCwgb3IgYW4gZXJyb3Igb2NjdXJzLiBJbnZva2VkIHdpdGggKGVycikuXG4gICAgICovXG4gICAgdmFyIGVhY2hTZXJpZXMgPSBkb0xpbWl0KGVhY2hMaW1pdCwgMSk7XG5cbiAgICAvKipcbiAgICAgKiBXcmFwIGFuIGFzeW5jIGZ1bmN0aW9uIGFuZCBlbnN1cmUgaXQgY2FsbHMgaXRzIGNhbGxiYWNrIG9uIGEgbGF0ZXIgdGljayBvZlxuICAgICAqIHRoZSBldmVudCBsb29wLiAgSWYgdGhlIGZ1bmN0aW9uIGFscmVhZHkgY2FsbHMgaXRzIGNhbGxiYWNrIG9uIGEgbmV4dCB0aWNrLFxuICAgICAqIG5vIGV4dHJhIGRlZmVycmFsIGlzIGFkZGVkLiBUaGlzIGlzIHVzZWZ1bCBmb3IgcHJldmVudGluZyBzdGFjayBvdmVyZmxvd3NcbiAgICAgKiAoYFJhbmdlRXJyb3I6IE1heGltdW0gY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkYCkgYW5kIGdlbmVyYWxseSBrZWVwaW5nXG4gICAgICogW1phbGdvXShodHRwOi8vYmxvZy5penMubWUvcG9zdC81OTE0Mjc0MjE0My9kZXNpZ25pbmctYXBpcy1mb3ItYXN5bmNocm9ueSlcbiAgICAgKiBjb250YWluZWQuXG4gICAgICpcbiAgICAgKiBAbmFtZSBlbnN1cmVBc3luY1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAY2F0ZWdvcnkgVXRpbFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIC0gYW4gYXN5bmMgZnVuY3Rpb24sIG9uZSB0aGF0IGV4cGVjdHMgYSBub2RlLXN0eWxlXG4gICAgICogY2FsbGJhY2sgYXMgaXRzIGxhc3QgYXJndW1lbnQuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGEgd3JhcHBlZCBmdW5jdGlvbiB3aXRoIHRoZSBleGFjdCBzYW1lIGNhbGxcbiAgICAgKiBzaWduYXR1cmUgYXMgdGhlIGZ1bmN0aW9uIHBhc3NlZCBpbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogZnVuY3Rpb24gc29tZXRpbWVzQXN5bmMoYXJnLCBjYWxsYmFjaykge1xuICAgICAqICAgICBpZiAoY2FjaGVbYXJnXSkge1xuICAgICAqICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIGNhY2hlW2FyZ10pOyAvLyB0aGlzIHdvdWxkIGJlIHN5bmNocm9ub3VzISFcbiAgICAgKiAgICAgfSBlbHNlIHtcbiAgICAgKiAgICAgICAgIGRvU29tZUlPKGFyZywgY2FsbGJhY2spOyAvLyB0aGlzIElPIHdvdWxkIGJlIGFzeW5jaHJvbm91c1xuICAgICAqICAgICB9XG4gICAgICogfVxuICAgICAqXG4gICAgICogLy8gdGhpcyBoYXMgYSByaXNrIG9mIHN0YWNrIG92ZXJmbG93cyBpZiBtYW55IHJlc3VsdHMgYXJlIGNhY2hlZCBpbiBhIHJvd1xuICAgICAqIGFzeW5jLm1hcFNlcmllcyhhcmdzLCBzb21ldGltZXNBc3luYywgZG9uZSk7XG4gICAgICpcbiAgICAgKiAvLyB0aGlzIHdpbGwgZGVmZXIgc29tZXRpbWVzQXN5bmMncyBjYWxsYmFjayBpZiBuZWNlc3NhcnksXG4gICAgICogLy8gcHJldmVudGluZyBzdGFjayBvdmVyZmxvd3NcbiAgICAgKiBhc3luYy5tYXBTZXJpZXMoYXJncywgYXN5bmMuZW5zdXJlQXN5bmMoc29tZXRpbWVzQXN5bmMpLCBkb25lKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBlbnN1cmVBc3luYyhmbikge1xuICAgICAgICByZXR1cm4gaW5pdGlhbFBhcmFtcyhmdW5jdGlvbiAoYXJncywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUkMShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBpbm5lckFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICBzeW5jID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vdElkKHYpIHtcbiAgICAgICAgcmV0dXJuICF2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBzYW1lIGFzIGBldmVyeWAgYnV0IHJ1bnMgYSBtYXhpbXVtIG9mIGBsaW1pdGAgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSBldmVyeUxpbWl0XG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBzZWUgYXN5bmMuZXZlcnlcbiAgICAgKiBAYWxpYXMgYWxsTGltaXRcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXQgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBBIHRydXRoIHRlc3QgdG8gYXBwbHkgdG8gZWFjaCBpdGVtIGluIHRoZVxuICAgICAqIGNvbGxlY3Rpb24gaW4gcGFyYWxsZWwuIFRoZSBpdGVyYXRlZSBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyLCB0cnV0aFZhbHVlKWBcbiAgICAgKiB3aGljaCBtdXN0IGJlIGNhbGxlZCB3aXRoIGEgIGJvb2xlYW4gYXJndW1lbnQgb25jZSBpdCBoYXMgY29tcGxldGVkLiBJbnZva2VkXG4gICAgICogd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciBhbGwgdGhlXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZC4gUmVzdWx0IHdpbGwgYmUgZWl0aGVyIGB0cnVlYCBvciBgZmFsc2VgXG4gICAgICogZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZXMgb2YgdGhlIGFzeW5jIHRlc3RzLiBJbnZva2VkIHdpdGggKGVyciwgcmVzdWx0KS5cbiAgICAgKi9cbiAgICB2YXIgZXZlcnlMaW1pdCA9IF9jcmVhdGVUZXN0ZXIoZWFjaE9mTGltaXQsIG5vdElkLCBub3RJZCk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBldmVyeSBlbGVtZW50IGluIGBjb2xsYCBzYXRpc2ZpZXMgYW4gYXN5bmMgdGVzdC4gSWYgYW55XG4gICAgICogaXRlcmF0ZWUgY2FsbCByZXR1cm5zIGBmYWxzZWAsIHRoZSBtYWluIGBjYWxsYmFja2AgaXMgaW1tZWRpYXRlbHkgY2FsbGVkLlxuICAgICAqXG4gICAgICogQG5hbWUgZXZlcnlcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGFsaWFzIGFsbFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSB0cnV0aCB0ZXN0IHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBpbiB0aGVcbiAgICAgKiBjb2xsZWN0aW9uIGluIHBhcmFsbGVsLiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJ1dGhWYWx1ZSlgXG4gICAgICogd2hpY2ggbXVzdCBiZSBjYWxsZWQgd2l0aCBhICBib29sZWFuIGFyZ3VtZW50IG9uY2UgaXQgaGFzIGNvbXBsZXRlZC4gSW52b2tlZFxuICAgICAqIHdpdGggKGl0ZW0sIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgYWZ0ZXIgYWxsIHRoZVxuICAgICAqIGBpdGVyYXRlZWAgZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQuIFJlc3VsdCB3aWxsIGJlIGVpdGhlciBgdHJ1ZWAgb3IgYGZhbHNlYFxuICAgICAqIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVzIG9mIHRoZSBhc3luYyB0ZXN0cy4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdCkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGFzeW5jLmV2ZXJ5KFsnZmlsZTEnLCdmaWxlMicsJ2ZpbGUzJ10sIGZ1bmN0aW9uKGZpbGVQYXRoLCBjYWxsYmFjaykge1xuICAgICAqICAgICBmcy5hY2Nlc3MoZmlsZVBhdGgsIGZ1bmN0aW9uKGVycikge1xuICAgICAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgIWVycilcbiAgICAgKiAgICAgfSk7XG4gICAgICogfSwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgKiAgICAgLy8gaWYgcmVzdWx0IGlzIHRydWUgdGhlbiBldmVyeSBmaWxlIGV4aXN0c1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHZhciBldmVyeSA9IGRvTGltaXQoZXZlcnlMaW1pdCwgSW5maW5pdHkpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNhbWUgYXMgYGV2ZXJ5YCBidXQgcnVucyBvbmx5IGEgc2luZ2xlIGFzeW5jIG9wZXJhdGlvbiBhdCBhIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSBldmVyeVNlcmllc1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLmV2ZXJ5XG4gICAgICogQGFsaWFzIGFsbFNlcmllc1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSB0cnV0aCB0ZXN0IHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBpbiB0aGVcbiAgICAgKiBjb2xsZWN0aW9uIGluIHBhcmFsbGVsLiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJ1dGhWYWx1ZSlgXG4gICAgICogd2hpY2ggbXVzdCBiZSBjYWxsZWQgd2l0aCBhICBib29sZWFuIGFyZ3VtZW50IG9uY2UgaXQgaGFzIGNvbXBsZXRlZC4gSW52b2tlZFxuICAgICAqIHdpdGggKGl0ZW0sIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgYWZ0ZXIgYWxsIHRoZVxuICAgICAqIGBpdGVyYXRlZWAgZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQuIFJlc3VsdCB3aWxsIGJlIGVpdGhlciBgdHJ1ZWAgb3IgYGZhbHNlYFxuICAgICAqIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVzIG9mIHRoZSBhc3luYyB0ZXN0cy4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdCkuXG4gICAgICovXG4gICAgdmFyIGV2ZXJ5U2VyaWVzID0gZG9MaW1pdChldmVyeUxpbWl0LCAxKTtcblxuICAgIGZ1bmN0aW9uIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGl0ZXJhdGVlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRlZSh4LCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goeyBpbmRleDogaW5kZXgsIHZhbHVlOiB4IH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBhcnJheU1hcChyZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGEuaW5kZXggLSBiLmluZGV4O1xuICAgICAgICAgICAgICAgIH0pLCBiYXNlUHJvcGVydHkoJ3ZhbHVlJykpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHNhbWUgYXMgYGZpbHRlcmAgYnV0IHJ1bnMgYSBtYXhpbXVtIG9mIGBsaW1pdGAgYXN5bmMgb3BlcmF0aW9ucyBhdCBhXG4gICAgICogdGltZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIGZpbHRlckxpbWl0XG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBzZWUgYXN5bmMuZmlsdGVyXG4gICAgICogQGFsaWFzIHNlbGVjdExpbWl0XG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbCAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGFzeW5jIG9wZXJhdGlvbnMgYXQgYSB0aW1lLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSB0cnV0aCB0ZXN0IHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBpbiBgY29sbGAuXG4gICAgICogVGhlIGBpdGVyYXRlZWAgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJ1dGhWYWx1ZSlgLCB3aGljaCBtdXN0IGJlIGNhbGxlZFxuICAgICAqIHdpdGggYSBib29sZWFuIGFyZ3VtZW50IG9uY2UgaXQgaGFzIGNvbXBsZXRlZC4gSW52b2tlZCB3aXRoIChpdGVtLCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIGFmdGVyIGFsbCB0aGVcbiAgICAgKiBgaXRlcmF0ZWVgIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLiBJbnZva2VkIHdpdGggKGVyciwgcmVzdWx0cykuXG4gICAgICovXG4gICAgdmFyIGZpbHRlckxpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9maWx0ZXIpO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIG5ldyBhcnJheSBvZiBhbGwgdGhlIHZhbHVlcyBpbiBgY29sbGAgd2hpY2ggcGFzcyBhbiBhc3luYyB0cnV0aFxuICAgICAqIHRlc3QuIFRoaXMgb3BlcmF0aW9uIGlzIHBlcmZvcm1lZCBpbiBwYXJhbGxlbCwgYnV0IHRoZSByZXN1bHRzIGFycmF5IHdpbGwgYmVcbiAgICAgKiBpbiB0aGUgc2FtZSBvcmRlciBhcyB0aGUgb3JpZ2luYWwuXG4gICAgICpcbiAgICAgKiBAbmFtZSBmaWx0ZXJcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGFsaWFzIHNlbGVjdFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSB0cnV0aCB0ZXN0IHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBpbiBgY29sbGAuXG4gICAgICogVGhlIGBpdGVyYXRlZWAgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJ1dGhWYWx1ZSlgLCB3aGljaCBtdXN0IGJlIGNhbGxlZFxuICAgICAqIHdpdGggYSBib29sZWFuIGFyZ3VtZW50IG9uY2UgaXQgaGFzIGNvbXBsZXRlZC4gSW52b2tlZCB3aXRoIChpdGVtLCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIGFmdGVyIGFsbCB0aGVcbiAgICAgKiBgaXRlcmF0ZWVgIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLiBJbnZva2VkIHdpdGggKGVyciwgcmVzdWx0cykuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGFzeW5jLmZpbHRlcihbJ2ZpbGUxJywnZmlsZTInLCdmaWxlMyddLCBmdW5jdGlvbihmaWxlUGF0aCwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgZnMuYWNjZXNzKGZpbGVQYXRoLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICFlcnIpXG4gICAgICogICAgIH0pO1xuICAgICAqIH0sIGZ1bmN0aW9uKGVyciwgcmVzdWx0cykge1xuICAgICAqICAgICAvLyByZXN1bHRzIG5vdyBlcXVhbHMgYW4gYXJyYXkgb2YgdGhlIGV4aXN0aW5nIGZpbGVzXG4gICAgICogfSk7XG4gICAgICovXG4gICAgdmFyIGZpbHRlciA9IGRvTGltaXQoZmlsdGVyTGltaXQsIEluZmluaXR5KTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzYW1lIGFzIGBmaWx0ZXJgIGJ1dCBydW5zIG9ubHkgYSBzaW5nbGUgYXN5bmMgb3BlcmF0aW9uIGF0IGEgdGltZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIGZpbHRlclNlcmllc1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLmZpbHRlclxuICAgICAqIEBhbGlhcyBzZWxlY3RTZXJpZXNcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgdHJ1dGggdGVzdCB0byBhcHBseSB0byBlYWNoIGl0ZW0gaW4gYGNvbGxgLlxuICAgICAqIFRoZSBgaXRlcmF0ZWVgIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHRydXRoVmFsdWUpYCwgd2hpY2ggbXVzdCBiZSBjYWxsZWRcbiAgICAgKiB3aXRoIGEgYm9vbGVhbiBhcmd1bWVudCBvbmNlIGl0IGhhcyBjb21wbGV0ZWQuIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciBhbGwgdGhlXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZC4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdHMpXG4gICAgICovXG4gICAgdmFyIGZpbHRlclNlcmllcyA9IGRvTGltaXQoZmlsdGVyTGltaXQsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQ2FsbHMgdGhlIGFzeW5jaHJvbm91cyBmdW5jdGlvbiBgZm5gIHdpdGggYSBjYWxsYmFjayBwYXJhbWV0ZXIgdGhhdCBhbGxvd3MgaXRcbiAgICAgKiB0byBjYWxsIGl0c2VsZiBhZ2FpbiwgaW4gc2VyaWVzLCBpbmRlZmluaXRlbHkuXG5cbiAgICAgKiBJZiBhbiBlcnJvciBpcyBwYXNzZWQgdG8gdGhlXG4gICAgICogY2FsbGJhY2sgdGhlbiBgZXJyYmFja2AgaXMgY2FsbGVkIHdpdGggdGhlIGVycm9yLCBhbmQgZXhlY3V0aW9uIHN0b3BzLFxuICAgICAqIG90aGVyd2lzZSBpdCB3aWxsIG5ldmVyIGJlIGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEBuYW1lIGZvcmV2ZXJcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIC0gYSBmdW5jdGlvbiB0byBjYWxsIHJlcGVhdGVkbHkuIEludm9rZWQgd2l0aCAobmV4dCkuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2VycmJhY2tdIC0gd2hlbiBgZm5gIHBhc3NlcyBhbiBlcnJvciB0byBpdCdzIGNhbGxiYWNrLFxuICAgICAqIHRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQsIGFuZCBleGVjdXRpb24gc3RvcHMuIEludm9rZWQgd2l0aCAoZXJyKS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYXN5bmMuZm9yZXZlcihcbiAgICAgKiAgICAgZnVuY3Rpb24obmV4dCkge1xuICAgICAqICAgICAgICAgLy8gbmV4dCBpcyBzdWl0YWJsZSBmb3IgcGFzc2luZyB0byB0aGluZ3MgdGhhdCBuZWVkIGEgY2FsbGJhY2soZXJyIFssIHdoYXRldmVyXSk7XG4gICAgICogICAgICAgICAvLyBpdCB3aWxsIHJlc3VsdCBpbiB0aGlzIGZ1bmN0aW9uIGJlaW5nIGNhbGxlZCBhZ2Fpbi5cbiAgICAgKiAgICAgfSxcbiAgICAgKiAgICAgZnVuY3Rpb24oZXJyKSB7XG4gICAgICogICAgICAgICAvLyBpZiBuZXh0IGlzIGNhbGxlZCB3aXRoIGEgdmFsdWUgaW4gaXRzIGZpcnN0IHBhcmFtZXRlciwgaXQgd2lsbCBhcHBlYXJcbiAgICAgKiAgICAgICAgIC8vIGluIGhlcmUgYXMgJ2VycicsIGFuZCBleGVjdXRpb24gd2lsbCBzdG9wLlxuICAgICAqICAgICB9XG4gICAgICogKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmb3JldmVyKGZuLCBjYikge1xuICAgICAgICB2YXIgZG9uZSA9IG9ubHlPbmNlKGNiIHx8IG5vb3ApO1xuICAgICAgICB2YXIgdGFzayA9IGVuc3VyZUFzeW5jKGZuKTtcblxuICAgICAgICBmdW5jdGlvbiBuZXh0KGVycikge1xuICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIHRhc2sobmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gaXRlcmF0b3IgZnVuY3Rpb24gd2hpY2ggY2FsbHMgdGhlIG5leHQgZnVuY3Rpb24gaW4gdGhlIGB0YXNrc2BcbiAgICAgKiBhcnJheSwgcmV0dXJuaW5nIGEgY29udGludWF0aW9uIHRvIGNhbGwgdGhlIG5leHQgb25lIGFmdGVyIHRoYXQuIEl0J3MgYWxzb1xuICAgICAqIHBvc3NpYmxlIHRvIOKAnHBlZWvigJ0gYXQgdGhlIG5leHQgaXRlcmF0b3Igd2l0aCBgaXRlcmF0b3IubmV4dCgpYC5cbiAgICAgKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBpbnRlcm5hbGx5IGJ5IHRoZSBgYXN5bmNgIG1vZHVsZSwgYnV0IGNhbiBiZSB1c2VmdWxcbiAgICAgKiB3aGVuIHlvdSB3YW50IHRvIG1hbnVhbGx5IGNvbnRyb2wgdGhlIGZsb3cgb2YgZnVuY3Rpb25zIGluIHNlcmllcy5cbiAgICAgKlxuICAgICAqIEBuYW1lIGl0ZXJhdG9yXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB0YXNrcyAtIEFuIGFycmF5IG9mIGZ1bmN0aW9ucyB0byBydW4uXG4gICAgICogQHJldHVybnMgVGhlIG5leHQgZnVuY3Rpb24gdG8gcnVuIGluIHRoZSBzZXJpZXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBpdGVyYXRvciA9IGFzeW5jLml0ZXJhdG9yKFtcbiAgICAgKiAgICAgZnVuY3Rpb24oKSB7IHN5cy5wKCdvbmUnKTsgfSxcbiAgICAgKiAgICAgZnVuY3Rpb24oKSB7IHN5cy5wKCd0d28nKTsgfSxcbiAgICAgKiAgICAgZnVuY3Rpb24oKSB7IHN5cy5wKCd0aHJlZScpOyB9XG4gICAgICogXSk7XG4gICAgICpcbiAgICAgKiBub2RlPiB2YXIgaXRlcmF0b3IyID0gaXRlcmF0b3IoKTtcbiAgICAgKiAnb25lJ1xuICAgICAqIG5vZGU+IHZhciBpdGVyYXRvcjMgPSBpdGVyYXRvcjIoKTtcbiAgICAgKiAndHdvJ1xuICAgICAqIG5vZGU+IGl0ZXJhdG9yMygpO1xuICAgICAqICd0aHJlZSdcbiAgICAgKiBub2RlPiB2YXIgbmV4dGZuID0gaXRlcmF0b3IyLm5leHQoKTtcbiAgICAgKiBub2RlPiBuZXh0Zm4oKTtcbiAgICAgKiAndGhyZWUnXG4gICAgICovXG4gICAgZnVuY3Rpb24gaXRlcmF0b3IkMSAodGFza3MpIHtcbiAgICAgICAgZnVuY3Rpb24gbWFrZUNhbGxiYWNrKGluZGV4KSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBmbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tzW2luZGV4XS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZm4ubmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4ubmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggPCB0YXNrcy5sZW5ndGggLSAxID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSkgOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFrZUNhbGxiYWNrKDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIExvZ3MgdGhlIHJlc3VsdCBvZiBhbiBgYXN5bmNgIGZ1bmN0aW9uIHRvIHRoZSBgY29uc29sZWAuIE9ubHkgd29ya3MgaW5cbiAgICAgKiBOb2RlLmpzIG9yIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBgY29uc29sZS5sb2dgIGFuZCBgY29uc29sZS5lcnJvcmAgKHN1Y2hcbiAgICAgKiBhcyBGRiBhbmQgQ2hyb21lKS4gSWYgbXVsdGlwbGUgYXJndW1lbnRzIGFyZSByZXR1cm5lZCBmcm9tIHRoZSBhc3luY1xuICAgICAqIGZ1bmN0aW9uLCBgY29uc29sZS5sb2dgIGlzIGNhbGxlZCBvbiBlYWNoIGFyZ3VtZW50IGluIG9yZGVyLlxuICAgICAqXG4gICAgICogQG5hbWUgbG9nXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBVdGlsXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY3Rpb24gLSBUaGUgZnVuY3Rpb24geW91IHdhbnQgdG8gZXZlbnR1YWxseSBhcHBseSBhbGxcbiAgICAgKiBhcmd1bWVudHMgdG8uXG4gICAgICogQHBhcmFtIHsuLi4qfSBhcmd1bWVudHMuLi4gLSBBbnkgbnVtYmVyIG9mIGFyZ3VtZW50cyB0byBhcHBseSB0byB0aGUgZnVuY3Rpb24uXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGluIGEgbW9kdWxlXG4gICAgICogdmFyIGhlbGxvID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICdoZWxsbyAnICsgbmFtZSk7XG4gICAgICogICAgIH0sIDEwMDApO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyBpbiB0aGUgbm9kZSByZXBsXG4gICAgICogbm9kZT4gYXN5bmMubG9nKGhlbGxvLCAnd29ybGQnKTtcbiAgICAgKiAnaGVsbG8gd29ybGQnXG4gICAgICovXG4gICAgdmFyIGxvZyA9IGNvbnNvbGVGdW5jKCdsb2cnKTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzYW1lIGFzIGBtYXBWYWx1ZXNgIGJ1dCBydW5zIGEgbWF4aW11bSBvZiBgbGltaXRgIGFzeW5jIG9wZXJhdGlvbnMgYXQgYVxuICAgICAqIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSBtYXBWYWx1ZXNMaW1pdFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLm1hcFZhbHVlc1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGFzeW5jIG9wZXJhdGlvbnMgYXQgYSB0aW1lLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSBmdW5jdGlvbiB0byBhcHBseSB0byBlYWNoIHZhbHVlIGluIGBvYmpgLlxuICAgICAqIFRoZSBpdGVyYXRlZSBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyLCB0cmFuc2Zvcm1lZClgIHdoaWNoIG11c3QgYmUgY2FsbGVkXG4gICAgICogb25jZSBpdCBoYXMgY29tcGxldGVkIHdpdGggYW4gZXJyb3IgKHdoaWNoIGNhbiBiZSBgbnVsbGApIGFuZCBhXG4gICAgICogdHJhbnNmb3JtZWQgdmFsdWUuIEludm9rZWQgd2l0aCAodmFsdWUsIGtleSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIGFsbCBgaXRlcmF0ZWVgXG4gICAgICogZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQsIG9yIGFuIGVycm9yIG9jY3Vycy4gUmVzdWx0IGlzIGFuIG9iamVjdCBvZiB0aGVcbiAgICAgKiB0cmFuc2Zvcm1lZCB2YWx1ZXMgZnJvbSB0aGUgYG9iamAuIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHQpLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIG1hcFZhbHVlc0xpbWl0KG9iaiwgbGltaXQsIGl0ZXJhdGVlLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgbmV3T2JqID0ge307XG4gICAgICAgIGVhY2hPZkxpbWl0KG9iaiwgbGltaXQsIGZ1bmN0aW9uICh2YWwsIGtleSwgbmV4dCkge1xuICAgICAgICAgICAgaXRlcmF0ZWUodmFsLCBrZXksIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHJldHVybiBuZXh0KGVycik7XG4gICAgICAgICAgICAgICAgbmV3T2JqW2tleV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbmV3T2JqKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSByZWxhdGl2ZSBvZiBgbWFwYCwgZGVzaWduZWQgZm9yIHVzZSB3aXRoIG9iamVjdHMuXG4gICAgICpcbiAgICAgKiBQcm9kdWNlcyBhIG5ldyBPYmplY3QgYnkgbWFwcGluZyBlYWNoIHZhbHVlIG9mIGBvYmpgIHRocm91Z2ggdGhlIGBpdGVyYXRlZWBcbiAgICAgKiBmdW5jdGlvbi4gVGhlIGBpdGVyYXRlZWAgaXMgY2FsbGVkIGVhY2ggYHZhbHVlYCBhbmQgYGtleWAgZnJvbSBgb2JqYCBhbmQgYVxuICAgICAqIGNhbGxiYWNrIGZvciB3aGVuIGl0IGhhcyBmaW5pc2hlZCBwcm9jZXNzaW5nLiBFYWNoIG9mIHRoZXNlIGNhbGxiYWNrcyB0YWtlc1xuICAgICAqIHR3byBhcmd1bWVudHM6IGFuIGBlcnJvcmAsIGFuZCB0aGUgdHJhbnNmb3JtZWQgaXRlbSBmcm9tIGBvYmpgLiBJZiBgaXRlcmF0ZWVgXG4gICAgICogcGFzc2VzIGFuIGVycm9yIHRvIGl0cyBjYWxsYmFjaywgdGhlIG1haW4gYGNhbGxiYWNrYCAoZm9yIHRoZSBgbWFwVmFsdWVzYFxuICAgICAqIGZ1bmN0aW9uKSBpcyBpbW1lZGlhdGVseSBjYWxsZWQgd2l0aCB0aGUgZXJyb3IuXG4gICAgICpcbiAgICAgKiBOb3RlLCB0aGUgb3JkZXIgb2YgdGhlIGtleXMgaW4gdGhlIHJlc3VsdCBpcyBub3QgZ3VhcmFudGVlZC4gIFRoZSBrZXlzIHdpbGxcbiAgICAgKiBiZSByb3VnaGx5IGluIHRoZSBvcmRlciB0aGV5IGNvbXBsZXRlLCAoYnV0IHRoaXMgaXMgdmVyeSBlbmdpbmUtc3BlY2lmaWMpXG4gICAgICpcbiAgICAgKiBAbmFtZSBtYXBWYWx1ZXNcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb2JqIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgZnVuY3Rpb24gdG8gYXBwbHkgdG8gZWFjaCB2YWx1ZSBhbmQga2V5IGluXG4gICAgICogYGNvbGxgLiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJhbnNmb3JtZWQpYCB3aGljaCBtdXN0IGJlXG4gICAgICogY2FsbGVkIG9uY2UgaXQgaGFzIGNvbXBsZXRlZCB3aXRoIGFuIGVycm9yICh3aGljaCBjYW4gYmUgYG51bGxgKSBhbmQgYVxuICAgICAqIHRyYW5zZm9ybWVkIHZhbHVlLiBJbnZva2VkIHdpdGggKHZhbHVlLCBrZXksIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiBhbGwgYGl0ZXJhdGVlYFxuICAgICAqIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLCBvciBhbiBlcnJvciBvY2N1cnMuIFJlc3VsdHMgaXMgYW4gYXJyYXkgb2YgdGhlXG4gICAgICogdHJhbnNmb3JtZWQgaXRlbXMgZnJvbSB0aGUgYG9iamAuIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHQpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBhc3luYy5tYXBWYWx1ZXMoe1xuICAgICAqICAgICBmMTogJ2ZpbGUxJyxcbiAgICAgKiAgICAgZjI6ICdmaWxlMicsXG4gICAgICogICAgIGYzOiAnZmlsZTMnXG4gICAgICogfSwgZnMuc3RhdCwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgKiAgICAgLy8gcmVzdWx0cyBpcyBub3cgYSBtYXAgb2Ygc3RhdHMgZm9yIGVhY2ggZmlsZSwgZS5nLlxuICAgICAqICAgICAvLyB7XG4gICAgICogICAgIC8vICAgICBmMTogW3N0YXRzIGZvciBmaWxlMV0sXG4gICAgICogICAgIC8vICAgICBmMjogW3N0YXRzIGZvciBmaWxlMl0sXG4gICAgICogICAgIC8vICAgICBmMzogW3N0YXRzIGZvciBmaWxlM11cbiAgICAgKiAgICAgLy8gfVxuICAgICAqIH0pO1xuICAgICAqL1xuXG4gICAgdmFyIG1hcFZhbHVlcyA9IGRvTGltaXQobWFwVmFsdWVzTGltaXQsIEluZmluaXR5KTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzYW1lIGFzIGBtYXBWYWx1ZXNgIGJ1dCBydW5zIG9ubHkgYSBzaW5nbGUgYXN5bmMgb3BlcmF0aW9uIGF0IGEgdGltZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIG1hcFZhbHVlc1Nlcmllc1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLm1hcFZhbHVlc1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBBIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIGVhY2ggdmFsdWUgaW4gYG9iamAuXG4gICAgICogVGhlIGl0ZXJhdGVlIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHRyYW5zZm9ybWVkKWAgd2hpY2ggbXVzdCBiZSBjYWxsZWRcbiAgICAgKiBvbmNlIGl0IGhhcyBjb21wbGV0ZWQgd2l0aCBhbiBlcnJvciAod2hpY2ggY2FuIGJlIGBudWxsYCkgYW5kIGFcbiAgICAgKiB0cmFuc2Zvcm1lZCB2YWx1ZS4gSW52b2tlZCB3aXRoICh2YWx1ZSwga2V5LCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gYWxsIGBpdGVyYXRlZWBcbiAgICAgKiBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZCwgb3IgYW4gZXJyb3Igb2NjdXJzLiBSZXN1bHQgaXMgYW4gb2JqZWN0IG9mIHRoZVxuICAgICAqIHRyYW5zZm9ybWVkIHZhbHVlcyBmcm9tIHRoZSBgb2JqYC4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdCkuXG4gICAgICovXG4gICAgdmFyIG1hcFZhbHVlc1NlcmllcyA9IGRvTGltaXQobWFwVmFsdWVzTGltaXQsIDEpO1xuXG4gICAgZnVuY3Rpb24gaGFzKG9iaiwga2V5KSB7XG4gICAgICAgIHJldHVybiBrZXkgaW4gb2JqO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhY2hlcyB0aGUgcmVzdWx0cyBvZiBhbiBgYXN5bmNgIGZ1bmN0aW9uLiBXaGVuIGNyZWF0aW5nIGEgaGFzaCB0byBzdG9yZVxuICAgICAqIGZ1bmN0aW9uIHJlc3VsdHMgYWdhaW5zdCwgdGhlIGNhbGxiYWNrIGlzIG9taXR0ZWQgZnJvbSB0aGUgaGFzaCBhbmQgYW5cbiAgICAgKiBvcHRpb25hbCBoYXNoIGZ1bmN0aW9uIGNhbiBiZSB1c2VkLlxuICAgICAqXG4gICAgICogSWYgbm8gaGFzaCBmdW5jdGlvbiBpcyBzcGVjaWZpZWQsIHRoZSBmaXJzdCBhcmd1bWVudCBpcyB1c2VkIGFzIGEgaGFzaCBrZXksXG4gICAgICogd2hpY2ggbWF5IHdvcmsgcmVhc29uYWJseSBpZiBpdCBpcyBhIHN0cmluZyBvciBhIGRhdGEgdHlwZSB0aGF0IGNvbnZlcnRzIHRvIGFcbiAgICAgKiBkaXN0aW5jdCBzdHJpbmcuIE5vdGUgdGhhdCBvYmplY3RzIGFuZCBhcnJheXMgd2lsbCBub3QgYmVoYXZlIHJlYXNvbmFibHkuXG4gICAgICogTmVpdGhlciB3aWxsIGNhc2VzIHdoZXJlIHRoZSBvdGhlciBhcmd1bWVudHMgYXJlIHNpZ25pZmljYW50LiBJbiBzdWNoIGNhc2VzLFxuICAgICAqIHNwZWNpZnkgeW91ciBvd24gaGFzaCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIFRoZSBjYWNoZSBvZiByZXN1bHRzIGlzIGV4cG9zZWQgYXMgdGhlIGBtZW1vYCBwcm9wZXJ0eSBvZiB0aGUgZnVuY3Rpb25cbiAgICAgKiByZXR1cm5lZCBieSBgbWVtb2l6ZWAuXG4gICAgICpcbiAgICAgKiBAbmFtZSBtZW1vaXplXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBVdGlsXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gLSBUaGUgZnVuY3Rpb24gdG8gcHJveHkgYW5kIGNhY2hlIHJlc3VsdHMgZnJvbS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYXNoZXIgLSBBbiBvcHRpb25hbCBmdW5jdGlvbiBmb3IgZ2VuZXJhdGluZyBhIGN1c3RvbSBoYXNoXG4gICAgICogZm9yIHN0b3JpbmcgcmVzdWx0cy4gSXQgaGFzIGFsbCB0aGUgYXJndW1lbnRzIGFwcGxpZWQgdG8gaXQgYXBhcnQgZnJvbSB0aGVcbiAgICAgKiBjYWxsYmFjaywgYW5kIG11c3QgYmUgc3luY2hyb25vdXMuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIHZhciBzbG93X2ZuID0gZnVuY3Rpb24obmFtZSwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgLy8gZG8gc29tZXRoaW5nXG4gICAgICogICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICogfTtcbiAgICAgKiB2YXIgZm4gPSBhc3luYy5tZW1vaXplKHNsb3dfZm4pO1xuICAgICAqXG4gICAgICogLy8gZm4gY2FuIG5vdyBiZSB1c2VkIGFzIGlmIGl0IHdlcmUgc2xvd19mblxuICAgICAqIGZuKCdzb21lIG5hbWUnLCBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgLy8gY2FsbGJhY2tcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtZW1vaXplJDEoZm4sIGhhc2hlcikge1xuICAgICAgICB2YXIgbWVtbyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHZhciBxdWV1ZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICBoYXNoZXIgPSBoYXNoZXIgfHwgaWRlbnRpdHk7XG4gICAgICAgIHZhciBtZW1vaXplZCA9IGluaXRpYWxQYXJhbXMoZnVuY3Rpb24gbWVtb2l6ZWQoYXJncywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoaGFzKG1lbW8sIGtleSkpIHtcbiAgICAgICAgICAgICAgICBzZXRJbW1lZGlhdGUkMShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIG1lbW9ba2V5XSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhcyhxdWV1ZXMsIGtleSkpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0gPSBbY2FsbGJhY2tdO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtyZXN0KGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lbW9ba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIHZhciBxID0gcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBxLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcVtpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgbWVtb2l6ZWQubWVtbyA9IG1lbW87XG4gICAgICAgIG1lbW9pemVkLnVubWVtb2l6ZWQgPSBmbjtcbiAgICAgICAgcmV0dXJuIG1lbW9pemVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxzIGBjYWxsYmFja2Agb24gYSBsYXRlciBsb29wIGFyb3VuZCB0aGUgZXZlbnQgbG9vcC4gSW4gTm9kZS5qcyB0aGlzIGp1c3RcbiAgICAgKiBjYWxscyBgc2V0SW1tZWRpYXRlYC4gIEluIHRoZSBicm93c2VyIGl0IHdpbGwgdXNlIGBzZXRJbW1lZGlhdGVgIGlmXG4gICAgICogYXZhaWxhYmxlLCBvdGhlcndpc2UgYHNldFRpbWVvdXQoY2FsbGJhY2ssIDApYCwgd2hpY2ggbWVhbnMgb3RoZXIgaGlnaGVyXG4gICAgICogcHJpb3JpdHkgZXZlbnRzIG1heSBwcmVjZWRlIHRoZSBleGVjdXRpb24gb2YgYGNhbGxiYWNrYC5cbiAgICAgKlxuICAgICAqIFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IGZvciBicm93c2VyLWNvbXBhdGliaWxpdHkgcHVycG9zZXMuXG4gICAgICpcbiAgICAgKiBAbmFtZSBuZXh0VGlja1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAYWxpYXMgc2V0SW1tZWRpYXRlXG4gICAgICogQGNhdGVnb3J5IFV0aWxcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIFRoZSBmdW5jdGlvbiB0byBjYWxsIG9uIGEgbGF0ZXIgbG9vcCBhcm91bmRcbiAgICAgKiB0aGUgZXZlbnQgbG9vcC4gSW52b2tlZCB3aXRoIChhcmdzLi4uKS5cbiAgICAgKiBAcGFyYW0gey4uLip9IGFyZ3MuLi4gLSBhbnkgbnVtYmVyIG9mIGFkZGl0aW9uYWwgYXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlXG4gICAgICogY2FsbGJhY2sgb24gdGhlIG5leHQgdGljay5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIGNhbGxfb3JkZXIgPSBbXTtcbiAgICAgKiBhc3luYy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgY2FsbF9vcmRlci5wdXNoKCd0d28nKTtcbiAgICAgKiAgICAgLy8gY2FsbF9vcmRlciBub3cgZXF1YWxzIFsnb25lJywndHdvJ11cbiAgICAgKiB9KTtcbiAgICAgKiBjYWxsX29yZGVyLnB1c2goJ29uZScpO1xuICAgICAqXG4gICAgICogYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICogICAgIC8vIGEsIGIsIGFuZCBjIGVxdWFsIDEsIDIsIGFuZCAzXG4gICAgICogfSwgMSwgMiwgMyk7XG4gICAgICovXG4gICAgdmFyIF9kZWZlciQxO1xuXG4gICAgaWYgKGhhc05leHRUaWNrKSB7XG4gICAgICAgIF9kZWZlciQxID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICB9IGVsc2UgaWYgKGhhc1NldEltbWVkaWF0ZSkge1xuICAgICAgICBfZGVmZXIkMSA9IHNldEltbWVkaWF0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBfZGVmZXIkMSA9IGZhbGxiYWNrO1xuICAgIH1cblxuICAgIHZhciBuZXh0VGljayA9IHdyYXAoX2RlZmVyJDEpO1xuXG4gICAgZnVuY3Rpb24gX3BhcmFsbGVsKGVhY2hmbiwgdGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBpc0FycmF5TGlrZSh0YXNrcykgPyBbXSA6IHt9O1xuXG4gICAgICAgIGVhY2hmbih0YXNrcywgZnVuY3Rpb24gKHRhc2ssIGtleSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhc2socmVzdChmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNba2V5XSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHRzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhlIHNhbWUgYXMgYHBhcmFsbGVsYCBidXQgcnVucyBhIG1heGltdW0gb2YgYGxpbWl0YCBhc3luYyBvcGVyYXRpb25zIGF0IGFcbiAgICAgKiB0aW1lLlxuICAgICAqXG4gICAgICogQG5hbWUgcGFyYWxsZWxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5wYXJhbGxlbFxuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0FycmF5fENvbGxlY3Rpb259IHRhc2tzIC0gQSBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgZnVuY3Rpb25zIHRvIHJ1bi5cbiAgICAgKiBFYWNoIGZ1bmN0aW9uIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHJlc3VsdClgIHdoaWNoIGl0IG11c3QgY2FsbCBvblxuICAgICAqIGNvbXBsZXRpb24gd2l0aCBhbiBlcnJvciBgZXJyYCAod2hpY2ggY2FuIGJlIGBudWxsYCkgYW5kIGFuIG9wdGlvbmFsIGByZXN1bHRgXG4gICAgICogdmFsdWUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGFzeW5jIG9wZXJhdGlvbnMgYXQgYSB0aW1lLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBbiBvcHRpb25hbCBjYWxsYmFjayB0byBydW4gb25jZSBhbGwgdGhlXG4gICAgICogZnVuY3Rpb25zIGhhdmUgY29tcGxldGVkIHN1Y2Nlc3NmdWxseS4gVGhpcyBmdW5jdGlvbiBnZXRzIGEgcmVzdWx0cyBhcnJheVxuICAgICAqIChvciBvYmplY3QpIGNvbnRhaW5pbmcgYWxsIHRoZSByZXN1bHQgYXJndW1lbnRzIHBhc3NlZCB0byB0aGUgdGFzayBjYWxsYmFja3MuXG4gICAgICogSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdHMpLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBhcmFsbGVsTGltaXQodGFza3MsIGxpbWl0LCBjYikge1xuICAgICAgcmV0dXJuIF9wYXJhbGxlbChfZWFjaE9mTGltaXQobGltaXQpLCB0YXNrcywgY2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1biB0aGUgYHRhc2tzYCBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyBpbiBwYXJhbGxlbCwgd2l0aG91dCB3YWl0aW5nIHVudGlsXG4gICAgICogdGhlIHByZXZpb3VzIGZ1bmN0aW9uIGhhcyBjb21wbGV0ZWQuIElmIGFueSBvZiB0aGUgZnVuY3Rpb25zIHBhc3MgYW4gZXJyb3IgdG9cbiAgICAgKiBpdHMgY2FsbGJhY2ssIHRoZSBtYWluIGBjYWxsYmFja2AgaXMgaW1tZWRpYXRlbHkgY2FsbGVkIHdpdGggdGhlIHZhbHVlIG9mIHRoZVxuICAgICAqIGVycm9yLiBPbmNlIHRoZSBgdGFza3NgIGhhdmUgY29tcGxldGVkLCB0aGUgcmVzdWx0cyBhcmUgcGFzc2VkIHRvIHRoZSBmaW5hbFxuICAgICAqIGBjYWxsYmFja2AgYXMgYW4gYXJyYXkuXG4gICAgICpcbiAgICAgKiAqKk5vdGU6KiogYHBhcmFsbGVsYCBpcyBhYm91dCBraWNraW5nLW9mZiBJL08gdGFza3MgaW4gcGFyYWxsZWwsIG5vdCBhYm91dFxuICAgICAqIHBhcmFsbGVsIGV4ZWN1dGlvbiBvZiBjb2RlLiAgSWYgeW91ciB0YXNrcyBkbyBub3QgdXNlIGFueSB0aW1lcnMgb3IgcGVyZm9ybVxuICAgICAqIGFueSBJL08sIHRoZXkgd2lsbCBhY3R1YWxseSBiZSBleGVjdXRlZCBpbiBzZXJpZXMuICBBbnkgc3luY2hyb25vdXMgc2V0dXBcbiAgICAgKiBzZWN0aW9ucyBmb3IgZWFjaCB0YXNrIHdpbGwgaGFwcGVuIG9uZSBhZnRlciB0aGUgb3RoZXIuICBKYXZhU2NyaXB0IHJlbWFpbnNcbiAgICAgKiBzaW5nbGUtdGhyZWFkZWQuXG4gICAgICpcbiAgICAgKiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIHVzZSBhbiBvYmplY3QgaW5zdGVhZCBvZiBhbiBhcnJheS4gRWFjaCBwcm9wZXJ0eSB3aWxsXG4gICAgICogYmUgcnVuIGFzIGEgZnVuY3Rpb24gYW5kIHRoZSByZXN1bHRzIHdpbGwgYmUgcGFzc2VkIHRvIHRoZSBmaW5hbCBgY2FsbGJhY2tgXG4gICAgICogYXMgYW4gb2JqZWN0IGluc3RlYWQgb2YgYW4gYXJyYXkuIFRoaXMgY2FuIGJlIGEgbW9yZSByZWFkYWJsZSB3YXkgb2YgaGFuZGxpbmdcbiAgICAgKiByZXN1bHRzIGZyb20ge0BsaW5rIGFzeW5jLnBhcmFsbGVsfS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHBhcmFsbGVsXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gdGFza3MgLSBBIGNvbGxlY3Rpb24gY29udGFpbmluZyBmdW5jdGlvbnMgdG8gcnVuLlxuICAgICAqIEVhY2ggZnVuY3Rpb24gaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgcmVzdWx0KWAgd2hpY2ggaXQgbXVzdCBjYWxsIG9uXG4gICAgICogY29tcGxldGlvbiB3aXRoIGFuIGVycm9yIGBlcnJgICh3aGljaCBjYW4gYmUgYG51bGxgKSBhbmQgYW4gb3B0aW9uYWwgYHJlc3VsdGBcbiAgICAgKiB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQW4gb3B0aW9uYWwgY2FsbGJhY2sgdG8gcnVuIG9uY2UgYWxsIHRoZVxuICAgICAqIGZ1bmN0aW9ucyBoYXZlIGNvbXBsZXRlZCBzdWNjZXNzZnVsbHkuIFRoaXMgZnVuY3Rpb24gZ2V0cyBhIHJlc3VsdHMgYXJyYXlcbiAgICAgKiAob3Igb2JqZWN0KSBjb250YWluaW5nIGFsbCB0aGUgcmVzdWx0IGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIHRhc2sgY2FsbGJhY2tzLlxuICAgICAqIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHRzKS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGFzeW5jLnBhcmFsbGVsKFtcbiAgICAgKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScpO1xuICAgICAqICAgICAgICAgfSwgMjAwKTtcbiAgICAgKiAgICAgfSxcbiAgICAgKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ3R3bycpO1xuICAgICAqICAgICAgICAgfSwgMTAwKTtcbiAgICAgKiAgICAgfVxuICAgICAqIF0sXG4gICAgICogLy8gb3B0aW9uYWwgY2FsbGJhY2tcbiAgICAgKiBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcbiAgICAgKiAgICAgLy8gdGhlIHJlc3VsdHMgYXJyYXkgd2lsbCBlcXVhbCBbJ29uZScsJ3R3byddIGV2ZW4gdGhvdWdoXG4gICAgICogICAgIC8vIHRoZSBzZWNvbmQgZnVuY3Rpb24gaGFkIGEgc2hvcnRlciB0aW1lb3V0LlxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogLy8gYW4gZXhhbXBsZSB1c2luZyBhbiBvYmplY3QgaW5zdGVhZCBvZiBhbiBhcnJheVxuICAgICAqIGFzeW5jLnBhcmFsbGVsKHtcbiAgICAgKiAgICAgb25lOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAqICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCAxKTtcbiAgICAgKiAgICAgICAgIH0sIDIwMCk7XG4gICAgICogICAgIH0sXG4gICAgICogICAgIHR3bzogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgMik7XG4gICAgICogICAgICAgICB9LCAxMDApO1xuICAgICAqICAgICB9XG4gICAgICogfSwgZnVuY3Rpb24oZXJyLCByZXN1bHRzKSB7XG4gICAgICogICAgIC8vIHJlc3VsdHMgaXMgbm93IGVxdWFscyB0bzoge29uZTogMSwgdHdvOiAyfVxuICAgICAqIH0pO1xuICAgICAqL1xuICAgIHZhciBwYXJhbGxlbCA9IGRvTGltaXQocGFyYWxsZWxMaW1pdCwgSW5maW5pdHkpO1xuXG4gICAgLyoqXG4gICAgICogQSBxdWV1ZSBvZiB0YXNrcyBmb3IgdGhlIHdvcmtlciBmdW5jdGlvbiB0byBjb21wbGV0ZS5cbiAgICAgKiBAdHlwZWRlZiB7T2JqZWN0fSBxdWV1ZVxuICAgICAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGxlbmd0aCAtIGEgZnVuY3Rpb24gcmV0dXJuaW5nIHRoZSBudW1iZXIgb2YgaXRlbXNcbiAgICAgKiB3YWl0aW5nIHRvIGJlIHByb2Nlc3NlZC4gSW52b2tlIHdpdGggKCkuXG4gICAgICogQHByb3BlcnR5IHtGdW5jdGlvbn0gc3RhcnRlZCAtIGEgZnVuY3Rpb24gcmV0dXJuaW5nIHdoZXRoZXIgb3Igbm90IGFueVxuICAgICAqIGl0ZW1zIGhhdmUgYmVlbiBwdXNoZWQgYW5kIHByb2Nlc3NlZCBieSB0aGUgcXVldWUuIEludm9rZSB3aXRoICgpLlxuICAgICAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHJ1bm5pbmcgLSBhIGZ1bmN0aW9uIHJldHVybmluZyB0aGUgbnVtYmVyIG9mIGl0ZW1zXG4gICAgICogY3VycmVudGx5IGJlaW5nIHByb2Nlc3NlZC4gSW52b2tlIHdpdGggKCkuXG4gICAgICogQHByb3BlcnR5IHtGdW5jdGlvbn0gd29ya2Vyc0xpc3QgLSBhIGZ1bmN0aW9uIHJldHVybmluZyB0aGUgYXJyYXkgb2YgaXRlbXNcbiAgICAgKiBjdXJyZW50bHkgYmVpbmcgcHJvY2Vzc2VkLiBJbnZva2Ugd2l0aCAoKS5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBpZGxlIC0gYSBmdW5jdGlvbiByZXR1cm5pbmcgZmFsc2UgaWYgdGhlcmUgYXJlIGl0ZW1zXG4gICAgICogd2FpdGluZyBvciBiZWluZyBwcm9jZXNzZWQsIG9yIHRydWUgaWYgbm90LiBJbnZva2Ugd2l0aCAoKS5cbiAgICAgKiBAcHJvcGVydHkge251bWJlcn0gY29uY3VycmVuY3kgLSBhbiBpbnRlZ2VyIGZvciBkZXRlcm1pbmluZyBob3cgbWFueSBgd29ya2VyYFxuICAgICAqIGZ1bmN0aW9ucyBzaG91bGQgYmUgcnVuIGluIHBhcmFsbGVsLiBUaGlzIHByb3BlcnR5IGNhbiBiZSBjaGFuZ2VkIGFmdGVyIGFcbiAgICAgKiBgcXVldWVgIGlzIGNyZWF0ZWQgdG8gYWx0ZXIgdGhlIGNvbmN1cnJlbmN5IG9uLXRoZS1mbHkuXG4gICAgICogQHByb3BlcnR5IHtGdW5jdGlvbn0gcHVzaCAtIGFkZCBhIG5ldyB0YXNrIHRvIHRoZSBgcXVldWVgLiBDYWxscyBgY2FsbGJhY2tgXG4gICAgICogb25jZSB0aGUgYHdvcmtlcmAgaGFzIGZpbmlzaGVkIHByb2Nlc3NpbmcgdGhlIHRhc2suIEluc3RlYWQgb2YgYSBzaW5nbGUgdGFzayxcbiAgICAgKiBhIGB0YXNrc2AgYXJyYXkgY2FuIGJlIHN1Ym1pdHRlZC4gVGhlIHJlc3BlY3RpdmUgY2FsbGJhY2sgaXMgdXNlZCBmb3IgZXZlcnlcbiAgICAgKiB0YXNrIGluIHRoZSBsaXN0LiBJbnZva2Ugd2l0aCAodGFzaywgW2NhbGxiYWNrXSksXG4gICAgICogQHByb3BlcnR5IHtGdW5jdGlvbn0gdW5zaGlmdCAtIGFkZCBhIG5ldyB0YXNrIHRvIHRoZSBmcm9udCBvZiB0aGUgYHF1ZXVlYC5cbiAgICAgKiBJbnZva2Ugd2l0aCAodGFzaywgW2NhbGxiYWNrXSkuXG4gICAgICogQHByb3BlcnR5IHtGdW5jdGlvbn0gc2F0dXJhdGVkIC0gYSBjYWxsYmFjayB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBudW1iZXIgb2ZcbiAgICAgKiBydW5uaW5nIHdvcmtlcnMgaGl0cyB0aGUgYGNvbmN1cnJlbmN5YCBsaW1pdCwgYW5kIGZ1cnRoZXIgdGFza3Mgd2lsbCBiZVxuICAgICAqIHF1ZXVlZC5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSB1bnNhdHVyYXRlZCAtIGEgY2FsbGJhY2sgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgbnVtYmVyXG4gICAgICogb2YgcnVubmluZyB3b3JrZXJzIGlzIGxlc3MgdGhhbiB0aGUgYGNvbmN1cnJlbmN5YCAmIGBidWZmZXJgIGxpbWl0cywgYW5kXG4gICAgICogZnVydGhlciB0YXNrcyB3aWxsIG5vdCBiZSBxdWV1ZWQuXG4gICAgICogQHByb3BlcnR5IHtudW1iZXJ9IGJ1ZmZlciAtIEEgbWluaW11bSB0aHJlc2hvbGQgYnVmZmVyIGluIG9yZGVyIHRvIHNheSB0aGF0XG4gICAgICogdGhlIGBxdWV1ZWAgaXMgYHVuc2F0dXJhdGVkYC5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBlbXB0eSAtIGEgY2FsbGJhY2sgdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgbGFzdCBpdGVtXG4gICAgICogZnJvbSB0aGUgYHF1ZXVlYCBpcyBnaXZlbiB0byBhIGB3b3JrZXJgLlxuICAgICAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGRyYWluIC0gYSBjYWxsYmFjayB0aGF0IGlzIGNhbGxlZCB3aGVuIHRoZSBsYXN0IGl0ZW1cbiAgICAgKiBmcm9tIHRoZSBgcXVldWVgIGhhcyByZXR1cm5lZCBmcm9tIHRoZSBgd29ya2VyYC5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSBlcnJvciAtIGEgY2FsbGJhY2sgdGhhdCBpcyBjYWxsZWQgd2hlbiBhIHRhc2sgZXJyb3JzLlxuICAgICAqIEhhcyB0aGUgc2lnbmF0dXJlIGBmdW5jdGlvbihlcnJvciwgdGFzaylgLlxuICAgICAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gcGF1c2VkIC0gYSBib29sZWFuIGZvciBkZXRlcm1pbmluZyB3aGV0aGVyIHRoZSBxdWV1ZSBpc1xuICAgICAqIGluIGEgcGF1c2VkIHN0YXRlLlxuICAgICAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IHBhdXNlIC0gYSBmdW5jdGlvbiB0aGF0IHBhdXNlcyB0aGUgcHJvY2Vzc2luZyBvZiB0YXNrc1xuICAgICAqIHVudGlsIGByZXN1bWUoKWAgaXMgY2FsbGVkLiBJbnZva2Ugd2l0aCAoKS5cbiAgICAgKiBAcHJvcGVydHkge0Z1bmN0aW9ufSByZXN1bWUgLSBhIGZ1bmN0aW9uIHRoYXQgcmVzdW1lcyB0aGUgcHJvY2Vzc2luZyBvZlxuICAgICAqIHF1ZXVlZCB0YXNrcyB3aGVuIHRoZSBxdWV1ZSBpcyBwYXVzZWQuIEludm9rZSB3aXRoICgpLlxuICAgICAqIEBwcm9wZXJ0eSB7RnVuY3Rpb259IGtpbGwgLSBhIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyB0aGUgYGRyYWluYCBjYWxsYmFjayBhbmRcbiAgICAgKiBlbXB0aWVzIHJlbWFpbmluZyB0YXNrcyBmcm9tIHRoZSBxdWV1ZSBmb3JjaW5nIGl0IHRvIGdvIGlkbGUuIEludm9rZSB3aXRoICgpLlxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGBxdWV1ZWAgb2JqZWN0IHdpdGggdGhlIHNwZWNpZmllZCBgY29uY3VycmVuY3lgLiBUYXNrcyBhZGRlZCB0byB0aGVcbiAgICAgKiBgcXVldWVgIGFyZSBwcm9jZXNzZWQgaW4gcGFyYWxsZWwgKHVwIHRvIHRoZSBgY29uY3VycmVuY3lgIGxpbWl0KS4gSWYgYWxsXG4gICAgICogYHdvcmtlcmBzIGFyZSBpbiBwcm9ncmVzcywgdGhlIHRhc2sgaXMgcXVldWVkIHVudGlsIG9uZSBiZWNvbWVzIGF2YWlsYWJsZS5cbiAgICAgKiBPbmNlIGEgYHdvcmtlcmAgY29tcGxldGVzIGEgYHRhc2tgLCB0aGF0IGB0YXNrYCdzIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEBuYW1lIHF1ZXVlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB3b3JrZXIgLSBBbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gZm9yIHByb2Nlc3NpbmcgYSBxdWV1ZWRcbiAgICAgKiB0YXNrLCB3aGljaCBtdXN0IGNhbGwgaXRzIGBjYWxsYmFjayhlcnIpYCBhcmd1bWVudCB3aGVuIGZpbmlzaGVkLCB3aXRoIGFuXG4gICAgICogb3B0aW9uYWwgYGVycm9yYCBhcyBhbiBhcmd1bWVudC4gIElmIHlvdSB3YW50IHRvIGhhbmRsZSBlcnJvcnMgZnJvbSBhblxuICAgICAqIGluZGl2aWR1YWwgdGFzaywgcGFzcyBhIGNhbGxiYWNrIHRvIGBxLnB1c2goKWAuIEludm9rZWQgd2l0aFxuICAgICAqICh0YXNrLCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IFtjb25jdXJyZW5jeT0xXSAtIEFuIGBpbnRlZ2VyYCBmb3IgZGV0ZXJtaW5pbmcgaG93IG1hbnlcbiAgICAgKiBgd29ya2VyYCBmdW5jdGlvbnMgc2hvdWxkIGJlIHJ1biBpbiBwYXJhbGxlbC4gIElmIG9taXR0ZWQsIHRoZSBjb25jdXJyZW5jeVxuICAgICAqIGRlZmF1bHRzIHRvIGAxYC4gIElmIHRoZSBjb25jdXJyZW5jeSBpcyBgMGAsIGFuIGVycm9yIGlzIHRocm93bi5cbiAgICAgKiBAcmV0dXJucyB7cXVldWV9IEEgcXVldWUgb2JqZWN0IHRvIG1hbmFnZSB0aGUgdGFza3MuIENhbGxiYWNrcyBjYW5cbiAgICAgKiBhdHRhY2hlZCBhcyBjZXJ0YWluIHByb3BlcnRpZXMgdG8gbGlzdGVuIGZvciBzcGVjaWZpYyBldmVudHMgZHVyaW5nIHRoZVxuICAgICAqIGxpZmVjeWNsZSBvZiB0aGUgcXVldWUuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIGNyZWF0ZSBhIHF1ZXVlIG9iamVjdCB3aXRoIGNvbmN1cnJlbmN5IDJcbiAgICAgKiB2YXIgcSA9IGFzeW5jLnF1ZXVlKGZ1bmN0aW9uKHRhc2ssIGNhbGxiYWNrKSB7XG4gICAgICogICAgIGNvbnNvbGUubG9nKCdoZWxsbyAnICsgdGFzay5uYW1lKTtcbiAgICAgKiAgICAgY2FsbGJhY2soKTtcbiAgICAgKiB9LCAyKTtcbiAgICAgKlxuICAgICAqIC8vIGFzc2lnbiBhIGNhbGxiYWNrXG4gICAgICogcS5kcmFpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAqICAgICBjb25zb2xlLmxvZygnYWxsIGl0ZW1zIGhhdmUgYmVlbiBwcm9jZXNzZWQnKTtcbiAgICAgKiB9O1xuICAgICAqXG4gICAgICogLy8gYWRkIHNvbWUgaXRlbXMgdG8gdGhlIHF1ZXVlXG4gICAgICogcS5wdXNoKHtuYW1lOiAnZm9vJ30sIGZ1bmN0aW9uKGVycikge1xuICAgICAqICAgICBjb25zb2xlLmxvZygnZmluaXNoZWQgcHJvY2Vzc2luZyBmb28nKTtcbiAgICAgKiB9KTtcbiAgICAgKiBxLnB1c2goe25hbWU6ICdiYXInfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAqICAgICBjb25zb2xlLmxvZygnZmluaXNoZWQgcHJvY2Vzc2luZyBiYXInKTtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIGFkZCBzb21lIGl0ZW1zIHRvIHRoZSBxdWV1ZSAoYmF0Y2gtd2lzZSlcbiAgICAgKiBxLnB1c2goW3tuYW1lOiAnYmF6J30se25hbWU6ICdiYXknfSx7bmFtZTogJ2JheCd9XSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICogICAgIGNvbnNvbGUubG9nKCdmaW5pc2hlZCBwcm9jZXNzaW5nIGl0ZW0nKTtcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIGFkZCBzb21lIGl0ZW1zIHRvIHRoZSBmcm9udCBvZiB0aGUgcXVldWVcbiAgICAgKiBxLnVuc2hpZnQoe25hbWU6ICdiYXInfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAqICAgICBjb25zb2xlLmxvZygnZmluaXNoZWQgcHJvY2Vzc2luZyBiYXInKTtcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBxdWV1ZSQxICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICByZXR1cm4gcXVldWUoZnVuY3Rpb24gKGl0ZW1zLCBjYikge1xuICAgICAgICB3b3JrZXIoaXRlbXNbMF0sIGNiKTtcbiAgICAgIH0sIGNvbmN1cnJlbmN5LCAxKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2FtZSBhcyB7QGxpbmsgYXN5bmMucXVldWV9IG9ubHkgdGFza3MgYXJlIGFzc2lnbmVkIGEgcHJpb3JpdHkgYW5kXG4gICAgICogY29tcGxldGVkIGluIGFzY2VuZGluZyBwcmlvcml0eSBvcmRlci5cbiAgICAgKlxuICAgICAqIEBuYW1lIHByaW9yaXR5UXVldWVcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5xdWV1ZVxuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB3b3JrZXIgLSBBbiBhc3luY2hyb25vdXMgZnVuY3Rpb24gZm9yIHByb2Nlc3NpbmcgYSBxdWV1ZWRcbiAgICAgKiB0YXNrLCB3aGljaCBtdXN0IGNhbGwgaXRzIGBjYWxsYmFjayhlcnIpYCBhcmd1bWVudCB3aGVuIGZpbmlzaGVkLCB3aXRoIGFuXG4gICAgICogb3B0aW9uYWwgYGVycm9yYCBhcyBhbiBhcmd1bWVudC4gIElmIHlvdSB3YW50IHRvIGhhbmRsZSBlcnJvcnMgZnJvbSBhblxuICAgICAqIGluZGl2aWR1YWwgdGFzaywgcGFzcyBhIGNhbGxiYWNrIHRvIGBxLnB1c2goKWAuIEludm9rZWQgd2l0aFxuICAgICAqICh0YXNrLCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGNvbmN1cnJlbmN5IC0gQW4gYGludGVnZXJgIGZvciBkZXRlcm1pbmluZyBob3cgbWFueSBgd29ya2VyYFxuICAgICAqIGZ1bmN0aW9ucyBzaG91bGQgYmUgcnVuIGluIHBhcmFsbGVsLiAgSWYgb21pdHRlZCwgdGhlIGNvbmN1cnJlbmN5IGRlZmF1bHRzIHRvXG4gICAgICogYDFgLiAgSWYgdGhlIGNvbmN1cnJlbmN5IGlzIGAwYCwgYW4gZXJyb3IgaXMgdGhyb3duLlxuICAgICAqIEByZXR1cm5zIHtxdWV1ZX0gQSBwcmlvcml0eVF1ZXVlIG9iamVjdCB0byBtYW5hZ2UgdGhlIHRhc2tzLiBUaGVyZSBhcmUgdHdvXG4gICAgICogZGlmZmVyZW5jZXMgYmV0d2VlbiBgcXVldWVgIGFuZCBgcHJpb3JpdHlRdWV1ZWAgb2JqZWN0czpcbiAgICAgKiAqIGBwdXNoKHRhc2ssIHByaW9yaXR5LCBbY2FsbGJhY2tdKWAgLSBgcHJpb3JpdHlgIHNob3VsZCBiZSBhIG51bWJlci4gSWYgYW5cbiAgICAgKiAgIGFycmF5IG9mIGB0YXNrc2AgaXMgZ2l2ZW4sIGFsbCB0YXNrcyB3aWxsIGJlIGFzc2lnbmVkIHRoZSBzYW1lIHByaW9yaXR5LlxuICAgICAqICogVGhlIGB1bnNoaWZ0YCBtZXRob2Qgd2FzIHJlbW92ZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJpb3JpdHlRdWV1ZSAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuICAgICAgICBmdW5jdGlvbiBfY29tcGFyZVRhc2tzKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9iaW5hcnlTZWFyY2goc2VxdWVuY2UsIGl0ZW0sIGNvbXBhcmUpIHtcbiAgICAgICAgICAgIHZhciBiZWcgPSAtMSxcbiAgICAgICAgICAgICAgICBlbmQgPSBzZXF1ZW5jZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgd2hpbGUgKGJlZyA8IGVuZCkge1xuICAgICAgICAgICAgICAgIHZhciBtaWQgPSBiZWcgKyAoZW5kIC0gYmVnICsgMSA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0SW1tZWRpYXRlJDEoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcnJheUVhY2goZGF0YSwgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKF9iaW5hcnlTZWFyY2gocS50YXNrcywgaXRlbSwgX2NvbXBhcmVUYXNrcykgKyAxLCAwLCBpdGVtKTtcblxuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSQxKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBxdWV1ZSQxKHdvcmtlciwgY29uY3VycmVuY3kpO1xuXG4gICAgICAgIC8vIE92ZXJyaWRlIHB1c2ggdG8gYWNjZXB0IHNlY29uZCBwYXJhbWV0ZXIgcmVwcmVzZW50aW5nIHByaW9yaXR5XG4gICAgICAgIHEucHVzaCA9IGZ1bmN0aW9uIChkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZW1vdmUgdW5zaGlmdCBmdW5jdGlvblxuICAgICAgICBkZWxldGUgcS51bnNoaWZ0O1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBgYmFzZUVhY2hgIG9yIGBiYXNlRWFjaFJpZ2h0YCBmdW5jdGlvbi5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZWFjaEZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGl0ZXJhdGUgb3ZlciBhIGNvbGxlY3Rpb24uXG4gICAgICogQHBhcmFtIHtib29sZWFufSBbZnJvbVJpZ2h0XSBTcGVjaWZ5IGl0ZXJhdGluZyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGVCYXNlRWFjaChlYWNoRnVuYywgZnJvbVJpZ2h0KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oY29sbGVjdGlvbiwgaXRlcmF0ZWUpIHtcbiAgICAgICAgaWYgKGNvbGxlY3Rpb24gPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNBcnJheUxpa2UoY29sbGVjdGlvbikpIHtcbiAgICAgICAgICByZXR1cm4gZWFjaEZ1bmMoY29sbGVjdGlvbiwgaXRlcmF0ZWUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBsZW5ndGggPSBjb2xsZWN0aW9uLmxlbmd0aCxcbiAgICAgICAgICAgIGluZGV4ID0gZnJvbVJpZ2h0ID8gbGVuZ3RoIDogLTEsXG4gICAgICAgICAgICBpdGVyYWJsZSA9IE9iamVjdChjb2xsZWN0aW9uKTtcblxuICAgICAgICB3aGlsZSAoKGZyb21SaWdodCA/IGluZGV4LS0gOiArK2luZGV4IDwgbGVuZ3RoKSkge1xuICAgICAgICAgIGlmIChpdGVyYXRlZShpdGVyYWJsZVtpbmRleF0sIGluZGV4LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmZvckVhY2hgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gICAgICovXG4gICAgdmFyIGJhc2VFYWNoID0gY3JlYXRlQmFzZUVhY2goYmFzZUZvck93bik7XG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGBjb2xsZWN0aW9uYCBhbmQgaW52b2tlcyBgaXRlcmF0ZWVgIGZvciBlYWNoIGVsZW1lbnQuXG4gICAgICogVGhlIGl0ZXJhdGVlIGlzIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM6ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAgICAgKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gICAgICpcbiAgICAgKiAqKk5vdGU6KiogQXMgd2l0aCBvdGhlciBcIkNvbGxlY3Rpb25zXCIgbWV0aG9kcywgb2JqZWN0cyB3aXRoIGEgXCJsZW5ndGhcIlxuICAgICAqIHByb3BlcnR5IGFyZSBpdGVyYXRlZCBsaWtlIGFycmF5cy4gVG8gYXZvaWQgdGhpcyBiZWhhdmlvciB1c2UgYF8uZm9ySW5gXG4gICAgICogb3IgYF8uZm9yT3duYCBmb3Igb2JqZWN0IGl0ZXJhdGlvbi5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSAwLjEuMFxuICAgICAqIEBhbGlhcyBlYWNoXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbGVjdGlvbiBUaGUgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2l0ZXJhdGVlPV8uaWRlbnRpdHldIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gICAgICogQHJldHVybnMge0FycmF5fE9iamVjdH0gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gICAgICogQHNlZSBfLmZvckVhY2hSaWdodFxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBfKFsxLCAyXSkuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAqICAgY29uc29sZS5sb2codmFsdWUpO1xuICAgICAqIH0pO1xuICAgICAqIC8vID0+IExvZ3MgYDFgIHRoZW4gYDJgLlxuICAgICAqXG4gICAgICogXy5mb3JFYWNoKHsgJ2EnOiAxLCAnYic6IDIgfSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAqICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgKiB9KTtcbiAgICAgKiAvLyA9PiBMb2dzICdhJyB0aGVuICdiJyAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmb3JFYWNoKGNvbGxlY3Rpb24sIGl0ZXJhdGVlKSB7XG4gICAgICB2YXIgZnVuYyA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBhcnJheUVhY2ggOiBiYXNlRWFjaDtcbiAgICAgIHJldHVybiBmdW5jKGNvbGxlY3Rpb24sIGJhc2VJdGVyYXRlZShpdGVyYXRlZSwgMykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJ1bnMgdGhlIGB0YXNrc2AgYXJyYXkgb2YgZnVuY3Rpb25zIGluIHBhcmFsbGVsLCB3aXRob3V0IHdhaXRpbmcgdW50aWwgdGhlXG4gICAgICogcHJldmlvdXMgZnVuY3Rpb24gaGFzIGNvbXBsZXRlZC4gT25jZSBhbnkgdGhlIGB0YXNrc2AgY29tcGxldGVkIG9yIHBhc3MgYW5cbiAgICAgKiBlcnJvciB0byBpdHMgY2FsbGJhY2ssIHRoZSBtYWluIGBjYWxsYmFja2AgaXMgaW1tZWRpYXRlbHkgY2FsbGVkLiBJdCdzXG4gICAgICogZXF1aXZhbGVudCB0byBgUHJvbWlzZS5yYWNlKClgLlxuICAgICAqXG4gICAgICogQG5hbWUgcmFjZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAY2F0ZWdvcnkgQ29udHJvbCBGbG93XG4gICAgICogQHBhcmFtIHtBcnJheX0gdGFza3MgLSBBbiBhcnJheSBjb250YWluaW5nIGZ1bmN0aW9ucyB0byBydW4uIEVhY2ggZnVuY3Rpb25cbiAgICAgKiBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyLCByZXN1bHQpYCB3aGljaCBpdCBtdXN0IGNhbGwgb24gY29tcGxldGlvbiB3aXRoIGFuXG4gICAgICogZXJyb3IgYGVycmAgKHdoaWNoIGNhbiBiZSBgbnVsbGApIGFuZCBhbiBvcHRpb25hbCBgcmVzdWx0YCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayAtIEEgY2FsbGJhY2sgdG8gcnVuIG9uY2UgYW55IG9mIHRoZSBmdW5jdGlvbnMgaGF2ZVxuICAgICAqIGNvbXBsZXRlZC4gVGhpcyBmdW5jdGlvbiBnZXRzIGFuIGVycm9yIG9yIHJlc3VsdCBmcm9tIHRoZSBmaXJzdCBmdW5jdGlvbiB0aGF0XG4gICAgICogY29tcGxldGVkLiBJbnZva2VkIHdpdGggKGVyciwgcmVzdWx0KS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYXN5bmMucmFjZShbXG4gICAgICogICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsICdvbmUnKTtcbiAgICAgKiAgICAgICAgIH0sIDIwMCk7XG4gICAgICogICAgIH0sXG4gICAgICogICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsICd0d28nKTtcbiAgICAgKiAgICAgICAgIH0sIDEwMCk7XG4gICAgICogICAgIH1cbiAgICAgKiBdLFxuICAgICAqIC8vIG1haW4gY2FsbGJhY2tcbiAgICAgKiBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAqICAgICAvLyB0aGUgcmVzdWx0IHdpbGwgYmUgZXF1YWwgdG8gJ3R3bycgYXMgaXQgZmluaXNoZXMgZWFybGllclxuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJhY2UodGFza3MsIGNiKSB7XG4gICAgICAgIGNiID0gb25jZShjYiB8fCBub29wKTtcbiAgICAgICAgaWYgKCFpc0FycmF5KHRhc2tzKSkgcmV0dXJuIGNiKG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IHRvIHJhY2UgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKSk7XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSByZXR1cm4gY2IoKTtcbiAgICAgICAgZm9yRWFjaCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgIHRhc2soY2IpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbiAgICAvKipcbiAgICAgKiBTYW1lIGFzIGByZWR1Y2VgLCBvbmx5IG9wZXJhdGVzIG9uIGBjb2xsYCBpbiByZXZlcnNlIG9yZGVyLlxuICAgICAqXG4gICAgICogQG5hbWUgcmVkdWNlUmlnaHRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5yZWR1Y2VcbiAgICAgKiBAYWxpYXMgZm9sZHJcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0geyp9IG1lbW8gLSBUaGUgaW5pdGlhbCBzdGF0ZSBvZiB0aGUgcmVkdWN0aW9uLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSBmdW5jdGlvbiBhcHBsaWVkIHRvIGVhY2ggaXRlbSBpbiB0aGVcbiAgICAgKiBhcnJheSB0byBwcm9kdWNlIHRoZSBuZXh0IHN0ZXAgaW4gdGhlIHJlZHVjdGlvbi4gVGhlIGBpdGVyYXRlZWAgaXMgcGFzc2VkIGFcbiAgICAgKiBgY2FsbGJhY2soZXJyLCByZWR1Y3Rpb24pYCB3aGljaCBhY2NlcHRzIGFuIG9wdGlvbmFsIGVycm9yIGFzIGl0cyBmaXJzdFxuICAgICAqIGFyZ3VtZW50LCBhbmQgdGhlIHN0YXRlIG9mIHRoZSByZWR1Y3Rpb24gYXMgdGhlIHNlY29uZC4gSWYgYW4gZXJyb3IgaXNcbiAgICAgKiBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrLCB0aGUgcmVkdWN0aW9uIGlzIHN0b3BwZWQgYW5kIHRoZSBtYWluIGBjYWxsYmFja2AgaXNcbiAgICAgKiBpbW1lZGlhdGVseSBjYWxsZWQgd2l0aCB0aGUgZXJyb3IuIEludm9rZWQgd2l0aCAobWVtbywgaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciBhbGwgdGhlXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZC4gUmVzdWx0IGlzIHRoZSByZWR1Y2VkIHZhbHVlLiBJbnZva2VkIHdpdGhcbiAgICAgKiAoZXJyLCByZXN1bHQpLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlZHVjZVJpZ2h0KGFyciwgbWVtbywgaXRlcmF0ZWUsIGNiKSB7XG4gICAgICB2YXIgcmV2ZXJzZWQgPSBzbGljZS5jYWxsKGFycikucmV2ZXJzZSgpO1xuICAgICAgcmVkdWNlKHJldmVyc2VkLCBtZW1vLCBpdGVyYXRlZSwgY2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyYXBzIHRoZSBmdW5jdGlvbiBpbiBhbm90aGVyIGZ1bmN0aW9uIHRoYXQgYWx3YXlzIHJldHVybnMgZGF0YSBldmVuIHdoZW4gaXRcbiAgICAgKiBlcnJvcnMuXG4gICAgICpcbiAgICAgKiBUaGUgb2JqZWN0IHJldHVybmVkIGhhcyBlaXRoZXIgdGhlIHByb3BlcnR5IGBlcnJvcmAgb3IgYHZhbHVlYC5cbiAgICAgKlxuICAgICAqIEBuYW1lIHJlZmxlY3RcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IFV0aWxcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jdGlvbiAtIFRoZSBmdW5jdGlvbiB5b3Ugd2FudCB0byB3cmFwXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSAtIEEgZnVuY3Rpb24gdGhhdCBhbHdheXMgcGFzc2VzIG51bGwgdG8gaXQncyBjYWxsYmFjayBhc1xuICAgICAqIHRoZSBlcnJvci4gVGhlIHNlY29uZCBhcmd1bWVudCB0byB0aGUgY2FsbGJhY2sgd2lsbCBiZSBhbiBgb2JqZWN0YCB3aXRoXG4gICAgICogZWl0aGVyIGFuIGBlcnJvcmAgb3IgYSBgdmFsdWVgIHByb3BlcnR5LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBhc3luYy5wYXJhbGxlbChbXG4gICAgICogICAgIGFzeW5jLnJlZmxlY3QoZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIC8vIGRvIHNvbWUgc3R1ZmYgLi4uXG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCAnb25lJyk7XG4gICAgICogICAgIH0pLFxuICAgICAqICAgICBhc3luYy5yZWZsZWN0KGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICAvLyBkbyBzb21lIG1vcmUgc3R1ZmYgYnV0IGVycm9yIC4uLlxuICAgICAqICAgICAgICAgY2FsbGJhY2soJ2JhZCBzdHVmZiBoYXBwZW5lZCcpO1xuICAgICAqICAgICB9KSxcbiAgICAgKiAgICAgYXN5bmMucmVmbGVjdChmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAqICAgICAgICAgLy8gZG8gc29tZSBtb3JlIHN0dWZmIC4uLlxuICAgICAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ3R3bycpO1xuICAgICAqICAgICB9KVxuICAgICAqIF0sXG4gICAgICogLy8gb3B0aW9uYWwgY2FsbGJhY2tcbiAgICAgKiBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcbiAgICAgKiAgICAgLy8gdmFsdWVzXG4gICAgICogICAgIC8vIHJlc3VsdHNbMF0udmFsdWUgPSAnb25lJ1xuICAgICAqICAgICAvLyByZXN1bHRzWzFdLmVycm9yID0gJ2JhZCBzdHVmZiBoYXBwZW5lZCdcbiAgICAgKiAgICAgLy8gcmVzdWx0c1syXS52YWx1ZSA9ICd0d28nXG4gICAgICogfSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVmbGVjdChmbikge1xuICAgICAgICByZXR1cm4gaW5pdGlhbFBhcmFtcyhmdW5jdGlvbiByZWZsZWN0T24oYXJncywgcmVmbGVjdENhbGxiYWNrKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2gocmVzdChmdW5jdGlvbiBjYWxsYmFjayhlcnIsIGNiQXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmbGVjdENhbGxiYWNrKG51bGwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yOiBlcnJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNiQXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY2JBcmdzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNiQXJncy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGNiQXJncztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZWZsZWN0Q2FsbGJhY2sobnVsbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWplY3QkMShlYWNoZm4sIGFyciwgaXRlcmF0ZWUsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdGVlKHZhbHVlLCBmdW5jdGlvbiAoZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNiKG51bGwsICF2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoZSBzYW1lIGFzIGByZWplY3RgIGJ1dCBydW5zIGEgbWF4aW11bSBvZiBgbGltaXRgIGFzeW5jIG9wZXJhdGlvbnMgYXQgYVxuICAgICAqIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSByZWplY3RMaW1pdFxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLnJlamVjdFxuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCAtIFRoZSBtYXhpbXVtIG51bWJlciBvZiBhc3luYyBvcGVyYXRpb25zIGF0IGEgdGltZS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgdHJ1dGggdGVzdCB0byBhcHBseSB0byBlYWNoIGl0ZW0gaW4gYGNvbGxgLlxuICAgICAqIFRoZSBgaXRlcmF0ZWVgIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHRydXRoVmFsdWUpYCwgd2hpY2ggbXVzdCBiZSBjYWxsZWRcbiAgICAgKiB3aXRoIGEgYm9vbGVhbiBhcmd1bWVudCBvbmNlIGl0IGhhcyBjb21wbGV0ZWQuIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciBhbGwgdGhlXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZC4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdHMpLlxuICAgICAqL1xuICAgIHZhciByZWplY3RMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChyZWplY3QkMSk7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgb3Bwb3NpdGUgb2YgYGZpbHRlcmAuIFJlbW92ZXMgdmFsdWVzIHRoYXQgcGFzcyBhbiBgYXN5bmNgIHRydXRoIHRlc3QuXG4gICAgICpcbiAgICAgKiBAbmFtZSByZWplY3RcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5maWx0ZXJcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgdHJ1dGggdGVzdCB0byBhcHBseSB0byBlYWNoIGl0ZW0gaW4gYGNvbGxgLlxuICAgICAqIFRoZSBgaXRlcmF0ZWVgIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHRydXRoVmFsdWUpYCwgd2hpY2ggbXVzdCBiZSBjYWxsZWRcbiAgICAgKiB3aXRoIGEgYm9vbGVhbiBhcmd1bWVudCBvbmNlIGl0IGhhcyBjb21wbGV0ZWQuIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciBhbGwgdGhlXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZC4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdHMpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBhc3luYy5yZWplY3QoWydmaWxlMScsJ2ZpbGUyJywnZmlsZTMnXSwgZnVuY3Rpb24oZmlsZVBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICogICAgIGZzLmFjY2VzcyhmaWxlUGF0aCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCAhZXJyKVxuICAgICAqICAgICB9KTtcbiAgICAgKiB9LCBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcbiAgICAgKiAgICAgLy8gcmVzdWx0cyBub3cgZXF1YWxzIGFuIGFycmF5IG9mIG1pc3NpbmcgZmlsZXNcbiAgICAgKiAgICAgY3JlYXRlRmlsZXMocmVzdWx0cyk7XG4gICAgICogfSk7XG4gICAgICovXG4gICAgdmFyIHJlamVjdCA9IGRvTGltaXQocmVqZWN0TGltaXQsIEluZmluaXR5KTtcblxuICAgIC8qKlxuICAgICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgd3JhcHMgYW4gYXJyYXkgb2YgZnVuY3Rpb25zIHdpdGggcmVmbGVjdC5cbiAgICAgKlxuICAgICAqIEBuYW1lIHJlZmxlY3RBbGxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5yZWZsZWN0XG4gICAgICogQGNhdGVnb3J5IFV0aWxcbiAgICAgKiBAcGFyYW0ge0FycmF5fSB0YXNrcyAtIFRoZSBhcnJheSBvZiBmdW5jdGlvbnMgdG8gd3JhcCBpbiBgYXN5bmMucmVmbGVjdGAuXG4gICAgICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIGZ1bmN0aW9ucywgZWFjaCBmdW5jdGlvbiB3cmFwcGVkIGluXG4gICAgICogYGFzeW5jLnJlZmxlY3RgXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGxldCB0YXNrcyA9IFtcbiAgICAgKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScpO1xuICAgICAqICAgICAgICAgfSwgMjAwKTtcbiAgICAgKiAgICAgfSxcbiAgICAgKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIC8vIGRvIHNvbWUgbW9yZSBzdHVmZiBidXQgZXJyb3IgLi4uXG4gICAgICogICAgICAgICBjYWxsYmFjayhuZXcgRXJyb3IoJ2JhZCBzdHVmZiBoYXBwZW5lZCcpKTtcbiAgICAgKiAgICAgfSxcbiAgICAgKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICogICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ3R3bycpO1xuICAgICAqICAgICAgICAgfSwgMTAwKTtcbiAgICAgKiAgICAgfVxuICAgICAqIF07XG4gICAgICpcbiAgICAgKiBhc3luYy5wYXJhbGxlbChhc3luYy5yZWZsZWN0QWxsKHRhc2tzKSxcbiAgICAgKiAvLyBvcHRpb25hbCBjYWxsYmFja1xuICAgICAqIGZ1bmN0aW9uKGVyciwgcmVzdWx0cykge1xuICAgICAqICAgICAvLyB2YWx1ZXNcbiAgICAgKiAgICAgLy8gcmVzdWx0c1swXS52YWx1ZSA9ICdvbmUnXG4gICAgICogICAgIC8vIHJlc3VsdHNbMV0uZXJyb3IgPSBFcnJvcignYmFkIHN0dWZmIGhhcHBlbmVkJylcbiAgICAgKiAgICAgLy8gcmVzdWx0c1syXS52YWx1ZSA9ICd0d28nXG4gICAgICogfSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVmbGVjdEFsbCh0YXNrcykge1xuICAgICAgcmV0dXJuIHRhc2tzLm1hcChyZWZsZWN0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2FtZSBhcyBgcmVqZWN0YCBidXQgcnVucyBvbmx5IGEgc2luZ2xlIGFzeW5jIG9wZXJhdGlvbiBhdCBhIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSByZWplY3RTZXJpZXNcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5yZWplY3RcbiAgICAgKiBAY2F0ZWdvcnkgQ29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSBjb2xsIC0gQSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIEEgdHJ1dGggdGVzdCB0byBhcHBseSB0byBlYWNoIGl0ZW0gaW4gYGNvbGxgLlxuICAgICAqIFRoZSBgaXRlcmF0ZWVgIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHRydXRoVmFsdWUpYCwgd2hpY2ggbXVzdCBiZSBjYWxsZWRcbiAgICAgKiB3aXRoIGEgYm9vbGVhbiBhcmd1bWVudCBvbmNlIGl0IGhhcyBjb21wbGV0ZWQuIEludm9rZWQgd2l0aCAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciBhbGwgdGhlXG4gICAgICogYGl0ZXJhdGVlYCBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZC4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdHMpLlxuICAgICAqL1xuICAgIHZhciByZWplY3RTZXJpZXMgPSBkb0xpbWl0KHJlamVjdExpbWl0LCAxKTtcblxuICAgIC8qKlxuICAgICAqIFJ1biB0aGUgZnVuY3Rpb25zIGluIHRoZSBgdGFza3NgIGNvbGxlY3Rpb24gaW4gc2VyaWVzLCBlYWNoIG9uZSBydW5uaW5nIG9uY2VcbiAgICAgKiB0aGUgcHJldmlvdXMgZnVuY3Rpb24gaGFzIGNvbXBsZXRlZC4gSWYgYW55IGZ1bmN0aW9ucyBpbiB0aGUgc2VyaWVzIHBhc3MgYW5cbiAgICAgKiBlcnJvciB0byBpdHMgY2FsbGJhY2ssIG5vIG1vcmUgZnVuY3Rpb25zIGFyZSBydW4sIGFuZCBgY2FsbGJhY2tgIGlzXG4gICAgICogaW1tZWRpYXRlbHkgY2FsbGVkIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBlcnJvci4gT3RoZXJ3aXNlLCBgY2FsbGJhY2tgXG4gICAgICogcmVjZWl2ZXMgYW4gYXJyYXkgb2YgcmVzdWx0cyB3aGVuIGB0YXNrc2AgaGF2ZSBjb21wbGV0ZWQuXG4gICAgICpcbiAgICAgKiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIHVzZSBhbiBvYmplY3QgaW5zdGVhZCBvZiBhbiBhcnJheS4gRWFjaCBwcm9wZXJ0eSB3aWxsXG4gICAgICogYmUgcnVuIGFzIGEgZnVuY3Rpb24sIGFuZCB0aGUgcmVzdWx0cyB3aWxsIGJlIHBhc3NlZCB0byB0aGUgZmluYWwgYGNhbGxiYWNrYFxuICAgICAqIGFzIGFuIG9iamVjdCBpbnN0ZWFkIG9mIGFuIGFycmF5LiBUaGlzIGNhbiBiZSBhIG1vcmUgcmVhZGFibGUgd2F5IG9mIGhhbmRsaW5nXG4gICAgICogIHJlc3VsdHMgZnJvbSB7QGxpbmsgYXN5bmMuc2VyaWVzfS5cbiAgICAgKlxuICAgICAqICoqTm90ZSoqIHRoYXQgd2hpbGUgbWFueSBpbXBsZW1lbnRhdGlvbnMgcHJlc2VydmUgdGhlIG9yZGVyIG9mIG9iamVjdFxuICAgICAqIHByb3BlcnRpZXMsIHRoZSBbRUNNQVNjcmlwdCBMYW5ndWFnZSBTcGVjaWZpY2F0aW9uXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNS4xLyNzZWMtOC42KVxuICAgICAqIGV4cGxpY2l0bHkgc3RhdGVzIHRoYXRcbiAgICAgKlxuICAgICAqID4gVGhlIG1lY2hhbmljcyBhbmQgb3JkZXIgb2YgZW51bWVyYXRpbmcgdGhlIHByb3BlcnRpZXMgaXMgbm90IHNwZWNpZmllZC5cbiAgICAgKlxuICAgICAqIFNvIGlmIHlvdSByZWx5IG9uIHRoZSBvcmRlciBpbiB3aGljaCB5b3VyIHNlcmllcyBvZiBmdW5jdGlvbnMgYXJlIGV4ZWN1dGVkLFxuICAgICAqIGFuZCB3YW50IHRoaXMgdG8gd29yayBvbiBhbGwgcGxhdGZvcm1zLCBjb25zaWRlciB1c2luZyBhbiBhcnJheS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHNlcmllc1xuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAY2F0ZWdvcnkgQ29udHJvbCBGbG93XG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IHRhc2tzIC0gQSBjb2xsZWN0aW9uIGNvbnRhaW5pbmcgZnVuY3Rpb25zIHRvIHJ1biwgZWFjaFxuICAgICAqIGZ1bmN0aW9uIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHJlc3VsdClgIGl0IG11c3QgY2FsbCBvbiBjb21wbGV0aW9uIHdpdGhcbiAgICAgKiBhbiBlcnJvciBgZXJyYCAod2hpY2ggY2FuIGJlIGBudWxsYCkgYW5kIGFuIG9wdGlvbmFsIGByZXN1bHRgIHZhbHVlLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBbiBvcHRpb25hbCBjYWxsYmFjayB0byBydW4gb25jZSBhbGwgdGhlXG4gICAgICogZnVuY3Rpb25zIGhhdmUgY29tcGxldGVkLiBUaGlzIGZ1bmN0aW9uIGdldHMgYSByZXN1bHRzIGFycmF5IChvciBvYmplY3QpXG4gICAgICogY29udGFpbmluZyBhbGwgdGhlIHJlc3VsdCBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBgdGFza2AgY2FsbGJhY2tzLiBJbnZva2VkXG4gICAgICogd2l0aCAoZXJyLCByZXN1bHQpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogYXN5bmMuc2VyaWVzKFtcbiAgICAgKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIC8vIGRvIHNvbWUgc3R1ZmYgLi4uXG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCAnb25lJyk7XG4gICAgICogICAgIH0sXG4gICAgICogICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICAvLyBkbyBzb21lIG1vcmUgc3R1ZmYgLi4uXG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCAndHdvJyk7XG4gICAgICogICAgIH1cbiAgICAgKiBdLFxuICAgICAqIC8vIG9wdGlvbmFsIGNhbGxiYWNrXG4gICAgICogZnVuY3Rpb24oZXJyLCByZXN1bHRzKSB7XG4gICAgICogICAgIC8vIHJlc3VsdHMgaXMgbm93IGVxdWFsIHRvIFsnb25lJywgJ3R3byddXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiBhc3luYy5zZXJpZXMoe1xuICAgICAqICAgICBvbmU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIDEpO1xuICAgICAqICAgICAgICAgfSwgMjAwKTtcbiAgICAgKiAgICAgfSxcbiAgICAgKiAgICAgdHdvOiBmdW5jdGlvbihjYWxsYmFjayl7XG4gICAgICogICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIDIpO1xuICAgICAqICAgICAgICAgfSwgMTAwKTtcbiAgICAgKiAgICAgfVxuICAgICAqIH0sIGZ1bmN0aW9uKGVyciwgcmVzdWx0cykge1xuICAgICAqICAgICAvLyByZXN1bHRzIGlzIG5vdyBlcXVhbCB0bzoge29uZTogMSwgdHdvOiAyfVxuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNlcmllcyh0YXNrcywgY2IpIHtcbiAgICAgIHJldHVybiBfcGFyYWxsZWwoZWFjaE9mU2VyaWVzLCB0YXNrcywgY2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAgICAgKlxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgX1xuICAgICAqIEBzaW5jZSAyLjQuMFxuICAgICAqIEBjYXRlZ29yeSBVdGlsXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjb25zdGFudCBmdW5jdGlvbi5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogdmFyIG9iamVjdHMgPSBfLnRpbWVzKDIsIF8uY29uc3RhbnQoeyAnYSc6IDEgfSkpO1xuICAgICAqXG4gICAgICogY29uc29sZS5sb2cob2JqZWN0cyk7XG4gICAgICogLy8gPT4gW3sgJ2EnOiAxIH0sIHsgJ2EnOiAxIH1dXG4gICAgICpcbiAgICAgKiBjb25zb2xlLmxvZyhvYmplY3RzWzBdID09PSBvYmplY3RzWzFdKTtcbiAgICAgKiAvLyA9PiB0cnVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29uc3RhbnQkMSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGVtcHRzIHRvIGdldCBhIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgZnJvbSBgdGFza2Agbm8gbW9yZSB0aGFuIGB0aW1lc2AgdGltZXNcbiAgICAgKiBiZWZvcmUgcmV0dXJuaW5nIGFuIGVycm9yLiBJZiB0aGUgdGFzayBpcyBzdWNjZXNzZnVsLCB0aGUgYGNhbGxiYWNrYCB3aWxsIGJlXG4gICAgICogcGFzc2VkIHRoZSByZXN1bHQgb2YgdGhlIHN1Y2Nlc3NmdWwgdGFzay4gSWYgYWxsIGF0dGVtcHRzIGZhaWwsIHRoZSBjYWxsYmFja1xuICAgICAqIHdpbGwgYmUgcGFzc2VkIHRoZSBlcnJvciBhbmQgcmVzdWx0IChpZiBhbnkpIG9mIHRoZSBmaW5hbCBhdHRlbXB0LlxuICAgICAqXG4gICAgICogQG5hbWUgcmV0cnlcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fG51bWJlcn0gW29wdHMgPSB7dGltZXM6IDUsIGludGVydmFsOiAwfXwgNV0gLSBDYW4gYmUgZWl0aGVyIGFuXG4gICAgICogb2JqZWN0IHdpdGggYHRpbWVzYCBhbmQgYGludGVydmFsYCBvciBhIG51bWJlci5cbiAgICAgKiAqIGB0aW1lc2AgLSBUaGUgbnVtYmVyIG9mIGF0dGVtcHRzIHRvIG1ha2UgYmVmb3JlIGdpdmluZyB1cC4gIFRoZSBkZWZhdWx0XG4gICAgICogICBpcyBgNWAuXG4gICAgICogKiBgaW50ZXJ2YWxgIC0gVGhlIHRpbWUgdG8gd2FpdCBiZXR3ZWVuIHJldHJpZXMsIGluIG1pbGxpc2Vjb25kcy4gIFRoZVxuICAgICAqICAgZGVmYXVsdCBpcyBgMGAuIFRoZSBpbnRlcnZhbCBtYXkgYWxzbyBiZSBzcGVjaWZpZWQgYXMgYSBmdW5jdGlvbiBvZiB0aGVcbiAgICAgKiAgIHJldHJ5IGNvdW50IChzZWUgZXhhbXBsZSkuXG4gICAgICogKiBJZiBgb3B0c2AgaXMgYSBudW1iZXIsIHRoZSBudW1iZXIgc3BlY2lmaWVzIHRoZSBudW1iZXIgb2YgdGltZXMgdG8gcmV0cnksXG4gICAgICogICB3aXRoIHRoZSBkZWZhdWx0IGludGVydmFsIG9mIGAwYC5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0YXNrIC0gQSBmdW5jdGlvbiB3aGljaCByZWNlaXZlcyB0d28gYXJndW1lbnRzOiAoMSkgYVxuICAgICAqIGBjYWxsYmFjayhlcnIsIHJlc3VsdClgIHdoaWNoIG11c3QgYmUgY2FsbGVkIHdoZW4gZmluaXNoZWQsIHBhc3NpbmcgYGVycmBcbiAgICAgKiAod2hpY2ggY2FuIGJlIGBudWxsYCkgYW5kIHRoZSBgcmVzdWx0YCBvZiB0aGUgZnVuY3Rpb24ncyBleGVjdXRpb24sIGFuZCAoMilcbiAgICAgKiBhIGByZXN1bHRzYCBvYmplY3QsIGNvbnRhaW5pbmcgdGhlIHJlc3VsdHMgb2YgdGhlIHByZXZpb3VzbHkgZXhlY3V0ZWRcbiAgICAgKiBmdW5jdGlvbnMgKGlmIG5lc3RlZCBpbnNpZGUgYW5vdGhlciBjb250cm9sIGZsb3cpLiBJbnZva2VkIHdpdGhcbiAgICAgKiAoY2FsbGJhY2ssIHJlc3VsdHMpLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBbiBvcHRpb25hbCBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGVcbiAgICAgKiB0YXNrIGhhcyBzdWNjZWVkZWQsIG9yIGFmdGVyIHRoZSBmaW5hbCBmYWlsZWQgYXR0ZW1wdC4gSXQgcmVjZWl2ZXMgdGhlIGBlcnJgXG4gICAgICogYW5kIGByZXN1bHRgIGFyZ3VtZW50cyBvZiB0aGUgbGFzdCBhdHRlbXB0IGF0IGNvbXBsZXRpbmcgdGhlIGB0YXNrYC4gSW52b2tlZFxuICAgICAqIHdpdGggKGVyciwgcmVzdWx0cykuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIC8vIFRoZSBgcmV0cnlgIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIGFzIGEgc3RhbmQtYWxvbmUgY29udHJvbCBmbG93IGJ5IHBhc3NpbmdcbiAgICAgKiAvLyBhIGNhbGxiYWNrLCBhcyBzaG93biBiZWxvdzpcbiAgICAgKlxuICAgICAqIC8vIHRyeSBjYWxsaW5nIGFwaU1ldGhvZCAzIHRpbWVzXG4gICAgICogYXN5bmMucmV0cnkoMywgYXBpTWV0aG9kLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAqICAgICAvLyBkbyBzb21ldGhpbmcgd2l0aCB0aGUgcmVzdWx0XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiAvLyB0cnkgY2FsbGluZyBhcGlNZXRob2QgMyB0aW1lcywgd2FpdGluZyAyMDAgbXMgYmV0d2VlbiBlYWNoIHJldHJ5XG4gICAgICogYXN5bmMucmV0cnkoe3RpbWVzOiAzLCBpbnRlcnZhbDogMjAwfSwgYXBpTWV0aG9kLCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAqICAgICAvLyBkbyBzb21ldGhpbmcgd2l0aCB0aGUgcmVzdWx0XG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiAvLyB0cnkgY2FsbGluZyBhcGlNZXRob2QgMTAgdGltZXMgd2l0aCBleHBvbmVudGlhbCBiYWNrb2ZmXG4gICAgICogLy8gKGkuZS4gaW50ZXJ2YWxzIG9mIDEwMCwgMjAwLCA0MDAsIDgwMCwgMTYwMCwgLi4uIG1pbGxpc2Vjb25kcylcbiAgICAgKiBhc3luYy5yZXRyeSh7XG4gICAgICogICB0aW1lczogMTAsXG4gICAgICogICBpbnRlcnZhbDogZnVuY3Rpb24ocmV0cnlDb3VudCkge1xuICAgICAqICAgICByZXR1cm4gNTAgKiBNYXRoLnBvdygyLCByZXRyeUNvdW50KTtcbiAgICAgKiAgIH1cbiAgICAgKiB9LCBhcGlNZXRob2QsIGZ1bmN0aW9uKGVyciwgcmVzdWx0KSB7XG4gICAgICogICAgIC8vIGRvIHNvbWV0aGluZyB3aXRoIHRoZSByZXN1bHRcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIHRyeSBjYWxsaW5nIGFwaU1ldGhvZCB0aGUgZGVmYXVsdCA1IHRpbWVzIG5vIGRlbGF5IGJldHdlZW4gZWFjaCByZXRyeVxuICAgICAqIGFzeW5jLnJldHJ5KGFwaU1ldGhvZCwgZnVuY3Rpb24oZXJyLCByZXN1bHQpIHtcbiAgICAgKiAgICAgLy8gZG8gc29tZXRoaW5nIHdpdGggdGhlIHJlc3VsdFxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogLy8gSXQgY2FuIGFsc28gYmUgZW1iZWRkZWQgd2l0aGluIG90aGVyIGNvbnRyb2wgZmxvdyBmdW5jdGlvbnMgdG8gcmV0cnlcbiAgICAgKiAvLyBpbmRpdmlkdWFsIG1ldGhvZHMgdGhhdCBhcmUgbm90IGFzIHJlbGlhYmxlLCBsaWtlIHRoaXM6XG4gICAgICogYXN5bmMuYXV0byh7XG4gICAgICogICAgIHVzZXJzOiBhcGkuZ2V0VXNlcnMuYmluZChhcGkpLFxuICAgICAqICAgICBwYXltZW50czogYXN5bmMucmV0cnkoMywgYXBpLmdldFBheW1lbnRzLmJpbmQoYXBpKSlcbiAgICAgKiB9LCBmdW5jdGlvbihlcnIsIHJlc3VsdHMpIHtcbiAgICAgKiAgICAgLy8gZG8gc29tZXRoaW5nIHdpdGggdGhlIHJlc3VsdHNcbiAgICAgKiB9KTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXRyeSh0aW1lcywgdGFzaywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIERFRkFVTFRfVElNRVMgPSA1O1xuICAgICAgICB2YXIgREVGQVVMVF9JTlRFUlZBTCA9IDA7XG5cbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICB0aW1lczogREVGQVVMVF9USU1FUyxcbiAgICAgICAgICAgIGludGVydmFsRnVuYzogY29uc3RhbnQkMShERUZBVUxUX0lOVEVSVkFMKVxuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIHBhcnNlVGltZXMoYWNjLCB0KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gK3QudGltZXMgfHwgREVGQVVMVF9USU1FUztcblxuICAgICAgICAgICAgICAgIGFjYy5pbnRlcnZhbEZ1bmMgPSB0eXBlb2YgdC5pbnRlcnZhbCA9PT0gJ2Z1bmN0aW9uJyA/IHQuaW50ZXJ2YWwgOiBjb25zdGFudCQxKCt0LmludGVydmFsIHx8IERFRkFVTFRfSU5URVJWQUwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gK3QgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhcmd1bWVudHMgZm9yIGFzeW5jLnJldHJ5XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrIHx8IG5vb3A7XG4gICAgICAgICAgICB0YXNrID0gdGltZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXJzZVRpbWVzKG9wdHMsIHRpbWVzKTtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgdGFzayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBhcmd1bWVudHMgZm9yIGFzeW5jLnJldHJ5XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGF0dGVtcHRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgb3B0cy50aW1lcyArIDE7IGkrKykge1xuICAgICAgICAgICAgdmFyIGlzRmluYWxBdHRlbXB0ID0gaSA9PSBvcHRzLnRpbWVzO1xuICAgICAgICAgICAgYXR0ZW1wdHMucHVzaChyZXRyeUF0dGVtcHQoaXNGaW5hbEF0dGVtcHQpKTtcbiAgICAgICAgICAgIHZhciBpbnRlcnZhbCA9IG9wdHMuaW50ZXJ2YWxGdW5jKGkpO1xuICAgICAgICAgICAgaWYgKCFpc0ZpbmFsQXR0ZW1wdCAmJiBpbnRlcnZhbCA+IDApIHtcbiAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5SW50ZXJ2YWwoaW50ZXJ2YWwpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlcmllcyhhdHRlbXB0cywgZnVuY3Rpb24gKGRvbmUsIGRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBjYWxsYmFjayhkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiByZXRyeUF0dGVtcHQoaXNGaW5hbEF0dGVtcHQpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoc2VyaWVzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB0YXNrKGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayghZXJyIHx8IGlzRmluYWxBdHRlbXB0LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnI6IGVycixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdDogcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJldHJ5SW50ZXJ2YWwoaW50ZXJ2YWwpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoc2VyaWVzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgY2xvc2UgcmVsYXRpdmUgb2YgYHJldHJ5YC4gIFRoaXMgbWV0aG9kIHdyYXBzIGEgdGFzayBhbmQgbWFrZXMgaXRcbiAgICAgKiByZXRyeWFibGUsIHJhdGhlciB0aGFuIGltbWVkaWF0ZWx5IGNhbGxpbmcgaXQgd2l0aCByZXRyaWVzLlxuICAgICAqXG4gICAgICogQG5hbWUgcmV0cnlhYmxlXG4gICAgICogQHN0YXRpY1xuICAgICAqIEBtZW1iZXJPZiBhc3luY1xuICAgICAqIEBzZWUgYXN5bmMucmV0cnlcbiAgICAgKiBAY2F0ZWdvcnkgQ29udHJvbCBGbG93XG4gICAgICogQHBhcmFtIHtPYmplY3R8bnVtYmVyfSBbb3B0cyA9IHt0aW1lczogNSwgaW50ZXJ2YWw6IDB9fCA1XSAtIG9wdGlvbmFsXG4gICAgICogb3B0aW9ucywgZXhhY3RseSB0aGUgc2FtZSBhcyBmcm9tIGByZXRyeWBcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSB0YXNrIC0gdGhlIGFzeW5jaHJvbm91cyBmdW5jdGlvbiB0byB3cmFwXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9uc30gVGhlIHdyYXBwZWQgZnVuY3Rpb24sIHdoaWNoIHdoZW4gaW52b2tlZCwgd2lsbCByZXRyeSBvblxuICAgICAqIGFuIGVycm9yLCBiYXNlZCBvbiB0aGUgcGFyYW1ldGVycyBzcGVjaWZpZWQgaW4gYG9wdHNgLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBhc3luYy5hdXRvKHtcbiAgICAgKiAgICAgZGVwMTogYXN5bmMucmV0cnlhYmxlKDMsIGdldEZyb21GbGFreVNlcnZpY2UpLFxuICAgICAqICAgICBwcm9jZXNzOiBbXCJkZXAxXCIsIGFzeW5jLnJldHJ5YWJsZSgzLCBmdW5jdGlvbiAocmVzdWx0cywgY2IpIHtcbiAgICAgKiAgICAgICAgIG1heWJlUHJvY2Vzc0RhdGEocmVzdWx0cy5kZXAxLCBjYik7XG4gICAgICogICAgIH0pXVxuICAgICAqIH0sIGNhbGxiYWNrKTtcbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXRyeWFibGUgKG9wdHMsIHRhc2spIHtcbiAgICAgICAgaWYgKCF0YXNrKSB7XG4gICAgICAgICAgICB0YXNrID0gb3B0cztcbiAgICAgICAgICAgIG9wdHMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbml0aWFsUGFyYW1zKGZ1bmN0aW9uIChhcmdzLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgZnVuY3Rpb24gdGFza0ZuKGNiKSB7XG4gICAgICAgICAgICAgICAgdGFzay5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbY2JdKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRzKSByZXRyeShvcHRzLCB0YXNrRm4sIGNhbGxiYWNrKTtlbHNlIHJldHJ5KHRhc2tGbiwgY2FsbGJhY2spO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc2FtZSBhcyBgc29tZWAgYnV0IHJ1bnMgYSBtYXhpbXVtIG9mIGBsaW1pdGAgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUuXG4gICAgICpcbiAgICAgKiBAbmFtZSBzb21lTGltaXRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5zb21lXG4gICAgICogQGFsaWFzIGFueUxpbWl0XG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbCAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxpbWl0IC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGFzeW5jIG9wZXJhdGlvbnMgYXQgYSB0aW1lLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSB0cnV0aCB0ZXN0IHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBpbiB0aGUgYXJyYXlcbiAgICAgKiBpbiBwYXJhbGxlbC4gVGhlIGl0ZXJhdGVlIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHRydXRoVmFsdWUpYCB3aGljaCBtdXN0XG4gICAgICogYmUgY2FsbGVkIHdpdGggYSBib29sZWFuIGFyZ3VtZW50IG9uY2UgaXQgaGFzIGNvbXBsZXRlZC4gSW52b2tlZCB3aXRoXG4gICAgICogKGl0ZW0sIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgYXMgc29vbiBhcyBhbnlcbiAgICAgKiBpdGVyYXRlZSByZXR1cm5zIGB0cnVlYCwgb3IgYWZ0ZXIgYWxsIHRoZSBpdGVyYXRlZSBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZC5cbiAgICAgKiBSZXN1bHQgd2lsbCBiZSBlaXRoZXIgYHRydWVgIG9yIGBmYWxzZWAgZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZXMgb2YgdGhlIGFzeW5jXG4gICAgICogdGVzdHMuIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHQpLlxuICAgICAqL1xuICAgIHZhciBzb21lTGltaXQgPSBfY3JlYXRlVGVzdGVyKGVhY2hPZkxpbWl0LCBCb29sZWFuLCBpZGVudGl0eSk7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGB0cnVlYCBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgYGNvbGxgIHNhdGlzZmllcyBhbiBhc3luYyB0ZXN0LlxuICAgICAqIElmIGFueSBpdGVyYXRlZSBjYWxsIHJldHVybnMgYHRydWVgLCB0aGUgbWFpbiBgY2FsbGJhY2tgIGlzIGltbWVkaWF0ZWx5XG4gICAgICogY2FsbGVkLlxuICAgICAqXG4gICAgICogQG5hbWUgc29tZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAYWxpYXMgYW55XG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbCAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBBIHRydXRoIHRlc3QgdG8gYXBwbHkgdG8gZWFjaCBpdGVtIGluIHRoZSBhcnJheVxuICAgICAqIGluIHBhcmFsbGVsLiBUaGUgaXRlcmF0ZWUgaXMgcGFzc2VkIGEgYGNhbGxiYWNrKGVyciwgdHJ1dGhWYWx1ZSlgIHdoaWNoIG11c3RcbiAgICAgKiBiZSBjYWxsZWQgd2l0aCBhIGJvb2xlYW4gYXJndW1lbnQgb25jZSBpdCBoYXMgY29tcGxldGVkLiBJbnZva2VkIHdpdGhcbiAgICAgKiAoaXRlbSwgY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhcyBzb29uIGFzIGFueVxuICAgICAqIGl0ZXJhdGVlIHJldHVybnMgYHRydWVgLCBvciBhZnRlciBhbGwgdGhlIGl0ZXJhdGVlIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLlxuICAgICAqIFJlc3VsdCB3aWxsIGJlIGVpdGhlciBgdHJ1ZWAgb3IgYGZhbHNlYCBkZXBlbmRpbmcgb24gdGhlIHZhbHVlcyBvZiB0aGUgYXN5bmNcbiAgICAgKiB0ZXN0cy4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdCkuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGFzeW5jLnNvbWUoWydmaWxlMScsJ2ZpbGUyJywnZmlsZTMnXSwgZnVuY3Rpb24oZmlsZVBhdGgsIGNhbGxiYWNrKSB7XG4gICAgICogICAgIGZzLmFjY2VzcyhmaWxlUGF0aCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsLCAhZXJyKVxuICAgICAqICAgICB9KTtcbiAgICAgKiB9LCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAqICAgICAvLyBpZiByZXN1bHQgaXMgdHJ1ZSB0aGVuIGF0IGxlYXN0IG9uZSBvZiB0aGUgZmlsZXMgZXhpc3RzXG4gICAgICogfSk7XG4gICAgICovXG4gICAgdmFyIHNvbWUgPSBkb0xpbWl0KHNvbWVMaW1pdCwgSW5maW5pdHkpO1xuXG4gICAgLyoqXG4gICAgICogVGhlIHNhbWUgYXMgYHNvbWVgIGJ1dCBydW5zIG9ubHkgYSBzaW5nbGUgYXN5bmMgb3BlcmF0aW9uIGF0IGEgdGltZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHNvbWVTZXJpZXNcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5zb21lXG4gICAgICogQGFsaWFzIGFueVNlcmllc1xuICAgICAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheXxPYmplY3R9IGNvbGwgLSBBIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSB0cnV0aCB0ZXN0IHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBpbiB0aGUgYXJyYXlcbiAgICAgKiBpbiBwYXJhbGxlbC4gVGhlIGl0ZXJhdGVlIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHRydXRoVmFsdWUpYCB3aGljaCBtdXN0XG4gICAgICogYmUgY2FsbGVkIHdpdGggYSBib29sZWFuIGFyZ3VtZW50IG9uY2UgaXQgaGFzIGNvbXBsZXRlZC4gSW52b2tlZCB3aXRoXG4gICAgICogKGl0ZW0sIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgYXMgc29vbiBhcyBhbnlcbiAgICAgKiBpdGVyYXRlZSByZXR1cm5zIGB0cnVlYCwgb3IgYWZ0ZXIgYWxsIHRoZSBpdGVyYXRlZSBmdW5jdGlvbnMgaGF2ZSBmaW5pc2hlZC5cbiAgICAgKiBSZXN1bHQgd2lsbCBiZSBlaXRoZXIgYHRydWVgIG9yIGBmYWxzZWAgZGVwZW5kaW5nIG9uIHRoZSB2YWx1ZXMgb2YgdGhlIGFzeW5jXG4gICAgICogdGVzdHMuIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHQpLlxuICAgICAqL1xuICAgIHZhciBzb21lU2VyaWVzID0gZG9MaW1pdChzb21lTGltaXQsIDEpO1xuXG4gICAgLyoqXG4gICAgICogU29ydHMgYSBsaXN0IGJ5IHRoZSByZXN1bHRzIG9mIHJ1bm5pbmcgZWFjaCBgY29sbGAgdmFsdWUgdGhyb3VnaCBhbiBhc3luY1xuICAgICAqIGBpdGVyYXRlZWAuXG4gICAgICpcbiAgICAgKiBAbmFtZSBzb3J0QnlcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbCAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBBIGZ1bmN0aW9uIHRvIGFwcGx5IHRvIGVhY2ggaXRlbSBpbiBgY29sbGAuXG4gICAgICogVGhlIGl0ZXJhdGVlIGlzIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIsIHNvcnRWYWx1ZSlgIHdoaWNoIG11c3QgYmUgY2FsbGVkIG9uY2VcbiAgICAgKiBpdCBoYXMgY29tcGxldGVkIHdpdGggYW4gZXJyb3IgKHdoaWNoIGNhbiBiZSBgbnVsbGApIGFuZCBhIHZhbHVlIHRvIHVzZSBhc1xuICAgICAqIHRoZSBzb3J0IGNyaXRlcmlhLiBJbnZva2VkIHdpdGggKGl0ZW0sIGNhbGxiYWNrKS5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIC0gQSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgYWZ0ZXIgYWxsIHRoZVxuICAgICAqIGBpdGVyYXRlZWAgZnVuY3Rpb25zIGhhdmUgZmluaXNoZWQsIG9yIGFuIGVycm9yIG9jY3Vycy4gUmVzdWx0cyBpcyB0aGUgaXRlbXNcbiAgICAgKiBmcm9tIHRoZSBvcmlnaW5hbCBgY29sbGAgc29ydGVkIGJ5IHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgdGhlIGBpdGVyYXRlZWBcbiAgICAgKiBjYWxscy4gSW52b2tlZCB3aXRoIChlcnIsIHJlc3VsdHMpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBhc3luYy5zb3J0QnkoWydmaWxlMScsJ2ZpbGUyJywnZmlsZTMnXSwgZnVuY3Rpb24oZmlsZSwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgZnMuc3RhdChmaWxlLCBmdW5jdGlvbihlcnIsIHN0YXRzKSB7XG4gICAgICogICAgICAgICBjYWxsYmFjayhlcnIsIHN0YXRzLm10aW1lKTtcbiAgICAgKiAgICAgfSk7XG4gICAgICogfSwgZnVuY3Rpb24oZXJyLCByZXN1bHRzKSB7XG4gICAgICogICAgIC8vIHJlc3VsdHMgaXMgbm93IHRoZSBvcmlnaW5hbCBhcnJheSBvZiBmaWxlcyBzb3J0ZWQgYnlcbiAgICAgKiAgICAgLy8gbW9kaWZpZWQgZGF0ZVxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogLy8gQnkgbW9kaWZ5aW5nIHRoZSBjYWxsYmFjayBwYXJhbWV0ZXIgdGhlXG4gICAgICogLy8gc29ydGluZyBvcmRlciBjYW4gYmUgaW5mbHVlbmNlZDpcbiAgICAgKlxuICAgICAqIC8vIGFzY2VuZGluZyBvcmRlclxuICAgICAqIGFzeW5jLnNvcnRCeShbMSw5LDMsNV0sIGZ1bmN0aW9uKHgsIGNhbGxiYWNrKSB7XG4gICAgICogICAgIGNhbGxiYWNrKG51bGwsIHgpO1xuICAgICAqIH0sIGZ1bmN0aW9uKGVycixyZXN1bHQpIHtcbiAgICAgKiAgICAgLy8gcmVzdWx0IGNhbGxiYWNrXG4gICAgICogfSk7XG4gICAgICpcbiAgICAgKiAvLyBkZXNjZW5kaW5nIG9yZGVyXG4gICAgICogYXN5bmMuc29ydEJ5KFsxLDksMyw1XSwgZnVuY3Rpb24oeCwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgY2FsbGJhY2sobnVsbCwgeCotMSk7ICAgIC8vPC0geCotMSBpbnN0ZWFkIG9mIHgsIHR1cm5zIHRoZSBvcmRlciBhcm91bmRcbiAgICAgKiB9LCBmdW5jdGlvbihlcnIscmVzdWx0KSB7XG4gICAgICogICAgIC8vIHJlc3VsdCBjYWxsYmFja1xuICAgICAqIH0pO1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNvcnRCeShhcnIsIGl0ZXJhdGVlLCBjYikge1xuICAgICAgICBtYXAoYXJyLCBmdW5jdGlvbiAoeCwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdGVlKHgsIGZ1bmN0aW9uIChlcnIsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG4gICAgICAgICAgICAgICAgY2IobnVsbCwgeyB2YWx1ZTogeCwgY3JpdGVyaWE6IGNyaXRlcmlhIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHJldHVybiBjYihlcnIpO1xuICAgICAgICAgICAgY2IobnVsbCwgYXJyYXlNYXAocmVzdWx0cy5zb3J0KGNvbXBhcmF0b3IpLCBiYXNlUHJvcGVydHkoJ3ZhbHVlJykpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY29tcGFyYXRvcihsZWZ0LCByaWdodCkge1xuICAgICAgICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhLFxuICAgICAgICAgICAgICAgIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgYSB0aW1lIGxpbWl0IG9uIGFuIGFzeW5jaHJvbm91cyBmdW5jdGlvbi4gSWYgdGhlIGZ1bmN0aW9uIGRvZXMgbm90IGNhbGxcbiAgICAgKiBpdHMgY2FsbGJhY2sgd2l0aGluIHRoZSBzcGVjaWZpZWQgbWlsaXNlY29uZHMsIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYVxuICAgICAqIHRpbWVvdXQgZXJyb3IuIFRoZSBjb2RlIHByb3BlcnR5IGZvciB0aGUgZXJyb3Igb2JqZWN0IHdpbGwgYmUgYCdFVElNRURPVVQnYC5cbiAgICAgKlxuICAgICAqIEBuYW1lIHRpbWVvdXRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IFV0aWxcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jdGlvbiAtIFRoZSBhc3luY2hyb25vdXMgZnVuY3Rpb24geW91IHdhbnQgdG8gc2V0IHRoZVxuICAgICAqIHRpbWUgbGltaXQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbGlzZWNvbmRzIC0gVGhlIHNwZWNpZmllZCB0aW1lIGxpbWl0LlxuICAgICAqIEBwYXJhbSB7Kn0gW2luZm9dIC0gQW55IHZhcmlhYmxlIHlvdSB3YW50IGF0dGFjaGVkIChgc3RyaW5nYCwgYG9iamVjdGAsIGV0YylcbiAgICAgKiB0byB0aW1lb3V0IEVycm9yIGZvciBtb3JlIGluZm9ybWF0aW9uLi5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYSB3cmFwcGVkIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBhbnkgb2ZcbiAgICAgKiB0aGUgY29udHJvbCBmbG93IGZ1bmN0aW9ucy5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYXN5bmMudGltZW91dChmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAqICAgICBkb0FzeW5jVGFzayhjYWxsYmFjayk7XG4gICAgICogfSwgMTAwMCk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gdGltZW91dChhc3luY0ZuLCBtaWxpc2Vjb25kcywgaW5mbykge1xuICAgICAgICB2YXIgb3JpZ2luYWxDYWxsYmFjaywgdGltZXI7XG4gICAgICAgIHZhciB0aW1lZE91dCA9IGZhbHNlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGluamVjdGVkQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICBpZiAoIXRpbWVkT3V0KSB7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxDYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB0aW1lb3V0Q2FsbGJhY2soKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IGFzeW5jRm4ubmFtZSB8fCAnYW5vbnltb3VzJztcbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvcignQ2FsbGJhY2sgZnVuY3Rpb24gXCInICsgbmFtZSArICdcIiB0aW1lZCBvdXQuJyk7XG4gICAgICAgICAgICBlcnJvci5jb2RlID0gJ0VUSU1FRE9VVCc7XG4gICAgICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgICAgIGVycm9yLmluZm8gPSBpbmZvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGltZWRPdXQgPSB0cnVlO1xuICAgICAgICAgICAgb3JpZ2luYWxDYWxsYmFjayhlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5pdGlhbFBhcmFtcyhmdW5jdGlvbiAoYXJncywgb3JpZ0NhbGxiYWNrKSB7XG4gICAgICAgICAgICBvcmlnaW5hbENhbGxiYWNrID0gb3JpZ0NhbGxiYWNrO1xuICAgICAgICAgICAgLy8gc2V0dXAgdGltZXIgYW5kIGNhbGwgb3JpZ2luYWwgZnVuY3Rpb25cbiAgICAgICAgICAgIHRpbWVyID0gc2V0VGltZW91dCh0aW1lb3V0Q2FsbGJhY2ssIG1pbGlzZWNvbmRzKTtcbiAgICAgICAgICAgIGFzeW5jRm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoaW5qZWN0ZWRDYWxsYmFjaykpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG4gICAgdmFyIG5hdGl2ZUNlaWwgPSBNYXRoLmNlaWw7XG4gICAgdmFyIG5hdGl2ZU1heCQxID0gTWF0aC5tYXg7XG4gICAgLyoqXG4gICAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ucmFuZ2VgIGFuZCBgXy5yYW5nZVJpZ2h0YCB3aGljaCBkb2Vzbid0XG4gICAgICogY29lcmNlIGFyZ3VtZW50cyB0byBudW1iZXJzLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gc3RhcnQgVGhlIHN0YXJ0IG9mIHRoZSByYW5nZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZW5kIFRoZSBlbmQgb2YgdGhlIHJhbmdlLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwIFRoZSB2YWx1ZSB0byBpbmNyZW1lbnQgb3IgZGVjcmVtZW50IGJ5LlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgcmFuZ2Ugb2YgbnVtYmVycy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBiYXNlUmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCwgZnJvbVJpZ2h0KSB7XG4gICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgkMShuYXRpdmVDZWlsKChlbmQgLSBzdGFydCkgLyAoc3RlcCB8fCAxKSksIDApLFxuICAgICAgICAgIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICByZXN1bHRbZnJvbVJpZ2h0ID8gbGVuZ3RoIDogKytpbmRleF0gPSBzdGFydDtcbiAgICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBUaGUgc2FtZSBhcyB7QGxpbmsgdGltZXN9IGJ1dCBydW5zIGEgbWF4aW11bSBvZiBgbGltaXRgIGFzeW5jIG9wZXJhdGlvbnMgYXQgYVxuICAgICogdGltZS5cbiAgICAgKlxuICAgICAqIEBuYW1lIHRpbWVzTGltaXRcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy50aW1lc1xuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbiAtIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gcnVuIHRoZSBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXQgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgYXN5bmMgb3BlcmF0aW9ucyBhdCBhIHRpbWUuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBUaGUgZnVuY3Rpb24gdG8gY2FsbCBgbmAgdGltZXMuIEludm9rZWQgd2l0aCB0aGVcbiAgICAgKiBpdGVyYXRpb24gaW5kZXggYW5kIGEgY2FsbGJhY2sgKG4sIG5leHQpLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gc2VlIHtAbGluayBhc3luYy5tYXB9LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRpbWVMaW1pdChjb3VudCwgbGltaXQsIGl0ZXJhdGVlLCBjYikge1xuICAgICAgcmV0dXJuIG1hcExpbWl0KGJhc2VSYW5nZSgwLCBjb3VudCwgMSksIGxpbWl0LCBpdGVyYXRlZSwgY2IpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENhbGxzIHRoZSBgaXRlcmF0ZWVgIGZ1bmN0aW9uIGBuYCB0aW1lcywgYW5kIGFjY3VtdWxhdGVzIHJlc3VsdHMgaW4gdGhlIHNhbWVcbiAgICAgKiBtYW5uZXIgeW91IHdvdWxkIHVzZSB3aXRoIHtAbGluayBhc3luYy5tYXB9LlxuICAgICAqXG4gICAgICogQG5hbWUgdGltZXNcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy5tYXBcbiAgICAgKiBAY2F0ZWdvcnkgQ29udHJvbCBGbG93XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG4gLSBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIHJ1biB0aGUgZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgLSBUaGUgZnVuY3Rpb24gdG8gY2FsbCBgbmAgdGltZXMuIEludm9rZWQgd2l0aCB0aGVcbiAgICAgKiBpdGVyYXRpb24gaW5kZXggYW5kIGEgY2FsbGJhY2sgKG4sIG5leHQpLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gc2VlIHtAbGluayBhc3luYy5tYXB9LlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiAvLyBQcmV0ZW5kIHRoaXMgaXMgc29tZSBjb21wbGljYXRlZCBhc3luYyBmYWN0b3J5XG4gICAgICogdmFyIGNyZWF0ZVVzZXIgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgY2FsbGJhY2sobnVsbCwge1xuICAgICAqICAgICAgICAgaWQ6ICd1c2VyJyArIGlkXG4gICAgICogICAgIH0pO1xuICAgICAqIH07XG4gICAgICpcbiAgICAgKiAvLyBnZW5lcmF0ZSA1IHVzZXJzXG4gICAgICogYXN5bmMudGltZXMoNSwgZnVuY3Rpb24obiwgbmV4dCkge1xuICAgICAqICAgICBjcmVhdGVVc2VyKG4sIGZ1bmN0aW9uKGVyciwgdXNlcikge1xuICAgICAqICAgICAgICAgbmV4dChlcnIsIHVzZXIpO1xuICAgICAqICAgICB9KTtcbiAgICAgKiB9LCBmdW5jdGlvbihlcnIsIHVzZXJzKSB7XG4gICAgICogICAgIC8vIHdlIHNob3VsZCBub3cgaGF2ZSA1IHVzZXJzXG4gICAgICogfSk7XG4gICAgICovXG4gICAgdmFyIHRpbWVzID0gZG9MaW1pdCh0aW1lTGltaXQsIEluZmluaXR5KTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBzYW1lIGFzIHtAbGluayBhc3luYy50aW1lc30gYnV0IHJ1bnMgb25seSBhIHNpbmdsZSBhc3luYyBvcGVyYXRpb24gYXQgYSB0aW1lLlxuICAgICAqXG4gICAgICogQG5hbWUgdGltZXNTZXJpZXNcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy50aW1lc1xuICAgICAqIEBjYXRlZ29yeSBDb250cm9sIEZsb3dcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbiAtIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gcnVuIHRoZSBmdW5jdGlvbi5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSAtIFRoZSBmdW5jdGlvbiB0byBjYWxsIGBuYCB0aW1lcy4gSW52b2tlZCB3aXRoIHRoZVxuICAgICAqIGl0ZXJhdGlvbiBpbmRleCBhbmQgYSBjYWxsYmFjayAobiwgbmV4dCkuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgLSBzZWUge0BsaW5rIGFzeW5jLm1hcH0uXG4gICAgICovXG4gICAgdmFyIHRpbWVzU2VyaWVzID0gZG9MaW1pdCh0aW1lTGltaXQsIDEpO1xuXG4gICAgLyoqXG4gICAgICogQSByZWxhdGl2ZSBvZiBgcmVkdWNlYC4gIFRha2VzIGFuIE9iamVjdCBvciBBcnJheSwgYW5kIGl0ZXJhdGVzIG92ZXIgZWFjaFxuICAgICAqIGVsZW1lbnQgaW4gc2VyaWVzLCBlYWNoIHN0ZXAgcG90ZW50aWFsbHkgbXV0YXRpbmcgYW4gYGFjY3VtdWxhdG9yYCB2YWx1ZS5cbiAgICAgKiBUaGUgdHlwZSBvZiB0aGUgYWNjdW11bGF0b3IgZGVmYXVsdHMgdG8gdGhlIHR5cGUgb2YgY29sbGVjdGlvbiBwYXNzZWQgaW4uXG4gICAgICpcbiAgICAgKiBAbmFtZSB0cmFuc2Zvcm1cbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IENvbGxlY3Rpb25cbiAgICAgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29sbCAtIEEgY29sbGVjdGlvbiB0byBpdGVyYXRlIG92ZXIuXG4gICAgICogQHBhcmFtIHsqfSBbYWNjdW11bGF0b3JdIC0gVGhlIGluaXRpYWwgc3RhdGUgb2YgdGhlIHRyYW5zZm9ybS4gIElmIG9taXR0ZWQsXG4gICAgICogaXQgd2lsbCBkZWZhdWx0IHRvIGFuIGVtcHR5IE9iamVjdCBvciBBcnJheSwgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIGBjb2xsYFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIC0gQSBmdW5jdGlvbiBhcHBsaWVkIHRvIGVhY2ggaXRlbSBpbiB0aGVcbiAgICAgKiBjb2xsZWN0aW9uIHRoYXQgcG90ZW50aWFsbHkgbW9kaWZpZXMgdGhlIGFjY3VtdWxhdG9yLiBUaGUgYGl0ZXJhdGVlYCBpc1xuICAgICAqIHBhc3NlZCBhIGBjYWxsYmFjayhlcnIpYCB3aGljaCBhY2NlcHRzIGFuIG9wdGlvbmFsIGVycm9yIGFzIGl0cyBmaXJzdFxuICAgICAqIGFyZ3VtZW50LiBJZiBhbiBlcnJvciBpcyBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrLCB0aGUgdHJhbnNmb3JtIGlzIHN0b3BwZWRcbiAgICAgKiBhbmQgdGhlIG1haW4gYGNhbGxiYWNrYCBpcyBpbW1lZGlhdGVseSBjYWxsZWQgd2l0aCB0aGUgZXJyb3IuXG4gICAgICogSW52b2tlZCB3aXRoIChhY2N1bXVsYXRvciwgaXRlbSwga2V5LCBjYWxsYmFjaykuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSAtIEEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIGFmdGVyIGFsbCB0aGVcbiAgICAgKiBgaXRlcmF0ZWVgIGZ1bmN0aW9ucyBoYXZlIGZpbmlzaGVkLiBSZXN1bHQgaXMgdGhlIHRyYW5zZm9ybWVkIGFjY3VtdWxhdG9yLlxuICAgICAqIEludm9rZWQgd2l0aCAoZXJyLCByZXN1bHQpLlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBhc3luYy50cmFuc2Zvcm0oWzEsMiwzXSwgZnVuY3Rpb24oYWNjLCBpdGVtLCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgLy8gcG9pbnRsZXNzIGFzeW5jOlxuICAgICAqICAgICBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCkge1xuICAgICAqICAgICAgICAgYWNjLnB1c2goaXRlbSAqIDIpXG4gICAgICogICAgICAgICBjYWxsYmFjayhudWxsKVxuICAgICAqICAgICB9KTtcbiAgICAgKiB9LCBmdW5jdGlvbihlcnIsIHJlc3VsdCkge1xuICAgICAqICAgICAvLyByZXN1bHQgaXMgbm93IGVxdWFsIHRvIFsyLCA0LCA2XVxuICAgICAqIH0pO1xuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKlxuICAgICAqIGFzeW5jLnRyYW5zZm9ybSh7YTogMSwgYjogMiwgYzogM30sIGZ1bmN0aW9uIChvYmosIHZhbCwga2V5LCBjYWxsYmFjaykge1xuICAgICAqICAgICBzZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAqICAgICAgICAgb2JqW2tleV0gPSB2YWwgKiAyO1xuICAgICAqICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgKiAgICAgfSlcbiAgICAgKiB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHQpIHtcbiAgICAgKiAgICAgLy8gcmVzdWx0IGlzIGVxdWFsIHRvIHthOiAyLCBiOiA0LCBjOiA2fVxuICAgICAqIH0pXG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtKGFyciwgYWNjLCBpdGVyYXRlZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gaXRlcmF0ZWU7XG4gICAgICAgICAgICBpdGVyYXRlZSA9IGFjYztcbiAgICAgICAgICAgIGFjYyA9IGlzQXJyYXkoYXJyKSA/IFtdIDoge307XG4gICAgICAgIH1cblxuICAgICAgICBlYWNoT2YoYXJyLCBmdW5jdGlvbiAodiwgaywgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdGVlKGFjYywgdiwgaywgY2IpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIGFjYyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFVuZG9lcyBhIHtAbGluayBhc3luYy5tZW1vaXplfWQgZnVuY3Rpb24sIHJldmVydGluZyBpdCB0byB0aGUgb3JpZ2luYWwsXG4gICAgICogdW5tZW1vaXplZCBmb3JtLiBIYW5keSBmb3IgdGVzdGluZy5cbiAgICAgKlxuICAgICAqIEBuYW1lIHVubWVtb2l6ZVxuICAgICAqIEBzdGF0aWNcbiAgICAgKiBAbWVtYmVyT2YgYXN5bmNcbiAgICAgKiBAc2VlIGFzeW5jLm1lbW9pemVcbiAgICAgKiBAY2F0ZWdvcnkgVXRpbFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIC0gdGhlIG1lbW9pemVkIGZ1bmN0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5tZW1vaXplKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZuLnVubWVtb2l6ZWQgfHwgZm4pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVwZWF0ZWRseSBjYWxsIGBmbmAgdW50aWwgYHRlc3RgIHJldHVybnMgYHRydWVgLiBDYWxscyBgY2FsbGJhY2tgIHdoZW5cbiAgICAgKiBzdG9wcGVkLCBvciBhbiBlcnJvciBvY2N1cnMuIGBjYWxsYmFja2Agd2lsbCBiZSBwYXNzZWQgYW4gZXJyb3IgYW5kIGFueVxuICAgICAqIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIGZpbmFsIGBmbmAncyBjYWxsYmFjay5cbiAgICAgKlxuICAgICAqIFRoZSBpbnZlcnNlIG9mIHtAbGluayBhc3luYy53aGlsc3R9LlxuICAgICAqXG4gICAgICogQG5hbWUgdW50aWxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQHNlZSBhc3luYy53aGlsc3RcbiAgICAgKiBAY2F0ZWdvcnkgQ29udHJvbCBGbG93XG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gdGVzdCAtIHN5bmNocm9ub3VzIHRydXRoIHRlc3QgdG8gcGVyZm9ybSBiZWZvcmUgZWFjaFxuICAgICAqIGV4ZWN1dGlvbiBvZiBgZm5gLiBJbnZva2VkIHdpdGggKCkuXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gLSBBIGZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCBlYWNoIHRpbWUgYHRlc3RgIGZhaWxzLlxuICAgICAqIFRoZSBmdW5jdGlvbiBpcyBwYXNzZWQgYSBgY2FsbGJhY2soZXJyKWAsIHdoaWNoIG11c3QgYmUgY2FsbGVkIG9uY2UgaXQgaGFzXG4gICAgICogY29tcGxldGVkIHdpdGggYW4gb3B0aW9uYWwgYGVycmAgYXJndW1lbnQuIEludm9rZWQgd2l0aCAoY2FsbGJhY2spLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBhZnRlciB0aGUgdGVzdFxuICAgICAqIGZ1bmN0aW9uIGhhcyBwYXNzZWQgYW5kIHJlcGVhdGVkIGV4ZWN1dGlvbiBvZiBgZm5gIGhhcyBzdG9wcGVkLiBgY2FsbGJhY2tgXG4gICAgICogd2lsbCBiZSBwYXNzZWQgYW4gZXJyb3IgYW5kIGFueSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBmaW5hbCBgZm5gJ3NcbiAgICAgKiBjYWxsYmFjay4gSW52b2tlZCB3aXRoIChlcnIsIFtyZXN1bHRzXSk7XG4gICAgICovXG4gICAgZnVuY3Rpb24gdW50aWwodGVzdCwgaXRlcmF0ZWUsIGNiKSB7XG4gICAgICAgIHJldHVybiB3aGlsc3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdGVlLCBjYik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB0aGUgYHRhc2tzYCBhcnJheSBvZiBmdW5jdGlvbnMgaW4gc2VyaWVzLCBlYWNoIHBhc3NpbmcgdGhlaXIgcmVzdWx0cyB0b1xuICAgICAqIHRoZSBuZXh0IGluIHRoZSBhcnJheS4gSG93ZXZlciwgaWYgYW55IG9mIHRoZSBgdGFza3NgIHBhc3MgYW4gZXJyb3IgdG8gdGhlaXJcbiAgICAgKiBvd24gY2FsbGJhY2ssIHRoZSBuZXh0IGZ1bmN0aW9uIGlzIG5vdCBleGVjdXRlZCwgYW5kIHRoZSBtYWluIGBjYWxsYmFja2AgaXNcbiAgICAgKiBpbW1lZGlhdGVseSBjYWxsZWQgd2l0aCB0aGUgZXJyb3IuXG4gICAgICpcbiAgICAgKiBAbmFtZSB3YXRlcmZhbGxcbiAgICAgKiBAc3RhdGljXG4gICAgICogQG1lbWJlck9mIGFzeW5jXG4gICAgICogQGNhdGVnb3J5IENvbnRyb2wgRmxvd1xuICAgICAqIEBwYXJhbSB7QXJyYXl9IHRhc2tzIC0gQW4gYXJyYXkgb2YgZnVuY3Rpb25zIHRvIHJ1biwgZWFjaCBmdW5jdGlvbiBpcyBwYXNzZWRcbiAgICAgKiBhIGBjYWxsYmFjayhlcnIsIHJlc3VsdDEsIHJlc3VsdDIsIC4uLilgIGl0IG11c3QgY2FsbCBvbiBjb21wbGV0aW9uLiBUaGVcbiAgICAgKiBmaXJzdCBhcmd1bWVudCBpcyBhbiBlcnJvciAod2hpY2ggY2FuIGJlIGBudWxsYCkgYW5kIGFueSBmdXJ0aGVyIGFyZ3VtZW50c1xuICAgICAqIHdpbGwgYmUgcGFzc2VkIGFzIGFyZ3VtZW50cyBpbiBvcmRlciB0byB0aGUgbmV4dCB0YXNrLlxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gLSBBbiBvcHRpb25hbCBjYWxsYmFjayB0byBydW4gb25jZSBhbGwgdGhlXG4gICAgICogZnVuY3Rpb25zIGhhdmUgY29tcGxldGVkLiBUaGlzIHdpbGwgYmUgcGFzc2VkIHRoZSByZXN1bHRzIG9mIHRoZSBsYXN0IHRhc2snc1xuICAgICAqIGNhbGxiYWNrLiBJbnZva2VkIHdpdGggKGVyciwgW3Jlc3VsdHNdKS5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYXN5bmMud2F0ZXJmYWxsKFtcbiAgICAgKiAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgICAgIGNhbGxiYWNrKG51bGwsICdvbmUnLCAndHdvJyk7XG4gICAgICogICAgIH0sXG4gICAgICogICAgIGZ1bmN0aW9uKGFyZzEsIGFyZzIsIGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ29uZScgYW5kIGFyZzIgbm93IGVxdWFscyAndHdvJ1xuICAgICAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ3RocmVlJyk7XG4gICAgICogICAgIH0sXG4gICAgICogICAgIGZ1bmN0aW9uKGFyZzEsIGNhbGxiYWNrKSB7XG4gICAgICogICAgICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ3RocmVlJ1xuICAgICAqICAgICAgICAgY2FsbGJhY2sobnVsbCwgJ2RvbmUnKTtcbiAgICAgKiAgICAgfVxuICAgICAqIF0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAqICAgICAvLyByZXN1bHQgbm93IGVxdWFscyAnZG9uZSdcbiAgICAgKiB9KTtcbiAgICAgKlxuICAgICAqIC8vIE9yLCB3aXRoIG5hbWVkIGZ1bmN0aW9uczpcbiAgICAgKiBhc3luYy53YXRlcmZhbGwoW1xuICAgICAqICAgICBteUZpcnN0RnVuY3Rpb24sXG4gICAgICogICAgIG15U2Vjb25kRnVuY3Rpb24sXG4gICAgICogICAgIG15TGFzdEZ1bmN0aW9uLFxuICAgICAqIF0sIGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAqICAgICAvLyByZXN1bHQgbm93IGVxdWFscyAnZG9uZSdcbiAgICAgKiB9KTtcbiAgICAgKiBmdW5jdGlvbiBteUZpcnN0RnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgKiAgICAgY2FsbGJhY2sobnVsbCwgJ29uZScsICd0d28nKTtcbiAgICAgKiB9XG4gICAgICogZnVuY3Rpb24gbXlTZWNvbmRGdW5jdGlvbihhcmcxLCBhcmcyLCBjYWxsYmFjaykge1xuICAgICAqICAgICAvLyBhcmcxIG5vdyBlcXVhbHMgJ29uZScgYW5kIGFyZzIgbm93IGVxdWFscyAndHdvJ1xuICAgICAqICAgICBjYWxsYmFjayhudWxsLCAndGhyZWUnKTtcbiAgICAgKiB9XG4gICAgICogZnVuY3Rpb24gbXlMYXN0RnVuY3Rpb24oYXJnMSwgY2FsbGJhY2spIHtcbiAgICAgKiAgICAgLy8gYXJnMSBub3cgZXF1YWxzICd0aHJlZSdcbiAgICAgKiAgICAgY2FsbGJhY2sobnVsbCwgJ2RvbmUnKTtcbiAgICAgKiB9XG4gICAgICovXG4gICAgZnVuY3Rpb24gd2F0ZXJmYWxsICh0YXNrcywgY2IpIHtcbiAgICAgICAgY2IgPSBvbmNlKGNiIHx8IG5vb3ApO1xuICAgICAgICBpZiAoIWlzQXJyYXkodGFza3MpKSByZXR1cm4gY2IobmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKSk7XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSByZXR1cm4gY2IoKTtcbiAgICAgICAgdmFyIHRhc2tJbmRleCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gbmV4dFRhc2soYXJncykge1xuICAgICAgICAgICAgaWYgKHRhc2tJbmRleCA9PT0gdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiLmFwcGx5KG51bGwsIFtudWxsXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdGFza0NhbGxiYWNrID0gb25seU9uY2UocmVzdChmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2IuYXBwbHkobnVsbCwgW2Vycl0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmV4dFRhc2soYXJncyk7XG4gICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgICAgIGFyZ3MucHVzaCh0YXNrQ2FsbGJhY2spO1xuXG4gICAgICAgICAgICB2YXIgdGFzayA9IHRhc2tzW3Rhc2tJbmRleCsrXTtcbiAgICAgICAgICAgIHRhc2suYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgIH1cblxuICAgICAgICBuZXh0VGFzayhbXSk7XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0ge1xuICAgICAgICBhcHBseUVhY2g6IGFwcGx5RWFjaCxcbiAgICAgICAgYXBwbHlFYWNoU2VyaWVzOiBhcHBseUVhY2hTZXJpZXMsXG4gICAgICAgIGFwcGx5OiBhcHBseSQxLFxuICAgICAgICBhc3luY2lmeTogYXN5bmNpZnksXG4gICAgICAgIGF1dG86IGF1dG8sXG4gICAgICAgIGF1dG9JbmplY3Q6IGF1dG9JbmplY3QsXG4gICAgICAgIGNhcmdvOiBjYXJnbyxcbiAgICAgICAgY29tcG9zZTogY29tcG9zZSxcbiAgICAgICAgY29uY2F0OiBjb25jYXQsXG4gICAgICAgIGNvbmNhdFNlcmllczogY29uY2F0U2VyaWVzLFxuICAgICAgICBjb25zdGFudDogY29uc3RhbnQsXG4gICAgICAgIGRldGVjdDogZGV0ZWN0LFxuICAgICAgICBkZXRlY3RMaW1pdDogZGV0ZWN0TGltaXQsXG4gICAgICAgIGRldGVjdFNlcmllczogZGV0ZWN0U2VyaWVzLFxuICAgICAgICBkaXI6IGRpcixcbiAgICAgICAgZG9EdXJpbmc6IGRvRHVyaW5nLFxuICAgICAgICBkb1VudGlsOiBkb1VudGlsLFxuICAgICAgICBkb1doaWxzdDogZG9XaGlsc3QsXG4gICAgICAgIGR1cmluZzogZHVyaW5nLFxuICAgICAgICBlYWNoOiBlYWNoLFxuICAgICAgICBlYWNoTGltaXQ6IGVhY2hMaW1pdCxcbiAgICAgICAgZWFjaE9mOiBlYWNoT2YsXG4gICAgICAgIGVhY2hPZkxpbWl0OiBlYWNoT2ZMaW1pdCxcbiAgICAgICAgZWFjaE9mU2VyaWVzOiBlYWNoT2ZTZXJpZXMsXG4gICAgICAgIGVhY2hTZXJpZXM6IGVhY2hTZXJpZXMsXG4gICAgICAgIGVuc3VyZUFzeW5jOiBlbnN1cmVBc3luYyxcbiAgICAgICAgZXZlcnk6IGV2ZXJ5LFxuICAgICAgICBldmVyeUxpbWl0OiBldmVyeUxpbWl0LFxuICAgICAgICBldmVyeVNlcmllczogZXZlcnlTZXJpZXMsXG4gICAgICAgIGZpbHRlcjogZmlsdGVyLFxuICAgICAgICBmaWx0ZXJMaW1pdDogZmlsdGVyTGltaXQsXG4gICAgICAgIGZpbHRlclNlcmllczogZmlsdGVyU2VyaWVzLFxuICAgICAgICBmb3JldmVyOiBmb3JldmVyLFxuICAgICAgICBpdGVyYXRvcjogaXRlcmF0b3IkMSxcbiAgICAgICAgbG9nOiBsb2csXG4gICAgICAgIG1hcDogbWFwLFxuICAgICAgICBtYXBMaW1pdDogbWFwTGltaXQsXG4gICAgICAgIG1hcFNlcmllczogbWFwU2VyaWVzLFxuICAgICAgICBtYXBWYWx1ZXM6IG1hcFZhbHVlcyxcbiAgICAgICAgbWFwVmFsdWVzTGltaXQ6IG1hcFZhbHVlc0xpbWl0LFxuICAgICAgICBtYXBWYWx1ZXNTZXJpZXM6IG1hcFZhbHVlc1NlcmllcyxcbiAgICAgICAgbWVtb2l6ZTogbWVtb2l6ZSQxLFxuICAgICAgICBuZXh0VGljazogbmV4dFRpY2ssXG4gICAgICAgIHBhcmFsbGVsOiBwYXJhbGxlbCxcbiAgICAgICAgcGFyYWxsZWxMaW1pdDogcGFyYWxsZWxMaW1pdCxcbiAgICAgICAgcHJpb3JpdHlRdWV1ZTogcHJpb3JpdHlRdWV1ZSxcbiAgICAgICAgcXVldWU6IHF1ZXVlJDEsXG4gICAgICAgIHJhY2U6IHJhY2UsXG4gICAgICAgIHJlZHVjZTogcmVkdWNlLFxuICAgICAgICByZWR1Y2VSaWdodDogcmVkdWNlUmlnaHQsXG4gICAgICAgIHJlZmxlY3Q6IHJlZmxlY3QsXG4gICAgICAgIHJlZmxlY3RBbGw6IHJlZmxlY3RBbGwsXG4gICAgICAgIHJlamVjdDogcmVqZWN0LFxuICAgICAgICByZWplY3RMaW1pdDogcmVqZWN0TGltaXQsXG4gICAgICAgIHJlamVjdFNlcmllczogcmVqZWN0U2VyaWVzLFxuICAgICAgICByZXRyeTogcmV0cnksXG4gICAgICAgIHJldHJ5YWJsZTogcmV0cnlhYmxlLFxuICAgICAgICBzZXE6IHNlcSxcbiAgICAgICAgc2VyaWVzOiBzZXJpZXMsXG4gICAgICAgIHNldEltbWVkaWF0ZTogc2V0SW1tZWRpYXRlJDEsXG4gICAgICAgIHNvbWU6IHNvbWUsXG4gICAgICAgIHNvbWVMaW1pdDogc29tZUxpbWl0LFxuICAgICAgICBzb21lU2VyaWVzOiBzb21lU2VyaWVzLFxuICAgICAgICBzb3J0Qnk6IHNvcnRCeSxcbiAgICAgICAgdGltZW91dDogdGltZW91dCxcbiAgICAgICAgdGltZXM6IHRpbWVzLFxuICAgICAgICB0aW1lc0xpbWl0OiB0aW1lTGltaXQsXG4gICAgICAgIHRpbWVzU2VyaWVzOiB0aW1lc1NlcmllcyxcbiAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gICAgICAgIHVubWVtb2l6ZTogdW5tZW1vaXplLFxuICAgICAgICB1bnRpbDogdW50aWwsXG4gICAgICAgIHdhdGVyZmFsbDogd2F0ZXJmYWxsLFxuICAgICAgICB3aGlsc3Q6IHdoaWxzdCxcblxuICAgICAgICAvLyBhbGlhc2VzXG4gICAgICAgIGFsbDogZXZlcnksXG4gICAgICAgIGFueTogc29tZSxcbiAgICAgICAgZm9yRWFjaDogZWFjaCxcbiAgICAgICAgZm9yRWFjaFNlcmllczogZWFjaFNlcmllcyxcbiAgICAgICAgZm9yRWFjaExpbWl0OiBlYWNoTGltaXQsXG4gICAgICAgIGZvckVhY2hPZjogZWFjaE9mLFxuICAgICAgICBmb3JFYWNoT2ZTZXJpZXM6IGVhY2hPZlNlcmllcyxcbiAgICAgICAgZm9yRWFjaE9mTGltaXQ6IGVhY2hPZkxpbWl0LFxuICAgICAgICBpbmplY3Q6IHJlZHVjZSxcbiAgICAgICAgZm9sZGw6IHJlZHVjZSxcbiAgICAgICAgZm9sZHI6IHJlZHVjZVJpZ2h0LFxuICAgICAgICBzZWxlY3Q6IGZpbHRlcixcbiAgICAgICAgc2VsZWN0TGltaXQ6IGZpbHRlckxpbWl0LFxuICAgICAgICBzZWxlY3RTZXJpZXM6IGZpbHRlclNlcmllcyxcbiAgICAgICAgd3JhcFN5bmM6IGFzeW5jaWZ5XG4gICAgfTtcblxuICAgIGV4cG9ydHNbJ2RlZmF1bHQnXSA9IGluZGV4O1xuICAgIGV4cG9ydHMuYXBwbHlFYWNoID0gYXBwbHlFYWNoO1xuICAgIGV4cG9ydHMuYXBwbHlFYWNoU2VyaWVzID0gYXBwbHlFYWNoU2VyaWVzO1xuICAgIGV4cG9ydHMuYXBwbHkgPSBhcHBseSQxO1xuICAgIGV4cG9ydHMuYXN5bmNpZnkgPSBhc3luY2lmeTtcbiAgICBleHBvcnRzLmF1dG8gPSBhdXRvO1xuICAgIGV4cG9ydHMuYXV0b0luamVjdCA9IGF1dG9JbmplY3Q7XG4gICAgZXhwb3J0cy5jYXJnbyA9IGNhcmdvO1xuICAgIGV4cG9ydHMuY29tcG9zZSA9IGNvbXBvc2U7XG4gICAgZXhwb3J0cy5jb25jYXQgPSBjb25jYXQ7XG4gICAgZXhwb3J0cy5jb25jYXRTZXJpZXMgPSBjb25jYXRTZXJpZXM7XG4gICAgZXhwb3J0cy5jb25zdGFudCA9IGNvbnN0YW50O1xuICAgIGV4cG9ydHMuZGV0ZWN0ID0gZGV0ZWN0O1xuICAgIGV4cG9ydHMuZGV0ZWN0TGltaXQgPSBkZXRlY3RMaW1pdDtcbiAgICBleHBvcnRzLmRldGVjdFNlcmllcyA9IGRldGVjdFNlcmllcztcbiAgICBleHBvcnRzLmRpciA9IGRpcjtcbiAgICBleHBvcnRzLmRvRHVyaW5nID0gZG9EdXJpbmc7XG4gICAgZXhwb3J0cy5kb1VudGlsID0gZG9VbnRpbDtcbiAgICBleHBvcnRzLmRvV2hpbHN0ID0gZG9XaGlsc3Q7XG4gICAgZXhwb3J0cy5kdXJpbmcgPSBkdXJpbmc7XG4gICAgZXhwb3J0cy5lYWNoID0gZWFjaDtcbiAgICBleHBvcnRzLmVhY2hMaW1pdCA9IGVhY2hMaW1pdDtcbiAgICBleHBvcnRzLmVhY2hPZiA9IGVhY2hPZjtcbiAgICBleHBvcnRzLmVhY2hPZkxpbWl0ID0gZWFjaE9mTGltaXQ7XG4gICAgZXhwb3J0cy5lYWNoT2ZTZXJpZXMgPSBlYWNoT2ZTZXJpZXM7XG4gICAgZXhwb3J0cy5lYWNoU2VyaWVzID0gZWFjaFNlcmllcztcbiAgICBleHBvcnRzLmVuc3VyZUFzeW5jID0gZW5zdXJlQXN5bmM7XG4gICAgZXhwb3J0cy5ldmVyeSA9IGV2ZXJ5O1xuICAgIGV4cG9ydHMuZXZlcnlMaW1pdCA9IGV2ZXJ5TGltaXQ7XG4gICAgZXhwb3J0cy5ldmVyeVNlcmllcyA9IGV2ZXJ5U2VyaWVzO1xuICAgIGV4cG9ydHMuZmlsdGVyID0gZmlsdGVyO1xuICAgIGV4cG9ydHMuZmlsdGVyTGltaXQgPSBmaWx0ZXJMaW1pdDtcbiAgICBleHBvcnRzLmZpbHRlclNlcmllcyA9IGZpbHRlclNlcmllcztcbiAgICBleHBvcnRzLmZvcmV2ZXIgPSBmb3JldmVyO1xuICAgIGV4cG9ydHMuaXRlcmF0b3IgPSBpdGVyYXRvciQxO1xuICAgIGV4cG9ydHMubG9nID0gbG9nO1xuICAgIGV4cG9ydHMubWFwID0gbWFwO1xuICAgIGV4cG9ydHMubWFwTGltaXQgPSBtYXBMaW1pdDtcbiAgICBleHBvcnRzLm1hcFNlcmllcyA9IG1hcFNlcmllcztcbiAgICBleHBvcnRzLm1hcFZhbHVlcyA9IG1hcFZhbHVlcztcbiAgICBleHBvcnRzLm1hcFZhbHVlc0xpbWl0ID0gbWFwVmFsdWVzTGltaXQ7XG4gICAgZXhwb3J0cy5tYXBWYWx1ZXNTZXJpZXMgPSBtYXBWYWx1ZXNTZXJpZXM7XG4gICAgZXhwb3J0cy5tZW1vaXplID0gbWVtb2l6ZSQxO1xuICAgIGV4cG9ydHMubmV4dFRpY2sgPSBuZXh0VGljaztcbiAgICBleHBvcnRzLnBhcmFsbGVsID0gcGFyYWxsZWw7XG4gICAgZXhwb3J0cy5wYXJhbGxlbExpbWl0ID0gcGFyYWxsZWxMaW1pdDtcbiAgICBleHBvcnRzLnByaW9yaXR5UXVldWUgPSBwcmlvcml0eVF1ZXVlO1xuICAgIGV4cG9ydHMucXVldWUgPSBxdWV1ZSQxO1xuICAgIGV4cG9ydHMucmFjZSA9IHJhY2U7XG4gICAgZXhwb3J0cy5yZWR1Y2UgPSByZWR1Y2U7XG4gICAgZXhwb3J0cy5yZWR1Y2VSaWdodCA9IHJlZHVjZVJpZ2h0O1xuICAgIGV4cG9ydHMucmVmbGVjdCA9IHJlZmxlY3Q7XG4gICAgZXhwb3J0cy5yZWZsZWN0QWxsID0gcmVmbGVjdEFsbDtcbiAgICBleHBvcnRzLnJlamVjdCA9IHJlamVjdDtcbiAgICBleHBvcnRzLnJlamVjdExpbWl0ID0gcmVqZWN0TGltaXQ7XG4gICAgZXhwb3J0cy5yZWplY3RTZXJpZXMgPSByZWplY3RTZXJpZXM7XG4gICAgZXhwb3J0cy5yZXRyeSA9IHJldHJ5O1xuICAgIGV4cG9ydHMucmV0cnlhYmxlID0gcmV0cnlhYmxlO1xuICAgIGV4cG9ydHMuc2VxID0gc2VxO1xuICAgIGV4cG9ydHMuc2VyaWVzID0gc2VyaWVzO1xuICAgIGV4cG9ydHMuc2V0SW1tZWRpYXRlID0gc2V0SW1tZWRpYXRlJDE7XG4gICAgZXhwb3J0cy5zb21lID0gc29tZTtcbiAgICBleHBvcnRzLnNvbWVMaW1pdCA9IHNvbWVMaW1pdDtcbiAgICBleHBvcnRzLnNvbWVTZXJpZXMgPSBzb21lU2VyaWVzO1xuICAgIGV4cG9ydHMuc29ydEJ5ID0gc29ydEJ5O1xuICAgIGV4cG9ydHMudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgZXhwb3J0cy50aW1lcyA9IHRpbWVzO1xuICAgIGV4cG9ydHMudGltZXNMaW1pdCA9IHRpbWVMaW1pdDtcbiAgICBleHBvcnRzLnRpbWVzU2VyaWVzID0gdGltZXNTZXJpZXM7XG4gICAgZXhwb3J0cy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG4gICAgZXhwb3J0cy51bm1lbW9pemUgPSB1bm1lbW9pemU7XG4gICAgZXhwb3J0cy51bnRpbCA9IHVudGlsO1xuICAgIGV4cG9ydHMud2F0ZXJmYWxsID0gd2F0ZXJmYWxsO1xuICAgIGV4cG9ydHMud2hpbHN0ID0gd2hpbHN0O1xuICAgIGV4cG9ydHMuYWxsID0gZXZlcnk7XG4gICAgZXhwb3J0cy5hbGxMaW1pdCA9IGV2ZXJ5TGltaXQ7XG4gICAgZXhwb3J0cy5hbGxTZXJpZXMgPSBldmVyeVNlcmllcztcbiAgICBleHBvcnRzLmFueSA9IHNvbWU7XG4gICAgZXhwb3J0cy5hbnlMaW1pdCA9IHNvbWVMaW1pdDtcbiAgICBleHBvcnRzLmFueVNlcmllcyA9IHNvbWVTZXJpZXM7XG4gICAgZXhwb3J0cy5maW5kID0gZGV0ZWN0O1xuICAgIGV4cG9ydHMuZmluZExpbWl0ID0gZGV0ZWN0TGltaXQ7XG4gICAgZXhwb3J0cy5maW5kU2VyaWVzID0gZGV0ZWN0U2VyaWVzO1xuICAgIGV4cG9ydHMuZm9yRWFjaCA9IGVhY2g7XG4gICAgZXhwb3J0cy5mb3JFYWNoU2VyaWVzID0gZWFjaFNlcmllcztcbiAgICBleHBvcnRzLmZvckVhY2hMaW1pdCA9IGVhY2hMaW1pdDtcbiAgICBleHBvcnRzLmZvckVhY2hPZiA9IGVhY2hPZjtcbiAgICBleHBvcnRzLmZvckVhY2hPZlNlcmllcyA9IGVhY2hPZlNlcmllcztcbiAgICBleHBvcnRzLmZvckVhY2hPZkxpbWl0ID0gZWFjaE9mTGltaXQ7XG4gICAgZXhwb3J0cy5pbmplY3QgPSByZWR1Y2U7XG4gICAgZXhwb3J0cy5mb2xkbCA9IHJlZHVjZTtcbiAgICBleHBvcnRzLmZvbGRyID0gcmVkdWNlUmlnaHQ7XG4gICAgZXhwb3J0cy5zZWxlY3QgPSBmaWx0ZXI7XG4gICAgZXhwb3J0cy5zZWxlY3RMaW1pdCA9IGZpbHRlckxpbWl0O1xuICAgIGV4cG9ydHMuc2VsZWN0U2VyaWVzID0gZmlsdGVyU2VyaWVzO1xuICAgIGV4cG9ydHMud3JhcFN5bmMgPSBhc3luY2lmeTtcblxufSkpOyIsImZ1bmN0aW9uIENhbnZhc0ZlYXR1cmUoZ2VvanNvbiwgaWQpIHtcbiAgICBcbiAgICAvLyByYWRpdXMgZm9yIHBvaW50IGZlYXR1cmVzXG4gICAgLy8gdXNlIHRvIGNhbGN1bGF0ZSBtb3VzZSBvdmVyL291dCBhbmQgY2xpY2sgZXZlbnRzIGZvciBwb2ludHNcbiAgICAvLyB0aGlzIHZhbHVlIHNob3VsZCBtYXRjaCB0aGUgdmFsdWUgdXNlZCBmb3IgcmVuZGVyaW5nIHBvaW50c1xuICAgIHRoaXMuc2l6ZSA9IDU7XG4gICAgXG4gICAgdmFyIGNhY2hlID0ge1xuICAgICAgICAvLyBwcm9qZWN0ZWQgcG9pbnRzIG9uIGNhbnZhc1xuICAgICAgICBjYW52YXNYWSA6IG51bGwsXG4gICAgICAgIC8vIHpvb20gbGV2ZWwgY2FudmFzWFkgcG9pbnRzIGFyZSBjYWxjdWxhdGVkIHRvXG4gICAgICAgIHpvb20gOiAtMVxuICAgIH1cbiAgICBcbiAgICAvLyBwZXJmb3JtYW5jZSBmbGFnLCB3aWxsIGtlZXAgaW52aXNpYmxlIGZlYXR1cmVzIGZvciByZWNhbGMgXG4gICAgLy8gZXZlbnRzIGFzIHdlbGwgYXMgbm90IGJlaW5nIHJlbmRlcmVkXG4gICAgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICBcbiAgICAvLyBib3VuZGluZyBib3ggZm9yIGdlb21ldHJ5LCB1c2VkIGZvciBpbnRlcnNlY3Rpb24gYW5kXG4gICAgLy8gdmlzaWJsaWxpdHkgb3B0aW1pemF0aW9uc1xuICAgIHRoaXMuYm91bmRzID0gbnVsbDtcbiAgICBcbiAgICAvLyBMZWFmbGV0IExhdExuZywgdXNlZCBmb3IgcG9pbnRzIHRvIHF1aWNrbHkgbG9vayBmb3IgaW50ZXJzZWN0aW9uXG4gICAgdGhpcy5sYXRsbmcgPSBudWxsO1xuICAgIFxuICAgIC8vIGNsZWFyIHRoZSBjYW52YXNYWSBzdG9yZWQgdmFsdWVzXG4gICAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGNhY2hlLmNhbnZhc1hZID0gbnVsbDtcbiAgICAgICAgY2FjaGUuem9vbSA9IC0xO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnNldENhbnZhc1hZID0gZnVuY3Rpb24oY2FudmFzWFksIHpvb20pIHtcbiAgICAgICAgY2FjaGUuY2FudmFzWFkgPSBjYW52YXNYWTtcbiAgICAgICAgY2FjaGUuem9vbSA9IHpvb207XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZ2V0Q2FudmFzWFkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlLmNhbnZhc1hZO1xuICAgIH1cbiAgICBcbiAgICB0aGlzLnJlcXVpcmVzUmVwcm9qZWN0aW9uID0gZnVuY3Rpb24oem9vbSkge1xuICAgICAgaWYoIGNhY2hlLnpvb20gPT0gem9vbSAmJiBjYWNoZS5jYW52YXNYWSApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVG8gb3B0aW9ucyBmb3Igd3JhcHBlci4gIE9uZSwgeW91IHByb3ZpZGUgYSBnZW9qc29uIG9iamVjdC5cbiAgICAgKiBUd28sIHlvdSBwcm92aWRlIGEgYWNjZXNzb3IgbWV0aG9kIGFuZCBpZC4gIFdoZW4gdGhpcyBjbGFzc1xuICAgICAqIG5lZWRzIGFjY2VzcyB0byB0aGUgR2VvSlNPTiwgdGhlIGlkIHdpbGwgYmUgcGFzc2VkLCBhcyB3ZWxsXG4gICAgICogYXMgdGhlIGNhbGxiYWNrLlxuICAgICAqL1xuICAgIGlmKCB0eXBlb2YgZ2VvanNvbiA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgIHRoaXMuX2dlb2pzb24gPSBnZW9qc29uO1xuICAgICAgICBcbiAgICAgICAgLy8gVE9ETzogYWxsb3cgdXNlciB0byBvdmVycmlkZSBkZWZhdWx0IHZhcmlhYmxlXG4gICAgICAgIHRoaXMuaWQgPSBnZW9qc29uLnByb3BlcnRpZXMuaWQ7XG5cbiAgICAgICAgdGhpcy50eXBlID0gZ2VvanNvbi50eXBlO1xuICAgICAgICB0aGlzLl9nZXRHZW9Kc29uID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayh0aGlzLl9nZW9qc29uKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2dldEdlb0pzb24gPSBnZW9qc29uO1xuICAgICAgICB0aGlzLl9pZCA9IGlkO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0R2VvSnNvbiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuX2dldEdlb0pzb24odGhpcy5faWQsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEdlb0pzb24oKGdlb2pzb24pID0+IHtcbiAgICAgICAgaWYoIGdlb2pzb24uZ2VvbWV0cnkgKSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBnZW9qc29uLmdlb21ldHJ5LnR5cGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSBnZW9qc29uLnR5cGU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBcbiAgICAvLyBvcHRpb25hbCwgcGVyIGZlYXR1cmUsIHJlbmRlcmVyXG4gICAgdGhpcy5yZW5kZXJlciA9IG51bGw7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2FudmFzRmVhdHVyZTsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vQ2FudmFzRmVhdHVyZScpO1xuXG5mdW5jdGlvbiBDYW52YXNGZWF0dXJlcyhnZW9qc29uKSB7XG4gICAgLy8gcXVpY2sgdHlwZSBmbGFnXG4gICAgdGhpcy5pc0NhbnZhc0ZlYXR1cmVzID0gdHJ1ZTtcbiAgICBcbiAgICB0aGlzLmNhbnZhc0ZlYXR1cmVzID0gW107XG4gICAgXG4gICAgLy8gYWN0dWFsIGdlb2pzb24gb2JqZWN0LCB3aWxsIG5vdCBiZSBtb2RpZmVkLCBqdXN0IHN0b3JlZFxuICAgIHRoaXMuZ2VvanNvbiA9IGdlb2pzb247XG4gICAgXG4gICAgLy8gcGVyZm9ybWFuY2UgZmxhZywgd2lsbCBrZWVwIGludmlzaWJsZSBmZWF0dXJlcyBmb3IgcmVjYWxjIFxuICAgIC8vIGV2ZW50cyBhcyB3ZWxsIGFzIG5vdCBiZWluZyByZW5kZXJlZFxuICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgXG4gICAgdGhpcy5jbGVhckNhY2hlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5jYW52YXNGZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzRmVhdHVyZXNbaV0uY2xlYXJDYWNoZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCB0aGlzLmdlb2pzb24gKSB7XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5nZW9qc29uLmZlYXR1cmVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgICAgdGhpcy5jYW52YXNGZWF0dXJlcy5wdXNoKG5ldyBDYW52YXNGZWF0dXJlKHRoaXMuZ2VvanNvbi5mZWF0dXJlc1tpXSkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0ZlYXR1cmVzOyIsInZhciBDYW52YXNGZWF0dXJlID0gcmVxdWlyZSgnLi9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuL0NhbnZhc0ZlYXR1cmVzJyk7XG5cbmZ1bmN0aW9uIGZhY3RvcnkoYXJnKSB7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoYXJnKSApIHtcbiAgICAgICAgcmV0dXJuIGFyZy5tYXAoZ2VuZXJhdGUpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZ2VuZXJhdGUoYXJnKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGUoZ2VvanNvbikge1xuICAgIGlmKCBnZW9qc29uLnR5cGUgPT09ICdGZWF0dXJlQ29sbGVjdGlvbicgKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzRmVhdHVyZXMoZ2VvanNvbik7XG4gICAgfSBlbHNlIGlmICggZ2VvanNvbi50eXBlID09PSAnRmVhdHVyZScgKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmFzRmVhdHVyZShnZW9qc29uKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdVbnN1cHBvcnRlZCBHZW9KU09OOiAnK2dlb2pzb24udHlwZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTsiLCJ2YXIgY3R4O1xuXG4vKipcbiAqIEZ1Y3Rpb24gY2FsbGVkIGluIHNjb3BlIG9mIENhbnZhc0ZlYXR1cmVcbiAqL1xuZnVuY3Rpb24gcmVuZGVyKGNvbnRleHQsIHh5UG9pbnRzLCBtYXAsIGNhbnZhc0ZlYXR1cmUpIHtcbiAgICBjdHggPSBjb250ZXh0O1xuICAgIFxuICAgIGlmKCBjYW52YXNGZWF0dXJlLnR5cGUgPT09ICdQb2ludCcgKSB7XG4gICAgICAgIHJlbmRlclBvaW50KHh5UG9pbnRzLCB0aGlzLnNpemUpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnTGluZVN0cmluZycgKSB7XG4gICAgICAgIHJlbmRlckxpbmUoeHlQb2ludHMpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnUG9seWdvbicgKSB7XG4gICAgICAgIHJlbmRlclBvbHlnb24oeHlQb2ludHMpO1xuICAgIH0gZWxzZSBpZiggY2FudmFzRmVhdHVyZS50eXBlID09PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgeHlQb2ludHMuZm9yRWFjaChyZW5kZXJQb2x5Z29uKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlclBvaW50KHh5UG9pbnQsIHNpemUpIHtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICBjdHguYXJjKHh5UG9pbnQueCwgeHlQb2ludC55LCBzaXplLCAwLCAyICogTWF0aC5QSSwgZmFsc2UpO1xuICAgIGN0eC5maWxsU3R5bGUgPSAgJ3JnYmEoMCwgMCwgMCwgLjMpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nO1xuXG4gICAgY3R4LnN0cm9rZSgpO1xuICAgIGN0eC5maWxsKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxpbmUoeHlQb2ludHMpIHtcblxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSAnb3JhbmdlJztcbiAgICBjdHguZmlsbFN0eWxlID0gJ3JnYmEoMCwgMCwgMCwgLjMpJztcbiAgICBjdHgubGluZVdpZHRoID0gMjtcblxuICAgIHZhciBqO1xuICAgIGN0eC5tb3ZlVG8oeHlQb2ludHNbMF0ueCwgeHlQb2ludHNbMF0ueSk7XG4gICAgZm9yKCBqID0gMTsgaiA8IHh5UG9pbnRzLmxlbmd0aDsgaisrICkge1xuICAgICAgICBjdHgubGluZVRvKHh5UG9pbnRzW2pdLngsIHh5UG9pbnRzW2pdLnkpO1xuICAgIH1cblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQb2x5Z29uKHh5UG9pbnRzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICd3aGl0ZSc7XG4gICAgY3R4LmZpbGxTdHlsZSA9ICdyZ2JhKDI1NSwgMTUyLCAwLC44KSc7XG4gICAgY3R4LmxpbmVXaWR0aCA9IDI7XG5cbiAgICB2YXIgajtcbiAgICBjdHgubW92ZVRvKHh5UG9pbnRzWzBdLngsIHh5UG9pbnRzWzBdLnkpO1xuICAgIGZvciggaiA9IDE7IGogPCB4eVBvaW50cy5sZW5ndGg7IGorKyApIHtcbiAgICAgICAgY3R4LmxpbmVUbyh4eVBvaW50c1tqXS54LCB4eVBvaW50c1tqXS55KTtcbiAgICB9XG4gICAgY3R4LmxpbmVUbyh4eVBvaW50c1swXS54LCB4eVBvaW50c1swXS55KTtcblxuICAgIGN0eC5zdHJva2UoKTtcbiAgICBjdHguZmlsbCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHJlbmRlcjsiLCJ2YXIgQ2FudmFzRmVhdHVyZSA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9DYW52YXNGZWF0dXJlJyk7XG52YXIgQ2FudmFzRmVhdHVyZXMgPSByZXF1aXJlKCcuL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcblxuZnVuY3Rpb24gQ2FudmFzTGF5ZXIoKSB7XG4gIC8vIHNob3cgbGF5ZXIgdGltaW5nXG4gIHRoaXMuZGVidWcgPSBmYWxzZTtcblxuICAvLyBpbmNsdWRlIGV2ZW50c1xuICB0aGlzLmluY2x1ZGVzID0gW0wuTWl4aW4uRXZlbnRzXTtcblxuICAvLyBsaXN0IG9mIGdlb2pzb24gZmVhdHVyZXMgdG8gZHJhd1xuICAvLyAgIC0gdGhlc2Ugd2lsbCBkcmF3IGluIG9yZGVyXG4gIHRoaXMuZmVhdHVyZXMgPSBbXTtcblxuICAvLyBsaXN0IG9mIGN1cnJlbnQgZmVhdHVyZXMgdW5kZXIgdGhlIG1vdXNlXG4gIHRoaXMuaW50ZXJzZWN0TGlzdCA9IFtdO1xuXG4gIC8vIHVzZWQgdG8gY2FsY3VsYXRlIHBpeGVscyBtb3ZlZCBmcm9tIGNlbnRlclxuICB0aGlzLmxhc3RDZW50ZXJMTCA9IG51bGw7XG5cbiAgLy8gZ2VvbWV0cnkgaGVscGVyc1xuICB0aGlzLnV0aWxzID0gcmVxdWlyZSgnLi9saWIvdXRpbHMnKTtcbiAgXG4gIHRoaXMubW92aW5nID0gZmFsc2U7XG4gIHRoaXMuem9vbWluZyA9IGZhbHNlO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgd29ya1xuICB0aGlzLmFsbG93UGFuUmVuZGVyaW5nID0gZmFsc2U7XG4gIFxuICAvLyByZWNvbW1lbmRlZCB5b3Ugb3ZlcnJpZGUgdGhpcy4gIHlvdSBjYW4gYWxzbyBzZXQgYSBjdXN0b20gcmVuZGVyZXJcbiAgLy8gZm9yIGVhY2ggQ2FudmFzRmVhdHVyZSBpZiB5b3Ugd2lzaFxuICB0aGlzLnJlbmRlcmVyID0gcmVxdWlyZSgnLi9kZWZhdWx0UmVuZGVyZXInKTtcblxuICB0aGlzLmdldENhbnZhcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jYW52YXM7XG4gIH07XG5cbiAgdGhpcy5kcmF3ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9O1xuXG4gIHRoaXMuYWRkVG8gPSBmdW5jdGlvbiAobWFwKSB7XG4gICAgbWFwLmFkZExheWVyKHRoaXMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gcmVzZXQgYWN0dWFsIGNhbnZhcyBzaXplXG4gICAgdmFyIHNpemUgPSB0aGlzLl9tYXAuZ2V0U2l6ZSgpO1xuICAgIHRoaXMuX2NhbnZhcy53aWR0aCA9IHNpemUueDtcbiAgICB0aGlzLl9jYW52YXMuaGVpZ2h0ID0gc2l6ZS55O1xuXG4gICAgdGhpcy5jbGVhckNhY2hlKCk7XG5cbiAgICB0aGlzLnJlbmRlcigpO1xuICB9O1xuXG4gIC8vIGNsZWFyIGNhbnZhc1xuICB0aGlzLmNsZWFyQ2FudmFzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNhbnZhcyA9IHRoaXMuZ2V0Q2FudmFzKCk7XG4gICAgdmFyIGN0eCA9IHRoaXMuX2N0eDtcblxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICB0aGlzLnJlcG9zaXRpb24oKTtcbiAgfVxuXG4gIHRoaXMucmVwb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdyZXNwb3NpdGlvbiEnKTtcbiAgICB2YXIgdG9wTGVmdCA9IHRoaXMuX21hcC5jb250YWluZXJQb2ludFRvTGF5ZXJQb2ludChbMCwgMF0pO1xuICAgIHRoaXMuX2NhbnZhcy5zdHlsZS50b3AgPSB0b3BMZWZ0LnkrJ3B4JztcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUubGVmdCA9IHRvcExlZnQueCsncHgnO1xuICAgIC8vTC5Eb21VdGlsLnNldFBvc2l0aW9uKHRoaXMuX2NhbnZhcywgdG9wTGVmdCk7XG4gIH1cblxuICAvLyBjbGVhciBlYWNoIGZlYXR1cmVzIGNhY2hlXG4gIHRoaXMuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGtpbGwgdGhlIGZlYXR1cmUgcG9pbnQgY2FjaGVcbiAgICBmb3IoIHZhciBpID0gMDsgaSA8IHRoaXMuZmVhdHVyZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB0aGlzLmZlYXR1cmVzW2ldLmNsZWFyQ2FjaGUoKTtcbiAgICB9XG4gIH07XG5cbiAgLy8gZ2V0IGxheWVyIGZlYXR1cmUgdmlhIGdlb2pzb24gb2JqZWN0XG4gIHRoaXMuZ2V0Q2FudmFzRmVhdHVyZUJ5SWQgPSBmdW5jdGlvbihpZCkge1xuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCB0aGlzLmZlYXR1cmVzW2ldLmlkID09IGlkICkge1xuICAgICAgICByZXR1cm4gdGhpcy5mZWF0dXJlc1tpXTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIGdldCB0aGUgbWV0ZXJzIHBlciBweCBhbmQgYSBjZXJ0YWluIHBvaW50O1xuICB0aGlzLmdldE1ldGVyc1BlclB4ID0gZnVuY3Rpb24obGF0bG5nKSB7XG4gICAgcmV0dXJuIHRoaXMudXRpbHMubWV0ZXJzUGVyUHgobGF0bG5nLCB0aGlzLl9tYXApO1xuICB9XG59O1xuXG52YXIgbGF5ZXIgPSBuZXcgQ2FudmFzTGF5ZXIoKTtcblxuXG5yZXF1aXJlKCcuL2xpYi9pbml0JykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvcmVkcmF3JykobGF5ZXIpO1xucmVxdWlyZSgnLi9saWIvYWRkRmVhdHVyZScpKGxheWVyKTtcbnJlcXVpcmUoJy4vbGliL3RvQ2FudmFzWFknKShsYXllcik7XG5cbkwuQ2FudmFzRmVhdHVyZUZhY3RvcnkgPSByZXF1aXJlKCcuL2NsYXNzZXMvZmFjdG9yeScpO1xuTC5DYW52YXNGZWF0dXJlID0gQ2FudmFzRmVhdHVyZTtcbkwuQ2FudmFzRmVhdHVyZUNvbGxlY3Rpb24gPSBDYW52YXNGZWF0dXJlcztcbkwuQ2FudmFzR2VvanNvbkxheWVyID0gTC5DbGFzcy5leHRlbmQobGF5ZXIpO1xuIiwidmFyIENhbnZhc0ZlYXR1cmUgPSByZXF1aXJlKCcuLi9jbGFzc2VzL0NhbnZhc0ZlYXR1cmUnKTtcbnZhciBDYW52YXNGZWF0dXJlcyA9IHJlcXVpcmUoJy4uL2NsYXNzZXMvQ2FudmFzRmVhdHVyZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICBsYXllci5hZGRDYW52YXNGZWF0dXJlcyA9IGZ1bmN0aW9uKGZlYXR1cmVzKSB7XG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHRoaXMuYWRkQ2FudmFzRmVhdHVyZShmZWF0dXJlc1tpXSk7XG4gICAgfVxuICB9O1xuXG4gIGxheWVyLmFkZENhbnZhc0ZlYXR1cmUgPSBmdW5jdGlvbihmZWF0dXJlLCBib3R0b20sIGNhbGxiYWNrKSB7XG4gICAgaWYoICEoZmVhdHVyZSBpbnN0YW5jZW9mIENhbnZhc0ZlYXR1cmUpICYmICEoZmVhdHVyZSBpbnN0YW5jZW9mIENhbnZhc0ZlYXR1cmVzKSApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmVhdHVyZSBtdXN0IGJlIGluc3RhbmNlIG9mIENhbnZhc0ZlYXR1cmUgb3IgQ2FudmFzRmVhdHVyZXMnKTtcbiAgICB9XG4gICAgXG4gICAgcHJlcGFyZUNhbnZhc0ZlYXR1cmUodGhpcywgZmVhdHVyZSwgKCkgPT4ge1xuICAgICAgaWYoIGJvdHRvbSApIHsgLy8gYm90dG9tIG9yIGluZGV4XG4gICAgICAgIGlmKCB0eXBlb2YgYm90dG9tID09PSAnbnVtYmVyJykgdGhpcy5mZWF0dXJlcy5zcGxpY2UoYm90dG9tLCAwLCBmZWF0dXJlKTtcbiAgICAgICAgZWxzZSB0aGlzLmZlYXR1cmVzLnVuc2hpZnQoZmVhdHVyZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmZlYXR1cmVzLnB1c2goZmVhdHVyZSk7XG4gICAgICB9XG5cbiAgICAgIGlmKCBjYWxsYmFjayApIGNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgbGF5ZXIuYWRkQ2FudmFzRmVhdHVyZUJvdHRvbSA9IGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICB0aGlzLmFkZEZlYXR1cmUoZmVhdHVyZSwgdHJ1ZSk7XG4gIH07XG5cbiAgLy8gcmV0dXJucyB0cnVlIGlmIHJlLXJlbmRlciByZXF1aXJlZC4gIGllIHRoZSBmZWF0dXJlIHdhcyB2aXNpYmxlO1xuICBsYXllci5yZW1vdmVDYW52YXNGZWF0dXJlID0gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuZmVhdHVyZXMuaW5kZXhPZihmZWF0dXJlKTtcbiAgICBpZiggaW5kZXggPT0gLTEgKSByZXR1cm47XG5cbiAgICB0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICBpZiggdGhpcy5mZWF0dXJlLnZpc2libGUgKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gIFxuICBsYXllci5yZW1vdmVBbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuYWxsb3dQYW5SZW5kZXJpbmcgPSB0cnVlO1xuICAgICAgdGhpcy5mZWF0dXJlcyA9IFtdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVDYW52YXNGZWF0dXJlKGxheWVyLCBjYW52YXNGZWF0dXJlLCBjYWxsYmFjaykge1xuICAgIFxuICAgIGNhbnZhc0ZlYXR1cmUuZ2V0R2VvSnNvbigoZ2VvanNvbikgPT4ge1xuICAgICAgdmFyIGdlb21ldHJ5ID0gZ2VvanNvbi5nZW9tZXRyeTtcblxuICAgICAgaWYoIGdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgICBcbiAgICAgICAgY2FudmFzRmVhdHVyZS5ib3VuZHMgPSBsYXllci51dGlscy5jYWxjQm91bmRzKGdlb21ldHJ5LmNvb3JkaW5hdGVzKTtcblxuICAgICAgfSBlbHNlIGlmICggZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAgIC8vIFRPRE86IHdlIG9ubHkgc3VwcG9ydCBvdXRlciByaW5ncyBvdXQgdGhlIG1vbWVudCwgbm8gaW5uZXIgcmluZ3MuICBUaHVzIGNvb3JkaW5hdGVzWzBdXG4gICAgICAgIGNhbnZhc0ZlYXR1cmUuYm91bmRzID0gbGF5ZXIudXRpbHMuY2FsY0JvdW5kcyhnZW9tZXRyeS5jb29yZGluYXRlc1swXSk7XG5cbiAgICAgIH0gZWxzZSBpZiAoIGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcbiAgXG4gICAgICAgIGNhbnZhc0ZlYXR1cmUubGF0bG5nID0gTC5sYXRMbmcoZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sIGdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdKTtcbiAgICAgIFxuICAgICAgfSBlbHNlIGlmICggZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgXG4gICAgICAgIGNhbnZhc0ZlYXR1cmUuYm91bmRzID0gW107XG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZ2VvbWV0cnkuY29vcmRpbmF0ZXMubGVuZ3RoOyBpKysgICkge1xuICAgICAgICAgIGNhbnZhc0ZlYXR1cmUuYm91bmRzLnB1c2gobGF5ZXIudXRpbHMuY2FsY0JvdW5kcyhnZW9tZXRyeS5jb29yZGluYXRlc1tpXVswXSkpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdHZW9KU09OIGZlYXR1cmUgdHlwZSBcIicrZ2VvbWV0cnkudHlwZSsnXCIgbm90IHN1cHBvcnRlZC4nKTtcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2soKTtcbiAgICB9KTtcbn0iLCJ2YXIgaW50ZXJzZWN0cyA9IHJlcXVpcmUoJy4vaW50ZXJzZWN0cycpO1xudmFyIGNvdW50ID0gMDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgIFxuICAgIGxheWVyLmluaXRpYWxpemUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuZmVhdHVyZXMgPSBbXTtcbiAgICAgICAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gW107XG4gICAgICAgIHRoaXMuc2hvd2luZyA9IHRydWU7XG5cbiAgICAgICAgLy8gc2V0IG9wdGlvbnNcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgIEwuVXRpbC5zZXRPcHRpb25zKHRoaXMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIG1vdmUgbW91c2UgZXZlbnQgaGFuZGxlcnMgdG8gbGF5ZXIgc2NvcGVcbiAgICAgICAgdmFyIG1vdXNlRXZlbnRzID0gWydvbk1vdXNlT3ZlcicsICdvbk1vdXNlTW92ZScsICdvbk1vdXNlT3V0JywgJ29uQ2xpY2snXTtcbiAgICAgICAgbW91c2VFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGlmKCAhdGhpcy5vcHRpb25zW2VdICkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpc1tlXSA9IHRoaXMub3B0aW9uc1tlXTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm9wdGlvbnNbZV07XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy8gc2V0IGNhbnZhcyBhbmQgY2FudmFzIGNvbnRleHQgc2hvcnRjdXRzXG4gICAgICAgIHRoaXMuX2NhbnZhcyA9IGNyZWF0ZUNhbnZhcyhvcHRpb25zKTtcbiAgICAgICAgdGhpcy5fY3R4ID0gdGhpcy5fY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgfTtcbiAgICBcbiAgICBsYXllci5vbkFkZCA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9tYXAgPSBtYXA7XG5cbiAgICAgICAgLy8gYWRkIGNvbnRhaW5lciB3aXRoIHRoZSBjYW52YXMgdG8gdGhlIHRpbGUgcGFuZVxuICAgICAgICAvLyB0aGUgY29udGFpbmVyIGlzIG1vdmVkIGluIHRoZSBvcG9zaXRlIGRpcmVjdGlvbiBvZiB0aGVcbiAgICAgICAgLy8gbWFwIHBhbmUgdG8ga2VlcCB0aGUgY2FudmFzIGFsd2F5cyBpbiAoMCwgMClcbiAgICAgICAgLy92YXIgdGlsZVBhbmUgPSB0aGlzLl9tYXAuX3BhbmVzLnRpbGVQYW5lO1xuICAgICAgICB2YXIgdGlsZVBhbmUgPSB0aGlzLl9tYXAuX3BhbmVzLm1hcmtlclBhbmU7XG4gICAgICAgIHZhciBfY29udGFpbmVyID0gTC5Eb21VdGlsLmNyZWF0ZSgnZGl2JywgJ2xlYWZsZXQtbGF5ZXItJytjb3VudCk7XG4gICAgICAgIGNvdW50Kys7XG5cbiAgICAgICAgX2NvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9jYW52YXMpO1xuICAgICAgICB0aWxlUGFuZS5hcHBlbmRDaGlsZChfY29udGFpbmVyKTtcblxuICAgICAgICB0aGlzLl9jb250YWluZXIgPSBfY29udGFpbmVyO1xuXG4gICAgICAgIC8vIGhhY2s6IGxpc3RlbiB0byBwcmVkcmFnIGV2ZW50IGxhdW5jaGVkIGJ5IGRyYWdnaW5nIHRvXG4gICAgICAgIC8vIHNldCBjb250YWluZXIgaW4gcG9zaXRpb24gKDAsIDApIGluIHNjcmVlbiBjb29yZGluYXRlc1xuICAgICAgICAvKmlmIChtYXAuZHJhZ2dpbmcuZW5hYmxlZCgpKSB7XG4gICAgICAgICAgICBtYXAuZHJhZ2dpbmcuX2RyYWdnYWJsZS5vbigncHJlZHJhZycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG1vdmVTdGFydC5hcHBseSh0aGlzKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuICAgICAgICB9Ki9cblxuICAgICAgICBtYXAub24oe1xuICAgICAgICAgICAgJ3ZpZXdyZXNldCcgOiB0aGlzLnJlc2V0LFxuICAgICAgICAgICAgJ3Jlc2l6ZScgICAgOiB0aGlzLnJlc2V0LFxuICAgICAgICAgICAgJ3pvb21zdGFydCcgOiBzdGFydFpvb20sXG4gICAgICAgICAgICAnem9vbWVuZCcgICA6IGVuZFpvb20sXG4gICAgICAgIC8vICAgICdtb3Zlc3RhcnQnIDogbW92ZVN0YXJ0LFxuICAgICAgICAgICAgJ21vdmVlbmQnICAgOiBtb3ZlRW5kLFxuICAgICAgICAgICAgJ21vdXNlbW92ZScgOiBpbnRlcnNlY3RzLFxuICAgICAgICAgICAgJ2NsaWNrJyAgICAgOiBpbnRlcnNlY3RzXG4gICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgICAgICBpZiggdGhpcy56SW5kZXggIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0WkluZGV4KHRoaXMuekluZGV4KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBsYXllci5vblJlbW92ZSA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICB0aGlzLl9jb250YWluZXIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLl9jb250YWluZXIpO1xuICAgICAgICBtYXAub2ZmKHtcbiAgICAgICAgICAgICd2aWV3cmVzZXQnIDogdGhpcy5yZXNldCxcbiAgICAgICAgICAgICdyZXNpemUnICAgIDogdGhpcy5yZXNldCxcbiAgICAgICAgIC8vICAgJ21vdmVzdGFydCcgOiBtb3ZlU3RhcnQsXG4gICAgICAgICAgICAnbW92ZWVuZCcgICA6IG1vdmVFbmQsXG4gICAgICAgICAgICAnem9vbXN0YXJ0JyA6IHN0YXJ0Wm9vbSxcbiAgICAgICAgICAgICd6b29tZW5kJyAgIDogZW5kWm9vbSxcbiAgICAgICAgICAgICdtb3VzZW1vdmUnIDogaW50ZXJzZWN0cyxcbiAgICAgICAgICAgICdjbGljaycgICAgIDogaW50ZXJzZWN0c1xuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNhbnZhcyhvcHRpb25zKSB7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgY2FudmFzLnN0eWxlLmxlZnQgPSAwO1xuICAgIGNhbnZhcy5zdHlsZS5wb2ludGVyRXZlbnRzID0gXCJub25lXCI7XG4gICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IG9wdGlvbnMuekluZGV4IHx8IDA7XG4gICAgdmFyIGNsYXNzTmFtZSA9ICdsZWFmbGV0LXRpbGUtY29udGFpbmVyIGxlYWZsZXQtem9vbS1hbmltYXRlZCc7XG4gICAgY2FudmFzLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjbGFzc05hbWUpO1xuICAgIHJldHVybiBjYW52YXM7XG59XG5cbmZ1bmN0aW9uIHN0YXJ0Wm9vbSgpIHtcbiAgICB0aGlzLl9jYW52YXMuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgIHRoaXMuem9vbWluZyA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGVuZFpvb20oKSB7XG4gICAgdGhpcy5fY2FudmFzLnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgdGhpcy56b29taW5nID0gZmFsc2U7XG4gICAgc2V0VGltZW91dCh0aGlzLnJlbmRlci5iaW5kKHRoaXMpLCA1MCk7XG59XG5cbmZ1bmN0aW9uIG1vdmVTdGFydCgpIHtcbiAgICBpZiggdGhpcy5tb3ZpbmcgKSByZXR1cm47XG4gICAgdGhpcy5tb3ZpbmcgPSB0cnVlO1xuICAgIFxuICAgIC8vaWYoICF0aGlzLmFsbG93UGFuUmVuZGVyaW5nICkgcmV0dXJuO1xuICAgIHJldHVybjtcbiAgICAvLyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lUmVuZGVyLmJpbmQodGhpcykpO1xufVxuXG5mdW5jdGlvbiBtb3ZlRW5kKGUpIHtcbiAgICB0aGlzLm1vdmluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVuZGVyKGUpO1xufTtcblxuZnVuY3Rpb24gZnJhbWVSZW5kZXIoKSB7XG4gICAgaWYoICF0aGlzLm1vdmluZyApIHJldHVybjtcblxuICAgIHZhciB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgICBcbiAgICBpZiggbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0ID4gNzUgKSB7XG4gICAgICAgIGlmKCB0aGlzLmRlYnVnICkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Rpc2FibGVkIHJlbmRlcmluZyB3aGlsZSBwYW5pbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5hbGxvd1BhblJlbmRlcmluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIFxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoICF0aGlzLm1vdmluZyApIHJldHVybjtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZVJlbmRlci5iaW5kKHRoaXMpKTtcbiAgICB9LmJpbmQodGhpcyksIDc1MCk7XG59IiwidmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmMnKTtcblxudmFyIHJ1bm5pbmcgPSBmYWxzZTtcbnZhciByZXNjaGVkdWxlID0gbnVsbDtcblxuLyoqIFxuICogSGFuZGxlIG1vdXNlIGludGVyc2VjdGlvbiBldmVudHNcbiAqIGUgLSBsZWFmbGV0IGV2ZW50XG4gKiovXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGUpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIGlmKCBydW5uaW5nICkge1xuICAgICAgcmVzY2hlZHVsZSA9IGU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB2YXIgbXBwID0gdGhpcy5nZXRNZXRlcnNQZXJQeChlLmxhdGxuZyk7XG4gICAgdmFyIHIgPSBtcHAgKiA1OyAvLyA1IHB4IHJhZGl1cyBidWZmZXI7XG5cbiAgICB2YXIgY2VudGVyID0ge1xuICAgICAgdHlwZSA6ICdQb2ludCcsXG4gICAgICBjb29yZGluYXRlcyA6IFtlLmxhdGxuZy5sbmcsIGUubGF0bG5nLmxhdF1cbiAgICB9O1xuXG4gICAgdmFyIGY7XG4gICAgdmFyIGludGVyc2VjdHMgPSBbXTtcblxuICAgIGFzeW5jLmVhY2hTZXJpZXMoXG4gICAgICB0aGlzLmZlYXR1cmVzLFxuICAgICAgKGYsIG5leHQpID0+IHtcbiAgICAgICAgZiA9IHRoaXMuZmVhdHVyZXNbaV07XG5cbiAgICAgICAgaWYoICFmLnZpc2libGUgKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiggIWYuZ2V0Q2FudmFzWFkoKSApIHtcbiAgICAgICAgICByZXR1cm4gbmV4dCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmKCAhaXNJbkJvdW5kcyhmLCBlLmxhdGxuZykgKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGYuZ2V0R2VvSnNvbigoZ2VvanNvbikgPT4ge1xuICAgICAgICAgIGlmKCB0aGlzLnV0aWxzLmdlb21ldHJ5V2l0aGluUmFkaXVzKGdlb2pzb24uZ2VvbWV0cnksIGYuZ2V0Q2FudmFzWFkoKSwgY2VudGVyLCBlLmNvbnRhaW5lclBvaW50LCBmLnNpemUgPyAoZi5zaXplICogbXBwKSA6IHIpICkge1xuICAgICAgICAgICAgaW50ZXJzZWN0cy5wdXNoKGYuZ2VvanNvbik7XG4gICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiB7XG4gICAgICAgIG9uSW50ZXJzZWN0c0xpc3RDcmVhdGVkLmNhbGwodGhpcywgZSwgaW50ZXJzZWN0cyk7XG4gICAgICB9XG4gICAgKTtcbiAgICBcbiAgfVxuXG5mdW5jdGlvbiBvbkludGVyc2VjdHNMaXN0Q3JlYXRlZChlLCBpbnRlcnNlY3RzKSB7XG4gIGlmKCBlLnR5cGUgPT0gJ2NsaWNrJyAmJiB0aGlzLm9uQ2xpY2sgKSB7XG4gICAgdGhpcy5vbkNsaWNrKGludGVyc2VjdHMpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBtb3VzZW92ZXIgPSBbXSwgbW91c2VvdXQgPSBbXSwgbW91c2Vtb3ZlID0gW107XG5cbiAgdmFyIGNoYW5nZWQgPSBmYWxzZTtcbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCBpbnRlcnNlY3RzLmxlbmd0aDsgaSsrICkge1xuICAgIGlmKCB0aGlzLmludGVyc2VjdExpc3QuaW5kZXhPZihpbnRlcnNlY3RzW2ldKSA+IC0xICkge1xuICAgICAgbW91c2Vtb3ZlLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgICAgbW91c2VvdmVyLnB1c2goaW50ZXJzZWN0c1tpXSk7XG4gICAgfVxuICB9XG5cbiAgZm9yKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmludGVyc2VjdExpc3QubGVuZ3RoOyBpKysgKSB7XG4gICAgaWYoIGludGVyc2VjdHMuaW5kZXhPZih0aGlzLmludGVyc2VjdExpc3RbaV0pID09IC0xICkge1xuICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICBtb3VzZW91dC5wdXNoKHRoaXMuaW50ZXJzZWN0TGlzdFtpXSk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5pbnRlcnNlY3RMaXN0ID0gaW50ZXJzZWN0cztcblxuICBpZiggdGhpcy5vbk1vdXNlT3ZlciAmJiBtb3VzZW92ZXIubGVuZ3RoID4gMCApIHRoaXMub25Nb3VzZU92ZXIuY2FsbCh0aGlzLCBtb3VzZW92ZXIsIGUpO1xuICBpZiggdGhpcy5vbk1vdXNlTW92ZSApIHRoaXMub25Nb3VzZU1vdmUuY2FsbCh0aGlzLCBtb3VzZW1vdmUsIGUpOyAvLyBhbHdheXMgZmlyZVxuICBpZiggdGhpcy5vbk1vdXNlT3V0ICYmIG1vdXNlb3V0Lmxlbmd0aCA+IDAgKSB0aGlzLm9uTW91c2VPdXQuY2FsbCh0aGlzLCBtb3VzZW91dCwgZSk7XG5cbiAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZygnaW50ZXJzZWN0cyB0aW1lOiAnKyhuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHQpKydtcycpO1xuXG4gIHJ1bm5pbmcgPSBmYWxzZTtcbiAgaWYoIHJlc2NoZWR1bGUgKSB7XG4gICAgdmFyIGUgPSByZXNjaGVkdWxlO1xuICAgIHJlc2NoZWR1bGUgPSBudWxsO1xuICAgIHRoaXMuaW50ZXJzZWN0cyhlKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpc0luQm91bmRzKGZlYXR1cmUsIGxhdGxuZykge1xuICAgIGlmKCBmZWF0dXJlLmJvdW5kcyApIHtcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoZmVhdHVyZS5ib3VuZHMpICkge1xuXG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZmVhdHVyZS5ib3VuZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgICAgICBpZiggZmVhdHVyZS5ib3VuZHNbaV0uY29udGFpbnMobGF0bG5nKSApIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmICggZmVhdHVyZS5ib3VuZHMuY29udGFpbnMobGF0bG5nKSApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdHM7IiwidmFyIGFzeW5jID0gcmVxdWlyZSgnYXN5bmMnKTtcblxudmFyIHJ1bm5pbmcgPSBmYWxzZTtcbnZhciByZXNjaGVkdWxlID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgIFxuICBsYXllci5yZW5kZXIgPSBmdW5jdGlvbihlKSB7XG4gICAgaWYoICF0aGlzLmFsbG93UGFuUmVuZGVyaW5nICYmIHRoaXMubW92aW5nICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0LCBkaWZmXG4gICAgaWYoIHRoaXMuZGVidWcgKSB7XG4gICAgICAgIHQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICB9XG5cbiAgICB2YXIgZGlmZiA9IG51bGw7XG4gICAgaWYoIGUgJiYgZS50eXBlID09ICdtb3ZlZW5kJyApIHtcbiAgICAgIHZhciBjZW50ZXIgPSB0aGlzLl9tYXAuZ2V0Q2VudGVyKCk7XG5cbiAgICAgIHZhciBwdCA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGNlbnRlcik7XG4gICAgICBpZiggdGhpcy5sYXN0Q2VudGVyTEwgKSB7XG4gICAgICAgIHZhciBsYXN0WHkgPSB0aGlzLl9tYXAubGF0TG5nVG9Db250YWluZXJQb2ludCh0aGlzLmxhc3RDZW50ZXJMTCk7XG4gICAgICAgIGRpZmYgPSB7XG4gICAgICAgICAgeCA6IGxhc3RYeS54IC0gcHQueCxcbiAgICAgICAgICB5IDogbGFzdFh5LnkgLSBwdC55XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5sYXN0Q2VudGVyTEwgPSBjZW50ZXI7XG4gICAgfVxuXG5cbiAgICBpZiggIXRoaXMuem9vbWluZyApIHtcbiAgICAgIHRoaXMucmVkcmF3KGRpZmYpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNsZWFyQ2FudmFzKCk7XG4gICAgfVxuXG4gIH0sXG4gICAgXG5cbiAgLy8gcmVkcmF3IGFsbCBmZWF0dXJlcy4gIFRoaXMgZG9lcyBub3QgaGFuZGxlIGNsZWFyaW5nIHRoZSBjYW52YXMgb3Igc2V0dGluZ1xuICAvLyB0aGUgY2FudmFzIGNvcnJlY3QgcG9zaXRpb24uICBUaGF0IGlzIGhhbmRsZWQgYnkgcmVuZGVyXG4gIGxheWVyLnJlZHJhdyA9IGZ1bmN0aW9uKGRpZmYpIHtcbiAgICBpZiggIXRoaXMuc2hvd2luZyApIHJldHVybjtcblxuICAgIGlmKCBydW5uaW5nICkge1xuICAgICAgcmVzY2hlZHVsZSA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgdGhpcy5yZXBvc2l0aW9uKCk7XG5cbiAgICAvLyBvYmplY3RzIHNob3VsZCBrZWVwIHRyYWNrIG9mIGxhc3QgYmJveCBhbmQgem9vbSBvZiBtYXBcbiAgICAvLyBpZiB0aGlzIGhhc24ndCBjaGFuZ2VkIHRoZSBsbCAtPiBjb250YWluZXIgcHQgaXMgbm90IG5lZWRlZFxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9tYXAuZ2V0Qm91bmRzKCk7XG4gICAgdmFyIHpvb20gPSB0aGlzLl9tYXAuZ2V0Wm9vbSgpO1xuXG4gICAgaWYoIHRoaXMuZGVidWcgKSB0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICB2YXIgaSA9IDA7XG4gICAgYXN5bmMuZWFjaFNlcmllcyhcbiAgICAgIHRoaXMuZmVhdHVyZXMsXG4gICAgICAoZiwgbmV4dCkgPT4ge1xuICAgICAgICAvLyBoYW5kbGUgc2luZ2xlIG9yIG11bHRpcGxlIGZlYXR1cmVzXG4gICAgICAgIGlmKCBmLmlzQ2FudmFzRmVhdHVyZXMgKSB7XG5cbiAgICAgICAgICBhc3luYy5lYWNoU2VyaWVzKFxuICAgICAgICAgICAgZi5jYW52YXNGZWF0dXJlcyxcbiAgICAgICAgICAgIChzdWJmZWF0dXJlLCBjYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgICB0aGlzLnByZXBhcmVGb3JSZWRyYXcoc3ViZmVhdHVyZSwgYm91bmRzLCB6b29tLCBkaWZmLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5wcmVwYXJlRm9yUmVkcmF3KGYsIGJvdW5kcywgem9vbSwgZGlmZiwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gdGhlcmUgYXJlICdkZWNlbnQnIHJlYXNvbnMgZm9yIHRoaXNcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgaWYoIGkgJSA1MDAgPT09IDAgKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgIH0sXG4gICAgICAoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMucmVkcmF3RmVhdHVyZXMoKTtcbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIGxheWVyLnJlZHJhd0ZlYXR1cmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5jbGVhckNhbnZhcygpO1xuICAgIFxuICAgIGZvciggdmFyIGkgPSAwOyBpIDwgdGhpcy5mZWF0dXJlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmKCAhdGhpcy5mZWF0dXJlc1tpXS52aXNpYmxlICkgY29udGludWU7XG4gICAgICB0aGlzLnJlZHJhd0ZlYXR1cmUodGhpcy5mZWF0dXJlc1tpXSk7XG4gICAgfVxuXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZygnUmVuZGVyIHRpbWU6ICcrKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCkrJ21zOyBhdmc6ICcrXG4gICAgICAoKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdCkgLyB0aGlzLmZlYXR1cmVzLmxlbmd0aCkrJ21zJyk7XG5cbiAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgaWYoIHJlc2NoZWR1bGUgKSB7XG4gICAgICBjb25zb2xlLmxvZygncmVzY2hlZHVsZScpO1xuICAgICAgcmVzY2hlZHVsZSA9IGZhbHNlO1xuICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG4gIH1cblxuICBsYXllci5yZWRyYXdGZWF0dXJlID0gZnVuY3Rpb24oY2FudmFzRmVhdHVyZSkge1xuICAgICAgdmFyIHJlbmRlcmVyID0gY2FudmFzRmVhdHVyZS5yZW5kZXJlciA/IGNhbnZhc0ZlYXR1cmUucmVuZGVyZXIgOiB0aGlzLnJlbmRlcmVyO1xuICAgICAgXG4gICAgICAvLyBjYWxsIGZlYXR1cmUgcmVuZGVyIGZ1bmN0aW9uIGluIGZlYXR1cmUgc2NvcGU7IGZlYXR1cmUgaXMgcGFzc2VkIGFzIHdlbGxcbiAgICAgIHJlbmRlcmVyLmNhbGwoXG4gICAgICAgICAgY2FudmFzRmVhdHVyZSwgLy8gc2NvcGVcbiAgICAgICAgICB0aGlzLl9jdHgsIFxuICAgICAgICAgIGNhbnZhc0ZlYXR1cmUuZ2V0Q2FudmFzWFkoKSwgXG4gICAgICAgICAgdGhpcy5fbWFwLFxuICAgICAgICAgIGNhbnZhc0ZlYXR1cmVcbiAgICAgICk7XG4gIH1cblxuICAvLyByZWRyYXcgYW4gaW5kaXZpZHVhbCBmZWF0dXJlXG4gIGxheWVyLnByZXBhcmVGb3JSZWRyYXcgPSBmdW5jdGlvbihjYW52YXNGZWF0dXJlLCBib3VuZHMsIHpvb20sIGRpZmYsIG5leHQpIHtcbiAgICAvL2lmKCBmZWF0dXJlLmdlb2pzb24ucHJvcGVydGllcy5kZWJ1ZyApIGRlYnVnZ2VyO1xuXG4gICAgLy8gaWdub3JlIGFueXRoaW5nIGZsYWdnZWQgYXMgaGlkZGVuXG4gICAgLy8gd2UgZG8gbmVlZCB0byBjbGVhciB0aGUgY2FjaGUgaW4gdGhpcyBjYXNlXG4gICAgaWYoICFjYW52YXNGZWF0dXJlLnZpc2libGUgKSB7XG4gICAgICBjYW52YXNGZWF0dXJlLmNsZWFyQ2FjaGUoKTtcbiAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgfVxuXG4gICAgY2FudmFzRmVhdHVyZS5nZXRHZW9Kc29uKChnZW9qc29uKSA9PiB7XG4gICAgICAvLyBub3cgbGV0cyBjaGVjayBjYWNoZSB0byBzZWUgaWYgd2UgbmVlZCB0byByZXByb2plY3QgdGhlXG4gICAgICAvLyB4eSBjb29yZGluYXRlc1xuICAgICAgLy8gYWN0dWFsbHkgcHJvamVjdCB0byB4eSBpZiBuZWVkZWRcbiAgICAgIHZhciByZXByb2plY3QgPSBjYW52YXNGZWF0dXJlLnJlcXVpcmVzUmVwcm9qZWN0aW9uKHpvb20pO1xuICAgICAgaWYoIHJlcHJvamVjdCApIHtcbiAgICAgICAgdGhpcy50b0NhbnZhc1hZKGNhbnZhc0ZlYXR1cmUsIGdlb2pzb24sIHpvb20pO1xuICAgICAgfSAgLy8gZW5kIHJlcHJvamVjdFxuXG4gICAgICAvLyBpZiB0aGlzIHdhcyBhIHNpbXBsZSBwYW4gZXZlbnQgKGEgZGlmZiB3YXMgcHJvdmlkZWQpIGFuZCB3ZSBkaWQgbm90IHJlcHJvamVjdFxuICAgICAgLy8gbW92ZSB0aGUgZmVhdHVyZSBieSBkaWZmIHgveVxuICAgICAgaWYoIGRpZmYgJiYgIXJlcHJvamVjdCApIHtcbiAgICAgICAgaWYoIGdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuXG4gICAgICAgICAgdmFyIHh5ID0gY2FudmFzRmVhdHVyZS5nZXRDYW52YXNYWSgpXG4gICAgICAgICAgeHkueCArPSBkaWZmLng7XG4gICAgICAgICAgeHkueSArPSBkaWZmLnk7XG5cbiAgICAgICAgfSBlbHNlIGlmKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuXG4gICAgICAgICAgdGhpcy51dGlscy5tb3ZlTGluZShjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCksIGRpZmYpO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9seWdvbicgKSB7XG4gICAgICAgIFxuICAgICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoY2FudmFzRmVhdHVyZS5nZXRDYW52YXNYWSgpLCBkaWZmKTtcbiAgICAgICAgXG4gICAgICAgIH0gZWxzZSBpZiAoIGdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlQb2x5Z29uJyApIHtcbiAgICAgICAgICB2YXIgeHkgPSBjYW52YXNGZWF0dXJlLmdldENhbnZhc1hZKCk7XG4gICAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCB4eS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHRoaXMudXRpbHMubW92ZUxpbmUoeHlbaV0sIGRpZmYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpZ25vcmUgYW55dGhpbmcgbm90IGluIGJvdW5kc1xuICAgICAgaWYoIGdlb2pzb24uZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnICkge1xuICAgICAgICBpZiggIWJvdW5kcy5jb250YWlucyhjYW52YXNGZWF0dXJlLmxhdGxuZykgKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG5cbiAgICAgICAgLy8ganVzdCBtYWtlIHN1cmUgYXQgbGVhc3Qgb25lIHBvbHlnb24gaXMgd2l0aGluIHJhbmdlXG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IoIHZhciBpID0gMDsgaSA8IGNhbnZhc0ZlYXR1cmUuYm91bmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgICAgIGlmKCBib3VuZHMuY29udGFpbnMoY2FudmFzRmVhdHVyZS5ib3VuZHNbaV0pIHx8IGJvdW5kcy5pbnRlcnNlY3RzKGNhbnZhc0ZlYXR1cmUuYm91bmRzW2ldKSApIHtcbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiggIWZvdW5kICkge1xuICAgICAgICAgIHJldHVybiBuZXh0KCk7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoICFib3VuZHMuY29udGFpbnMoY2FudmFzRmVhdHVyZS5ib3VuZHMpICYmICFib3VuZHMuaW50ZXJzZWN0cyhjYW52YXNGZWF0dXJlLmJvdW5kcykgKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBuZXh0KCk7XG4gICAgfSk7XG4gICAgXG4gICB9O1xufSIsIlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihsYXllcikge1xuICAgICBsYXllci50b0NhbnZhc1hZID0gZnVuY3Rpb24oZmVhdHVyZSwgZ2VvanNvbiwgem9vbSkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhIGNhY2hlIG5hbWVzcGFjZSBhbmQgc2V0IHRoZSB6b29tIGxldmVsXG4gICAgICAgIGlmKCAhZmVhdHVyZS5jYWNoZSApIGZlYXR1cmUuY2FjaGUgPSB7fTtcbiAgICAgICAgdmFyIGNhbnZhc1hZO1xuXG4gICAgICAgIGlmKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50JyApIHtcblxuICAgICAgICBjYW52YXNYWSA9IHRoaXMuX21hcC5sYXRMbmdUb0NvbnRhaW5lclBvaW50KFtcbiAgICAgICAgICAgIGdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMV0sXG4gICAgICAgICAgICBnZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdXG4gICAgICAgIF0pO1xuXG4gICAgICAgIGlmKCBmZWF0dXJlLnNpemUgKSB7XG4gICAgICAgICAgICBjYW52YXNYWVswXSA9IGNhbnZhc1hZWzBdIC0gZmVhdHVyZS5zaXplIC8gMjtcbiAgICAgICAgICAgIGNhbnZhc1hZWzFdID0gY2FudmFzWFlbMV0gLSBmZWF0dXJlLnNpemUgLyAyO1xuICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnICkge1xuICAgICAgICAgICAgXG4gICAgICAgIGNhbnZhc1hZID0gdGhpcy51dGlscy5wcm9qZWN0TGluZShnZW9qc29uLmdlb21ldHJ5LmNvb3JkaW5hdGVzLCB0aGlzLl9tYXApO1xuICAgICAgICB0cmltQ2FudmFzWFkoY2FudmFzWFkpO1xuICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nICkge1xuICAgICAgICBcbiAgICAgICAgY2FudmFzWFkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF0sIHRoaXMuX21hcCk7XG4gICAgICAgIHRyaW1DYW52YXNYWShjYW52YXNYWSk7XG4gICAgICAgIFxuICAgICAgICB9IGVsc2UgaWYgKCBnZW9qc29uLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicgKSB7XG4gICAgICAgICAgICBjYW52YXNYWSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZ2VvanNvbi5nZW9tZXRyeS5jb29yZGluYXRlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgICAgICB2YXIgeHkgPSB0aGlzLnV0aWxzLnByb2plY3RMaW5lKGdlb2pzb24uZ2VvbWV0cnkuY29vcmRpbmF0ZXNbaV1bMF0sIHRoaXMuX21hcCk7XG4gICAgICAgICAgICAgICAgdHJpbUNhbnZhc1hZKHh5KTtcbiAgICAgICAgICAgICAgICBjYW52YXNYWS5wdXNoKHh5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZmVhdHVyZS5zZXRDYW52YXNYWShjYW52YXNYWSwgem9vbSk7XG4gICAgfTtcbn1cblxuLy8gZ2l2ZW4gYW4gYXJyYXkgb2YgZ2VvIHh5IGNvb3JkaW5hdGVzLCBtYWtlIHN1cmUgZWFjaCBwb2ludCBpcyBhdCBsZWFzdCBtb3JlIHRoYW4gMXB4IGFwYXJ0XG5mdW5jdGlvbiB0cmltQ2FudmFzWFkoeHkpIHtcbiAgICBpZiggeHkubGVuZ3RoID09PSAwICkgcmV0dXJuO1xuICAgIHZhciBsYXN0ID0geHlbeHkubGVuZ3RoLTFdLCBpLCBwb2ludDtcblxuICAgIHZhciBjID0gMDtcbiAgICBmb3IoIGkgPSB4eS5sZW5ndGgtMjsgaSA+PSAwOyBpLS0gKSB7XG4gICAgICAgIHBvaW50ID0geHlbaV07XG4gICAgICAgIGlmKCBNYXRoLmFicyhsYXN0LnggLSBwb2ludC54KSA9PT0gMCAmJiBNYXRoLmFicyhsYXN0LnkgLSBwb2ludC55KSA9PT0gMCApIHtcbiAgICAgICAgICAgIHh5LnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGMrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxhc3QgPSBwb2ludDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmKCB4eS5sZW5ndGggPD0gMSApIHtcbiAgICAgICAgeHkucHVzaChsYXN0KTtcbiAgICAgICAgYy0tO1xuICAgIH1cbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIG1vdmVMaW5lIDogZnVuY3Rpb24oY29vcmRzLCBkaWZmKSB7XG4gICAgdmFyIGksIGxlbiA9IGNvb3Jkcy5sZW5ndGg7XG4gICAgZm9yKCBpID0gMDsgaSA8IGxlbjsgaSsrICkge1xuICAgICAgY29vcmRzW2ldLnggKz0gZGlmZi54O1xuICAgICAgY29vcmRzW2ldLnkgKz0gZGlmZi55O1xuICAgIH1cbiAgfSxcblxuICBwcm9qZWN0TGluZSA6IGZ1bmN0aW9uKGNvb3JkcywgbWFwKSB7XG4gICAgdmFyIHh5TGluZSA9IFtdO1xuXG4gICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjb29yZHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB4eUxpbmUucHVzaChtYXAubGF0TG5nVG9Db250YWluZXJQb2ludChbXG4gICAgICAgICAgY29vcmRzW2ldWzFdLCBjb29yZHNbaV1bMF1cbiAgICAgIF0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4geHlMaW5lO1xuICB9LFxuXG4gIGNhbGNCb3VuZHMgOiBmdW5jdGlvbihjb29yZHMpIHtcbiAgICB2YXIgeG1pbiA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeG1heCA9IGNvb3Jkc1swXVsxXTtcbiAgICB2YXIgeW1pbiA9IGNvb3Jkc1swXVswXTtcbiAgICB2YXIgeW1heCA9IGNvb3Jkc1swXVswXTtcblxuICAgIGZvciggdmFyIGkgPSAxOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYoIHhtaW4gPiBjb29yZHNbaV1bMV0gKSB4bWluID0gY29vcmRzW2ldWzFdO1xuICAgICAgaWYoIHhtYXggPCBjb29yZHNbaV1bMV0gKSB4bWF4ID0gY29vcmRzW2ldWzFdO1xuXG4gICAgICBpZiggeW1pbiA+IGNvb3Jkc1tpXVswXSApIHltaW4gPSBjb29yZHNbaV1bMF07XG4gICAgICBpZiggeW1heCA8IGNvb3Jkc1tpXVswXSApIHltYXggPSBjb29yZHNbaV1bMF07XG4gICAgfVxuXG4gICAgdmFyIHNvdXRoV2VzdCA9IEwubGF0TG5nKHhtaW4tLjAxLCB5bWluLS4wMSk7XG4gICAgdmFyIG5vcnRoRWFzdCA9IEwubGF0TG5nKHhtYXgrLjAxLCB5bWF4Ky4wMSk7XG5cbiAgICByZXR1cm4gTC5sYXRMbmdCb3VuZHMoc291dGhXZXN0LCBub3J0aEVhc3QpO1xuICB9LFxuXG4gIGdlb21ldHJ5V2l0aGluUmFkaXVzIDogZnVuY3Rpb24oZ2VvbWV0cnksIHh5UG9pbnRzLCBjZW50ZXIsIHh5UG9pbnQsIHJhZGl1cykge1xuICAgIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnBvaW50RGlzdGFuY2UoZ2VvbWV0cnksIGNlbnRlcikgPD0gcmFkaXVzO1xuICAgIH0gZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTGluZVN0cmluZycgKSB7XG5cbiAgICAgIGZvciggdmFyIGkgPSAxOyBpIDwgeHlQb2ludHMubGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIGlmKCB0aGlzLmxpbmVJbnRlcnNlY3RzQ2lyY2xlKHh5UG9pbnRzW2ktMV0sIHh5UG9pbnRzW2ldLCB4eVBvaW50LCAzKSApIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICByZXR1cm4gdGhpcy5wb2ludEluUG9seWdvbihjZW50ZXIsIGdlb21ldHJ5KTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gaHR0cDovL21hdGguc3RhY2tleGNoYW5nZS5jb20vcXVlc3Rpb25zLzI3NTUyOS9jaGVjay1pZi1saW5lLWludGVyc2VjdHMtd2l0aC1jaXJjbGVzLXBlcmltZXRlclxuICAvLyBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9EaXN0YW5jZV9mcm9tX2FfcG9pbnRfdG9fYV9saW5lXG4gIC8vIFtsbmcgeCwgbGF0LCB5XVxuICBsaW5lSW50ZXJzZWN0c0NpcmNsZSA6IGZ1bmN0aW9uKGxpbmVQMSwgbGluZVAyLCBwb2ludCwgcmFkaXVzKSB7XG4gICAgdmFyIGRpc3RhbmNlID1cbiAgICAgIE1hdGguYWJzKFxuICAgICAgICAoKGxpbmVQMi55IC0gbGluZVAxLnkpKnBvaW50LngpIC0gKChsaW5lUDIueCAtIGxpbmVQMS54KSpwb2ludC55KSArIChsaW5lUDIueCpsaW5lUDEueSkgLSAobGluZVAyLnkqbGluZVAxLngpXG4gICAgICApIC9cbiAgICAgIE1hdGguc3FydChcbiAgICAgICAgTWF0aC5wb3cobGluZVAyLnkgLSBsaW5lUDEueSwgMikgKyBNYXRoLnBvdyhsaW5lUDIueCAtIGxpbmVQMS54LCAyKVxuICAgICAgKTtcbiAgICByZXR1cm4gZGlzdGFuY2UgPD0gcmFkaXVzO1xuICB9LFxuXG4gIC8vIGh0dHA6Ly93aWtpLm9wZW5zdHJlZXRtYXAub3JnL3dpa2kvWm9vbV9sZXZlbHNcbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzU0NTA5OC9sZWFmbGV0LWNhbGN1bGF0aW5nLW1ldGVycy1wZXItcGl4ZWwtYXQtem9vbS1sZXZlbFxuICBtZXRlcnNQZXJQeCA6IGZ1bmN0aW9uKGxsLCBtYXApIHtcbiAgICB2YXIgcG9pbnRDID0gbWFwLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGwpOyAvLyBjb252ZXJ0IHRvIGNvbnRhaW5lcnBvaW50IChwaXhlbHMpXG4gICAgdmFyIHBvaW50WCA9IFtwb2ludEMueCArIDEsIHBvaW50Qy55XTsgLy8gYWRkIG9uZSBwaXhlbCB0byB4XG5cbiAgICAvLyBjb252ZXJ0IGNvbnRhaW5lcnBvaW50cyB0byBsYXRsbmcnc1xuICAgIHZhciBsYXRMbmdDID0gbWFwLmNvbnRhaW5lclBvaW50VG9MYXRMbmcocG9pbnRDKTtcbiAgICB2YXIgbGF0TG5nWCA9IG1hcC5jb250YWluZXJQb2ludFRvTGF0TG5nKHBvaW50WCk7XG5cbiAgICB2YXIgZGlzdGFuY2VYID0gbGF0TG5nQy5kaXN0YW5jZVRvKGxhdExuZ1gpOyAvLyBjYWxjdWxhdGUgZGlzdGFuY2UgYmV0d2VlbiBjIGFuZCB4IChsYXRpdHVkZSlcbiAgICByZXR1cm4gZGlzdGFuY2VYO1xuICB9LFxuXG4gIC8vIGZyb20gaHR0cDovL3d3dy5tb3ZhYmxlLXR5cGUuY28udWsvc2NyaXB0cy9sYXRsb25nLmh0bWxcbiAgcG9pbnREaXN0YW5jZSA6IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHZhciBsb24xID0gcHQxLmNvb3JkaW5hdGVzWzBdLFxuICAgICAgbGF0MSA9IHB0MS5jb29yZGluYXRlc1sxXSxcbiAgICAgIGxvbjIgPSBwdDIuY29vcmRpbmF0ZXNbMF0sXG4gICAgICBsYXQyID0gcHQyLmNvb3JkaW5hdGVzWzFdLFxuICAgICAgZExhdCA9IHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MiAtIGxhdDEpLFxuICAgICAgZExvbiA9IHRoaXMubnVtYmVyVG9SYWRpdXMobG9uMiAtIGxvbjEpLFxuICAgICAgYSA9IE1hdGgucG93KE1hdGguc2luKGRMYXQgLyAyKSwgMikgKyBNYXRoLmNvcyh0aGlzLm51bWJlclRvUmFkaXVzKGxhdDEpKVxuICAgICAgICAqIE1hdGguY29zKHRoaXMubnVtYmVyVG9SYWRpdXMobGF0MikpICogTWF0aC5wb3coTWF0aC5zaW4oZExvbiAvIDIpLCAyKSxcbiAgICAgIGMgPSAyICogTWF0aC5hdGFuMihNYXRoLnNxcnQoYSksIE1hdGguc3FydCgxIC0gYSkpO1xuICAgIHJldHVybiAoNjM3MSAqIGMpICogMTAwMDsgLy8gcmV0dXJucyBtZXRlcnNcbiAgfSxcblxuICBwb2ludEluUG9seWdvbiA6IGZ1bmN0aW9uIChwLCBwb2x5KSB7XG4gICAgdmFyIGNvb3JkcyA9IChwb2x5LnR5cGUgPT0gXCJQb2x5Z29uXCIpID8gWyBwb2x5LmNvb3JkaW5hdGVzIF0gOiBwb2x5LmNvb3JkaW5hdGVzXG5cbiAgICB2YXIgaW5zaWRlQm94ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG9pbnRJbkJvdW5kaW5nQm94KHAsIHRoaXMuYm91bmRpbmdCb3hBcm91bmRQb2x5Q29vcmRzKGNvb3Jkc1tpXSkpKSBpbnNpZGVCb3ggPSB0cnVlXG4gICAgfVxuICAgIGlmICghaW5zaWRlQm94KSByZXR1cm4gZmFsc2VcblxuICAgIHZhciBpbnNpZGVQb2x5ID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvb3Jkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMucG5wb2x5KHAuY29vcmRpbmF0ZXNbMV0sIHAuY29vcmRpbmF0ZXNbMF0sIGNvb3Jkc1tpXSkpIGluc2lkZVBvbHkgPSB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGluc2lkZVBvbHlcbiAgfSxcblxuICBwb2ludEluQm91bmRpbmdCb3ggOiBmdW5jdGlvbiAocG9pbnQsIGJvdW5kcykge1xuICAgIHJldHVybiAhKHBvaW50LmNvb3JkaW5hdGVzWzFdIDwgYm91bmRzWzBdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzFdID4gYm91bmRzWzFdWzBdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdIDwgYm91bmRzWzBdWzFdIHx8IHBvaW50LmNvb3JkaW5hdGVzWzBdID4gYm91bmRzWzFdWzFdKVxuICB9LFxuXG4gIGJvdW5kaW5nQm94QXJvdW5kUG9seUNvb3JkcyA6IGZ1bmN0aW9uKGNvb3Jkcykge1xuICAgIHZhciB4QWxsID0gW10sIHlBbGwgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb29yZHNbMF0ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHhBbGwucHVzaChjb29yZHNbMF1baV1bMV0pXG4gICAgICB5QWxsLnB1c2goY29vcmRzWzBdW2ldWzBdKVxuICAgIH1cblxuICAgIHhBbGwgPSB4QWxsLnNvcnQoZnVuY3Rpb24gKGEsYikgeyByZXR1cm4gYSAtIGIgfSlcbiAgICB5QWxsID0geUFsbC5zb3J0KGZ1bmN0aW9uIChhLGIpIHsgcmV0dXJuIGEgLSBiIH0pXG5cbiAgICByZXR1cm4gWyBbeEFsbFswXSwgeUFsbFswXV0sIFt4QWxsW3hBbGwubGVuZ3RoIC0gMV0sIHlBbGxbeUFsbC5sZW5ndGggLSAxXV0gXVxuICB9LFxuXG4gIC8vIFBvaW50IGluIFBvbHlnb25cbiAgLy8gaHR0cDovL3d3dy5lY3NlLnJwaS5lZHUvSG9tZXBhZ2VzL3dyZi9SZXNlYXJjaC9TaG9ydF9Ob3Rlcy9wbnBvbHkuaHRtbCNMaXN0aW5nIHRoZSBWZXJ0aWNlc1xuICBwbnBvbHkgOiBmdW5jdGlvbih4LHksY29vcmRzKSB7XG4gICAgdmFyIHZlcnQgPSBbIFswLDBdIF1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29vcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvb3Jkc1tpXS5sZW5ndGg7IGorKykge1xuICAgICAgICB2ZXJ0LnB1c2goY29vcmRzW2ldW2pdKVxuICAgICAgfVxuICAgICAgdmVydC5wdXNoKGNvb3Jkc1tpXVswXSlcbiAgICAgIHZlcnQucHVzaChbMCwwXSlcbiAgICB9XG5cbiAgICB2YXIgaW5zaWRlID0gZmFsc2VcbiAgICBmb3IgKHZhciBpID0gMCwgaiA9IHZlcnQubGVuZ3RoIC0gMTsgaSA8IHZlcnQubGVuZ3RoOyBqID0gaSsrKSB7XG4gICAgICBpZiAoKCh2ZXJ0W2ldWzBdID4geSkgIT0gKHZlcnRbal1bMF0gPiB5KSkgJiYgKHggPCAodmVydFtqXVsxXSAtIHZlcnRbaV1bMV0pICogKHkgLSB2ZXJ0W2ldWzBdKSAvICh2ZXJ0W2pdWzBdIC0gdmVydFtpXVswXSkgKyB2ZXJ0W2ldWzFdKSkgaW5zaWRlID0gIWluc2lkZVxuICAgIH1cblxuICAgIHJldHVybiBpbnNpZGVcbiAgfSxcblxuICBudW1iZXJUb1JhZGl1cyA6IGZ1bmN0aW9uIChudW1iZXIpIHtcbiAgICByZXR1cm4gbnVtYmVyICogTWF0aC5QSSAvIDE4MDtcbiAgfVxufTtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIl19
