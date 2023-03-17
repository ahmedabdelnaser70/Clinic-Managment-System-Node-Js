const mongoose = require("mongoose");
require("../Models/invoiceModel");
const invoiceSchema = mongoose.model("invoices");
require("./../Models/doctorModel");
const DoctorShema = mongoose.model("doctors");
require("./../Models/patientModel");
const PatientSchema = mongoose.model("patients");
let Secret_Key = "sk_test_51MYaafJbL5zohfa0alEKFf75zLL7urT5MJHomVHjPdFPokPCaCzt4KOVpDe1jBMu4FoRrJqvPLko14nYF1jDFlBY00FtvGPQg2";
let stripe = require("stripe")(Secret_Key);

exports.paymentPost = async (request, response, next) => {
   // create card
   const token = await stripe.tokens.create({
      card: {
         number: request.body.cardNumber,
         exp_month: request.body.exp_month,
         exp_year: request.body.exp_year,
         cvc: request.body.cvc,
      },
   });
   //Autherization for patient only => no admin, no employee
   PatientSchema.findOne({ _id: request.id}).then(function(patientResult) {
      let ResponseObject = {
			Success: true,
         Message: ""
		}
      if(patientResult) {
         DoctorShema.findOne({_id: request.body.doctorId}, {specialty: 1, _id: 0})
         .populate([
            {
               path: "specialty",
               select: {specialty: 1, _id: 0}
            }
         ]).then(function() {
            stripe.customers
            .create({
               email: request.body.email,
               source: token.id,
               name: patientResult.firstName + " " + patientResult.lastName,
               address: {
                  line1: "TC 9/4 Old MES colony",
                  postal_code: "452331",
                  city: "Assiut",
                  state: "Madhya Pradesh",
                  country: "Egypt",
               },
            })
            .then((customer) => {
               console.log(customer.id);
               return stripe.charges.create({
                  amount: request.body.price, // Charging Rs 25
                  description: request.body.description,
                  currency: "USD",
                  customer: customer.id,
               });
            })
            .then((charge) => {
               let newInvoice = new invoiceSchema({
                  clinicId: request.body.clinicId,
                  patientId: request.id,
                  services: [{doctorId: request.body.doctorId, price: charge.amount}],
                  quantity: 1, //due to the patient can only pay for one service
                  total: charge.amount,
               })
               newInvoice.save()
               .then((result) => {
                  console.log(result);
                  ResponseObject.Message = "Your payment is done successfully";
                  response.status(200).json(ResponseObject);
               })
               .catch((error) => next(error));
            })
            .catch((err) => {
               next(err); // If some error occurs
            });
         })
      }
      else {
         ResponseObject.Message = "patient not exist";
         response.state(404).json(ResponseObject);
      }
   })
};
