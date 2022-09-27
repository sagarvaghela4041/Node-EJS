const express = require('express');

const userController = require('../controllers/user-controller');
const auth = require('../middlewares/authentication');

const router = express.Router();

// getting registration form
router.get('/registration', userController.getRegistrationForm);

// saving registration request
router.post('/registration', userController.postRegistrationForm);

// getting login form
router.get('/login', userController.getLoginForm);

// checking login
router.post('/login', userController.postLoginForm);

// success page
router.get('/', auth, userController.getWelcome);

router.get('/thank-you', auth, userController.getThankYou);

// logout
router.post('/logout', userController.postLogout);

module.exports = router;