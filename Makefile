
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

sparql-query.js: index.js components
	@component build --standalone sparql-query --out . --name sparql-query

sparql-query.min.js: sparql-query.js
	@uglifyjs $< > $@

sparql-query.min.js.gz: sparql-query.min.js
	@zopfli -c $< > $@

all: clean build components sparql-query.min.js.gz

.PHONY: clean all
