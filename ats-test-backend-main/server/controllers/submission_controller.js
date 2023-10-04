const submission_services = require("../services/submission_services")
const submission_tracker_services = require("../services/submission_tracker_services")
const Excel =require('exceljs')
const crypto = require('crypto')
const fs = require('fs')
const {ISOdateToCustomDate} = require('../utils/ISO_date_helper')
  
  const generateSubmissionId = async () => {
    const submissions = await submission_services.getAllSubmissions();
    const lastSubmissionId = submissions.SubmissionId;
    submissionCounter = parseInt(lastSubmissionId.substr(3)) + 1;
    const paddedCounter = submissionCounter.toString().padStart(4, "0");
    return `SSS${paddedCounter}`;
  };
  
const createSubmission = {
    controller: async (req, res) => {
        let new_obj = {...req.body}
        new_obj["submitted_by"] = req.auth.user_id;
        new_obj["SubmissionId"] = await generateSubmissionId(); // add custom ID field to new object
        let new_submission = await submission_services.create(new_obj)
        let submission_tracker_obj = {
            submission_id: new_submission._id,
            demand_id: req.body.demand,
            candidate_id: req.body.candidate,
            SubmissionId: new_submission. SubmissionId,
            submitted_by:req.auth.user_id
        }
        await submission_tracker_services.create(submission_tracker_obj)
        res.respond(new_submission, 200, 'Submission created successfully.');
    }
}

const updateSubmission = {
    controller: async (req, res) => {
        await submission_services.updateSubmission(req.body)
        res.respond("Submission updated successfully", 200, 'Submission updated successfully.');
    }
}

const deleteSubmission = {
    controller: async (req, res) => {
        await submission_services.deleteSubmission(req.body._id)
        res.respond("Submission deleted successfully", 200, 'Submission deleted successfully.');
    }
}



const listSubmissions = {
    controller: async (req, res) => {
        let submissions = await submission_services.listSubmissions(req.query)
        res.respond(submissions, 200, 'Submissionss fetched sucessfully');
    }
}

const listUserCreatedSubmissions = {
    controller: async (req, res) => {
        let submissions = await submission_services.listUserCreatedSubmissions(req.auth.user_id)
        res.respond(submissions, 200, 'Submissionss fetched sucessfully');
    }
}



