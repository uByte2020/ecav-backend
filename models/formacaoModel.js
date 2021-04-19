/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');
const Estado = require('./estadoModel');
const Categoria = require('./categoriaModel');
const AppError = require('../utils/appError');
const ErrorMessage = require('./../utils/error');

const formacaoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Um Serviço deve ter um nome']
  },
  descricao: {
    type: String,
    default: ''
  },
  estado: {
    type: Object,
    required: [true, 'Um Serviço deve ter um estado']
  },
  formadores: [{
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
});


formacaoSchema.pre('save', async function(next) {
  this.categoria = await Categoria.findById(this.categoria);
  this.estado = await Estado.findOne({ estadoCode: { $eq: this.estado } });
  if (!this.estado) return next(new AppError(ErrorMessage[22].message, 400));

  next();
});

// formacaoSchema.pre(/^find/, async function(next) {
//   this.populate({ path: 'fornecedor' });
//   next();
// });

const Formacao = mongoose.model('formacoes', formacaoSchema);

module.exports = Formacao;
