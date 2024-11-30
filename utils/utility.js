/** This is helper function where we can uoload fiels of every modules also file path will set where
 * Developer : NILMONI PATRA @Bluehorse
 */
const fs = require("fs-extra");
const path = require('path');
const ds = path.sep;
const models = require('../models');
const moment = require('moment');
const Sequelize = require('sequelize');

module.exports = {

  /**
   * getCurrentYear returns the current year only like 2022,2023 etc
   * @returns 
   */
  getCurrentYear: async function () {
    const d = new Date();
    let year = d.getFullYear();
    return year;
  },
 

  /**
   * Create folder
  */
  createDirectory: function (folder_path) {
    var str = __dirname;
    var n = str.lastIndexOf('\\');
    var path = str.substring(0, n + 1);
    var dir = path + folder_path;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  },
/** Recomended Product image file upload start here  */
uploadAudioFiles: async function (temp_path, target_path) {
  return new Promise((resolve, reject) => {
    // Create a read stream from the temporary file
    const readStream = fs.createReadStream(temp_path);

    // Create a write stream to the target file path
    const writeStream = fs.createWriteStream(target_path);

    // Pipe the read stream to the write stream to perform the upload
    readStream.pipe(writeStream);

    // Set up event listeners to handle successful upload or errors
    readStream.on('end', () => {
        // Remove the temporary file after successful upload
        fs.unlinkSync(temp_path);
        resolve();
    });

    readStream.on('error', (err) => {
        // Handle upload errors
        reject(err);
    });
});
},
/** recomended product image file upload end here  */

  /** Recomended Product image file upload start here  */
  uploadthumbnailImageFiles: async function (temp_path, target_path) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds+ "contents" +ds+ "product" +ds+ target_path;
    var result = await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (!err) {
          resolve("yes");
        } else {
          reject("NO");
        }
      });
    });
    return result;
  },
/** recomended product image file upload end here  */

