const { request, response } = require('express');
const mongoose = require('mongoose');
const helper = require("../helper/helperFunctions");
require('../Models/appointmentModel');
require('../Models/clinicModel');
require('../Models/doctorModel');
require('../Models/patientModel');
require('../Models/employeeModel');
const AppointmentSchema = mongoose.model('appointments');
const ClinicSchema = mongoose.model('clinics');
const DoctorSchema = mongoose.model('doctors');
const PatientSchema = mongoose.model('patients');

exports.getAllAppointments = (request, response, next) => {
    let sortAndFiltering = helper.sortAndFiltering(request);
	if(request.query.select && request.query.select.split(',').indexOf("doctor") == -1) {
		sortAndFiltering.selectedFields.doctor = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
	AppointmentSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
    .populate([
        {
            path: 'doctor', 
            populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
            select: { firstName: 1, lastName: 1, specialty: 1}},
        {
            path: 'patient', 
            select: {firstName: 1, lastName: 1, age: 1}
        },
        {
            path: 'clinic', 
            select: {location: 1, mobilePhone: 1}}
    ])
    .sort(sortAndFiltering.sortedFields)
    .then(result => {
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
			ResponseObject.Message = 'No appointments are found';
		}
		response.status(200).json(ResponseObject);
    })
    .catch(error => {
        next(error);
    })
}

exports.getAppointmentById = (request, response, next) => {
    let sortAndFiltering = helper.sortAndFiltering(request);
	if(request.query.select && request.query.select.split(',').indexOf("doctor") == -1) {
		sortAndFiltering.selectedFields.doctor = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
	AppointmentSchema.find({_id: request.params.id}, sortAndFiltering.selectedFields)
    .populate([
        {
            path: 'doctor', 
            populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
            select: { firstName: 1, lastName: 1, specialty: 1}},
        {
            path: 'patient', 
            select: {firstName: 1, lastName: 1, age: 1}
        },
        {
            path: 'clinic', 
            select: {location: 1, mobilePhone: 1}}
    ])
    .sort(sortAndFiltering.sortedFields)
    .then(result => {
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
			ResponseObject.Message = 'No appointment is found';
		}
		response.status(200).json(ResponseObject);
    })
    .catch(error => {
        next(error);
    })
}

exports.addAppointment = (request, response, next) => {
    let ResponseObject = {
		Success: true,
		Data: [],
		Message: "The appointment is added succesfully",
		TotalPages: 1
	}
    
    ClinicSchema.findOne({ _id: request.body.clinic })
        .then(clinic => {
            if(clinic) {
                DoctorSchema.findOne({ _id: request.body.doctor })
                    .then(doctor => {
                        if(doctor) {
                            AppointmentSchema.findOne({ doctor: request.body.doctor, date: request.body.date, timeFrom: request.body.timeFrom })
                            .then(existAppointment => {
                                if(existAppointment) {
                                    ResponseObject.Success = false;
                                    ResponseObject.Message = "Doctor cannot have two appointment at same time"
                                    response.status(201).json(ResponseObject)
                                    
                                } 
                                else {
                                    let newAppointment = AppointmentSchema({
                                        clinic: request.body.clinic,
                                        doctor: request.body.doctor,
                                        patient: -1,
                                        booked: false,
                                        date: request.body.date,
                                        timeFrom: request.body.timeFrom,
                                        timeTo: request.body.timeTo
                                    })
                                    newAppointment.save()
                                        .then(result => {
                                            result.populate([
                                                {
                                                    path: 'doctor', 
                                                    populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
                                                    select: { firstName: 1, lastName: 1, specialty: 1}},
                                                {
                                                    path: 'patient', 
                                                    select: {firstName: 1, lastName: 1, age: 1}
                                                },
                                                {
                                                    path: 'clinic', 
                                                    select: {location: 1, mobilePhone: 1}}
                                            ]).then(function() {
                                                ResponseObject.Data = [result];
                                                response.status(201).json(ResponseObject);
                                            })
                                        })
                                        .catch(error => {
                                            next(error);
                                        })
                                }
                            })
                        } 
                        else {
                            ResponseObject.Success = false;
                            ResponseObject.Message = "The entered doctor does not exist"
                            response.status(201).json(ResponseObject)
                        }
                    })
            } 
            else {
                ResponseObject.Success = false;
                ResponseObject.Message = "The entered clinic does not exist"
                response.status(201).json(ResponseObject)
            }
        })
        .catch(error => {
            next(error);
        })
}

