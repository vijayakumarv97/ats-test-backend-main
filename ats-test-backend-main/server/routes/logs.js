const express = require("express");
const router = express.Router();
const logs_controller = require("../controllers/logs_controller")

router.get("/getLoginLogs", logs_controller.getLoginLogs.controller)


module.exports = router
