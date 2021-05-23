const express = require('express');
const router = express.Router();

const users= require('../controllers/users');
const isAuth = require('../middelwares/isAuth');


router.get('/logged_in', isAuth , users.LoggedIn)
router.post('/register', users.Register);
router.post('/login', users.Login);
router.get('/logout', users.Logout);


module.exports = router
