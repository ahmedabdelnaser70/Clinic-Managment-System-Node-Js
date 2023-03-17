const express = require("express");
const router = express.Router();
const { invoicePost } = require("../Middlewares/invoiceValidation");
const validator = require("../Middlewares/errorValidator");
const controller = require("../Controllers/invoiceController");
const authenticatioMW = require('../Middlewares/authentication');

router.route("/invoices")
	.all(authenticatioMW.checkAdmin)
	.get(controller.getAllInvoice)
	.post(invoicePost, validator, controller.addInvoice)

router.route("/invoices/:id")
	.all(authenticatioMW.checkAdminOrPatient)
	.get(controller.getInvoiceByID)
	.delete(authenticatioMW.checkAdmin, controller.deleteInvoice);

module.exports = router;
