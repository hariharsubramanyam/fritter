Fritter - A Twitter Clone
============

## Overview

Fritter is a simple Twitter clone built with node.js.

## Demo

Here is a video [demo](http://youtu.be/qM0cn2Haad0) of the app.

## Usage

To run the server locally, do the following:

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

# Author
Harihar Subramanyam (hsubrama@mit.edu)
