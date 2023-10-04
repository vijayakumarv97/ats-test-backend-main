const express = require("express");
const router = express.Router();
const aggregate_controller = require("../controllers/aggregate_controller")

router.get("/getDashboardAggregateData", aggregate_controller.getDashboardAggregateData.controller)
router.get("/getHierarchyDemandData", aggregate_controller.getHierarchyDemandData.controller)
router.get("/getHierarchySubmissionData", aggregate_controller.getHierarchySubmissionData.controller)
router.get("/getHierarchyInterviewData", aggregate_controller.getHierarchyInterviewData.controller)
router.get("/listUserLevelDemands", aggregate_controller.listUserLevelDemands.controller)
router.get("/listUserLevelActiveDemands", aggregate_controller.listUserLevelActiveDemands.controller)
router.get("/listUserLevelSubmissions", aggregate_controller.listUserLevelSubmissions.controller)



module.exports = router