const downloadSubmissions = {
    controller: async (req, res) => {

        let random_prefix = crypto.randomBytes(20).toString('hex')
        let submissions = await submission_services.listSubmissions(req.query)
        let excel_submissions = submissions.map(s=>{
            let transformed = {
                demand_id:s?.demand?._id,
                recruiter: s?.submitted_by?.first_name + ' ' +  s?.submitted_by?.last_name,
                submission_id:s?._id,
                submission_date:ISOdateToCustomDate(s?.createdAt),
                candidate_id: s?.candidate?._id,
                mobile: s?.candidate?.mobile_number,
                email: s?.candidate?.email,
                status: s?.status
            }
            return transformed
        })
        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet("submission_list");

        worksheet.columns = [
            { header: 'demand_id', key: 'demand_id' },
            { header: 'recruiter', key: 'recruiter' },
            { header: 'submission_id', key: 'submission_id' },
            { header: 'submission_date', key: 'submission_date' },
            { header: 'candidate_id', key: 'candidate_id'},
            { header: 'mobile', key: 'mobile' },
            { header: 'email', key: 'email' },
            { header: 'status', key: 'status' },
        ]
        worksheet.addRows(excel_submissions);
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

const getSubmissionDetails = {
    controller: async (req, res) => {
        let submission = await submission_services.getSubmissionDetails(req.query.submission_id)
        res.respond(submission, 200, 'Submission fetched sucessfully');
    }
}

const updateSubmissionTracker = {
    controller: async (req, res) => {
        await submission_tracker_services.updateSubmissionTracker(req.body)
        res.respond("Submission tracker updated successfully", 200, 'Submission tracker updated successfully.');
    }
}

const getSubmissionByDemand = {
    controller: async (req, res) => {
        let submission = await submission_services.getSubmissionByDemand(req.query.demand_id)
        res.respond(submission, 200, 'Submissions fetched sucessfully');
    }
}

const getSubmissionTracker = {
    controller: async (req, res) => {
        let submission = await submission_tracker_services.getSubmissionTrackerDetails(req.query.submission_id)
        res.respond(submission, 200, 'Submission tracker fetched sucessfully');
    }
}

const searchSubmission = {
    controller: async (req, res) => {
        let submissions = await submission_services.searchSubmission(req.query.field_name,req.query.field_value)    
        res.respond(submissions, 200, 'Submission fetched sucessfully');
    }
}
const searchMySubmission = {
    controller: async (req, res) => {
        let submissions = await submission_services.searchMySubmission(req.auth.user_id,req.query.field_name,req.query.field_value)    
        res.respond(submissions, 200, 'Submission fetched sucessfully');
    }
}

const uploadReports = {
    controller: async (req, res) => {
      res.respond({ document: req.file.location }, 200, 'Document uploaded sucessfully');
    }
  }


// const downloadTrackSubmissions = {
//     controller: async (req, res) => {
//       try {
//         let random_prefix = crypto.randomBytes(20).toString('hex');
//         const { submission_id } = req.query;
//         console.log(submission_id,"Ss")
//         let Tracksubmissions = await submission_tracker_services.download(submission_id);
//         console.log(Tracksubmissions, "data");
//         let excel_demands = [Tracksubmissions].map((d) => {
//           let transformed = {
//             submission_id: d?.SubmissionId,
//             demand_id: d?.demand_id.DemandId,
//             candidate_id: d?.candidate_id.CandidateId,
//             status: d?.status,
//             initial_screening : d?.file_reports[0],
//             level_1 : d?.file_reports[1],
//             level_2 : d?.file_reports[2],
//             final_select : d?.file_reports[3],
//             offered : d?.file_reports[4],
//             onboard : d?.file_reports[5],
//             bg_verification : d?.file_reports[6],
//             join_date:d?.join_date,
//             offeredCtc:d?.offeredCtc,
//             billingRate:d?.billingRate,
//           };
//           return transformed;
//         });
//         let workbook = new Excel.Workbook();
//         let worksheet = workbook.addWorksheet("demand_list");
  
//      // Create a cell style for center alignment
// const centerAlignedStyle = {
//     alignment: {
//       horizontal: 'center',
//       vertical: 'middle',
//     },
//   };
  
//   worksheet.columns = [
//     { header: 'Submission ID', key: 'submission_id', width: 15 },
//     { header: 'Demand ID', key: 'demand_id', width: 15 },
//     { header: 'Candidate ID', key: 'candidate_id', width: 15 },
//     { header: 'Status', key: 'status', width: 25 },
//     { header: 'Intial Screening', key: 'initial_screening', width: 25 },
//     { header: 'Level 1 Report', key: 'level_1', width: 25 },
//     { header: 'Level 2 Report', key: 'level_2', width: 25 },
//     { header: 'Final Select', key: 'final_select', width: 25 },
//     { header: 'Offered', key: 'offered', width: 25 },
//     { header: 'Onboard', key: 'onboard', width: 25 },
//     { header: 'BG Verification', key: 'bg_verification', width: 25 },
//     { header: 'Date of onboard', key: 'join_date', width: 25 },
//     { header: 'Offered CTC', key: 'offeredCtc', width: 25 },
//     { header: 'Billing Rate', key: 'billingRate', width: 25 },
//   ];
  
//   // Center-align the header row
//   worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  
//   // Apply center-aligned style to all rows and cells
//   worksheet.eachRow((row, rowNumber) => {
//     row.eachCell((cell) => {
//       cell.style = centerAlignedStyle;
//     });
//   });
  
//   const headerRow = worksheet.getRow(1);
//   headerRow.eachCell({ includeEmpty: true }, (cell) => {
//     cell.fill = {
//       type: 'pattern',
//       pattern: 'solid',
//       fgColor: { argb: 'DCE6F1' }
//     };
//     cell.alignment = { horizontal: 'center' };

//     cell.border = {
//       top: { style: 'thin', color: { argb: 'B2BEB5' } },
//       left: { style: 'thin', color: { argb: 'B2BEB5' } },
//       bottom: { style: 'thin', color: { argb: 'B2BEB5' } },
//       right: { style: 'thin', color: { argb: 'B2BEB5' } },
//     };
//   });
          
          
//         worksheet.addRows(excel_demands);
        
//         const headerCellReferences = ['A1', 'B1', 'C1', 'D1'];
//         const headerColor = 'DCE6F1';
        
//         for (const cellRef of headerCellReferences) {
//           const cell = worksheet.getCell(cellRef);
//           cell.fill = {
//             type: 'pattern',
//             pattern: 'solid',
//             fgColor: { argb: headerColor }
//           };
//         }
//         await workbook.xlsx.writeFile(`./${random_prefix}_list.xlsx`);
  
//         res.download(`./${random_prefix}_list.xlsx`, 'list.xlsx', function (err) {
//           if (err) {
//             console.log(err);
//           } else {
//             fs.unlink(`./${random_prefix}_list.xlsx`, function () {
//               console.log(`${random_prefix}_list.xlsx file deleted`);
//             });
//           }
//         });
//       } catch (error) {
//         console.log(error);
//         res.status(500).send('Error occurred during download');
//       }
//     },
//   };

const downloadTrackSubmissions = {
  controller: async (req, res) => {
    try {
      let random_prefix = crypto.randomBytes(20).toString('hex');
      const { submission_id } = req.query;
      console.log(submission_id, "Ss")
      let Tracksubmissions = await submission_tracker_services.download(submission_id);
      console.log(Tracksubmissions, "data");
      let excel_demands = [Tracksubmissions].map((d) => {
        let transformed = {
          submission_id: d?.SubmissionId,
          demand_id: d?.demand_id.DemandId,
          candidate_id: d?.candidate_id.CandidateId,
          status: d?.status,
          initial_screening: d?.file_reports[0],
          level_1: d?.file_reports[1],
          level_2: d?.file_reports[2],
          final_select: d?.file_reports[3],
          offered: d?.file_reports[4],
          onboard: d?.file_reports[5],
          bg_verification: d?.file_reports[6],
          join_date: d?.join_date,
          offeredCtc: d?.offeredCtc,
          billingRate: d?.billingRate,
        };
        return transformed;
      });
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet("demand_list");

const centerAlignedStyle = {
    alignment: {
      horizontal: 'center',
      vertical: 'middle',
    },
  };

      // ... existing cell style and header formatting ...

      // const hyperlinkStyle = workbook.createStyle({
      //   font: { color: "#0000FF", underline: true },
      // });

        worksheet.columns = [
    { header: 'Submission ID', key: 'submission_id', width: 15 },
    { header: 'Demand ID', key: 'demand_id', width: 15 },
    { header: 'Candidate ID', key: 'candidate_id', width: 15 },
    { header: 'Status', key: 'status', width: 25 },
    { header: 'Intial Screening', key: 'initial_screening', width: 25 },
    { header: 'Level 1 Report', key: 'level_1', width: 25 },
    { header: 'Level 2 Report', key: 'level_2', width: 25 },
    { header: 'Final Select', key: 'final_select', width: 25 },
    { header: 'Offered', key: 'offered', width: 25 },
    { header: 'Onboard', key: 'onboard', width: 25 },
    { header: 'BG Verification', key: 'bg_verification', width: 25 },
    { header: 'Date of onboard', key: 'join_date', width: 25 },
    { header: 'Offered CTC', key: 'offeredCtc', width: 25 },
    { header: 'Billing Rate', key: 'billingRate', width: 25 },
  ];

       // Center-align the header row
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Apply center-aligned style to all rows and cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.style = centerAlignedStyle;
      });
    });

    excel_demands.forEach((d) => {
      // Modify the hyperlink values to use Google Docs Viewer
      const baseURL = 'https://docs.google.com/viewer?url=';
    
      d.initial_screening = {
        text: "Initial Screening report",
        hyperlink: `${baseURL}${encodeURIComponent(d?.initial_screening)}`,
      };
      d.level_1 = {
        text: "Level 1 report",
        hyperlink: `${baseURL}${encodeURIComponent(d?.level_1)}`,
      };
      d.level_2 = {
        text: "Level 2 report",
        hyperlink: `${baseURL}${encodeURIComponent(d?.level_2)}`,
      };
      d.final_select = {
        text: "Final Select report",
        hyperlink: `${baseURL}${encodeURIComponent(d?.final_select)}`,
      };
      d.offered = {
        text: "Offered report",
        hyperlink: `${baseURL}${encodeURIComponent(d?.offered)}`,
      };
      d.onboard = {
        text: "Onboard report",
        hyperlink: `${baseURL}${encodeURIComponent(d?.onboard)}`,
      };
      d.bg_verification = {
        text: "BG Verification report",
        hyperlink: `${baseURL}${encodeURIComponent(d?.bg_verification)}`,
      };
    });
//     excel_demands.forEach((d) => {
//       // Modify the hyperlink values to use the openResume function
//     d.initial_screening = { text: "Initial Screening report", hyperlink: (d?.initial_screening)};
// d.level_1 = { text: "Level 1 report", hyperlink:(d?.level_1)};
// d.level_2 = { text: "Level 2 report", hyperlink: (d?.level_2)};
// d.final_select = { text: "Final Select report", hyperlink: (d?.final_select)};
// d.offered = { text: "Offered report", hyperlink: (d?.offered) };
// d.onboard = { text: "Onboard report", hyperlink: (d?.onboard) };
// d.bg_verification = { text: "BG Verification report", hyperlink:(d?.bg_verification) };

//     });

    worksheet.addRows(excel_demands);

    // Apply hyperlink styles to cells with hyperlinks
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        if (cell.value && cell.value.hyperlink) {
          cell.font = {
            color: { argb: "0000FF" },
            underline: true,
          };
        }
      });
    });

    const headerCellReferences = ['A1', 'B1', 'C1', 'D1'];
    const headerColor = 'DCE6F1';

    for (const cellRef of headerCellReferences) {
      const cell = worksheet.getCell(cellRef);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: headerColor }
      };
    }

    await workbook.xlsx.writeFile(`./${random_prefix}_list.xlsx`);

    res.download(`./${random_prefix}_list.xlsx`, 'list.xlsx', function (err) {
      if (err) {
        console.log(err);
      } else {
        fs.unlink(`./${random_prefix}_list.xlsx`, function () {
          console.log(`${random_prefix}_list.xlsx file deleted`);
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error occurred during download');
  }
},
};

  
module.exports = { 
    createSubmission,
    updateSubmission,
    deleteSubmission,
    downloadTrackSubmissions,
    getSubmissionDetails,
    listSubmissions,
    updateSubmissionTracker,
    getSubmissionByDemand,
    getSubmissionTracker,
    searchSubmission,
    searchMySubmission,
    downloadSubmissions,
    listUserCreatedSubmissions,
    uploadReports
}