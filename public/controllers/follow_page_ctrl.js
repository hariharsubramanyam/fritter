/**
 * Controller for /views/follow_page.html.
 */
(function() {

  // Handles communication with authentication API.
  var authenticator = Fritter.Authenticator();

  // Handles communication with following API.
  var follow_manager = Fritter.FollowManager();

  // Handles communication with search API (for searching by username).
  var search = Fritter.Search();

  // Unordered list (ul) displaying follower names.
  var follower_list;

  // Unordered list (ul) displaying followed names.
  var followed_list;

  // Key is the username of a followed user. Value is the HTML element of the user in the followed 
  // list.
  var followed_users = {};

  // Unordered list (ul) displaying results of search by username.
  var search_list;

  // Button that takes us to the home page.
  var btn_home;
  
  // Button that takes us to the messages page.
  var btn_messages;

  // Text box for entering seach queries.
  var txt_search_user;

  // Button to search by username.
  var btn_search_user;

  $(document).ready(function() {
    async.series([
      function(callback) {
        // Go to the login page if the user is not authenticated.
        Fritter.RouteToLoginCtrl(authenticator, callback);
      },
      setup_variables,
      setup_views,
      retrieve_followers,
      retrieve_followeds,
      function(callback) {
        // Retrieve the list of followers every 1000 to see if there are new followers.
        setInterval(retrieve_followers, 1000);
        callback(null);
      }
    ]);
  });

  /**
   * Set the variables to the DOM elements we care about.
   */
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

  /**
   * Configure the UI elements.
   */
  var setup_views = function(callback) {
    // Setup logout button.
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));

    // Whenever there is an unread message, update the messages butotn to indicate there is
    // and unread message.
    Fritter.UnreadMessageListener(function(unread_count) {
      btn_messages.addClass("yellow-btn");
      if (unread_count === 1) {
        btn_messages.text("1 Unread Message");
      } else {
        bt_.messages.text(unread_count + " Unread Messages");
      }
    });

    // Take us home.
    btn_home.click(function() {
      window.location.href = "/";
    });

    // Take us to the messages.
    btn_messages.click(function() {
      window.location.href = "/views/messages.html";
    });

    // Initiate search by user.
    btn_search_user.click(function() {
      search.search(txt_search_user.val(), function(err, results) {
        if (err) console.log(err);
        set_search_list(results);
      });
    });
    callback(null);
  };

  /**
   * Populates the search list (a ul) with the results of a search.
   */
  var set_search_list = function(results) {
    
    // Remove all items already in the list.
    $("#search_list li").remove();

    for (var i = 0; i < results.length; i++) {
      // Don't add the user (i.e. the user who is using the app) to the search list.
      if (results[i].username === authenticator.get_username()) {
        continue;
      }

      // Create the list item.
      var html = new EJS({"url": "/views/search_result.ejs"}).render({
        "result": results[i],
        "followed_users": followed_users
      });
      html = $(html);

      // If the user is not followed.
      if (followed_users[results[i].username] === undefined) {

        // Configure the follow button to make a call to the following API
        // and update the list elements accordingly.
        var btn_follow = html.find(".btn_follow");
        (function(username, html) {
          btn_follow.click(function() {
            follow_manager.follow(username, function(err, result) {
              if (err) console.log(err);
              html.remove();
              txt_search_user.val("");
              add_to_followed_follower_lists(result, false); 
            });
          });
        })(results[i].username, html);

      } else {

        // If the user is already followed, configure the unfollow button to make a call to the
        // following API and update the list elements accordingly.
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

      // Add the item to the ul.
      search_list.append(html);
    }
  };

  /**
   * Add the given follow relationship to the followed or follower lists (both are ul's)
   */
  var add_to_followed_follower_lists= function(data, is_follower) {
    if (is_follower) {
      // If the user is a follower, then create a list item and add it to the follower list.
      var html = new EJS({"url": "/views/follow_list_item.ejs"}).render({
        "follow": data,
        "mode": "Followers"
      });
      html = $(html);
      follower_list.append(html);
    } else {
      // If the user is followed, then create a list item and add it to the follower list.
      var html = new EJS({"url": "/views/follow_list_item.ejs"}).render({
        "follow": data,
        "mode": "Followeds"
      });
      html = $(html);

      // Also provide a button so that the user can unfollow this user if desired.
      var btn_unfollow = html.find(".unfollow-button");
      btn_unfollow.click(function() {
        follow_manager.unfollow(data.followed, function(err, result) {
          if (err) console.log(err);
          html.remove();
          txt_search_user.val("");
          followed_users[data.followed] = undefined;
        });
      });

      // Update the mapping from followed username to html element.
      followed_users[data.followed] = html;

      // Add the HTML to the ul.
      followed_list.append(html);
    }
  };

  /**
   * Gets the list of followers from the API and updates the ul.
   */
  var retrieve_followers = function(callback) {
    follow_manager.get_followers(function(err, data) {
      if (err) console.log(err);
      follower_list.empty();
      follower_list.append("<li><h1>Followers</h1></li>")
      for (var i = 0; i < data.length; i++) {
        add_to_followed_follower_lists(data[i], true);
      }
      if (callback !== undefined) {
        callback(null);
      }
    });
  };

  /**
   * Gets the list of followed users from the API and updates the ul.
   */
  var retrieve_followeds = function(callback) {
    follow_manager.get_followed(function(err, data) {
      if (err) console.log(err);
      followed_users = {};
      for (var i = 0; i < data.length; i++) {
        add_to_followed_follower_lists(data[i], false);
      }
      callback(null);
    });
  };

})();
