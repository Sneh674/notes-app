const mongoose = require("mongoose");
require("dotenv").config();

// mongoose.connect("mongodb://127.0.0.1:27017/testapp2");
const mongoURL = process.env.DB_URL;
mongoose.connect(mongoURL);
// mongoose.connect("mongodb+srv://naiksneh6:snehnischal@notes-user-db.plfxt.mongodb.net/notes-app")
// retryWrites=true&w=majority&appName=notes-user-db

const logSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: { type: String, required: true, default: "" },
  expiresAt: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model("loggeduser", logSchema);
