// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const mid = require("./auth-middleware");
const Users = require("../users/users-model");

router.post(
  "/register",
  mid.checkUsernameFree,
  mid.checkPasswordLength,
  async (req, res, next) => {
    try {
      const user = req.user;
      const hash = bcrypt.hashSync(user.password, 12);
      user.password = hash;
      let result = await Users.add(user);
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  }
);
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
router.post(
  "/login",
  mid.checkUsernameExists,

  (req, res, next) => {
    const password = req.body.password;
    if (bcrypt.compareSync(password, req.user.password) == true) {
      req.session.user = req.user;
      res.json({ message: `Welcome ${req.body.username}!` });
    } else {
      next({ status: 401, message: "invalid credentials" });
    }
  }
);
/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */
router.get("/logout", (req, res, next) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err != null) {
        next({ status: 200, message: "no session" });
      } else {
        res.status(200).json({ message: "logged out" });
      }
    });
  } else {
    res.status(200).json({ message: "no session" });
  }
});
/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router;
