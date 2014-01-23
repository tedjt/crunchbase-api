
var debug = require('debug')('crunchbase-api');
var defaults = require('defaults');
var Emitter = require('events').EventEmitter;
var inherit = require('util').inherits;
var superagent = require('superagent');
var util = require('util');

/**
 * Expose the `CrunchbaseApi`.
 */

module.exports = CrunchbaseApi;


/*
 *  private constants
 */
var API_ENDPOINT = 'http://api.crunchbase.com/v/1';

/**
 * Initialize a `CrunchbaseApi` instance.
 *
 * @param {CrunchbaseApi} api
 */

function CrunchbaseApi () {
  if (!(this instanceof CrunchbaseApi)) return new CrunchbaseApi();
}

/**
 * Inherit from `Emitter`.
 */

inherit(CrunchbaseApi, Emitter);

/**
 * Sets the Crunchbase api key
 *
 * @param {String} key
 */
CrunchbaseApi.prototype.setKey = function (key) {
  this.apiKey = key;
  return this;
};

CrunchbaseApi.prototype.company = function (companyName, callback) {
  //http://api.crunchbase.com/v/1/search.js?query=instagram&entity=company
  if (!this.apiKey) return callback(new Error('No API key set'));
  // let callback functions make a closure over variable.
  var self = this;

  var companySearchUrl = util.format(
    '%s/search.js?query=%s&entity=company&api_key=%s',
    API_ENDPOINT, companyName, self.apiKey);

  debug('api searching for company named: %s', companyName);
  superagent.get(companySearchUrl).end(function(err, res) {
    if (err) return callback(err);
    var searchJson, firstResult, companyDataUrl;
    searchJson = JSON.parse(res.text);
    firstResult = searchJson.results[0];
    if (firstResult) {
      debug('api found matching Crunchbase company profile: %s',
        firstResult.permalink);
      companyDataUrl = util.format('%s/company/%s.js?api_key=%s',
        API_ENDPOINT, firstResult.permalink, self.apiKey);

      superagent.get(companyDataUrl).end(function(err, res) {
        if (err) return callback(err);
        var companyJson = JSON.parse(res.text);
        if (companyJson) {
          debug('parsed Crunchbase company profile');
          self.emit('company profile', companyJson);
        } else {
          debug('failed to parse Crunchbase company profile');
        }
        callback(null, companyJson);
      });
    }
  });
};
