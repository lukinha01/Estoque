const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { Produto, Fornecedor, Empresa, Transacao } = require('../models');

const autenticarEmpresa = require('../middleware/auth'); 

router.get('/', async (req, res) => {
    const empresaLogada = req.session.empresaId;  
    try {
        const empresas = await Empresa.findAll();  
        const empresasData = empresas.map(empresa => empresa.dataValues); 
        res.render('home', { empresaLogada, empresas: empresasData });
    } catch (error) {
        console.error('Erro ao buscar empresas:', error);
        res.status(500).send('Erro ao buscar empresas');
    }
});

router.get('/cadastrarEmpresa', (req, res) => {
    res.render('cadastroEmpresa',  {flash: {
            success: req.flash('success'),
            error: req.flash('error')
        }});
})

router.post('/cadastrarEmpresa', async (req, res) => {
    const { nome, email, telefone, endereco, tipo, senha } = req.body;

    if (!nome || !email || !endereco || !tipo || !senha) {
        req.flash('error', 'Todos os campos são obrigatórios!');
        return res.redirect('/cadastrarEmpresa');
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);
        
        await Empresa.create({ nome, email, telefone, endereco, tipo, senha: senhaCriptografada });
        req.flash('success', 'Empresa cadastrada com sucesso!');
        console.log('Email:', email);
        console.log('Senha:', senha);
        res.redirect('/loginEmpresa');
    } catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        req.flash('error', 'Ocorreu um erro ao cadastrar a empresa.');
        res.redirect('/cadastrarEmpresa');
    }
});

router.get('/loginEmpresa', (req, res) => {
    res.render('loginEmpresa');
});

router.post('/loginEmpresa', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const empresa = await Empresa.findOne({ where: { email } });

        if (!empresa) {
            req.flash('error', 'Empresa não encontrada!');
            return res.redirect('/loginEmpresa');
        }

        const senhaArmazenada = empresa.senha;
        const senhaValida = await bcrypt.compare(senha, senhaArmazenada);
        if (!senhaValida) {
            req.flash('error', 'Senha incorreta!');
            return res.redirect('/loginEmpresa');
        }

        req.session.empresaId = empresa.id;
        req.flash('success', 'Login realizado com sucesso!');
        res.redirect('/');
    } catch (err) {
        console.log('Erro ao comparar senhas:', err);
        req.flash('error', 'Erro ao tentar fazer login.');
        return res.redirect('/loginEmpresa');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/');
        }
        res.redirect('/loginEmpresa'); 
    });
});

router.get('/perfilEmpresa', autenticarEmpresa, async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(req.session.empresaId);
        if (!empresa) {
            return res.status(404).send('Empresa não encontrada');
        }
        const empresaData = empresa.dataValues; 
        res.render('perfilEmpresa', { empresa: empresaData });
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        res.status(500).send('Erro ao carregar perfil da empresa');
    }
});

router.get('/editarEmpresa', autenticarEmpresa, async (req, res) => {
    try {
        const empresa = await Empresa.findByPk(req.session.empresaId);
        if (!empresa) {
            return res.status(404).send('Empresa não encontrada');
        }
        res.render('editarEmpresa', { empresa: empresa.dataValues });
    } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
        res.status(500).send('Erro ao carregar dados para edição');
    }
});

router.post('/editarEmpresa', autenticarEmpresa, async (req, res) => {
    const { nome, email, telefone, endereco, senha } = req.body;
    try {
        const empresa = await Empresa.findByPk(req.session.empresaId);

        const senhaValida = await bcrypt.compare(senha, empresa.senha); 
        if (!senhaValida) {
            return res.status(401).send('Senha incorreta');
        }

        empresa.nome = nome;
        empresa.email = email;
        empresa.telefone = telefone;
        empresa.endereco = endereco;
        await empresa.save();

        res.redirect('/perfilEmpresa');
    } catch (error) {
        console.error('Erro ao atualizar dados da empresa:', error);
        res.status(500).send('Erro ao atualizar dados da empresa');
    }
});

router.get('/deletarEmpresa', autenticarEmpresa, (req, res) => {
    res.render('deletarEmpresa');
});

