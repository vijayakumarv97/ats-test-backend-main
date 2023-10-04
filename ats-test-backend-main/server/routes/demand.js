const express = require("express");
const router = express.Router();
const demand_controller = require("../controllers/demand_controller")

router.post("/createDemand", demand_controller.createDemand.controller)
router.post("/updateDemand", demand_controller.updateDemand.controller)
router.post("/deleteDemand", demand_controller.deleteDemand.controller)

router.get("/listDemands", demand_controller.listDemands.controller)
router.get("/listUserCreatedDemands", demand_controller.listUserCreatedDemands.controller)
router.get("/downloadDemands", demand_controller.downloadDemands.controller)
router.get("/getDemandDetails", demand_controller.getDemandDetails.controller)
router.get("/searchDemand", demand_controller.searchDemand.controller)
router.get("/searchUserCreatedDemands", demand_controller.searchUserCreatedDemands.controller)
router.get("/matchCandidate", demand_controller.getMatchDemands.controller)


module.exports = router
