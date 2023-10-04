const express = require("express");
const router = express.Router();
const skill_controller = require("../controllers/skill_controller")

router.post("/createSkill", skill_controller.createSkill.controller)
router.post("/updateSkill", skill_controller.updateSkill.controller)
router.post("/deleteSkill", skill_controller.deleteSkill.controller)

router.get("/listSkills", skill_controller.listSkills.controller)
router.get("/getSkillDetails", skill_controller.getSkillDetails.controller)
router.get("/searchSkill", skill_controller.searchSkill.controller)


module.exports = router
