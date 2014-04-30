
var debug = require('debug')('crunchbase');
var defaults = require('defaults');
var natural = require('natural');
var superagent = require('superagent');
var util = require('util');
var leaderUtils = require('leader-utils');

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

CrunchBase.prototype.company = function (name, isDomain, callback) {
  if (typeof isDomain == 'function') {
    callback = isDomain;
    isDomain = false;
  }
  var self = this;
  this.search(name, function (err, results) {
    if (err) return callback(err);
    if (results.length === 0) return callback();
    else {
      if (isDomain) {
        console.log(results);
        // scan for one that matches the domain
        var domainMatchResult = null;
        for (var i = 0; i < results.length; i++) {
          if (name === leaderUtils.getCleanDomain(results[i].homepage_url)) {
            // return early
            return self.permalink(results[i].permalink, results[i].namespace, callback);
          }
        }
      }
      // TODO(ted) - we should consider requiring that domain searches have an exact
      // match with company domain...
      // otherwise just search for closest match by name ...
      var distances = {};
      results.forEach(function(r) {
        distances[r.name] = natural.JaroWinklerDistance(r.name, name);
      });
      var result = results.sort(function(a, b) {
        return distances[b.name] - distances[a.name];
      })[0];
      self.permalink(result.permalink, result.namespace, callback);
    }
  });
};

/**
 * Search for companies by the company `name`.
 *
 * @param {String} name
 * @param {Function} callback
 */

CrunchBase.prototype.search = function (name, callback) {
  var encodedName = encodeURIComponent(name);
  debug('searching for %s ..', encodedName);
  superagent
    .get(API_ENDPOINT + '/search.js?query=' + encodedName + '&entity=company&api_key=' + this.apiKey)
    .end(function(err, res) {
      if (err) return callback(err);
      if (res.type != 'text/javascript') return callback(new Error('Unexpected response type'));
      var json;
      var error = null;
      try {
        json = JSON.parse(res.text).results;
        json = json.filter(function(e) {
          return e.namespace === 'company' || e.namespace === 'financial-organization';
        });
        debug('found %d results for query %s.', json.length, encodedName);
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

CrunchBase.prototype.permalink = function (permalink, namespace, callback) {
  if ('function' === typeof namespace) {
    callback = namespace;
    namespace = 'company';
  }
  var encodedPermaLink = encodeURIComponent(permalink);
  debug('get company by permalink %s ..', encodedPermaLink);
  superagent
    .get(API_ENDPOINT + '/' + namespace + '/' + encodedPermaLink + '.js?api_key=' + this.apiKey)
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
