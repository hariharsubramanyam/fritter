// This file defines a basic route template which should be used when creating new routes.
var express = require("express");
var async = require("async");
var UserAuth = require("../models/user_auth").UserAuth;
var route_helper = require("./route_helper");
var send_error = route_helper.send_error;
var send_response = route_helper.send_response;
var router = express.Router();
var mongoose;

/**
 * Search for the users with the given search query.
 *
 * @param req - POST body must have search.
 * @param res - Returns {
 *  error: null, unless there is an error,
 *  result: [...]
 * }
 */
router.post("/users", function(req, res) {
  var search = req.body.search;
  if (search === undefined) {
    search = "";
  }
  console.log(search);
  UserAuth.find({"username": new RegExp(search, "i")}, {"username": 1}, function(err, results) {
    if (err) send_error(res, err);
    send_response(res, results);
  });
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}
