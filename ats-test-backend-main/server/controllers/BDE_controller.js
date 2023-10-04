const client_services = require("../services/client_services")
const demand_services = require("../services/demand_services")
const employee_services = require("../services/employee_services")
const Excel = require('exceljs');
const crypto = require('crypto');
const fs = require('fs');
const { ISOdateToCustomDate } = require("../utils/ISO_date_helper")
const Promise = require('bluebird');
const mongoose = require('mongoose');
const fast_connection = require("../connections/fastconnection");

const aggregate_BDE_data = {
  controller: async (req, res) => {
    try {
      const { start_date, end_date } = req.query;
      const current_user_id = req.auth.user_id;
      const [demand_data, client_data] = await Promise.all([
        demand_services.listUserCreatedbyDemands(current_user_id),
        client_services.listBDEClients(current_user_id),
        employee_services.getByReportsto(current_user_id),
      ]);


      const pipeline = [
        { $match: { _id: mongoose.Types.ObjectId(current_user_id), is_deleted: false, status: 'Active' } },
        {
          $graphLookup: {
            from: 'employees',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'reports_to',
            as: 'subordinates',
            maxDepth: 10,
            restrictSearchWithMatch: { is_deleted: false, status: 'Active' },
          },
        },
        {
          $facet: {
            demand_results: [
              {
                $lookup: {
                  from: 'demands',
                  let: { subordinateIds: '$subordinates._id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $in: ['$created_by', '$$subordinateIds'] },
                            { $eq: ['$is_deleted', false] },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'subordinate_demands',
                },
              },
              { $unwind: { path: '$subordinate_demands', preserveNullAndEmptyArrays: true } },
              {
                $group: {
                  _id: '$_id',
                  subordinates: { $first: '$subordinates' },
                  subordinate_demands: { $push: '$subordinate_demands' },
                },
              },
            ],
            client_results: [
              {
                $lookup: {
                  from: 'clients',
                  let: { subordinateIds: '$subordinates._id' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $in: ['$created_by', '$$subordinateIds'] },
                            { $eq: ['$is_deleted', false] },
                          ],
                        },
                      },
                    },
                  ],
                  as: 'subordinate_clients',
                },
              },
              { $unwind: { path: '$subordinate_clients', preserveNullAndEmptyArrays: true } },
              {
                $group: {
                  _id: '$_id',
                  subordinates: { $first: '$subordinates' },
                  subbordinate_clients: { $push: '$subordinate_clients' },
                },
              },
            ],
          },
        },
      ];


      const results = await fast_connection.models.employee.aggregate(pipeline);


      if (!results || results.length === 0) {
        return res.status(404).send({ error: 'No data found' });
      }

      const demand_results = results[0].demand_results;
      const client_results = results[0].client_results;
      const sub_demand = demand_results[0].subordinate_demands;
      const sub_client = client_results[0].subbordinate_clients;
      const add_total_demand = [...sub_demand, ...demand_data]
      const add_total_clients = [...sub_client, ...client_data]

      // Calculate the current date and the week range
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - (dayOfWeek + 7) % 7);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Calculate the month range
      function getLastDayOfMonth(year, month) {
        return new Date(year, month + 1, 0);
      }

      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const startOfMonth = new Date(currentYear, currentMonth, 1);
      const endOfMonth = getLastDayOfMonth(currentYear, currentMonth);

      const isWithinDateRange = (date, start_date, end_date) => date >= start_date && date <= end_date;
      const countByProperty = (arr, prop) => arr.reduce((count, item) => count + (item[prop] ? 1 : 0), 0);

      // Calculate counts for empanelment and expansion using Array.reduce
      const filteredClients = add_total_clients.filter((client) => isWithinDateRange(new Date(client.createdAt), startOfWeek, endOfWeek));

      const weekempanelmentCount = countByProperty(filteredClients, "empanelment");
      const weekexpansionCount = countByProperty(filteredClients, "expansion");
      const monthEmpanelmentCount = countByProperty(filteredClients, "empanelment", startOfMonth, endOfMonth);
      const monthExpansionCount = countByProperty(filteredClients, "expansion", startOfMonth, endOfMonth);
      const overallEmpanelmentCount = countByProperty(filteredClients, "empanelment");
      const overallExpansionCount = countByProperty(filteredClients, "expansion");


      // Filter demand data for weekly and monthly counts using Array.filter
      const weeklyData = add_total_demand.filter((demand) =>
        isWithinDateRange(new Date(demand.createdAt), startOfWeek, endOfWeek));
      const ActiveDemandWeeklyCount = weeklyData.filter((demand) => demand.status === "Open").length;
      const OverallDemandWeeklyCount = weeklyData.length;

      const monthlyData = add_total_demand.filter((demand) =>
        isWithinDateRange(new Date(demand.createdAt), startOfMonth, endOfMonth)
      );
      const ActiveDemandMonthlyCount = monthlyData.filter((demand) => demand.status === "Open").length;
      const OverallDemandMonthlyCount = monthlyData.length;

      const startdate = new Date(start_date);
      const enddate = new Date(end_date);
      enddate.setHours(23, 59, 59, 999);
      const overallCount = add_total_demand.filter(demand => {
        const createdAtDate = demand.createdAt
        return createdAtDate >= startdate && createdAtDate < enddate;
      });
      const activeDemand = overallCount.filter((demand) => demand.status === "Open").length;
      const overallDemand = overallCount.length;
      const overallClient = add_total_clients.filter((client) => {
        const createdAtDate = client.createdAt
        return createdAtDate >= startdate && createdAtDate < enddate;
      });
      const overallExpansionData = overallClient.filter(i => i.expansion !== "")
      const overallExpansion = overallExpansionData.length
      const overallEmpanelmentData = overallClient.filter(i => i.empanelment !== "")
      const overallEmpanelment = overallEmpanelmentData.length

      res.respond(
        {
          weekempanelmentCount,
          weekexpansionCount,
          monthEmpanelmentCount,
          monthExpansionCount,
          overallEmpanelmentCount,
          overallExpansionCount,
          ActiveDemandWeeklyCount,
          OverallDemandWeeklyCount,
          ActiveDemandMonthlyCount,
          OverallDemandMonthlyCount,
          activeDemand,
          overallDemand,
          overallExpansion,
          overallEmpanelment,
        },
        200,
        "Aggregate BDE data fetched successfully."
      );
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
};

