var mongoose = require("mongoose");
var ObjectId = mongoose.Schema.ObjectId;

var TweetSchema = mongoose.Schema({
  username: {type: String, index: true},
  created: {type: Date, default: Date.now},
  content: String
});

var Tweet = mongoose.model("Tweet", TweetSchema);

module.exports.Tweet = Tweet;
