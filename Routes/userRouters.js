const express = require("express");
const router = express.Router();
const controller = require("../Controllers/userController");
const validator = require("../Middlewares/errorValidator");
const {patchUserValidation} = require("../Middlewares/userVildation");
const authenticatioMW = require("../Middlewares/authentication");

router.route("/users/email")
	.all(authenticatioMW.checkPatientOrDoctorOrEmployee)
	.patch(...patchUserValidation, validator, controller.updateEmail)

router.route("/users/password")
	.all(authenticatioMW.checkPatientOrDoctorOrEmployee)
	.patch(...patchUserValidation, validator,controller.updatePassword)

module.exports = router;
