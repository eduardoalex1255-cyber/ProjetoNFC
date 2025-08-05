const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Conecta-se ao MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/nfc-project')
    .then(() => console.log('Conectado à base de dados com sucesso!'))
    .catch(err => console.log('Erro de conexão:', err));

// Define a estrutura (o "molde") para a conta do cliente
const ItemSchema = new mongoose.Schema({
    nome: String,
    preco: Number
});

const ContaSchema = new mongoose.Schema({
    cartaoId: { type: String, required: true, unique: true },
    valorTotal: { type: Number, default: 0 },
    itens: [ItemSchema]
});

const Conta = mongoose.model('Conta', ContaSchema);

// Middleware
app.use(express.json());
app.use(cors());

// Endpoint para obter a conta de um cliente
app.get('/api/conta/:cartaoId', async (req, res) => {
    const cartaoId = req.params.cartaoId;
    try {
        const conta = await Conta.findOne({ cartaoId });
        if (conta) {
            res.json(conta);
        } else {
            res.status(404).send('Conta não encontrada.');
        }
    } catch (err) {
        res.status(500).send('Erro no servidor.');
    }
});

// Endpoint para adicionar um item à conta do cliente
app.post('/api/conta/:cartaoId/adicionar', async (req, res) => {
    const cartaoId = req.params.cartaoId;
    const { nome, preco } = req.body;
    try {
        let conta = await Conta.findOne({ cartaoId });
        if (!conta) {
            conta = new Conta({ cartaoId, itens: [] });
        }
        conta.itens.push({ nome, preco });
        conta.valorTotal += preco;
        await conta.save();
        res.status(200).json(conta);
    } catch (err) {
        res.status(500).send('Erro no servidor.');
    }
});

// NOVO: Endpoint para o cliente pagar a sua conta
app.post('/api/conta/:cartaoId/pagar', async (req, res) => {
    const cartaoId = req.params.cartaoId;
    try {
        const conta = await Conta.findOne({ cartaoId });
        if (!conta) {
            return res.status(404).send('Conta não encontrada.');
        }

        // Apagar a conta do cliente da base de dados
        await Conta.deleteOne({ cartaoId });

        res.status(200).send('Pagamento concluído com sucesso.');
    } catch (err) {
        res.status(500).send('Erro no servidor.');
    }
});


// Endpoint para reiniciar a conta de um cliente (removido do fluxo principal)
app.post('/api/conta/:cartaoId/reset', async (req, res) => {
    const cartaoId = req.params.cartaoId;
    try {
        let conta = await Conta.findOne({ cartaoId });
        if (conta) {
            conta.itens = [];
            conta.valorTotal = 0;
            await conta.save();
            res.status(200).json(conta);
        } else {
            res.status(404).send('Conta não encontrada.');
        }
    } catch (err) {
        res.status(500).send('Erro no servidor.');
    }
});

app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});