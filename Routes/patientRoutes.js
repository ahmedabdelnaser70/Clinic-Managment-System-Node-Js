const express = require("express");
const router = express.Router();
const controller = require("../Controllers/patientController");
const validator = require("../Middlewares/errorValidator");
const {patientPatch, checkparamid } = require("../Middlewares/patientValidation");
const { upload } = require("../Middlewares/uploadImage");
const authenticatioMW = require("../Middlewares/authentication");

router
   .route("/patient")
   .get(authenticatioMW.checkAdmin, controller.getAllPatient)

router
   .route("/patient/:id")
   .all(authenticatioMW.checkAdminOrPatient, checkparamid, validator)
   .get(controller.getPatientById)
   .patch(upload, patientPatch, validator, controller.updatePatient)
   .delete(authenticatioMW.checkAdmin, controller.deletePatient);

module.exports = router;
