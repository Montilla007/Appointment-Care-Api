const express = require('express')
const router = express.Router()

const { getSchedule, requestSchedule, verifySchedule, editSchedule, makeConsult } = require('../controllers/schedule')

router.get('/schedule/:id', getSchedule)
router.post('/request/:id', requestSchedule)
router.put('/verify/:id', verifySchedule)
router.put('/edit/:id', editSchedule)
router.put('/consult/:id', makeConsult)

module.exports = router