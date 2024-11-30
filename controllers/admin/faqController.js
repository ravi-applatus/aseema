var models = require('../../models');
var multiparty = require('multiparty');
const Sequelize = require("sequelize");
const Op = Sequelize.Op

exports.list = async (req, res) => {
    let faqslist = await models.Faqs.findAll({
        attributes: ['id', 'question', 'answer', 'status', 'sequence']
    })
    res.render("admin/pages/faqs/list", {
        title: "FAQS  list",
        errors: req.flash("errors"),
        faqslist: faqslist,
        loginerrors: "",
        messages: req.flash("message"),
        lmessages: req.flash("lmessage"),
    });
}


exports.form = async (req, res) => {
    var id = req.params.id;
    if (!id) {
        res.render("admin/pages/faqs/form", {
            title: "Create FAQ's",
            errors: req.flash("errors"),
            faqsData: '',
            loginerrors: "",
            messages: req.flash("message"),
            lmessages: req.flash("lmessage"),
        });
    } else {
        let faqsData = await models.Faqs.findOne({
            attributes: ['id', 'question', 'answer', 'status', 'sequence'],
            where: { id: id },
        })
        if (faqsData) {
            res.render("admin/pages/faqs/form", {
                title: "Update FAQ's",
                errors: req.flash("errors"),
                faqsData: faqsData,
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
         return res.redirect('/admin/faqs');
        // return res.redirect('back');
    })
}


exports.delete = async function (req, res) {
    console.log(req.body);
    var id = req.body.id;
    console.log(id);
    if (id > 0) {
        const faqsCount = await models.Faqs.destroy({ where: { id: id } });
        if (faqsCount > 0) {
            req.flash('info', 'Successfully deleted');
            return res.status(200).send({ "success": true, "message": "FAQ deleted successfully!" });
        } else {
            req.flash('errors', 'FAQ not found');
        }
        res.redirect('back');
    }

};

async function createRecord(req, fields) {
    return new Promise(async (resolve, reject) => {
        if (fields.question[0] != '' && fields.answer[0] != '') {
            await models.Faqs.create({
                question: fields.question[0],
                answer: fields.answer[0],
                status: fields.status[0],
                sequence: fields.sequence[0],
            }).then((data) => {
                if (data && data.id > 0) {
                    resolve({ "success": true, "id": data.id, "error": "", "message": "Faqs saved successfully." });
                } else {
                    resolve({ "success": false, "error": "Failed to create Faqs record! Please try again.", "message": "" });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
            });

        }
    })
}

async function updateRecord(req, fields) {
    console.log("ddddddddddbcdshgchds")
    return new Promise(async (resolve, reject) => {
        await models.Faqs.update({
            question: fields.question[0],
            answer: fields.answer[0],
            status: fields.status[0],
            sequence: fields.sequence[0],
        },
            { where: { id: fields.updateId[0] } }
        ).then((datas) => {
            console.log("4444444444444444");
            console.log(datas);
            if (datas && datas.id > 0) {
                resolve({ "success": true, "id": datas.id, "error": "", "message": "Faqs saved successfully." });
            } else {
                resolve({ "success": false, "error": "Failed to create Faqs record! Please try again.", "message": "" });
            }
        }).catch((error) => {
            console.log(error)
            resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
        });

    })
}