router.post('/deletarEmpresa', autenticarEmpresa, async (req, res) => {
    const { senha } = req.body;
    try {
        const empresa = await Empresa.findByPk(req.session.empresaId);
        const senhaValida = await bcrypt.compare(senha, empresa.senha);
        if (!senhaValida) {
            return res.status(401).send('Senha incorreta');
        }
        await empresa.destroy();
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Erro ao finalizar sessão');
            }
            res.redirect('/');
        });
    } catch (error) {
        console.error('Erro ao deletar a empresa:', error);
        res.status(500).send('Erro ao deletar a empresa');
    }
});

//Fornecedor
router.get('/fornecedores', autenticarEmpresa, async (req, res) => {
    const empresaLogada = req.session.empresaId;  
    try { 
        const empresas = await Empresa.findAll();  
        const empresasData = empresas.map(empresa => empresa.dataValues);  
        const fornecedores = await Fornecedor.findAll();
        const fornecedoresData = fornecedores.map(fornecedor => fornecedor.dataValues); 
        res.render('fornecedores', { fornecedores: fornecedoresData, empresaLogada, empresas: empresasData });
    } catch (error) {
        console.error('Erro ao listar fornecedores:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/adicionarFornecedores',autenticarEmpresa, async(req, res) => {
    res.render('adicionarFornecedores')
})

router.post('/adicionarFornecedores', autenticarEmpresa ,async (req, res) => {
    const { nome, email, telefone, endereco } = req.body;
    try {
        await Fornecedor.create({ nome, email, telefone, endereco });
        res.redirect('/fornecedores');
    } catch (error) {
        console.error('Erro ao adicionar fornecedor:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/editarFornecedor', autenticarEmpresa, async (req, res) => {
    try {
        const fornecedores = await Fornecedor.findAll();
        const fornecedoresData = fornecedores.map(fornecedor => fornecedor.dataValues); 
        res.render('editarFornecedor', { fornecedores: fornecedoresData });
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.post('/editarFornecedor', autenticarEmpresa, async (req, res) => {
    const { nome, novoNome, email, telefone, endereco, senha } = req.body;

    try {
        const empresa = await Empresa.findByPk(req.session.empresaId);

        const senhaValida = await bcrypt.compare(senha, empresa.senha); 
        if (!senhaValida) {
            return res.status(403).send('Senha inválida');
        }

        const fornecedor = await Fornecedor.findOne({ where: { nome } });
        if (!fornecedor) {
            return res.status(404).send('Fornecedor não encontrado');
        }
        await fornecedor.update({ nome: novoNome, email, telefone, endereco });

        res.redirect('/fornecedores');
    } catch (error) {
        console.error('Erro ao editar fornecedor:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/deletarFornecedor', autenticarEmpresa, async (req, res) => {
    try {
        const fornecedores = await Fornecedor.findAll();
        const fornecedoresData = fornecedores.map(fornecedor => fornecedor.dataValues); 

        res.render('deletarFornecedor', { fornecedores: fornecedoresData });
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.post('/deletarFornecedor', autenticarEmpresa, async (req, res) => {
    const { email, senha } = req.body;

    const empresa = await Empresa.findByPk(req.session.empresaId);
    const senhaValida = await bcrypt.compare(senha, empresa.senha);
    if (!senhaValida) {
        return res.status(403).send('Senha inválida');
    }

    try {
        const fornecedor = await Fornecedor.findOne({ where: { email } });

        if (!fornecedor) {
            return res.status(404).send('Fornecedor não encontrado');
        }
        await fornecedor.destroy();
        res.redirect('/fornecedores');
    } catch (error) {
        console.error('Erro ao excluir fornecedor:', error);
        res.status(500).send('Erro no servidor');
    }
});

//Produtos
router.get('/produtos', autenticarEmpresa, async (req, res) => {
    const empresaLogada = req.session.empresaId;  
    try {
        const empresas = await Empresa.findAll();  
        const empresasData = empresas.map(empresa => empresa.dataValues);  

        const produtos = await Produto.findAll({
            include: [
                {
                    model: Empresa,  
                    required: true, 
                    as: 'empresa'  
                },
                {
                    model: Fornecedor,  
                    required: true,     
                    as: 'fornecedor'
                }
            ]
        });
        console.log('Produtos recuperados:', produtos);
        const produtosData = produtos.map(produtos => produtos.dataValues);
        res.render('produtos', { produtos: produtosData, empresas: empresasData, empresaLogada });
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/adicionarProdutos', autenticarEmpresa, async (req, res) => {
    try {
        const fornecedores = await Fornecedor.findAll(); 
        const empresaId = req.session.empresaId; 

        res.render('adicionarProdutos', { 
            fornecedores: fornecedores.map(f => f.dataValues), 
            empresaId 
        });
    } catch (error) {
        console.error('Erro ao carregar fornecedores:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.post('/adicionarProdutos', autenticarEmpresa, async (req, res) => {
    const empresaLogada = req.session.empresaId;
    const { nome, preco, quantidade, fornecedorID } = req.body;

    try {
        await Produto.create({
            nome,
            preco,
            quantidade,
            fornecedorID,
            empresaId: empresaLogada
        });
        res.redirect('/produtos');
    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/editarProdutos', autenticarEmpresa, async(req, res ) =>{
    try{
        const produtos = await Produto.findAll();
        const produtosData = produtos.map(produtos => produtos.dataValues); 
        res.render('editarProdutos', { produtos: produtosData });
    }catch (error) {
    console.error('Erro ao carregar Produtos:', error);
    res.status(500).send('Erro no servidor');
    }
});

router.post('/editarProdutos', autenticarEmpresa, async (req, res) => {
    const { nome, novoNome, preco, quantidade, senha } = req.body;

    try {
        const empresa = await Empresa.findByPk(req.session.empresaId);

        const senhaValida = await bcrypt.compare(senha, empresa.senha); 
        if (!senhaValida) {
            return res.status(403).send('Senha inválida');
        }

        const produtos = await Produto.findOne({ where: { nome } });
        if (!produtos) {
            return res.status(404).send('Produto não encontrado');
        }
        await produtos.update({ nome: novoNome, preco, quantidade});

        res.redirect('/produtos');
    } catch (error) {
        console.error('Erro ao editar o produto:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/deletarProduto', autenticarEmpresa, async (req, res) => {
    try {
        const produto = await Produto.findAll();
        const produtoData = produto.map(produto => produto.dataValues); 

        res.render('deletarProduto', { produto: produtoData });
    } catch (error) {
        console.error('Erro ao carregar Produtos:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.post('/deletarProduto', autenticarEmpresa, async (req, res) => {
    const { nome, senha } = req.body;

    const empresa = await Empresa.findByPk(req.session.empresaId);
    const senhaValida = await bcrypt.compare(senha, empresa.senha);
    if (!senhaValida) {
        return res.status(403).send('Senha inválida');
    }

    try {
        const produto = await Produto.findOne({ where: { nome } });

        if (!produto) {
            return res.status(404).send('Produto não encontrado');
        }
        await produto.destroy();
        res.redirect('/produtos');
    } catch (error) {
        console.error('Erro ao excluir o produto:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/transacoes', autenticarEmpresa, async (req, res) => {
    const empresaLogada = req.session.empresaId;
    try {
        const transacoes = await Transacao.findAll({ include: Produto });
        const transacoesData = transacoes.map(transacoes => transacoes.dataValues);
        res.render('transacoes', { transacoes: transacoesData, empresaLogada});
    } catch (error) {
        console.error('Erro ao listar transações:', error);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/fazertransacoes', autenticarEmpresa, async(req, res) =>{
    try {
        const transacoes = await Transacao.findAll({ include: Produto });
        const transacoesData = transacoes.map(transacoes => transacoes.dataValues);

        const produtos = await Produto.findAll();
        const produtosData = produtos.map(produto => produto.dataValues);
        res.render('fazerTransacao', { transacoes: transacoesData, produtos: produtosData });
    } catch (error) {
        console.error('Erro ao listar transações:', error);
        res.status(500).send('Erro no servidor');
    }
})

router.post('/fazertransacoes', async (req, res) => {
    const { tipo, quantidade, produtoID } = req.body;
    try {
        await Transacao.create({ tipo, quantidade, produtoID });

        const produto = await Produto.findByPk(produtoID);
        if (tipo === 'entrada') {
            produto.quantidade += parseInt(quantidade, 10);
        } else if (tipo === 'saida' && produto.quantidade >= quantidade) {
            produto.quantidade -= parseInt(quantidade, 10);
        }
        await produto.save();

        res.redirect('/transacoes');
    } catch (error) {
        console.error('Erro ao registrar transação:', error);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;
