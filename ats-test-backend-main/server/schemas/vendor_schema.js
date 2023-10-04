const mongoose = require("mongoose");
const Schema = mongoose.Schema

const vendor_schema = new Schema({
    company_name:{type: String},
    skill_name:{type: String},
    region:{type: String},
    head_count:{type: Number},
    location:{type: String},
    people:[{type:Object}],
    created_by:{type: Schema.Types.ObjectId, ref: 'employee'},
    is_deleted: { type: Boolean, default: false }
},
{
    timestamps: true
});

module.exports = vendor_schema;

