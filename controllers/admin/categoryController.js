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
    let column = req.query.column || 'id';
    let order = req.query.order || 'ASC';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;
    let search = req.query.searchText ? req.query.searchText : ''

    let categoryList = await models.Category.findAll({
        attributes: ['id', 'name', 'type', 'status', 'image'],
        order: [
            ["id", "DESC"]
        ],
        where: {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
            ]
        },
        limit: pageSize, offset: (page - 1) * pageSize
    });
    let listCount = await models.Category.count({
        where: {
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
            ]
        }
    });
    let pageCount = Math.ceil(listCount / pageSize);
    
if(categoryList){
    res.render("admin/settings/category/list", {
        title: "Category List",
        categoryList: categoryList,
        listCount: listCount,
        pageCount: pageCount,
        columnName: column,
        orderType: order,
        searchItem: search,
        pageSize: pageSize,
        currentPage: parseInt(page),
        messages: req.flash("info"),
        errors: req.flash("error"),
    });
}else{
    res.render("admin/settings/category/list", {
        title: "Category List",
        categoryList: '',
        messages: req.flash("info"),
        errors: req.flash("error"),
    });
}
    
}


exports.form = async (req, res) => {
    var id = req.params.id;
    var category = "";


    if (id && id > 0) {
        const details = await getCategoryById(id);
        if (details.category != null) {
            category = details.category.dataValues;
            // category.imagePath = `${req.app.locals.baseurl}`
        }
        // console.log(details);
    }

    var messages = req.flash('info').toString();
    var errors = req.flash('error').toString();

    return res.render('admin/settings/category/form', {
        title: (category != "" ? 'Update category' : 'Create category'),
        category: category,
        messages: messages,
        errors: errors,
    });
}

exports.saveOrUpdate = async function (req, res, next) {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        var id = parseInt(fields.id[0]);
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

        console.log(files.image[0], "Category image")
        if (id > 0 && files.image[0].originalFilename != "") {
            await uploadFiles(id, files, action);
        }

        var type = "info";
        var message = resp.message;
        if (resp.error != "") {
            type = "error";
            message = resp.error;
        }

        req.flash(type, message);
        if (resp.success) return res.redirect('/admin/settings/category');
        // return res.redirect('back');
    });
};


async function createRecord(fields) {
    return new Promise(async (resolve, reject) => {
        var isDuplicate = await models.Category.findOne({ where: { name: fields.name[0] } });
        if (isDuplicate == null) {
            models.Category.create({
                name: fields.name[0],
                type: fields.type[0],
                status: fields.status[0],
                image: "xyz",
                created_by: 1,
                created_at: Sequelize.fn('NOW')
            }).then((data) => {
                if (data && data.id > 0) {
                    resolve({ "success": true, "id": data.id, "error": "", "message": "Category created successfully." });
                } else {
                    resolve({ "success": false, "message": "Failed to create Category! Please try again." });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": error, "message": "We are facing some technical issue! Please try again." });
            });
        } else {
            resolve({ "success": false, "message": "Category name already exists!" });
        }
    });
}

function getCategoryById(id) {
    return new Promise(async (resolve, reject) => {
        if (id > 0) {
            const category = await models.Category.findOne({
                attributes: ["id", "name", "type", "image", "status"],
                where: { id: id },
            });
            resolve({ "category": category });
        }
        resolve("");
    });
}




async function updateRecord(fields) {
    return new Promise(async (resolve, reject) => {
        //     var isDuplicate = await models.Category.findOne({
        //         where: {
        //             name: fields.name[0],
        //             id: {
        //                 [Op.ne]: fields.id[0]
        //             }
        //         }
        //     });

        //     if (isDuplicate == null) {
        // console.log("=================================")
        // console.log(fields)
        // console.log("=================================")
        models.Category.update({
            name: fields.name[0],
            type: fields.type[0],
            status: fields.status[0],
            updated_by: 1,
            updated_at: Sequelize.fn('NOW')
        }, { where: { id: fields.id[0] } }).then((affected_rows) => {
            if (affected_rows > 0) {
                resolve({ "success": true, "id": fields.id[0], "error": "", "message": "Category updated successfully." });
            } else {
                resolve({ "success": false, "error": "Failed to update Category! Please try again.", "message": "" });
            }
        }).catch((error) => {
            console.log(error)
            resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
        });
        // } else {
        //     resolve({ "success": false, "error": "Category name already exists!", "message": "" });
        // }
    });
}



exports.delete = async (req, res) => {
    var { id } = req.body;
    if (id && id > 0) {
        var categoryDetails = await models.Category.findOne({ attributes: ["image"], where: { id: id } });
        models.Category.destroy({
            where: { id: id },
        }).then((affected_rows) => {
            if (affected_rows > 0) {
                deleteFile(categoryDetails.image);
                return res.status(200).send({ "success": true, "message": "Category deleted successfully!" });
            } else {
                return res.status(200).send({ "success": false, "message": "Failed to delete Category!" });
            }
        }).catch((erroor) => {
            console.log(error);
            return res.status(500).send({ "success": false, error: error, message: "We are facing some technical issue! Please try again." })
        });
    } else {
        return res.status(400).send({ "success": false, message: "Unsufficient data!" });
    }

}


async function uploadFiles(id, files, action) {
    if (files.image[0] != "") {
        var category = await models.Category.findOne({
            attributes: ["id", "image"],
            where: { id: id }
        });

        var filenameWithoutExt = files.image[0].originalFilename.substring(0, files.image[0].originalFilename.lastIndexOf('.')) || files.image[0].originalFilename;
        filenameWithoutExt = await utility.sanitizeString(filenameWithoutExt);
        const ext = files.image[0].originalFilename.split(".").pop();
        var filename = filenameWithoutExt + "-" + await utility.generateRandomString(4) + "." + ext;

        // console.log(filename, " filename=========")
        var isUploaded = await utility.uploadFiles(files.image[0].path, "category", filename);
        // console.log(isUploaded, " =========================")
        if (isUploaded) {
            if (action == "update") await deleteFile(filename);
            await models.Category.update({
                image: filename,
            }, { where: { id: id } });
        }
    }
    return
}


async function deleteFile(filename) {
    //Delete if any existing file exists with different name
    if (filename != "") {
        try {
            fs.unlinkSync('./public/contents/category/' + filename);
            console.log("File deleted successfully.");
        } catch (error) {
            console.log(error);
        }
    }
}