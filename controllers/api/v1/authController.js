require('dotenv').config({ path: '.env' });
const token = require("../../../utils/token");
const db = require("../../../configs/db.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require("../../../configs/logger");
//const logger = require("../../../config/logger");
const models = require("../../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const SECRET = process.env.JWT_SECRET_KEY;
const path = require('path');
const api_key = ;

require('dotenv').config();

// Verify the OTP entered by the user during login and registration
// API Endpoint: /verifyOtp
// Method: POST
exports.registration1 = async function (req, res, next) {

    //console.log(await token.generateJWTToken(null));
    logger.info("Registration API called!");
    logger.info("test message with date parameter %s", new Date());
    logger.error(e.stack)
    res.status(200).send({ user: req.body })

    //const { mobile, otp } = req.body;
    /* if(mobile != '' && otp != '') {
        var qry = "SELECT * FROM otps WHERE mobile='" + mobile + "' and otp='" + otp + "'";
        console.log(qry)

        db.query(qry).then(async([results]) => {
            if (results.length > 0) {
                qry = "DELETE FROM otps WHERE mobile='" + mobile + "'";
                await db.query(qry).then((results) => {
                    //DO nothing
                }).catch(function(error){
                    logger.error(error.message)
                    return res.status(200).send({success:false, error:error.message, message:"Something wrong! Please try again"});
                });

                const profile_pic_path = "'"+process.env.FULL_BACKEND_URL+"/contents/users/'";
                qry = "SELECT *, CONCAT("+profile_pic_path+", token, '/' , profile_pic) AS profile_pic FROM users WHERE mobile='" + mobile + "'";
                await db.query(qry).then(async([user]) => {
                    var redirectto = "";
                    if(user.length == 1) {
                        const access_token = await createAccessToken(user[0]);
                        qry = "UPDATE users SET access_token='"+access_token+"' WHERE user_id="+user[0].user_id+" AND mobile='" + user[0].mobile + "'";
                        await db.query(qry).then(async([results]) => { 
                            if(user[0].name == "" || user[0].name == null) {
                                redirectto = "profile";
                                res.status(200).send({success:true, user: user[0], redirectto: redirectto, access_token: access_token, access_token_expires_in: process.env.EXPIRES_IN});
                            } else {
                                res.status(200).send({success:true, user: user[0], access_token: access_token, access_token_expires_in: process.env.EXPIRES_IN});
                            }
                        }).catch(function(err) {
                            logger.error(err.message);
                            return res.status(200).send({success:false, error:err.message});
                        });
                    } else {
                        res.status(200).send({success:false, message:"User not found!"});
                    }
                }).catch(function(err) {
                    logger.error(err.message);
                    return res.status(200).send({success:false, error:err.message});
                });
            } else {
                logger.info("OTP not matched!");
                return res.status(200).send({success:false, message:"OTP not matched!"});
            }
        }).catch(function(err){
            logger.error(error.message)
            return res.status(200).send({success:false, error:error.message, message:"Something wrong! Please try again"});
        });
    } else {
        res.status(200).send({success:false, message:"Mobile & OTP both are required!"});
    } */
}

exports.registration = async function (req, res, next) {
    const firstName = req.body.firstName || "";
    const lastName = req.body.lastName || "";
    const email = req.body.email || "";
    const password = req.body.password || "";
    const confirmPassword = req.body.confirmPassword || "";
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        return res.status(200).send({ success: false, message: "All fields are required!", errorNode: { errorCode: 1, errorMsg: "All fields are required!" } });
    } else {
        const existingEmail = await models.Customers.findOne({
            where: { email: email }
        });
        if (existingEmail) {
            return res.status(200).send({ success: false, message: "Email already exists!", errorNode: { errorCode: 1, errorMsg: "Email already exists!" } });
        } else {
            if (password !== confirmPassword) {
                return res.status(200).send({ success: false, message: "Passwords not match", errorNode: { errorCode: 1, errorMsg: "Passwords not match!" } });

            } else {
                const hashedPassword = await bcrypt.hashSync(password, 10);
                await models.Customers.create({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: hashedPassword,
                }).then((data) => {
                    if (data && data.id > 0) {
                        return res.status(200).send({ success: true, data: data, message: "User registered successfully.", errorNode: { errorCode: 0, errorMsg: "No error" } });
                    } else {
                        return res.status(200).send({ success: false, message: "Registration failed.", errorNode: { errorCode: 1, errorMsg: err } });
                    }
                })
            }
        }
    }
}


exports.login = async (req, res) => {
    const email = req.body.email || null;
    const password = req.body.password || null;
    try {
        if (!email || !password) {
            return res.status(200).send({ success: false, message: "Email and Password are required!", errorNode: { errorCode: 1, errorMsg: "Email and Password are required!" } });
        } else {
            const count = await models.Customers.findOne({ where: { email: email } });
            if (count) {
                const users = await models.Customers.findOne({ where: { email: email } });
                // const hashPassword = bcrypt.hashSync(password, 10);
                if (bcrypt.compareSync(password, users.password)) {
                    const payload = {
                        id: users.id,
                        firstName: users.firstName,
                        lastName: users.lastName,
                        email: users.email,
                    };
                    const token = jwt.sign(payload, SECRET, { expiresIn: 18000 });
                    const details = {
                        id: users.id,
                        firstName: users.firstName,
                        lastName: users.lastName,
                        email: users.email,
                        mobile: users.mobile,
                        createdAt: users.createdAt,
                        token: token,
                    };

                    return res.status(200).send({ success: true, details: details, message: "User Login successfully", errorNode: { errorCode: 0, errorMsg: "No error" } });
                } else {
                    return res.status(200).send({ success: false, details: {}, message: "Username or password is incorrect", errorNode: { errorCode: 1, errorMsg: "Username or password not match" } });
                }
            } else {
                return res.status(200).send({ success: false, details: {}, message: "User or password not exist", errorNode: { errorCode: 1, errorMsg: "User or password not exist" } });
            }
        }

    } catch (error) {
        console.log(error);
        return res.status(200).send({ success: false, message: "Something went wrong", errorNode: { errorCode: 1, errorMsg: error } });
    }
};

// otp base forgotpassword
exports.forgotPassword1 = async (req, res) => {
    const email = req.body.email || "";
    if (!email) {
        return res.status(200).send({ data: { success: false, message: "Email id is required" }, errorNode: { errorCode: 1, errorMsg: "Contact Number no is required" } });
    } else {
        const count = await models.Customers.count({ where: { email: email } });
        if (count > 0) {
            const otp = Math.floor(1000 + Math.random() * 9000);
            await models.Customers.update({ otp: otp }, { where: { email: email } }).then(async () => {
                const users = await models.Customers.findOne({ where: { email: email } });
                const details = { id: users.id, email: email, otp: otp };
                return res.status(200).send({ data: { success: true, details: details }, errorNode: { errorCode: 0, errorMsg: "No error" } });
            }).catch((err) => {
                return res.status(200).send({ data: { success: false, message: "Somethng went wrong , please try again later" }, errorNode: { errorCode: 1, errorMsg: err } });
            });
        } else {
            return res.status(200).send({ data: { success: false, message: "This Email is not registered" }, errorNode: { errorCode: 1, errorMsg: "This Email is not registered" } });
        }
    }
}


exports.forgotPassword = async (req, res) => {
    const email = req.body.email || "";
    if (!email) {
        return res.status(400).send({
            data: { success: false, message: "Email id is required" },
            errorNode: { errorCode: 1, errorMsg: "Email id is required" }
        });
    } else {
        const user = await models.Customers.findOne({ where: { email: email } });
        if (user) {
            var SibApiV3Sdk = require('sib-api-v3-sdk');
            SibApiV3Sdk.ApiClient.instance.authentications['api-key'];
            let defaultClient = SibApiV3Sdk.ApiClient.instance;
            
            let apiKey = defaultClient.authentications['api-key'];
            apiKey.apiKey = api_key
            const resetLink = `xyz.com`;

            let mailOptions = new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
                'sender': { 'email': 'kumareshsasmal.bluehorse@gmail.com', 'name': 'Forgot Password' },
                'to': [{ 'email': req.body.email}],
                'subject': "Magazine Team",
                'htmlContent':`Click the following link to reset your password: ${resetLink}`,
            });
            mailOptions.then(data => {
                console.log(data, "Email Successfully send");
                return res.status(200).send({ data: { success: true,message: "Email Successfully send" }, errorNode: { errorCode: 0, errorMsg: "No error" } });
            });
        } else {
            return res.status(404).send({ data: { success: false, message: "This Email is not registered" },errorNode: { errorCode: 1, errorMsg: "This Email is not registered" }
            });
        }
    }
}



exports.logout = async (req, res) => {
    const id = req.body.id || null;
    const userCheck = await models.Customers.count({ where: { id: id } });
    if (userCheck > 0) {
        let userBearerToken = await models.Customers.update({ bearerToken: null }, { where: { id: id } });
        if (userBearerToken) {
            return res.status(200).send({ data: { success: true, message: "User Successfully Logout", }, errorNode: { errorCode: 0, errorMsg: "No error", } });
        } else {
            return res.status(200).send({ data: { success: false, message: "User Unable to Logout" }, errorNode: { errorCode: 1, errorMsg: "Something Error Occured" } });
        }
    } else {
        return res.status(200).send({ data: { success: false, message: "This User is not registered" }, errorNode: { errorCode: 1, errorMsg: "This User is not registered" } });
    }
}
