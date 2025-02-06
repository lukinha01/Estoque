const { Sequelize } = require ('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'Estoque.sqlite'
});

module.exports = sequelize;
