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
 * @param req - The POST body must contain the session_id of the sender, the username of the
 *              recipient, and the string content of the message
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
 * @param req - POST body must have a session_id
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
      PrivateMessage.find({"recipient": username}, function(err, results) {
        if (err) send_error(res, err);
        send_response(res, results.length);
      });
    }
  ]);
});

module.exports.initialize = function(_mongoose) {
  mongoose = _mongoose;
  return router;
}
