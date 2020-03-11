const redis = require("redis");

const redisClient = redis.createClient(
  "redis://h:p1c5b81c6fdea624964669b6ce5d5617e6461fa559fe21d7b44586e7c357a7369@ec2-3-222-213-237.compute-1.amazonaws.com:11169"
);

const requireAuth = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json("Unauthorized");
  }
  return redisClient.get(authorization, (err, reply) => {
    if (err || !reply) {
      return res.status(401).json("Unauthorized");
    }
    return next();
  });
};

module.exports = {
  requireAuth: requireAuth
};
