
var assert = require('assert');
var should = require('should');
var crunchbase = require('..')('7gq4x6duebjgb53ynkxpmrwc');

describe('crunchbase', function () {
  this.timeout(1000 * 60);
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

  it.skip('should be able to pull a company profile for Authy', function (done) {
    crunchbase.company('Authy Inc.', function (err, company) {
      if (err) return done(err);
      company.crunchbase_url.should.equal('http://www.crunchbase.com/company/authy-inc');
      done();
    });
  });

  it('should be able to pull a company profile', function (done) {
    crunchbase.company('IGate', function (err, company) {
      if (err) return done(err);
      assert(company.crunchbase_url === 'http://www.crunchbase.com/company/igate-patni');
      done();
    });
  });

  it('should be able to pull a financial profile', function (done) {
    crunchbase.company('Khosla Ventures', function (err, company) {
      if (err) return done(err);
      company.crunchbase_url.should.equal('http://www.crunchbase.com/financial-organization/khosla-ventures');
      done();
    });
  });

  it('should able to filter operator.com', function (done) {
    crunchbase.company('operator.com', true, function (err, company) {
      if (err) return done(err);
      console.log(company);
      // this is wrong - we rely on leader-crunchbase-api to do some level of filtering
      (company.crunchbase_url).should.eql('http://www.crunchbase.com/company/operation-sports');
      done();
    });
  });

});
