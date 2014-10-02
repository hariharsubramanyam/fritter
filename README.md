Project 2 - Fritter
============

# Grading Instructions

## Usage

1. Navigate to [fritter-hariharfritter.rhcloud.com/](http://fritter-hariharfritter.rhcloud.com/)

Or to run the server locally, do the following:

1. Install dependencies with `npm install`
2. Start mongodb with `sudo mongod`
3. Start the server with `npm start`
4. Navigate to [localhost:8080](http://localhost:8080/)

When you first start, you'll see a **login/register** modal, so type a username, password, and confirmed password and then click **Register**.

Then, you'll see the main screen. You can type a tweet into the box and click the **Make Tweet** button. to make the tweet.

If you want to edit your tweet, click the **Edit** button above the tweet. Then modify the body of the tweet and click the **Done** button.

If you want to delete your tweet, click the **Delete** button.

If you want to logout, click the **Logout** button. If you don't logout, the session state will be stored as a cookie.

If you logout, then when you start the page again, the login/register modal will appear again and you can login by typing your username and password and then clicking **Login**.


## Highlights



## Help Wanted

Currently, the client gets the latest tweets by [polling the server every second](https://github.com/6170-fa14/hsubrama_proj2/blob/master/public/js/tweet_list.js#L147). Ideally, I'd like to replace this **pull** system with a **push** systems. I'm thinking of using WebSockets, but is there a better way?

# Design Challenges

## Data Models

Currently, my data models are:

```
UserAuth: {
  _id: ObjectId,
  username: String,
  hash_password: String
}
```


```
Tweet: {
  _id: ObjectId,
  username: String
  content: String
  created: Date
}
```

```
Session: {
  _id: ObjectId,
  username: String
}
```
The `username` is unique, because there can only be one user with a given `username`. I was worried that these models were too simple, but they worked very well for the first project - resulting in clean code and very few database calls for each operation (ex. there was never a need to make database accesses for each element in an array).

However, I expect that these models will be extended for part 2 of the project.

## No Server Side View Rendering

I made a decision to **NOT render any HTML on the server side**. The server serves only as a REST API and simply returns JSON, no HTML. The decision to not do server side rendering and to make it a simple JSON REST API offers **MANY** benefits, some of which are:

1. There is no UI code on the server, so the frontend and backend are decoupled, which makes it easier to work on them separately.
2. The REST API can be used by many different programs - Apps, Web clients, Scripts, Desktop applications, Embedded systems connected to the internet, and more.
3. Testing the server is much easier, we only need to see if the JSON responses are correct, we don't need to parse HTML looking for specific data.
4. The web client gets all its data through AJAX calls so there is **no need for refreshing the page**.
5. The client **only needs to download the HTML/CSS/JavaScript ONCE**. After that, the only thing passing back and forth is JSON. This means that the amount of data going from client to server (and vice versa) is much less.


# Architecture


# Author
Harihar Subramanyam (hsubrama@mit.edu)

# Documentation

The code has been commented using [JSDoc](http://usejsdoc.org/) conventions.
