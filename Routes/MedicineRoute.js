const express = require('express');
const router = express.Router();
const medicineController = require('../Controllers/MedicineController')
const {postMedicineValidation, patchMedicineValidation} = require("../Middlewares/medicineValidation");
const validationError = require("../Middlewares/errorValidator");
const authenticationMW = require("../Middlewares/authentication");

router.route("/medicines")
    .all(authenticationMW.checkAdminOrDoctor)
    .get(medicineController.getAllMedicines)
    .post(authenticationMW.checkAdmin, postMedicineValidation, validationError, medicineController.addMedicine); 

router.route("/medicines/:id")
    .all(authenticationMW.checkAdmin)
    .get(medicineController.getMedicineById)
    .patch(patchMedicineValidation, validationError, medicineController.updateMedicineById)
    .delete(medicineController.deleteMedicineById)

module.exports = router;