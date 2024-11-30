module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ProductCategory', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
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
            type: DataTypes.INTEGER,
            allowNull: true
        },
    }, {
        tableName: 'product_categories',
        timestamps: false,
    });
};
