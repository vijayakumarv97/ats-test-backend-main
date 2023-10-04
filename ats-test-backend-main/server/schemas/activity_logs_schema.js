const mongoose = require("mongoose");
const Schema = mongoose.Schema

const activity_logs_schema = new Schema({
    employee_id:{type: Schema.Types.ObjectId, ref: 'employee'},
    email:{type: String},
    name:{type: String},
    login_time:{ type: Date},
    logoff_time:{type: Date},
    activity:{ type: String },
    is_deleted: { type: Boolean, default: false }
},
{
    timestamps: true
});

module.exports = activity_logs_schema;

