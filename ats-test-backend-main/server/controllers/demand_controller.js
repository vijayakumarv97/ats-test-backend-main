const demand_services = require("../services/demand_services")
const Excel =require('exceljs')
const crypto = require('crypto')
const fs = require('fs')
const {ISOdateToCustomDate } = require("../utils/ISO_date_helper")



const generateDemandId = async () => {
    const demand = await demand_services.getAllDemand();
    const lastDemandId = demand.DemandId;
    demandCounter = parseInt(lastDemandId.substr(3)) + 1;
    const paddedCounter = demandCounter.toString().padStart(4, "0");
    return `SSD${paddedCounter}`;
  };

 const createDemand = {
    controller: async (req, res) => {
      let new_obj = { ...req.body };
      new_obj["created_by"] = req.auth.user_id;
      new_obj["DemandId"] = await generateDemandId(); // add custom ID field to new object
      let new_demand = await demand_services.create(new_obj);
      let match=await demand_services.MatchProfileDemand()
      if(match.length===0) {
        res.status(200).send({new_demand, message: `Demand created successfully.`,match: false});
        // res.respond(new_demand, 200, {msg:"Demand created successfully."});
      }else{
        res.status(200).send({new_demand, message: `Demand created successfully..`,match: true});
    //   res.respond(new_demand, 200, {msg:"Demand created successfully."});
      }
    },
  };






const updateDemand = {
    controller: async (req, res) => {
        let update_obj = req.body
        if(update_obj.assigned_to){
            update_obj["total_employees_assigned"] = update_obj.assigned_to.length
        }
        update_obj["updated_by"] = req.auth.user_id;
        await demand_services.updateDemand(update_obj)
        res.respond("Demand updated successfully", 200, 'Demand updated successfully.');
    }
}

const deleteDemand = {
    controller: async (req, res) => {
        await demand_services.deleteDemand(req.body._id)
        res.respond("Demand deleted successfully", 200, 'Demand deleted successfully.');
    }
}

const listDemands = {
    controller: async (req, res) => {
        let demands = await demand_services.listDemands(req.query)
        res.respond(demands, 200, 'Demands fetched sucessfully');
    }
}

const listUserCreatedDemands = {
    controller: async (req, res) => {
        let demands = await demand_services.listUserCreatedDemands(req.auth.user_id)
        res.respond(demands, 200, 'Demands fetched sucessfully');
    }
}


const downloadDemands = {
    controller: async (req,res)=>{

        let random_prefix = crypto.randomBytes(20).toString('hex')
        let demands = await demand_services.listDemands(req.query)
        let excel_demands = demands.map(d=>{
            let transformed = {
                demand_id:d?._id,
                requirement: d?.job_title,
                received_date: ISOdateToCustomDate(d?.createdAt),
                POC: d?.poc_vendor,
                sub_vendor: d?.vendor_name,
                lead: d?.created_by?.first_name + ' ' + d?.created_by?.last_name,
                client: d?.client,
                minimum_experience_months: d?.minimum_experience,
                primary_skill: d?.skillset?.[0]?.skill,
                primary_skill_experience_months: d?.skillset?.[0]?.exp,
                secondary_skill: d?.skillset?.[1]?.skill,
                secondary_skill_experience_months: d?.skillset?.[1]?.exp,
                timestamp:ISOdateToCustomDate(d?.updatedAt)
            }
            return transformed
        })
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet("demand_list");

        worksheet.columns = [
            { header: 'demand_id', key: 'demand_id' },
            { header: 'requirement', key: 'requirement' },
            { header: 'received_date', key: 'received_date' },
            { header: 'POC', key: 'POC' },
            { header: 'sub_vendor', key: 'sub_vendor'},
            { header: 'lead', key: 'lead' },
            { header: 'client', key: 'client' },
            { header: 'minimum_experience_months', key: 'minimum_experience_months' },
            { header: 'primary_skill', key: 'primary_skill' },
            { header: 'primary_skill_experience_months', key: 'primary_skill_experience_months' },
            { header: 'secondary_skill', key: 'secondary_skill' },
            { header: 'secondary_skill_experience_months', key: 'secondary_skill_experience_months' },
            { header: 'timestamp', key: 'timestamp' }
        ]
        worksheet.addRows(excel_demands);
        await workbook.xlsx
        .writeFile(`./${random_prefix}_list.xlsx`)
        .then(function () {
            res.download(`./${random_prefix}_list.xlsx`, 'list.xlsx', function (err) {
                if (err) {
                    console.log(err)
                } else {
                    fs.unlink(`./${random_prefix}_list.xlsx`, function() {
                        console.log(`${random_prefix}_list.xlsx file deleted`)
                        });
                }
                })
        });
    }
}
    
const getDemandDetails = {
    controller: async (req, res) => {
        let demand = await demand_services.getDemandDetails(req.query.demand_id)
        res.respond(demand, 200, 'Demands fetched sucessfully');
    }
}

const searchDemand = {
    controller: async (req, res) => {
        let demand = await demand_services.searchDemand(req.query.field_name,req.query.field_value)
        res.respond(demand, 200, 'Demands fetched sucessfully');
    }
}

  const searchUserCreatedDemands = {
    controller: async (req, res) => {
        const { field_name, field_value } = req.query;
        try {
            const demands = await demand_services.searchUserCreatedDemands(req.auth.user_id, field_name, field_value);
            res.respond(demands, 200, 'Demands fetched successfully');
        } catch (error) {
            console.log(error);
            res.respond(null, 500, 'Internal server error');
        }
    }
}

const getMatchDemands= {
    controller: async (req, res) => {
        let demand = await demand_services.getMatchDemands(req.query)
        res.respond(demand, 200, 'Demands fetched sucessfully');
    }
}

module.exports = { 
    createDemand,
    updateDemand,
    deleteDemand,
    listDemands,
    getDemandDetails,
    searchDemand,
    searchUserCreatedDemands,
    downloadDemands,
    listUserCreatedDemands,
    getMatchDemands
}