(function() {
  var MakeTweetCtrl = function(tweeter, tweet_list, div) {
    var html = new EJS({"url": "/views/make_tweet_view.ejs"}).render({});
    div.append(html);

    var txt_tweet = div.find("#txt_tweet");
    txt_tweet.val("");
    var btn_make_tweet = div.find("#btn_make_tweet");
    var div_tweet_alert = div.find("#div_tweet_alert");
    div_tweet_alert.css("visibility", "hidden");
    var p_tweet_alert = div.find("#p_tweet_alert");

    var alert_timeout;

    var display_alert = function(message) {
      p_tweet_alert.text(message);
      clearTimeout(alert_timeout);
      div_tweet_alert.css("visibility", "visible");
      alert_timeout = setTimeout(function() {
        div_tweet_alert.css("visibility", "hidden");
      }, 5000);
    };

    btn_make_tweet.click(function() {
      var tweet = txt_tweet.val();
      if (tweet.length > 140) {
        display_alert("You need to remove " + (tweet.length - 140) + 
          " characters before you can tweet this!");
      } else {
        tweet_list.make_tweet(txt_tweet.val());
        txt_tweet.val("");
      }
    });
  };

  Fritter.MakeTweetCtrl = MakeTweetCtrl;
})();
