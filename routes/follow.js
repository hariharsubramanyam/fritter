/**
 * This file defines the routes for managing following. The routes are:
 * 
 * followers - Returns the follow relationships where the user is the followed.
 * followed - Returns the follow relationships where the user is the follower.
 * make - Makes a user follow another user.
 * delete - Makes a user unfollow another user.
 * friends - Returns the usernames of all the followers of the user who the user also follows.
 */
var express = require("express");
var async = require("async");
var Session = require("../models/session").Session;
var UserAuth = require("../models/user_auth").UserAuth;
var Follow = require("../models/follow").Follow;
var route_helper = require("./route_helper");
var send_error = route_helper.send_error;
var send_response = route_helper.send_response;
var router = express.Router();
var mongoose;

/**
 * Returns the follow relationships where the user is the followed.
 *
 * @param req - POST body must have a 'session_id'.
 * @param res - Result is 
 * {
 *  error: null (or an error if there is an error),
 *  result: [...] (the follow relationships where the user is the followed)
 * }
 *
 * Each follow relationship takes the form:
 * {
 *  follower: username of the follower.
 *  followed: username of the followed.
 * }
 */
router.post("/followers", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that the session id is in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "The POST body must have a session_id");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Get the username of the user.
    function(session_id, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length === 0) {
          send_error(res, "There is no user with the given session_id");
        } else {
          callback(null, results[0].username);
        }
      });
    },
    // Step 3: Find all the follow relationships where user is the followed. 
    function(username, callback) {
      Follow.find({"followed": username}, function(err, results) {
        if (err) send_error(res, err);
        send_response(res, results);
      });
    }
  ]);
});

/**
 * Returns the follow relationships where the user is the follower.
 *
 * @param req - POST body must have a 'session_id'.
 * @param res - Result is 
 * {
 *  error: null (or an error if there is an error),
 *  result: [...] (the followers)
 * }
 *
 * Each follow relationship takes the form:
 * {
 *  follower: username of the follower.
 *  followed: username of the followed.
 * }
 */
router.post("/followed", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that the session id is in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "The POST body must have a session_id");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Get the username of the user.
    function(session_id, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length === 0) {
          send_error(res, "There is no user with the given session_id");
        } else {
          callback(null, results[0].username);
        }
      });
    },
    // Step 3: Find all the follow relationships where user is the followed. 
    function(username, callback) {
      Follow.find({"follower": username}, function(err, results) {
        if (err) send_error(res, err);
        send_response(res, results);
      });
    }
  ]);
});

/**
 * Makes a user follow another user.
 *
 * @param req - POST body needs 'session_id' of the follower and the 'followed' username.
 * @param res - The response will be:
 * {
 *  error: The error, or null if there is no error.
 *  result: {
 *    _id: ObjectID of the follow relationship (you need to use toString() on this).
 *    follower: The username of the follower.
 *    followed: The username of the followed.
 *  }
 * }
 */
router.post("/make", function(req, res) {
  async.waterfall([
  // Step 1: Get the session_id and the followed from the POST body.
  function(callback) {
    var session_id = req.body.session_id;
    var followed = req.body.followed;
    if (session_id === undefined || followed === undefined) {
      send_error(res, "POST body needs session_id and followed");
    } else {
      callback(null, session_id, followed);
    }
  },
  // Step 2: Get the follower from the session_id. 
  function(session_id, followed, callback) {
    Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
      if (err) send_error(res, err);
      if (results.length === 0) {
        send_error(res, "There is no user with the given session_id");
      } else if (results[0].username === followed) {
        send_error(res, "You can't follow yourself");
      } else {
        callback(null, followed, results[0].username);
      }
    });
  },
  // Step 3: Check if the follow relationship already exists. 
  function(followed, follower, callback) {
    Follow.find({"follower": follower, "followed": followed}, function(err, results) {
      if (err) send_error(res, err);
      // If the follow relationship already exists, just return it.
      if (results.length !== 0) {
        send_response(res, results[0]);
      } else {
        callback(null, followed, follower);
      }
    });
  },
  // Step 4: Check that the followed exists.
  function(followed, follower, callback) {
    UserAuth.find({"username": followed}, function(err, results) {
      if (err) send_error(res, err);
      if (results.length === 0) {
        send_error(res, "The followed username does not exist!");
      } else {
        callback(null, followed, follower);
      }
    });
  },
  // Step 5: Create the follow relationship.
  function(followed, follower, callback) {
    var new_follow = new Follow({"follower": follower, "followed": followed});
    new_follow.save(function(err, result) {
      if (err) send_error(res, err);
      send_response(res, result);
    });
  }
  ]);
});

/**
 * Makes a user unfollow another user.
 *
 * @param req - POST body needs "session_id" of the follower and the "followed" username.
 * @param res - The response will be:
 * {
 *  error: The error, or null if there is no error.
 *  result: true
 * }
 */
router.post("/delete", function(req, res) {
  async.waterfall([
  // Step 1: Get the session_id and the followed from the POST body.
  function(callback) {
    var session_id = req.body.session_id;
    var followed = req.body.followed;
    if (session_id === undefined || followed === undefined) {
      send_error(res, "POST body needs session_id and followed");
    } else {
      callback(null, session_id, followed);
    }
  },
  // Step 2: Get the follower from the session_id. 
  function(session_id, followed, callback) {
    Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
      if (err) send_error(res, err);
      if (results.length === 0) {
        send_error(res, "There is no user with the given session_id");
      } else if (results[0].username === followed) {
        send_error(res, "You can't follow yourself");
      } else {
        callback(null, followed, results[0].username);
      }
    });
  },
  // Step 3: Remove all the follow relationships.
  function(followed, follower, callback) {
    Follow.remove({"follower": follower, "followed": followed}, function(err, results) {
      if (err) send_error(res, err);
      send_response(res, true);
    });
  }
  ]);
});

/**
 * Get the usernames of all the followers of the user who the user also follows.
 *
 * @param req - POST body must contain session_id.
 * @param res - Returns 
 * {
 *  error: null, unless there is an error
 *  result: [...] (array of usernames of friends)
 * }
 */
router.post("/friends", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that the session id is in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "The POST body must have a session_id");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Get the username of the user.
    function(session_id, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length === 0) {
          send_error(res, "There is no user with the given session_id");
        } else {
          callback(null, results[0].username);
        }
      });
    },
    // Step 3: Find all the follow relationships where user is the followed. 
    function(username, callback) {
      Follow.find({"followed": username}, function(err, results) {
        if (err) send_error(res, err);
        var followers = [];
        for (var i = 0; i < results.length; i++) {
          followers.push(results[i].follower);
        }
        callback(null, username, followers);
      });
    },
    // Step 4: Given the followers, find all the relationship where following is mutual. 
    function(username, followers, callback) {
      Follow.find().and([{"follower": username}, {"followed": {"$in": followers}}]).exec(function(err, results) {
        if (err) send_error(res, err);
        var friends = [];
        for (var i = 0; i < results.length; i++) {
          friends.push(results[i].followed);
        }
        send_response(res, friends);
      });
    }
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}
