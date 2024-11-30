var express = require('express');
var router = express.Router();
var models = require("../models");
var dashboardController = require('../controllers/admin/dashboardController')
var categoryController = require('../controllers/admin/categoryController');
var subscriptionController = require('../controllers/admin/subscriptionController');
var customerController = require('../controllers/admin/customerController');
var productController = require('../controllers/admin/productController');
var dropdownSettingsController = require('../controllers/admin/dropdownSettingsController');
var bannerController = require('../controllers/admin/bannerController');
var faqController = require('../controllers/admin/faqController')
var cmsController = require('../controllers/admin/cmsController');
var contactUsController = require('../controllers/admin/contactUsController');
var orderController = require('../controllers/admin/orderController');
const { isAuthenticated } = require('../configs/passport-config');
// const bannerGroup = require('../models/bannerGroup');
const upload = require("../middlewares/fileUpload");


router.get('/', function (req, res) {
    res.redirect("/auth/signin");
});


function middleHandler(req, res, next) {
    models.Admin.findOne({ where: { email: req.session.user.email } }).then(async function (user) {
        if (user) {

            res.locals.name = user ? user.name : "";
            // res.locals.username = user ? user.username : "";
            res.locals.email = user ? user.email : "";
            res.locals.mobile = user ? user.mobile : "";

            res.locals.image = user ? user.image : "";


            console.log("++++++++++++++++++++++++++++++++");
            console.log(req.session.user);
            console.log("++++++++++++++++++++++++++++++");

            res.locals.user = user;
            next();
        } else {
            req.session.destroy();
            req.logout();
            res.redirect('/auth/signin');
        }
    });
}

router.get("/logout", function (req, res) {
    // req.logout();
    req.session.destroy();
    return res.redirect("/auth/signin");
  });
//router.get('/dashboard', checkAuthentication, middleHandler, dashboardController.dashboard);
router.get('/dashboard', isAuthenticated, dashboardController.dashboard);


/************************ settings *******************/
router.get('/settings/dropdown-settings', isAuthenticated, dropdownSettingsController.list);
router.get('/settings/dropdown-settings/form', isAuthenticated, dropdownSettingsController.form);
router.get('/settings/dropdown-settings-options', isAuthenticated, dropdownSettingsController.options);
//  router.get('/settings/category/list', isAuthenticated, dropdownSettingsController.list);
router.get('/settings/dropdown-settings/form', isAuthenticated, dropdownSettingsController.form);
router.get('/settings/dropdown-settings/form/:id?', isAuthenticated, dropdownSettingsController.form);
router.post('/settings/dropdown-settings/form', isAuthenticated, dropdownSettingsController.saveOrUpdate);
router.post('/settings/dropdown-settings/delete', isAuthenticated, dropdownSettingsController.delete);
/************************ Settings *******************/


/************************ category *******************/
router.get('/settings/category', isAuthenticated, categoryController.list);
router.get('/settings/category/list/:page', isAuthenticated, categoryController.list);
router.get('/settings/category/form', isAuthenticated, categoryController.form);
router.get('/settings/category/form/:id', isAuthenticated, categoryController.form);
router.post('/settings/category/form', isAuthenticated, categoryController.saveOrUpdate);
router.post('/settings/category/form/:id', isAuthenticated, categoryController.saveOrUpdate);
router.post('/settings/category/delete', isAuthenticated, categoryController.delete);

/************************ category *******************/

/************************ banneradds *******************/
router.get('/settings/banner', isAuthenticated, bannerController.list);
router.get('/settings/banner/list/:page', isAuthenticated, bannerController.list);
router.get('/settings/banner/form', isAuthenticated, bannerController.form);
router.get('/settings/banner/form/:id', isAuthenticated, bannerController.form);
router.post('/settings/banner/form', isAuthenticated, bannerController.saveOrUpdate);
// router.post('/settings/banner/form/:id', isAuthenticated, bannerController.saveOrUpdate);
router.post('/settings/banner/delete', isAuthenticated, bannerController.delete);


