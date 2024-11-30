var express = require('express');
var router = express.Router();
var authController = require('../controllers/admin/authController');
const passport = require('passport');
const { isNotAuthenticated } = require('../configs/passport-config');


// var expressValidator = require('express-validator');
// router.use(expressValidator());

router.get('/', function (req, res) {
  res.redirect("/admin/dashboard");
});

router.get('/signin', isNotAuthenticated, authController.signinview);

router.post(
  '/signin', 
  passport.authenticate('local', {
    failureRedirect: "/auth/signin",
    successRedirect: "/admin/dashboard",
  })
);

router.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy()   
  res.redirect('/auth/signin');
});


module.exports = router;