const getHierarchyDemandData = {
  controller: async (req, res) => {
    const { user_id } = req.query;

    try {
      let current_user_id = user_id;
      if (req.query.subordinate_id) {
        current_user_id = req.query.subordinate_id;
      }

      const [demand_data, subordinates] = await Promise.all([
        demand_services.listUserCreatedbyDemands(current_user_id),
        employee_services.getByReportsto(current_user_id),
      ]);

      const active_demand = demand_data.filter((demand) => demand.status === 'Open');

      const pipeline = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(current_user_id),
            is_deleted: false,
            status: 'Active',
          },
        },
        {
          $graphLookup: {
            from: 'employees',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'reports_to',
            as: 'subordinates',
            maxDepth: 10,
            restrictSearchWithMatch: { is_deleted: false, status: 'Active' },
          },
        },
        {
          $lookup: {
            from: 'demands',
            let: { subordinateIds: '$subordinates._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$created_by', '$$subordinateIds'] },
                      { $eq: ['$status', 'Open'] },
                      { $eq: ['$is_deleted', false] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
            ],
            as: 'subordinate_demands',
          },
        },
        {
          $unwind: {
            path: '$subordinate_demands',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            total_demands: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'Open'] },
                  1,
                  {
                    $cond: [
                      { $eq: ['$subordinate_demands', null] },
                      0,
                      '$subordinate_demands.count',
                    ],
                  },
                ],
              },
            },
          },
        },
      ];

      const results = await fast_connection.models.employee.aggregate(pipeline);

      if (results.length === 0) {
        return res.respond({ error: 'No data found for the specified user_id' }, 404);
      }

      const current_user = await employee_services.getById(current_user_id);
      const total_demands = active_demand.length + results.reduce((total, result) => total + result.total_demands, 0);

      let subbordinates = [];
      if (req.query.subordinate_id) {
        const selectedSubordinate = subordinates.find((subordinate) => subordinate._id.toString() === req.query.subordinate_id);
        if (selectedSubordinate) {
          subbordinates = selectedSubordinate.subordinates;
        }
      } else {
        subbordinates = subordinates;
      }

      res.respond({ total_demands, subbordinates, current_user }, 200, 'Hierarchy Demand Data fetched successfully');
    } catch (error) {
      console.error('An error occurred while fetching data', error);
      res.respond({ error: 'An error occurred while fetching data' }, 500);
    }
  },
};



