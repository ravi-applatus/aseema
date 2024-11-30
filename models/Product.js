module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        storeId: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 1,
        },
        category_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        type: {
            type: DataTypes.ENUM("article", "emagazine", "news"),
            allowNull: true,
        },
        sequence: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 0,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        short_description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        magazine_preview: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        magazine_full: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        thumbnail_landscape: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        thumbnail_portrait: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        audio: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        subscription: {
            type: DataTypes.ENUM("Free", "Paid"),
            allowNull: true,
        },
        read_count: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0
        },
        tags: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM("published", "scheduled", "draft"),
            allowNull: false,
            comment: "p=>published, s=>scheduled, d=>draft"
        },
        published_datetime: {
            type: DataTypes.DATE,
            allowNull: true
        },
        meta_title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        meta_description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        meta_keywords: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        og_title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        og_type: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        og_image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        og_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        likeCount: {
            type: DataTypes.STRING(255),
            allowNull: true
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
        tableName: 'products',
        timestamps: false,
    });
};