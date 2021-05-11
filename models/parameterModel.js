const mongoose = require('mongoose');

const parameterSchema = new mongoose.Schema({
  parameterCode: {
    type: Number,
    required: true
  },
  periodoDias: {
    type: Number,
    required: true
  },
  marcacaoPorPeriodo: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
});

const Parameter = mongoose.model('parameters', parameterSchema);

module.exports = Parameter;
