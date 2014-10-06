// This file defines a global object which other files can use to export their "classes".
// For instance, if I create a "class" X in my file, then I can set Fritter.X = X. This way,
// other files can utilize the class using: var myX = new Fritter.X(); By associating the classes
// with the global Fritter object, we avoid polluting the global namespace.
Fritter = {};