const listUserLevelDemands = {
  controller: async (req, res) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let demands = await demand_services.listUserCreatedbyDemands(req.query.user_id, start_date, end_date)
    let subordinates = await employee_services.getByReportsto(user_id);

    res.respond(demands, 200, 'Demands fetched sucessfully');
  }
}


const listUserLevelActiveDemands = {
  controller: async (req, res) => {
    const { user_id, start_date, end_date } = req.query;
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 15;

    try {
      const current_user_id = user_id;

      const [demand_data, subordinates] = await Promise.all([
        demand_services.listUserCreatedbyDemands(current_user_id, start_date, end_date, 'createdAt', 'asc'),
        employee_services.getByReportsto(current_user_id),
      ]);

      const active_demands = demand_data.filter(demand => demand.status === "Open");

      const subordinateIds = subordinates.reduce((ids, sub) => {
        if (sub._id.toString() === current_user_id)
          ids.push(...sub.subordinates.map(id => mongoose.Types.ObjectId(id)));
        return ids;
      }, []);

      const pipeline = [
        { $match: { _id: mongoose.Types.ObjectId(current_user_id), is_deleted: false, status: 'Active' } },
        {
          $graphLookup: {
            from: 'employees',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'reports_to',
            as: 'subordinates',
            maxDepth: 10,
            restrictSearchWithMatch: { is_deleted: false, status: 'Active' },
          },
        },
        {
          $lookup: {
            from: 'demands',
            let: { subordinateIds: '$subordinates._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$created_by', '$$subordinateIds'] },
                      { $eq: ['$status', 'Open'] },
                      { $eq: ['$is_deleted', false] },
                    ],
                  },
                },
              },
            ],
            as: 'subordinate_demands',
          },
        },
        { $unwind: { path: '$subordinate_demands', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$_id',
            subordinates: { $first: '$subordinates' },
            subordinate_demands: { $push: '$subordinate_demands' },
          },
        },
      ];


      const results = await fast_connection.models.employee.aggregate(pipeline);
      if (!results.length) return res.respond({ error: 'No data found for the specified user_id' }, 404);

      const current_user = await employee_services.getById(current_user_id);
      const sub_active_demands = results[0].subordinate_demands;
      const paginated_active_demand = active_demands.slice(skip, skip + limit);
      const paginated_subordinate_demands = sub_active_demands.slice(skip, skip + limit);
      const paginated_demands = [...paginated_active_demand, ...paginated_subordinate_demands];
      const total_demands = active_demands.length + sub_active_demands.length;

      const selectedSubordinate = subordinates.find(sub => sub._id.toString() === current_user_id);
      const subbordinates = selectedSubordinate ? selectedSubordinate.subordinates : [];

      res.respond({
        demands: paginated_demands,
        current_user,
        total_demands,
        subbordinates,
      });
    } catch (error) {
      console.error('An error occurred while fetching data', error);
      res.respond({ error: 'An error occurred while fetching data' }, 500);
    }
  },
};

