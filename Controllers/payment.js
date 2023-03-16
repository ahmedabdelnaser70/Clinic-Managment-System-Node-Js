const mongoose = require("mongoose");
require("../Models/invoiceModel");
const invoiceSchema = mongoose.model("invoices");

var Secret_Key = "sk_test_51MYaafJbL5zohfa0alEKFf75zLL7urT5MJHomVHjPdFPokPCaCzt4KOVpDe1jBMu4FoRrJqvPLko14nYF1jDFlBY00FtvGPQg2";
var stripe = require("stripe")(Secret_Key);
//var Publishable_Key = 'pk_test_51MYaafJbL5zohfa0zpuoN9xtDjTYWA9zNmeoHOtmaOh0TkzIv2s0GZBeHqHojxPfRZXJIsR8V3X2q2mkUialqiPQ00sDMsKKEF'

require("./../Models/clinicModel");
const clinicSchema = mongoose.model("clinics");
require("./../Models/doctorModel");
const doctorSchema = mongoose.model("doctors");
require("./../Models/patientModel");
const patientSchema = mongoose.model("patients");
exports.paymentPost = async (request, response, next) => {
   // create card
   const token = await stripe.tokens.create({
      card: {
         number: "4242424242424242",
         exp_month: 2,
         exp_year: 2024,
         cvc: "314",
      },
   });

   const patient = await patientSchema.findOne({ _id: request.userId });
   const doctor = await doctorSchema.findOne({ _id: request.body.doctorId });
   if (!patient) return next(new Error("patient not exist", 404));

   // create customer
   stripe.customers
      .create({
         amount: request.body.examPrice,
         email: patient.email,
         source: token.id,
         name: patient.firstName + " " + patient.lastName,
         address: {
            postal_code: "452331",
            city: patient.address.city,
            country: "Egypt",
         },
      })
      .then((customer) => {
         return stripe.charges.create({
            amount: request.body.examPrice,
            description: `${doctor.specialty} doctor examination.`,
            currency: "USD",
            customer: customer.id,
         });
      })
      .then(async (charge) => {
         // If no error occurs
         let newInvoice = new invoiceSchema({
            clinicId: doctor.clinic,
            patientId: patient._id,
            services: [{ doctorId: doctor._id, price: charge.amount }],
            quantity: 2,
            total: charge.amount,
         });
         await newInvoice
            .save()
            .then((result) => {
               response.send("Success");
            })
            .catch((error) => next(error));
      })
      .catch((err) => {
         response.send(err); // If some error occurs
      });
};
