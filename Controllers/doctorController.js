const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
require("../Models/doctorModel");
require("../Models/clinicModel");
require("../Models/appointmentModel");
require('../Models/usersModel');
const fs = require('fs')
const helper = require("../helper/helperFunctions");
const DoctorSchema = mongoose.model("doctors");
const ClinicSchema = mongoose.model("clinics");
const AppointmentSchema = mongoose.model("appointments");
const UserSchema = mongoose.model('users');

exports.getAllDoctors = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   DoctorSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, _id: 0},
   })
   .sort(sortAndFiltering.sortedFields)
   .then(function(result) {
      if(result.length > 0) {
         response.status(200).json(result);
      }
      else {
         let error = new Error("Empty");
         error.status = 403;
         next(error);
      }
   }).catch(function(error) {
      next(error);
   })
}

exports.getDoctorById = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   DoctorSchema.findOne({_id: request.params.id}, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, _id: 0}
   })
   .then((data) => {
      if (data) {
         response.status(201).json(data);
      } else {
         next(new Error("This doctor does not exist"));
      }
   })
   .catch((error) => {
      next(error);
   });
};

//post required field only while email and password is post into user collection not doctor collection 
exports.addDoctor = (request, response, next) => {
   const hash = bcrypt.hashSync(request.body.password, salt);
   let bodyClinic = helper.intoNumber(...request.body.clinic);
   ClinicSchema.find({_id: {$in: bodyClinic}}, {doctors: 1, _id: 0}).then((clinicData) => {
      if (clinicData.length == bodyClinic.length) {
         let doctorIds = [];
         clinicData.forEach((id) => {
            doctorIds.push(...id.doctors);
         })
         DoctorSchema.find({_id: {$in: doctorIds}}, {firstName: 1, lastName: 1, _id: 0})
            .then((doctorData) => {
               let flag = doctorData.some(function (doctor) {
                  return request.body.firstName == doctor.firstName && request.body.lastName == doctor.lastName
               })
               if (flag) {
                  next(new Error("You cannot add two doctors with the same name in the same clinic"));
               }
               else {
                  UserSchema.findOne({email: request.body.email}).then(function(data){
                     if(data == null) {
                        let newDoctor = new DoctorSchema(
                           {
                              firstName: request.body.firstName,
                              lastName: request.body.lastName,
                              age: request.body.age,
                              address: request.body.address,
                              phone: request.body.phone,
                              clinic: bodyClinic,
                              specialty: request.body.specialty,
                              image: "uploads/images/doctors/doctor.png"
                        });
                        newDoctor.save().then((result) => {
                              ClinicSchema.updateMany({ _id: {$in: request.body.clinic}}, {$push: {doctors: result._id}})
                              .then(function () {
                                 let newUser = new UserSchema({
                                    email: request.body.email,
                                    password: hash,
                                    userId: result._id,
                                    role: 'doctor'
                                 })
                                 newUser.save().then(function() {
                                    response.status(200).json(result)
                                 })
                              }).catch((error) => {
                                 next(error);
                              });
                        }).catch((error) => {
                           next(error);
                        });
                     }
                     else {
                        next(new Error("This email is already used"));
                     }
                  }).catch(function(error) {
                     next(error);
                  })
               }
            });
      }
      else {
         next(new Error("One of these clinics dosen't exist"));
      }
   })
};

exports.updateDoctorById = (request, response, next) => {
   let nameProperty = ["firstName", "lastName", "age", "address", "phone"]
   updateDoctor(nameProperty, request, response, next)      
};

exports.changeDoctorImageById = (request, response, next) => {
   DoctorSchema.updateOne({id: request.params.id}, {
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

exports.deleteDoctorById = (request, response, next) => {   
   UserSchema.deleteOne({role: "doctor", userId: request.params.id}).then(function() {
      DoctorSchema.findOneAndDelete({
         _id: request.params.id
      }).then(result => {
         if(result != null) {            
            AppointmentSchema.deleteOne({
               doctorName: parseInt(request.params.id)
            }).then(function() {
                  ClinicSchema.updateMany({
                     doctors: parseInt(request.params.id)
                  }, {
                     $pull: { doctors: parseInt(request.params.id) }
                  }).then(function(){
                     fs.unlink("uploads/images/doctors/" + request.params.id + ".png", function (result) {
                        if (result) {
                           console.log("This image is not found");
                           response.status(200).json({Deleted: false});
                        } else {
                           console.log("File removed:", "uploads/images/doctors/" + request.params.id + ".png");
                           response.status(200).json({Deleted: true});
                        }
                     });
                  }).catch(error => {
                     next(error);
                  });
               }).catch(error => {
                  next(error);
               });
         }
         else {
            let error = new Error("This doctor is not found")
            error.status = 403;
            next(error);
         }
         }).catch(error => {
            next(error);
         })
   })
};

function updateDoctor(nameProperty, request, response, next) {
   let doctorData = {};
   for(let prop of nameProperty) {
      if(request.body[prop] != null) {
         doctorData[prop] = request.body[prop];
      }
   }
   if(doctorData != {}) {
      DoctorSchema.findOneAndUpdate({_id: request.params.id}, {$set: doctorData})
         .then((result) => {
            if(result) {
               if(result.modifiedCount == 0) {
                  response.status(200).json({Updated: true, Message: "Nothing is changed"});
               }
               else {
                  response.status(200).json({Updated: true, Message: "Doctor is updated successfully"});
               }
            }
            else {
               let error = new Error("This doctor is not found");
               error.status = 404;
               next(error);
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