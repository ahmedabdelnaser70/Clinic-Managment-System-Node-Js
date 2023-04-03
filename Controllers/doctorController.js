const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
require("../Models/doctorModel");
require("../Models/clinicModel");
require("../Models/appointmentModel");
require('../Models/usersModel');
require("../Models/specialtyModel");
const fs = require('fs')
const helper = require("../helper/helperFunctions");
const DoctorSchema = mongoose.model("doctors");
const ClinicSchema = mongoose.model("clinics");
const AppointmentSchema = mongoose.model("appointments");
const UserSchema = mongoose.model('users');
const SpecialtySchema = mongoose.model("specialties");

exports.getAllDoctors = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   if(request.query.select && request.query.select.split(',').indexOf("specialty") == -1) {
		sortAndFiltering.selectedFields.specialty = 0;
	}
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
			TotalPages: result.length
		}
      if (result.length > 0) {
         ResponseObject.Message = 'Your request is success';
         response.status(200).json(ResponseObject)
      } 
      else {
         ResponseObject.Success = false;
			ResponseObject.Message = 'No Doctors are found';
         response.status(200).json(ResponseObject)
      }
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
   DoctorSchema.find({_id: request.params.id}, sortAndFiltering.selectedFields)
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
			TotalPages: result.length
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

exports.addDoctor = (request, response, next) => {
   const hash = bcrypt.hashSync(request.body.password, salt);
   let bodyClinic = helper.intoNumber(...request.body.clinic);
   ClinicSchema.find({_id: {$in: bodyClinic}}, {doctors: 1, _id: 0}).then((clinicData) => {
		let ResponseObject = {
			Success: true,
         Date: [],
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
               DoctorSchema.find({_id: {$in: doctorIds}}, {firstName: 1, lastName: 1, specialty: 1, _id: 0})
                  .then((doctorData) => {
                     let flagSpecialty = doctorData.some(function (doctor) {
                        return request.body.specialty == doctor.specialty;
                     })
                     if (flagSpecialty) {
                        ResponseObject.Success = false;
                        ResponseObject.TotalPages = 1;
                        ResponseObject.Message = "You cannot add two doctors in the one clinic with the same specialty";
                        response.status(201).json(ResponseObject)
                     }
                     else {
                        UserSchema.findOne({email: request.body.email}).then(function(data){
                           if(data == null) {
                              let newDoctor = new DoctorSchema(
                                 {
                                    SSN: request.body.SSN,
                                    firstName: request.body.firstName,
                                    lastName: request.body.lastName,
                                    age: request.body.age,
                                    address: request.body.address,
                                    phone: request.body.phone,
                                    clinic: bodyClinic,
                                    specialty: +request.body.specialty,
                                    image: "uploads/images/doctors/doctor.png",
                                    availability: true
                              });
                              newDoctor.save().then((result) => {
                                 result.populate([
                                    {
                                       path: "clinic",
                                       select: {location: 1, _id: 0}
                                    },
                                    {
                                       path: "specialty",
                                       select: {specialty: 1, _id: 0}
                                    }
                                 ]).then(function() {
                                    ClinicSchema.updateMany({ _id: {$in: request.body.clinic}}, {$push: {doctors: result._id}})
                                    .then(function () {
                                       let newUser = new UserSchema({
                                          email: request.body.email,
                                          password: hash,
                                          SSN: request.body.SSN,
                                          userId: result._id,
                                          role: 'doctor',
                                          availability: true
                                       })
                                       newUser.save().then(function() {
                                          ResponseObject.Data = [result];
                                          ResponseObject.Message = "The doctor is added successfully";
                                          response.status(201).json(ResponseObject)
                                       })
                                    }).catch((error) => {
                                       next(error);
                                    });
                                 })
                              }).catch((error) => {
                                 next(error);
                              });
                           }
                           else {
                              ResponseObject.Success = false;
                              ResponseObject.Message = "This is email is already used";
                              response.status(201).json(ResponseObject)
                           }
                        }).catch(function(error) {
                           next(error);
                        })
                     }
                  });
            }
            else {
               ResponseObject.Success = false;
               ResponseObject.Message = "This specailty is not found";
               response.status(201).json(ResponseObject);
            }
         })
      }
      else {
         ResponseObject.Success = false;
         ResponseObject.Message = "One of the Clinics that you try to add doesn't found";
         response.status(201).json(ResponseObject)
      }
   }).catch(function(error) {
      next(error);
   })
};

