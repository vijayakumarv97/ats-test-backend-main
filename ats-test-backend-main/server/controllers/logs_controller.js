const activity_logs_services = require("../services/activity_logs_services")

const getLoginLogs = {
    controller: async (req, res) => {
        let logs = await activity_logs_services.getLoginLogs(req.query.date)
        res.respond(logs, 200, 'Logs fetched sucessfully');
    }
}

module.exports = { 
    getLoginLogs
}