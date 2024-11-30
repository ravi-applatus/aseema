const models = require('../../../models');
var multiparty = require('multiparty');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const fs = require("fs");
const moment = require('moment/moment');
require('dotenv').config();

exports.subscription = async (req, res) => {
    let customerId = req.body.customerId
    let subscriptionId = req.body.subscriptionId
    const validuser = await models.Customers.findOne({
        attributes: ['id'],
        where: { id: customerId }
    });
    if (!validuser) {
        return res.status(404).send({ data: { success: false, message: "User not found" }, errorNode: { errorCode: 1, errorMsg: "This Email is not registered" } });
    } else {
        const subscriptionPlanId = await models.Subscription.findOne({
            attributes: ['id', 'duration', 'noOfMonths'],
            where: { id: subscriptionId }
        });
        if (!subscriptionPlanId) {
            return res.status(404).send({
                data: { success: false, message: "Subscription plan not found" }, errorNode: { errorCode: 1, errorMsg: "Subscription plan not found" }
            });
        } else {
            const subscriptionPlanDate = new Date().toISOString().split('T')[0];
            const a = new Date();
            a.setMonth(a.getMonth() + subscriptionPlanId.noOfMonths);
            const expiredDate = a.toISOString().split('T')[0]
            validuser.update({
                subscriptionPlansId: subscriptionPlanId.id,
                duration: subscriptionPlanId.duration,
                subscriptionPlanStartDate: subscriptionPlanDate,
                subscriptionPlanEndDate: expiredDate
            }).then((data) => {
                if (data) {
                    return res.status(200).send({
                        data: { success: true, message: "Subscription plan add successfully" }
                    });
                } else {
                    return res.status(404).send({
                        data: { success: false, message: "Subscription plan not add" }, errorNode: { errorCode: 1, errorMsg: "Subscription plan not found" }
                    });
                }
            })
        }
    }
}