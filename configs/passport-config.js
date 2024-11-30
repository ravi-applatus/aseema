const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt-nodejs");
const models = require("../models");

exports.initializingPassport = (passport) => {
    passport.use(new LocalStrategy(async (email, password, done) => {
        try {
            const admin = await models.Admin.findOne({where: {email: email}});
            if(!admin) return done(null, false);
            if (!bcrypt.compareSync(password, admin.password)) {
                return done(null, false);
            }
            return done(null, admin);
        } catch (error) {
            return done(error, false)
        }
    }));

    passport.serializeUser((admin, done) => {
        done(null, admin.id)
    });

    passport.deserializeUser(async(id, done) => {
        try {
            const admin = await models.Admin.findOne({where: {id: id}});
            done(null, admin);
        } catch (error) {
            done(error, false);
        }
    });
};



exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user) {
        next();
    } else {
        res.redirect("/auth/signin");
    }
};


exports.isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/admin/dashboard");
    }
};