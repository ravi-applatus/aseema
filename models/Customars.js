module.exports = function (sequelize, DataTypes) {
  return sequelize.define('Customers', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    subscriptionPlansId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    mobile: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    subscriptionPlanStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    subscriptionPlanEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    duration: {
      type: DataTypes.ENUM("Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly"),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: true
    },
    image: {
      type: DataTypes.TEXT(),
      allowNull: true
    },
    createdBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  }, {
    tableName: 'customers',
  });
};
