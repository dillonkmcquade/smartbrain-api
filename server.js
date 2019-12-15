const express = require("express");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const register = require("./controllers/register");
const signin = require("./controllers/signin");
const profileId = require("./controllers/profileId");
const Clarifai = require("clarifai");

const clarifaiApp = new Clarifai.App({
  apiKey: "1d7d2ac1e9164b4c9828d5377acb43e4"
});

const handleApiCall = (req, res) => {
  clarifaiApp.models
    .predict(Clarifai.FOOD_MODEL, req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json("errorrrrrr"));
};

const db = knex({
  client: "pg",
  connection: {
    host:
      "postgres://imwxjwntilnoga:498dd19b38722cd6c12196d518a9e6d5f10662eb82f7b5d0858adebdcda58634@ec2-174-129-255-91.compute-1.amazonaws.com:5432/d968l1155h586v",
    user: "imwxjwntilnoga",
    password: "",
    database: "fierce-mountain-50317"
  }
});

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("IT IS WORKING!");
});
app.post("/signin", (req, res) => {
  signin.handleSignin(req, res, db, bcrypt);
});
app.post("/register", (req, res) => {
  register.handleRegister(req, res, db, bcrypt);
});
app.get("./profile/:id", (req, res) => {
  profileId.handleProfileGet(req, res, db);
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
