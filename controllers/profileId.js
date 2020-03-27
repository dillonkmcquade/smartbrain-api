const handleProfileGet = (req, res, db) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("not found");
      }
    })
    .catch(err => res.status(400).json("error getting user"));
};

const handleProfileUpdate = (req, res, db, bcrypt) => {
  const { id } = req.params;
  const { email, currentPassword, newPassword, confirmPassword } = req.body;
  if (!newPassword || !currentPassword || !confirmPassword || !email) {
    return res.status(400).json("incorrect credentials");
  }
  const newHash = bcrypt.hashSync(newPassword);
  const currentHash = bcrypt.hashSync(currentPassword);
  const passwordMatch =
    newPassword === confirmPassword
      ? true
      : res.status(400).json("passwords do not match");

  console.log(email);

  if (passwordMatch) {
    db.select("hash")
      .from("login")
      .where("hash", "=", currentHash)
      .then(data => {
        const isValid = bcrypt.compareSync(currentHash, data[0].hash);
        if (isValid) {
          db("login")
            .where({ id: id })
            .update({ hash: newHash })
            
        } else {
          return res.status(400).json("wrong credentials");
        }
      })
      .catch(err => res.status(400).json("Wrong credentials."));
  }
  //db.select("*")
  //.from("users")
  //.where({ id })
  //.then(user => {
  // const isValid = bcrypt.compareSync(currentHash, user[0].hash);
  // if (isValid && passwordMatch) {
  //        console.log("valid");
  //    } else {
  //    return res.status(400).json("wrong credentials");
  // }
  ///   })
  // .catch(err => res.status(400).json("error updating password"));
};

module.exports = {
  handleProfileGet: handleProfileGet,
  handleProfileUpdate: handleProfileUpdate
};
