const express = require('express');
const router = express.Router();
const controller = require('../Controllers/appointmentController');
const validator = require('../Middlewares/errorValidator');
const { appointmentValidation } = require("../Middlewares/appointmentValidation");
const authenticationMW = require("../Middlewares/authentication");

router.route('/appointments')
    .all(authenticationMW.checkAdmin)
    .get(controller.getAllAppointments)
    .post(...appointmentValidation, validator, controller.addAppointment)

router.route('/appointments/:id?')
    .all(authenticationMW.checkAdmin)
    .get(controller.getAppointmentById)
    .patch(...appointmentValidation, validator, controller.updateAppointmentById)
    .delete(controller.deleteAppointmentById)

module.exports = router;