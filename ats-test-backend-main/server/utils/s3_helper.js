const multer = require('multer');
const multerS3 = require('multer-s3');
var AWS = require("aws-sdk");
const { s3Config } = require('../../config');

AWS.config.update({
    accessKeyId: s3Config.clientId,
    secretAccessKey: s3Config.clientSecret,
    region: s3Config.region,
});
const s3 = new AWS.S3();
let fileType = ''
const mediaUploadS3 = (destinationPath) => multer({
        storage: multerS3({
        s3: s3,
        bucket: s3Config.bucket,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            let fileType 
            if(file.originalname.split(".")[1] == "xlsx"){
                fileType = "xlsx"
            }else{
                fileType = file.mimetype.split('/')[1] == 'svg+xml' ? 'svg' : file.mimetype.split('/')[1]
            }
            cb(
                null,
                destinationPath + "/" +
                file.originalname +
                '_' +
                Date.now().toString() +
                '.' +
                fileType
            );
        },
    }),
    limits: { fileSize: 10000000 }
});

module.exports.mediaUploadS3 = mediaUploadS3