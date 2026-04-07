const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  lastLogin: Date,
  lastLogout: Date,
  lastActive: Date
});

userSchema.pre("save", function(next) {
  this.lastActive = new Date();
  next();
});

userSchema.methods.login = function() {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.logout = function() {
  this.lastLogout = new Date();
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
