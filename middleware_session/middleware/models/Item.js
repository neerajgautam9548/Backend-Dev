const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
  isDeleted: { type: Boolean, default: false }
});

itemSchema.methods.softDelete = function() {
  this.isDeleted = true;
  return this.save();
};

itemSchema.pre(/^find/, function(next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Item", itemSchema);
