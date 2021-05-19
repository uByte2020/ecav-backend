/* eslint-disable no-use-before-define */
const mongoose = require('mongoose');
const Estado = require('./estadoModel');
const Categoria = require('./categoriaModel');
const Formacao = require('./formacaoModel');
const AppError = require('./../utils/appError');
const ErrorMessage = require('./../utils/error');

const licaoSchema = new mongoose.Schema(
  {
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
      type: mongoose.Schema.ObjectId,
      ref: 'formacoes',
      required: true
    },
    formacao_detalhe: {
      type: Object,
      // required: true
    },
    categoria: {
      type: Object,
      required: false
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

licaoSchema.pre('save', async function(next) {
  if (this.categoria) {
    this.categoria = await Categoria.findById(
      this.categoria
    );
    if (!this.categoria)
      return next(
        new AppError(
          ErrorMessage[21].message,

          400
        )
      );
  }
  this.formacao_detalhe = await Formacao.findById(this.formacao);
  this.estado = await Estado.findOne(
    {
      estadoCode: {
        $eq: this.estado
      }
    }
  );

  if (!this.formacao_detalhe) return next(new AppError('Falta a Formação na Lição', 400));
  if (!this.estado)
    return next(
      new AppError(
        ErrorMessage[22].message,

        400
      )
    );

  next();
});

// licaoSchema.pre(/^find/, async function(next) {
//   this.populate({
//     path: 'formacao',
//     select: '_id nome estado formadores categorias horarios quantidadeAlunoMax -licoes'
//   });
//   next();
// });

const Licao = mongoose.model('licoes', licaoSchema);

module.exports = Licao;
