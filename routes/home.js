const express = require('express')

const router = express.Router()
const {
  createHome,
  deleteHome,
  getAllHome,
  updateHome,
  getHome,
} = require('../controllers/home')

router.route('/').post(createHome).get(getAllHome)

router.route('/:id').get(getHome).delete(deleteHome).patch(updateHome)

module.exports = router