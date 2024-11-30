const CryptoJS = require("crypto-js");
const fs = require("fs-extra");
const path = require('path');
const ds = path.sep;
const moment = require('moment');
const Sequelize = require('sequelize');
const jwt = require("jsonwebtoken");
const { promises } = require("dns");
require('dotenv').config();



class ApiError extends Error {
  constructor(msg, statusCode) {
    super(msg);

    this.statusCode = statusCode;
    this.error = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ApiError;






module.exports = {
  checkAuthentication: async function (token) {
    const promise = this.verifyToken(token);

    return Promise.all([promise]).then(async is_valid => {
      if (is_valid[0]) {
        return true;
      } else {
        if (!is_valid[0]) return "Invalid token!";
        else if (!is_valid[1]) return "Invalid client!";
        else return "Permission denied!";
      }
    });
  },

  verifyToken: async function (token) {
    return new Promise((resolve, reject) => {
      try {
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          resolve(true);
        });
      } catch (error) {
        console.log(error);
        resolve(false);
      }
    });
  },
}