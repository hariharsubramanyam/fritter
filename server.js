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
var auth_route = require('./routes/auth').initialize(mongoose);
var tweet_route = require('./routes/tweet').initialize(mongoose);
var follow_route = require('./routes/follow').initialize(mongoose);
var search_route = require('./routes/search').initialize(mongoose);
var private_message_route = require('./routes/private_message').initialize(mongoose);

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
app.use('/auth', auth_route);
app.use('/tweets', tweet_route);
app.use('/follow', follow_route);
app.use('/search', search_route);
app.use('/messages', private_message_route);

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
