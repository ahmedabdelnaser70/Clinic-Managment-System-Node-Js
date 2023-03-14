const express = require("express");
const router = express.Router();
const controller = require("./../Controllers/specialtyConstroller");
const {specialtyPatch, specialtyPost} = require("../Middlewares/specialtyValidation");
const validationError = require("../Middlewares/errorValidator")
const authenticatioMW = require("../Middlewares/authentication")

router.route("/specialties")
	.all(authenticatioMW.checkAdmin)
	.get(controller.getAllSpecialties)
	.post(...specialtyPost, validationError, controller.addPresciption)

router.route("/specialties/:id?")
	.all(authenticatioMW.checkAdmin)
	.get(controller.getSpecialtyById)
	.patch(...specialtyPatch, validationError, controller.updateSpecialtyName)
	.delete(controller.deleteSpecialty)

module.exports = router;
