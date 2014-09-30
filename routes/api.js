var express = require("express");
var router = express.Router();

var tweet_manager;
var auth_manager;

/**
 * Responds to an request with a 400 (bad request) status code and a response body of the form:
 * {
 *  error: the error message.
 * }
 *
 * @param res - The response object that we will write to.
 * @param error - The error message that will be sent back to the client.
 */
var invalid_request = function(res, error) {
  res.status(400); // 400 status means bad request.
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
 * If there is no username or password, then the client will receive a 400 (bad request) response:
 * {
 *  error: {
 *    reason: 0,
 *    message: "You must pass 'password' and 'username' fields in your POST request"
 *  }
 * }
 *
 * If the username already exists, then the client will receive a 400 (bad request) response:
 * {
 *  error: {
 *    reason: 1,
 *    message: "The username already exists"
 *  }
 * }
 *
 * Otherwise, the client will recieve a 200 (OK) response:
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
 *  If there is no username or password, then the client will receive a 400 (bad request) response:
 *  {
 *    error: {
 *      reason: 0,
 *      message: "You must pass 'password' and 'username' fields in your POST request"
 *    }
 *  }
 *
 *  If the username does not exist, then the client will receive a 400 (bad request) response:
 *  {
 *    error: {
 *      reason: 1,
 *      message: "The user does not exist"
 *    }
 *  }
 *
 *  If the password is incorrect, then the client will receive a 400 (bad request) response:
 *  {
 *    error: {
 *      reason: 2,
 *      message: "The password is incorrect"
 *    }
 *  }
 *
 *  Otherwise, then the client will receive a 200 (OK) response:
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

module.exports.initialize = function(_auth_manager, _tweet_manager) {
  auth_manager = _auth_manager;
  tweet_manager = _tweet_manager;
  return router;
}
