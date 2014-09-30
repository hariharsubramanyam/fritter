var express = require('express');
var router = express.Router();
var auth_manager;

/* GET home page. */
router.get('/', function(req, res) {
  console.log(req.cookies.session_id);
  if (req.cookies.session_id === undefined || req.cookies.session_id === null) {
    res.redirect("/login/form");
  } else {
    auth_manager.validate_session(req.cookies.session_id, function(err, is_valid) {
      if (err) res.redirect("/login/form");
      if (is_valid) {
        res.send("DOne!");
      } else {
        res.redirect("/login/form");
      }
    });
  }
});

module.exports.initialize = function(_auth_manager) {
  auth_manager = _auth_manager;
  return router;
};
