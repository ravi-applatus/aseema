const express = require('express');
var models = require('../../models');



exports.dashboard = async function (req, res) {
     res.render('admin/dashboard/dashboard', {
        title: 'Dashboard',
        messages: req.flash('info'),
        errors: req.flash('errors'),
    });
};
