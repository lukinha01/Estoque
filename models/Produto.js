const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Fornecedor = require('./Fornecedor');
const Empresa = require('./Empresa');

const Produto = sequelize.define('Produto', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    preco: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    fornecedorID: {
        type: DataTypes.INTEGER,
        references: {
            model: Fornecedor,
            key: 'id',
        },
    },
    empresaId: {
        type: DataTypes.INTEGER,
        references: {
            model: Empresa,
            key: 'id'
        }
    }
});

module.exports = Produto;
