const express = require("express");
const employee = require("./employee");
const demand = require("./demand")
const candidate = require("./candidate")
const submission = require("./submission")
const client = require("./client")
const skill = require("./skill")
const logs = require("./logs")
const vendor = require("./vendor")
const aggregate = require("./aggregate")
const BDE = require("./BDE")
const crm = require("./crm");
const Target = require('./AddTarget')
const ADBSearch = require('./BooleanSearch')


const { expressjwt: expressJwt } = require('express-jwt');

const config = require("../../config");

const setup = (app) => {
    console.log("Setting up routes.");

    app.use(
        "/api/v1",
        function (req, res, next) {
            next();
        },
        expressJwt({
            secret: config.jwtSecret,
            algorithms: ['HS256']
        }).unless({
            path: [
                "/api/v1/employee/createEmployee",
                "/api/v1/employee/signIn",
                "/api/v1/employee/extSignIn",
                "/api/v1/employee/resetPasswordRequest",
                "/api/v1/logs/getLoginLogs"
            ],
        })
    );

    // Route Specific API endpoints
    app.use("/api/v1/employee", employee)
    app.use("/api/v1/demand", demand)
    app.use("/api/v1/candidate", candidate)
    app.use("/api/v1/submission", submission)
    app.use("/api/v1/client", client)
    app.use("/api/v1/skill", skill)
    app.use("/api/v1/logs", logs)
    app.use("/api/v1/vendor", vendor)
    app.use("/api/v1/aggregate", aggregate)
    app.use("/api/v1/BDE", BDE)
    app.use("/api/v1/crm", crm);
    app.use("/api/v1/targetControl", Target);
    app.use("/api/v1/adbSearch", ADBSearch);



};

module.exports = {
    setup
};
