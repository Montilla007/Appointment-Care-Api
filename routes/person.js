const express = require('express')
const router = express.Router()

const { users, usersId, usersUpdate, usersDelete, changePassword } = require('../controllers/person')

router.get('/users', users)
router.get('/users/:id', usersId)
router.put('/users/:id', usersUpdate)
router.delete('/users/:id', usersDelete)
router.put('/password/:id', changePassword)

module.exports = router;