var express = require('express');
var router = express.Router();
var auth_manager;

router.get('/form', function(req, res) {
  res.render('login_form', {});
});

router.post("/register", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  auth_manager.register_user(username, password, function(err, session_id) {
    if (err) {
      res.redirect("form");
    } else {
      res.cookie("session_id", session_id);
      res.end(session_id);
    }
  });
});

module.exports.initialize = function(_auth_manager) {
 auth_manager = _auth_manager; 
 return router;
};
