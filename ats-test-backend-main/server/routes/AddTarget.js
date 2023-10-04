const express = require("express");
const router = express.Router();
const Lead_TargetData = require('../controllers/targetController')

router.get("/accMData", Lead_TargetData.amReports.controller)
router.post("/targetLeads", Lead_TargetData.createTarget.controller)
router.get("/getLeads", Lead_TargetData.getTargetData.controller)


module.exports = router;