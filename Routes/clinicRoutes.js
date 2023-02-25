const express = require("express");
const router = express.Router();
const controller = require("./../Controllers/clinicController");
const {postClinicValidation, patchClinicValidation} = require("../Middlewares/clinicValidation");
const validationError = require("../Middlewares/errorValidator")
const authenticatioMW = require('../Middlewares/authentication');

router.route("/clinics")
	.all(authenticatioMW.checkAdmin)
	.post(...postClinicValidation, validationError, controller.addClinic)

router.route("/clinics/:id?")
	.all(authenticatioMW.checkAdminOrManager)
	.get(controller.getClinicById)
	.patch(...patchClinicValidation, validationError, controller.updateClinic)
	.delete(authenticatioMW.checkAdmin, controller.deleteClinic)

router.route("/clinics/manager/:id?")
	.all(authenticatioMW.checkAdmin)
	.patch(...patchClinicValidation, validationError, controller.updateClinicManager)

module.exports = router;