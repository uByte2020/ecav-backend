const Parameter = require('../models/parameterModel');
const factory = require('./handlerFactory');

exports.getAllParameter = factory.getOne(Parameter);
exports.getParameter = factory.getAll(Parameter);
exports.createParameter = factory.createOne(Parameter);
exports.updateParameter = factory.updateOne(Parameter);
exports.deleteParameter = factory.deleteOne(_template);
