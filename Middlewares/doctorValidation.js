const {body} = require("express-validator");

exports.addDoctorValidation = [
   body("firstName")
      .isAlpha()
      .withMessage("first name must be alpha")
      .isLength({ max: 50 })
      .withMessage("first name characters must be less than or equal 50"),
   body("lastName")
      .isAlpha()
      .withMessage("last name must be alpha")
      .isLength({ max: 50 })
      .withMessage("last name characters must be less than or equal  50"),
   body("age").isInt().withMessage("doctor age must be number"),
   body("email")
      .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .withMessage("enter valid email"),
   body("password").isString().isLength({ min: 5 }).withMessage("password minimun length must be more than or equal 5"),
   body("address").isObject().withMessage("address must be object"),
   body("address.city").isString().withMessage("city must be string with characters less than or equal 20"),
   body("address.street").isString().withMessage("street must be number"),
   body("address.building").isInt().withMessage("building must be number"),
   body("image").optional().isString().withMessage("photo name must be string"),
   body("phone")
      .matches(/^01[0125][0-9]{8}$/)
      .withMessage("enter valid phone number"),
   body("clinic").isArray().withMessage("The clinic must be array"),
   body("clinic").notEmpty().withMessage("The clinic must be not empty"),
   body("clinic.*").isInt().withMessage("Id of any clinic must be number"),
   body("specialty").isString().withMessage("specialty must be a string"),
];

exports.patchDoctorValidation = [
   body("firstName")
      .optional()
      .isAlpha()
      .withMessage("first name must be alpha")
      .isLength({ max: 50 })
      .withMessage("first name characters must be less than or equal 50"),
   body("lastName")
      .optional()
      .isAlpha()
      .withMessage("last name must be alpha")
      .isLength({ max: 50 })
      .withMessage("last name characters must be less than or equal  50"),
   body("age").optional().isInt().withMessage("doctor age must be number"),
   body("email")
      .optional()
      .matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .withMessage("enter valid email"),
   body("password").optional().isString().isLength({ min: 5 }).withMessage("password minimun length must be more than or equal 5"),
   body("address").optional().isObject().withMessage("address must be object"),
   body("address.city").optional().isString().withMessage("city must be string with characters less than or equal 20"),
   body("address.street").optional().isString().withMessage("street must be number"),
   body("address.building").optional().isInt().withMessage("building must be number"),
   body("image").optional().isString().withMessage("photo name must be string"),
   body("phone")
      .optional()
      .matches(/^01[0125][0-9]{8}$/)
      .withMessage("enter valid phone number"),
   body("clinic").optional().isArray().withMessage("The clinic must be array"),
   body("clinic").optional().notEmpty().withMessage("The clinic must be not empty"),
   body("clinic.*").optional().isInt().withMessage("Id of any clinic must be number"),
   body("specialty").optional().isString().withMessage("specialty must be a string"),
];
