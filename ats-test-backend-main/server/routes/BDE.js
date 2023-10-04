const express = require("express");
const router = express.Router();
const BDE_controller = require("../controllers/BDE_controller")
const {mediaUploadS3} = require("../utils/s3_helper")

router.get("/aggregate_BDE_data", BDE_controller.aggregate_BDE_data.controller)
router.get("/getHierarchyDemandData", BDE_controller.getHierarchyDemandData.controller)
router.get("/listUserLevelDemands", BDE_controller.listUserLevelDemands.controller)
router.get("/listUserLevelActiveDemands", BDE_controller.listUserLevelActiveDemands.controller)
router.get("/getHierarchyEmpanelment", BDE_controller.getHierarchyEmpanelment.controller)
router.get("/getHierarchyExpansion", BDE_controller.getHierarchyExpansion.controller)
router.get("/listUserLevelExpansion", BDE_controller.listUserLevelExpansion.controller)
router.get("/listUserLevelEmpanelment", BDE_controller.listUserLevelEmpanelment.controller)

router.get("/downloadOverallPerformance",mediaUploadS3("overall_performance").array("files"), BDE_controller.downloadOverallPerformance.controller)


module.exports = router
