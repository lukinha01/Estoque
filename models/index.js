const Produto = require('./Produto');
const Fornecedor = require('./Fornecedor');
const Empresa = require('./Empresa');
const Transacao = require('./Transacao');

// Configurar associações
Fornecedor.hasMany(Produto, { foreignKey: 'fornecedorID', onDelete: 'CASCADE', as: 'produtos' });
Produto.belongsTo(Fornecedor, { foreignKey: 'fornecedorID', as: 'fornecedor' });

Empresa.hasMany(Produto, { foreignKey: 'empresaId', onDelete: 'CASCADE', as: 'produtos' });
Produto.belongsTo(Empresa, { foreignKey: 'empresaId', as: 'empresa' });

Produto.hasMany(Transacao, { foreignKey: 'produtoID', as: 'transacoes' });
Transacao.belongsTo(Produto, { foreignKey: 'produtoID', as: 'produto' });


module.exports = { Produto, Fornecedor, Empresa, Transacao };

