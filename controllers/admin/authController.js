var models = require("../../models");
var passport = require("passport");
const bcrypt = require("bcrypt-nodejs");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const LocalStrategy = require("passport-local").Strategy;

exports.signinview = async function (req, res, next) {

  console.log("ssssssssssssssssssssssssssssssss");
  res.render("auth/login", {
    title: "dfsdfsdfsdfsdfs",
    //csrfToken: req.csrfToken(),
    errors: req.flash("errors"),
    loginerrors: "",
    messages: req.flash("message"),
    lmessages: req.flash("lmessage"),
  });
};



// passport.serializeUser(function (user, done) {
//   done(null, user.id);
// });


// passport.deserializeUser(function (id, done) {
//   models.Admin.findOne({ where: { id } }).then(function (user) {
//     done(null, user);
//   }).catch(done);
// });


// passport.use(new LocalStrategy({
//   usernameField: "username",
//   passwordField: "password"
// },
//   function (username, password, done) {
//     models.Admin.findOne({ where: { email: username } }).then(function (user) {
//       if (!user) {
//         return done(null, false, { message: "Incorrect username and password!" });
//       }

//       bcrypt.compare(password, user.password, function (err, isMatch) {
//         if (err) return done(err);
//         if (!isMatch) {
//           return done(null, false, { message: "Incorrect username and password!" });
//         }

//         return done(null, user);
//       });
//     }).catch(function (err) {
//       return done(err);
//     });
//   }
// ));


// exports.signin = function (req, res, next) {
//   passport.authenticate("local", function (err, user, info) {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       req.flash("errors", info.message);
//       return res.redirect("/auth/signin");
//     }

    
//     req.login(user, function (err) {
//       if (err) {
//         return next(err);
//       }

     
//       delete user.password;
//       user.image = user.image !== "" && user.image !== null ? req.app.locals.baseurl + "admin/admins/" + user.id + "/" + user.image
//         : req.app.locals.baseurl + "admin/admins/user.png";

//       var userJSON = user.toJSON();
//       var token = process.env.TMP_JWT_TOKEN; 
//       req.session.token = token;
//       res.redirect("/admin/dashboard");
//     });
//   })(req, res, next);
// };


exports.signin = function (req, res, next) {
    console.log("rrrrrrrrrrrrr");
  const { username, password } = req.body;
  if (username != "" && password != "") {
    console.log("sdfdsfsdf");
    models.Admin.findOne({
      where: { email: req.body.username, status:1 },
    }).then(async function (users) {
      if (users != null) {
        if (!bcrypt.compareSync(req.body.password, users.password)) {
          req.flash("errors", "Incorrect username and password!");
          return res.redirect("/auth/signin");
        } else {
          passport.authenticate(
            "local",
            { successRedirect: "/", failureRedirect: "/auth/signin" },
            function (err, user, info) {
              if (user == false) {
                return res.render("login/index", {
                  title: "Sign In",
                  loginerrors: "Invalid username and password!1",
                  messages: "",
                  errors: "",
                  lmessages: "",
                });
              }
              if (err) {
                console.log(err);
                return res.render("login/index", {
                  title: "Sign In",
                  loginerrors: "Sorry Something Wrong.",
                  messages: "",
                  errors: "",
                  lmessages: "",
                });
              }
              return req.logIn(user, async function (err) {
                if (err) {
                  console.log(err);
                  return res.render("login/index", {
                    title: "Sign In",
                    loginerrors: "Check User Id And Password.",
                    messages: "",
                    errors: "",
                    lmessages: "",
                  });
                } else {
                  req.session.user = users;
                  //delete users.password;
                  users.image =
                    users.image != "" && users.image != null
                      ? req.app.locals.baseurl +
                      "admin/admins/" +
                      users.id +
                      "/" +
                      users.image
                      : req.app.locals.baseurl + "admin/admins/users.png";
                  users = users.toJSON();

                  req.session.user = users;
                  // req.session.permissions = permissions;
                  // req.session.role = rolePermissions==undefined?'':rolePermissions[0].role.name;
                  // req.session.store = roleIdDetails == undefined ? '' : roleIdDetails.store.storeName;
                  // req.session.reportingIds = reportingId;
                  //var token = jwt.sign({ users }, process.env.JWT_SECRET);
                  token = process.env.TMP_JWT_TOKEN;
                  console.log(token);

                  req.session.token = token;
                  res.redirect("/admin/dashboard");
                }
              });
            }
          )(req, res, next);
          
          /* req.session.user = user;
          delete user.password;
          user.image = user.image != "" && user.image != null ? req.app.locals.baseurl + "admin/admins/" +
            user.id +
            "/" +
            user.image
            : req.app.locals.baseurl + "admin/admins/user.png";
          var user = user.toJSON();
          // var token = jwt.sign({ user }, process.env.JWT_SECRET_KEY);
          token = process.env.TMP_JWT_TOKEN;
          console.log("token 000000000000000");
          console.log(token);
          console.log("token 000000000000000");
          req.session.token = token;
          res.redirect("/admin/dashboard"); */
        
        }
      } else {
        req.flash("errors", "Incorrect username and password!");
        return res.redirect("/auth/signin");
      }
    })
  } else {
    req.flash("errors", "All fields are required!");
    res.redirect('back');
  }
  
}



