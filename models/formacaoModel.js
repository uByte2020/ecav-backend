/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');
const Estado = require('./estadoModel');
const AppError = require('../utils/appError');
const ErrorMessage = require('./../utils/error');

const formacaoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Um Serviço deve ter um nome'],
      unique: true
    },
    descricao: {
      type: String,
      default: ''
    },
    estado: {
      type: Object,
      required: [true, 'Um Serviço deve ter um estado']
    },
    formadores: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: true
      }
    ],
    categorias: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'categorias',
        required: false
      }
    ],
    horarios: {
      type: [
        {
          diaSemana: { type: Number, max: 7, min: 1 },
          hora: { type: String, trim: true },
          duracao: { type: Number, default: 15 }
        }
      ],
      default: []
    },
    quantidadeAlunoMax: {
      type: Number,
      default: 12
    },
    createdAt: {
      type: Date,
      default: Date.now()
      // select: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

formacaoSchema.virtual('licoes', {
  ref: 'licoes',
  foreignField: 'formacao',
  localField: '_id'
});

formacaoSchema.pre('save', async function(next) {
  this.estado = await Estado.findOne({ estadoCode: { $eq: this.estado } });
  if (!this.estado) return next(new AppError(ErrorMessage[22].message, 400));
  next();
});

formacaoSchema.pre(/^find/, async function(next) {
  this.populate({
    path: 'formadores',
    select: '_id name email endereco telemovel indisponibilidade'
  }).populate({ path: 'categorias' });
  // .populate({
  //   path: 'licoes',
  //   select: '_id nome estado categoria -formacao'
  // });
  next();
});

const Formacao = mongoose.model('formacoes', formacaoSchema);

module.exports = Formacao;
