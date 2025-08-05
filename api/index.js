const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Liga-se à base de dados MongoDB Atlas
mongoose.connect(process.env.DB_CONNECTION_STRING)
    .then(() => console.log('Conectado à base de dados MongoDB Atlas!'))
    .catch(err => console.error('Erro ao conectar à base de dados:', err));

// Esquema da conta
const contaSchema = new mongoose.Schema({
    cartaoId: { type: String, required: true, unique: true },
    itens: [{ nome: String, preco: Number }],
    valorTotal: { type: Number, default: 0 },
    pago: { type: Boolean, default: false }
});

const Conta = mongoose.model('Conta', contaSchema);

// Rota para adicionar um item à conta
app.post('/api/conta/:cartaoId/adicionar', async (req, res) => {
    // ... o código da rota é o mesmo
});

// Rota para obter o consumo da conta
app.get('/api/conta/:cartaoId', async (req, res) => {
    // ... o código da rota é o mesmo
});

// Rota para marcar a conta como paga
app.post('/api/conta/:cartaoId/pagar', async (req, res) => {
    // ... o código da rota é o mesmo
});

// Esta linha é a mais importante para o Vercel
module.exports = app;