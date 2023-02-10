const { body, param } = require("express-validator");

let checkParamid = param("id").isInt().withMessage("Id should be integer");
let invoicePost = [
   body("clinicId").isInt().withMessage("clinicId should be integer"),
   body("patientId").isInt().withMessage("patientId should be integer"),
   body("medicine").isString().withMessage("medicine name must be string"),
   body("quantity").isInt().withMessage("quantity should be integer"),
   body("total").isInt().withMessage("total should be integer"),
];

let invoicePatch = [
   body("clinicId").isInt().withMessage("clinicId should be integer"),
   body("patientId").isInt().withMessage("patientId should be integer"),
   body("medicine").isString().withMessage("medicine name must be string"),
   body("quantity").isInt().withMessage("quantity should be integer"),
   body("total").isInt().withMessage("total should be integer"),
];

module.exports = { invoicePost, invoicePatch, checkParamid };
