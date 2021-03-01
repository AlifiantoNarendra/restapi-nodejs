const sequelize = require ('sequelize');
const db        = require ('../config/db');


const User  = db.define(
    "user",
    {
        username    : {
            type    : sequelize.STRING
        },
        password    : {
            type    : sequelize.STRING
        }
    }
);

User.sync({});

module.exports  = User;