const Sequelize = require("sequelize");
const username = process.env.dbUser;
const password = process.env.dbPassword;
const database = process.env.db;
const host = process.env.dbHost;

const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
});



(async () => {
    await sequelize.authenticate();
    console.log("Database Connected Successfully!");
    await sequelize.sync();
    console.log("Tables created successfully!");
})();

module.exports = sequelize;
