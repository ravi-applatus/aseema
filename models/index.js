'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../configs/config.json')[env];
var db = {};

if (config.use_env_variable) {
    var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
    var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function (file) {
        // var model = sequelize['import'](path.join(__dirname, file));
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db.DropdownSettingsOptions.belongsTo(db.DropdownSettings, { foreignKey: 'dropdownSettingId', targetKey: 'id', as: 'OptionsDropdownSettings' });
//db.ProductImage.belongsTo(db.Product, {foreignKey: 'product_id', targetKey: 'id', as: 'productImageProduct'});
// db.DropdownSettings.hasMany(db.DropdownSettingsOptions, {
//   foreignKey: "dropdownSettingId",
//   onDelete: "cascade",
// });

// db.DropdownSettingsOptions.belongsTo(db.DropdownSettings, {foreignKey: 'dropdownSettingId'});
db.Customers.belongsTo(db.Subscription, { foreignKey: 'subscriptionPlansId', targetKey: 'id', as: 'CustomerssubscriptionPlans' });
db.Product.belongsTo(db.Mycollection, { foreignKey: 'product_id', targetKey: 'id', as: 'MyCollectionProduct' });
// db.Orders.belongsTo(db.Customers, { foreignKey: 'customerId' });
// db.Orders.belongsTo(db.Subscription, { foreignKey: 'subscriptionId' });


const category = require("./Category");
const subscription = require("./SubscriptionPlans");
const admin = require("./Admin");
const cms = require("./Cms");
const contact = require("./ContactUs");
const Customers = require("./Customars");
const Mycollection = require("./myCollection");
const order = require("./Orders");
const Banner = require("./banner");

module.exports = {
    category, subscription, admin, cms, contact, Customers, Mycollection, order, Banner
}
module.exports = db;