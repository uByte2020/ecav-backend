const moment = require('moment');
const Marcacao = require('../models/marcacaocaoModel');
const Formador = require('../models/userModel');
const Parameter = require('../models/parameterModel');
const Estado = require('../models/estadoModel');
const factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getMyMarcacoes = (req, res, next) => {
  if (req.user.role.perfilCode == 1) req.query.formador = req.user.id;
  else req.query.alunos = req.user.id;
  next();
};

exports.getAlunoMarcacaos = (req, res, next) => {
  if (req.params.alunoId) req.query.alunos = req.params.alunoId;
  next();
};

exports.getFormadorMarcacaos = (req, res, next) => {
  if (req.params.formadorId) req.query.formador = req.params.formadorId;
  next();
};

const addDisponibilidadeFormador = async (formadorId, data) => {
  const old_doc = await Formador.findById(formadorId);
  if (!old_doc) return;
  old_doc.indisponibilidade.push(data);
  await Formador.findByIdAndUpdate(
    { _id: formadorId },
    { $addToSet: { indisponibilidade: data } },
    {
      runValidators: true,
      upsert: true
    }
  );
};

exports.validateData = (req, res, next) => {
  if (!req.body.alunos) req.body.alunos = req.user.id;
  req.body.data = new Date(req.body.data);
  req.body.estado = 3;
  next();
};

exports.checkLimitAlunosMarcacao = catchAsync(async (req, res, next) => {
  const old_doc = await Marcacao.findOne({
    data: req.body.data,
    licao: req.body.licao,
    formador: req.body.formador
  });
  if (old_doc && (old_doc.alunos.lenght >= (old_doc.licao.formacao.quantidadeAlunoMax||process.env.LIMIT_ALUNO_BY_MARCACAO)))
      return next(new AppError("O limite de Alunos Por Marcação foi Atingido. Por favor, marque para outro Horário", 500));
  req.old_doc = old_doc;
  next();
});

exports.checkLimitMarcacaoPorDia = catchAsync(async (req, res, next) => {
  const startDate = moment(req.body.data).startOf('day');
  const endDate = moment(req.body.data).endOf('day');
  const old_doc = await Marcacao.find({
    data: {
      $gte: startDate, 
      $lt: endDate
    },
    alunos: req.body.alunos
  });
  if (old_doc.length>0)
      return next(new AppError("Apenas 1 Marcação por dia", 500));
  next();
});

exports.checkLimitMarcacaoPorTempo = catchAsync(async (req, res, next) => {

  const parameters = await Parameter.find();

  if(!parameters) return next();

  const parameter = parameters[0];

  const startDate = moment(req.body.data).startOf('day');
  const endDate = moment(req.body.data).add(parameter.periodoDias, 'days').endOf('day');
  const docs = await Marcacao.find({
    data: {
      $gte: startDate, 
      $lt: endDate
    },
    alunos: req.body.alunos
  });
  if (docs && docs.length>=parameter.marcacaoPorPeriodo)
      return next(new AppError("Apenas "+parameter.marcacaoPorPeriodo+" Marcações por "+parameter.periodoDias+" dias!", 500));
  next();
});

exports.createMarcacao = catchAsync(async (req, res, next) => {
  let doc = {};
  
  if (req.old_doc) {
    doc = await Marcacao.findByIdAndUpdate(
      { _id: req.old_doc._id },
      { $addToSet: { alunos: req.body.alunos } },
      {
        new: true, //Para devolver o documento actualizado
        runValidators: true,
        upsert: true
      }
    );
  } else {
    await addDisponibilidadeFormador(req.body.formador, req.body.data);
    doc = await Marcacao.create(req.body);
  }

  // this.createLogs(req.user.id, Marcacao, null, doc, req.method);
  res.status(201).json({
    status: 'success',
    data: {
      doc
    }
  });
});

exports.getAlunosByFormador = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Marcacao.find(), req.query)
    .sort()
    .limitFields()
    .paginate();

  const docsTemp = await features.query;

  let docs = docsTemp
    .filter(doc => {
      return doc.formador._id.toString() === req.params.formadorId;
    })
    .map(doc => doc.aluno);

  docs = docs.filter((aluno, i) => docs.indexOf(aluno) === i);

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: {
      docs
    }
  });
});

exports.validateState = catchAsync(async (req, res, next) => {
  if (req.body.estado) {
    const estadoResult = await Estado.findOne({ estadoCode: req.body.estado });
    if (!estadoResult) return next(new AppError('Campo estado inválido!', 500));
    req.body.estado = estadoResult;
  }
  next();
});

exports.getMarcacao = factory.getOne(Marcacao);
exports.getAllMarcacoes = factory.getAll(Marcacao);
// exports.createMarcacao = factory.createOne(Marcacao);
exports.updateMarcacao = factory.updateOne(Marcacao);
exports.deleteMarcacao = factory.deleteOne(Marcacao);
