const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const Clarifai = require("clarifai");
const morgan = require("morgan");

const auth = require("./controllers/authorization");
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profileId = require("./controllers/profileId");

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
  connection: DATABASE_URL
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
app.get("/profile/:id", auth.requireAuth, (req, res) => {
  profileId.handleProfileGet(req, res, db);
});
app.post("/profile/:id", auth.requireAuth, (req, res) => {
  profileId.handleProfileUpdate(req, res, db, bcrypt);
});
app.post("/imagedata", auth.requireAuth, (req, res) => {
  handleApiCall(req, res);
});

module.exports = {
  handleApiCall: handleApiCall
};

app.listen(PORT || 3000, () => {
  console.log(`App is running on port ${PORT}`);
});
