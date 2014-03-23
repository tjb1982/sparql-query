var Query = function() {};

function isArray (test) {
  return Object.prototype.toString.call(test) === '[object Array]';
};

Query.prototype.flattenInput = function(input) {
  var query = this;

  return isArray(input) ? input.map(function(x, i) {
    if (isArray(x))
      return query.flattenInput(x)[0];
    else {
      var next = input[i + 1];
      switch (x.split(/\s+/g).length) {
        case 3:
          return x;
        case 2:
          return isArray(next) && x + ' ' + next.join(' , ');
        case 1:
          return isArray(next) && (function() {
            next = next.map(function(partOfNext, idx) {
              if (isArray(partOfNext)) {
                var
                pred = next[idx - 1],
                list = partOfNext.join(' , ');
                return pred + ' ' + list;
              }
              else if (!isArray(next[idx + 1])) return partOfNext;
            }).filter(function(x) {
              return x && x.split(/\s+/g).length > 1;
            });
            return next.length ? x + ' ' + next.join(' ; ') : '';
          })();
        default:
          return x;
      }
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

  query._whereClauses.push(
    'optional { ' + this.flattenInput(input).join(' . ') + ' } '
  );

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
