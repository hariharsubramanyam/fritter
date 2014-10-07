(function() {
  /**
   * @param callback - The callback to trigger whenever there are unread messages, executed as
   *                   callback(num_unread_messages);
   */
  var UnreadMessageListener = function(callback) {
    var get_unread_count = function() {
      $.post("/messages/unread", {
        "session_id": $.cookie("session_id")
      }, function(data) {
        data = JSON.parse(data);
        if (data.error) {
          console.log(error);
        } else {
          if (data.result > 0) {
            callback(data.result);
          }
        }
      });
    };

    get_unread_count();
    setInterval(get_unread_count, 1000);
  };
  Fritter.UnreadMessageListener = UnreadMessageListener;
})();
