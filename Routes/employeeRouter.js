const express = require("express");
const router = express.Router();
const {PostEmployeeValidation, PatchEmployeeValidation} = require("../Middlewares/employeeValidation");
const validator = require("../Middlewares/errorValidator");
const controller = require("../Controllers/employeeController");
const {uploadEmployee} = require("../Middlewares/uploadImage");
const authenticatioMW = require('../Middlewares/authentication');

module.exports = router;

router.route("/employees")
   .all(authenticatioMW.checkAdmin)
   .get(controller.getAllEmployees)
   .post(PostEmployeeValidation, validator, controller.addEmployee)

router.route("/employees/:id")
   .all(authenticatioMW.checkEmployeeID)
   .get(controller.getEmployeeByID)
   .patch(PatchEmployeeValidation, validator, controller.updateEmployee)
   .delete(authenticatioMW.checkAdmin, controller.deleteEmployee);

router.route("/employees/manage/:id")
   .all(authenticatioMW.checkAdminOrManager)
   .patch(PatchEmployeeValidation, controller.updateEmployeeByManager)

router.route("/employees/SSN/:id")
   .get(authenticatioMW.checkAdminOrEmployeeOrManager, controller.getEmployeeBySSN);

router.route("/employees/clinic/:id")
   .get(authenticatioMW.checkAdminOrEmployee, controller.getEmployeesByClinicId);

router.route("/employees/image/:id?")
   .patch(authenticatioMW.checkEmployeeID, uploadEmployee, controller.changeEmployeeImageById)