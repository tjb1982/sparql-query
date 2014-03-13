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

Query.prototype.out = Query.prototype.serialize = function() {};

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

ConstructQuery.prototype.where = function(input) {
  var self = this;
  this.flattenInput(input).forEach(function(string) {
    self._whereClauses.push(string);
  });

  return this;
};

ConstructQuery.prototype.serialize = ConstructQuery.prototype.out = function() {
  return 'construct { ' + this._constructTriples.join(' . ') + ' } where { ' +
    this._whereClauses.join(' . ') + ' }';
};

exports.Query = Query;
exports.ConstructQuery = ConstructQuery;