exports.signin1 = function (req, res, next) {
  console.log("111111111111111111111111111111111111111111111");
  req.getValidationResult().then(function (result) {
    if (!result.isEmpty()) {
      console.log("222222222222222222222222222222222");
      var errors = result.array().map(function (elem) {
        return elem.msg;
      });
      req.flash("errors", errors);
      return res.redirect("/auth/signin");
    } else {
      console.log("3333333333333333333333333333");
      existingEmail = models.Admin.findOne({
        where: { username: req.body.username },
      });
      existingEmail.then(async function (users) {
        if (users != null) {
          if (!bcrypt.compareSync(req.body.password, users.password)) {
            req.flash("errors", "Incorrect username and password!");
            return res.redirect("/auth/signin");
          } else {
            if (req.body.username == users.username) {
              passport.authenticate(
                "local",
                { successRedirect: "/", failureRedirect: "/auth/signin" },
                function (err, user, info) {
                  if (user == false) {
                    return res.render("login/index", {
                      title: "Sign In",
                      loginerrors: "Invalid username and password!1",
                      messages: "",
                      errors: "",
                      lmessages: "",
                    });
                  }
                  if (err) {
                    console.log(err);
                    return res.render("login/index", {
                      title: "Sign In",
                      loginerrors: "Sorry Something Wrong.",
                      messages: "",
                      errors: "",
                      lmessages: "",
                    });
                  }
                  return req.logIn(user, async function (err) {
                    if (err) {
                      console.log(err);
                      return res.render("login/index", {
                        title: "Sign In",
                        loginerrors: "Check User Id And Password.",
                        messages: "",
                        errors: "",
                        lmessages: "",
                      });
                    } else {
                      req.session.user = user;
                      delete users.password;
                      users.image =
                        users.image != "" && users.image != null
                          ? req.app.locals.baseurl +
                          "admin/admins/" +
                          users.id +
                          "/" +
                          users.image
                          : req.app.locals.baseurl + "admin/admins/user.png";
                      var user = users.toJSON();

                      req.session.user = user;
                      // req.session.permissions = permissions;
                      // req.session.role = rolePermissions==undefined?'':rolePermissions[0].role.name;
                      // req.session.store = roleIdDetails == undefined ? '' : roleIdDetails.store.storeName;
                      // req.session.reportingIds = reportingId;
                      //var token = jwt.sign({ users }, process.env.JWT_SECRET);
                      token = process.env.STATIC_TOKEN;
                      console.log(token);

                      req.session.token = token;
                      res.redirect("/admin/dashboard");
                    }
                  });
                }
              )(req, res, next);
            } else {
              req.flash("errors", "Incorrect username and password!");
              return res.redirect("/auth/signin");
            }
          }
        } else {
          req.flash("errors", "Incorrect username and password!");
          return res.redirect("/auth/signin");
        }
      });
    }
  });
};

