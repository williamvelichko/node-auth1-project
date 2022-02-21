const db = require("../../data/db-config");
const Users = require("../users/users-model");
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req, res, next) {
  if (req.session == null) {
    next({ status: 401, message: "you shall not pass" });
  } else {
    next();
  }
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
async function checkUsernameFree(req, res, next) {
  const username = req.body.username;
  // console.log(username);
  const user = await Users.findBy({ username: username }).first();
  // if (!username || typeof username != "string" || !username.trim()) {
  //   next({ status: 401, message: "username Required" });
  // } else
  //console.log(user);
  if (user) {
    next({ status: 401, message: "Username Taken" });
  } else {
    req.user = user;
    next();
  }
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  const username = req.body.username;
  // console.log(username);
  const user = await Users.findBy({ username: username }).first();
  // if (!username || typeof username != "string" || !username.trim()) {
  //   next({ status: 401, message: "username Required" });
  // } else
  //console.log(user);
  if (user == null) {
    next({ status: 401, message: "Invalid credentials" });
  } else {
    req.user = user;
    next();
  }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
async function checkPasswordLength(req, res, next) {
  const password = req.body.password;
  const result = await Users.findBy({ password: password }).first();
  if (
    !password ||
    typeof password != "string" ||
    !password.trim() ||
    password.length <= 3
  ) {
    next({ status: 401, message: "Password must be longer than 3 chars" });
  } else {
    req.user = {
      username: req.body.username.trim(),
      password: password.trim(),
    };
    next();
  }
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength,
};
