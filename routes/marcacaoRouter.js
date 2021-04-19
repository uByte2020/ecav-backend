const express = require('express');
const formadorController = require('./../controllers/marcacaoController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.get(
  '/:fornecedoId/alunos',
  formadorController.getAlunosByFormador
);

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

router.use(authController.restrictTo(0, 1));

router
  .route('/aluno/:alunoId')
  .get(
    formadorController.getAlunoMarcacaos,
    formadorController.getAllMarcacoes
  )
  .post(formadorController.createMarcacao);

  router
  .route('/formador/:formadorId')
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
