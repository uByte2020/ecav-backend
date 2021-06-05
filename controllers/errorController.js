const AppError = require('./../utils/appError');
const ErrorMessage = require('./../utils/error');

const handleCastErrorDB = err => {
  const message = `${err.path}: ${err.value} Inválido.`;
  return new AppError(message, 400);
};

const handleDulpicateFieldDB = err => {
  const value = err.errms.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valor de campo duplicado: ${value}, por favor use outro valor!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Dados inválidos. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError(ErrorMessage.ERROR018, 401);
};

const handleTokenExpiredError = () => {
  return new AppError(ErrorMessage.ERROR019, 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message:
        'Lamentamos mas ocorreu um erro. Tente novamente ou Contacte o Administrado!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDulpicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJsonWebTokenError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};
