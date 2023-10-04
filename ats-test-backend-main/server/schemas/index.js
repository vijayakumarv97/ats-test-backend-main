const employee_schema = require("./employee_schema")
const demand_schema = require("./demand_schema")
const candidate_schema = require("./candidate_schema")
const submission_schema = require("./submission_schema")
const submission_tracker_schema = require("./submission_tracker_schema")
const client_schema = require("./client_schema")
const activity_logs_schema = require("./activity_logs_schema")
const skill_schema = require("./skill_schema")
const vendor_schema = require("./vendor_schema")
const crm_schema = require("./crm_schema")
const counter_schema = require("./counter_schema")
const target_schema = require("./employee_target_schema")

module.exports = (db) => {

    db.model("employee", employee_schema);
    db.model("demand", demand_schema);
    db.model("candidate", candidate_schema);
    db.model("submission", submission_schema);
    db.model("submission_tracker", submission_tracker_schema);
    db.model("client", client_schema);
    db.model("activity_log", activity_logs_schema);
    db.model("skill", skill_schema);
    db.model("vendor", vendor_schema);
    db.model("salespipelinesheet", crm_schema);
    db.model("counter", counter_schema);
    db.model("addTarget",target_schema);

    return db;

}