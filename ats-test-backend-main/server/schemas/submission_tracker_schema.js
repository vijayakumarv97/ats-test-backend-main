const mongoose = require("mongoose");
const Schema = mongoose.Schema

const submission_tracker_schema = new Schema({
    submission_id: { type: Schema.Types.ObjectId, ref: 'submission' },
    demand_id: { type: Schema.Types.ObjectId, ref: 'demand' },
    candidate_id: { type: Schema.Types.ObjectId, ref: 'candidate' },
    status: { type: String, default: "initial_screening_select" },
    failed: { type: Boolean, default: false },
    remarks: [{ type: Object }],
    is_deleted: { type: Boolean, default: false },
    SubmissionId: { type: String, unique: true },
    submitted_by: { type: Schema.Types.ObjectId, ref: 'employee' },
    offeredCtc: { type: String},
    billingRate: { type: String },
    join_date: { type: String },
    work_mode: { type: String},
    fee:{type:String},
    file_reports:[{type:Object}]
},
    {
        timestamps: true
    });

module.exports = submission_tracker_schema;

