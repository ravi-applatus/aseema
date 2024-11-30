module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dp: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      DefaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("1", "0"),
      allowNull: false,
      comment: "1=>active, 0=>inactive",
    },
    updatedBy: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
    },
  }, {
    tableName: 'admins'
  });
};
