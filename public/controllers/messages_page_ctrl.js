(function() {
  var authenticator = Fritter.Authenticator();
  var tweeter = Fritter.Tweeter(authenticator);
  var follow_manager = Fritter.FollowManager();
  var btn_home;
  var btn_follow;
  var friend_list;

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
    callback(null);
  };

  var set_friend_list_items  = function(friends) {
    friend_list.empty();
    for (var i = 0; i < friends.length; i++) {
      (function(friend) {
        var html = new EJS({"url": "/views/friend_list_item.ejs"}).render({
          "friend": friend
        });
        html = $(html);
        html.click(function() {
          friend_list.find("li").removeClass("selected");
          html.addClass("selected");
        });
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
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));
    callback(null);
  };

})();
