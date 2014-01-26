
# crunchbase

  A node API to get CrunchBase company information. Get a Crunchbase API key [here](http://developer.crunchbase.com/).

## Example

  Get a company profile by name:

```js
var crunchbase = require('crunchbase-api')(apiKey);

crunchbase.company('segment.io', function(err, company) {
  // ..
});
```

## API

#### CrunchBase()

  Create a new CrunchBase `api` instance.

#### .search(name, callback)

  Search CrunchBase for companies with `name`.

#### .permalink(permalink, callback)

  Get the company profile by `permalink`.

#### .company(name, callback)

  Search for a company by `name` and get information for the first one.
