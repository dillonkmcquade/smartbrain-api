const jwt = require("jsonwebtoken");
const redis = require("redis");

const redisClient = redis.createClient(
  "redis://h:p1c5b81c6fdea624964669b6ce5d5617e6461fa559fe21d7b44586e7c357a7369@ec2-3-222-213-237.compute-1.amazonaws.com:11169"
);

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return Promise.reject("Incorrect form submission");
  }
  return db
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then(data => data[0])
          .catch(err => Promise.reject("unable to get user"));
      } else {
        return Promise.reject("wrong credentials");
      }
    })
    .catch(err => Promise.reject("Wrong credentials."));
};

const signToken = email => {
  const jwtpayload = { email };
  return jwt.sign(jwtpayload, "secret", { expiresIn: "2 days" });
};

const getAuthTokenId = (req, res) => {
  const { authorization } = req.headers;
  redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(400).json("Unauthorized");
    }
    return res.json({ id: reply });
  });
};

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const createSession = data => {
  const { email, id } = data;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => ({
      success: "true",
      userId: id,
      token
    }))
    .catch(console.log);
};

const signinAuthentication = (db, bcrypt) => (req, res) => {
  const { authorization } = req.headers;
  return authorization
    ? getAuthTokenId(req, res)
    : handleSignin(db, bcrypt, req, res)
        .then(data =>
          data.id && data.email
            ? createSession(data)
            : Promise.reject("error!!!")
        )
        .then(session => res.json(session))
        .catch(err => res.status(400).json(err));
};

module.exports = {
  signinAuthentication: signinAuthentication,
  redisClient: redisClient
};
