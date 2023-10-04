const fast_connection = require("../connections/fastconnection");


class leadTargetServices {
  static async leadFetch({ employee_id }) {
    try {
      if (employee_id === "6414487f47038cf77ecc7c46") {
        const targetEmployeeId = ["641451d847038cf77ecc7cf7", employee_id];
        const employeeData = await fast_connection.models.employee.find({
          $or: [{ _id: targetEmployeeId }, { reports_to: targetEmployeeId }]
        });
        return employeeData;
      }
      else {
        return await fast_connection.models.employee.find({ reports_to: employee_id });
      }
    } catch (error) {
      throw error;
    }
  }

  static async target_leads(data) {
    try {
      const leadsAssign = await fast_connection.models.addTarget.insertMany(data);
      return leadsAssign;
    } catch (error) {
      throw error;
    }

  }

  static async getLeadData({ assignedToId }) {
    try {
      const getLeadDatas = await fast_connection.models.addTarget.find({ assigned_to: assignedToId });
      return getLeadDatas
    } catch (error) {
      throw error
    }
  }
}

module.exports = leadTargetServices;