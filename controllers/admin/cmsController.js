const models = require('../../models');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var multiparty = require('multiparty');
var utility = require("../../utils/utility");
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
    let cmsList = await models.Cms.findAll({
        attributes: ['id', 'title', 'status'],
    });
    // console.log(cmsList);
    res.render("admin/cms/list", {
        title: "Cms List",
        cmsList: cmsList,
        messages: req.flash("info"),
        errors: req.flash("error"),
    });
}
exports.form = async (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.render("admin/cms/form", {
            title: "Cms List",
            cmsdata: '',
            messages: req.flash("info"),
            errors: req.flash("error"),
        });
    } else {
        const cmsdata = await models.Cms.findOne({
            attributes: ["id", "title", "slug", "short_description", "status"],
            where: { id: id },
        });
        res.render("admin/cms/form", {
            title: "Cms List",
            cmsdata: cmsdata,
            messages: req.flash("info"),
            errors: req.flash("error"),
        });
    }
}


/*  exports.form = async (req, res) => {
    var id = req.params.id;
    var cms = "";

    if (id && id > 0) {
        const details = await getCmsById(id);
        if (details.cms != null) cms = details.cms;
        console.log(details);
    }

    var messages = req.flash('info').toString();
    var errors = req.flash('error').toString();

    return res.render('admin/cms/form', {
        title: (banner != "" ? 'Update Banner' : 'Create Banner'),
        banner: banner,
        messages: messages,
        errors: errors,
    });
}  */

exports.saveOrUpdate = async function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields) {
        console.log(fields);
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
        return res.redirect('/admin/cms');
        // return res.redirect('back');
    });
};


async function createRecord(fields) {
    return new Promise(async (resolve, reject) => {
        if (fields.title[0] != '' && fields.status[0] != '') {
            const slugName = await utility.slugify(fields.title[0])
            let existingSlug = await models.Cms.findOne({
                where: { slug: slugName }
            });
            
            if (existingSlug) {
                resolve({ "success": false,  "error": "", "message": "cms slug already exist." });
            }else{
                
                await models.Cms.create({
                    title: fields.title[0],
                    slug: slugName,
                    short_description: fields.short_description[0],
                    status: fields.status[0]
                }).then((data) => {
                    if (data && data.id > 0) {
                        resolve({ "success": true, "id": data.id, "error": "", "message": "cms created successfully." });
                    } else {
                        resolve({ "success": false, "error": "Failed to create cms ! Please try again.", "message": "" });
                    }
                }).catch((error) => {
                    console.log(error)
                    resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
                });
            }
            

        }
    })
}


// function getCmsById(id) {
//     return new Promise(async (resolve, reject) => {
//         if (id > 0) {
//             const banner = await models.Cms.findOne({
//                 attributes: ["id", "title", "slug", "content", "short_description", "status"],
//                 where: { id: id },
//             });
//             resolve({ "cms": cms });
//         }
//         resolve("");
//     });
// } 


/* async function updateRecord1(fields) {
    return new Promise(async(resolve, reject) => {
        console.log("22222222211111222222222222");
        console.log(fields);
        var isDuplicate = await models.Cms.findOne({
            where: {
                title: fields.title[0],
                id: {
                    [Op.ne]: fields.id[0]
                }
            }
        });
        models.Cms.update({
            title: fields.title[0],
            slug: fields.slug[0],
            short_description: fields.short_description[0],
            status: fields.status[0],
            updated_by: 1,
            updated_at: Sequelize.fn('NOW')
        }, { where: { id: fields.id[0] } }).then((affected_rows) => {
            if (affected_rows > 0) {
                resolve({ "success": true, "id": fields.id[0], "error": "", "message": "Cms updated successfully." });
            } else {
                resolve({ "success": false, "error": "Failed to update Cms! Please try again.", "message": "" });
            }
        }).catch((error) => {
            console.log(error)
            resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
        });

    });
} */

async function updateRecord(fields) {
    return new Promise(async (resolve, reject) => {
        await models.Cms.update({
            title: fields.title[0],
            // slug: fields.slug[0],
            short_description: fields.short_description[0],
            status: fields.status[0],
        }, { where: { id: fields.updateId[0] } }).then((affected_rows) => {
            if (affected_rows > 0) {
                resolve({ "success": true, "error": "", "message": "Cms updated successfully." });
            } else {
                resolve({ "success": false, "error": "Failed to update Cms! Please try again.", "message": "" });
            }
        }).catch((error) => {
            console.log(error)
            resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
        });

    })
}

exports.delete = async function (req, res) {
    console.log(req.body);
    var id = req.body.id;
    console.log(id);
    if (id > 0) {
        const cmsCount = await models.Cms.destroy({ where: { id: id } });

        if (cmsCount > 0) {
            // req.flash('info', 'Successfully deleted');
            return res.status(200).send({ "success": true, "message": "Cms deleted successfully!" });
        } else {
            req.flash('errors', 'Cms not found');
        }
        res.redirect('back');
    }

};

exports.description = async (req, res) => {
    console.log("++++++++++++++++++++++++++");
    const selectedtittle_id = req.query.id;
    var cms_d = await models.Cms.findAll({
        attrbutes: ["id", "title", "slug", "status"],
        where: { id: selectedtittle_id },
    });
    console.log("000000000000000000000000");
    console.log(selectedtittle_id);
    console.log(cms_d);
    if (!cms_d) {
        return res.status(404).json({ error: 'cms not found' });
    }
    res.json({ cms_d });
}