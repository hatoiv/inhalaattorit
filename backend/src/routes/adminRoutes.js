const express = require('express');
const adminController = require('../controllers/admin/adminController');
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

router.post('/inhalers', adminController.inhalers.create);
router.put('/inhalers/:id', adminController.inhalers.edit);
router.delete('/inhalers/:id', adminController.inhalers.delete);

router.get('/filters', adminController.filters.get);

router.post('/uploads/:id', upload.single('image'), adminController.uploads.add);
router.delete('/uploads/:id', adminController.uploads.delete);

router.get('/active-ingredient', adminController.activeIngredient.get)
router.post('/active-ingredient', adminController.activeIngredient.create);
router.put('/active-ingredient/:id', adminController.activeIngredient.edit);
router.delete('/active-ingredient/:id', adminController.activeIngredient.delete);

router.get('/drug-class', adminController.drugClass.get);
router.post('/drug-class', adminController.drugClass.create);
router.put('/drug-class/:id', adminController.drugClass.edit);
router.delete('/drug-class/:id', adminController.drugClass.delete);

router.get('/brand', adminController.brand.get);
router.post('/brand', adminController.brand.create);
router.put('/brand/:id', adminController.brand.edit);
router.delete('/brand/:id', adminController.brand.delete);

router.put('/set-last-update', adminController.newDate.setNewDate);

module.exports = router;
