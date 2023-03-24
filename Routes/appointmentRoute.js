const express = require('express');
const router = express.Router();
const controller = require('../Controllers/appointmentController');
const validator = require('../Middlewares/errorValidator');
const {postAppointmentValidation, patchAppointmentValidation} = require("../Middlewares/appointmentValidation");
const authenticationMW = require("../Middlewares/authentication");

router.route('/appointments')
    .all(authenticationMW.checkAdmin)
    .get(controller.getAllAppointments)
    .post(...postAppointmentValidation, validator, controller.addAppointment)

router.route('/appointments/:id?')
    .all(authenticationMW.checkAdmin)
    .get(controller.getAppointmentById)
    .patch(...patchAppointmentValidation, validator, controller.updateAppointmentById)
    .delete(controller.deleteAppointmentById)

router.route('/appointments/book/:id?')
    .all(authenticationMW.checkPatient)
    .patch(...patchAppointmentValidation, validator, controller.bookAppointment)

module.exports = router;