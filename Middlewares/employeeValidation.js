const {body} = require("express-validator");

exports.PostEmployeeValidation = [
   body("SSN")
      .matches(/[0-9]{14}/)
      .withMessage("SSN should 14 Number"),
   body("firstName")
      .isString()
      .withMessage("first name should string")
      .isLength({ min: 3, max: 20 })
      .withMessage("lenght of name should be larger than 2 and lower than 21"),
   body("lastName")
      .isString()
      .withMessage("last name should string")
      .isLength({ min: 3, max: 20 })
      .withMessage("lenght of name should be larger than 2 and lower than 21"),
   body("age").isInt().withMessage("age should be integer"),
   body("address").isObject().withMessage("address should be object"),
   body("password").isLength({ min: 8 }).withMessage("length must be >= 8"),
   body("email").isEmail().withMessage("Invalid email"),
   body("phone").isString().withMessage("Invalid phone number"),
   body("job").isString().withMessage("Any employee must have a job"),
   body("salary").isNumeric().withMessage("Any employee must have a salary"),
   body("image").optional().isString().withMessage("image name must be string"),
   body("clinic").isInt().withMessage("clinic Id name must be integar"),
   body("availability").optional().isBoolean().withMessage("Availability should be boolean")
];

exports.PatchEmployeeValidation = [
   body("SSN")
      .optional()
      .matches(/^(?:2|3)\d{13}$/)
      .withMessage("SSN should 14 Number"),
   body("firstName")
      .optional()
      .isString()
      .withMessage("first name should string")
      .isLength({ min: 3, max: 20 })
      .withMessage("lenght of name should be larger than 2 and lower than 21"),
   body("lastName")
      .optional()
      .isString()
      .withMessage("last name should string")
      .isLength({ min: 3, max: 20 })
      .withMessage("lenght of name should be larger than 2 and lower than 21"),
   body("age").optional().isInt().withMessage("age should be integer"),
   body("address").optional().isObject().withMessage("address should be object"),
   body("password").optional().isLength({ min: 8 }).withMessage("length must be >= 8"),
   body("email").optional().isEmail().withMessage("Invalid email"),
   body("phone").optional().isString().withMessage("Invalid phone number"),
   body("job").optional().isString().withMessage("Any employee must have a job"),
   body("salary").optional().isNumeric().withMessage("Any employee must have a salary"),
   body("image").optional().optional().isString().withMessage("image name must be string"),
   body("clinic").optional().isInt().withMessage("clinic Id name must be integar"),
   body("availability").optional().isBoolean().withMessage("Availability should be boolean")
];
