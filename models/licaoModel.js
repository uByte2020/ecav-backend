/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');
const Estado = require('./estadoModel');
const Categoria = require('./categoriaModel');
const AppError = require('./../utils/appError');
const ErrorMessage = require('./../utils/error');

const licaoSchema = new mongoose.Schema({
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
  formacao: {
    type: Object,
    required: true
  },
  categoria: {
    type: Object,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
});

licaoSchema.pre('save', async function(next) {
  this.categoria = await Categoria.findById(this.categoria);
  this.estado = await Estado.findOne({ estadoCode: { $eq: this.estado } });

  if (!this.categoria) return next(new AppError(ErrorMessage[21].message, 400));
  if (!this.estado) return next(new AppError(ErrorMessage[22].message, 400));

  next();
});

// licaoSchema.pre(/^find/, async function(next) {
//   this.populate({ path: 'fornecedor' });
//   next();
// });

const Licao = mongoose.model('licoes', licaoSchema);

module.exports = Licao;
