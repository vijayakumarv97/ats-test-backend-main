const fast_connection = require("../connections/fastconnection");

class submission_tracker_services {

  static async create(data) {
    try {
      const new_submission_tracker = new fast_connection.models.submission_tracker(data);
      return await new_submission_tracker.save();
    } catch (error) {
      throw error;
    }
  }

  static async updateSubmissionTracker(body) {
    try {
      return await fast_connection.models.submission_tracker.findOneAndUpdate({_id:body._id},body);
    } catch (error) {
      throw error;
    }
  }

  static async getSubmissionTrackerDetails(submission_id) {
    try {
      return await fast_connection.models.submission_tracker.findOne({is_deleted:false,submission_id:submission_id}).populate([{path: 'demand_id'}, {path: 'candidate_id'}]);
    } catch (error) {
      throw error;
    }
  }

  static async getSubmissionTrackersCreatedByUser(user_id, start_date, end_date) {
    try {
      let query = {submitted_by:user_id}
      if(start_date && end_date){
        query["createdAt"] = {$gte:new Date(start_date),$lt:new Date(end_date)}
      }
      return await fast_connection.models.submission_tracker.find(query).populate("submitted_by")
    } catch (error) {
      throw error;
    }
  }

  static async download(submission_id) {
    try {
      return await fast_connection.models.submission_tracker.findOne({ is_deleted: false, submission_id: submission_id }).populate([{ path: 'demand_id' }, { path: 'candidate_id' }]);
    } catch (error) {
      throw error;
    }
  }
   
}

module.exports = submission_tracker_services;
