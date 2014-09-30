var express = require("express");
var router = express.Router();

var tweet_manager;
var auth_manager;

router.get("/:username", function(req, res) {
  var username = req.params.username;
});

module.exports.initialize = function(_auth_manager, _tweet_manager) {
  auth_manager = _auth_manager;
  tweet_manager = _tweet_manager;
  return router;
};
