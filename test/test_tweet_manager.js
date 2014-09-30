var async = require("async");
var bcrypt = require("bcrypt");

var chai = require("chai");
var expect = chai.expect;

var constants = require("../models/constants");

var mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;

var Tweet = require("../models/tweet").Tweet;
var TweetManager = require("../util/tweet_manager").TweetManager;

// NOTE: This test assumes auth is correct.
var AuthManager = require("../util/auth").AuthManager;

describe("Tweet Manager", function() {
  var auth_manager = new AuthManager(mongoose, constants.SALT);
  beforeEach(function(done) {
    async.series([
      function(callback) {
        mongoose.connect(constants.MONGO_TEST_URL, callback);
      }, // End connect to MongoDB.
      function(callback) {
        auth_manager.clear_all_data(callback);
      }, // End clear auth_manager data.
      function(callback) {
        Tweet.remove({}, callback);
      }, // End clear tweet data.
      function(callback) {
        auth_manager.register_user("harihar", "password", callback);
      }, // End add sample user.
      function(callback) {
        // When this tweet's id is converted to a string, the string is:
        // "313233343536373839303132"
        var tweet = new Tweet({
          "_id": new ObjectId("123456789012"),
          "username": "harihar",
          "content": "This is a tweet."
        });
        tweet.save(callback);
      }, // End add sample tweet.
    ], function(err, result) {
      if (err) throw err;
      done();
    }); // End series.
  }); // End before each.

  describe("#make_tweet", function() {
    it("makes a tweet for the user", function(done) {
      var tweet_manager = new TweetManager(mongoose, auth_manager);
      var TWEET_MESSAGE = "This is my first tweet!";
      tweet_manager.make_tweet("harihar", TWEET_MESSAGE, function(err, tweet_id) {
        if (err) throw err;
        var tweet_object_id = new ObjectId(tweet_id);
        Tweet.find({"_id": tweet_object_id}, function(err, results) {
          if (err) throw err;
          expect(results.length).to.eql(1);
          expect(results[0].content).to.eql(TWEET_MESSAGE);
          expect(results[0].username).to.eql("harihar");
          done();
        }); // Find the tweet.
      }); // End make_tweet.
    }); // End it makes a tweet for the user.

    it("doesn't make tweets for nonexistant users", function(done) {
      var tweet_manager = new TweetManager(mongoose, auth_manager);
      tweet_manager.make_tweet("fake user", "this tweet won't exist", function(err, tweet_id) {
        expect(err).to.not.be.a("null");
        done();
      }); // End make_tweet.
    }); // End it doesn't make tweets for nonexistant users.
  }); // End describe make_tweet.

  describe("#edit_tweet", function() {
    it("edits a tweet", function(done) {
      var tweet_manager = new TweetManager(mongoose, auth_manager);
      var NEW_TWEET_MESSAGE = "This is the new tweet";
      tweet_manager.edit_tweet("313233343536373839303132", NEW_TWEET_MESSAGE, 
        function(err, tweet_id) {
        if (err) throw err;
        Tweet.find({"_id": ObjectId(tweet_id)}, function(err, results) {
          if (err) throw err;
          expect(results.length).to.eql(1);
          expect(results[0].content).to.eql(NEW_TWEET_MESSAGE);
          done();
        }); // End find the tweet.
      }); // End edit_tweet. 
    }); // End it edits a tweet.

    it("doesn't edit the tweet if it doesn't exist", function(done) {
      var tweet_manager = new TweetManager(mongoose, auth_manager);
      tweet_manager.edit_tweet("000000000000000000000000", "This tweet won't exist", 
        function(err, tweet_id) {
        expect(err).to.not.be.a("null");
        done();
      }); // End edit_tweet.
    }); // End it doesn't edit the tweet if it doesn't exist.
  }); // End describe edit_tweet.

  describe("#delete_tweet", function() {
    it("deletes tweets", function(done) {
      var tweet_manager = new TweetManager(mongoose, auth_manager);
      tweet_manager.delete_tweet("313233343536373839303132", function(err) {
        if (err) throw err;
        
        // Since this was the only tweet in the database, make sure there
        // are no tweets left in the database.
        Tweet.find({}, function(err, results) {
          if (err) throw err;
          expect(results.length).to.eql(0);
          done();
        }); // End find tweets.
      }); // End delete_tweet.
    }); // End it deletes tweets.
  }); // End describe delete_tweet.

  describe("#get_tweets_for_user", function() {
    it("gets the tweets for the given user", function(done) {
      var tweet_manager = new TweetManager(mongoose, auth_manager);
      tweet_manager.get_tweets_for_user("harihar", function(err, tweets) {
        if (err) throw err;
        expect(tweets.length).to.eql(1);
        expect(tweets[0]._id.toString()).to.eql("313233343536373839303132");
        expect(tweets[0].content).eql("This is a tweet.");
        expect(tweets[0].username).eql("harihar");
        expect(tweets[0].created).to.be.truthy;
        done();
      }); // End get tweets.
    }); // End it gets the tweets for the given user.

    it("does not get tweets if the user does not exist", function(done) {
      var tweet_manager = new TweetManager(mongoose, auth_manager);
      tweet_manager.get_tweets_for_user("fake user", function(err, tweets) {
        expect(err).to.not.be.a("null");
        done();
      }); // End get tweets.
    }); // End it does not get tweets if the user does not exist.
  }); // End describe get_tweets_for_user.

  afterEach(function(done) {
    async.series([
      function(callback) {
        auth_manager.clear_all_data(callback);
      }, // End clear auth_manager data.
      function(callback) {
        Tweet.remove({}, callback);
      }, // End clear all tweets.
      function(callback) {
        mongoose.connection.close(callback);
      }, // Disconnect from MongoDB.
    ], function(err, result) {
      if (err) throw err;
      done();
    }); // end series.
  }); // End after each.
}); // End describe Tweet Manager.
