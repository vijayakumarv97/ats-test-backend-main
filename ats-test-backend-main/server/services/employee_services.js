const fast_connection = require("../connections/fastconnection");

class user_services {

  static async create(data) {
    try {
      const new_employee = new fast_connection.models.employee(data);
      return await new_employee.save();
    } catch (error) {
      throw error;
    }
  }

  static async getByEmployeeId(employee_id) {
    try {
      return await fast_connection.models.employee.findOne({ employee_id: employee_id });
    } catch (error) {
      throw error;
    }
  }

  static async getAllEmployee() {
    try {
      return await fast_connection.models.employee.findOne().sort({ _id: -1 }).limit(1);
    } catch (error) {
      throw error;
    }
  }
  

  static async getLastEmployee() {
    try {
      return await fast_connection.models.employee.findOne({ is_deleted: false }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      return await fast_connection.models.employee.findOne({email:email});
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      return await fast_connection.models.employee.findOne({_id:id}).populate({path:"reports_to",select:["_id","first_name","last_name"]});
    } catch (error) {
      throw error;
    }
  }

  static async getByType(role) {
    try {
      return await fast_connection.models.employee.find({role,is_deleted:false}).select(["_id","first_name","last_name","email","mobile_number","role","job_role","employee_id"]);
    } catch (error) {
      throw error;
    }
  }

  static async listEmployees({skip,limit,sort_type,sort_field}) {
 
    try {
      if(sort_field==='first_name'){
        return await fast_connection.models.employee.find({is_deleted:false}).skip(skip).limit(limit).sort({ [sort_field]: sort_type }).collation({ locale: 'en_US', strength: 2 })
        .lean()
        .then(docs => {
          return docs.map(doc => {
            const firstChar = doc[sort_field].charAt(0).toUpperCase();
            const restChars = doc[sort_field].slice(1);
            doc[sort_field] = firstChar + restChars;
            return doc;
          });
        });

      }
      return await fast_connection.models.employee.find({is_deleted:false}).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }

  static async updateEmployee(body) {
    try {
      return await fast_connection.models.employee.findOneAndUpdate({_id:body._id},body);
    } catch (error) {
      throw error;
    }
  }

  static async getByReportsto(reports_to) {
    try {
      return await fast_connection.models.employee.find({reports_to,is_deleted:false}).select(["_id","first_name","last_name","role"]);
    } catch (error) {
      throw error;
    }
  }


  static async deleteEmployee(employee_id) {
    try {
      return await fast_connection.models.employee.findOneAndUpdate({_id:employee_id},{is_deleted:true});
    } catch (error) {
      throw error;
    }
  }

  static async searchEmployee(field_name, field_value) {
    try {
      let query_obj = { is_deleted: false };
      const regex = new RegExp(field_value, 'i'); 
      query_obj[field_name] = regex;
      return await fast_connection.models.employee.find(query_obj);
      } catch (error) {
      throw error;
    }
  }
 
}

module.exports = user_services;
