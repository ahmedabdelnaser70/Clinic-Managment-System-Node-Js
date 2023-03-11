const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
require("../Models/doctorModel");
require("../Models/clinicModel");
require("../Models/appointmentModel");
require('../Models/usersModel');
require("./../Models/specialtyModel");
const fs = require('fs')
const helper = require("../helper/helperFunctions");
const DoctorSchema = mongoose.model("doctors");
const ClinicSchema = mongoose.model("clinics");
const AppointmentSchema = mongoose.model("appointments");
const UserSchema = mongoose.model('users');
const SpecialtySchema = mongoose.model("specialties");

exports.getAllAvailableDoctors = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("specialty") == -1) {
		sortAndFiltering.selectedFields.specialty = 0;
	}
   sortAndFiltering.reqQuery.availability = true;
   DoctorSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
   .populate([
      {
         path: "clinic",
         select: {location: 1, _id: 0}
      },
      {
         path: "specialty",
         select: {specialty: 1, _id: 0}
      }
   ])
   .sort(sortAndFiltering.sortedFields)
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
			ResponseObject.Message = 'No Doctors are found';
      }
      response.status(200).json(ResponseObject)
   }).catch(function(error) {
      next(error);
   })
}

exports.getAllUnavailableDoctors = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("specialty") == -1) {
		sortAndFiltering.selectedFields.specialty = 0;
	}
   sortAndFiltering.reqQuery.availability = false;
   DoctorSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
   .populate([
      {
         path: "clinic",
         select: {location: 1, _id: 0}
      },
      {
         path: "specialty",
         select: {specialty: 1, _id: 0}
      }
   ])
   .sort(sortAndFiltering.sortedFields)
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
			ResponseObject.Message = 'No Doctors are blocked';
      }
      response.status(200).json(ResponseObject);
   }).catch(function(error) {
      next(error);
   })
}

exports.getDoctorById = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("specialty") == -1) {
		sortAndFiltering.selectedFields.specialty = 0;
	}
   DoctorSchema.find({_id: request.params.id, availability: true}, sortAndFiltering.selectedFields)
   .populate([
      {
         path: "clinic",
         select: {location: 1, _id: 0}
      },
      {
         path: "specialty",
         select: {specialty: 1, _id: 0}
      }
   ])
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
			ResponseObject.Message = 'This doctor is not found';
      }
      response.status(200).json(ResponseObject);
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
		let ResponseObject = {
			Success: true,
			Data: [],
			Message: "The Doctor is added succesfully",
			TotalPages: 1
		}
      if (clinicData.length == bodyClinic.length) {
         let doctorIds = [];
         clinicData.forEach((id) => {
            doctorIds.push(...id.doctors);
         })
         SpecialtySchema.find({_id: request.body.specialty, availability: true})
         .then(function(specialtyResult) {
            if(specialtyResult.length > 0) {
               DoctorSchema.find({_id: {$in: doctorIds}}, {firstName: 1, lastName: 1, _id: 0})
                  .then((doctorData) => {
                     let flag = doctorData.some(function (doctor) {
                        return request.body.firstName == doctor.firstName && request.body.lastName == doctor.lastName
                     })
                     if (flag) {
                        ResponseObject.Success = false;
                        ResponseObject.TotalPages = 1;
                        ResponseObject.Message = "You cannot add two doctors in the one clinic with the same name";
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
                                    specialty: +request.body.specialty,
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
                                       newUser.save().then(function(result) {
                                          ResponseObject.Data = [result];
                                          ResponseObject.Message = "The doctor is added successfully";
                                       })
                                    }).catch((error) => {
                                       next(error);
                                    });
                              }).catch((error) => {
                                 next(error);
                              });
                           }
                           else {
                              ResponseObject.Success = false;
                              ResponseObject.Message = "This is email is already used";
                           }
                        }).catch(function(error) {
                           next(error);
                        })
                     }
                  });
            }
            else {
               ResponseObject.Success = false;
               ResponseObject.Message = "This specialty is not available";
            }
         })
      }
      else {
         ResponseObject.Success = false;
         ResponseObject.Message = "One of the Clinics that you try to add doesn't found";
      }
      response.status(200).json(ResponseObject)
   }).catch(function(error) {
      next(error);
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
               let ResponseObject = {
                  Success: true,
               }
               if(result.modifiedCount == 0) {
                  ResponseObject.Message = "Nothing is changed";
               }
               else {
                  ResponseObject.Message = "The doctor is updated succesfully";
               }
               response.status(201).json(ResponseObject);
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
      ResponseObject.Message = "Nothing is changed";
   }
   response.status(201).json(ResponseObject);
}