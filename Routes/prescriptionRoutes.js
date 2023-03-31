const express = require("express");
const router = express.Router();
const controller = require("./../Controllers/presciptionController");
const {postPrescriptionValidation, patchPrescriptionValidation} = require("../Middlewares/prescriptionValidation");
const validationError = require("../Middlewares/errorValidator")
const authenticatioMW = require("../Middlewares/authentication")

router.route("/presciptions")
	.get(authenticatioMW.checkAdmin, controller.getAllPresciptions)
	.post(authenticatioMW.checkAdminOrDoctorForPrescription, ...postPrescriptionValidation, validationError, controller.addPresciption)

router.route("/presciptions/:id?")
	.all(authenticatioMW.checkAdminOrDoctorForPrescription)
	.get(controller.getPresciptionById)
	.patch(...patchPrescriptionValidation, validationError, controller.updatePresciption)
	.delete(controller.deletePresciption)

router.route("/presciptions/clinic/:id?")
	.get(authenticatioMW.checkAdminOrDoctor, controller.getPresciptionsByClinicId)

router.route("/presciptions/doctor/:id?")
	.get(authenticatioMW.checkAdminOrDoctor, controller.getPresciptionsByDoctorId)
	
router.route("/presciptions/patient/:id?")
	.get(authenticatioMW.checkAdminOrPatient, controller.getPresciptionsByPatientId)

module.exports = router;
