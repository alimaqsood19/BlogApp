const mongoose = require('mongoose');
const User = mongoose.model('User');

//Whenever we run Jest, it runs a new Node environment, looks for .test.js files, loads those files and executes those files alone ONLY. Since it executes nothing else, the server code is not being executed in the same environment as our tests. Basically we can't grab server code - the mongoose User model for example

module.exports = () => {
  return new User({}).save(); //Using User model create a new user and save it, would've passed in googleId and display name but we dont need to since were not using those fields
};
