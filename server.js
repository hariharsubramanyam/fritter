#!/bin/env node
var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "localhost";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var constants = require("./models/constants");
var mongoose = require("mongoose");
mongoose.connect(process.env.OPENSHIFT_MONGODB_DB_URL || constants.MONGO_URL);

// These are all the routes I've defined.
var login_route = require('./routes/login').initialize(mongoose);
var logout_route = require('./routes/logout').initialize(mongoose);
var register_route = require('./routes/register').initialize(mongoose);
var validate_session_route = require('./routes/validate_session').initialize(mongoose);
var make_tweet_route = require('./routes/make_tweet').initialize(mongoose);
var get_all_tweets_route = require('./routes/get_all_tweets').initialize(mongoose);
var tweets_since_date_route = require('./routes/tweets_since_date').initialize(mongoose);
var edit_tweet_route = require('./routes/edit_tweet').initialize(mongoose);
var delete_tweet_route = require('./routes/delete_tweet').initialize(mongoose);
var follow_route = require('./routes/follow').initialize(mongoose);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// This is where all the routes are set up.
app.use('/auth', login_route);
app.use('/auth', logout_route);
app.use('/auth', register_route);
app.use('/auth', validate_session_route);
app.use('/tweets', make_tweet_route);
app.use('/tweets', get_all_tweets_route);
app.use('/tweets', tweets_since_date_route);
app.use('/tweets', edit_tweet_route);
app.use('/tweets', delete_tweet_route);
app.use('/follow', follow_route);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(port, ipaddress, function() {
  console.log('%s: Node server started on %s:%d ...', Date(Date.now() ), ipaddress, port);
});
