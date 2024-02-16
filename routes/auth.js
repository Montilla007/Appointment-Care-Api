const express = require('express')
const router = express.Router()

const { register, login, users, usersId } = require('../controllers/auth')

router.post('/SignUp', register)
router.post('/Login', login)

router.get('/users', users)
router.get('/users/:id', usersId)

module.exports = router