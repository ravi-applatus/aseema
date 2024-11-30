const { check, validationResult } = require('express-validator');

exports.registrationValidation = [
    check('f_name')
    .trim()
    .notEmpty()
    .withMessage("First name is required!")
    .isLength({ min: 2, max: 20 })
    .withMessage('First name must be 2 to 20 characters!'),
    check('l_name')
    .trim()
    .notEmpty()
    .withMessage("Last name is required!")
    .isLength({ min: 2, max: 20 })
    .withMessage('Last name must be 2 to 20 characters!'),
    check('email')
    .trim()
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Please enter proper email id!")
    .normalizeEmail({ gmail_remove_dots: true })
]

exports.loginValidation = [
    check('email')
    .trim()
    .notEmpty()
    .withMessage("Email is required!")
    .isEmail()
    .withMessage("Please enter proper email id!")
    .normalizeEmail({ gmail_remove_dots: true }),
    check('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required!')
    .isLength({ min: 6 })
    .withMessage('Password must be 6 or more characters!')
]

exports.userVlidation = (req, res, next) => {
    const result = validationResult(req).array();
    if (!result.length) return next();

    const error = result[0].msg;
    res.status(400).send({ success: false, message: result });
};