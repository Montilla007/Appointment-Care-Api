const express = require('express')
const router = express.Router()

const { register, login, users } = require('../controllers/auth')

router.post('/SignUp', register)
router.post('/Login', login)

router.get('/users', users)

module.exports = router