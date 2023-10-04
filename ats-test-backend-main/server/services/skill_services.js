const fast_connection = require("../connections/fastconnection");

class skill_services {

  static async create(data) {
    try {
      const new_skill = new fast_connection.models.skill(data);
      return await new_skill.save();
    } catch (error) {
      throw error;
    }
  }

  static async updateSkill(body) {
    try {
      return await fast_connection.models.skill.findOneAndUpdate({_id:body._id},body);
    } catch (error) {
      throw error;
    }
  }

  static async deleteSkill(_id) {
    try {
        console.log(_id)
      return await fast_connection.models.skill.findOneAndUpdate({_id:_id},{is_deleted:true});
    } catch (error) {
      throw error;
    }
  }

  static async listSkills({skip,limit,sort_type,sort_field}) {
    try {
      return await fast_connection.models.skill.find({is_deleted:false}).populate([{path: 'created_by', select: '_id first_name last_name'}]).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }

 

  static async getSkillDetails(_id) {
    try {
      return await fast_connection.models.skill.findOne({is_deleted:false,_id:_id}).populate([{path: 'created_by', select: '_id first_name last_name'}]);
    } catch (error) {
      throw error;
    }
  }


  static async searchSkill(field_name,filed_value) {
    try {
      let query_obj = {is_deleted:false}
      query_obj[field_name] = filed_value
      return await fast_connection.models.skill.find(query_obj).populate([{path: 'created_by', select: '_id first_name last_name'}]);
    } catch (error) {
      throw error;
    }
  }
  

}

module.exports = skill_services;
