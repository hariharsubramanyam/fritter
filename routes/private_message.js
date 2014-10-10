/**
 * This file defines the routes for sending and retrieving private messages (i.e. messages from 
 * one user to another).
 *
 * The routes are:
 * mine - Get all messages where this user is involved.
 * send - Send a message to a user.
 * unread - Get the number of unread messages.
 * unread_names - Get the usernames of the users have have sent unread messages.
 * from - Get all messages from the given user.
 *
 *
 */
var express = require("express");
var async = require("async");
var Session = require("../models/session").Session;
var UserAuth = require("../models/user_auth").UserAuth;
var PrivateMessage = require("../models/private_message").PrivateMessage;
var route_helper = require("./route_helper");
var send_error = route_helper.send_error;
var send_response = route_helper.send_response;
var router = express.Router();
var mongoose;

/**
 * Get all messages where this user is involved.
 *
 * @param req - POST body must have a session_id
 * @parma res - Of the form:
 * {
 *  error: null, unless there is an error,
 *  result: [...] Array of messages
 * }
 * Each entry of result looks like:
 * {
 *  _id: ObjectId of message
 *  sender: username of sender,
 *  recipient: username of recipient,
 *  created: date that the message was created,
 *  content: the string content of the message.
 * }
 */
router.post("/mine", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that a session_id exists in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "There must be a session_id in the POST body");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Get the username for the session_id.
    function(session_id, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length !== 1) {
          send_error(res, "Found zero, or more than 1 session with the given id");
        } else {
          callback(null, results[0].username);
        }
      });
    },
    // Step 3: Mark all messages where the user is the recipient as read, because they are being sent to the user.
    function(username, callback) {
      PrivateMessage.update({"recipient": username}, {"unread": false}, {"multi": true}, function(err, result) {
        if (err) send_error(res, err);
        callback(null, username);
      });
    },
    // Step 4: Get all the messages where this user is involved.
    function(username, callback) {
      PrivateMessage.find().or([{"sender": username}, {"recipient": username}]).sort({"sender": 1, "created": -1}).exec(
      function(err, results){
        if (err) send_error(res, err);
        send_response(res, results);
      });
    }
  ]);
});

/**
 * Send a message to a user.
 *
 * @param req - The POST body must contain the 'session_id' of the sender, the 'username' of the
 *              recipient, and the string 'content' of the message
 * @param res - Returns the message, of the form
 * {
 *  error: null, unless there is an error,
 *  result: {
 *    _id: ObjectId of message,
 *    sender: username of sender,
 *    recipient: username of recipient,
 *    created: date that the message was created,
 *    content: content of the message
 *  }
 * }
 */
router.post("/send", function(req, res) {
  async.waterfall([
    // Step 1: Get the session_id, username, and content from the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      var username = req.body.username;
      var content = req.body.content;
      if (session_id === undefined || username === undefined || content === undefined) {
        send_error(res, "The POST body must have a session_id, username, and content");
      } else {
        callback(null, session_id, username, content);
      }
    },
    // Step 2: Get the username with the given session_id.
    function(session_id, username, content, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length === 0) {
          send_error(res, "There is no user with the given username!");
        } else if (results[0].username === username) {
          send_error(res, "You cannot send a message to yourself!");
        } else {
          callback(null, results[0].username, username, content);
        }
      });
    }, 
    // Step 3: Ensure that the recipient is a real user.
    function(sender, recipient, content, callback) {
      UserAuth.find({"username": recipient}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length === 0) {
          send_error(res, "There is no recipient with the username " + recipient);
        } else {
          callback(null, sender, recipient, content);
        }
      });
    },
    // Step 4: Create the message.
    function(sender, recipient, content, callback) {
      var message = new PrivateMessage({
        "sender": sender,
        "recipient": recipient,
        "content": content
      });
      message.save(function(err, result) {
        if (err) send_error(res, err);
        send_response(res, result);
      });
    }
  ]);
});

/**
 * Get the number of unread messages.
 *
 * @param req - POST body must have a 'session_id'
 * @parma res - Of the form:
 * {
 *  error: null, unless there is an error,
 *  result: the number of unread messages
 * }
 */
router.post("/unread", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that a session_id exists in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "There must be a session_id in the POST body");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Get the username for the session_id.
    function(session_id, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length !== 1) {
          send_error(res, "Found zero, or more than 1 session with the given id");
        } else {
          callback(null, results[0].username);
        }
      });
    },
    // Step 3: Find all unread messages where the user is the recipient.
    function(username, callback) {
      PrivateMessage.find({"recipient": username, "unread": true}, function(err, results) {
        if (err) send_error(res, err);
        send_response(res, results.length);
      });
    }
  ]);
});

/**
 * Get the usernames of the users have have sent unread messages.
 *
 * @param req - POST body must have a 'session_id'
 * @parma res - Of the form:
 * {
 *  error: null, unless there is an error,
 *  result: [...] (array of usernames of users who ahve sent unread messages to the user with
 *                 the given session id).
 * }
 */
router.post("/unread_names", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that a session_id exists in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      if (session_id === undefined) {
        send_error(res, "There must be a session_id in the POST body");
      } else {
        callback(null, session_id);
      }
    },
    // Step 2: Get the username for the session_id.
    function(session_id, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length !== 1) {
          send_error(res, "Found zero, or more than 1 session with the given id");
        } else {
          callback(null, results[0].username);
        }
      });
    },
    // Step 3: Find all unread messages where the user is the recipient.
    function(username, callback) {
      PrivateMessage.find({"recipient": username, "unread": true}, function(err, results) {
        if (err) send_error(res, err);
        var names = [];
        for (var i = 0; i < results.length; i++) {
          names.push(results[i].sender);
        }
        send_response(res, names);
      });
    }
  ]);
});

/**
 * Get all messages from the given user.
 *
 * @param req - POST body must have a 'session_id and a 'sender'.
 * @parma res - Of the form:
 * {
 *  error: null, unless there is an error,
 *  result: [...] Array of messages
 * }
 * Each entry of result looks like:
 * {
 *  _id: ObjectId of message
 *  sender: username of sender,
 *  recipient: username of recipient,
 *  created: date that the message was created,
 *  content: the string content of the message.
 * }
 */
router.post("/from", function(req, res) {
  async.waterfall([
    // Step 1: Ensure that a session_id sender exists in the POST body.
    function(callback) {
      var session_id = req.body.session_id;
      var sender = req.body.sender;
      if (session_id === undefined || sender === undefined) {
        send_error(res, "There must be a session_id and sender in the POST body");
      } else {
        callback(null, session_id, sender);
      }
    },
    // Step 2: Get the username for the session_id.
    function(session_id, sender, callback) {
      Session.find({"_id": new mongoose.Types.ObjectId(session_id)}, function(err, results) {
        if (err) send_error(res, err);
        if (results.length !== 1) {
          send_error(res, "Found zero, or more than 1 session with the given id");
        } else {
          callback(null, results[0].username, sender);
        }
      });
    },
    // Step 3: Mark all messages where the user is the recipient as read, because they are being sent to the user.
    function(username, sender, callback) {
      PrivateMessage.update({"recipient": username, "sender": sender}, {"unread": false}, {"multi": true}, function(err, result) {
        if (err) send_error(res, err);
        callback(null, username, sender);
      });
    },
    // Step 4: Get all the messages where this user is involved.
    function(username, sender, callback) {
      PrivateMessage.find().or([{"sender": sender, "recipient": username}, {"sender": username, "recipient": sender}]).sort("-created").exec(
      function(err, results){
        if (err) send_error(res, err);
        send_response(res, results);
      });
    }
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}
