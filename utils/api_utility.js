/** This is helper function where we can uoload fiels of every modules also file path will set where
 * Developer : NILMONI PATRA @Bluehorse
 */
const CryptoJS = require("crypto-js");
const fs = require("fs-extra");
const path = require('path');
const ds = path.sep;
const models = require('../models');
const moment = require('moment'); 
const Sequelize = require('sequelize');
const jwt = require("jsonwebtoken");
const { promises } = require("dns");
require('dotenv').config();

module.exports = {

  checkAuthentication: async function(token, client_id, user_id, module) {
    const promise1 = this.verifyToken(token);
    const promise2 = this.verifyClient(client_id);
    const promise3 = this.verifyPermission(client_id, user_id, module);
    return Promise.all([promise1, promise2, promise3]).then(async is_valid => {
      if(is_valid[0] && is_valid[1] && is_valid[2]) {
        return true;
      } else {
        if(!is_valid[0]) return "Invalid token!";
        else if(!is_valid[1]) return "Invalid client!";
        else return "Permission denied!";
      }
    });
  },


  /**
   * 
   * @returns 
   */
  verifyToken: async function(token) {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => { 
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



  verifyClient: async function(client_id) {
    return new Promise(async (resolve, reject) => {
        const client = await models.Client.findOne({attributes:["id"], where:{id: client_id}});
        if(client != null && client.id > 0) resolve(true);
        else resolve(false);
    });
  },



  verifyPermission: async function(client_id, user_id, module) {
    console.log(client_id +" ---- " + user_id + " ---- " + module);
    return new Promise(async (resolve, reject) => {
        models.Admin.findOne({
          attributes:["role_id"], 
          where:{id: user_id},
        }).then(async (data) => {
            if(data && data.role_id > 0) {
                await models.Permission.findOne({
                  attributes:["id"],
                  where:{name:module, client_id: client_id}
                }).then(async (permission_row) =>{
                  if(permission_row != null) {
                    await models.RoleHasPermission.findOne({
                      attributes:["role_id"],
                      where:{role_id: data.role_id, permission_id: permission_row.id},
                    }).then((rhp_rows) => {
                        if(rhp_rows != null) resolve(true);
                        else resolve(false);
                    }).catch((error) => {
                        console.log(error);
                        resolve(false);
                    });
                  } else {
                      resolve(false);
                  }
                }).catch((error) => {
                  console.log(error);
                  resolve(false);
              });
            }
        }).catch((error) => {
            console.log(error);
            resolve(false);
        });
    });
  },



  invalidAuthenticationMsg: async function(is_valid) {
    return new Promise(async (resolve, reject) => {
        if(!is_valid[0]) resolve("Invalid token!");
        else if(!is_valid[1]) resolve("Invalid client!");
        else resolve("Permission denied!");
    });
  },

};
