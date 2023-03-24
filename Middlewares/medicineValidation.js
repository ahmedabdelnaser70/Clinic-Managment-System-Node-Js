const {body} = require("express-validator");

exports.postMedicineValidation = [
	body("name").isString().withMessage("name should be alphabitic"),
	body("description").isString().withMessage("description should be string")
]

exports.patchMedicineValidation = [
	body("name").optional().isString().withMessage("name should be alphabitic"),
	body("description").optional().isString().withMessage("description should be string")
]