/** Recomended Product pdf file upload start here  */
uploadthumbnailPDFFiles: async function (temp_path, target_path) {
  var str = __dirname;
  var n = str.lastIndexOf("\\");
  var path = str.substring(0, n + 1);
  var new_location = path + "public" + ds + "admin" + ds+ "contents" +ds+ "product" +ds+ "pdf" +ds+ target_path;
  var result = await new Promise((resolve, reject) => {
    fs.copy(temp_path, new_location, function (err, res) {
      if (!err) {
        resolve("yes");
      } else {
        reject("NO");
      }
    });
  });
  return result;
},
/** recomended product pdf file upload end here  */

  /**
   * This function returns the base path of this js file
   */
  getBasePath: function () {
    var str = __dirname;
    var n = str.lastIndexOf('\\');
    var path = str.substring(0, n + 1);
    return path;
  },


  /**
   * Admin file upload start here
   * also check the file is present in folder or not
  */
  uploadFiles: async function (temp_path, directory, filename) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "admin" + ds + directory + ds + filename;
    console.log(new_location);
    return new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, err => {
        if (!err) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  },



  /**
   * upload any doument to any path
   * also check the file is present in folder or not
  */
  uploadDocument: async function (temp_path, filename, type) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "uploads" + ds + "dp" + ds + type + ds + filename;
    await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
    //return result;
  },



  /**
   * Admin file upload start here
   * also check the file is present in folder or not
  */
  uploadDP: async function (temp_path, filename, type) {
    var str = __dirname;
    var n = str.lastIndexOf("\\");
    var path = str.substring(0, n + 1);
    var new_location = path + "public" + ds + "uploads" + ds + "dp" + ds + type + ds + filename;
    await new Promise((resolve, reject) => {
      fs.copy(temp_path, new_location, function (err, res) {
        if (err) {
          reject(false);
        } else {
          resolve(true);
        }
      });
    });
    //return result;
  },



  /**
   * getDP() returns the blank user image if dp is not present otherwse the actual dp
   * @param {*} dp 
   * @returns 
   */
  getDP: function (dp) {
    if (dp == null || dp == "") {
      dp = process.env.BACKEND_URL + ":" + process.env.PORT + "/" + process.env.BLANK_USER_IMAGE;
    } else {
      dp = process.env.BACKEND_URL + ":" + process.env.PORT + "/" + "uploads/dp/swimmer/" + dp;
    }
    return dp;
  },


  /**
   * isFileExistsIn checks if the file is exists or not in folder
   * @param {*} filename 
   * @returns 
   */
  isFileExistsIn: function (filename) {
    const directoryPath = this.getBasePath() + "public" + ds + "admin" + ds + "contents" + ds + filename;
    if (fs.existsSync(directoryPath)) return true;
    else return false;
  },
  /**
   * Admin file upload ends here
  */




  generateRandomString: async function (strLen) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < strLen; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  },


  /**
  * Splits the fullname and prepare/sanitize the fullname fname, mname and lname
  * @param {*} fullname 
  * @returns 
  */
  prepareName: async function (fullname) {
    nameArr = [];
    fullname = fullname.toLowerCase().split(" ");
    var len = fullname.length;

    var fname = fullname[0].trim();
    fname = fname.charAt(0).toUpperCase() + fname.slice(1);
    nameArr["fname"] = fname;

    if (len > 1) {
      var lname = fullname[len - 1].trim();
      lname = lname.charAt(0).toUpperCase() + lname.slice(1);
      nameArr["lname"] = lname;
    } else {
      nameArr["lname"] = "";
    }

    if (len > 2) {
      var middleName = [];
      for (var i = 1; i < len - 1; i++) {
        var mname = fullname[i].trim();
        mname = mname.charAt(0).toUpperCase() + mname.slice(1);
        middleName.push(mname);
      }
      nameArr["mname"] = middleName.join(" ");
    } else {
      nameArr["mname"] = "";
    }

    nameArr["fullname"] = nameArr["fname"] + " " + (nameArr["mname"] != "" ? nameArr["mname"] + " " : "") + nameArr["lname"]

    return nameArr;
  },


  /**
   * sanitizeString sanitizes the string
   * @param {*} str 
   * @returns 
   */
  sanitizeString: async function (str) {
    str = str.replace(/[^a-zA-Z0-9 ]/g, ''); //Removes all special characters
    str = str.replace(/\s+/g, '-');  //Replaces all spaces with hyphen (-)
    str = str.toLowerCase();
    return str;
  },


  /**
   * removeFile removes the file from folder
   * @param {*} filename 
   */
  removeFile: async function (filename) {
    if (filename != "") {
      var str = __dirname;
      var n = str.lastIndexOf('\\');
      var path = str.substring(0, n + 1);
      fs.unlink(path + filename);
    }
  },


  /**
   * calculateAge calculates and returns the age in year and month
   */
  calculateAge: function (dob) {
    if (dob != "" && dob !== undefined && dob != null) {
      var dobArr = dob.split("-");
      var d1 = dobArr[2];
      var m1 = dobArr[1];
      var y1 = dobArr[0];

      var date = new Date();
      var d2 = date.getDate();
      var m2 = 1 + date.getMonth();
      var y2 = date.getFullYear();
      var month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      if (d1 > d2) {
        d2 = d2 + month[m2 - 1];
        m2 = m2 - 1;
      }

      if (m1 > m2) {
        m2 = m2 + 12;
        y2 = y2 - 1;
      }

      var d = d2 - d1;
      var m = m2 - m1;
      if (m < 10) m = "0" + m;
      var y = y2 - y1;
      if (y < 10) y = "0" + y;

      const age = y + " year " + m + " month";
      return age;
    } else {
      return "";
    }

    //document.getElementById('age').innerHTML = 'Your Age is '+y+' Years '+m+' Months '+d+' Days';
  },


  /**
 * calculateAge calculates and returns the age in year and month
 */
  checkAgeValidity: function (dob, age_limit) {

    if (age_limit == "" || age_limit == 0) return true;

    if (dob != "" && dob !== undefined && dob != null) {
      var dobArr = dob.split("-");
      var d1 = dobArr[2];
      var m1 = dobArr[1];
      var y1 = dobArr[0];

      var date = new Date();
      var d2 = date.getDate();
      var m2 = 1 + date.getMonth();
      var y2 = date.getFullYear();
      var month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

      if (d1 > d2) {
        d2 = d2 + month[m2 - 1];
        m2 = m2 - 1;
      }

      if (m1 > m2) {
        m2 = m2 + 12;
        y2 = y2 - 1;
      }

      var d = d2 - d1;
      var m = m2 - m1;
      //if(m<10) m = "0"+m;
      var y = y2 - y1;
      //if(y<10) y = "0"+y;

      //const age = y + " year " + m + " month";
      const age_in_months = (y * 12) + m;
      const age_limit_in_months = age_limit * 12;
      const diff = age_limit_in_months - age_in_months;
      console.log(y + "  ==========  " + m + "  ==============  " + age_in_months + "  ======  " + age_limit_in_months);
      console.log("DIFF================================>>>>" + diff)
      if (diff >= 12) return true;
      else return false;
    } else {
      return false;
    }

    //document.getElementById('age').innerHTML = 'Your Age is '+y+' Years '+m+' Months '+d+' Days';
  },



  checkGenderAndAgeChecking: async function (membershipFor, sex, dob) {
    for (let i = 0; i < membershipFor.length; i++) {
      //if(membershipFor[i]. == sex)
      console.log("==================================")
      console.log(membershipFor[i]);
      console.log(membershipFor[i].key + "   ======   " + membershipFor[i].value);
      console.log("Sex   ======   " + sex);
      console.log("==================================")

      if (membershipFor[i].key.toLowerCase() == sex.toLowerCase() && membershipFor[i].value == true) {
        const isAgeOk = this.checkAgeValidity(dob, membershipFor[i].age_limit);
        if (isAgeOk) return true;
        else return false;
      } /* else {
          return false;
        } */
    }

    return false;
  },



  /**
   * getTimeDifference calculates difference between two times
   * @param {*} time1 
   * @param {*} time2 
   * @returns 
   */
  getTimeDifference: function (time1, time2) {
    time1 = new Date(time1);
    if (time2 == "") {
      time2 = new Date();
    } else {
      time2 = new Date(time2);
    }

    const diff = time2 - time1;
    return diff;
  },


  /**
   * jsonParse parse the json data
   * @param {*} data 
   * @returns 
   */
  jsonParse: function (data) {
    return JSON.parse(JSON.stringify(data));
  },



  stringToIntArray: async function (str) {
    var intArr = [];
    const elements = str.split(",");
    for (let i = 0; i < elements.length; i++) {
      intArr.push(parseInt(elements[i].trim()));
    }

    return intArr;
  },



  getSwimmingFee: function (person, session, summer_fee, regular_fee) {
    //return new Promise(async (resolve, reject) => {
    let fees = "";
    if (session == "Summer") {
      fees = summer_fee.filter(function (el) {
        return el.key == person;
      });
    } else {
      fees = regular_fee.filter(function (el) {
        return el.key == person;
      });
    }
    return fees[0].value;
    //resolve(fees[0].value);
    //});
  },




  checkFormAvailability: async function (category_id) {
    return new Promise(async (resolve, reject) => {
      if (category_id != "") {
        const year_session = await this.getCurrentSession();
        models.SwimmingForm.findOne({
          attributes: ["form_released", "form_available_from", "form_available_upto"],
          where: { year: year_session.year, session_id: year_session.session, category_id: category_id, status: "1" },
        }).then(async (data) => {
          const isValid = await this.checkValidDateTime(data.form_available_from, data.form_available_upto);
          if (isValid) {
            const form_available = await this.checkIfFormAvailable(category_id, data.form_released);
            if (form_available > 0) resolve(true);
            else resolve(false);
          } else {
            resolve(false);
          }
        }).catch((error) => {
          console.log(error);
          reject(false);
        });
      } else {
        reject(false);
      }
    });
  },



  checkValidDateTime: async function (start_time, end_time) {
    //start_time = "2022-07-01 10:10";
    //end_time = "2022-07-10 10:10";
    var start = new Date(start_time);
    var end = new Date(end_time);
    var m = new Date();
    var current_date_time = m.getFullYear() + "-" + (m.getMonth() + 1) + "-" + m.getDate() + " " + m.getHours() + ":" + m.getMinutes() + ":" + m.getSeconds();

    start_time = start.getFullYear() + "-" + (start.getMonth() + 1) + "-" + start.getDate() + " " + start.getHours() + ":" + start.getMinutes() + ":" + start.getSeconds();
    end_time = end.getFullYear() + "-" + (end.getMonth() + 1) + "-" + end.getDate() + " " + end.getHours() + ":" + end.getMinutes() + ":" + end.getSeconds();


    if ((moment(current_date_time, 'YYYY-MM-DD HH:mm').isSame(start_time) || moment(current_date_time, 'YYYY-MM-DD HH:mm').isAfter(start_time)) &&
      (moment(current_date_time, 'YYYY-MM-DD HH:mm').isSame(end_time) || moment(current_date_time, 'YYYY-MM-DD HH:mm').isBefore(end_time))) {
      return true;
    } else {
      return false;
    }
  },



  /**
   * checkIfFormAvailable() returns the number of availavle forms of a particular category
   * @param {*} category_id 
   * @param {*} form_released 
   * @returns 
   */
  checkIfFormAvailable: async function (category_id, form_released) {
    return new Promise(async (resolve, reject) => {
      if (category_id != "") {
        const year_session = await this.getCurrentSession();
        models.SwimmerDetails.count({
          where: {
            year: year_session.year,
            session_id: year_session.session,
            category_id: category_id,
            apply_status: {
              [Sequelize.Op.or]: ['a', 'ur', 'ic']
            }
          }
        }).then((occupied) => {
          const form_available = form_released - occupied;
          resolve(form_available);
        }).catch((error) => {
          console.log(error);
          reject(0);
        });
      } else {
        reject(0);
      }
    });
  },




  getDiseaseList: async function (ids) {
    return new Promise(async (resolve, reject) => {
      var list = [];
      if (ids != "" && ids != null) {
        var idArr = ids.split(",");
        for (var i = 0; i < idArr.length; i++) {
          await models.Disease.findOne({
            attributes: ["id", "title"],
            where: {
              id: [idArr[i]]
            },
          }).then((data) => {
            if (data) {
              list.push({ "id": data.id, "title": data.title });
            }
          }).catch((error) => {
            console.log(error);
          });
        }
      }
      resolve(list);
    });
  },





  getMedicineList: async function (ids) {
    return new Promise(async (resolve, reject) => {
      var list = [];
      if (ids != "" && ids != null) {
        var idArr = ids.split(",");
        for (var i = 0; i < idArr.length; i++) {
          await models.Medicine.findOne({
            attributes: ["id", "title"],
            where: {
              id: [idArr[i]]
            },
          }).then((data) => {
            if (data) {
              list.push({ "id": data.id, "title": data.title });
            }
          }).catch((error) => {
            console.log(error);
          });
        }
      }
      resolve(list);
    });
  },



  getSlotList: async function (ids) {
    return new Promise(async (resolve, reject) => {
      var list = [];
      if (ids != "" && ids != null) {
        var idArr = ids.split(",");
        for (var i = 0; i < idArr.length; i++) {
          await models.Slot.findOne({
            where: {
              id: [idArr[i]]
            },
          }).then((data) => {
            if (data) {
              list.push({ "id": data.id, "title": data.title });
            }
          }).catch((error) => {
            console.log(error);
          });
        }
      }
      resolve(list);
    });
  },





  paddingZeros: function (number) {
    //return new Promise((resolve, reject) => {
    if (number < 10) {
      number = "000" + number;
    } else if (number < 100) {
      number = "00" + number;
    } else if (number < 1000) {
      number = "0" + number;
    }
    //resolve(number);
    return number;
    //});
  },



  defaultDateFormat: function (dateTime) {
    var df = moment(dateTime).format('DD-MM-YYYY HH:mm:ss');
    return df;
  },



  getTodaysDate: async function () {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  },


  getCurrentTime: async function () {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day].join('-');
  },




  slugify: async function (text) {
    return text
      .toString()                 // Cast to string
      .toLowerCase()              // Convert the string to lowercase letters
      .normalize("NFD")           // The normalize() method returns the Unicode Normalization Form of a given string.
      .trim()                     // Remove whitespace from both sides of a string
      .replace(/\s+/g, "-")       // Replace spaces with -
      .replace(/[^\w\-]+/g, "")   // Remove all non-word chars
      .replace(/\-\-+/g, "");    // Replace multiple - with single -
  },



  deleteFile: async function (filename) {
    //Delete if any existing file exists with different name
    if (filename != "") {
      try {
        fs.unlinkSync(filename);
        console.log("File deleted successfully.");
      } catch (error) {
        console.log(error);
      }
    }
  },



  /**
   * Check whether the user is admin or not 
   * @param {*} role_id 
   * @returns 
   */
  isAdmin: async function (role_id) {
    return new Promise(async (resolve, reject) => {
      if (role_id > 0) {
        const role = await models.Role.findOne({ attributes: ["name"], where: { id: role_id } });
        if (role != null && role != "") {
          if (role.name == "Admin" || role.name == "admin" || role.name == "Super admin" || role.name == "Super Admin") {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      }
    });
  },



}
