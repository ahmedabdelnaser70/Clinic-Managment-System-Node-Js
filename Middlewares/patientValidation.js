const {body} = require("express-validator");

let patientPost = [
   body("SSN")
   .matches(/^(?:2|3)\d{13}$/)
   .withMessage("SSN should 14 Number"),
   body("firstName")
      .isString()
      .withMessage("first Name should be string")
      .isLength({ min: 2 })
      .withMessage("length of first Name >2"),
   body("lastName")
      .isString()
      .withMessage("last Name should be string")
      .isLength({ min: 2 })
      .withMessage("length of last Name >2"),
   body("age").isInt().withMessage("age should be integer"),
   body("address").optional().isObject().withMessage("address should be object"),
   body("email")
   .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/)
   .withMessage("enter valid email"),
   body("password").isString().withMessage("password should be string"),
   body("phone").isString().withMessage("phone should be string"),
   body("image").optional().isString().withMessage("photo name must be string"),
   body("availability").optional().isBoolean().withMessage("Availability should be boolean")
];

let patientPatch = [
   body("SSN")
   .optional()
   .matches(/[0-9]{14}/)
   .withMessage("SSN should 14 Number"),
   body("firstName")
      .optional()
      .isString()
      .withMessage("first Name should be string")
      .isLength({ min: 2 })
      .withMessage("length of first Name >2"),
   body("lastName")
      .optional()
      .isString()
      .withMessage("last Name should be string")
      .isLength({ min: 2 })
      .withMessage("length of last Name >2"),
   body("age").optional().isInt({ min: 1 }).withMessage("age should be integer and min age = 1"),
   body("address").optional().isObject().withMessage("address should be object"),
   body("address.city").optional().isString().withMessage("city should be a string"),
   body("address.street").optional().isString().withMessage("street should be a string"),
   body("address.building").optional().isInt().withMessage("building should be a integer"),
   body("emali").optional().matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/)
   .withMessage("enter valid email"),
   body("password").optional().isString().withMessage("password should be string"),
   body("phone").optional().isString().withMessage("phone should be string"),
   body("image").optional().isString().withMessage("photo name must be string"),
   body("availability").optional().isBoolean().withMessage("Availability should be boolean")

];

module.exports = {patientPost, patientPatch};
