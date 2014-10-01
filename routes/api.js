var express = require("express");
var router = express.Router();

var tweet_manager;
var auth_manager;

/**
 * Responds with
 * {
 *  error: the error message.
 * }
 *
 * @param res - The response object that we will write to.
 * @param error - The error message that will be sent back to the client.
 */
var invalid_request = function(res, error) {
  var response = {
    "error": error 
  }; // End result.
  res.json(response);
  res.end();
}; // End invalid_request.

/**
 * Sends a response back to the client with the 200 (OK) status code. The response takes the form:
 * {
 *  error: null,
 *  result: the result parameter to this function
 * }
 *
 * @param res - The response object that we will write to.
 * @param result - The value associated with the "result" field of the response.
 */
var send_response = function(res, result) {
  res.status(200); // 200 status means OK.
  res.json({
    "error": null,
    "result": result
  }); // End result.
  res.end();
}; // End send_response.

/**
 * Register a new user.
 *
 * @param req - The request must have req.body.username and req.body.password.
 * @param res - The response object to write to.
 *
 * If there is no username or password, then the client will receive a response:
 * {
 *  error: {
 *    reason: 0,
 *    message: "You must pass 'password' and 'username' fields in your POST request"
 *  }
 * }
 *
 * If the username already exists, then the client will receive a response:
 * {
 *  error: {
 *    reason: 1,
 *    message: "The username already exists"
 *  }
 * }
 *
 * Otherwise, the client will recieve a response:
 * {
 *  error: null,
 *  result: {
 *    session_id: The session id
 *  }
 * }
 */
router.post('/register', function(req, res) {
  if (req.body.username === undefined || req.body.username === null
      || req.body.password === undefined || req.body.password === null) {
    invalid_request(res, {
      "reason": 0,
      "message": "You must pass 'password' and 'username' fields in your POST request" 
    }); // End invalid request.
  } else {
    var username = req.body.username;
    var password = req.body.password;
    auth_manager.register_user(username, password, function(err, session_id) {
      if (err) {
        invalid_request(res, {
          "reason": 1,
          "message": "The username already exists"
        }); // End invalid request.
      } else {
        send_response(res, {
          "session_id": session_id 
        }); // End send response.
      } // End else (i.e. The user has been created).
    }); // End register_user.
  } // End else (i.e. the username and password fields exist).
}); // End register.

/**
 *  Logs in a user.
 *  
 *  @param req - The request must have req.body.username and req.body.password.
 *  @param res - The response object to write to.
 *
 *  If there is no username or password, then the client will receive a response:
 *  {
 *    error: {
 *      reason: 0,
 *      message: "You must pass 'password' and 'username' fields in your POST request"
 *    }
 *  }
 *
 *  If the username does not exist, then the client will receive a response:
 *  {
 *    error: {
 *      reason: 1,
 *      message: "The user does not exist"
 *    }
 *  }
 *
 *  If the password is incorrect, then the client will receive a response:
 *  {
 *    error: {
 *      reason: 2,
 *      message: "The password is incorrect"
 *    }
 *  }
 *
 *  Otherwise, then the client will receive a response:
 *  {
 *    error: null,
 *    result: {
 *      session_id: The session id.
 *    }
 *  }
 */
router.post('/login', function(req, res) {
  if (req.body.username === undefined || req.body.username === null
      || req.body.password === undefined || req.body.password === null) {
    invalid_request(res, {
      "reason": 0,
      "message": "You must pass 'password' and 'username' fields in your POST request" 
    }); // End invalid request.
  } else {
    var username = req.body.username;
    var password = req.body.password;
    auth_manager.login_user(username, password, function(err, session_id) {
      if (err) {
        if (err.reason === 1) {
          invalid_request(res, {
            "reason": 1,
            "message": "The user does not exist"
          }); // End invalid request.
        } else if (err.reason === 2) {
          invalid_request(res, {
            "reason": 2,
            "message": "The password is incorrect"
          }); // End invalid request.
        } // End else if (i.e. the password is incorrect).
      } else {
        send_response(res, {
          "session_id": session_id
        }); // End send response.
      } // End else (i.e. no error).
    }); // End login.
  } // End else (i.e. the username and password are given).
}); // End login.

