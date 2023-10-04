const fast_connection = require("../connections/fastconnection");

class activity_log_services {

  static async create(data) {
    try {
      const new_activity = new fast_connection.models.activity_log(data);
      return await new_activity.save();
    } catch (error) {
      throw error;
    }
  }

  static async findUserActivity(employee_id) {
    try {
      return await fast_connection.models.activity_log.findOne({employee_id:employee_id,activity:"LOGIN_LOGS",createdAt:{         
      "$gte": new Date().setHours(0,0,0,0),
      "$lt": new Date().setHours(24,0,0,0)
    }
    });
    } catch (error) {
      throw error;
    }
  }

  static async updateLogs(body) {
    try {
      return await fast_connection.models.activity_log.findOneAndUpdate({_id:body._id},body);
    } catch (error) {
      throw error;
    }
  }

  static async getLoginLogs(date) {
    try {
      return await fast_connection.models.activity_log.find({activity:"LOGIN_LOGS",createdAt:{         
        "$gte": new Date(date).setHours(0,0,0,0),
        "$lt": new Date(date).setHours(24,0,0,0)
      }})
    } catch (error) {
      throw error;
    }
  }

}

module.exports = activity_log_services;