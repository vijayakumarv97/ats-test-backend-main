const mongoose = require("mongoose");
const Schema = mongoose.Schema

const user_schema = new Schema({
    employee_id:{type:String,unique:true},
    first_name: { type: String, trim: true },
    last_name: { type: String, trim: true },
    email:{ type: String },
    mobile_number:{ type: String },
    date_of_hire:{ type: String },
    date_of_joining:{ type: String },
    date_of_birth: { type: String },
    marital_Status: { type: String },
    gender:{ type: String },
    address_line_1:{ type: String },
    address_line_2:{ type: String },
    city:{ type: String },
    pincode:{ type: String },
    pan_number:{ type: String },
    aadhaar_number:{ type: String },
    password_hash:{ type: String },
    role:{ type: String },
    reports_to:{type: Schema.Types.ObjectId, ref: 'employee'},
    status:{ type: String },
    job_role:{ type: String },
    location:{ type: String },
    is_deleted: { type: Boolean, default: false },
    demand_creator: { type: Boolean},
    created_by: {type: Schema.Types.ObjectId, ref: 'employee'},
    updated_by: {type: Schema.Types.ObjectId, ref: 'employee'}
},
{
    timestamps: true
});

module.exports = user_schema