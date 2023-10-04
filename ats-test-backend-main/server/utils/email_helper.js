// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'eu-west-3'});

// Create sendEmail params 

const EmailParams = (recipient,subject,html) => {
    const params = {
        Destination: { /* required */
          ToAddresses: [
            recipient,
            /* more items */
          ]
        },
        Message: { /* required */
          Body: { /* required */
            Html: {
             Charset: "UTF-8",
             Data: html
            }
           },
           Subject: {
            Charset: 'UTF-8',
            Data: subject
           }
          },
        Source: 'donotreply@sightspectrum.com', /* required */
      };
      return params
}


// Create the promise and SES service object

// Handle promise's fulfilled/rejected states


const sendEmail = (recipient,subject,html) => {

    let params = EmailParams(recipient,subject,html)

    const sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

    return new Promise((resolve,reject)=> {
        sendPromise.then(
            function(data) {
                resolve(data) 
            }).catch(
            function(err) {
                reject(err)
                console.error(err, err.stack);
            });
    })

}

module.exports = {
    sendEmail
}