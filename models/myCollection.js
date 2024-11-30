module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Mycollection', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        customerId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        productId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        createdBy: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    }, {
        tableName: 'Mycollection',
        timestamps: false,
    });
};
