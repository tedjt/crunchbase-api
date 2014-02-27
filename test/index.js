
var assert = require('assert');
var crunchbase = require('..')('7gq4x6duebjgb53ynkxpmrwc');

describe('crunchbase', function () {
  it('should be able to pull a company profile', function (done) {
    crunchbase.company('segment.io', function (err, company) {
      if (err) return done(err);
      assert(company.crunchbase_url === 'http://www.crunchbase.com/company/segment-io');
      done();
    });
  });

  it('should be able to pull a company profile for sensor tower', function (done) {
    crunchbase.company('sensortower.com', function (err, company) {
      if (err) return done(err);
      assert(company.crunchbase_url === 'http://www.crunchbase.com/company/sensor-tower');
      done();
    });
  });
});