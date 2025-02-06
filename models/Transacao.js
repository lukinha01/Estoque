const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Produto = require('./Produto');

const Transacao = sequelize.define('Transacao', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    tipo: {
        type: DataTypes.ENUM('entrada', 'saida'),
        allowNull: false,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    data: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    produtoID: {
        type: DataTypes.INTEGER,
        references: {
            model: Produto,
            key: 'id',
        },
    },
});

Produto.hasMany(Transacao, { foreignKey: 'produtoID' });
Transacao.belongsTo(Produto, { foreignKey: 'produtoID' });

module.exports = Transacao;
