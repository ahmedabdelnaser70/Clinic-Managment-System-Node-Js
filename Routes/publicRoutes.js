const express = require("express");
const router = express.Router();
const patientController = require("../Controllers/patientController");
const validator = require("../Middlewares/errorValidator");
const {patientPost} = require("../Middlewares/patientValidation");
const clinicController = require("./../Controllers/clinicController");


router.route("/patient")
    .post(patientPost, validator, patientController.addPatient);

router.route("/clinic")
	.get(clinicController.getAllClinic)

router.route("/clinic/services")
	.get(clinicController.getAllClinicServices)

module.exports = router;