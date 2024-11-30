const models = require('../../models');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
var multiparty = require('multiparty');
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
    // const search = req.query.search || '';
    let search = req.query.searchText ? req.query.searchText : '';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;

    let contactList = await models.ContactUs.findAll({
        attributes: ['id', 'name', 'email', 'contactno', 'message'],
        where: {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }

            ]
        },
        limit: pageSize, offset: (page - 1) * pageSize
    });


    let listCount = await models.ContactUs.count({
        where: {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }

            ]
        }
    });
    let pageCount = Math.ceil(listCount / pageSize);

    res.render("admin/contact/list", {
        title: "Contact Us List",
        contactList: contactList,
        listCount: listCount,
        pageCount: pageCount,
        pageSize: pageSize,
        currentPage: parseInt(page),
        searchItem: search,
        messages: req.flash("info"),
        errors: req.flash("error"),
    });
}

/* exports.saveOrUpdate = async function(req, res) {
    console.log("kkkkkkkkkk")
    var form = new multiparty.Form();
    form.parse(req, async function(err, fields) {
        console.log(fields);
        // var id = parseInt(fields.updateId[0]);
        var resp = "";
        var action = "";

        // if (id > 0) {
        //     console.log("999999999999999999");
        //     action = "update";
        //     resp = await updateRecord(fields);
        // } else {
        console.log("lllllllllll")
        action = "create";
        resp = await createRecord(fields);
        if (resp.success) id = resp.id;
        // }

        console.log("...........00000000001111000000000000000..............");
        // console.log(files);

        var type = "info";
        var message = resp.message;
        if (resp.error != "") {
            type = "error";
            message = resp.error;
        }

        req.flash(type, message);
        return res.redirect('/admin/contact-us');
        // return res.redirect('back');
    });
};

async function createRecord(fields) {
    console.log("1111111111111111111111111111111");
    return new Promise(async(resolve, reject) => {
        console.log("222222222222222");
        console.log(JSON.stringify(fields))
        if (fields.name[0] != '' && fields.email[0] != '') {
            console.log("333333333333333");
            await models.ContactUs.create({
                name: fields.name[0],
                email: fields.email[0],
                contactno: fields.contactno[0],
                message: fields.message[0]
            }).then((data) => {
                console.log("333333333333333333333");
                console.log(data);
                if (data && data.id > 0) {
                    resolve({ "success": true, "id": data.id, "error": "", "message": "New Contact created successfully." });
                } else {
                    resolve({ "success": false, "error": "Failed to create Contact ! Please try again.", "message": "" });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
            });

        }
    })
} */


exports.saveOrUpdate = async function(req, res, next) {
    console.log("11111111111111111111111111111111111");
    // var { name, email, contactno, message } = req.body;
    // if (title != "" && fees != "" && duration != "" && status != "") {
    var resp = "";
    var action = "";

    // id = parseInt(id);
    // if (id > 0) {
    //     action = "update";
    //     resp = await updateRecord(req.body);
    // } else {
    action = "create";
    resp = await createRecord(req.body);
    // }

    if (resp.success) {
        return res.status(200).send({ "success": true, data: resp })
    } else {
        return res.status(200).send({ "success": false, data: resp })
    }
    // } else {
    //     return res.status(500).send({ success: false, message: "All firelds are required!" })
    // }
};


/**
 * Create a new record
 * @param {*} reqBody 
 * @returns 
 */
async function createRecord(fields) {
    var { name, email, contactno, message } = fields;
    return new Promise(async(resolve, reject) => {
        console.log("222222222222222222222");
        console.log(fields);
        var isDuplicate = await models.ContactUs.findOne({ where: { email: email } });
        if (isDuplicate == null) {
            models.ContactUs.create({
                name: name,
                email: email,
                contactno: contactno,
                message: message,
                created_by: 1,
                created_at: Sequelize.fn('NOW')
            }).then((data) => {
                if (data && data.id > 0) {
                    resolve({ "success": true, "id": data.id, "error": "", "message": "New Contact created successfully." });
                } else {
                    resolve({ "success": false, "message": "Failed to create New Contact! Please try again." });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": error, "message": "We are facing some technical issue! Please try again." });
            });
        } else {
            resolve({ "success": false, "message": "Contact email already exists!" });
        }
    });
}

exports.delete = async(req, res) => {
    var { id } = req.body;
    if (id && id > 0) {
        models.ContactUs.destroy({
            where: { id: id },
        }).then((affected_rows) => {
            if (affected_rows > 0) {
                return res.status(200).send({ "success": true, "message": "Contact deleted successfully!" });
            } else {
                return res.status(200).send({ "success": false, "message": "Failed to delete contact!" });
            }
        }).catch((erroor) => {
            console.log(error);
            return res.status(500).send({ "success": false, error: error, message: "We are facing some technical issue! Please try again." })
        });
    } else {
        return res.status(400).send({ "success": false, message: "Unsufficient data!" });
    }
}






/**
 * Create a new record
 * @param {*} reqBody 
 * @returns 
 */




/**
 * Update an existing record
 * @param {*} reqBody 
 * @returns 
 */
/* async function updateRecord(fields) {
    const { id, title, description, fees, duration, status } = fields;
    return new Promise(async(resolve, reject) => {
        console.log("222222222222222222222");
        console.log(fields);
        var isDuplicate = await models.Subscription.findOne({
            where: {
                title: title,
                id: {
                    [Sequelize.ne]: id
                }
            }
        });
        if (isDuplicate == null) {
            models.Subscription.update({
                title: title,
                fees: fees,
                description: description,
                duration: duration,
                status: status,
                updated_by: 1,
                updated_at: Sequelize.fn('NOW')
            }, { where: { id: id } }).then((affected_rows) => {
                if (affected_rows > 0) {
                    resolve({ "success": true, "id": id, "error": "", "message": "Subscription plan updated successfully." });
                } else {
                    resolve({ "success": false, "error": "Failed to update subscription plan! Please try again.", "message": "" });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
            });
        } else {
            resolve({ "success": false, "error": "Subscription plan name already exists!", "message": "" });
        }
    });
} */




/**
 * Get the subscription details of a particular subscription by id
 */
async function getsubcriptionById(id) {
    /*  return new Promise(async (resolve, reject) => {
         if (id > 0) {
             let subscription = await models.Subscription.findOne({
                 attributes: ['id', 'title', 'fees', 'duration', 'status'],
                 where: { id: id }
             });
             resolve(subscription);
         }
         resolve("");
     }); */
    return "";
}