const crm_services = require("../services/crm_services");


const createPipeline = {
    controller: async (req, res, next) => {
        try {
            await crm_services.initializeCounter();
            await crm_services.addNew(req, res, next);
        } catch (error) {
            next(error);
        }
    }
};
const getClientDetails = {
    controller: async (req, res) => {
        let client = await crm_services.getAllClient();
        res.respond(client, 200, 'Client fetched sucessfully');

    }
};

const getClientDataById = {
    controller: async (req, res) => {
        const { _id } = req.params;
        let databyid = await crm_services.getClientById(_id);
        res.respond(databyid, 200, 'client fetched successfully');

    }
}

const updateClientData = {
    controller: async (req, res) => {
        const { _id } = req.params;
        const newData = req.body;
        console.log('ID:', _id);
        console.log('New Data:', newData);
        let updatedata = await crm_services.updateData(_id,
            newData,
            { new: true });
        res.respond(updatedata, 200, 'client updated Succesfully')

    }
}

const deleteClientData = {
    controller: async (req, res) => {
        const { _id } = req.params;
        await crm_services.deleteData(_id);
        res.respond("Demand deleted successfully", 200, 'Demand deleted successfully.');
    },
};

module.exports = {
    getClientDetails,
    createPipeline,
    getClientDataById,
    updateClientData,
    deleteClientData

};
