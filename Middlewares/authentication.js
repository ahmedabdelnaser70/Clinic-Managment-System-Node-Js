const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("../Models/doctorModel");
require("../Models/patientModel");
require("../Models/employeeModel");
require("../Models/clinicModel");
const ClinicSchema = mongoose.model("clinics");
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

//Used
module.exports.checkAdminOrDoctor = ((request, response, next) => {
    if(request.role == 'admin' || (request.role == 'doctor' && request.id == request.params.id)) {
        next();
    } else {
        let error = new Error('Not allow for you to display or update the information of this doctor');
        error.status = 403;
        next(error);
    }
})

//Used
module.exports.checkAdminOrDoctorForPrescription = ((request, response, next) => {
    if(request.role == 'admin' || request.role == 'doctor') {
        next();
    } else {
        let error = new Error('Not allow for you to display or update the information of this prescription');
        error.status = 403;
        next(error);
    }
})

//Used in clinic
module.exports.checkAdminOrManager = ((request, response, next) => {
    if(request.role == 'admin') {
        next()
    }
    else if(request.role == 'doctor') {
        ClinicSchema.findOne({_id: request.params.id}, {manager: 1, _id: 0}).then(function(data) {
            if(data.manager == request.id) {
                next()
            }
            else {
                let error = new Error('Not allow for you to display or update the information of this clinic');
                error.status = 403;
                next(error);
            }
        })
    } 
    else {
        let error = new Error('Not allow for you to display the information of this doctor');
        error.status = 403;
        next(error);
    }
})

//Used in employee
module.exports.checkAdminOrManagerEmployee = ((request, response, next) => {
    if(request.role == 'admin' || request.role == 'doctor') {
        next()
    } 
    else {
        let error = new Error('Not allow for you to display the information of this employee');
        error.status = 403;
        next(error);
    }
})

//used
module.exports.checkAdminOrEmployee = ((request, response, next) => {
    if (request.role == 'admin' || (request.role == 'employee' && request.id == request.params.id)) {
        next();
    } else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

//Used
module.exports.checkPatient = ((request, response, next) => {
    if (request.role == 'patient') {
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

module.exports.checkAdminOrPatient = ((request, response, next) => {
    if (request.role == 'admin' || (request.role == 'patient' && request.id == request.params.id)) {
        next();
    } else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})

module.exports.checkPatientOrDoctorOrEmployee = ((request, response, next) => {
    if (request.role == 'doctor' || request.role == 'patient' || request.role == "employee") {
        next();
    } else {
        let error = new Error('Not Authorized');
        error.status = 403;
        next(error);
    }
})