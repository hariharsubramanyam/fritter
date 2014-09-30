var express = require('express');
var router = express.Router();
var auth_manager;

/**
 * If the user has a session, take them to the home. Otherwise, take them to the login page.
 */
router.get('/', function(req, res) {
  if (req.cookies.session_id === undefined || req.cookies.session_id === null) {
    res.redirect("/login/form");
  } else {
    auth_manager.validate_session(req.cookies.session_id, function(err, is_valid) {
      if (err) {
        res.redirect("/login/form");
      } else if (is_valid) {
        res.send("DOne!");
      } else {
        res.redirect("/login/form");
      } // End redirect to login.
    }); // End if session_id is valid
  } // End else (i.e. session_id is available)
}); // End router get /

module.exports.initialize = function(_auth_manager) {
  auth_manager = _auth_manager;
  return router;
}; // End initialize.
