const express = require('express');
const licaoController = require('../controllers/licaoController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/:id').get(licaoController.getLicao);

router
  .route('/byCategoria/:categoria')
  .get(licaoController.getLicoesbyCategoria);

  router
  .route('/byFormacao/:formacao')
  .get(licaoController.getLicoesByFormacao);

router.use(authController.protect);

router.use(authController.restrictTo(0, 1));


router
  .route('/:id')
  .patch(
    licaoController.updateLicao
  )
  .delete(licaoController.deleteLicao);

module.exports = router;
