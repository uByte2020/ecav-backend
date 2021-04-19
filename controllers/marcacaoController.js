const Marcacao = require('../models/marcacaocaoModel');
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


exports.validateData = (req, res, next) => {
  // if (!req.body.licao) req.body.licao = req.params.licaoId;
  if (!req.body.aluno) req.body.aluno = req.user.id;
  req.body.data = new Date(req.body.data);
  req.body.estado = 3;
  next();
};

exports.getAlunosByFormador = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Marcacao.find(), req.query)
    .sort()
    .limitFields()
    .paginate();

  const docsTemp = await features.query;

  const docs = docsTemp
    .filter(doc => {
      return doc.formador._id.toString() === req.params.formadorId;
    })
    .map(doc => doc.aluno);

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
exports.createMarcacao = factory.createOne(Marcacao);
exports.updateMarcacao = factory.updateOne(Marcacao);
exports.deleteMarcacao = factory.deleteOne(Marcacao);
