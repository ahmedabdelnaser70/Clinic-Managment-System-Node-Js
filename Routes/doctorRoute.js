const express = require("express");
const router = express.Router();
const controller = require("../Controllers/doctorController");
const validator = require("../Middlewares/errorValidator");
const {DoctorValidation} = require("../Middlewares/doctorValidation");
const {uploadDoctor} = require("../Middlewares/uploadImage");
const authenticatioMW = require('../Middlewares/authentication');

router.route("/doctor")
   .all(authenticatioMW.checkAdmin)
   .get(controller.getAllDoctors)
   .post(...DoctorValidation, validator, controller.addDoctor);

router.route("/doctor/:id?")
   .all(authenticatioMW.checkDoctorID)
   .get(controller.getDoctorById)
   .patch(...DoctorValidation, controller.updateDoctorById)
   .delete(authenticatioMW.checkAdmin, controller.deleteDoctorById);

router.route("/doctor/image/:id?")
   .patch(authenticatioMW.checkDoctorID, uploadDoctor, controller.changeDoctorImageById)


module.exports = router;
