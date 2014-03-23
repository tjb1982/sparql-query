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
