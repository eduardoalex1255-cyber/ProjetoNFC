const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Certifica-te de que o cors está instalado (npm install cors)

// Carrega as variáveis de ambiente do ficheiro .env
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS para permitir o acesso a partir de qualquer origem
app.use(cors());

app.use(express.json());

// Liga-se à base de dados MongoDB Atlas usando a variável de ambiente
mongoose.connect(process.env.DB_CONNECTION_STRING)
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
    valorTotal: { type: Number, default: 0 },
    pago: { type: Boolean, default: false } // Campo para o estado do pagamento
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
        
        if (conta.pago) {
            return res.status(403).json({ message: 'Pagamento já foi efetuado. Por favor, crie uma nova conta.' });
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

// Rota para marcar a conta como paga
app.post('/api/conta/:cartaoId/pagar', async (req, res) => {
    const { cartaoId } = req.params;
    try {
        const resultado = await Conta.findOneAndUpdate(
            { cartaoId, pago: false },
            { $set: { pago: true } },
            { new: true }
        );
        if (!resultado) {
            return res.status(404).json({ message: 'Conta não encontrada ou já paga.' });
        }
        res.status(200).json({ message: 'Pagamento concluído e conta marcada como paga.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao processar o pagamento.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});