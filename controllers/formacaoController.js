const Formacao = require('../models/formacaoModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ErrorMessage = require('./../utils/error');

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


exports.getFormacao = factory.getOne(Formacao);
exports.getAllFormacoes = factory.getAll(Formacao);
exports.createFormacao = factory.createOne(Formacao);
exports.updateFormacao = factory.updateOne(Formacao);
exports.deleteFormacao = factory.deleteOne(Formacao);
