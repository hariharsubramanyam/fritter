(function() {

  var authenticator = Fritter.Authenticator();
  var tweeter = Fritter.Tweeter(authenticator);
  var follow_manager = Fritter.FollowManager();

  var follower_list;
  var followed_list;

  var btn_home;

  $(document).ready(function() {
    async.series([
      function(callback) {
        Fritter.RouteToLoginCtrl(authenticator, callback);
      },
      setup_variables,
      setup_views,
      retrieve_followers,
      retrieve_followeds
    ]);
  });

  var setup_variables = function(callback) {
    btn_home = $("#btn_home");
    follower_list = $("#follower_list");
    followed_list = $("#followed_list");
    callback(null);
  };

  var setup_views = function(callback) {
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));
    btn_home.click(function() {
      window.location.href = "/";
    });
    callback(null);
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
        });
      });
      followed_list.append(html);
    }
  };

  var retrieve_followers = function(callback) {
    follow_manager.get_followers(function(err, data) {
      if (err) console.log(err);
      for (var i = 0; i < data.length; i++) {
        add_to_list(data[i], true);
      }
      callback(null);
    });
  };

  var retrieve_followeds = function(callback) {
    follow_manager.get_followed(function(err, data) {
      if (err) console.log(err);
      for (var i = 0; i < data.length; i++) {
        add_to_list(data[i], false);
      }
      callback(null);
    });
  };

})();
