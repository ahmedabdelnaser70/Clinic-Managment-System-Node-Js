const {body} = require("express-validator");

let specialtyPost = [
	body("specialty")
		.isString()
		.withMessage("specialty Name should be string")
		.isLength({min: 5, max: 100 })
		.withMessage("length of specialty Name between 10 and 200"),
	body("availability")
		.optional()
		.isBoolean()
		.withMessage("Availability should be boolean")
];

let specialtyPatch = [
	body("specialty")
		.optional()
		.isString()
		.withMessage("first Name should be string")
		.isLength({min: 10, max: 200 })
		.withMessage("length of specialty Name between 10 and 200"),
	body("availability")
		.optional()
		.isBoolean()
		.withMessage("Availability should be boolean")
];

module.exports = {specialtyPost, specialtyPatch};
