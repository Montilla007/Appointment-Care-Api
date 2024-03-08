const express = require('express')
const router = express.Router()

const { getSchedule, requestSchedule, verifySchedule, editSchedule, makeConsult, cancelConsult } = require('../controllers/schedule')

router.get('/schedule/:id', getSchedule)
router.post('/request/:id', requestSchedule)
router.put('/verify/:id', verifySchedule)
router.put('/edit/:id', editSchedule)
router.put('/consult/:id', makeConsult)
router.delete('/delete/:id', cancelConsult)

module.exports = router