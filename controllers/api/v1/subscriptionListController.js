const models = require('../../../models');
var multiparty = require('multiparty');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const fs = require("fs");
require('dotenv').config();

exports.subscriptionList = async (req, res) => {
    await models.Subscription.findAll({
        where: { status:'y' }
    }).then((data) => {
        console.log(data);
        if (data ) {
            return res.status(200).send({ success: true, data: data, message: "get subscriptionList.", errorNode: { errorCode: 0, errorMsg: "No error" } });
        } else {
            return res.status(200).send({ success: false, message: "get subscriptionList not found", errorNode: { errorCode: 1, errorMsg: err } });
        }
    }).catch((error) => {
        console.error("Error fetching subscriptionList:", error);
        return res.status(500).send({ success: false, message: "Error fetching subscriptionList", errorNode: { errorCode: 1, errorMsg: error.message } });
    });

}