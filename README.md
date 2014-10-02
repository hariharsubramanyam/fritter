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

My testing code is in `js/tests` and in `js/test.js`, I create a boolean flag which determines whether tests are run.

I would prefer to be able to run tests from the command line instead of having to toggle a flag and run them in the browser. Are there any JavaScript test frameworks which could help me do this?

# Design Challenges

**Problem**: The Game of Life is supposed to be played on an **infinite grid**.

The naive way to store the game state is as a 2D array (i.e. array of arrays). This is bad because it's possible that the next step of the Game of Life produces a cell out of the array bounds. If this is the case, we will have to ignore that cell. By ignoring it, that cell can no longer affect other cells, so our simulation is not a **true** Game of Life.

Another approach is to make a 2D array which is significantly larger than the grid displayed to the user. While this isn't perfect, it is a "better approximation" to an infinite grid. However, many cells of this array may not be used in the simulation, so storage space is wasted.

The solution used in this program is to **store only the coordinates of the live cells**. We store them in a JavaScript object called `live_cells` in `js/life.js`. The keys of the objects are coordinates (represented as two-element arrays converted to strings `[x, y]`) and the values of the object are simply `True`. For instance:

```
{
  "[1, 2]": True,
  "[3, 5]": True
}

```

The above represents a game state with two live cells, at (1, 2) and (3, 5). By storing them as the keys of an object, we can insert, delete, and lookup in constant time.

Since we only store the live cells instead of a 2D array of all cells, we are more efficient with storage space and can scale to support even a very large Game of Life.


# Architecture

`index.html` loads the stylesheets and javascripts. It displays the `canvas` on which the Game of Life will be drawn.

The code is inside the `js` directory.

`js/main.js` - Creates a global object called `LIFE`. All other classes are fields of this object (to avoid polluting global scope).

`js/life.js` - The game logic. It creates the `Life` class which tracks live cells and takes a step in the Game of Life each time the `step()` method is called.

`js/canvas_grid.js` - The canvas grid system. It creates a class which draws a grid on top of an HTML `canvas` and fills/clears grids squares. NOTE: I created this class before the 6.170 staff provided their own drawing code, that is why I'm not using the 6.170 drawing code.

`js/game_ui.js` - Interaction between models and user interface. It sets up handlers for the buttons and sets up the logic to draw the game state (from `js/life.js`) onto the `canvas` grid (from `js/canvas_grid.js`).

`js/sample_initial_states.js` - Defines some sample initial board configurations.

# Testing

Testing is done with [QUnit](http://qunitjs.com/). See `js/qunit.js` and `css/qunit.css`. The following files are also used:

`js/test.js` - Contains a boolean flag to toggle test running. If true, all tests will be run.

`js/tests/` - Unit tests are inside this directory.

# Author
Harihar Subramanyam (hsubrama@mit.edu)

# Documentation

The code has been commented using [JSDoc](http://usejsdoc.org/) conventions.
