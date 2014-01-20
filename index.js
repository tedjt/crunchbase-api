
var debug = require('debug')('crunchbase-phantom');
var defaults = require('defaults');
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;

/**
 * Expose the `CrunchbaseScraper`.
 */

module.exports = CrunchbaseScraper;

/**
 * Initialize a `CrunchbaseScraper` instance.
 *
 * @param {CrunchbaseScraper} scraper
 */

function CrunchbaseScraper (scraper) {
  if (!(this instanceof CrunchbaseScraper)) return new CrunchbaseScraper(scraper);
  this.scraper = scraper;
  this.loggedIn = false;
}

/**
 * Inherit from `Emitter`.
 */

inherit(CrunchbaseScraper, Emitter);

/**
 * Log into Crunchbase.
 *
 * @param {String} username
 * @param {String} password
 * @param {Function} callback
 */

CrunchbaseScraper.prototype.login = function (username, password, callback) {
  var self = this;
  var url = 'http://www.linkedin.com/home';
  debug('opening linkedin login page %s', url);
  this.scraper.readyPage(url, function (err, page) {
    if (err) return self.error(err, page, callback);
    debug('opened linkedin login page, submitting login form ..');
    submitLoginForm(page, username, password, function (err) {
      if (err) return self.error(err, page, callback);
      // check the cookies to make sure we're logged in
      self.scraper.phantom.getCookies(function (cookies) {
        var filtered = cookies.filter(function (cookie) {
          return cookie.name === 'li_at'; // li_at is the login cookie
        });
        if (filtered.length === 0) { // we're not logged in
          var err =  new Error('Failed to log into Crunchbase.');
          debug('failed to log into Crunchbase');
          self.error(err, page, callback);
        } else { // we are logged in
          self.loggedIn = true;
          self.emit('log in');
          debug('successfully logged into Crunchbase');
          callback();
        }
      });

    });
  });
  return this;
};

/**
 * Scrapes a Crunchbase person profile by `url`.
 *
 * @param {String} url
 * @param {Function} callback
 */

CrunchbaseScraper.prototype.person = function (url, callback) {
  if (!this.loggedIn) return callback(new Error('Not loggedin yet.'));
  var self = this;
  debug('scraping Crunchbase person profile %s ..', url);
  this.scraper.readyPage(url, function (err, page) {
    if (err) return self.error(err, page, callback);
    debug('scraped Crunchbase person profile');
    parsePersonProfile(page, function (err, profile) {
      if (err) return self.error(err, page, callback);
      if (profile) {
        debug('parsed Crunchbase person profile');
        self.emit('person profile', profile);
      } else {
        debug('failed to parse Crunchbase person profile');
      }
      page.close();
      callback(null, profile);
    });
  });
};

/**
 * Scrapes a Crunchbase company profile by `url`.
 *
 * @param {String} url
 * @param {Function} callback
 */

CrunchbaseScraper.prototype.company = function (url, callback) {
  if (!this.loggedIn) return callback(new Error('Not loggedin yet.'));
  var self = this;
  debug('scraping Crunchbase company profile %s ..', url);
  this.scraper.readyPage(url, function (err, page) {
    if (err) return self.error(err, page, callback);
    debug('scraped Crunchbase company profile');
    parseCompanyProfile(page, function (err, profile) {
      if (err) return self.error(err, page, callback);
      if (profile) {
        debug('parsed Crunchbase company profile');
        self.emit('company profile', profile);
      } else {
        debug('failed to parse Crunchbase company profile');
      }
      page.close();
      callback(null, profile);
    });
  });
};

/**
 * Emits and returns an `err` to `callback`, and closes the `page`.
 *
 * @param {Error} err
 * @param {Function} callback
 */

CrunchbaseScraper.prototype.error = function (err, page, callback) {
  if (page) page.close();
  if (err) {
    this.emit('error', err);
    if (callback) callback(err);
  }
};

/**
 * Submits the Crunchbase login page
 *
 * @param {Page} page
 * @param {String} username
 * @param {String} password
 * @param {Function} callback
 */

function submitLoginForm (page, username, password, callback) {

  page.evaluate(
    function (username, password) {
      // if you're already logged in, the body class won't contain guest anymore
      if (!document.body.classList.contains('guest')) return 'success';

      var form        = document.getElementById('login');
      var usernameBox = document.getElementById('session_key-login');
      var passwordBox = document.getElementById('session_password-login');

      if (!form) return 'Crunchbase form element not found.';
      if (!usernameBox) return 'Crunchbase username textbox not found.';
      if (!passwordBox) return 'Crunchbase password textbox not found.';

      usernameBox.value = username;
      passwordBox.value = password;

      form.submit();

      return 'success';
    },

    function (status) {
      var err = null;
      if (status !== 'success') err = new Error(status);
      setTimeout(function () { return callback(err); }, 3000);
    },

    username, password);
}

/**
 * Parses the Crunchbase person profile.
 *
 * @param {Page} page
 * @param {Function} callback
 */

function parsePersonProfile (page, callback) {

  page.evaluate(function () {

    var data = {
      name        : $('.full-name').text(),
      headline    : $('#headline .title').text(),
      summary     : $('.background-summary .summary .description').text(),
      location    : $('.locality').find('a').first().text(),
      industry    : $('.industry').find('a').first().text(),
      education   : $('#overview-summary-education').find('a').last().text(),
      connections : parseInt($('.member-connections').find('strong').text().replace(',', ''), 10),
      experiences : []
    };

    var experienceDivs = $('#background-experience').children().find('div');

    experienceDivs.each(function (i, experienceDiv) {

      experienceDiv = $(experienceDiv);

      var experience = {
        //title: experienceDiv.find('[name]="title"').text(),
        description: experienceDiv.find('.description').text(),
        company: {
          name: experienceDiv.find('.miniprofile-container').find('a').text(),
          url : experienceDiv.find('.miniprofile-container').find('a').attr('href')
        }
      };

      var times = experienceDiv.find('.experience-date-locale').find('time');
      if (times.length === 3) {
        experience.start = $(times[0]).text().replace(' – ', '');
        experience.end = $(times[1]).text().replace(' – ', '');
        experience.duration = $(times[2]).text();
      }

      data.experiences.push(experience);
    });

    return data;

  }, function (data) {
    return callback(null, data);
  });
}

/**
 * Parses the Crunchbase company profile.
 *
 * @param {Page} page
 * @param {Function} callback
 */

function parseCompanyProfile (page, callback) {

  page.evaluate(function () {

    var data = {
      name        : $('.header .name').text().trim(),
      logoUrl     : $('.header .image-wrapper .image').attr('src'),
      website     : $('.basic-info .website a').text(),
      description : $('.about-def .description p').text(),
      industry    : $('.industry p').text(),
      type        : $('.type p').text().trim(),
      size        : $('.company-size p').text().trim(),
      employees   : parseInt($('.how-connected .stats li').last().find('a').text().replace(',', ''), 10)
    };

    return data;

  }, function (data) {
    return callback(null, data);
  });
}
