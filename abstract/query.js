var Query = function() {};

Query.prototype.isArray = function(test) {
  return Object.prototype.toString.call(test) === '[object Array]';
};

Query.prototype.flattenInput = function(input) {
  var self = this;

  return this.isArray(input) ? input.map(function(x, i) {
    if (self.isArray(x))
      return self.flattenInput(x)[0];
    else switch (x.split(/\s+/g).length) {
      case 3:
        return x;
      case 2:
        return self.isArray(input[i + 1]) && x + ' ' + input[i + 1].join(' , ');
      case 1:
        return self.isArray(input[i + 1]) && x + ' ' + input[i + 1].join(' ; ');
      default:
        return x;
    }
  }).filter(function(x) {
    return x;
  })
  : input;
};

Query.prototype.where = function(input) {
  var self = this;
  this._whereClauses = this._whereClauses || [];

  this.flattenInput(input).map(function(string) {
    self._whereClauses.push(string);
  });

  return this;
};

Query.prototype.optional = function(input) {
  var query = this;
  this._optional = this._optional || [];

  this.flattenInput(input).map(function(string) {
    self._whereClauses.push('optional { ' + string + ' } ');
  });
};

Query.prototype.out = Query.prototype.serialize = function() {};

module.exports = Query;
