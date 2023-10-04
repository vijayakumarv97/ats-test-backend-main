const fast_connection = require("../connections/fastconnection");

class submission_services {

  static async create(data) {
    try {
      const new_submission = new fast_connection.models.submission(data);
      return await new_submission.save();
    } catch (error) {
      throw error;
    }
  }

  static async getAllSubmissions() {
    try {
      return await fast_connection.models.submission.findOne().sort({ _id: -1 }).limit(1);
    } catch (error) {
      throw error;
    }
  }

 


  static async getLastSubmission() {
    try {
      return await fast_connection.models.submission.findOne({ is_deleted: false }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async updateSubmission(body) {
    try {
      return await fast_connection.models.submission.findOneAndUpdate({_id:body._id},body);
    } catch (error) {
      throw error;
    }
  }

  static async deleteSubmission(_id) {
    try {
      return await fast_connection.models.submission.findOneAndUpdate({_id:_id},{is_deleted:true});
    } catch (error) {
      throw error;
    }
  }

  static async listSubmissions({skip,limit,sort_type,sort_field}) {
    try {
      return await fast_connection.models.submission.find({is_deleted:false}).populate([{path: 'submitted_by', select: '_id first_name last_name'}, {path: 'demand'}, {path: 'candidate'}]).skip(skip).limit(limit).sort([[sort_field, sort_type]])
    } catch (error) {
      throw error;
    }
  }

  static async listUserCreatedSubmissions(user_id,start_date,end_date) {
    try {
      let query = {is_deleted:false,submitted_by:user_id}
      if(start_date && end_date){
        query["createdAt"] = {$gte:new Date(start_date),$lt:new Date(end_date)}
      }
      return await fast_connection.models.submission.find(query).populate([{path: 'submitted_by', select: '_id first_name last_name'}, {path: 'demand'}, {path: 'candidate'}])
    } catch (error) {
      throw error;
    } 
  }

  static async getSubmissionDetails(_id) {
    try {
      return await fast_connection.models.submission.findOne({is_deleted:false,_id:_id}).populate([{path: 'demand'}, {path: 'candidate'}]);
    } catch (error) {
      throw error;
    }
  }

  static async getSubmissionByDemand(demand) {
    try {
      return await fast_connection.models.submission.find({is_deleted:false,demand:demand}).populate([{path: 'submitted_by', select: '_id first_name last_name'}, {path: 'demand'}, {path: 'candidate'}]);
    } catch (error) {
      throw error;
    }
  }
 
static async searchSubmission(field_name, field_value) {
  try {
    let query_obj = { is_deleted: false };

    if (field_name === 'candidate.email') {
      const regex = new RegExp(field_value, 'i');
      const candidates = await fast_connection.models.candidate.find({ is_deleted: false, email: regex }, { _id: 1 });
      const candidateIds = candidates.map((candidate) => candidate._id);
      query_obj['candidate'] = { $in: candidateIds };
    } else if (field_name === 'demand.DemandId') {
      const regex = new RegExp(field_value, 'i');
      const demands = await fast_connection.models.demand.find({ is_deleted: false, DemandId: regex }, { _id: 1 });
      const demandIds = demands.map((demand) => demand._id);
      query_obj['demand'] = { $in: demandIds };
    } else if (field_name === 'candidate.CandidateId') {
      const regex = new RegExp(field_value, 'i');
      const candidates = await fast_connection.models.candidate.find({ is_deleted: false, CandidateId: regex }, { _id: 1 });
      const candidateIds = candidates.map((candidate) => candidate._id);
      query_obj['candidate'] = { $in: candidateIds };
    } else if (field_name === 'candidate.skillset') {
      const regex = new RegExp(field_value, 'i');
      const candidates = await fast_connection.models.candidate.find({ is_deleted: false }, { _id: 1, skillset: 1 });
      const filteredCandidateIds = candidates.filter((candidate) => candidate.skillset && candidate.skillset.some((skill) => skill.skill.match(regex))).map((candidate) => candidate._id);
      query_obj['candidate'] = { $in: filteredCandidateIds };
    } else {
      const regex = new RegExp(field_value, 'i');
      query_obj[field_name] = regex;
    }

    const submissions = await fast_connection.models.submission.find(query_obj).populate([
      { path: 'submitted_by', select: '_id first_name last_name' },
      { path: 'demand' },
      { path: 'candidate' },
    ]);

    return submissions;
  } catch (error) {
    throw error;
  }
}

static async searchMySubmission(user_id, field_name, field_value) {
  try {
    const regex = new RegExp(field_value, 'i');
    let query_obj = { is_deleted: false, submitted_by: user_id };

    if (field_name === 'candidate.email') {
      const candidate = await fast_connection.models.candidate.find({ is_deleted: false, email: regex }, { _id: 1 });
      if (candidate.length > 0) {
        const candidateIds = candidate.map((c) => c._id);
        query_obj['candidate'] = { $in: candidateIds };
      } else {
        return [];
      }
    } else if (field_name === 'demand.DemandId') {
      const demand = await fast_connection.models.demand.find({ is_deleted: false, DemandId: regex }, { _id: 1 });
      if (demand.length > 0) {
        const demandIds = demand.map((d) => d._id);
        query_obj['demand'] = { $in: demandIds };
      } else {
        return [];
      }
    } else if (field_name === 'candidate.CandidateId') {
      const candidate = await fast_connection.models.candidate.find({ is_deleted: false, CandidateId: regex }, { _id: 1 });
      if (candidate.length > 0) {
        const candidateIds = candidate.map((c) => c._id);
        query_obj['candidate'] = { $in: candidateIds };
      } else {
        return [];
      }
    } else if (field_name === 'candidate.skillset') {
      const candidates = await fast_connection.models.candidate.find({ is_deleted: false }, { _id: 1, skillset: 1 });
      const filteredCandidateIds = candidates.filter((candidate) => candidate.skillset && candidate.skillset.some((skill) => skill.skill.match(regex))).map((candidate) => candidate._id);
      query_obj['candidate'] = { $in: filteredCandidateIds };
    } else {
      query_obj[field_name] = regex;
    }
    const submissions = await fast_connection.models.submission.find(query_obj).populate([
      { path: 'submitted_by', select: '_id first_name last_name' },
      { path: 'demand' },
      { path: 'candidate' },
    ]);
    return submissions;
  } catch (error) {
    throw error;
  }
}
 

}

module.exports = submission_services;