exports.updateAppointmentById = (request, response, next) => {
    let ResponseObject = {
		Success: true,
		Data: [],
		Message: "The appointment is updated successfully",
		TotalPages: 1
	}
    if(request.body.clinic != undefined) {
        ClinicSchema.findOne({_id: request.body.clinic})
        .then(function(res) {
            if(res) {
                checkDoctor(request, response, next, ResponseObject);
            }
            else {
                ResponseObject.Success = false;
                ResponseObject.Message = "The clinic is not exist";
                response.status(201).json(ResponseObject);
            }
        })
    }
    else {
        checkDoctor(request, response, next, ResponseObject);
    }
}

exports.bookAppointment = (request, response, next) => {
    let ResponseObject = {
		Success: true,
		Data: [],
		Message: "The appointment is booked successfully",
		TotalPages: 1
	}
    let booking = {
        patient: -1,
        booked: false
    }
    if(request.body.booked) {
        booking.booked = true
        PatientSchema.findOne({_id: request.body.patient})
        .then(function(res) {
            if(res) {
                booking.patient = +request.body.patient;
                updating(request, response, next, booking, ResponseObject);
            }
            else {
                ResponseObject.Message = "The patient not found";
                response.status(201).json(ResponseObject);
            }
        })
    }
    else {
        updating(request, response, next, booking, ResponseObject);
    }
}

exports.deleteAppointmentById = (request, response, next) => {
    let ResponseObject = {
		Success: true,
	}
    AppointmentSchema.deleteOne({_id: request.params.id})
        .then(result => {
            if(result.acknowledged && result.deletedCount == 1) {
                ResponseObject.Message = "This appointment is deleted successfully";
			}
			else {
				ResponseObject.Success = false
				ResponseObject.Message = "This appointment is not deleted";
			}
			response.status(200).json(ResponseObject);
        })
        .catch(error => {
            next(error);
        })
}

function checkDoctor(request, response, next, ResponseObject) {
    let nameProperty = ["clinic", "doctor", "date", "timeFrom", "timeTo"];
    let changes = {};
    for(let item of nameProperty) {
        if(request.body[item] != undefined) {
            changes[item] = request.body[item];
        }
    }
    if(request.body.doctor != undefined) {
        DoctorSchema.findOne({_id: request.body.doctor})
        .then(function(res) {
            if(res) {
                if(Object.keys(changes).length == 0) {
                    ResponseObject.Message = "Nothing changed";
                    response.status(201).json(ResponseObject)
                }
                else {
                    updating(request,  response, next, changes, ResponseObject)
                }
            }
            else {
                ResponseObject.Success = false
                ResponseObject.Message = "This doctor is not exist";
                response.status(201).json(ResponseObject)
            }
        })
    }
    else {
        if(Object.keys(changes).length == 0) {
            ResponseObject.Message = "Nothing changed";
            response.status(201).json(ResponseObject)
        }
        else {
            updating(request,  response, next, changes, ResponseObject)
        }
    }
}

function updating(request, response, next, changes, ResponseObject) {
    AppointmentSchema.updateOne({_id: request.params.id}, {$set: changes})
        .then(result => {
            if(result.modifiedCount == 0) {
                ResponseObject.Message = "Nothing is changed";
                response.status(201).json(ResponseObject);
            }
            else {
                response.status(201).json(ResponseObject);
            }
        })
        .catch(error => {
            next(error);
        })
}