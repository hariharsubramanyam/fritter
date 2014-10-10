/**
 * Class for communicating with messages API.
 */
(function() {
  var MessageHandler = function() {

    /**
     * Gets all messages for the current user.
     * @param callback - Executed as callback(err, messages).
     *
     * Each message is:
     * {
     *  sender: The username of the sender.
     *  recipient: The username of the recipient (i.e. the current user)
     *  created: the date of creation
     *  content: The content of the message
     *  unread: true if unread
     * }
     */
    var get_all_messages = function(callback) {
      $.post("/messages/mine", {
        "session_id": $.cookie("session_id")
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data.error);
        } else {
          callback(null, data.result);
        }
      });
    };

    /**
     * Get the list of friends who have sent unread messages.
     *
     * @param callback - Executed as callback(err, names), where names is the array
     *                   of usernames.
     */
    var get_unread_friend_names = function(callback) {
      $.post("/messages/unread_names", {
        "session_id": $.cookie("session_id")
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data.error);
        } else {
          callback(null, data.result);
        }
      });
    };

    /**
     * Send the message to the given user with the given content.
     *
     * @param callback - Executed as callback(err, message)
     *
     * The message is:
     * {
     *  sender: The username of the sender.
     *  recipient: The username of the recipient (i.e. the current user)
     *  created: the date of creation
     *  content: The content of the message
     *  unread: true if unread
     * }
     */
    var send_message = function(username, content, callback) {
      $.post("/messages/send", {
        "session_id": $.cookie("session_id"),
        "username": username,
        "content": content
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data.error);
        } else {
          callback(null, data.result);
        }
      });
    };

    /**
     * Get all the messages from the given user.
     * @param callback - Executed as callback(err, messages).
     *
     * Each message is:
     * {
     *  sender: The username of the sender.
     *  recipient: The username of the recipient (i.e. the current user)
     *  created: the date of creation
     *  content: The content of the message
     *  unread: true if unread
     * }
     */
    var messages_from = function(username, callback) {
      $.post("/messages/from", {
        "session_id": $.cookie("session_id"),
        "sender": username
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          callback(data.error);
        } else {
          callback(null, data.result);
        }
      });
    };

    var that = {};
    that.get_all_messages = get_all_messages;
    that.get_unread_friend_names = get_unread_friend_names;
    that.send_message = send_message;
    that.messages_from = messages_from;
    return that;
  };
  Fritter.MessageHandler = MessageHandler;
})();
