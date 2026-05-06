const express = require('express');
const inhalersController = require('../controllers/inhalersController');
const router = express.Router();

router.get('/', inhalersController.getInhalers);
router.get('/filters', inhalersController.getFilters);
router.get('/last-updated', inhalersController.getLastUpdated);

module.exports = router;