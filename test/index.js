
var assert = require('assert');
var LinkedInScraper = require('..');
var Scraper = require('scraper');

describe('linkedin-scraper', function () {
  this.timeout(60000); // LinkedIn login takes a while

  function login (username, password, callback) {
    Scraper(function (err, scraper) {
      if (err) return callback(err);
      var linkedin = new LinkedInScraper(scraper);
      linkedin.on('error', function () {}); // don't let it kill the program
      linkedin.login(username, password, function (err) {
        callback(err, linkedin);
      });
    });
  }

  // it('should fail to log in with bad creds', function (done) {
  //   login('username', 'bogus', function (err, linkedin) {
  //     assert(err); // it should fail to log in
  //     done();
  //   });
  // });

  it('should be able to log in', function (done) {
    var self = this;
    login('ivolo@mit.edu', 'hellohello123', function (err, linkedin) {
      if (err) return done(err);
      assert(linkedin);
      assert(linkedin.loggedIn);
      self.linkedin = linkedin; // janky, but re-loggin in takes too long
      done();
    });
  });

  it('should be able to scrape conans person profile', function (done) {
    var url = 'http://www.linkedin.com/in/conanobrien';
    this.linkedin.person(url, function (err, person) {
      if (err) return done(err);
      assert(person.name);
      assert(person.name.indexOf('Conan') === 0);
      done();
    });
  });

  it('should be able to scrape a company profile', function (done) {
    var url = 'http://www.linkedin.com/company/2425698';
    this.linkedin.company(url, function (err, company) {
      if (err) return done(err);
      assert(company.name);
      assert(company.name === 'Segment.io');
      done();
    });
  });
});