const getHierarchyEmpanelment = {
  controller: async (req, res) => {
    const { user_id } = req.query;

    try {
      let current_user_id = user_id;
      if (req.query.subordinate_id) {
        current_user_id = req.query.subordinate_id;
      }

      const [clients, subordinates] = await Promise.all([
        client_services.listUserEmpanelment(current_user_id, req.query.start_date, req.query.end_date, 0, 10, 'createdAt', 'asc'),
        employee_services.getByReportsto(current_user_id),
      ]);

      const empanelment_data = clients.filter(i => i.empanelment !== "");

      const pipeline = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(current_user_id),
            is_deleted: false,
            status: 'Active',
          },
        },
        {
          $graphLookup: {
            from: 'employees',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'reports_to',
            as: 'subordinates',
            maxDepth: 10,
            restrictSearchWithMatch: { is_deleted: false, status: 'Active' },
          },
        },
        {
          $lookup: {
            from: 'clients',
            let: { subordinateIds: '$subordinates._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$created_by', '$$subordinateIds'] },
                      { $ne: ['$empanelment', ''] },
                      { $eq: ['$is_deleted', false] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  empanelment_data: { $push: '$$ROOT' },
                },
              },
            ],
            as: 'subordinate_demands',
          },
        },
        {
          $unwind: {
            path: '$subordinate_demands',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            empanelment_data: {
              $cond: [
                { $ne: ['$subordinate_demands', null] },
                '$subordinate_demands.empanelment_data',
                clients.filter(i => i.empanelment !== ""),
              ],
            },
            total_demands: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'Open'] },
                  1,
                  {
                    $cond: [
                      { $eq: ['$subordinate_demands', null] },
                      0,
                      '$subordinate_demands.count',
                    ],
                  },
                ],
              },
            },
          },
        },
        {
          $project: {
            empanelment_count: { $size: { $ifNull: ["$empanelment_data.empanelment", []] } },
            total_demands: 1,
            empanelment_data: 1,
          },
        },
      ];

      const results = await fast_connection.models.employee.aggregate(pipeline);

      const empanelment_count = (results[0].empanelment_count + empanelment_data.length)

      if (results.length === 0) {
        return res.respond({ error: 'No data found for the specified user_id' }, 404);
      }

      const current_user = await employee_services.getById(current_user_id);

      let subbordinates = [];
      if (req.query.subordinate_id) {
        const selectedSubordinate = subordinates.find(subordinate => subordinate._id.toString() === req.query.subordinate_id);
        if (selectedSubordinate) {
          subbordinates = selectedSubordinate.subordinates;
        }
      } else {
        subbordinates = subordinates;
      }

      res.respond(
        {
          clients,
          empanelment_data: results.length > 0 ? results[0].empanelment_data : [],
          empanelment_count,
          subbordinates,
          current_user,
        },
        200,
        'Hierarchy Empanelment Data fetched successfully'
      );
    } catch (error) {
      console.error('An error occurred while fetching data', error);
      res.respond({ error: 'An error occurred while fetching data' }, 500);
    }
  },
};

const listUserLevelEmpanelment = {
  controller: async (req, res) => {
    const { user_id } = req.query;
    let skip = parseInt(req.query.skip) || 0;
    let limit = parseInt(req.query.limit) || 15;

    try {
      let current_user_id = user_id;
      if (req.query.subordinate_id) {
        current_user_id = req.query.subordinate_id;
      }

      const [clients, subordinates] = await Promise.all([
        client_services.listUserEmpanelment(current_user_id, req.query.start_date, req.query.end_date, 0, 10, 'createdAt', 'asc'),
        employee_services.getByReportsto(current_user_id),
      ]);
      const empanelment_data = clients.filter(i => i.empanelment !== "")
      const pipeline = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(current_user_id),
            is_deleted: false,
            status: 'Active',
          },
        },
        {
          $graphLookup: {
            from: 'employees',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'reports_to',
            as: 'subordinates',
            maxDepth: 10,
            restrictSearchWithMatch: { is_deleted: false, status: 'Active' },
          },
        },
        {
          $lookup: {
            from: 'clients',
            let: { subordinateIds: '$subordinates._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$created_by', '$$subordinateIds'] },
                      { $ne: ['$empanelment', ''] },
                      { $eq: ['$is_deleted', false] },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: 'employees',
                  let: { createdBy: '$created_by' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$createdBy'],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        first_name: 1,
                        last_name: 1,
                      },
                    },
                  ],
                  as: 'created_by',
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  empanelment_data: { $push: '$$ROOT' },
                },
              },
            ],
            as: 'subordinate_demands',
          },
        },
        {
          $unwind: {
            path: '$subordinate_demands',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            empanelment_data: {
              $cond: [
                { $ne: ['$subordinate_demands', null] },
                '$subordinate_demands.empanelment_data',
                clients.filter((i) => i.empanelment !== ''),
              ],
            },
            total_demands: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'Open'] },
                  1,
                  {
                    $cond: [
                      { $eq: ['$subordinate_demands', null] },
                      0,
                      '$subordinate_demands.count',
                    ],
                  },
                ],
              },
            },
          },
        },
        {
          $project: {
            empanelment_count: { $size: { $ifNull: ['$empanelment_data.empanelment', []] } },
            total_demands: 1,
            empanelment_data: {
              $filter: {
                input: '$empanelment_data',
                as: 'item',
                cond: {
                  $and: [
                    { $ifNull: ['$$item.empanelment', false] }, // Check if the field exists
                    { $ne: ['$$item.empanelment', ''] }, // Filter out documents with empty expansion
                  ],
                },
              },
            },
          },
        },
      ];


      const results = await fast_connection.models.employee.aggregate(pipeline);

      if (results.length === 0) {
        return res.respond({ error: 'No data found for the specified user_id' }, 404);
      }

      const current_user = await employee_services.getById(current_user_id);
      const sub_empanelment_data = results[0]?.empanelment_data
      console.log(sub_empanelment_data, "sub")
      const overall_empanelment_data = [...sub_empanelment_data ? sub_empanelment_data : "", ...empanelment_data]
      const clients_empanelment = overall_empanelment_data.slice(skip, skip + limit)
      let subbordinates = [];
      if (req.query.subordinate_id) {
        const selectedSubordinate = subordinates.find(subordinate => subordinate._id.toString() === req.query.subordinate_id);
        if (selectedSubordinate) {
          subbordinates = selectedSubordinate.subordinates;
        }
      } else {
        subbordinates = subordinates;
      }

      res.respond(
        clients_empanelment,
      );
    } catch (error) {
      console.error('An error occurred while fetching data', error);
      res.respond({ error: 'An error occurred while fetching data' }, 500);
    }
  },
};

