const express = require("express");
const { employeePost, employeePatch, checkParamid } = require("../Middlewares/employeeValidation");
const validator = require("../Middlewares/errorValidator");
const controller = require("../Controllers/employeeController");
const {uploadEmployee} = require("../Middlewares/uploadImage");
const router = express.Router();
const authenticatioMW = require('../Middlewares/authentication');

module.exports = router;

router
   .route("/employees")
   .all(authenticatioMW.checkAdmin)
   .get(controller.get)
   .post(uploadEmployee, employeePost, validator, controller.add)

router
   .route("/employees/:id")
   .all(authenticatioMW.checkAdminOrEmployee, checkParamid, validator)
   .get(controller.getEmployeeByID)
   .patch(uploadEmployee, employeePatch, controller.update)
   .delete(authenticatioMW.checkAdmin, controller.delete);

router.route("/employees/SSN/:id")
   .get(authenticatioMW.checkAdminOrEmployeeOrManager, controller.getEmployeeBySSN);

router.route("/employees/clinic/:id")
   .get(authenticatioMW.checkAdminOrEmployee, controller.getEmployeesByClinicId);
