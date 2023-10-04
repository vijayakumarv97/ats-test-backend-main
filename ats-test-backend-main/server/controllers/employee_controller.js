const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const employee_services = require("../services/employee_services")
const activity_log_services = require("../services/activity_logs_services")
const config = require("../../config")
const saltRounds = 10;
const Excel = require('exceljs')
const crypto = require('crypto')
const fs = require('fs')
const { sendEmail } = require("../utils/email_helper")

const { ISOdateToCustomDate } = require('../utils/ISO_date_helper')

const welcomeMailFormat = (username) => {
    let mail = `Dear ${username},

    Welcome you to SightSpectrum's ATS!! Below you will find the login credentials to the ATS application.
    
    Below is the URL for the ATS. You will access the system via this link going forward.
    https://www.sightspectrum.com* placeholder
    
    If you have any questions, please contact Elangovan Viswanathan at 9976168640 Email ID elango@sightspectrum.com.
    
    *** This email was sent from an unmonitored mailbox. Please do not reply directly to this message. ***`

    return mail
}

const createEmployee = {
    controller: async (req, res) => {
        let employee_obj = { ...req.body }
        //   let employee_id = await generateEmployeeId();
        employee_obj["employee_id"] = req.body.employee_id;
        let password_hash = bcrypt.hashSync(employee_obj.password_hash, saltRounds);
        employee_obj.password_hash = password_hash
        let found_employee = await employee_services.getByEmail(employee_obj.email)
        if (found_employee) {
            res.respond('Employee with email already exist.', 403, 'Employee with email already exist.');
        } else {
            let new_employee = await employee_services.create(employee_obj)
            res.respond(new_employee, 200, 'Employee created successfully.');
            await sendEmail(employee_obj.email, "Welcome !!", welcomeMailFormat(req.body.first_name));
        }
    }
  };

const signIn = {
    controller: async (req, res) => {
        let { email, password } = req.body
        let found_user = await employee_services.getByEmail(email)
        if (found_user.status === "Active" && found_user.is_deleted === false) {
            let auth = await bcrypt.compare(password, found_user.password_hash); // true
            if (auth) {
                let found_user = await employee_services.getByEmail(email)
                let get_role = found_user.role
                let token = jwt.sign({ token_type: "authentication_token", user_id: found_user._id, user_role: found_user.role, employee_id: found_user.employee_id }, config.jwtSecret, { algorithm: 'HS256', expiresIn: '12h' });
                // res.respond({token}, 200, 'Token issued.');
                res.respond({ token, get_role }, 200, 'Token issued.');
                let found_activity = await activity_log_services.findUserActivity(found_user._id)
                if (!found_activity) {
                    let activity_obj = {
                        employee_id: found_user._id,
                        email: found_user.email,
                        name: `${found_user.first_name} ${found_user.last_name}`,
                        activity: "LOGIN_LOGS",
                        login_time: new Date()
                    }
                    await activity_log_services.create(activity_obj)
                }

            } else {
                res.respond("Email or Password does not match", 403, 'Try again');
            }
        }
        else {
            res.respond("User not found", 403, 'Try again');
        }
    }
}

const extSignIn = {
    controller: async (req, res) => {
        let { email, password } = req.body
        let found_user = await employee_services.getByEmail(email)
        if (found_user) {
            let auth = await bcrypt.compare(password, found_user.password_hash); // true
            if (auth) {
                let token = jwt.sign({ token_type: "authentication_token", user_id: found_user._id, user_role: found_user.role, employee_id: found_user.employee_id }, config.jwtSecret, { algorithm: 'HS256', expiresIn: '12h' });
                res.respond({ token }, 200, 'Token issued.');
            } else {
                res.respond("Authorization failed", 403, 'Try again');
            }
        }
        else {
            res.respond("Authorization failed", 403, 'Try again');
        }
    }
}

const logoutEmployee = {
    controller: async (req, res) => {
        let found_activity = await activity_log_services.findUserActivity(req.auth.user_id)
        if (found_activity) {
            await activity_log_services.updateLogs({ _id: found_activity._id, logoff_time: new Date() })
        }
        res.respond('Employee logged out sucessfully', 200, 'Employee logged out sucessfully');
    }
}

const listEmployee = {
    controller: async (req, res) => {
        let employees = await employee_services.listEmployees(req.query)
        res.respond(employees, 200, 'Employees fetched sucessfully');
    }
}

