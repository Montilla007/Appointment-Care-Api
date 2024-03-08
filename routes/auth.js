const express = require('express');
const router = express.Router();
const { register, login, registerDoctor } = require('../controllers/auth');

router.post('/SignUp', register); // Remove upload middleware from here
router.post('/SignupDoctor', registerDoctor)
router.post('/Login', login);

module.exports = router;
