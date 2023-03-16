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
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   EmployeeSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, _id: 0},
   })
   .sort(sortAndFiltering.sortedFields)
   .then(function(result) {
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
			ResponseObject.Message = 'No Employees are found';
      }
      response.status(200).json(ResponseObject)
   }).catch(function(error) {
      next(error);
   })
};

exports.getEmployeeByID = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   EmployeeSchema.find({_id: request.params.id}, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, _id: 0}
   })
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
			ResponseObject.Message = 'This employee is not found';
      }
      response.status(200).json(ResponseObject);
   })
   .catch((error) => {
      next(error);
   });
};

exports.getEmployeeBySSN = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   EmployeeSchema.find({SSN: request.params.id}, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, manager: 1, _id: 0}
   })
   .then((result) => {
      if(request.role == "admin" || result[0].clinic.manager == request.id) {
         let ResponseObject = {
            Success: true,
            Data: result,
            // PageNo: request.length,
            // ItemsNoPerPages: Number,
            TotalPages: result.length
         }
         if (result.length > 0) {
            ResponseObject.Message = 'Your request is success';
            response.status(200).json(ResponseObject);
         } 
         else {
            ResponseObject.Success = false;
            ResponseObject.Message = 'This employee is not found';
            response.status(200).json(ResponseObject);
         }
      }
      else {
         let error = new Error('Not allow for you to display the information of this employee');
         error.status = 503;
         next(error);
      }
   })
   .catch((error) => {
      next(error);
   });
};

exports.getEmployeesByClinicId = (request, response, next) => {
   let sortAndFiltering = helper.sortAndFiltering(request);
   if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
   EmployeeSchema.find({clinic: request.params.id}, sortAndFiltering.selectedFields)
   .populate({
      path: "clinic",
      select: {location: 1, _id: 0}
   })
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
			ResponseObject.Message = 'No employees in this clinic';
      }
      response.status(200).json(ResponseObject);
   })
   .catch((error) => {
      next(error);
   });
};

//post required field only while email and password is post into user collection not doctor collection 
exports.addEmployee = (request, response, next) => {
   UserSchema.findOne({email: request.body.email}).then(function(data) {
      let ResponseObject = {
			Success: true,
         Data: [],
			Message: "The Doctor is added succesfully",
			TotalPages: 1
		}
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
                  image: "uploads/images/employees/employee.png",
                  availability: true
               });
               newEmployee.save()
                  .then((result) => {
                     let newEmail = new UserSchema({
                        email: request.body.email,
                        password: hash,
                        SSN: request.body.SSN,
                        userId: result._id,
                        role: 'employee',
                        availability: true
                     })
                     newEmail.save().then(function() {
                        ResponseObject.Data = [result];
                        ResponseObject.Message = "The employee is added successfully";
                        response.status(201).json(ResponseObject)
                     })
                  })
                  .catch((error) => next(error));
            } else {
               ResponseObject.Success = false;
               ResponseObject.Message = "This clinic that you try to add doesn't found";
               response.status(201).json(ResponseObject)
            }
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
      }
      else {
         let error = new Error("This employee is not found");
         error.status = 404;
         next(error);
      }
   })
}

exports.deleteEmployee = (request, response, next) => {
   let ResponseObject = {
      Success: true,
   }
   UserSchema.deleteOne({role: "employee", userId: request.params.id}).then(function() {
      EmployeeSchema.findOneAndDelete({_id: request.params.id})
      .then(result => {
         if(result != null) {            
            fs.unlink("uploads/images/doctors/" + request.params.id + ".png", function (result) {
               if (result) {
                  console.log("File removed:", "uploads/images/doctors/" + request.params.id + ".png");
                  ResponseObject.Success = false
                  ResponseObject.Message = "This image is not found";
                  }
                  else {
                     console.log("File removed:", "uploads/images/doctors/" + request.params.id + ".png");
                     ResponseObject.Success = true;
                     ResponseObject.Message = "The doctor is deleted successfully";
                  }
                  response.status(200).json(ResponseObject);
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

//Must be rewrite
function updateEmployee(nameProperty, request, response, next) {
   let employeeData = {};
   let ResponseObject = {
      Success: true,
   }
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
                  ResponseObject.Message = "Nothing is changed";
               }
               else {
                  ResponseObject.Message = "This employee is updated successfully";
               }
               response.status(201).json(ResponseObject);
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
      ResponseObject.Message = "Nothing is changed";
      response.status(201).json(ResponseObject);
   }
}