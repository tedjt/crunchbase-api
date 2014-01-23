
var assert = require('assert');
var CrunchbaseApi = require('..');

describe('linkedin-scraper', function () {
  this.timeout(30000); // LinkedIn login takes a while
  
  it('should be able to set api key', function () {
    this.crunchbaseApi = new CrunchbaseApi();
    this.crunchbaseApi.setKey('9x75rxx54sqpsrycunct2ryq');
  });

  it('should be able to pull a company profile', function (done) {
    var name = 'segment.io';
    this.crunchbaseApi.company(name, function (err, company) {
      if (err) return done(err);
      assert(company.crunchbase_url === 'http://www.crunchbase.com/company/segment-io');
      done();
    });
  });
});