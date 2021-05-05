const Licao = require('../models/licaoModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');
const ErrorMessage = require('./../utils/error');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

const isRequiredFields = (obj, ...reqFields) => {
  const fildObj = Object.keys(obj);

  reqFields.forEach(el => {
    if (!fildObj.includes(el)) return false;
  });
  return true;
};

exports.validateFilds = (req, res, next) => {
  if (
    !isRequiredFields(
      req.body,
      'nome',
      'formacao',
      'categoria'
    )
  ) {
    return next(new AppError(ErrorMessage[15].message, 400));
  }
  next();
};

exports.getLicoesbyCategoria = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Service.find({ 'categoria.categoria': req.params.categoria }),
    req.query
  )
    .sort()
    .limitFields()
    .paginate();

  const docs = await features.query;

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: {
      docs
    }
  });
});

exports.getLicoesByFormacao = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Service.find({ 'formacao.nome': req.params.formacao }),
    req.query
  )
    .sort()
    .limitFields()
    .paginate();

  const docs = await features.query;

  res.status(200).json({
    status: 'success',
    results: docs.length,
    data: {
      docs
    }
  });
});

exports.getLicao = factory.getOne(Licao);
exports.getAllLicoes = factory.getAll(Licao);
exports.createLicao = factory.createOne(Licao);
exports.updateLicao = factory.updateOne(Licao);
exports.deleteLicao = factory.deleteOne(Licao);
