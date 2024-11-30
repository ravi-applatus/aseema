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
    let bannerList = await models.Banner.findAll({
        attributes: ['id', 'content', 'title', 'sequence', 'bannerGroup', 'status'],
        order: [
            ["id", "DESC"]
        ],
        where:{
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { bannerGroup: { [Op.like]: `%${search}%` } },
                { sequence: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
            ]
        }, limit: pageSize, offset: (page - 1) * pageSize
        
    });
    let listCount = await models.Banner.count({
        where: {
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { bannerGroup: { [Op.like]: `%${search}%` } },
                { sequence: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
            ]
        }
    });

    let pageCount = Math.ceil(listCount / pageSize);
    if(bannerList){
        res.render("admin/settings/banner/list", {
            title: "Banner List",
            bannerList: bannerList,
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
        res.render("admin/settings/banner/list", {
            title: "Banner List",
            bannerList: '',
            messages: req.flash("info"),
            errors: req.flash("error"),
        });
    }
   
}
exports.delete = async (req, res) => {
    var { id } = req.body;
    if (id && id > 0) {
        var bannerDetails = await models.Banner.findOne({ attributes: ["content"], where: { id: id } });
        models.Banner.destroy({
            where: { id: id },
        }).then((affected_rows) => {
            if (affected_rows > 0) {
                deleteFile(bannerDetails.content);
                return res.status(200).send({ "success": true, "message": "Banner Ads deleted successfully!" });
            } else {
                return res.status(200).send({ "success": false, "message": "Failed to delete Banner Ads!" });
            }
        }).catch((erroor) => {
            console.log(error);
            return res.status(500).send({ "success": false, error: error, message: "We are facing some technical issue! Please try again." })
        });
    } else {
        return res.status(400).send({ "success": false, message: "Unsufficient data!" });
    }

}

exports.form = async (req, res) => {
    var id = req.params.id;
    var banner = "";
    var dropdownSettingsList = await models.DropdownSettings.findOne({
        attributes: ['id', 'name', 'slug'],
        where: { slug: 'BannerGroup' }
    });
    if (dropdownSettingsList.id) {
        var dropDownOptionList = await models.DropdownSettingsOptions.findAll({
            attributes: ['id', 'dropdownSettingId', 'optionLabel', 'optionValue'],
            where: { dropdownSettingId: dropdownSettingsList.id }
        })
    }

    if (id && id > 0) {
        const details = await getBannerById(id);
        if (details.banner != null) banner = details.banner;
        console.log(details);
    }

    var messages = req.flash('info').toString();
    var errors = req.flash('error').toString();

    return res.render('admin/settings/banner/form', {
        title: (banner != "" ? 'Update Banner' : 'Create Banner'),
        banner: banner,
        dropDownOptionList: dropDownOptionList,
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
        var contentType = fields.content_type[0]
        if (id > 0) {
            action = "update";
            resp = await updateRecord(fields);
        } else {
            action = "create";
            resp = await createRecord(fields);
            if (resp.success) id = resp.id;
        }
        if (contentType == 'image') {
            var content = files.content[0];
        } else if (contentType == 'video') {
            var content = files.content[1];
        }

        if (id > 0 && content.originalFilename != "") {
            await uploadFiles(id, content, action);
        }

        var type = "info";
        var message = resp.message;
        if (resp.error != "") {
            type = "error";
            message = resp.error;
        }

        req.flash(type, message);
        if (resp.success) return res.redirect('/admin/settings/banner');
        return res.redirect('back');
    });
};


async function createRecord(fields) {
    return new Promise(async (resolve, reject) => {
        var isDuplicate = await models.Banner.findOne({ where: { title: fields.title[0] } });
        if (isDuplicate == null) {
            models.Banner.create({
                title: fields.title[0],
                sequence: fields.sequence[0],
                content: "xyz",
                content_type: fields.content_type[0],
                link_url: fields.link_url[0],
                bannerGroup: fields.bannerGroup[0],
                status: fields.status[0],
                created_by: 1,
                created_at: Sequelize.fn('NOW')
            }).then((data) => {
                if (data && data.id > 0) {
                    resolve({ "success": true, "id": data.id, "error": "", "message": "Banner Ads created successfully." });
                } else {
                    resolve({ "success": false, "message": "Failed to create Banner Ads! Please try again." });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": error, "message": "We are facing some technical issue! Please try again." });
            });
        } else {
            resolve({ "success": false, "message": "Banner Ads name already exists!" });
        }
    });
}

function getBannerById(id) {
    return new Promise(async (resolve, reject) => {
        if (id > 0) {
            const banner = await models.Banner.findOne({
                attributes: ["id", "title", "sequence", "content", "content_type", "link_url", "bannerGroup", "status"],
                where: { id: id },
            });
            resolve({ "banner": banner });
        }
        resolve("");
    });
}


async function updateRecord(fields) {
    return new Promise(async (resolve, reject) => {
        var isDuplicate = await models.Banner.findOne({
            where: {
                title: fields.title[0],
                id: {
                    [Op.ne]: fields.id[0]
                }
            }
        });

        if (isDuplicate == null) {
            models.Banner.update({
                title: fields.title[0],
                sequence: fields.sequence[0],
                content_type: fields.content_type[0],
                link_url: fields.link_url[0],
                bannerGroup: fields.bannerGroup[0],
                status: fields.status[0],
                updated_by: 1,
                updated_at: Sequelize.fn('NOW')
            }, { where: { id: fields.id[0] } }).then((affected_rows) => {
                if (affected_rows > 0) {
                    resolve({ "success": true, "id": fields.id[0], "error": "", "message": "Banner Ads updated successfully." });
                } else {
                    resolve({ "success": false, "error": "Failed to update Banner Ads! Please try again.", "message": "" });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
            });
        } else {
            resolve({ "success": false, "error": "Banner Ads name already exists!", "message": "" });
        }
    });
}

async function uploadFiles(id, content, action) {
    if (content != "") {
        var banner = await models.Banner.findOne({
            attributes: ["id", "content"],
            where: { id: id }
        });

        var filenameWithoutExt = content.originalFilename.substring(1, content.originalFilename.lastIndexOf('.')) || content.originalFilename;
        filenameWithoutExt = await utility.sanitizeString(filenameWithoutExt);
        const ext = content.originalFilename.split(".").pop();
        var filename = filenameWithoutExt + "-" + await utility.generateRandomString(4) + "." + ext;

        var isUploaded = await utility.uploadFiles(content.path, "banner", filename);
        if (isUploaded) {
            if (action == "update") await deleteFile(filename);
            await models.Banner.update({
                content: filename,
            }, { where: { id: id } });
        }
    }
}



/**
 * Delete category image from the server
 * @param {*} filename 
 */
async function deleteFile(filename) {
    //Delete if any existing file exists with different name
    if (filename != "") {
        try {
            fs.unlinkSync('./public/contents/banners/' + filename);
            console.log("File deleted successfully.");
        } catch (error) {
            console.log(error);
        }
    }
}
