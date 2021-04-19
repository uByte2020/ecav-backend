/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');
const Estado = require('./estadoModel');
const AppError = require('../utils/appError');
const ErrorMessage = require('./../utils/error');

const marcacaoSchema = new mongoose.Schema({
  data: {
    type: Date,
    required: [true, 'Uma Marcação deve ter uma Data']
  },
  dataHora: {
    type: Date,
    required: [true, 'Uma Marcação deve ter uma Hora']
  },
  estado: {
    type: Object,
    required: [true, 'Uma Marcação deve ter uma Estado']
  },
  // lições são os servicos
  licao: {
    type: Object,
    required: [true, 'Uma Marcação deve ter um Lições']
  },
  aluno: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: true
  },
  formador: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
});

marcacaoSchema.pre('save', async function(next) {
  this.estado = await Estado.findOne({ estadoCode: { $eq: this.estado } });
  if (!this.estado) return next(new AppError(ErrorMessage[17].message, 500));
  next();
});

marcacaoSchema.pre(/^find/, async function(next) {
  this.populate({ path: 'aluno' }).populate({ path: 'formador' });
  next();
});

const Marcacao = mongoose.model('marcacoes', marcacaoSchema);

module.exports = Marcacao;
