require('dotenv').config();
const express = require('express');
const fileUpload = require("express-fileupload");
const moment = require('moment');
const path = require('path');
//const favicon = require('static-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const sess = require('express-session');
const cors = require('cors');
//const expressValidator = require('express-validator');
const store = require('session-memory-store')(sess);
const app = express();
const https = require("https");
const fs = require("fs");
const Sequelize = require("sequelize");
const passport = require('passport');
const models = require('./models');
const { initializingPassport, isAuthenticated } = require('./configs/passport-config');
initializingPassport(passport);


const whitelist = ['http://localhost:8100'];
const corsOptions = {
    origin: function (origin, callback) {
        if (true || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.set('port', process.env.PORT || 3325);



var privateKey = fs.readFileSync("/etc/letsencrypt/live/aseema.tezcommerce.com/privkey.pem", "utf8");
var certificate = fs.readFileSync("/etc/letsencrypt/live/aseema.tezcommerce.com/fullchain.pem", "utf8");
var credentials = { key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app); 
var server = httpsServer.listen(app.get('port'), function () {

    models.sequelize.sync({ alter: true }).then(() => {
        console.log('model load');
    }).catch(function (e) {
            console.log(e);
            throw new Error(e);
    });
    console.log('Express server listening on port ' + server.address().port);
    //debug('Express server listening on port ' + server.address().port);
});

/*var server = app.listen(app.get('port'), function () {
    models.sequelize.sync({ alter: true }).then(() => {
        console.log('model load');
    }).catch(function (e) {
        console.log(e);
        throw new Error(e);
    });
    console.log('Express server listening on port ' + app.get('port'));
});*/



///variable declare

var shortDateFormat = "MM-DD-YYYY"; // this is just an example of storing a date format once so you can change it in one place and have it propagate
app.locals.moment = moment; // this makes moment available as a variable in every EJS page
app.locals.shortDateFormat = shortDateFormat;
app.locals.admin_asset_url = 'https://aseema.tezcommerce.com:' + app.get('port') + '/assets/';
app.locals.adminbaseurl = 'https://aseema.tezcommerce.com:' + app.get('port') + '/admin/';
app.locals.baseurl = 'https://aseema.tezcommerce.com:' + app.get('port') + '/';
app.locals.logouturl = 'https://aseema.tezcommerce.com:' + app.get('port') + '/';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(favicon());
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('data/img'));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(flash());
app.use(sess({
    name: 'nodescratch',
    secret: 'MYSECRETISVERYSECRET',
    store: new store({ expires: 60 * 60 * 1000, debug: true }),
    resave: true, 
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());





///routes
const apiRoutes = require("./routes/api/" + process.env.DEFAULT_API_VERSION);
const authentication = require('./routes/auth');
const admin = require('./routes/admin');

app.use('/api/' + process.env.DEFAULT_API_VERSION, apiRoutes);
app.use('/auth', authentication);
app.use('/admin', admin);

///routes
/*const apiRoutes = require("./routes/api/v1")
const authentication = require('./routes/auth');
const admin = require('./routes/admin');


app.use('/api', apiRoutes);
app.use('/auth', authentication);
app.use('/admin', admin);*/



/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(fileUpload({
    limits: {
        fileSize: 1024 * 1024 // 1 MB
    },
    abortOnLimit: true
}));

/// error handlers
/* if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
} */


// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    console.log("-----------------------------------------");
    console.log(err);
    res.status(err.status || 500);
    return res.render('errors/404.ejs',
        {
            title: '404 - Page not found',
        });
});


app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});


// app.use(function(req, res, next) {
//     console.log("-----------------------------------------")
//     console.log(req.session.user)
//     res.locals.user = req.session.user;
//     next();
// });




//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(expressValidator()); // Add this after the bodyParser middlewares!
module.exports = app;
