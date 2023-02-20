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
      if(result.length > 0) {
         response.status(200).json(result);
      }
      else {
         response.status(200).json({Message: "Empty"});
      }
   }).catch(function(error) {
      next(error);
   })
};

exports.getPatientById = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   PatientSchema.findOne({_id: request.params.id}, sortAndFiltering.selectedFields)
   .then((data) => {
      if (data) {
         response.status(201).json(data);
      } else {
         let error = new Error("Patient does not exist");
         error.status = 403;
         next(error);
      }
   })
   .catch((error) => {
      next(error);
   });
};

exports.addPatient = (request, response, next) => {
   const hash = bcrypt.hashSync(request.body.password, salt);
   UserSchema.findOne({email: request.body.email}).then(function(data) {
      if(data == null) {
         let newPatient = new PatientSchema({
            _id: request.body.id,
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            age: request.body.age,
            address: request.body.address,
            phone: request.body.phone,
            image: "uploads\\images\\patients\\patient.png"
         });
         newPatient.save()
            .then((result) => {
               let newEmail = new UserSchema({
                  email: request.body.email,
                  password: hash,
                  userId: result._id,
                  role: 'patient'
               })
               newEmail.save().then(function() {
                  response.status(200).json(result);
               })
            })
            .catch((error) => next(error));
      }
      else {
         next(new Error("This email is already used"))
      }
   }).catch(function(error) {
      next(error);
   })
};

exports.updatePatient = (request, response, next) => {
   let nameProperty = ["firstName", "lastName", "age", "address", "phone"]
   updatePatientData(nameProperty, request, response, next)
};

exports.changePatientImageById = (request, response, next) => {
   PatientSchema.updateOne({id: request.params.id}, {
      $set: {
         image: request.file.path
      }
   }).then(function(result) {
      if(result.modifiedCount == 0) {
         response.status(200).json({Updated: true, Message: "Nothing is changed"});
      }
      else {
         response.status(200).json({Updated: true, Message: "The image is updated successfully"});
      }
   })
}

exports.deletePatient = (request, response, next) => {
   UserSchema.deleteOne({role: "employee", userId: request.params.id}).then(function() {
      PatientSchema.findOneAndDelete({_id: request.params.id})
      .then(result => {
         if(result != null) {            
            fs.unlink("uploads\\images\\patients\\" + request.params.id + ".png", function (result) {
               if (result) {
                  response.status(200).json({Deleted: false, Message: "This image is not found"});
               } else {
                  console.log("File removed:", "uploads\\images\\patients\\" + request.params.id + ".png");
                  response.status(200).json({Deleted: true});
               }
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
   for(let prop of nameProperty) {
      if(request.body[prop] != null) {
         PatientData[prop] = request.body[prop];
      }
   }
   if(PatientData != {}) {
      PatientSchema.updateOne({_id: request.params.id}, {$set: PatientData})
         .then((result) => {
            if(result.modifiedCount == 0) {
               response.status(200).json({Updated: true, Message: "Nothing is changed"});
            }
            else {
               response.status(200).json({Updated: true, Message: "Patient is updated successfully"});
            }
         })
         .catch((error) => {
            next(error);
         });
   }
   else {
      response.status(200).json({Updated: true, Message: "Nothing is changed"});
   }
}