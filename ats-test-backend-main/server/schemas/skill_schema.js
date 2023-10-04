const mongoose = require("mongoose");
const Schema = mongoose.Schema

const skill_schema = new Schema({
    skill_name:{type: String},
    skill_category:{type: String},
    created_by:{type: Schema.Types.ObjectId, ref: 'employee'},
    is_deleted: { type: Boolean, default: false }
},
{
    timestamps: true
});

module.exports = skill_schema;

