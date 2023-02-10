const express = require("express");
const router = express.Router();
const controller = require("./../Controllers/presciptionController");
const {PrescriptionValidation} = require("../Middlewares/prescriptionValidation");
const validationError = require("../Middlewares/errorValidator")
const authenticatioMW = require("../Middlewares/authentication")

router.route("/presciption")
	.get(authenticatioMW.checkAdmin, controller.getAllPresciptions)
	.post(authenticatioMW.checkAdminOrDoctor, ...PrescriptionValidation, validationError, controller.addPresciption)

router.route("/presciption/:id?")
	.all(authenticatioMW.checkAdminOrDoctor)
	.get(controller.getPresciptionById)
	.patch(...PrescriptionValidation, validationError, controller.updatePresciption)
	.delete(controller.deletePresciption)

router.route("/presciption/clinic/:id?")
	.get(authenticatioMW.checkAdminOrDoctor, controller.getPresciptionsByClinicId)

router.route("/presciption/doctor/:id?")
	.get(authenticatioMW.checkAdminOrDoctor, controller.getPresciptionsByDoctorId)
	
router.route("/presciption/patient/:id?")
	.get(authenticatioMW.checkAdminOrPatient, controller.getPresciptionsByPatientId)

module.exports = router;
