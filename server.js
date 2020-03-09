const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profileId = require("./controllers/profileId");
const Clarifai = require("clarifai");
const morgan = require("morgan");

const clarifaiApp = new Clarifai.App({
  apiKey: process.env.API_KEY
});

const handleApiCall = (req, res) => {
  clarifaiApp.models
    .predict(Clarifai.FOOD_MODEL, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json("error"));
};

const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_URI
});


const app = express();
app.use(morgan("combined"));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("IT IS WORKING!");
});
app.post("/signin", signin.signinAuthentication(db, bcrypt));
app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});
app.get("/profile/:id", (req, res) => {
  profileId.handleProfileGet(req, res, db);
});
app.post("/profile/:id", (req, res) => {
  profileId.handleProfileUpdate(req, res, db, bcrypt);
});
app.post("/imagedata", (req, res) => {
  handleApiCall(req, res);
});

module.exports = {
  handleApiCall: handleApiCall
};

app.listen(process.env.PORT || 3000, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
/*
/ --> res = success
/signin  --> POST = success/fail
/register --> POST = user
/profile/:userId -- > GET = user
*/
