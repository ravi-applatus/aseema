module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Subscription', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        tag: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        fees: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        tax: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        duration: {
            type: DataTypes.ENUM("Monthly", "Quarterly", "Half-Yearly", "Yearly"),
            allowNull: false,
        },
        noOfMonths: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM("y", "n"),
            allowNull: false,
            comment: "y=>active, n=>inactive",
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        created_by: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updated_by: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
    }, {
        tableName: 'subscription_plans',
        timestamps: false,
    });
};
