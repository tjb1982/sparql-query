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

ConstructQuery.prototype.serialize = ConstructQuery.prototype.out = function() {
  return 'construct { ' + this._constructTriples.join(' . ') + ' } where { ' +
    this._whereClauses.join(' . ') + ' }';
};

module.exports = ConstructQuery;
