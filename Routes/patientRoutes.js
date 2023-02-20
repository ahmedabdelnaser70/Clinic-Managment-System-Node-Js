const express = require("express");
const router = express.Router();
const controller = require("../Controllers/patientController");
const validator = require("../Middlewares/errorValidator");
const {patientPatch} = require("../Middlewares/patientValidation");
const {uploadPatient} = require("../Middlewares/uploadImage");
const authenticatioMW = require("../Middlewares/authentication");

router.route("/patients")
   .get(authenticatioMW.checkAdmin, controller.getAllPatient)

router.route("/patients/:id?")
   .all(authenticatioMW.checkAdminOrPatient)
   .get(controller.getPatientById)
   .patch(patientPatch, validator, controller.updatePatient)
   .delete(authenticatioMW.checkAdmin, controller.deletePatient);

router.route("/patients/image/:id?")
   .patch(authenticatioMW.checkPatientID, uploadPatient, controller.changePatientImageById)

module.exports = router;
