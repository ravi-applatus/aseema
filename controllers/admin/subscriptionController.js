const models = require('../../models');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
var multiparty = require('multiparty');

const fs = require("fs");
require('dotenv').config();


/**
 * Get the list of the categoies
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */




exports.list = async(req, res) => {
    let subscriptionList = await models.Subscription.findAll({
        attributes: ['id', 'title','tag', 'description', 'fees', 'duration','noOfMonths','tax', 'status'],
        order: [["id", "DESC"]]
    });

    var messages = req.flash('info').toString();
    var errors = req.flash('error').toString();

    res.render("admin/settings/subscription/list", {
        title: "Subscription List",
        subscriptionList: subscriptionList,
        messages: messages,
        errors: errors,
    });

}



exports.details=async(req,res)=>{
    const selected_id = req.query.subscriptionId;
    console.log(selected_id);
    var subscription = await models.Subscription.findAll({
        attributes: ['id', 'title','tag', 'description', 'fees', 'duration','noOfMonths', 'status'],
        where: { id: selected_id },
    });
    res.json({ subscription});
}


exports.delete = async(req, res) => {
    var { id } = req.body;
    if (id && id > 0) {
        models.Subscription.destroy({
            where: { id: id },
        }).then((affected_rows) => {
            if (affected_rows > 0) {
                return res.status(200).send({ "success": true, "message": "Subscription plan deleted successfully!" });
            } else {
                return res.status(200).send({ "success": false, "message": "Failed to delete subscription plan!" });
            }
        }).catch((erroor) => {
            console.log(error);
            return res.status(500).send({ "success": false, error: error, message: "We are facing some technical issue! Please try again." })
        });
    } else {
        return res.status(400).send({ "success": false, message: "Unsufficient data!" });
    }

}

exports.saveOrUpdate = async function(req, res, next) {
    console.log("11111111111111111111111111111111111");
    console.log(req.body)
    var { id, title,tag, description, fees, duration, tax, noOfMonths, status } = req.body;
    if (title != "" && fees != "" && duration != "" && noOfMonths !="" && status != "") {
        var resp = "";
        var action = "";

        id = parseInt(id);
        if (id > 0) {
            action = "update";
            resp = await updateRecord(req.body);
        } else {
            action = "create";
            resp = await createRecord(req.body);
        }

        if (resp.success) {
            return res.status(200).send({ "success": true, data: resp })
        } else {
            return res.status(200).send({ "success": false, data: resp })
        }
    } else {
        return res.status(500).send({ success: false, message: "All firelds are required!" })
    }
};


/**
 * Create a new record
 * @param {*} reqBody 
 * @returns 
 */
async function createRecord(fields) {

    console.log("11111111111111")
    console.log(fields)
    const { id, title,tag, description, fees, duration, noOfMonths, tax, status } = fields;
    return new Promise(async (resolve, reject) => {
        console.log(fields);
        var isDuplicate = await models.Subscription.findOne({ where: { title: title } });
        if (isDuplicate == null) {
            models.Subscription.create({
                title: title,
                tag:tag,
                fees: fees,
                description: description,
                duration: duration,
                noOfMonths: noOfMonths,
                tax: tax,
                status: status,
                created_by: 1,
                created_at: Sequelize.fn('NOW')
            }).then((data) => {
                if (data && data.id > 0) {
                    resolve({ "success": true, "id": data.id, "error": "", "message": "Subscription plan created successfully." });
                } else {
                    resolve({ "success": false, "message": "Failed to create subscription plan! Please try again." });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": error, "message": "We are facing some technical issue! Please try again." });
            });
        } else {
            resolve({ "success": false, "message": "Subscription plan name already exists!" });
        }
    });
}



/**
 * Update an existing record
 * @param {*} reqBody 
 * @returns 
 */
async function updateRecord(fields) {
    const { id, title,tag, description, fees,tax, duration, noOfMonths, status } = fields;
    return new Promise(async (resolve, reject) => {
        var isDuplicate = await models.Subscription.findOne({ where: { title: title, id: {
                    [Sequelize.ne]: id } } });
        if (isDuplicate == null) {
            models.Subscription.update({
                title: title,
                tag:tag,
                fees: fees,
                description: description,
                duration: duration,
                tax:tax,
                noOfMonths:noOfMonths,
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
}




/**
 * Get the subscription details of a particular subscription by id
 */
// async function getsubcriptionById(id) {
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
//     return "";
// }