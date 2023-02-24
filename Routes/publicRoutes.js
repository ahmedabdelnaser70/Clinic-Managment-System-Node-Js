const express = require("express");
const router = express.Router();
const patientController = require("../Controllers/patientController");
const validator = require("../Middlewares/errorValidator");
const {patientPost} = require("../Middlewares/patientValidation");
const clinicController = require("./../Controllers/clinicController");


router.route("/patients")
    .post(patientPost, validator, patientController.addPatient);

router.route("/clinics")
	.get(clinicController.getAllClinic)

module.exports = router;