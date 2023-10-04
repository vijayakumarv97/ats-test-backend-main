const fast_connection = require("../connections/fastconnection");

class client_services {

  static async create(data) {
    try {
      const new_client = new fast_connection.models.client(data);
      return await new_client.save();
    } catch (error) {
      throw error;
    }
  }

  static async getAllClient() {
    try {
      return await fast_connection.models.client.findOne().sort({ _id: -1 }).limit(1);
    } catch (error) {
      throw error;
    }
  }

  static async getLastClient() {
    try {
      return await fast_connection.models.candidate.findOne({ is_deleted: false }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async updateClient(body) {
    try {
      return await fast_connection.models.client.findOneAndUpdate({ _id: body._id }, body);
    } catch (error) {
      throw error;
    }
  }

  static async deleteClient(_id) {
    try {
      return await fast_connection.models.client.findOneAndUpdate({ _id: _id }, { is_deleted: true });
    } catch (error) {
      throw error;
    }
  }

  static async listClients({ skip, limit, sort_type, sort_field }) {
    try {
      return await fast_connection.models.client.find({ is_deleted: false }).populate([{ path: 'created_by', select: '_id first_name last_name' }]).skip(skip).limit(limit).sort([[sort_field, sort_type]]).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }

  static async listBDEClients(user_id, start_date, end_date, skip, limit, sort_field, sort_type) {
    try {
      let query = { is_deleted: false, created_by: user_id };
      if (start_date && end_date) {
        query["createdAt"] = { $gte: new Date(start_date), $lt: new Date(end_date) };
      }
      return await fast_connection.models.client.find(query)
        .populate([{ path: 'created_by', select: '_id first_name last_name' }])
        .skip(skip)
        .limit(limit)
        .sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }

  static async listUserEmpanelment(user_id, start_date, end_date, skip, limit, sort_field, sort_type) {
    try {
      let query = { is_deleted: false, created_by: user_id, empanelment: { $exists: true, $ne: "" } };
      if (start_date && end_date) {
        query["createdAt"] = { $gte: new Date(start_date), $lt: new Date(end_date) };
      }
      return await fast_connection.models.client.find(query)
        .populate([{ path: 'created_by', select: '_id first_name last_name' }])
        .skip(skip)
        .limit(limit)
        .sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }


  static async listUserExpansion(user_id, start_date, end_date, skip, limit, sort_field, sort_type, expansion) {
    try {
      let query = { is_deleted: false, created_by: user_id, expansion: { $exists: true, $ne: "" } };
      if (start_date && end_date) {
        query["createdAt"] = { $gte: new Date(start_date), $lt: new Date(end_date) };
      }
      return await fast_connection.models.client.find(query)
        .populate([{ path: 'created_by', select: '_id first_name last_name' }])
        .skip(skip)
        .limit(limit)
        .sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }



  static async getClientDetails(_id) {
    try {
      return await fast_connection.models.client.findOne({ is_deleted: false, _id: _id }).populate([{ path: 'created_by', select: '_id first_name last_name' }]);
    } catch (error) {
      throw error;
    }
  }

  static async searchClient(field_name, filed_value) {
    try {
      let query_obj = { is_deleted: false }
      const regex = new RegExp(filed_value, 'i');
      query_obj[field_name] = regex;
      return await fast_connection.models.client.find(query_obj).populate([{ path: 'created_by', select: '_id first_name last_name' }]);
    } catch (error) {
      throw error;
    }
  }

  static async getClientName() {
    try {
      const queryObj = { is_deleted: false };
      const clients = await fast_connection.models.client.find(queryObj);
      const companyNames = clients.map(client => client.company_name);
      console.log(companyNames, "comapn")
      return companyNames;
    } catch (error) {
      console.error(error);
      throw new Error('Error retrieving company names');
    }
  }

  static async getCompanyTemplate(companyName) {
    try {
      const queryObj = { is_deleted: false, company_name: companyName };
      const client = await fast_connection.models.client.findOne(queryObj);
      return client.template;
    } catch (error) {
      console.error(error);
      throw new Error('Error retrieving company template');
    }
  }


  static async getSubmissionDetails(_id) {
    try {
      return await fast_connection.models.submission.findOne({ is_deleted: false, _id: _id }).populate([{ path: 'demand' }, { path: 'candidate' }, { path: 'submitted_by', select: '_id first_name last_name' }]);
    } catch (error) {
      throw error;
    }
  }


}

module.exports = client_services;