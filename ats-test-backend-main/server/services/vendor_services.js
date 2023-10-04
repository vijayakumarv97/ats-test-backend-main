const fast_connection = require("../connections/fastconnection");

class vendor_services {

  static async create(data) {
    try {
      const new_vendor = new fast_connection.models.vendor(data);
      return await new_vendor.save();
    } catch (error) {
      throw error;
    }
  }

  static async updateVendor(body) {
    try {
      return await fast_connection.models.vendor.findOneAndUpdate({_id:body._id},body);
    } catch (error) {
      throw error;
    }
  }

  static async deleteVendor(_id) {
    try {
      return await fast_connection.models.vendor.findOneAndUpdate({_id:_id},{is_deleted:true});
    } catch (error) {
      throw error;
    }
  }

  static async listVendors({skip,limit,sort_type,sort_field}) {
    try {
      return await fast_connection.models.vendor.find({is_deleted:false}).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }

 

  static async getVendorDetails(_id) {
    try {
      return await fast_connection.models.vendor.findOne({is_deleted:false,_id:_id});
    } catch (error) {
      throw error;
    }
  }


  static async searchVendors(field_name,filed_value) {
    try {
      let query_obj = {is_deleted:false}
      query_obj[field_name] = filed_value
      return await fast_connection.models.vendor.find(query_obj);
    } catch (error) {
      throw error;
    }
  }
  

}

module.exports = vendor_services;
