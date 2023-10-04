const express = require("express");
const router = express.Router();
const employee_controller = require("../controllers/employee_controller")

router.post("/createEmployee", employee_controller.createEmployee.controller)
router.post("/updateEmployee", employee_controller.updateEmployee.controller)
router.post("/deleteEmployee", employee_controller.deleteEmployee.controller)

router.post("/signIn", employee_controller.signIn.controller)
router.post("/extSignIn", employee_controller.extSignIn.controller)
router.post("/logoutEmployee", employee_controller.logoutEmployee.controller)
router.post("/resetPasswordRequest", employee_controller.resetPasswordRequest.controller)
router.post("/resetPassword", employee_controller.resetPassword.controller)


router.get("/listEmployee", employee_controller.listEmployee.controller)
router.get("/downloadEmployee", employee_controller.downloadEmployee.controller)
router.get("/getEmployeeDetails", employee_controller.getEmployeeDetails.controller)
router.get("/getHierarchyList", employee_controller.getHierarchyList.controller)
router.get("/getReportsToHierarchy", employee_controller.getReportsToHierarchy.controller)
router.get("/searchEmployee", employee_controller.searchEmployee.controller)


module.exports = router