/************************ subscription *******************/
router.get('/settings/subscription', isAuthenticated, subscriptionController.list);
router.get('/settings/subscription/list', isAuthenticated, subscriptionController.list);
router.get('/settings/subscription/details', isAuthenticated, subscriptionController.details);
router.post('/settings/subscription/form', isAuthenticated, subscriptionController.saveOrUpdate);
router.post('/settings/subscription/delete', isAuthenticated, subscriptionController.delete);



/************************ product *******************/
// router.get('/product/:page', isAuthenticated, productController.list);
router.get('/product', isAuthenticated, productController.list);
router.get('/product/list', isAuthenticated, productController.list);
router.get('/product/list/:page', isAuthenticated, productController.list);
//  router.get('/product/list/:?type', isAuthenticated, productController.list);
router.get('/product/form', isAuthenticated, productController.form);
router.get('/product/get-category', isAuthenticated, productController.getCategory);
router.post('/product/form', isAuthenticated, productController.saveOrUpdate);
router.get('/product/form/:id?', isAuthenticated, productController.form);
router.post('/product/add-ckeditor-image', upload.single('upload'), (req, res) => {
    const imageUrl = `${req.app.locals.baseurl}/admin/products/${req.file.filename}`;
    res.status(200).send("<script>window.parent.CKEDITOR.tools.callFunction('" + req.query.CKEditorFuncNum + "','" + imageUrl + "');</script>");
});

/************************ subscription *******************/
router.get('/faqs', isAuthenticated, faqController.list);
router.get('/faqs/form', isAuthenticated, faqController.form);
router.post('/faqs/form', isAuthenticated, faqController.saveOrUpdate);
router.get('/faqs/form/:id?', isAuthenticated, faqController.form);
router.post('/faqs/delete', isAuthenticated, faqController.delete);



/************************ cms *******************/
router.get('/cms', isAuthenticated, cmsController.list);
// router.get('/cms/list', isAuthenticated, cmsController.list);
router.get('/cms/form', isAuthenticated, cmsController.form);
router.get('/cms/form/:id', isAuthenticated, cmsController.form);
router.post('/cms/form', isAuthenticated, cmsController.saveOrUpdate);
// router.post('/cms/form/:id', isAuthenticated, cmsController.saveOrUpdate);
router.get('/cms/description', isAuthenticated, cmsController.description);
router.post('/cms/delete', isAuthenticated, cmsController.delete);


/************************ Contact_Us *******************/
router.get('/contact-us/:page', isAuthenticated, contactUsController.list);
router.get('/contact-us', isAuthenticated, contactUsController.list);
router.post('/contact-us/form', isAuthenticated, contactUsController.saveOrUpdate);
router.post('/contact-us/delete', isAuthenticated, contactUsController.delete);
// router.get('/contact-us/searchContact', isAuthenticated, contactUsController.searchContact);



/************************ customers *******************/
router.get('/customers/list/:page', isAuthenticated, customerController.list);
// router.get('/customers/list', isAuthenticated, customerController.list);
// router.get('/customers/form', isAuthenticated, customerController.form);
router.get('/customers/form/:id?', isAuthenticated, customerController.form);
router.post('/customers/form/:id?', isAuthenticated, customerController.saveOrUpdate);
router.post('/customers/delete', isAuthenticated, customerController.delete);




/************************ order *******************/
router.get('/orders/list/:page', isAuthenticated, orderController.list);
// router.get('/orders/list', isAuthenticated, orderController.list);
// router.get('/orders/form', isAuthenticated, orderController.form);
router.get('/orders/form/:id?', isAuthenticated, orderController.form);
router.post('/orders/form/:id?', isAuthenticated, orderController.saveOrUpdate);
router.get('/orders/customerSubscription', orderController.getCustomerDetails);


/************************ order *******************/

module.exports = router;