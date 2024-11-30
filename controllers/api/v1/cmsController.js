const models = require('../../../models');
var multiparty = require('multiparty');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const fs = require("fs");
require('dotenv').config();



exports.cmsDetails = async (req, res) => {
    const slug = req.body.slug;
    if (slug && slug != '' && slug != null) {
        let cms = await models.Cms.findAll({
            attributes: ['id', 'title', 'slug', 'short_description', 'status'],
            where: { slug: slug,status: 'enable' },
            order: [['id', 'DESC']],
        });
        let cmsDetails = [];
        for (var i = 0; i < cms.length; i++) {
            cmsDetails.push({
                "id": cms[i].id,
                "title": cms[i].title,
                "slug": cms[i].slug,
                "short_description": cms[i].short_description,
                "status": cms[i].status,
            });
        }

        if (cmsDetails.length > 0) {
            return res.status(200).send({
                data: {
                    success: true,
                    cmsDetails: cmsDetails
                },
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                data: {
                    success: false,
                    details: [],
                    message: "cms not found"
                },
                errorNode: {
                    errorCode: 1,
                    errorMsg: "cms not found"
                }
            });
        }
    }
}