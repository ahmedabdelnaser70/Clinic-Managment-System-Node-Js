const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const fs = require('fs')
const helper = require("../helper/helperFunctions");
require("../Models/employeeModel");
const EmployeeSchema = mongoose.model("employees");
require("./../Models/clinicModel");
const ClinicSchema = mongoose.model("clinics");
require("../Models/usersModel")
const UserSchema = mongoose.model('users');

exports.getAllEmployees = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   EmployeeSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
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
         response.status(200).json({Message: "Empty"});
      }
   }).catch(function(error) {
      next(error);
   })
};

exports.getEmployeeByID = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   EmployeeSchema.findOne({_id: request.params.id}, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, _id: 0}
   })
   .then((data) => {
      if (data) {
         response.status(201).json(data);
      } else {
         let error = new Error("Employee does not exist");
         error.status = 403;
         next(error);
      }
   })
   .catch((error) => {
      next(error);
   });
};

exports.getEmployeeBySSN = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   EmployeeSchema.findOne({SSN: request.params.id}, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, manager: 1, _id: 0}
   })
   .then((data) => {
      if(data.clinic.manager == request.id || request.role == "admin") {
         if (data) {
            response.status(201).json(data);
         } else {
            next(new Error("Employee does not exist"));
         }
      }
      else {
         let error = new Error('Not allow for you to display the information of this employee');
         error.status = 403;
         next(error);
      }
   })
   .catch((error) => {
      next(error);
   });
};

exports.getEmployeesByClinicId = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   EmployeeSchema.find({clinic: request.params.id}, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, _id: 0}
   })
   .then((data) => {
      if (data.length > 0) {
         response.status(201).json(data);
      } else {
         let error = new Error("No employees in this clinic");
         error.status = 403;
         next(error);
      }
   })
   .catch((error) => {
      next(error);
   });
};

//post required field only while email and password is post into user collection not doctor collection 
exports.addEmployee = (request, response, next) => {
   UserSchema.findOne({email: request.body.email}).then(function(data) {
      if(data == null) {
         ClinicSchema.findOne({_id: request.body.clinic}, {_id: 1, __v: 0}).then(function (data) {
            if (data != null) {
               const hash = bcrypt.hashSync(request.body.password, salt);
               let newEmployee = new EmployeeSchema({
                  _id: request.params.id,
                  SSN: request.body.SSN,
                  firstName: request.body.firstName,
                  lastName: request.body.lastName,
                  age: request.body.age,
                  address: request.body.address,
                  job: request.body.job,
                  salary: request.body.salary,
                  phone: request.body.phone,
                  clinic: request.body.clinic,
                  image: "uploads\\images\\employees\\employee.png"
               });
               newEmployee.save()
                  .then((result) => {
                     let newEmail = new UserSchema({
                        email: request.body.email,
                        password: hash,
                        userId: result._id,
                        role: 'employee'
                     })
                     newEmail.save().then(function() {
                        response.status(200).json(result);
                     })
                  })
                  .catch((error) => next(error));
            } else {
               next(new Error("This clinic not found"));
            }
         });
      }
      else {
         next(new Error("This email is already used"))
      }
   }).catch(function(error) {
      next(error);
   })
};

exports.updateEmployee = (request, response, next) => {
   let nameProperty = ["SSN", "firstName", "lastName", "age", "address", "phone"]
   updateEmployee(nameProperty, request, response, next)
};

exports.updateEmployeeByManager = (request, response, next) => {
   EmployeeSchema.findOne({_id: request.params.id}, {_id: 0, clinic: 1})
   .populate({
      path: "clinic",
      select: {manager: 1, _id: 0}
   }).then(function(data) {
      if(data) {
         if(data.clinic.manager == request.id) {
            if(request.body.clinic != undefined) {
               ClinicSchema.findOne({_id: request.body.clinic})
               .then((clinicData) => {
                  if (clinicData) {
                        let nameProperty = ["SSN", "firstName", "lastName", "age", "address", "phone", "job", "clinic", "salary"]
                        updateEmployee(nameProperty, request, response, next)
                     } 
                     else {
                        next(new Error("This clinic does not exist"));
                     }
                  });
            }
            else {
               let nameProperty = ["SSN", "firstName", "lastName", "age", "address", "phone", "job", "salary"]
               updateEmployee(nameProperty, request, response, next)
            }
         }
         else {
            let error = new Error("Not allow for you to update the information of this employee")
            error.status = 403
            next(error)
         }
      }
      else {
         next(new Error("This employee is not found"))
      }
   })
};

exports.changeEmployeeImageById = (request, response, next) => {
   EmployeeSchema.findOneAndUpdate({id: request.params.id}, {
      $set: {
         image: request.file.path
      }
   }).then(function(result) {
      if(result) {
         if(result.modifiedCount == 0) {
            response.status(200).json({Updated: true, Message: "Nothing is changed"});
         }
         else {
            response.status(200).json({Updated: true, Message: "The image is updated successfully"});
         }
      }
      else {
         let error = new Error("This employee is not found");
         error.status = 404;
         next(error);
      }
   })
}

exports.deleteEmployee = (request, response, next) => {
   UserSchema.deleteOne({role: "employee", userId: request.params.id}).then(function() {
      EmployeeSchema.findOneAndDelete({_id: request.params.id})
      .then(result => {
         if(result != null) {            
            fs.unlink("uploads\\images\\doctors\\" + request.params.id + ".png", function (result) {
               if (result) {
                  response.status(200).json({Deleted: false, Message: "This image is not found"});
               } else {
                  console.log("File removed:", "uploads\\images\\doctors\\" + request.params.id + ".png");
                  response.status(200).json({Deleted: true});
               }
            });
         }
         else {
            let error = new Error("This employee is not found")
            error.status = 403;
            next(error);
         }
         }).catch(error => {
            next(error);
         })
   })
};

function updateEmployee(nameProperty, request, response, next) {
   let employeeData = {};
   for(let prop of nameProperty) {
      if(request.body[prop] != null) {
         employeeData[prop] = request.body[prop];
      }
   }
   if(employeeData != {}) {
      EmployeeSchema.findOneAndUpdate({_id: request.params.id}, {$set: employeeData})
         .then((result) => {
            if(result) {
               if(result.modifiedCount == 0) {
                  response.status(200).json({Updated: true, Message: "Nothing is changed"});
               }
               else {
                  response.status(200).json({Updated: true, Message: "Employee is updated successfully"});
               }
            }
            else {
               let error = new Error("This Employee is not found");
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