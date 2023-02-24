const express = require("express");
const router = express.Router();
const controller = require("../Controllers/doctorController");
const validator = require("../Middlewares/errorValidator");
const {addDoctorValidation, patchDoctorValidation} = require("../Middlewares/doctorValidation");
const {uploadDoctor} = require("../Middlewares/uploadImage");
const authenticatioMW = require('../Middlewares/authentication');

router.route("/doctors")
   .all(authenticatioMW.checkAdmin)
   .get(controller.getAllDoctors)
   .post(...addDoctorValidation, validator, controller.addDoctor);

router.route("/doctors/:id?")
   .all(authenticatioMW.checkAdminOrDoctor)
   .get(controller.getDoctorById)
   .patch(...patchDoctorValidation, controller.updateDoctorById)
   .delete(authenticatioMW.checkAdmin, controller.deleteDoctorById);

router.route("/doctors/image/:id?")
   .patch(authenticatioMW.checkAdminOrDoctor, uploadDoctor, controller.changeDoctorImageById)


module.exports = router;
