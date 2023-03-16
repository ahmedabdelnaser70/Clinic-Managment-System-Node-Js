const express = require("express");
const router = express.Router();
const {PostEmployeeValidation, PatchEmployeeValidation} = require("../Middlewares/employeeValidation");
const validator = require("../Middlewares/errorValidator");
const controller = require("../Controllers/employeeController");
const {uploadEmployee} = require("../Middlewares/uploadImage");
const authenticatioMW = require('../Middlewares/authentication');

router.route("/employees")
   .all(authenticatioMW.checkAdmin)
   .get(controller.getAllEmployees)
   .post(PostEmployeeValidation, validator, controller.addEmployee)

router.route("/employees/:id")
   .all(authenticatioMW.checkAdminOrEmployee)
   .get(controller.getEmployeeByID)
   .patch(PatchEmployeeValidation, validator, controller.updateEmployee)
   .delete(authenticatioMW.checkAdmin, controller.deleteEmployee);

router.route("/employees/manage/:id")
   .all(authenticatioMW.checkAdminOrManagerEmployee)
   .patch(PatchEmployeeValidation, controller.updateEmployeeByManager)

router.route("/employees/image/:id?")
   .patch(authenticatioMW.checkAdminOrEmployee, uploadEmployee, controller.changeEmployeeImageById)


module.exports = router;