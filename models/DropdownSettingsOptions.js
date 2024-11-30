/* const Sequelize = require("sequelize");
const sequelize = require("../configs/db.connection");
//const stores = require("./stores");
const dropdownSettings = require("./DropdownSettings"); */

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("DropdownSettingsOptions", {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        dropdownSettingId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        storeId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        optionLabel: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        optionValue: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        optionOrder: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        tableName: 'dropdown_settings_options',
        comment: "Dropdown Settings Option Table"

    });
}

/* stores.hasMany(dropdownSettingsOptions, {
    foreignKey: "storeId",
    onDelete: "cascade",
});

dropdownSettingsOptions.belongsTo(stores, {
    foreignKey: "storeId",
    onDelete: "cascade",
}); */

/* dropdownSettings.hasMany(dropdownSettingsOptions, {
    foreignKey: "dropdownSettingId",
    onDelete: "cascade",
});

dropdownSettingsOptions.belongsTo(dropdownSettings, {
    foreignKey: "dropdownSettingId",
    onDelete: "cascade",
});

module.exports = dropdownSettingsOptions; */

