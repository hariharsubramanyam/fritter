(function() {
  var authenticator = Fritter.Authenticator();
  var tweeter = Fritter.Tweeter(authenticator);
  var follow_manager = Fritter.FollowManager();
  var messages_handler = Fritter.MessageHandler();
  var btn_home;
  var btn_follow;
  var friend_list;
  var txt_message;
  var btn_send_message;
  var message_list;

  /**
   * Key = username
   * Val = {
   *  "list_item": the list item
   * }
   */
  var html_for_username = {};

  var selected_username;

  $(document).ready(function() {
    async.series([
      function(callback) {
        Fritter.RouteToLoginCtrl(authenticator, callback);
      },
      setup_variables,
      setup_friend_list,
      setup_views
    ]);
  });

  var get_messages_from_friend = function(username) {
    messages_handler.messages_from(username, function(err, results) {
      populate_message_list(results);
    }); 
  };

  var populate_message_list = function(messages) {
      message_list.empty();
      for (var i = 0; i < messages.length; i++) {
        var html = new EJS({"url": "message_list_item.ejs"}).render(messages[i]);
        message_list.append(html);
      }

  };

  var update_unread_friends = function() {
    messages_handler.get_unread_friend_names(function(err, data) {
      if (err) {
        console.log(err);
      } else {
        for (var i = 0; i < data.length; i++) {
          if (data[i] === selected_username) {
            get_messages_from_friend(selected_username);
          } else {
            html_for_username[data[i]].list_item.find("span").text(data[i] + " (unread)");
          }
        }
      }
    });
  };

  var setup_friend_list = function(callback) {
    follow_manager.get_friends(function(err, data) {
      if (err) {
        console.log(err);
      } else {
        set_friend_list_items(data);
        callback(null);
      }
    });
  };

  var setup_variables = function(callback) {
    btn_home = $("#btn_home");
    btn_follow = $("#btn_follow");
    friend_list = $("#friend_list");
    btn_send_message = $("#btn_send_message");
    txt_message = $("#txt_message");
    message_list = $("#message_div ul");
    callback(null);
  };

  var set_friend_list_items  = function(friends) {
    friend_list.empty();
    html_for_username = {};
    for (var i = 0; i < friends.length; i++) {
      (function(friend) {
        var html = new EJS({"url": "/views/friend_list_item.ejs"}).render({
          "friend": friend
        });
        html = $(html);
        html.click(function() {
          friend_list.find("li").removeClass("selected");
          html.addClass("selected");
          txt_message.css("visibility", "visible");
          btn_send_message.css("visibility", "visible");
          html_for_username[friend].list_item.find("span").text(friend);
          selected_username = friend;
          get_messages_from_friend(selected_username);
        });
        html_for_username[friend] = {
          "list_item": html
        };
        friend_list.append(html);
      })(friends[i]);
    }
  };

  var setup_views = function(callback) {
    btn_home.click(function() {
      window.location.href = "/";
    });
    btn_follow.click(function() {
      window.location.href = "/views/follow_page.html";
    });
    btn_send_message.css("visibility", "hidden");
    txt_message.css("visibility", "hidden");
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));
    Fritter.UnreadMessageListener(function(num_unread) {
      update_unread_friends();
    });
    btn_send_message.click(function() {
      messages_handler.send_message(selected_username, txt_message.val(), function(err, data){
        if (err) console.log(err);
        txt_message.val("");
        var html = new EJS({"url": "message_list_item.ejs"}).render(data);
        message_list.prepend(html);
      });
    });
    callback(null);
  };

})();
