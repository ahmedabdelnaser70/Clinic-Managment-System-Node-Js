const express = require("express");
const router = express.Router();
const patientController = require("../Controllers/patientController");
const validator = require("../Middlewares/errorValidator");
const {patientPost} = require("../Middlewares/patientValidation");
const { upload } = require("../Middlewares/uploadImage");
const clinicController = require("./../Controllers/clinicController");


router.route("/patient")
    .post(upload, patientPost, validator, patientController.addPatient);

router.route("/clinic/services")
	.get(clinicController.getAllClinicServices)

module.exports = router;