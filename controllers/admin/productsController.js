/* const models = require('../../models');
const flash = require('connect-flash');
const Sequelize = require('sequelize');

const fs = require("fs");
require('dotenv').config(); */


/**
 * Get the list of the categoies
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */




exports.list = async (req, res) => {
    res.render("admin/product/list", {
        title: "dfsdfsdfsdfsdfs",
        //csrfToken: req.csrfToken(),
        /* errors: req.flash("errors"),
        loginerrors: "",
        messages: req.flash("message"),
        lmessages: req.flash("lmessage"), */
    });
}


exports.form = async (req, res) => {
    res.render("admin/product/form", {
        title: "dfsdfsdfsdfsdfs",
        //csrfToken: req.csrfToken(),
        /* errors: req.flash("errors"),
        loginerrors: "",
        messages: req.flash("message"),
        lmessages: req.flash("lmessage"), */
    });
}