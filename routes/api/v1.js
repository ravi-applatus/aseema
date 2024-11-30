const express = require('express');
const router = express.Router();
const middleware = require("../middleware/token");
const { registrationValidation, loginValidation, userVlidation } = require('../middleware/validations/auth');

// Import controller classes
const authController = require('../../controllers/api/v1/authController');
const subscriptionController = require('../../controllers/api/v1/subscriptionController');
const subscriptionListController = require('../../controllers/api/v1/subscriptionListController');
const myCollectionController = require('../../controllers/api/v1/myCollectionController')
const homeController = require('../../controllers/api/v1/homeController')
const articleCategoryController = require('../../controllers/api/v1/articleCategoryController')
const cmsController=require('../../controllers/api/v1/cmsController')
const contactSupportController=require('../../controllers/api/v1/contactSupportController')
const faqController=require('../../controllers/api/v1/faqController')


/*********************************** Auth *******************************/
//router.post('/auth/generateOtp', authController.generateOtp);
//router.post('/auth/verifyOtp', authController.verifyOtp);
// router.post('/auth/registration', middleware, registrationValidation, userVlidation, authController.registration);
router.post('/auth/registration', authController.registration);
router.post('/auth/login', authController.login);
router.post('/auth/forgotPassword', authController.forgotPassword);
router.post('/auth/logout', authController.logout);


/*********************************** sbsription API *******************************/

router.post('/user/subscription', subscriptionController.subscription);


router.get('/subscription-list', subscriptionListController.subscriptionList);


router.post('/collecton-add', myCollectionController.myCollectonadd);
router.get('/collecton-list', myCollectionController.myCollectonList);
router.post('/delete', myCollectionController.myCollectonDelete);

//*** home routes start ***/
router.post('/home/banner-list', homeController.bannerList);
router.post('/home/customer-profile', homeController.customerProfile);
router.post('/home/customer-profile-update', homeController.customerProfileUpdate);
router.post('/home/profile-image-update', homeController.profileImageUpdate);
//*** home routes end ***/
//*** home product routes  ***/
router.post('/home', homeController.homeProductList);


//*** article routes  ***/
router.post('/article/category', articleCategoryController.category);
router.post('/article/product-list', articleCategoryController.productList);
router.post('/article/product-details', articleCategoryController.product);
//*** emagazine routes  ***/
router.post('/emagazine/product-list', articleCategoryController.emegazineProduct);
router.post('/emagazine/product-details', articleCategoryController.emegazineProductDetails);
//*** news routes end ***/
router.post('/news/product-list', articleCategoryController.newsProductList);
router.post('/news/product-details', articleCategoryController.newsProductDetails);

router.post('/cms-details', cmsController.cmsDetails);

router.get('/speech', articleCategoryController.audioSpeech);

router.post('/product/search-product', articleCategoryController.searchProduct);
router.post('/contact-support', contactSupportController.contactSupport);

router.post('/faq-list', faqController.faqList);
module.exports = router;