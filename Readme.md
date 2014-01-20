
# crunchbase-scraper

  A Crunchbase [scraper](https://github.com/segmentio/scraper) to get profile and company information.

## Example

  Get a company profile by url:

```js
var Scraper = require('scraper');
var Crunchbase = require('crunchbase-scraper');

Scraper(function (err, scraper) {
  var crunchbase = new Crunchbase(scraper);
  crunchbase.login('username', 'password', function (err) {
    crunchbase.company('http://www.crunchbase.com/company/segment-io', function (err, person) {
      // read the `company` profile
    });
  });
});
```

## API

#### CrunchbaseScraper(scraper)

  Create a new Crunchbase `scraper` instance.

#### .company(url, [options], callback)

  Get a LinkedIn company profile for a given `url`.
