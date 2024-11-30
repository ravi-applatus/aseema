module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Banner', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        sequence: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        content: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        content_type: {
            type: DataTypes.ENUM("image", "video"),
            allowNull: false,
        },
        link_url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        bannerGroup: {
            type: DataTypes.STRING(255),
            allowNull: true
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
        tableName: 'banners',
        timestamps: false,
    });
};
