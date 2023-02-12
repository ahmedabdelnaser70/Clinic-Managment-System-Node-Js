const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("../Models/doctorModel");
require("../Models/patientModel");
require("../Models/employeeModel");
const DoctorSchema = mongoose.model("doctors");
const PatientSchema = mongoose.model("patients");
const EmployeeSchema = mongoose.model("employees");

module.exports.authentication = (request, response, next) => {
    let token, decodedToken;
    try {
        token = request.get("authorization").split(" ")[1];
        decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        request.id = decodedToken.id;
        request.role = decodedToken.role;
    }
    catch (error) {
        error.status = 403;
        error.message = "Not Authorized";
        next(error);
    }
    next();
}

module.exports.checkAdmin = ((request, response, next)=>{
    if(request.role == 'admin'){
        next();
    }
    else{
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

module.exports.checkAdminOrDoctor = ((request, response, next) => {
    if(request.role == 'admin' || (request.role == 'doctor' && request.id == request.params.id)) {
        next();
    } else {
        let error = new Error('Not allow for you to display the information of this doctor');
        error.status = 403;
        next(error);
    }
})

module.exports.checkDoctorID = ((request, response, next) => {
    if(request.role == 'admin') {
        DoctorSchema.findOne({_id: request.params.id}).then(function(result) {
            if(result != null) {
                next();
            }
            else {
                let error = new Error('This doctor is not found');
                error.status = 403;
                next(error);
            }
        })
    }
    else if(request.role == 'doctor' && request.id == request.params.id) {
        next();
    } 
    else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

module.exports.checkEmployeeID = ((request, response, next) => {
    if(request.role == 'admin') {
        EmployeeSchema.findOne({_id: request.params.id}).then(function(result) {
            if(result != null) {
                next();
            }
            else {
                let error = new Error('This doctor is not found');
                error.status = 403;
                next(error);
            }
        })
    }
    else if(request.role == 'doctor' && request.id == request.params.id) {
        next();
    } 
    else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

module.exports.checkPatientID = ((request, response, next) => {
    if(request.role == 'admin') {
        PatientSchema.findOne({_id: request.params.id}).then(function(result) {
            if(result != null) {
                next();
            }
            else {
                let error = new Error('This doctor is not found');
                error.status = 403;
                next(error);
            }
        })
    }
    else if(request.role == 'doctor' && request.id == request.params.id) {
        next();
    } 
    else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

module.exports.checkAdminOrEmployee = ((request, response, next) => {
    if (request.role == 'admin' || request.role == 'employee') {
        next();
    } else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

module.exports.checkPatientOrEmployee = ((request, response, next) => {
    if (request.role == 'patient' || request.role == 'employee') {
        next();
    } else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

module.exports.checkAdminOrEmployeeOrManager = ((request, response, next) => {
    if (request.role == 'admin' || request.role == 'employee' || request.role == 'doctor') {
        next();
    } else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

module.exports.checkAdminOrPatient = ((request, response, next) => {
    if (request.role == 'admin' || request.role == 'patient') {
        next();
    } else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})