const getHierarchyExpansion = {
  controller: async (req, res) => {
    const { user_id } = req.query;

    try {
      let current_user_id = user_id;
      if (req.query.subordinate_id) {
        current_user_id = req.query.subordinate_id;
      }

      const [clients, subordinates] = await Promise.all([
        client_services.listUserExpansion(current_user_id, req.query.start_date, req.query.end_date),
        employee_services.getByReportsto(current_user_id),
      ]);

      const expansion_data = clients.filter(i => i.expansion !== "");


      const pipeline = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(current_user_id),
            is_deleted: false,
            status: 'Active',
          },
        },
        {
          $graphLookup: {
            from: 'employees',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'reports_to',
            as: 'subordinates',
            maxDepth: 10,
            restrictSearchWithMatch: { is_deleted: false, status: 'Active' },
          },
        },
        {
          $lookup: {
            from: 'clients',
            let: { subordinateIds: '$subordinates._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$created_by', '$$subordinateIds'] },
                      { $ne: ['$expansion', ''] },
                      { $eq: ['$is_deleted', false] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  expansion_data: { $push: '$$ROOT' },
                },
              },
            ],
            as: 'subordinate_expansions',
          },
        },
        {
          $unwind: {
            path: '$subordinate_expansions',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            expansion_data: {
              $cond: [
                { $ne: ['$subordinate_expansions', null] },
                '$subordinate_expansions.expansion_data',
                expansion_data,

              ],
            },
            total_expansions: {
              $sum: {
                $cond: [
                  { $eq: ['$subordinate_expansions', null] },
                  0,
                  '$subordinate_expansions.count',
                ],
              },
            },
          },
        },
        {
          $project: {
            expansion_count: { $size: { $ifNull: ["$expansion_data.expansion", []] } },
            total_expansions: 1,
            expansion_data: 1,
          },
        },
      ];

      const results = await fast_connection.models.employee.aggregate(pipeline);

      if (results.length === 0) {
        return res.respond({ error: 'No data found for the specified user_id' }, 404);
      }

      const current_user = await employee_services.getById(current_user_id);

      let subbordinates = [];
      if (req.query.subordinate_id) {
        const selectedSubordinate = subordinates.find(subordinate => subordinate._id.toString() === req.query.subordinate_id);
        if (selectedSubordinate) {
          subbordinates = selectedSubordinate.subordinates;
        }
      } else {
        subbordinates = subordinates;
      }

      const expansion_count = (results[0].expansion_count + expansion_data.length)

      res.respond(
        {
          clients,
          expansion_data: results.length > 0 ? results[0].expansion_data : [],
          expansion_count,
          subbordinates,
          current_user,
        },
        200,
        'Hierarchy Expansion Data fetched successfully'
      );
    } catch (error) {
      console.error('An error occurred while fetching data', error);
      res.respond({ error: 'An error occurred while fetching data' }, 500);
    }
  },
};

