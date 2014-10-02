var express = require("express");
var async = require("async");
var UserAuth = require("../models/user_auth").UserAuth;
var Session = require("../models/session").Session;
var Tweet = require("../models/tweet").Tweet;
var constants = require("../models/constants");
var route_helper = require("./route_helper");
var send_error = route_helper.send_error;
var send_response = route_helper.send_response;
var bcrypt = require("bcrypt");
var router = express.Router();
var mongoose;

/**
 * Returns all the tweets sorted by date.
 *
 * @param res - Returns 
 * {
 *  error: the error, or null if there is no error.
 *  result: [...] (the array of tweet objects)
 * }
 */
router.get("/all", function(req, res) {
  async.waterfall([
    // Step 1: Return all the tweets.
    function(callback) {
      Tweet.find({}).sort("created").exec(function(err, results) {
        if (err) send_error(res, err);
        send_response(res, results);
      });
    }
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}
