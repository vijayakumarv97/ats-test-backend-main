const vendor_services = require("../services/vendor_services")




const createVendor = {
    controller: async (req, res) => {
        let new_obj = {...req.body}
        new_obj["created_by"] = req.auth.user_id
        let new_vendor = await vendor_services.create(new_obj)
        res.respond(new_vendor, 200, 'Vendor created successfully.');
    }
}


const updateVendor = {
    controller: async (req, res) => {
        let update_obj = req.body
        await vendor_services.updateVendor(update_obj)
        res.respond("Vendor updated successfully", 200, 'Vendor updated successfully.')
    }
}

const deleteVendor = {
    controller: async (req, res) => {
        await vendor_services.deleteVendor(req.body._id)
        res.respond("Vendor deleted successfully", 200, 'Vendor deleted successfully.');
    }
}

const listVendors = {
    controller: async (req, res) => {
        let vendors = await vendor_services.listVendors(req.query)
        res.respond(vendors, 200, 'Vendors fetched sucessfully');
    }
}

    
const getVendorDetails = {
    controller: async (req, res) => {
        let vendor = await vendor_services.getVendorDetails(req.query.vendor_id)
        res.respond(vendor, 200, 'Vendor fetched sucessfully');
    }
}

const searchVendors = {
    controller: async (req, res) => {
        let vendors = await vendor_services.searchVendors(req.query.field_name,req.query.field_value)
        res.respond(vendors, 200, 'vendors fetched sucessfully');
    }
}


module.exports = { 
    createVendor,
    updateVendor,
    deleteVendor,
    listVendors,
    getVendorDetails,
    searchVendors
}