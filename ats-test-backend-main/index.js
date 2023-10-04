const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const responseHelper = require('express-response-helper').helper();
const bodyParser = require('body-parser');
require('dotenv').config();

const port = process.env.PORT || 4001
const routes = require("./server/routes");

const app = express()

app.use(bodyParser.json());

app.use(responseHelper);
// require('./server/email_trigger')

app.use(cors())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.use(helmet())

routes.setup(app);

app.get('*', (req, res) => res.status(200).send({
    message: 'Welcome to site spectrum API V1.',
}));



app.listen(port, () => {
    console.log(`Server is running on PORT ${port}`)
});


