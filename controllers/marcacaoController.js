const Marcacao = require('../models/marcacaocaoModel');
const Formador = require('../models/userModel');
const factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');

exports.getMyMarcacoes = (req, res, next) => {
  if(req.user.role.perfilCode == 1)
    req.query.formador = req.user.id;
  else 
    req.query.aluno = req.user.id;
  next();
};

exports.getAlunoMarcacaos = (req, res, next) => {
  if (req.params.alunoId) req.query.aluno = req.params.alunoId;
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
  await Formador.findByIdAndUpdate(formadorId, old_doc, {
    runValidators: true
  });
};

exports.validateData = (req, res, next) => {
  // if (!req.body.licao) req.body.licao = req.params.licaoId;
  if (!req.body.aluno) req.body.aluno = req.user.id;
  req.body.data = new Date(req.body.data);
  req.body.estado = 3;
  next();
};

exports.createMarcacao = catchAsync(async (req, res, next) => {
  await addDisponibilidadeFormador(req.body.formador, req.body.data);
  const doc = await Marcacao.create(req.body);
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

exports.getMarcacao = factory.getOne(Marcacao);
exports.getAllMarcacoes = factory.getAll(Marcacao);
// exports.createMarcacao = factory.createOne(Marcacao);
exports.updateMarcacao = factory.updateOne(Marcacao);
exports.deleteMarcacao = factory.deleteOne(Marcacao);
