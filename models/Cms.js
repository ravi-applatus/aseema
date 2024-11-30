/* jshint indent: 2 */
module.exports = function(sequelize, DataTypes) {
    return sequelize.define(
        "Cms", {
            id: {
                type: DataTypes.INTEGER(10),
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            },
            storeId: {
                type: DataTypes.INTEGER(10),
                allowNull: true,
                defaultValue: 1
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            slug: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
            short_description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            status: {
                type: DataTypes.ENUM("enable", "disable"),
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            updatedBy: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        }, {
            tableName: "cms",
            comment: "CMS Table",
        }
    );
};