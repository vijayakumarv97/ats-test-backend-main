const express = require("express");
const router = express.Router();
const vendor_controller = require("../controllers/vendor_controller")

router.post("/createVendor", vendor_controller.createVendor.controller)
router.post("/updateVendor", vendor_controller.updateVendor.controller)
router.post("/deleteVendor", vendor_controller.deleteVendor.controller)

router.get("/listVendors", vendor_controller.listVendors.controller)
router.get("/getVendorDetails", vendor_controller.getVendorDetails.controller)
router.get("/searchVendors", vendor_controller.searchVendors.controller)


module.exports = router
