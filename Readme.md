# sparql-query

  builds a sparql query string (only construct supported at this time)

## Installation

  Install with [component(1)](http://component.io):

    $ component install tjb1982/sparql-query

## API

```javascript
new sparqlquery.ConstructQuery().construct([
  '?s', [
    'skos:narrower ?narrower',
    'a ?what'
  ]
]).where([
  '?s', [
    'skos:narrower ?narrower',
    'a ?what'
  ]
]).where([
  '?what a', [
    'ex:animal',
    'ex:revered',
    'ex:imaginary'
  ]
]).out();
// construct { ?s skos:narrower ?narrower ; a ?what } where { ?s skos:narrower ?narrower ; a ?what . ?what a ex:animal , ex:revered , ex:imaginary } 
```

```javascript
var triples = new sparqlquery.Query().flattenInput([
  '?s ?p', [
    '?object1',
    '?object2'
  ],
  '?s', [
    '?p ?object1',
    '?p2 ?object2'
  ],
  '?s2 ?p3 ?o3',
  'filter ( ?s != %s )'
]);
// ["?s ?p ?object1 , ?object2", "?s ?p ?object1 ; ?p2 ?object2", "?s2 ?p3 ?o3", "filter ( ?s != %s )"] 

var id = "ex:unicorn";

triples.join(' . ').replace(/%s/g, id);
// ?s ?p ?object1 , ?object2 . ?s ?p ?object1 ; ?p2 ?object2 . ?s2 ?p3 ?o3 . filter ( ?s != ex:unicorn ) 
```


## License

  The MIT License (MIT)

  Copyright (c) 2014 <copyright holders>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
