
var debug = require('debug')('crunchbase');
var defaults = require('defaults');
var superagent = require('superagent');
var util = require('util');

/**
 * Expose the `CrunchBase`.
 */

module.exports = CrunchBase;

/**
 * Endpoints.
 */

var API_ENDPOINT = 'http://api.crunchbase.com/v/1';

/**
 * Initialize a `CrunchBase` instance.
 *
 * @param {String} apiKey
 */

function CrunchBase (apiKey) {
  if (!(this instanceof CrunchBase)) return new CrunchBase(apiKey);
  if (!apiKey) throw new Error('CrunchBase API key is required.');
  this.apiKey = apiKey;
}

/**
 * Get the first company search result for `name`.
 *
 * @param {String} name
 * @param {Function} callback
 */

CrunchBase.prototype.company = function (name, callback) {
  var self = this;
  this.search(name, function (err, results) {
    if (err) return callback(err);
    if (results.length === 0) return callback();
    else self.permalink(results[0].permalink, callback);
  });
};

/**
 * Search for companies by the company `name`.
 *
 * @param {String} name
 * @param {Function} callback
 */

CrunchBase.prototype.search = function (name, callback) {
  debug('searching for %s ..', name);
  superagent
    .get(API_ENDPOINT + '/search.js?query=' + name + '&entity=company&api_key=' + this.apiKey)
    .end(function(err, res) {
      if (err) return callback(err);
      if (res.type != 'text/javascript') return callback(new Error('Unexpected response type'));
      var json;
      var error = null;
      try {
        json = JSON.parse(res.text).results;
        json = json.filter(function(e) {
          return e.namespace === 'company';
        });
        debug('found %d results for query %s.', json.length, name);
      } catch (e) {
        debug('error parsing json');
        error = e;
      }
      callback(error, json);
    });
};

/**
 * Get the company by its `permalink`.
 *
 * @param {String} permalink
 * @param {Function} callback
 */

CrunchBase.prototype.permalink = function (permalink, callback) {
  debug('get company by permalink %s ..', permalink);
  superagent
    .get(API_ENDPOINT + '/company/' + permalink + '.js?api_key=' + this.apiKey)
    .end(function(err, res) {
      if (err) return callback(err);
      var json;
      var error = null;
      try {
        json = JSON.parse(res.text);
        debug('got CrunchBase profile for company %s', json.name);
      } catch (e) {
        debug('error parsing json');
        error = e;
      }
      callback(error, json);
    });
};
