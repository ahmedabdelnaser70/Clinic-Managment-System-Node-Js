const mongoose = require("mongoose");
const helper = require("../helper/helperFunctions");
require("../Models/invoiceModel");
require("../Models/clinicModel");
require("../Models/patientModel");
require("../Models/doctorModel");
const InvoiceSchema = mongoose.model("invoices");
const DoctorSchema = mongoose.model("doctors");
const PatientSchema = mongoose.model("patients");
const ClinicSchema = mongoose.model("clinics");

exports.getAllInvoice = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("patientId") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("clinicId") == -1) {
		sortAndFiltering.selectedFields.specialty = 0;
	}
   InvoiceSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
   .populate([
      { 
         path: "patientId", 
         select: {firstName: 1, lastName: 1, age: 1, address: 1}
      },
      { 
         path: "clinicId", 
         select: {doctors: 0}
      },
      { 
         path: "services.doctorId", 
         populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}), 
         select: {_id: 0, firstName: 1, lastName: 1, specialty: 1} 
      }
   ])
   .sort(sortAndFiltering.sortedFields)
   .then((result) => {
      let ResponseObject = {
			Success: true,
			Data: result,
			// PageNo: request.length,
			// ItemsNoPerPages: Number,
			TotalPages: result.length
		}
      if (result.length > 0) {
         ResponseObject.Message = 'Your request is success';
         helper.createPdf(result);
         response.status(200).json(ResponseObject)
      } 
      else {
         ResponseObject.Success = false;
			ResponseObject.Message = 'No invoices are found';
         response.status(200).json(ResponseObject)
      }
   })
   .catch((error) => next(error));
};

exports.getInvoiceByID = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("patientId") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("clinicId") == -1) {
		sortAndFiltering.selectedFields.specialty = 0;
	}
   InvoiceSchema.find({_id: request.params.id}, sortAndFiltering.selectedFields)
   .populate([
      { 
         path: "patientId", 
         select: {firstName: 1, lastName: 1, age: 1, address: 1}
      },
      { 
         path: "clinicId", 
         select: {doctors: 0}
      },
      { 
         path: "services.doctorId", 
         populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}), 
         select: {_id: 0, specialty: 1} 
      }
   ])
   .sort(sortAndFiltering.sortedFields)
   .then((result) => {
      let ResponseObject = {
			Success: true,
			Data: result,
			// PageNo: request.length,
			// ItemsNoPerPages: Number,
			TotalPages: result.length
		}
      if (result.length > 0) {
         ResponseObject.Message = 'Your request is success';
         helper.createPdf(result);
         response.status(200).json(ResponseObject)
      } 
      else {
         ResponseObject.Success = false;
			ResponseObject.Message = 'No invoices are found';
         response.status(200).json(ResponseObject)
      }
   })
   .catch((error) => next(error));
};

exports.addInvoice = (request, response, next) => {
   let ResponseObject = {
      Success: true,
      Data: [],
      Message: "The invoice is added succesfully",
      TotalPages: 1
   }
   ClinicSchema.findOne({_id: request.body.clinicId})
   .then(function(result) {
      if(result) {
         let doctorIds = [];
         for(let doctor of request.body.services) {
            for(let id in doctor) {
               if(id == "doctorId")
               doctorIds.push(doctor[id]);
            }
         }
         DoctorSchema.find({_id: {$in: doctorIds}})
         .then(function(doctorResult) {
            if(doctorResult.length == request.body.services.length) {
               PatientSchema.findOne({_id: request.body.patientId})
               .then(function(patientResult){
                  if(patientResult) {
                     let newInvoice = new InvoiceSchema({
                        clinicId: request.body.clinicId,
                        patientId: request.body.patientId,
                        services: request.body.services
                     });
                     newInvoice.save()
                     .then((result) => {
                        InvoiceSchema.findOne({_id: result._id})
                        .populate([
                           { 
                              path: "patientId", 
                              select: {firstName: 1, lastName: 1, age: 1, address: 1}
                           },
                           { 
                              path: "clinicId", 
                              select: {doctors: 0}
                           },
                           { 
                              path: "services.doctorId", 
                              populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}), 
                              select: {_id: 0, specialty: 1} 
                           }
                        ]).then(function(result) {
                           helper.createPdf([result]);
                           ResponseObject.Data.push(result);
                           response.status(201).json(ResponseObject);
                        })
                     })
                     .catch((error) => next(error));
                  }
                  else {
                     ResponseObject.Success = false;
                     ResponseObject.Message = "This patient is not found";
                     response.status(404).json(ResponseObject);
                  }
               })
            }
            else {
               ResponseObject.Success = false;
               ResponseObject.Message = "One of these doctors is not found";
               response.status(404).json(ResponseObject);
            }
         })
      }
      else {
         ResponseObject.Success = false;
         ResponseObject.Message = "This clinic is not found";
         response.status(404).json(ResponseObject);
      }
   })
};

exports.deleteInvoice = (request, response, next) => {
   let ResponseObject = {
      Success: true,
   }
   InvoiceSchema.deleteOne({ _id: request.params.id })
      .then((result) => {
         if (result.acknowledged && result.deletedCount == 1) {
            ResponseObject.Message = "This Invoice is deleted successfully";
            response.status(200).json(ResponseObject);
         } else {
            ResponseObject.Message = "This Invoice is not found";
            response.status(404).json(ResponseObject);
         }
      })
      .catch((error) => next(error));
};