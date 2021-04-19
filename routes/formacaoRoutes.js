const express = require('express');
const formacaoController = require('../controllers/formacaoController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/:id/formadores')
  .patch(
    authController.protect,
    authController.restrictTo(0, 1),
    formacaoController.addFormadores
  )
  .delete(
    authController.protect,
    authController.restrictTo(0, 1),
    formacaoController.removeFormador
  );

router
  .route('/')
  .get(formacaoController.getAllFormacoes)
  .post(
    authController.protect,
    authController.restrictTo(0, 1),
    formacaoController.createFormacao
  );

router
  .route('/:id')
  .get(formacaoController.getFormacao)
  .patch(
    authController.protect,
    authController.restrictTo(0, 1),
    formacaoController.updateFormacao
  )
  .delete(
    authController.protect,
    authController.restrictTo(0, 1),
    formacaoController.deleteFormacao
  );

module.exports = router;
