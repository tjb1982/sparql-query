;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("sparql-query/index.js", function(exports, require, module){
exports.Query = require('./abstract/query');
exports.ConstructQuery = require('./concrete/construct');

});
require.register("sparql-query/abstract/query.js", function(exports, require, module){
var Query = function() {};

Query.prototype.isArray = function(test) {
  return Object.prototype.toString.call(test) === '[object Array]';
};

Query.prototype.flattenInput = function(input) {
  var query = this;

  return this.isArray(input) ? input.map(function(x, i) {
    if (query.isArray(x))
      return query.flattenInput(x)[0];
    else switch (x.split(/\s+/g).length) {
      case 3:
        return x;
      case 2:
        return query.isArray(input[i + 1]) && x + ' ' + input[i + 1].join(' , ');
      case 1:
        return query.isArray(input[i + 1]) && x + ' ' + query.flattenInput(input[i + 1]).join(' ; ');
      default:
        return x;
    }
  }).filter(function(x) {
    return x;
  })
  : input;
};

Query.prototype.where = function(input) {
  var query = this;
  this._whereClauses = this._whereClauses || [];

  this.flattenInput(input).map(function(string) {
    query._whereClauses.push(string);
  });

  return this;
};

Query.prototype.optional = function(input) {
  var query = this;
  this._optional = this._optional || [];

  this.flattenInput(input).map(function(string) {
    query._whereClauses.push('optional { ' + string + ' } ');
  });

  return this;
};

Query.prototype.out = Query.prototype.serialize = function(replacements) {
  var query = this;
  replacements && replacements.map(function(replacement, i) {
    var re = i === replacements.length - 1 ? /%s/g : /%s/;
    query._out = query._out.replace(re, replacement);
  });

  return this._out;
};

module.exports = Query;

});
require.register("sparql-query/concrete/construct.js", function(exports, require, module){
var Query = require('../abstract/query');

var ConstructQuery = function(options) {
  options = options || {};
  this._constructTriples = (options.construct &&
                            this.flattenInput(options.construct)) || [];
  this._whereClauses = (options.where &&
                        this.flattenInput(options.where)) || [];
};

ConstructQuery.prototype = Object.create(Query.prototype);

ConstructQuery.prototype.construct = function(input) {
  var self = this;
  this.flattenInput(input).forEach(function(string) {
    self._constructTriples.push(string);
  });

  return this;
};

ConstructQuery.prototype.serialize = ConstructQuery.prototype.out = function(replacements) {
  this._out = 'construct { ' + this._constructTriples.join(' . ') + ' } where { ' +
    this._whereClauses.join(' . ') + ' }';

  return Query.prototype.out.call(this, replacements);
};

module.exports = ConstructQuery;

});
require.alias("sparql-query/index.js", "sparql-query/index.js");if (typeof exports == "object") {
  module.exports = require("sparql-query");
} else if (typeof define == "function" && define.amd) {
  define([], function(){ return require("sparql-query"); });
} else {
  this["sparql-query"] = require("sparql-query");
}})();