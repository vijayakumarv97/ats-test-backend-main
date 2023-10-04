const mongoose = require("mongoose");
const Schema = mongoose.Schema

const counter_schema = new Schema({
    _id: { type: String, required: true },
    sequenceValue: { type: Number, default: 10080 },
},

)
module.exports = counter_schema
