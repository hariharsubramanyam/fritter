(function() {

  var authenticator = Fritter.Authenticator();
  var tweeter = Fritter.Tweeter(authenticator);
  var follow_manager = Fritter.FollowManager();
  var search = Fritter.Search();

  var follower_list;
  var followed_list;

  var followed_users = {};
  var search_list;

  var btn_home;
  var btn_messages;

  var txt_search_user;
  var btn_search_user;

  $(document).ready(function() {
    async.series([
      function(callback) {
        Fritter.RouteToLoginCtrl(authenticator, callback);
      },
      setup_variables,
      setup_views,
      retrieve_followers,
      retrieve_followeds,
      function(callback) {
        setInterval(retrieve_followers, 1000);
        callback(null);
      }
    ]);
  });

  var setup_variables = function(callback) {
    btn_home = $("#btn_home");
    btn_messages = $("#btn_messages");
    follower_list = $("#follower_list");
    followed_list = $("#followed_list");
    search_list = $("#search_list");
    txt_search_user = $("#txt_search_user");
    btn_search_user = $("#btn_search_user");
    callback(null);
  };

  var setup_views = function(callback) {
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));
    Fritter.UnreadMessageListener(function(unread_count) {
      btn_messages.addClass("yellow-btn");
      if (unread_count === 1) {
        btn_messages.text("1 Unread Message");
      } else {
        bt_.messages.text(unread_count + " Unread Messages");
      }
    });
    btn_home.click(function() {
      window.location.href = "/";
    });
    btn_messages.click(function() {
      window.location.href = "/views/messages.html";
    });
    btn_search_user.click(function() {
      search.search(txt_search_user.val(), function(err, results) {
        if (err) console.log(err);
        set_search_list(results);
      });
    });
    callback(null);
  };

  var set_search_list = function(results) {
    $("#search_list li").remove();
    for (var i = 0; i < results.length; i++) {
      if (results[i].username === authenticator.get_username()) {
        continue;
      }
      var html = new EJS({"url": "/views/search_result.ejs"}).render({
        "result": results[i],
        "followed_users": followed_users
      });
      html = $(html);
      if (followed_users[results[i].username] === undefined) {
        var btn_follow = html.find(".btn_follow");
        (function(username, html) {
          btn_follow.click(function() {
            follow_manager.follow(username, function(err, result) {
              if (err) console.log(err);
              html.remove();
              txt_search_user.val("");
              add_to_list(result, false); 
            });
          });
        })(results[i].username, html);
      } else {
        var btn_unfollow = html.find(".btn_unfollow");
        (function(username, html) {
          btn_unfollow.click(function() {
            follow_manager.unfollow(username, function(err, result) {
              if (err) console.log(err);
              html.remove();
              txt_search_user.val("");
              followed_users[username].remove();
              followed_users[username] = undefined;
            });
          });
        })(results[i].username, html);
      }
      search_list.append(html);
    }
  };

  var add_to_list = function(data, is_follower) {
    if (is_follower) {
      var html = new EJS({"url": "/views/follow_list_item.ejs"}).render({
        "follow": data,
        "mode": "Followers"
      });
      html = $(html);
      follower_list.append(html);
    } else {
      var html = new EJS({"url": "/views/follow_list_item.ejs"}).render({
        "follow": data,
        "mode": "Followeds"
      });
      html = $(html);
      var btn_unfollow = html.find(".unfollow-button");
      btn_unfollow.click(function() {
        follow_manager.unfollow(data.followed, function(err, result) {
          if (err) console.log(err);
          html.remove();
          txt_search_user.val("");
          followed_users[data.followed] = undefined;
        });
      });
      followed_users[data.followed] = html;
      followed_list.append(html);
    }
  };

  var retrieve_followers = function(callback) {
    follow_manager.get_followers(function(err, data) {
      if (err) console.log(err);
      follower_list.empty();
      follower_list.append("<li><h1>Followers</h1></li>")
      for (var i = 0; i < data.length; i++) {
        add_to_list(data[i], true);
      }
      if (callback !== undefined) {
        callback(null);
      }
    });
  };

  var retrieve_followeds = function(callback) {
    follow_manager.get_followed(function(err, data) {
      if (err) console.log(err);
      followed_users = {};
      for (var i = 0; i < data.length; i++) {
        add_to_list(data[i], false);
      }
      callback(null);
    });
  };

})();
