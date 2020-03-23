const jwt = require("jsonwebtoken");
const redis = require("redis");

const redisClient = redis.createClient(process.env.REDIS_URI);

const signToken = email => {
  const jwtpayload = { email };
  return jwt.sign(jwtpayload, "secret", { expiresIn: "2 days" });
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

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json("Incorrect form submission");
  }
  const hash = bcrypt.hashSync(password);
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into("login")
      .returning("email")
      .then(loginEmail => {
        return db("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(async user => {
            
            if (user[0].id && user[0].email) {
              const newSesh = await createSession(user[0]);
              await res.json(newSesh);
            } else {
              res.status(400).json("error registering new user to DB");
            }
          })
          .catch(console.log);
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => res.status(400).json("unable to register"));
};

module.exports = {
  handleRegister: handleRegister
};
