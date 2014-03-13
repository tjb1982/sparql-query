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

module.exports = Query;
