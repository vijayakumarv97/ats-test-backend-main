const skill_services = require("../services/skill_services")

const createSkill = {
    controller: async (req, res) => {
        let new_obj = {...req.body}
        new_obj["created_by"] = req.auth.user_id
        let new_skill = await skill_services.create(new_obj)
        res.respond(new_skill, 200, 'Skill created successfully.');
    }
}

const updateSkill = {
    controller: async (req, res) => {
        let update_obj = req.body
        await skill_services.updateSkill(update_obj)
        res.respond("Skill updated successfully", 200, 'Skill updated successfully.');
    }
}

const deleteSkill = {
    controller: async (req, res) => {
        await skill_services.deleteSkill(req.body._id)
        res.respond("Skill deleted successfully", 200, 'Skill deleted successfully.');
    }
}

const listSkills = {
    controller: async (req, res) => {
        let skills = await skill_services.listSkills(req.query)
        res.respond(skills, 200, 'Skills fetched sucessfully');
    }
}

    
const getSkillDetails = {
    controller: async (req, res) => {
        let skill = await skill_services.getSkillDetails(req.query.skill_id)
        res.respond(skill, 200, 'Skill fetched sucessfully');
    }
}

const searchSkill = {
    controller: async (req, res) => {
        let skills = await skill_services.searchSkill(req.query.field_name,req.query.field_value)
        res.respond(skills, 200, 'Skills fetched sucessfully');
    }
}


module.exports = { 
    createSkill,
    updateSkill,
    deleteSkill,
    listSkills,
    getSkillDetails,
    searchSkill
}