exports.updateDoctorById = (request, response, next) => {
   let nameProperty = ["firstName", "lastName", "age", "address", "phone"]
   updateDoctor(nameProperty, request, response, next)      
};

exports.updateDoctorByManager = (request, response, next) => {
   let nameProperty = ["firstName", "lastName", "age", "address", "phone", "clinic", "specialty", "availability"]
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
   }).catch(function(error) {
      next(error);
   })
}

exports.deleteDoctorById = (request, response, next) => {   
   let ResponseObject = {
      Success: true,
   }
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
                           ResponseObject.Success = false
                           ResponseObject.Message = "This image is not found";
                        } else {
                           console.log("File removed:", "uploads/images/doctors/" + request.params.id + ".png");
                           ResponseObject.Success = true;
                           ResponseObject.Message = "The doctor is deleted successfully";
                        }
                        response.status(200).json(ResponseObject);
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
   let ResponseObject = {
      Success: true,
   }
   for(let prop of nameProperty) {
      if(request.body[prop] != null) {
         doctorData[prop] = request.body[prop];
      }
   }
   if(Object.keys(doctorData).length > 0) {
      if(request.body.clinic == "clinic") {
         DoctorSchema.findOne({_id: request.params.id}, {clinic: 1, _id: 0}).then(function(data) {
            if(data != null) {
               let oldClinics = data.clinic;
               let unique = Array.from(new Set([...request.body.clinic]))
               ClinicSchema.find({_id: {$in: unique}}).then(function(data) {
                  if(data.length == unique.length) {
                     if(request.body.specialty != undefined) {
                        DoctorSchema.find({clinic: {$in: [...request.body.clinic]}}, {specialty: 1, _id: 0}).then(function(DoctorData) {
                           let flagSpecialty = DoctorData.some(function (doctor) {
                              return request.body.specialty == doctor.specialty;
                           })
                           if(flagSpecialty) {
                              ResponseObject.Success = false;
                              ResponseObject.Message = "You cannot add two doctors in the same clinic with same specialty";
                              response.status(201).json(ResponseObject);
                           }
                           else {
                              DoctorSchema.updateOne({_id: request.params.id}, {$set: doctorData}).then(function(result) {
                                 if(result.modifiedCount == 0) {
                                    ResponseObject.Message = "Nothing is changed";
                                 }
                                 else {
                                    if(unique.length > oldClinics.length) { // add
                                       let newClinic = unique.filter(function(e) {
                                          return oldClinics.indexOf(e) == -1;
                                       })
                                       ClinicSchema.updateMany({_id: {$in: newClinic}}, {$push: {doctor: +(request.params.id)}}).then(function() {
                                          ResponseObject.Message = "This doctor is updated successfully";
                                       })
                                       
                                    }
                                    else if(unique.length < oldClinics.length) { // delete
                                       let deletedClinic = oldClinics.filter(function(e) {
                                          return unique.indexOf(e) == -1;
                                       })
                                       ClinicSchema.updateMany({_id: {$in: deletedClinic}}, {$pull: {doctor: +(request.params.id)}}, {multi: true}).then(function() {
                                          ResponseObject.Message = "This doctor is updated successfully";
                                       })
                                    }
                                    else { // add & delete
                                       let newClinic = unique.filter(function(e) {
                                          return oldClinics.indexOf(e) == -1;
                                       })
                                       let deleteClinic = oldClinics.filter(function(e) {
                                          return unique.indexOf(e) == -1;
                                       })
                                       ClinicSchema.updateMany({_id: {$in: newClinic}}, {$push: {doctor: +(request.params.id)}}).then(function() {
                                          ClinicSchema.updateMany({_id: {$in: deleteClinic}}, {$pull: {doctor: +(request.params.id)}}, {multi: true}).then(function() {
                                             ResponseObject.Message = "This doctor is updated successfully";
                                          })
                                       })
                                    }
                                 }
                                 if(request.body.availability != undefined) {
                                    UserSchema.updateOne({userId: request.params.id, role: "doctor"}, {$set: {availability: request.body.availability}}).then(function() {
                                       response.status(201).json(ResponseObject);
                                    }).catch(function(error) {
                                       next(error);
                                    })
                                 }
                                 else {
                                    response.status(201).json(ResponseObject);
                                 }
                              }).catch(function(error) {
                                 next(error);
                              })
                           }
                        })
                     }
                     else {
                        DoctorSchema.updateOne({_id: request.params.id}, {$set: doctorData}).then(function(result) {
                           if(result.modifiedCount == 0) {
                              ResponseObject.Message = "Nothing is changed";
                           }
                           else {
                              if(unique.length > oldClinics.length) { // add
                                 let newClinic = unique.filter(function(e) {
                                    return oldClinics.indexOf(e) == -1;
                                 })
                                 ClinicSchema.updateMany({_id: {$in: newClinic}}, {$push: {doctor: +(request.params.id)}}).then(function() {
                                    ResponseObject.Message = "This doctor is updated successfully";
                                 })
                                 
                              }
                              else if(unique.length < oldClinics.length) { // delete
                                 let deletedClinic = oldClinics.filter(function(e) {
                                    return unique.indexOf(e) == -1;
                                 })
                                 ClinicSchema.updateMany({_id: {$in: deletedClinic}}, {$pull: {doctor: +(request.params.id)}}, {multi: true}).then(function() {
                                    ResponseObject.Message = "This doctor is updated successfully";
                                 })
                              }
                              else { // add & delete
                                 let newClinic = unique.filter(function(e) {
                                    return oldClinics.indexOf(e) == -1;
                                 })
                                 let deleteClinic = oldClinics.filter(function(e) {
                                    return unique.indexOf(e) == -1;
                                 })
                                 ClinicSchema.updateMany({_id: {$in: newClinic}}, {$push: {doctor: +(request.params.id)}}).then(function() {
                                    ClinicSchema.updateMany({_id: {$in: deleteClinic}}, {$pull: {doctor: +(request.params.id)}}, {multi: true}).then(function() {
                                       ResponseObject.Message = "This doctor is updated successfully";
                                    })
                                 })
                              }
                           }
                           if(request.body.availability != undefined) {
                              UserSchema.updateOne({userId: request.params.id, role: "doctor"}, {$set: {availability: request.body.availability}}).then(function() {
                                 response.status(201).json(ResponseObject);
                              }).catch(function(error) {
                                 next(error);
                              })
                           }
                           else {
                              response.status(201).json(ResponseObject);
                           }
                        }).catch(function(error) {
                           next(error);
                        })
                     }
                  }
                  else {
                     let error = new Error(`You cannot add doctor doesn't found`);
                     error.status = 404;
                     next(error);			
                  }
               })
            }
            else {
               let error = new Error(`One of the clinic doesn't found`);
               error.status = 404;
               next(error);	
            }
         }).catch(function(error) {
            next(error);
         })
      }
      else {
         DoctorSchema.findOne({_id: request.params.id}, {clinic: 1, _id: 0}).then(function(res) {
            DoctorSchema.find({clinic: {$in: [...res.clinic]}}, {specialty: 1, _id: 0}).then(function(DoctorData) {
               let flagSpecialty = DoctorData.some(function (doctor) {
                  return request.body.specialty == doctor.specialty;
               })
               if(flagSpecialty) {
                  ResponseObject.Success = false;
                  ResponseObject.Message = "You cannot add two doctors in the same clinic with same specialty";
                  response.status(201).json(ResponseObject);
               }
               else {
                  DoctorSchema.updateOne({_id: request.params.id}, {$set: doctorData})
                  .then((result) => {
                     if(result) {
                        if(result.modifiedCount == 0) {
                           ResponseObject.Message = "Nothing is changed";
                           response.status(201).json(ResponseObject);
                        }
                        else {
                           ResponseObject.Message = "This doctor is updated succesfully";
                           if(request.body.availability != undefined) {
                              UserSchema.updateOne({userId: request.params.id, role: "doctor"}, {$set: {availability: request.body.availability}}).then(function() {
                                 console.log(request.body.availability);
                                 response.status(201).json(ResponseObject);
                              }).catch(function(error) {
                                 next(error);
                              })
                           }
                           else {
                              response.status(201).json(ResponseObject);
                           }
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
            })
         })
      }
   }
   else {
      ResponseObject.Message = "Nothing is changed";
      response.status(201).json(ResponseObject);
   }
}