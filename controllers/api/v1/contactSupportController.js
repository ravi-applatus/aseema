const models = require('../../../models');
var multiparty = require('multiparty');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const fs = require("fs");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET_KEY;

exports.contactSupport = async (req, res) => {
    // let customerId = req.body.customerId;
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    if(name!= '' && name!== null && email!= '' && email!== null && message!= '' && message!== null){
        await models.ContactUs.create({
            name: name,
            email: email,
            message: message,
            created_at:Date.now()
        }).then((data) => {
            if (data) {
                return res.status(200).send({ success: true, data: data, message: "Contact /Support Add successfully.", errorNode: { errorCode: 0, errorMsg: "No error" } });
            } else {
                return res.status(200).send({ success: false, message: "Contact /Support Add failed.", errorNode: { errorCode: 1, errorMsg: err } });
            }
        })
    }else{
        return res.status(404).send({ data: { success: false, message: "All field required" }, errorNode: { errorCode: 1, errorMsg: "Please required all field" } });
    }
    // let token = req.headers["token"];
    // jwt.verify(token, SECRET, async (err, decoded) => {
    //     if (err) {
    //         res.json("Invalid Token");
    //     } else {
            // const validuser = await models.Customers.findOne({
            //     attributes: ['id'],
            //     where: { id: customerId }
            // });
            // if (!validuser) {
            //     return res.status(404).send({ data: { success: false, message: "User not found" }, errorNode: { errorCode: 1, errorMsg: "User not found" } });
            // } else {
                
            // }
        // }
    // });
}