/**
 * Checks whether a username exists.
 *
 * @param req - The request. The username is extracted from the URL.
 * @param res - The response. If there is an error, we return:
 *
 * {
 *  error: "An error occurred!"
 * }
 *
 * Otherwise, we return
 *
 * {
 *  error: null,
 *  result: {
 *    does_exist: whether the username exists
 *  }
 * }
 */
router.get("/user_exists/:username", function(req, res) {
  auth_manager.check_if_user_exists(req.params.username, function(err, does_exist) {
    if (err) {
      invalid_request(res, "An error occurred!");
    } else {
      send_response(res, {
        "does_exist": does_exist
      });
    }
  }); // End check if user exists.
}); // End username exists.

/**
 * Determine whether the given session is valid.
 *
 * @param req - The request. The body must contain a session_id field.
 * @param res - The response. Will either be:
 * {
 *  error:  "There is no session_id in the POST body."
 * }
 *
 * {
 *  error: "An error occured in validating the session id"
 * }
 *
 * {
 *  error: null,
 *  result: {
 *    is_valid: whether the session id is valid.
 *  }
 * }
 */
router.post("/is_valid_session", function(req, res) {
  var session_id = req.body.session_id;
  if (session_id === undefined) {
    invalid_request(res, "There is no session_id in the POST body.");
  } else {
    auth_manager.validate_session(session_id, function(err, is_valid) {
      if (err) invalid_request(res, "An error occured in validating the session id");
      send_response(res, {
        "is_valid": is_valid
      }); // End send response.
    }); // End validate session.
  } // End else (i.e. session_id is defined).
}); // End is_valid_session.

/**
 * Logout a user.
 *
 * @param req - The request. The body must contain a session_id field.
 * @param res - The response. Will either be:
 * {
 *  error:  "There is no session_id in the POST body."
 * }
 *
 * {
 *  error: null,
 *  result: {
 *    success: true
 *  }
 * }
 */
router.post("/logout", function(req, res) {
  var session_id = req.body.session_id;
  if (session_id === undefined) {
    invalid_request(res, "There is no session_id in the POST body.");
  } else {
    auth_manager.logout_user(session_id, function(err) {
      if (err) invalid_request(res, "An error occured in validating the session id");
      send_response(res, {
        "success": true 
      }); // End send response.
    }); // End validate session.
  } // End else (i.e. session_id is defined).
}); // End logout.

/**
 *  Make a tweet.
 *
 *  @param req - Contains a session_id and a tweet (the text content).
 *
 *  Returns
 *  {
 *    error: null,
 *    result: "Success"
 *  }
 */
router.post("/tweets/make", function(req, res) {
  var session_id = req.body.session_id;
  var tweet = req.body.tweet;
  if (tweet === undefined) {
    invalid_request(res, "There is no tweet in the POST body.");
  } else if (session_id === undefined) {
    invalid_request(res, "There is no session_id in the POST body.");
  } else {
    auth_manager.get_username_for_session_id(session_id, function(err, username) {
      if (err) invalid_request(res, "An error occured in validating the session id");
      tweet.make_tweet(username, tweet, function(err, tweet_id) {
        send_response(res, "Success");
      }); // End make_tweet.
    }); // End get username for session_id.
  } // End else (i.e. session_id is defined).
}); // End make_tweet.

/**
 * Returns all the tweets after a given date.
 *
 * @param req - Contains a date
 */
router.post("/tweets/after", function(req, res) {
});

/**
 * Returns all the tweets.
 * {
 *  error: null,
 *  result: [...]
 * }
 */
router.get("/tweets", function(req, res) {
  tweet_manager.get_tweets(function(err, results) { 
    send_response(res, results);
  }); // End get_tweets.
}); // End get tweets.



module.exports.initialize = function(_auth_manager, _tweet_manager) {
  auth_manager = _auth_manager;
  tweet_manager = _tweet_manager;
  return router;
}
