const express = require('express')
const router = express.Router()
const upload = require('../middleware/fileUpload');
const { register, login } = require('../controllers/auth')

router.post('/SignUp', upload.single('image'), register); // Add upload middleware here for SignUp route
router.post('/Login', login)

module.exports = router