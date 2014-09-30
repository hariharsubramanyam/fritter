var express = require('express');
var router = express.Router();
var auth_manager;

router.get('/form', function(req, res) {
  res.render('login_form', {});
});

router.post("/register", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var confirm_password = req.body.confirm_password;
  res.end("Trying to register");
});

module.exports.initialize = function(_auth_manager) {
 auth_manager = _auth_manager; 
 return router;
};
