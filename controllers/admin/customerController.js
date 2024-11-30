const models = require('../../models');
const multiparty = require('multiparty');
const moment = require('moment');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const fs = require("fs");
require('dotenv').config();


/**
 * Get the list of the categoies
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */



exports.list = async (req, res) => {
    try {
        // const search = req.query.search || '';
        let search = req.query.searchText ? req.query.searchText : '';
        let pagesizes = req.query.pagesize || 10;
        let pageSize = parseInt(pagesizes);
        let page = req.params.page || 1;
        let userlist = await models.Customers.findAll({
            attributes: ['id', 'firstName', 'lastName', 'fullName', 'email', 'status'],
            order: [['id', 'DESC']],
            where: {
                [Op.or]: [
                    { fullName: { [Op.like]: `%${search}%` } },
                    { firstName: { [Op.like]: `%${search}%` } },
                    { lastName: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { duration: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } }
                ]
            },
            limit: pageSize, offset: (page - 1) * pageSize
        });
        let currentDate = new Date().toISOString().split('T')[0];
        for (var j = 0; j < userlist.length; j++) {
            userlist[j].dataValues.subscriptionStartDate = '';
            userlist[j].dataValues.subscriptionEndDate = '';
            userlist[j].dataValues.duration = '';
            userlist[j].dataValues.subStatus = 'Unsubscribed';
            let subscriptionData = await models.Orders.findOne({
                attributes: [[Sequelize.literal('MIN(`subscriptionStartDate`)'), 'subscriptionStartDate'], [Sequelize.literal('MAX(`subscriptionEndDate`)'), 'subscriptionEndDate']],
                where: {
                    customerId: userlist[j].id, status: "active"
                },
            });
            if (subscriptionData) {
                userlist[j].dataValues.subscriptionStartDate = subscriptionData.subscriptionStartDate;
                userlist[j].dataValues.subscriptionEndDate = subscriptionData.subscriptionEndDate;
                let nowStart = moment(subscriptionData.subscriptionStartDate);
                let endEnd = moment(subscriptionData.subscriptionEndDate);
                userlist[j].dataValues.duration = endEnd.diff(nowStart, 'days');
                if (!subscriptionData.subscriptionStartDate && !subscriptionData.subscriptionEndDate) {
                    userlist[j].dataValues.subStatus = 'Unsubscribed';
                } else if (subscriptionData.subscriptionEndDate) {
                    if (subscriptionData.subscriptionStartDate <= currentDate && subscriptionData.subscriptionEndDate >= currentDate) {
                        userlist[j].dataValues.subStatus = 'Subscribed';
                    } else {
                        userlist[j].dataValues.subStatus = 'Plan Expired';
                    }
                }
            }
        }
        let listCount = await models.Customers.count({
            where: {
                [Op.or]: [
                    { fullName: { [Op.like]: `%${search}%` } },
                    { firstName: { [Op.like]: `%${search}%` } },
                    { lastName: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } },
                    { duration: { [Op.like]: `%${search}%` } },
                    { status: { [Op.like]: `%${search}%` } }
                ]
            },
        });
        let pageCount = Math.ceil(listCount / pageSize);
        console.log(userlist);
        res.render("admin/customers/list", {
            title: "Customers List Page",
            errors: req.flash("errors"),
            userlist: userlist,
            listCount: listCount,
            pageCount: pageCount,
            pageSize: pageSize,
            currentPage: parseInt(page),
            searchItem: search,
            loginerrors: "",
            messages: req.flash("message"),
            lmessages: req.flash("lmessage"),
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal server error");
    }
};

exports.form = async (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.render("admin/customers/form", {
            title: "dfsdfsdfsdfsdfs",
            errors: req.flash("errors"),
            userdata: '',
            loginerrors: "",
            messages: req.flash("message"),
            lmessages: req.flash("lmessage"),
        });
    } else {
        let userdata = await models.Customers.findOne({
            attributes: ['id', 'firstName', 'lastName', 'email', 'mobile', 'status'],
            where: { id: id },
        })
        console.log(userdata);
        if (userdata) {
            res.render("admin/customers/form", {
                title: "dfsdfsdfsdfsdfs",
                errors: req.flash("errors"),
                userdata: userdata,
                loginerrors: "",
                messages: req.flash("message"),
                lmessages: req.flash("lmessage"),
            });
        }
    }
}

exports.saveOrUpdate = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields) {
        var id = parseInt(fields.updateId[0]);
        var resp = "";
        var action = "";
        if (id > 0) {
            action = "update";
            resp = await updateRecord(req, fields);
        } else {
            action = "create";
            resp = await createRecord(req, fields);
            if (resp.success) id = resp.id;
        }
        var type = "info";
        var message = resp.message;
        if (resp.error != "") {
            type = "error";
            message = resp.error;
        }
        req.flash(type, message);
        return res.redirect('/admin/customers/list/1');
        // return res.redirect('back');
    })
}

exports.delete = async function (req, res) {
    var id = req.body.id;
    console.log(id);
    if (id > 0) {
        const userCount = await models.Customers.destroy({ where: { id: id } });
        if (userCount > 0) {
            req.flash('info', 'Successfully deleted');
            return res.status(200).send({ "success": true, "message": "user deleted successfully!" });
        } else {
            req.flash('errors', 'user not found');
        }
        res.redirect('back');
    }

};


async function createRecord(req, fields) {
    return new Promise(async (resolve, reject) => {

        if (fields.email[0] != '' && fields.firstName[0] != '' && fields.lastName[0] != '') {
            const existingUser = await models.Customers.findOne({
                where: { email: fields.email[0] }
            });
            if (existingUser) {
                resolve({ "success": false, "error": "Email already exists!", "message": "" });
            } else {
                let firstName = fields.firstName[0];
                let lastName = fields.lastName[0];
                let fullName = `${firstName} ${lastName}`;
                await models.Customers.create({
                    firstName: fields.firstName[0],
                    lastName: fields.lastName[0],
                    email: fields.email[0],
                    fullName: fullName,
                    status: fields.status[0],
                }).then((data) => {
                    console.log(data);
                    if (data && data.id > 0) {
                        return res.status(200).send({ "success": true, "message": "Customers created successfully." });
                    } else {
                        resolve({ "success": false, "error": "Failed to create user record! Please try again.", "message": "" });
                    }
                }).catch((error) => {
                    console.log(error)
                    resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
                });
            }
        }
    })

}

async function updateRecord(req, fields) {
    return new Promise(async (resolve, reject) => {
        await models.Customers.update({
            firstName: fields.firstName[0],
            lastName: fields.lastName[0],
            // mobile: fields.mobile[0],
            status: fields.status[0],
        },
            { where: { id: fields.updateId[0] } }
        ).then((row) => {
            if (row > 0) {
                resolve({ "success": true, "error": "", "message": "Faqs saved successfully." });
            } else {
                resolve({ "success": false, "error": "Failed to create Faqs record! Please try again.", "message": "" });
            }
        }).catch((error) => {
            console.log(error)
            resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
        });

    })
}