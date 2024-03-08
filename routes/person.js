const express = require('express')
const router = express.Router()

const { users, usersId, usersUpdate, usersDelete, changePassword, getImage, getLicense } = require('../controllers/person')

router.get('/users', users)
router.get('/users/:id', usersId)
router.get('/profile/:id', getImage)
router.get('/license/:id', getLicense)
router.put('/users/:id', usersUpdate)
router.delete('/users/:id', usersDelete)
router.put('/password/:id', changePassword)

module.exports = router;