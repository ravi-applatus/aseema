module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Orders', {
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
        customerName: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        subscriptionName: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        orderDateTime: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        subscriptionId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        paymentTransactionId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        subscriptionStartDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        subscriptionEndDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        subscriptionMonths: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        amount: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            // defaultValue: 0,
        },
        tax: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        discount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        paymentTransactionAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
        },
        paymentTransactionDateTime: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        paymentTransactionStatus: {
            type: DataTypes.ENUM("success", "unsuccess"),
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("expired", "active", "cancelled", "inqueue"),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        created_by: {
            type: DataTypes.INTEGER(11),
            allowNull: true
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
        tableName: 'order',
        timestamps: false,
    });
};