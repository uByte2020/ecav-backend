const express = require('express');
const formadorController = require('./../controllers/marcacaoController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.get('/:formadorId/alunos', formadorController.getAlunosByFormador);

router.use(authController.protect);

router
  .route('/')
  .post(
    formadorController.validateData,
    formadorController.createMarcacao
  );

router 
  .route('/MyMarcacoes')
  .get(
    formadorController.getMyMarcacoes,
    formadorController.getAllMarcacoes
  );

  router
  .route('/')
  .get(authController.restrictTo(0),formadorController.getAllMarcacoes);

// router.use(authController.protect);

router
  .route('/byAluno/:alunoId')
  .get(
    formadorController.getAlunoMarcacaos,
    formadorController.getAllMarcacoes
  )
  .post(formadorController.createMarcacao);

  router
  .route('/byFormador/:formadorId')
  .get(
    formadorController.getFormadorMarcacaos,
    formadorController.getAllMarcacoes
  )
  .post(formadorController.createMarcacao);

router
  .route('/:id')
  .get(formadorController.getMarcacao)
  .patch(formadorController.updateMarcacao)
  .delete(formadorController.deleteMarcacao);

module.exports = router;