const listUserLevelExpansion = {
  controller: async (req, res) => {
    const { user_id } = req.query;
    let skip = parseInt(req.query.skip) || 0;
    let limit = parseInt(req.query.limit) || 15;

    try {
      let current_user_id = user_id;
      if (req.query.subordinate_id) {
        current_user_id = req.query.subordinate_id;
      }

      const [client, subordinates] = await Promise.all([
        client_services.listUserExpansion(current_user_id, req.query.start_date, req.query.end_date),
        employee_services.getByReportsto(current_user_id),
      ]);

      const expansion_data = client.filter(i => i.expansion !== "");


      const pipeline = [
        {
          $match: {
            _id: mongoose.Types.ObjectId(current_user_id),
            is_deleted: false,
            status: 'Active',
          },
        },
        {
          $graphLookup: {
            from: 'employees',
            startWith: '$_id',
            connectFromField: '_id',
            connectToField: 'reports_to',
            as: 'subordinates',
            maxDepth: 10,
            restrictSearchWithMatch: { is_deleted: false, status: 'Active' },
          },
        },
        {
          $lookup: {
            from: 'clients',
            let: { subordinateIds: '$subordinates._id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$created_by', '$$subordinateIds'] },
                      { $ne: ['$expansion', ''] },
                      { $eq: ['$is_deleted', false] },
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: 'employees',
                  let: { createdBy: '$created_by' },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $eq: ['$_id', '$$createdBy'],
                        },
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        first_name: 1,
                        last_name: 1,
                      },
                    },
                  ],
                  as: 'created_by',
                },
              },
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                  expansion_data: { $push: '$$ROOT' },
                },
              },
            ],
            as: 'subordinate_expansions',
          },
        },
        {
          $unwind: {
            path: '$subordinate_expansions',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            expansion_data: {
              $cond: [
                { $ne: ['$subordinate_expansions', null] },
                '$subordinate_expansions.expansion_data',
                client.filter((i) => i.expansion !== ''),
              ],
            },
            total_expansions: {
              $sum: {
                $cond: [
                  { $eq: ['$subordinate_expansions', null] },
                  0,
                  '$subordinate_expansions.count',
                ],
              },
            },
          },
        },
        {
          $project: {
            expansion_count: { $size: { $ifNull: ["$expansion_data.expansion", []] } },
            total_expansions: 1,
            expansion_data: {
              $filter: {
                input: "$expansion_data",
                as: "item",
                cond: {
                  $and: [
                    { $ifNull: ["$$item.expansion", false] }, // Check if the field exists
                    { $ne: ["$$item.expansion", ""] } // Filter out documents with empty expansion
                  ]
                }
              }
            }
          },
        },
      ];
      const result = await fast_connection.models.employee.aggregate(pipeline);

      const sub_expansion_datas = result[0].expansion_data;
      const overall_expansion_data = [...sub_expansion_datas ? sub_expansion_datas : "", ...expansion_data]
      const clients = overall_expansion_data.slice(skip, skip + limit);


      if (result.length === 0) {
        return res.respond({ error: 'No data found for the specified user_id' }, 404);
      }

      const current_user = await employee_services.getById(current_user_id);


      let subbordinates = [];
      if (req.query.subordinate_id) {
        const selectedSubordinate = subordinates.find(subordinate => subordinate._id.toString() === req.query.subordinate_id);
        if (selectedSubordinate) {
          subbordinates = selectedSubordinate.subordinates;
        }
      } else {
        subbordinates = subordinates;
      }
      res.respond(clients);
    } catch (error) {
      console.error('An error occurred while fetching data', error);
      res.respond({ error: 'An error occurred while fetching data' }, 500);
    }
  },
};

