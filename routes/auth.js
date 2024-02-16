const express = require('express')
const router = express.Router()

const { register, login, users, usersId, usersUpdate, usersDelete } = require('../controllers/auth')

router.post('/SignUp', register)
router.post('/Login', login)

router.get('/users', users)
router.get('/users/:id', usersId)
router.put('/users/:id', usersUpdate)
router.delete('/users/:id', usersDelete)

module.exports = router