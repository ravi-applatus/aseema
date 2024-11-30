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


exports.list = async (req, res) => {
    let dropdownSettingsList = await models.DropdownSettings.findAll({
        attributes: ['id', 'name', 'slug', 'status']
    })

    res.render("admin/settings/dropdown/list", {
        title: "Dropdown Settings List",
        //csrfToken: req.csrfToken(),
        dropdownSettingsList: dropdownSettingsList,
        errors: req.flash("errors"),
        loginerrors: "",
        messages: req.flash("message"),
        lmessages: req.flash("lmessage"),
    });
}
exports.options=async (req,res)=>{
    const selectedtittle_id = req.query.dropdownSettingId;
    var DropdownSettings = await models.DropdownSettings.findAll({
        attrbutes: ["id"],
        where: { id: selectedtittle_id },
    });
    if (!DropdownSettings) {
        return res.status(404).json({ error: 'DropdownSettings not found' });
    }
    var DropdownSettingsOptions = await models.DropdownSettingsOptions.findAll({
        where: { dropdownSettingId: selectedtittle_id },
        attributes: ['id', 'optionLabel','optionValue','optionOrder'],
    });
    res.json({ DropdownSettingsOptions});
}

exports.form = async (req, res) => {
    var id = req.params.id;
    var messages = req.flash('info').toString();
    var errors = req.flash('error').toString();
    if (!id) {
        return res.render("admin/settings/dropdown/form", {
            title: "Add Dropdown Settings",
            arrData: '',
            arrOption: '',
            errors: req.flash("errors"),
            loginerrors: "",
            messages: messages,
            errors: errors,
        });
    } else {
        var dropDownList = await models.DropdownSettings.findOne({
            attributes: ['id', 'name', 'slug', 'status'],
            where: { id: id },
        })

        if (dropDownList.id) {
            var dropDownOptionList = await models.DropdownSettingsOptions.findAll({
                attributes: ['id','dropdownSettingId', 'optionLabel', 'optionValue', 'optionOrder'],
                where: { dropdownSettingId: dropDownList.id }
            })
        }
        if (dropDownList) {
            return res.render('admin/settings/dropdown/form', {
                title: ' Edit Dropdown Settings',
                arrData: dropDownList,
                arrOption: dropDownOptionList,
                messages: messages,
                errors: errors,
            });
        }

    }
}


exports.saveOrUpdate = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {

        console.log("+++++++++++++++000----0000++++++++++++++++++++");
        console.log(fields);
        var id = parseInt(fields.id[0]);
        var resp = "";
        var action = "";
        if (id > 0) {
            action = "update";
            resp = await updateRecord(req, fields);
        }else{
            action = "create";
            resp = await createRecord(req, fields);
            if(resp.success) id = resp.id;
        }
        var type = "info";
        var message = resp.message;
        if(resp.error != "") {
            type = "error";
            message = resp.error;
        }

        req.flash(type, message);
        if(resp.success) return res.redirect('/admin/settings/dropdown-settings');
        return res.redirect('back');
    })
}


// function getDropdownById(id) {
//     return new Promise(async (resolve, reject) => {
//         if (id > 0) {  
//             let details = await models.DropdownSettings.findOne({
//                 attributes: ['id', 'name', 'slug', 'status'],
//                 where: { id: id },
//             })
//             if (details.id) {
//                 var option = await models.DropdownSettingsOptions.findOne({
//                     attributes: ['optionLabel', 'optionValue', 'optionOrder'],
//                     whare: { dropdownSettingId: details.id }
//                 })
//             }
//             let data= Object.assign(
//                 {
//                     id: details.id,
//                     name: details.name,
//                     slug: details.slug,
//                     status: details.status,
//                     options: option != '' ? option : {}
//                 }
//             )

//             resolve({ "data": data });


//         }
//         resolve(data);
//     });
// }

exports.delete = async function (req, res) {
    console.log("++++++++++++++++++++++++++++++++++++");
    console.log(req.body);
    var id = req.body.id;
    console.log("===============");
    console.log(id);
    if(id>0){
    await models.DropdownSettingsOptions.destroy({ where: { dropdownSettingId: id } });
    const deletedRowCount = await models.DropdownSettings.destroy({ where: { id: id } });
    if (deletedRowCount > 0) {
        req.flash('info', 'Successfully deleted');
        return res.status(200).send({ "success": true, "message": "Dropdown Settings deleted successfully!" });
    } else {
        req.flash('errors', 'Dropdown settings not found');
    }
    res.redirect('back');
}

};

