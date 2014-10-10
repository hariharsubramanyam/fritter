/**
 * Controller for /views/messages.html which displays the users private messages.
 */
(function() {

  /**
   * Communicates with the authentication API.
   */
  var authenticator = Fritter.Authenticator();

  /**
   * Communicates with the following API.
   */
  var follow_manager = Fritter.FollowManager();

  /**
   * Communicates with the message API.
   */
  var messages_handler = Fritter.MessageHandler();

  /**
   * Takes us home when clicked.
   */
  var btn_home;

  /**
   * Takes us to the follow page when clicked.
   */
  var btn_follow;

  /**
   * Displays the list of friends. Two users are friends if they follow each other.
   *
   * You can only send messages to friends.
   */
  var friend_list;

  /**
   * Text area where the message is composed.
   */
  var txt_message;

  /**
   * Sends the message.
   */
  var btn_send_message;

  /**
   * List of messages exchanged with current friend.
   */
  var message_list;

  /**
   * Key = username
   * Val = {
   *  "list_item": the html list item in the friends list. 
   * }
   */
  var html_for_username = {};

  /**
   * The username of the friend whose messages are currently being viewed.
   */
  var selected_username;

  $(document).ready(function() {
    async.series([
      function(callback) {
        // If the user has not authenticated, take them to the login page.
        Fritter.RouteToLoginCtrl(authenticator, callback);
      },
      setup_variables,
      setup_friend_list,
      setup_views
    ]);
  });

  /**
   * Gets the message from the given friend.
   */
  var get_messages_from_friend = function(username) {
    messages_handler.messages_from(username, function(err, results) {
      populate_message_list(results);
    }); 
  };

  /**
   * Update the list of messages with the given messages.
   */
  var populate_message_list = function(messages) {
      message_list.empty();
      for (var i = 0; i < messages.length; i++) {
        // Create the HTML for the message and add it to the list.
        var html = new EJS({"url": "message_list_item.ejs"}).render(messages[i]);
        message_list.append(html);
      }

  };

  /**
   * Get the names of friends who have unread messages and update their name from "name" to 
   * "name (unread)" in the friends list.
   */
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

  /**
   * Get the list of friends and put them into the friend list (the ul on the page).
   */
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

  /**
   * Set the variables to point to the DOM elements.
   */
  var setup_variables = function(callback) {
    btn_home = $("#btn_home");
    btn_follow = $("#btn_follow");
    friend_list = $("#friend_list");
    btn_send_message = $("#btn_send_message");
    txt_message = $("#txt_message");
    message_list = $("#message_div ul");
    callback(null);
  };

  /**
   * Populate the ul of friends with the given friends.
   */
  var set_friend_list_items  = function(friends) {
    friend_list.empty();
    html_for_username = {};
    for (var i = 0; i < friends.length; i++) {
      (function(friend) {

        // Create the HTML.
        var html = new EJS({"url": "/views/friend_list_item.ejs"}).render({
          "friend": friend
        });
        html = $(html);

        // When the list item is clicked, tint it green, show the button/textarea, and show the
        // friend's messages.
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

  /**
   * Configures the views with functionality.
   */
  var setup_views = function(callback) {
    // Take us home.
    btn_home.click(function() {
      window.location.href = "/";
    });

    // Take us to the follow page.
    btn_follow.click(function() {
      window.location.href = "/views/follow_page.html";
    });

    // Hide the text area and button because no friend has been picked.
    btn_send_message.css("visibility", "hidden");
    txt_message.css("visibility", "hidden");

    // Set up the logout button.
    Fritter.LogoutButtonCtrl(authenticator, $("#div_logout_button"));
    
    // When unread messages come in, update the list of unread messages.
    Fritter.UnreadMessageListener(function(num_unread) {
      update_unread_friends();
    });

    // Send the message.
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
