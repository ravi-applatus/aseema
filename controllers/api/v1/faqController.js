const models = require('../../../models');
var multiparty = require('multiparty');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const fs = require("fs");
require('dotenv').config();



exports.faqList = async (req, res) => {
    let faqList = await models.Faqs.findAll({
        attributes: ["id", "sequence", "question", "answer", "status"],
        where: { status: 'yes' },
        order: [['id', 'DESC']]
    })
    let faqListArray = []
    if (faqList.length > 0) {
        for (var j = 0; j < faqList.length; j++) {
            faqListArray.push({
                "id": faqList[j].id,
                "sequence": faqList[j].sequence,
                "question": faqList[j].question,
                "answer": faqList[j].answer,
                "status": faqList[j].status,
            });
        }
    }
    if (faqListArray.length > 0) {
        return res.status(200).send({
            success: true,
            faqListArray: faqListArray,
            errorNode: {
                errorCode: 0,
                errorMsg: "No Error"
            }
        });
    } else {
        return res.status(200).send({
            success: false,
            list: [],
            message: "NO faq found",
            errorNode: {
                errorCode: 1,
                errorMsg: "NO faq found"
            }
        });
    }
}