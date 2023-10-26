require("dotenv").config()
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    storage: './database.sqlite',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

sequelize
    .sync()
    .then(() => {
        console.log('Database connected');
    })
    .catch((err) => {
        console.log(err);
    });

const User = sequelize.define('user', {
    name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    hobbies: DataTypes.ARRAY(DataTypes.STRING),
});

module.exports = {
    sequelize,
    User,
};