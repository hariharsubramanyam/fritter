var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('user_list', {
    "users": [1, 2, 3, 4]
  });
});

module.exports = router;
