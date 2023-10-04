const jwtSecret =
  process.env.SECRET_KEY || "0a6b944d-d2fb-46fc-a85e-0295c986cd9f";

const MongoURI = "mongodb+srv://SSUAT:8667822518Jio@ssdev.us8prjv.mongodb.net";

const s3Config = {
  clientId: "AKIA3QFUUJY4JCXNC4GN",
  clientSecret: "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",
  region: "ap-south-1",
  bucket: "ss-ats-assets",
};

const SENDGRID_API_KEY =
  "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";

const MailjetApiConfig = {
  ApiKey: "6a29d9d92a896c6a37c046df983af536",
  ApiSecret: "10ae8cc9532a0ca8fd1c5c7f1aebbec2",
};

const ClientResetCallbackUrl = "http://localhost:3000/resetpassword";

module.exports = {
  jwtSecret,
  MongoURI,
  s3Config,
  SENDGRID_API_KEY,
  MailjetApiConfig,
  ClientResetCallbackUrl,
};
