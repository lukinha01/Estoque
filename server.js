const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const path = require('path');
const routes = require('./routes/EstoqueRotas');
const db = require('./config/database')
const bodyParser = require('body-parser')
const handlebars = require('handlebars');

const app = express();

app.use(session({
    secret: '123456', 
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}));

app.use(flash());

async function estabelecerConexao() {
    try{
        await db.authenticate();
        console.log ('Conexão estabelecida com sucesso');
    }catch(error){
        console.log('Erro na conexão', error);
    }
}

async function sincronizarBancoDados(){
    try{
        await db.sync({force: false});
        console.log('Tabelas foram sicronizadas com sucesso');
    }catch(error){
        console.error('Erro sicronizando as tabelas', error);
    }
};

estabelecerConexao();
sincronizarBancoDados();

app.engine('handlebars', exphbs.engine({defaultLayout: false}));
app.set('view engine', 'handlebars');
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

app.use('/', routes);

app.listen(3000, () => {
    console.log('Servidor está em execução');
});