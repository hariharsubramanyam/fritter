Project 2 - Fritter
============

# Grading Instructions

## Overview

For this version of Fritter, I have implemented the ability to follow other users. I have also added a feature that allows users to **send private messages to their friends** (two users are considered friends if they follow each other). Both features required additions to my data model.

## Design Document

See [DesignDoc.pdf](http://www.google.com) at the root of the project repo.

## Demo

Here is a video [demo](http://youtu.be/qM0cn2Haad0) of the app.

## Usage

1. Navigate to [fritter-hariharfritter.rhcloud.com/](http://fritter-hariharfritter.rhcloud.com/)

Or to run the server locally, do the following:

1. Install dependencies with `npm install`
2. Start mongodb with `sudo mongod`
3. Start the server with `npm start`
4. Navigate to [localhost:8080](http://localhost:8080/)


### Login/Register
1. First, you need to register, so enter your **username, password, and confirmed password** and click **Register**.

### Tweeting

1. At this point, you’ll be brought to your home screen.
2.	To make a tweet, enter your tweet into the **textarea** and click **Make Tweet**. You’ll see the tweet displayed in your feed below the button.
3.	To edit a tweet, click the **Edit Tweet** button, click the text of the tweet, write something new, and click **Done**.
4.	To delete the tweet, click the **Delete Tweet** button.

### Following

1.	From the home screen, click the **X Follower(s) / Y Followed** button.
2.	This will take you to the Followers page. Now, type a **username (or leave the textarea blank to search all users)** and click **Search**.
3.	This will search through the users. From here, you can click **Follow** to follow the user.
4.	If you ever want to unfollow the user, go to the followers page and click **Unfollow** next to the user’s name.

### Private Messages (extra)

1.	You can send private messages to friends (i.e. users who follow you, and whom you follow back)
2.	From the home screen, click the **X Unread Messages** button.
3.	This will take you to the messages page.
4.	There is a toolbar on the left labeled **Friends**, it lists all your friends. If you don’t have any friends, you’ll need to follow a user and get them to follow you back (if you’re testing the app, you can create two users and make them follow each other)
5.	When you select a user, you can type a message into the **textarea** and click **Send** to send the message

## Highlights

The first highlight is that this project as a Single-Page Application which fetches JSON data from a REST API. This way, the client and server code is nicely separated. For instance, all the client side code is in the `public/` directory and all the server side code is in `server.js`, `models/`, `routes/`, and `views/`.

Another highlight is that I use the Model-View-Controller design pattern effectively. 

On the server side, the controllers are in the `routes/` directory, the models are in the `models/` directory, and the views (there is only one, since most of the view work is handled by the client) are in the `views/` directory.

On the client side, the controllers are in the `controllers/` directory, the models (i.e. the code connecting to the API) are in the `util/` directory, and the views are in the `views/` directory.

The final highlight is that the API endpoints are very simple, which makes the URLs clean and easy to remember. You can find them in the `routes/` directory. The endpoints are:

### Authentication
1. `auth/login`
2. `auth/register`
3. `auth/validate_session`
4. `auth/logout`

### Following
1. `follow/followers`
2. `follow/followed`
3. `follow/friends`
4. `follow/make`
5. `follow/delete`

### Search
1. `search/users`

### Tweets
1. `tweets/since/:date`
2. `tweets/make`
3. `tweets/delete`
4. `tweets/edit`
5. `tweets/all`
6. `tweets/followed`

### Messages
1. `messages/mine`
2. `messages/send`
3. `messages/unread`
4. `messages/unread_names`
5. `messages/from`

# Author
Harihar Subramanyam (hsubrama@mit.edu)