const downloadEmployee = {
    controller: async (req, res) => {

        let random_prefix = crypto.randomBytes(20).toString('hex')
        let employees = await employee_services.listEmployees(req.query)
        let excel_employees = employees.map(e => {
            let transformed = {
                employee_id: e?._id,
                full_name: e?.first_name + ' ' + e?.last_name,
                role: e?.role,
                job_role: e?.job_role,
                mobile_number: e?.mobile_number,
                email: e?.email,
                joining_date: ISOdateToCustomDate(e?.date_of_joining),
                registered_date: ISOdateToCustomDate(e?.createdAt),
                updated_date: ISOdateToCustomDate(e?.updatedAt),
                timestamp: ISOdateToCustomDate(e?.updatedAt)
            }
            return transformed
        })
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet("employee_list");

        worksheet.columns = [
            { header: 'employee_id', key: 'employee_id' },
            { header: 'full_name', key: 'full_name' },
            { header: 'role', key: 'role' },
            { header: 'job_role', key: 'job_role' },
            { header: 'mobile_number', key: 'mobile_number' },
            { header: 'email', key: 'email' },
            { header: 'joining_date', key: 'joining_date' },
            { header: 'registered_date', key: 'registered_date' },
            { header: 'updated_date', key: 'updated_date' },
            { header: 'timestamp', key: 'timestamp' }
        ]
        worksheet.addRows(excel_employees);
        await workbook.xlsx
            .writeFile(`./${random_prefix}_list.xlsx`)
            .then(function () {
                res.download(`./${random_prefix}_list.xlsx`, 'list.xlsx', function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        fs.unlink(`./${random_prefix}_list.xlsx`, function () {
                            console.log(`${random_prefix}_list.xlsx file deleted`)
                        });
                    }
                })
            });





    }

}



const getEmployeeDetails = {
    controller: async (req, res) => {
        let employee = await employee_services.getById(req.query.employee_id)
        if (employee) {
            let employee_redacted = { ...employee._doc }
            delete employee_redacted.password_hash
            res.respond(employee_redacted, 200, 'Employee fetched sucessfully');
        } else {
            res.respond({}, 404, 'Employee not found');
        }
    }
}

const getHierarchyList = {
    controller: async (req, res) => {
        let employees_hierachy = await employee_services.getByType(req.query.type)
        res.respond(employees_hierachy, 200, 'Employee hierarchy fetched sucessfully');
    }
}

const getReportsToHierarchy = {
    controller: async (req, res) => {
        let user_id = req.auth.user_id
        let user_role = req.auth.user_role
        let subbordinates = await employee_services.getByReportsto(user_id)
        let cross_functions = await employee_services.getByType(user_role)
        if (cross_functions.length) {
            console.log(cross_functions.filter(i => i._id != user_id))
            cross_functions_filtered = cross_functions.filter(i => i._id != user_id)
            let merged = [...subbordinates, ...cross_functions_filtered]
            res.respond(merged, 200, 'Employee reports to heierarchy fetched sucessfully');
        } else {
            res.respond([], 200, 'Employee reports to heierarchy fetched sucessfully');
        }

    }
}

const updateEmployee = {
    controller: async (req, res) => {
        let update_obj = { ...req.body }
        // let id_exit= await employee_services.getByEmployeeId(update_obj.employee_id)

        //    if(!id_exit){
        if (update_obj.password_hash) {
            let password_hash = bcrypt.hashSync(update_obj.password_hash, saltRounds);
            update_obj.password_hash = password_hash
        }
        update_obj["updated_by"] = req.auth.user_id;
        let updated_employee = await employee_services.updateEmployee(update_obj)
        if (updated_employee) {
            res.respond("employee updated sucessfully", 200, 'Employee updated sucessfully');
        }
        // }
        // else{
        //     res.respond("Employee_id already exits", 400, ' Valid Employee_id');
        // }

    }
}

const deleteEmployee = {
    controller: async (req, res) => {
        let deleted_employee = await employee_services.deleteEmployee(req.body._id)
        if (deleted_employee) {
            res.respond("employee deleted sucessfully", 200, 'Employee deleted sucessfully');
        }
    }
}

const resetPasswordRequest = {
    controller: async (req, res) => {
        let { email } = req.body
        let employee = await employee_services.getByEmail(email)
        if (email) {
            let token = jwt.sign({ token_type: "reset_token", user_id: employee._id }, config.jwtSecret, { algorithm: 'HS256' });
            await sendEmail(email, "Reset password email", `Please click on the link to reset your password  ${config.ClientResetCallbackUrl}?token=${token}`)
            res.respond("Employee reset mail sent sucessfully", 200, 'Employee reset mail sent sucessfully');
        } else {
            res.respond('Employee not found with this email', 404, 'Employee not found');
        }
        console.log(employee);
    }
}

const resetPassword = {
    controller: async (req, res) => {
        let { new_password } = req.body
        let { token_type, user_id } = req.auth
        if (token_type == "reset_token") {
            let password_hash = bcrypt.hashSync(new_password, saltRounds);
            let update_obj = { _id: user_id, password_hash: password_hash }
            let updated_employee = await employee_services.updateEmployee(update_obj)
            if (updated_employee) {
                res.respond("employee password updated sucessfully", 200, 'Employee updated sucessfully');
            } else {
                res.respond("employee password updated sucessfully", 200, 'Employee updated sucessfully');
            }
        } else {
            res.respond("Token not valid", 403, 'Employee update failed');
        }

    }
}

const searchEmployee = {
    controller: async (req, res) => {
        let employees = await employee_services.searchEmployee(req.query.field_name, req.query.field_value)
        res.respond(employees, 200, 'Employee fetched sucessfully');
    }
}


module.exports = {
    createEmployee,
    listEmployee,
    downloadEmployee,
    getEmployeeDetails,
    getHierarchyList,
    updateEmployee,
    deleteEmployee,
    signIn,
    logoutEmployee,
    resetPasswordRequest,
    resetPassword,
    getReportsToHierarchy,
    searchEmployee,
    extSignIn
}
