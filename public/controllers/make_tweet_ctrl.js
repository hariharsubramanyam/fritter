/**
 * Controller for a textbox and button which make a tweet.
 */
(function() {
  var TWEET_LENGTH = 140;

  var MakeTweetCtrl = function(tweeter, tweet_list, div) {

    // Inflate the UI elements and add them to the div.
    var html = new EJS({"url": "/views/make_tweet_view.ejs"}).render({});
    div.append(html);

    // Create variables associated with the DOM elements.
    var txt_tweet = div.find("#txt_tweet");
    txt_tweet.val(""); // Sometimes the text box has characters (weird) so delete them.
    var btn_make_tweet = div.find("#btn_make_tweet");
    var div_tweet_alert = div.find("#div_tweet_alert");
    div_tweet_alert.css("visibility", "hidden"); // Hide the error message at first.
    var p_tweet_alert = div.find("#p_tweet_alert");

    var alert_timeout;

    /**
     * Display the error message.
     */
    var display_alert = function(message) {
      p_tweet_alert.text(message);
      clearTimeout(alert_timeout);
      div_tweet_alert.css("visibility", "visible");
      alert_timeout = setTimeout(function() {
        div_tweet_alert.css("visibility", "hidden");
      }, 5000);
    };

    /**
     * Validate the tweet and then make it.
     */
    btn_make_tweet.click(function() {
      var tweet = txt_tweet.val();
      if (tweet.length > TWEET_LENGTH) {
        display_alert("You need to remove " + (tweet.length - TWEET_LENGTH) + 
          " characters before you can tweet this!");
      } else {
        tweet_list.make_tweet(txt_tweet.val());
        txt_tweet.val("");
      }
    });
  };

  Fritter.MakeTweetCtrl = MakeTweetCtrl;
})();
