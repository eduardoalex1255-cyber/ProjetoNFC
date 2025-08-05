const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Carrega as variáveis de ambiente do ficheiro .env
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE']
}));

app.use(express.json());

// Liga-se à base de dados MongoDB Atlas usando a variável de ambiente
mongoose.connect(process.env.DB_CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado à base de dados MongoDB Atlas!'))
    .catch(err => console.error('Erro ao conectar à base de dados:', err));

// Esquema da conta
const contaSchema = new mongoose.Schema({
    cartaoId: { type: String, required: true, unique: true },
    itens: [{
        nome: String,
        preco: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    valorTotal: { type: Number, default: 0 }
});

const Conta = mongoose.model('Conta', contaSchema);

// Rota para adicionar um item à conta
app.post('/api/conta/:cartaoId/adicionar', async (req, res) => {
    const { cartaoId } = req.params;
    const { nome, preco } = req.body;
    try {
        let conta = await Conta.findOne({ cartaoId });
        if (!conta) {
            conta = new Conta({ cartaoId, itens: [], valorTotal: 0 });
        }
        conta.itens.push({ nome, preco });
        conta.valorTotal += preco;
        await conta.save();
        res.status(200).json(conta);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao adicionar item.' });
    }
});

// Rota para obter o consumo da conta
app.get('/api/conta/:cartaoId', async (req, res) => {
    const { cartaoId } = req.params;
    try {
        const conta = await Conta.findOne({ cartaoId });
        if (!conta) {
            return res.status(404).json({ message: 'Conta não encontrada.' });
        }
        res.status(200).json(conta);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar conta.' });
    }
});

// Rota para apagar a conta (simular pagamento)
app.post('/api/conta/:cartaoId/pagar', async (req, res) => {
    const { cartaoId } = req.params;
    try {
        const resultado = await Conta.deleteOne({ cartaoId });
        if (resultado.deletedCount === 0) {
            return res.status(404).json({ message: 'Conta não encontrada para pagamento.' });
        }
        res.status(200).json({ message: 'Pagamento concluído e conta apagada.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao apagar conta.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});