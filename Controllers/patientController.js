const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const fs = require('fs')
const helper = require("../helper/helperFunctions");
require("../Models/patientModel");
require("../Models/usersModel");
const PatientSchema = mongoose.model("patients");
const UserSchema = mongoose.model("users");

exports.getAllPatient = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   PatientSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
   .sort(sortAndFiltering.sortedFields)
   .then(function(result) {
      let ResponseObject = {
			Success: true,
			Data: result,
			// PageNo: request.length,
			// ItemsNoPerPages: Number,
			TotalPages: request.length
		}
      if (result.length > 0) {
         ResponseObject.Message = 'Your request is success';
      } 
      else {
         ResponseObject.Success = false;
			ResponseObject.Message = 'This patient is not found';
      }
      response.status(200).json(ResponseObject);
   }).catch(function(error) {
      next(error);
   })
};

exports.getPatientById = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   PatientSchema.find({_id: request.params.id}, sortAndFiltering.selectedFields)
   .then((result) => {
      let ResponseObject = {
			Success: true,
			Data: result,
			// PageNo: request.length,
			// ItemsNoPerPages: Number,
			TotalPages: request.length
		}
      if (result.length > 0) {
         ResponseObject.Message = 'Your request is success';
      } 
      else {
         ResponseObject.Success = false;
			ResponseObject.Message = 'This pateint is not found';
      }
      response.status(200).json(ResponseObject);
   })
   .catch((error) => {
      next(error);
   });
};

exports.addPatient = (request, response, next) => {
   let ResponseObject = {
      Success: true,
      Data: [],
      Message: "The patient is added succesfully",
      TotalPages: 1
   }
   const hash = bcrypt.hashSync(request.body.password, salt);
   UserSchema.findOne({email: request.body.email}).then(function(data) {
      if(data == null) {
         let newPatient = new PatientSchema({
            SSN: request.body.SSN,
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            age: request.body.age,
            address: request.body.address,
            phone: request.body.phone,
            image: "uploads/images/patients/patient.png",
            availability: true
         });
         newPatient.save()
            .then((result) => {
               let newEmail = new UserSchema({
                  email: request.body.email,
                  password: hash,
                  SSN: request.body.SSN,
                  userId: result._id,
                  role: 'patient',
                  availability: true
               })
               newEmail.save().then(function() {
                  ResponseObject.Data = [result];
                  ResponseObject.Message = "The patient is added successfully";
                  response.status(200).json(ResponseObject);
               })
            })
            .catch((error) => next(error));
      }
      else {
         ResponseObject.Success = false;
         ResponseObject.Message = "This is email is already used";
         response.status(200).json(ResponseObject);
      }
   }).catch(function(error) {
      next(error);
   })
};

exports.updatePatient = (request, response, next) => {
   let nameProperty = ["firstName", "lastName", "age", "address", "phone"]
   updatePatientData(nameProperty, request, response, next)
};

exports.updatePatientByAdmin = (request, response, next) => {
   let nameProperty = ["firstName", "lastName", "age", "address", "phone", "availability"];
   updatePatientData(nameProperty, request, response, next)
};

exports.changePatientImageById = (request, response, next) => {
   PatientSchema.updateOne({id: request.params.id}, {
      $set: {
         image: request.file.path
      }
   }).then(function(result) {
		let ResponseObject = {
			Success: true,
		}
		if(result.modifiedCount == 0) {
			ResponseObject.Message = "Nothing is changed";
		}
		else {
			ResponseObject.Message = "The image is updated succesfully";
		}
		response.status(201).json(ResponseObject);
   }).catch(function(error) {
      next(error);
   })
}

exports.deletePatient = (request, response, next) => {
   let ResponseObject = {
      Success: true,
   }
   UserSchema.deleteOne({role: "employee", userId: request.params.id}).then(function() {
      PatientSchema.findOneAndDelete({_id: request.params.id})
      .then(result => {
         if(result != null) {            
            fs.unlink("uploads/images/patients/" + request.params.id + ".png", function (result) {
               if (result) {
                  ResponseObject.Success = false
                  ResponseObject.Message = "This image is not found";
               } else {
                  console.log("File removed:", "uploads/images/patients/" + request.params.id + ".png");
                  ResponseObject.Success = true;
                  ResponseObject.Message = "The patient is deleted successfully";
               }
               response.status(200).json(ResponseObject);
            });
         }
         else {
            let error = new Error("This patients is not found")
            error.status = 403;
            next(error);
         }
         }).catch(error => {
            next(error);
         })
   })
};

function updatePatientData(nameProperty, request, response, next) {
   let PatientData = {};
   let ResponseObject = {
      Success: true,
   }
   for(let prop of nameProperty) {
      if(request.body[prop] != null) {
         PatientData[prop] = request.body[prop];
      }
   }
   if(PatientData != {}) {
      PatientSchema.findByIdAndUpdate({_id: request.params.id}, {$set: PatientData})
         .then((result) => {
            if(result) {
               if(result.modifiedCount == 0) {
                  ResponseObject.Message = "Nothing is changed";
               }
               else {
                  ResponseObject.Message = "This patient is updated successfully";
               }
               response.status(201).json(ResponseObject);
            }
            else {
               let error = new Error("This patient is not found");
               error.status = 404;
               next(error);
            }
         })
         .catch((error) => {
            next(error);
         });
   }
   else {
      ResponseObject.Message = "Nothing is changed";
      response.status(201).json(ResponseObject);
   }
}