const applyStylesToWorksheet = (worksheet, excelData) => {
  const columnHeaders = excelData.client;
  const columnWidths = columnHeaders.map((header, index) => ({
    header: header,
    key: String(index + 1),
    width: 18,
  }));

  worksheet.columns = columnWidths;

  // Style for header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'DCE6F1' },
    };
    cell.alignment = { horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'B2BEB5' } },
      left: { style: 'thin', color: { argb: 'B2BEB5' } },
      bottom: { style: 'thin', color: { argb: 'B2BEB5' } },
      right: { style: 'thin', color: { argb: 'B2BEB5' } },
    };
  });

  const dataRowStartIndex = 2;
  const columnWidthPadding = 5;

  // Style for data rows
  excelData.value.forEach((row, rowIndex) => {
    const rowValues = Object.values(row);
    rowValues.forEach((value, columnIndex) => {
      const cell = worksheet.getCell(rowIndex + dataRowStartIndex, columnIndex + 1);
      cell.value = value;
      cell.alignment = { horizontal: 'center' };
      const valueLength = String(value).length;
      const currentWidth = worksheet.getColumn(columnIndex + 1).width;
      const newWidth = Math.max(valueLength + columnWidthPadding, currentWidth);
      worksheet.getColumn(columnIndex + 1).width = newWidth;
      cell.border = {
        top: { style: 'thin', color: { argb: 'B2BEB5' } },
        left: { style: 'thin', color: { argb: 'B2BEB5' } },
        bottom: { style: 'thin', color: { argb: 'B2BEB5' } },
        right: { style: 'thin', color: { argb: 'B2BEB5' } },
      };
    });
  });
};


