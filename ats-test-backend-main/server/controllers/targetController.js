const leadTargetServices = require("../services/leadTarget_services")

const amReports = {
    controller: async (req, res) => {
        let leadFinds = await leadTargetServices.leadFetch(req.query)
        res.respond(leadFinds, 200, 'Lead fetched sucessfully');
    }
}

const createTarget = {
    controller: async (req, res) => {
        let new_obj = req.body;
        let targetAssign = await leadTargetServices.target_leads(new_obj)
        res.respond(targetAssign, 200, "Target Assigned Successfully")
    }
}

const getTargetData = {
    controller: async (req, res) => {

        let target_Data = await leadTargetServices.getLeadData(req.query)
        res.respond(target_Data, 200, "Target Fetched Successfully")
    }
}
module.exports = {
    amReports,
    createTarget,
    getTargetData
}