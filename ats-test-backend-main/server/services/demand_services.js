const fast_connection = require("../connections/fastconnection");

class demand_services {

  static async create(data) {
    try {
      const new_demand = new fast_connection.models.demand(data);
      return await new_demand.save();
    } catch (error) {
      throw error;
    }
  }

  static async getAllDemand() {
    try {
      return await fast_connection.models.demand.findOne().sort({ _id: -1 }).limit(1);
    } catch (error) {
      throw error;
    }
  }



  //get last demandid
  static async getLastDemand() {
    try {
      return await fast_connection.models.demand.findOne({ is_deleted: false }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }





  static async updateDemand(body) {
    try {
      return await fast_connection.models.demand.findOneAndUpdate({ _id: body._id }, body);
    } catch (error) {
      throw error;
    }
  }

  static async deleteDemand(_id) {
    try {
      return await fast_connection.models.demand.findOneAndUpdate({ _id: _id }, { is_deleted: true });
    } catch (error) {
      throw error;
    }
  }

  static async listDemands({ skip, limit, sort_type, sort_field }) {
    try {
      return await fast_connection.models.demand.find({ is_deleted: false }).populate([{ path: 'created_by', select: '_id first_name last_name' }]).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }
  static async listUserCreatedDemands(user_id, start_date, end_date) {
    try {
      let query = { is_deleted: false, $or: [{ created_by: user_id }, { assigned_to: { "$in": [user_id] } }] }
      if (start_date && end_date) {
        query["createdAt"] = { $gte: new Date(start_date), $lt: new Date(end_date) }
      }
      return await fast_connection.models.demand.find(query).populate([{ path: 'created_by', select: '_id first_name last_name' }]);
    } catch (error) {
      throw error;
    }
  }
  static async listUserCreatedbyDemands(user_ids, start_date, end_date) {
    try {
      let query = {
        is_deleted: false,
        $or: [
          { created_by: { $in: user_ids } },

        ]
      };
      if (start_date && end_date) {
        query["createdAt"] = { $gte: new Date(start_date), $lt: new Date(end_date) };
      }

      return await fast_connection.models.demand.find(query).populate([{ path: 'created_by', select: '_id first_name last_name' }]);

    } catch (error) {
      throw error;
    }
  }

  static async listUserCreatedActiveDemands(user_id) {
    try {
      return await fast_connection.models.demand.find({ is_deleted: false, status: "Open", $or: [{ created_by: user_id }, { assigned_to: { "$in": [user_id] } }] }).populate([{ path: 'created_by', select: '_id first_name last_name' }]);
    } catch (error) {
      throw error;
    }
  }

  static async listUserAssignedDemands(user_id) {
    try {
      return await fast_connection.models.demand.find({ assigned_to: { "$in": [user_id] } }).populate("assigned_to");
    } catch (error) {
      throw error;
    }
  }

  static async getDemandDetails(_id) {
    try {
      return await fast_connection.models.demand.findOne({ is_deleted: false, _id: _id }).populate([{ path: 'assigned_to', select: '_id first_name last_name email mobile_number role job_role employee_id' }, { path: 'created_by', select: '_id first_name last_name' }]);
    } catch (error) {
      throw error;
    }
  }


  static async searchDemand(field_name, filed_value) {
    try {
      let query_obj = { is_deleted: false }
      const regex = new RegExp(filed_value, 'i');
      query_obj[field_name] = regex;
      if (field_name === 'skillset') {
        const demand_skill = await fast_connection.models.demand.find({ is_deleted: false });
        const filteredDemands = demand_skill.filter(demand => {
          return demand.skillset.some(skill => skill.skill.match(regex));
        });
        return filteredDemands;
      } else {
        return await fast_connection.models.demand.find(query_obj).populate([{ path: 'assigned_to', select: '_id first_name last_name' }, { path: 'created_by', select: '_id first_name last_name' }]);
      }
    } catch (error) {
      throw error;
    }
  }


  static async searchUserCreatedDemands(user_id, field_name, filed_value) {
    try {
      const regex = new RegExp(filed_value, 'i');
      const query_obj = { is_deleted: false, $or: [{ created_by: user_id }, { assigned_to: { "$in": [user_id] } }], [field_name]: regex, };
      if (field_name === 'skillset') {
        const demand_skill = await fast_connection.models.demand.find({ is_deleted: false, $or: [{ created_by: user_id }, { assigned_to: { "$in": [user_id] } }], regex, });
        const filteredDemands = demand_skill.filter(demand => {
          return demand.skillset.some(skill => skill.skill.match(regex));
        });
        return filteredDemands;
      } else {
        return await fast_connection.models.demand.find(query_obj).populate("created_by", "_id first_name last_name");
      }
    } catch (error) {
      throw error;
    }
  }


  static async MatchProfileDemand() {
    try {
      const latestDemand = await fast_connection.models.demand.find().sort({ _id: -1 }).limit(1).select('skillset.skill');
      if (latestDemand.length === 0) {
        return;
      } else {
        const latestSkill = latestDemand[0].skillset.map(skillObj => skillObj.skill);
        const regexSkills = latestSkill.map(skill => new RegExp(skill, "i"))
        const matchingCandidates = await fast_connection.models.candidate
          .find({ skillset: { $elemMatch: { skill: { $in: regexSkills } } } }).populate("created_by", { _id: 1, first_name: 1, last_name: 1 })
        return matchingCandidates
      }
    } catch (error) {
      throw error;
    }
  }

  static async getMatchDemands({ skip, limit, sort_type, sort_field }) {
    try {
      const latestDemand = await fast_connection.models.demand.find().sort({ _id: -1 }).limit(1).select('skillset.skill');
      if (latestDemand.length === 0) {
        return;
      } else {
        const latestSkill = latestDemand[0].skillset.map(skillObj => skillObj.skill);
        const regexSkills = latestSkill.map(skill => new RegExp(skill, "i"))
        const matchingCandidates = await fast_connection.models.candidate
          .find({ skillset: { $elemMatch: { skill: { $in: regexSkills } } } }).populate("created_by", { _id: 1, first_name: 1, last_name: 1 }).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
        return matchingCandidates
      }
    } catch (error) {
      throw error;
    }
  }


}


module.exports = demand_services;
