const express = require('express');
const booleanAdvance = require('../controllers/advance_Search')
const router = express.Router();

router.post("/boolean", booleanAdvance.advanceBoolean.controller)
router.post("/booleanList", booleanAdvance.advanceBooleanControl.controller)
router.post("/serachFeild", booleanAdvance.searchFeild.controller)


module.exports = router;