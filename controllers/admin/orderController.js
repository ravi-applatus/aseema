const models = require('../../models');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const  multiparty = require('multiparty');
const fs = require("fs");
require('dotenv').config();
const { Op } = require('sequelize');
const cron = require('node-cron')
const moment = require('moment');

/**
 * Get the list of the categoies
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */



async function statusUpdate(req, res) {
    let status = await models.Orders.findAll({
        attributes: ['id', 'subscriptionEndDate', 'status'],
        where: { status: 'active' }
    });
    let subscriptionEndDate
    for (let i of status) {
        subscriptionEndDate = i.subscriptionEndDate
        let currentDate = new Date().toISOString().split('T')[0];
        if (subscriptionEndDate < currentDate) {
            await models.Orders.update({
                status: "expired"
            }, { where: { id: i.id } }.then((data) => {
                console.log(data);
            }))
        }
    }
}

cron.schedule('5 0 * * *', async () => {
    const date = new Date()
    statusUpdate()
});

exports.list = async (req, res) => {
    try {
        let search = req.query.searchText ? req.query.searchText : '';
        let pagesizes = req?.query?.pagesize || 10;
        let pageSize = parseInt(pagesizes);
        let page = req?.params?.page || 1;
        let orderList = await models.Orders.findAll({
            attributes: ['id', 'subscriptionId', 'customerId', 'customerName', 'subscriptionName', 'paymentTransactionId', 'orderDateTime', 'subscriptionStartDate', 'subscriptionEndDate', 'status'],
            order: [['id', 'DESC']],
            where: {
                [Op.or]: [
                    { customerName: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                    { subscriptionName: { [Op.like]: `%${search}%` } },

                ]
            }, limit: pageSize, offset: (page - 1) * pageSize
        });

        let listCount = await models.Orders.count({
            where: {
                [Op.or]: [
                    { customerName: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } },
                    { subscriptionName: { [Op.like]: `%${search}%` } },
                ]
            }
        });
        let pageCount = Math.ceil(listCount / pageSize);
        arr = [];
        for (let ol of orderList) {
            const subscriptionList = await models.Subscription.findOne({
                attributes: ['id', 'title', 'noOfMonths'],
                where: { id: ol.subscriptionId }
            });

            const customerList = await models.Customers.findOne({
                attributes: ['id', 'firstName', 'lastName'],
                where: { id: ol.customerId }
            })

             const subscriptionStartDate = new Date(ol.subscriptionStartDate);
             const subscriptionEndDate = new Date(ol.subscriptionEndDate);

             const options = { year: 'numeric', month: 'long', day: 'numeric' };
             formattedStartDate = subscriptionStartDate.toLocaleDateString("en-IN", options);
             const formattedEndDate = subscriptionEndDate.toLocaleDateString("en-IN", options);
            // console.log(subscriptionEndDate);

            arr.push({
                orderId: ol.id,
                paymentTransactionId: ol.paymentTransactionId,
                orderDateTime: ol.orderDateTime,
                 subscriptionStartDate: formattedStartDate,
                 subscriptionEndDate: formattedEndDate,

                status: ol.status,
                subscriptionName: subscriptionList.title,
                customerName: ol.customerName


            });
            // console.log("hjvjvvjvj");
            // console.log(subscriptionList.noOfMonths);

        }
        res.render("admin/order/list", {
            title: "Order List",
            orderList: arr,
            listCount: listCount,
            pageCount: pageCount,
            pageSize: pageSize,
            currentPage: parseInt(page),
            searchItem: search,
            messages: req.flash("info"),
            errors: req.flash("error"),
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred.");
    }
}




exports.form = async (req, res,) => {
    try {
        let selectedCustomerId = req.query.selectedCustomerId
        var id = req?.params?.id;
        var order = "";
        var subscription = [];
        var customer = [];

        var subscription = await models.Subscription.findAll({
            attributes: ['id', 'title', 'noOfMonths', 'fees', 'tax'],
        })

        var customer = await models.Customers.findAll({
            attributes: ['id', 'firstName', 'lastName'],
        })

        let nextSubscriptionStart = ''
        let latestSubscription = null;
        if (selectedCustomerId) {
            latestSubscription = await models.Orders.findOne({
                attributes: ['subscriptionEndDate'],
                where: {
                    customerId: selectedCustomerId,
                    subscriptionEndDate: { [Sequelize.Op.ne]: null }
                },
                order: [['subscriptionEndDate', 'DESC']]
            });
            if (latestSubscription) {
                const subscriptionEnd = new Date(latestSubscription.subscriptionEndDate);
                nextSubscriptionStart = new Date(subscriptionEnd);
                nextSubscriptionStart.setDate(subscriptionEnd.getDate() + 1);
            }
        }
        let formattedDate = '';
        if (nextSubscriptionStart) {
            const year = nextSubscriptionStart.getFullYear();
            const month = String(nextSubscriptionStart.getMonth() + 1).padStart(2, '0');
            const day = String(nextSubscriptionStart.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
        }


        if (id && id > 0) {
            const details = await getOrderById(id);
            if (details.order != null) order = details.order;
        }

        var messages = req.flash('info').toString();
        var errors = req.flash('error').toString();
        return res.render(`admin/order/form`, {
            title: (order != "" ? 'Update order' : 'Create order'),
            order: order,
            subscriptionList: subscription,
            customerList: customer,
            formattedDate: formattedDate || '',
            // updating: updating, 
            messages: messages,
            errors: errors,
        });

    } catch (error) {
        console.log(error)
    }
}

exports.getCustomerDetails = async (req, res,) => {
    try {
        let selectedCustomerId = req?.query?.selectedCustomerId
        let nextSubscriptionStart = ''
        let latestSubscription = null;
        if (selectedCustomerId) {
            latestSubscription = await models.Orders.findOne({
                attributes: ['subscriptionEndDate'],
                where: {
                    customerId: selectedCustomerId,
                    subscriptionEndDate: { [Sequelize.Op.ne]: null }
                },
                order: [['subscriptionEndDate', 'DESC']]
            });
            if (latestSubscription) {
                const subscriptionEnd = new Date(latestSubscription.subscriptionEndDate);
                nextSubscriptionStart = new Date(subscriptionEnd);
                nextSubscriptionStart.setDate(subscriptionEnd.getDate() + 1);
            }
        }
        let formattedDate = '';
        if (nextSubscriptionStart) {
            if (new Date() <= new Date(nextSubscriptionStart)) {
                const year = nextSubscriptionStart.getFullYear();
                const month = String(nextSubscriptionStart.getMonth() + 1).padStart(2, '0');
                const day = String(nextSubscriptionStart.getDate()).padStart(2, '0');
                formattedDate = `${year}-${month}-${day}`;
            }

        }
        return res.status(200).send({ formattedDate })
    } catch (error) {
        console.log(error)
    }
}

exports.saveOrUpdate = async function (req, res) {
    console.log("kkkkkkkkkk")

    var form = new multiparty.Form();
    form.parse(req, async function (err, fields) {
        var id = parseInt(fields.updateId[0]);
        var resp = "";
        var action = "";
        if (id > 0) {
            action = "update";
            resp = await updateRecord(fields);
        } else {
            action = "create";
            resp = await createRecord(fields);
            if (resp.success) id = resp.id;
        }


        var type = "info";
        var message = resp.message;
        if (resp.error != "") {
            type = "error";

            message = resp.error;
        }

        req.flash(type, message);
        return res.redirect('/admin/orders/list/1');
        // return res.redirect('back');
    });
};

async function createRecord(fields) {
    return new Promise(async (resolve, reject) => {
        console.log(fields);
        if (fields.amount[0] != '') {
            const customerDetails = await models.Customers.findOne({
                attributes: ['id', 'firstName', 'lastName'],
                where: { id: fields.customerId[0] }
            });
            const subscriptionDetails = await models.Subscription.findOne({
                attributes: ['id', 'title', 'duration', 'noOfMonths'],
                where: { id: fields.subscriptionId[0] }
            });
            const latestSubscription = await models.Orders.findOne({
                attributes: ['subscriptionEndDate'],
                where: {
                    customerId: fields.customerId[0],
                    subscriptionEndDate: { [Sequelize.Op.ne]: null }
                },
                order: [['subscriptionEndDate', 'DESC']]
            });
            let subscriptionStart = new Date();

            if (latestSubscription) {
                subscriptionStart = new Date(latestSubscription.subscriptionEndDate);
                const startDate = subscriptionStart.setDate(subscriptionStart.getDate() + 1);
                const subscriptionName = subscriptionDetails.title;
                const customerName = customerDetails.firstName + ' ' + customerDetails.lastName;
                let yearlyText = 'M';
                let yearlyTextValue = (fields.subscriptionMonths[0]!=undefined &&  fields.subscriptionMonths[0]!=null && fields.subscriptionMonths[0]!='') ? fields.subscriptionMonths[0] : 1
                
                let expiredDate = moment(startDate).add(yearlyTextValue, yearlyText).format('YYYY-MM-DD');
                await models.Orders.create({
                    subscriptionId: fields.subscriptionId[0],
                    customerId: fields.customerId[0],
                    customerName: customerName,
                    subscriptionName: subscriptionName,
                    // paymentTransactionId: fields.paymentTransactionId[0],
                    orderDateTime: fields.orderDateTime[0],
                    subscriptionStartDate: moment(startDate).format('YYYY-MM-DD'),
                    subscriptionEndDate: expiredDate,
                    subscriptionMonths: fields.subscriptionMonths[0],
                    amount: fields.amount[0],
                    tax: fields.tax[0],
                    total: fields.total[0],
                    discount: (fields.discount[0] != undefined && fields.discount[0] != null && fields.discount[0] != '') ? fields.discount[0] : null,
                    paymentTransactionAmount: fields.paymentTransactionAmount[0],
                    paymentTransactionDateTime: fields.paymentTransactionDateTime[0],
                    paymentTransactionStatus: fields.paymentTransactionStatus[0],
                    status: "inqueue",
                    created_by: 1,
                    created_at: Sequelize.fn('NOW')
                }).then((data) => {
                    if (data && data.id > 0) {

                        resolve({ "success": true, "id": data.id, "error": "", "message": "order created successfully." });
                    } else {
                        resolve({ "success": false, "error": "Failed to create order ! Please try again.", "message": "" });
                    }
                }).catch((error) => {
                    console.log(error)
                    resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
                });
            } else {
                const subscriptionName = subscriptionDetails.title;
                const customerName = customerDetails.firstName + ' ' + customerDetails.lastName;
                const subscriptionPlanDate = moment(fields.subscriptionStartDate[0]);
                let yearlyText = 'M';
                // let yearlyText = (fields.subscriptionId[0] > 1) ? 'Y' : 'M';
                let yearlyTextValue = (fields.subscriptionMonths[0]!=undefined &&  fields.subscriptionMonths[0]!=null && fields.subscriptionMonths[0]!='') ? fields.subscriptionMonths[0] : 1;
                let expiredDate = moment(subscriptionPlanDate).add(yearlyTextValue, yearlyText).format('YYYY-MM-DD');
                await models.Orders.create({
                    subscriptionId: fields.subscriptionId[0],
                    customerId: fields.customerId[0],
                    customerName: customerName,
                    subscriptionName: subscriptionName,
                    // paymentTransactionId: fields.paymentTransactionId[0],
                    orderDateTime: fields.orderDateTime[0],
                    subscriptionStartDate: moment(subscriptionPlanDate).format('YYYY-MM-DD'),
                    subscriptionEndDate: expiredDate,
                    subscriptionMonths: fields.subscriptionMonths[0],
                    amount: fields.amount[0],
                    tax: fields.tax[0],
                    total: fields.total[0],
                    discount: (fields.discount[0] != undefined && fields.discount[0] != null && fields.discount[0] != '') ? fields.discount[0] : null,
                    paymentTransactionAmount: fields.paymentTransactionAmount[0],
                    paymentTransactionDateTime: fields.paymentTransactionDateTime[0],
                    paymentTransactionStatus: fields.paymentTransactionStatus[0],
                    status: "active",
                    created_by: 1,
                    created_at: Sequelize.fn('NOW')
                }).then((data) => {
                    if (data && data.id > 0) {
                        resolve({ "success": true, "id": data.id, "error": "", "message": "order created successfully." });
                    } else {
                        resolve({ "success": false, "error": "Failed to create order ! Please try again.", "message": "" });
                    }
                }).catch((error) => {
                    console.log(error)
                    resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
                });
            }

        }
    })
}



async function getOrderById(id) {
    return new Promise(async (resolve, reject) => {
        if (id > 0) {
            var order = await models.Orders.findOne({
                where: { id: id },
            });

            //const productCategories = await models.ProductCategory.findOne({ attributes: ["category_id"], where: { product_id: id } });
            // var category = await models.Category.findAll({ attributes: ['id', 'name', 'type'], where: { id: productCategories.category_id } })
            // product.category = categories;
            // console.log("88888888888899999999999");
            // console.log(productCategories);
            // console.log("+++++++++++++++++++++++++++++++++++++++++++++++");
            // console.log(product);
            // console.log(category);

            resolve({ "order": order });
        }
        resolve("");
    });
}


async function updateRecord(fields) {
    return new Promise(async (resolve, reject) => {
        await models.Orders.update({
            paymentTransactionStatus: fields.paymentTransactionStatus[0],
            status: fields.status[0],
            discount: (fields.discount[0] != undefined && fields.discount[0] != null && fields.discount[0] != '') ? fields.discount[0] : null,
            updated_by: 1,
            updated_at: Sequelize.fn('NOW')
        }, { where: { id: fields.updateId[0] } }).then((affected_rows) => {
            if (affected_rows > 0) {
                resolve({ "success": true, "error": "", "message": "Orders updated successfully." });
            } else {
                resolve({ "success": false, "error": "Failed to update Orders! Please try again.", "message": "" });
            }
        })
            .catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
            });

    })
}



