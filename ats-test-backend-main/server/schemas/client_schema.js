const mongoose = require("mongoose");
const Schema = mongoose.Schema

const client_schema = new Schema({
    ClientId:{type:String,unique:true},
    basic_details: [{ type: Object }],
    client_details:[{type: Object}],
    company_name:{type: String},
    expansion:{type: String},
    empanelment:{type: String},
    passthrough_company_name:{type: String},
    source_person_designation:{type: String},
    source_person_name:{type: String},
    empanelment:{type:String},
    expansion:{type:String},
    documents:[{type:Object}],
    status:{type: Boolean, default:false},
    created_by:{type: Schema.Types.ObjectId, ref: 'employee'},
    template:[{type:Object}],
    is_deleted: { type: Boolean, default: false }
},
{
    timestamps: true
});

module.exports = client_schema;
