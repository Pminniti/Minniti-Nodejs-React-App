const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const passport = require("passport");

const users = require("./Routes/api/users");
const profile = require("./Routes/api/profile");
const posts = require("./Routes/api/posts");

const app = express();

// Body Parser Middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//DataBase Config
const DataBase = require("./config/keys").mongoURI;

//Connect to DataBase (MongoDB)
mongoose
  .connect(
    DataBase,
    { useNewUrlParser: true }
  )
  .then(() => console.log("Database Connection Successful"))
  .catch(err => console.log(err));

// Passport Middleware
app.use(passport.initialize());

// Passport Config
require("./config/passport")(passport);

//user Routes
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log("Server running on port " + port));
