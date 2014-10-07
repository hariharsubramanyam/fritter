(function() {
  var FollowManager = function() {

    /**
     * Get the followers for the current user.
     *
     * @param callback - Called as callback(err, results)
     * err is an error or null
     * results is an array of the follow relationships where each element is of the form
     * {
     *  "_id": the id of the relationship,
     *  "follower": The username of a follower
     *  "followed": The username of the current user
     * }
     */
    var get_followers = function(callback) {
      $.post("/follow/followers", {
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
     * Get the usernames of the people that the current user follows.
     *
     * @param callback - Called as callback(err, results)
     * err is an error or null
     * results is an array of the follow relationships where each element is of the form
     * {
     *  "_id": the id of the relationship,
     *  "follower": The username of the current user.
     *  "followed": The username of a user that the current user is following.
     * }
     */
    var get_followed = function(callback) {
      $.post("/follow/followed", {
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
     * Follow the given user.
     *
     * @param username - The username of the user to follow.
     * @param callback - Executed as callback(err, result). err is an error or null.
     * result is an object of the form:
     * {
     *  _id: The ObjectId of the follow relationship,
     *  follower: The username of the follower
     *  followed: The usernaem of the followed
     * }
     */
    var follow = function(username, callback) {
      $.post("/follow/make", {
        "session_id": $.cookie("session_id"),
        "followed": username
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
     * Unfollows the given user.
     *
     * @param username - The username of the user to follow.
     * @param callback - Executed as callback(err, result). err is an error or null.
     * result is true.
     */
    var unfollow = function(username, callback) {
      $.post("/follow/delete", {
        "session_id": $.cookie("session_id"),
        "followed": username
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
    that.get_followed = get_followed;
    that.get_followers = get_followers;
    that.follow = follow;
    that.unfollow = unfollow;
    return that;
  };

  Fritter.FollowManager = FollowManager;
})();
