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
 * Gets all the tweets since a given date, sorted by date in descending order (latest tweet first).
 *
 * The URL must include a date, which is the result of a toString() call to a JavaScript date object.
 * 
 * @param req
 * @param res - Will be 
 * {
 *  error: An error, or null,
 *  result: [...] (the tweets sorted by creation date in descending order);
 * }
 */
router.get("/since/:date", function(req, res) {
  async.waterfall([
    // Step 1: Create the date from the given timestamp.
    function(callback) {
      try {
        callback(null, new Date(req.params.date));
      } catch(err) {
        send_error(res, "Failed to convert the date into a JavaScript Date");
      }
    },
    // Step 2: Return all tweets since the timestamp.
    function(date, callback) {
      try {
        Tweet.find({"created": {"$gte": date}}).sort("created").exec(function (err, results) {
          if (err) send_error(res, "Could not find tweets");
          send_response(res, results);
        });
      } catch(err) {
        send_error(res, "Could not retreive tweets after date " + date);
      }
    }
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}
