const express = require("express");
const router = express.Router();
const { handleRegisterUser, handleUserLogin } = require("../controllers/authController");

router.post("/register", handleRegisterUser);
router.post("/login", handleUserLogin);

module.exports = router;