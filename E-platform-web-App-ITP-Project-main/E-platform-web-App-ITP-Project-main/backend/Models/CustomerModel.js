const mongoose = require("mongoose");

const customerSchema = mongoose.Schema({
  ID: { type: String, required: function() { return !this.isOAuth }, trim: true },
  name: { type: String, required: [true, "Please Enter a Name"], trim: true },
  telephone: { type: Number, required: function() { return !this.isOAuth } },
  mail: { type: String, required: [true, "Please Enter Mail"], trim: true, unique: true },
  address: { type: String, required: function() { return !this.isOAuth }, trim: true },
  city: { type: String, required: function() { return !this.isOAuth }, trim: true },
  image: { type: Object, default: {} },
  password: { type: String, required: function() { return !this.isOAuth }, trim: true },
  isOAuth: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