const downloadOverallPerformance = {
  controller: async (req, res) => {
    try {
      let start_date = req.query.start_date;
      let end_date = req.query.end_date;
      let get_id = req.auth.user_id;
      let clients = await client_services.listBDEClients(get_id, start_date, end_date);
      let demand_data = await demand_services.listUserCreatedbyDemands(get_id, start_date, end_date);
      let subbordinates = await employee_services.getByReportsto(get_id);

      // Function to recursively get all subordinate IDs
      const getSubordinateIdsRecursive = async (subordinates) => {
        let subordinateIds = [];
        for (const subordinate of subordinates) {
          subordinateIds.push(subordinate._id);
          const subSubordinates = await employee_services.getByReportsto(subordinate._id);
          subordinateIds = subordinateIds.concat(await getSubordinateIdsRecursive(subSubordinates));
        }
        return subordinateIds;
      };

      const subordinateIds = [...await getSubordinateIdsRecursive(subbordinates)];

      let subordinate_demand = await demand_services.listUserCreatedbyDemands(subordinateIds, start_date, end_date);
      let subbordinate_clients = await client_services.listBDEClients(subordinateIds, start_date, end_date);
      let add_total_demand = [...demand_data, ...subordinate_demand]
      let add_total_clients = [...clients, ...subbordinate_clients]


      let filteredClients;
      let weekempanelmentCount;
      let weekexpansionCount;

      if (start_date && end_date) {
        const start = new Date(start_date);
        const end = new Date(end_date);

        filteredClients = add_total_clients.filter(client => {
          const clientCreatedAt = new Date(client.createdAt);
          return clientCreatedAt >= start && clientCreatedAt <= end;
        });
      } else {
        const currentDate = new Date();
        const previousSunday = new Date(currentDate);
        previousSunday.setDate(currentDate.getDate() - (currentDate.getDay() + 7) % 7);
        const nextSunday = new Date(previousSunday);
        nextSunday.setDate(previousSunday.getDate() + 7);

        filteredClients = add_total_clients.filter(client => {
          const clientCreatedAt = new Date(client.createdAt);
          return clientCreatedAt >= previousSunday && clientCreatedAt < nextSunday;
        });
      }

      weekempanelmentCount = filteredClients.filter(client => client.empanelment);
      weekexpansionCount = filteredClients.filter(client => client.expansion);

      let monthStartDate, monthEndDate;
      if (start_date && end_date) {
        monthStartDate = new Date(start_date);
        monthEndDate = new Date(end_date);
      } else {
        const currentDate = new Date();
        monthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      }

      let monthEmpanelmentFilteredClients = add_total_clients.filter(
        client => client.empanelment && new Date(client.createdAt) >= monthStartDate && new Date(client.createdAt) <= monthEndDate
      );
      let monthEmpanelmentCount = monthEmpanelmentFilteredClients.length;

      let monthExpansionFilteredClients = add_total_clients.filter(
        client => client.expansion && new Date(client.createdAt) >= monthStartDate && new Date(client.createdAt) <= monthEndDate
      );
      let monthExpansionCount = monthExpansionFilteredClients.length;
      // Calculate overall empanelment count
      let overallEmpanelment = add_total_clients.filter(client => client.empanelment);

      // Calculate overall expansion count
      let overallExpansion = add_total_clients.filter(client => client.expansion);
      // Calculate weekly start date and end date
      const currentDate = new Date();
      const dayOfWeek = currentDate.getDay();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - (dayOfWeek + 7) % 7);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);


      // Calculate monthly start date and end date
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Filter demand_data for the monthly count
      const monthlyData = add_total_demand.filter(
        demand => new Date(demand.createdAt) >= startOfMonth && new Date(demand.createdAt) <= endOfMonth
      );

      const demand_monthlyData = monthlyData.filter(demand => demand);


      const workbook = new Excel.Workbook();
      const empanelmentSheet = workbook.addWorksheet('Overall Empanelment');
      const expansionSheet = workbook.addWorksheet('Overall Expansion');
      const demandMonthlySheet = workbook.addWorksheet('Overall Demand');

      let empanelment = overallEmpanelment.map(d => {
        let transformed = {
          client_id: d?.ClientId,
          empanelment: d?.empanelment,
          expansion: d?.expansion,
          company_name: d?.company_name,
          contact_person: d?.basic_details[0]?.contact_person,
          company_website: d?.client_details[0]?.website,
          team: d?.basic_details[0]?.team,
          email: d?.basic_details[0]?.primary_email,
          mobile: d?.basic_details[0]?.primary_mobile,
          source_person_name: d?.source_person_name,
          passthrough: d?.passthrough_company_name,
          city: d?.client_details[0]?.city,
          created_by: d?.created_by?.first_name + ' ' + d?.created_by?.last_name,
          createdAt: ISOdateToCustomDate(d?.createdAt),
        };
        return transformed;
      });

      let expansion = overallExpansion.map(d => {
        let transformed = {
          client_id: d?.ClientId,
          empanelment: d?.empanelment,
          expansion: d?.expansion,
          company_name: d?.company_name,
          contact_person: d?.basic_details[0]?.contact_person,
          company_website: d?.client_details[0]?.website,
          team: d?.basic_details[0]?.team,
          email: d?.basic_details[0]?.primary_email,
          mobile: d?.basic_details[0]?.primary_mobile,
          source_person_name: d?.source_person_name,
          passthrough: d?.passthrough_company_name,
          city: d?.client_details[0]?.city,
          created_by: d?.created_by?.first_name + ' ' + d?.created_by?.last_name,
          createdAt: ISOdateToCustomDate(d?.createdAt),
        };
        return transformed;
      });

      let demand = demand_monthlyData.map(d => {
        let transformed = {
          demand_id: d?.DemandId,
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
          created_by: d?.created_by?.first_name + ' ' + d?.created_by?.last_name,
        };
        return transformed;
      });

      console.log(empanelment, "expansion")

      applyStylesToWorksheet(empanelmentSheet, {
        client: ['Client ID', 'Empanelment', 'Expansion', 'Company Name', 'Contact Person', 'Company Website', 'Team', 'Email ID', 'Mobile', 'Source Person', 'Passthrough Person', 'City', 'Created by', 'Created on'],
        value: empanelment
      });

      applyStylesToWorksheet(expansionSheet, {
        client: ['Client ID', 'Empanelment', 'Expansion', 'Company Name', 'Contact Person', 'Company Website', 'Team', 'Email ID', 'Mobile', 'Source Person', 'Passthrough Person', 'City', 'Created by', 'Created on'],
        value: expansion
      });

      applyStylesToWorksheet(demandMonthlySheet, {
        client: ['Demand ID', 'Requirement', 'Received Date', 'POC', 'Sub Vendor', 'lead', 'Client', 'Min Experience', 'Primary Skill', 'Primary skill experience', 'Secondary Skill', 'secondary skill experience', 'Created By'],
        value: demand
      });

      const random_prefix = crypto.randomBytes(20).toString('hex');
      const filePath = `./${random_prefix}_list.xlsx`;
      await workbook.xlsx.writeFile(filePath);
      res.download(filePath, 'list.xlsx', (err) => {
        if (err) {
          console.log(err);
        } else {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.log(`${random_prefix}_list.xlsx file deletion failed:`, unlinkErr);
            } else {
              console.log(`${random_prefix}_list.xlsx file deleted`);
            }
          });
        }
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },
};






module.exports = {
  aggregate_BDE_data,
  listUserLevelDemands,
  getHierarchyDemandData,
  listUserLevelActiveDemands,
  getHierarchyEmpanelment,
  getHierarchyExpansion,
  listUserLevelExpansion,
  listUserLevelEmpanelment,
  downloadOverallPerformance
}