const express = require('express');
const router = express.Router();
const { register, login, licenseDoctor } = require('../controllers/auth');

router.post('/SignUp', register); // Remove upload middleware from here
router.post('/SignupDoctor', licenseDoctor)
router.post('/Login', login);

module.exports = router;
