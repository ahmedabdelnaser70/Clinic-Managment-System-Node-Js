const {body} = require("express-validator");

exports.patchUserValidation = [
	body("email").optional().matches(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).withMessage("enter valid email"),
	body("password").optional().isString().isLength({min: 5}).withMessage("password minimun length must be more than or equal 5")
]