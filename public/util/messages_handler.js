(function() {
  var MessageHandler = function() {
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
