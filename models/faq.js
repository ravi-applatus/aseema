/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define("Faqs",{
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      sequence:{
        type: DataTypes.STRING(255),
        allownull: true
        },
      question:{
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Yes', 'No'),
        allowNull: false
    },
      createdBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: "faq",
      comment:"Faq Table",
    }
  );
};