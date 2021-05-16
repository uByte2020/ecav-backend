const Formacao = require('../models/formacaoModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ErrorMessage = require('./../utils/error');
const APIFeatures = require('./../utils/apiFeatures');

exports.addFormadores = catchAsync(async (req, res, next) => {
  if (!req.params.id || !req.body.formadores)
    return next(new AppError(ErrorMessage[12].message, 400));

  const doc = await Formacao.findOneAndUpdate(
    { _id: req.params.id },
    { $addToSet: { formadores: req.body.formadores } },
    {
      new: true, //Para devolver o documento actualizado
      runValidators: true,
      upsert: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

exports.removeFormador = catchAsync(async (req, res, next) => {
  if (!req.params.id || !req.body.formador)
    return next(new AppError(ErrorMessage[12].message, 400));

  const doc = await Formacao.findOneAndUpdate(
    { _id: req.params.id },
    { $pull: { formadores: req.body.formador } },
    {
      new: true, //Para devolver o documento actualizado
      runValidators: true
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

exports.getAllFormacoes = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Formacao.find().populate({
      path: 'licoes',
      select: '_id nome estado categoria -formacao'
    }),
    req.query
  )
    .filter()
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

exports.getFormacao = catchAsync(async (req, res, next) => {
  const doc = await Formacao.findById(req.params.id).populate({
    path: 'licoes',
    select: '_id nome estado categoria -formacao'
  });
  res.status(200).json({
    status: 'success',
    data: {
      doc
    }
  });
});

// exports.getFormacao = factory.getOne(Formacao);
// exports.getAllFormacoes = factory.getAll(Formacao);
exports.createFormacao = factory.createOne(Formacao);
exports.updateFormacao = factory.updateOne(Formacao);
exports.deleteFormacao = factory.deleteOne(Formacao);
