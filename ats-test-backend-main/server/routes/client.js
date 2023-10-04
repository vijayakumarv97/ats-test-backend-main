const express = require("express");
const router = express.Router();
const client_controller = require("../controllers/client_controller")
const {mediaUploadS3} = require("../utils/s3_helper")

router.post("/createClient", client_controller.createClient.controller)
router.post("/updateClient", client_controller.updateClient.controller)
router.post("/deleteClient", client_controller.deleteClient.controller)

router.get("/listClients", client_controller.listClients.controller)
router.get("/getClientDetails", client_controller.getClientDetails.controller)
router.get("/searchClients", client_controller.searchClients.controller)
router.get("/getClientName", client_controller.getClientName.controller)
router.get("/downloadClientTracker", client_controller.downloadClientTracker.controller)
router.post("/addClientDocuments",mediaUploadS3("client_docs").array("files"), client_controller.addClientDocuments.controller)
router.post("/addClientTemplate",mediaUploadS3("client_format").array("files"), client_controller.addClientTemplate.controller)


module.exports = router