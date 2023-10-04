const demand_services = require("../services/demand_services")
const submission_tracker_services = require("../services/submission_tracker_services")
const submission_services = require("../services/submission_services")
const employee_services = require("../services/employee_services")

const getDashboardAggregateData = {
    controller: async (req, res) => {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let demand_data = await demand_services.listUserCreatedDemands(req.auth.user_id, start_date, end_date)
        let submissions_data = await submission_tracker_services.getSubmissionTrackersCreatedByUser(req.auth.user_id, start_date, end_date)
        let active_demands_count = demand_data.filter(i => i.status === "Open").length
        let total_demands = demand_data.length
        let interview_arr = ["initial_screening", "level_1", "level_2", "level_3"]
        let submissions_details = submissions_data.reduce((acc, curr) => {
            if (interview_arr.includes(curr.status)) {
                acc.interview++
            } else if (curr.status == "joined") {
                acc.joined++
            } else if (curr.status == "offered") {
                acc.offered++
            }
            if (curr.status == "level_1") {
                acc.l1++
            } else if (curr.status == "level_2") {
                acc.l2++
            } else if (curr.status == "level_3") {
                acc.l3++
            }
            acc.submissions++
            return acc
        }, { interview: 0, offered: 0, joined: 0, submissions: 0, l1: 0, l2: 0, l3: 0 })
        res.respond({ active_demands_count, total_demands, submissions_details }, 200, 'Aggregate Data fetched sucessfully');
    }
}

const getHierarchyDemandData = {
    controller: async (req, res) => {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let demand_data = await demand_services.listUserCreatedDemands(req.query.user_id, start_date, end_date)
        let subbordinates = await employee_services.getByReportsto(req.query.user_id)
        let current_user = await employee_services.getById(req.query.user_id)
        let active_demands_count = demand_data.filter(i => i.status === "Open").length
        let total_demands = demand_data.length
        console.log(active_demands_count, total_demands, "das")
        res.respond({ active_demands_count, total_demands, subbordinates, current_user }, 200, 'Hierarchy Demand Data fetched sucessfully');
    }
}

const getHierarchySubmissionData = {
    controller: async (req, res) => {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let submissions_data = await submission_tracker_services.getSubmissionTrackersCreatedByUser(req.query.user_id, start_date, end_date)
        let subbordinates = await employee_services.getByReportsto(req.query.user_id)
        let current_user = await employee_services.getById(req.query.user_id)
        let total_submissions = submissions_data.length
        res.respond({ total_submissions, subbordinates, current_user }, 200, 'Hierarchy Submission Data fetched sucessfully');
    }
}

const getHierarchyInterviewData = {
    controller: async (req, res) => {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let submissions_data = await submission_tracker_services.getSubmissionTrackersCreatedByUser(req.query.user_id, start_date, end_date)
        let interview_arr = ["initial_screening", "level_1", "level_2", "level_3"]
        let interview_details = submissions_data.filter(i => interview_arr.includes(i.status)).reduce((acc, curr) => {
            if (curr.status == "level_1") {
                acc.l1++
            } else if (curr.status == "level_2") {
                acc.l2++
            } else if (curr.status == "level_3") {
                acc.l3++
            }
            acc.interview++
            return acc
        }, { interview: 0, l1: 0, l2: 0, l3: 0 })
        res.respond({ interview_details }, 200, 'Hierarchy Interview Data fetched sucessfully');
    }
}

const listUserLevelDemands = {
    controller: async (req, res) => {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let demands = await demand_services.listUserCreatedDemands(req.query.user_id, start_date, end_date)
        res.respond(demands, 200, 'Demands fetched sucessfully');
    }
}

const listUserLevelActiveDemands = {
    controller: async (req, res) => {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let demands = await demand_services.listUserCreatedActiveDemands(req.query.user_id, start_date, end_date)
        res.respond(demands, 200, 'Demands fetched sucessfully');
    }
}

const listUserLevelSubmissions = {
    controller: async (req, res) => {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let submissions = await submission_services.listUserCreatedSubmissions(req.query.user_id, start_date, end_date)
        res.respond(submissions, 200, 'Submissionss fetched sucessfully');
    }
}


module.exports = {
    getDashboardAggregateData,
    getHierarchyDemandData,
    getHierarchySubmissionData,
    getHierarchyInterviewData,
    listUserLevelDemands,
    listUserLevelActiveDemands,
    listUserLevelSubmissions
}