async function createRecord(req, fields) {
    return new Promise(async (resolve, reject) => {
        var name = fields.name[0];
        var slug = fields.slug[0];
        var status = fields.status[0];
        var dropdownSettingsArrOptionValue = fields.optionValue;
        const isValidSlug = /^[a-zA-Z0-9\-]+$/.test(slug);
        if (!isValidSlug) {
            // ({ "success": false, "error": "slug not allow space.", "message": "" });
            resolve({ "success": false, "error": "slug not allow space and Special characters.", "message": "" });
        }else{
            if (name != '' && status != '' && slug != '') {
                try {
                    let existingSlug = await models.DropdownSettings.findOne({
                        where: { slug: slug }
                    });
                    if(existingSlug){
                        resolve({ success: false,  message: '', "error": "Slug already exists!" });
                    }else{
                        const dropdownSettings = await models.DropdownSettings.create({
                            name: name,
                            slug: slug,
                            status: status,
                            storeId: 1
                        });
        
                        if (dropdownSettingsArrOptionValue) {
                            for (let i = 0; i < dropdownSettingsArrOptionValue.length; i++) {
                                await models.DropdownSettingsOptions.create({
                                    dropdownSettingId: dropdownSettings.id,
                                    optionValue: fields.optionValue[i],
                                    optionLabel: fields.optionLabel[i],
                                    optionOrder: fields.optionOrder[i],
                                    storeId: 1
                                });
                            }
                        } else {
                            req.flash('info', 'Successfully Created');
                            resolve({ success: true, id: dropdownSettings.id, message: 'Successfully Created', error: '' });
                        }
                        req.flash('info', 'Successfully Created');
                        resolve({ success: true, id: dropdownSettings.id, message: 'Successfully Created', error: '' });  
                    }
                   
                } catch (error) {
                    console.error(error);
                    req.flash('errors', 'Something went wrong');
                    reject({ success: false, id: null, message: '', error: 'Something went wrong' });
                }
            } else {
                // Handle case where name or status is empty
                reject({ success: false, id: null, message: '', error: 'Name and status must not be empty' });
            }
        }
        
    });
}


async function updateRecord(req, fields) {
    try {
            models.DropdownSettings.update(
                {
                    name: fields.name[0],
                    status: fields.status[0],
                    storeId: 1
                },
                { where: { id: fields.id[0] } }
            ).then(async function(affected_rows) {
                const existing_options = await models.DropdownSettingsOptions.findAll({
                    attributes:[[Sequelize.fn('GROUP_CONCAT', Sequelize.literal('id')), 'ids']],
                    where: {dropdownSettingId: fields.id[0]}
                }).then(async (rows) => {
                    if(rows.length > 0) {
                        const H_option_row_id = fields.H_option_row_id;
                        const existing_ids = rows[0].get('ids').split(",");
                        
                        //create or update new or existing records
                        for (let i = 0; i < H_option_row_id.length; i++) {
                            if(H_option_row_id[i] != "") {
                                if(existing_ids.includes(H_option_row_id[i])) {
                                    await models.DropdownSettingsOptions.update({
                                        optionValue: fields.optionValue[i],
                                        optionLabel: fields.optionLabel[i],
                                        optionOrder: fields.optionOrder[i],
                                    }, {where:{id: H_option_row_id[i]}});
                                } 
                            } else {
                                await models.DropdownSettingsOptions.create({
                                    dropdownSettingId: fields.id[0],
                                    optionValue: fields.optionValue[i],
                                    optionLabel: fields.optionLabel[i],
                                    optionOrder: fields.optionOrder[i],
                                    storeId: 1
                                });
                            }
                        }
    
                        //Deletes extra rows from the table
                        for (let i = 0; i < existing_ids.length; i++) {
                            if(!H_option_row_id.includes(existing_ids[i])) {
                                await models.DropdownSettingsOptions.destroy({where:{id:existing_ids[i]}})
                            }
                        }
                    }
                }).catch((error) => {
                    console.log(error);
                });
            });
    
            req.flash('info', 'Successfully updated');
            return { success: true, message: 'Successfully updated', error: '' };
      
    } catch (error) {
        console.error(error);
        req.flash('errors', 'Something went wrong');
        return { success: false, message: '', error: 'Something went wrong' };
    }
}
