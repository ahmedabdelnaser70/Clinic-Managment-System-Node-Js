const mongoose = require('mongoose');
const helper = require("../helper/helperFunctions");
require('../Models/appointmentModel');
require('../Models/clinicModel');
require('../Models/doctorModel');
require('../Models/patientModel');
require('../Models/employeeModel');
const appointmentSchema = mongoose.model('appointments');
const clinicSchema = mongoose.model('clinics');
const doctorSchema = mongoose.model('doctors');
const patientSchema = mongoose.model('patients');

exports.getAllAppointments = (request, response, next) => {
    let sortAndFiltering = helper.sortAndFiltering(request);
	if(request.query.select && request.query.select.split(',').indexOf("doctorName") == -1) {
		sortAndFiltering.selectedFields.doctorName = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
	appointmentSchema.find(sortAndFiltering.reqQuery, sortAndFiltering.selectedFields)
    .populate([
        {
            path: 'doctorName', 
            populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
            select: { firstName: 1, lastName: 1, specialty: 1, phone: 1}},
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
	if(request.query.select && request.query.select.split(',').indexOf("doctorName") == -1) {
		sortAndFiltering.selectedFields.doctorName = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("patient") == -1) {
		sortAndFiltering.selectedFields.patient = 0;
	}
	if(request.query.select && request.query.select.split(',').indexOf("clinic") == -1) {
		sortAndFiltering.selectedFields.clinic = 0;
	}
	appointmentSchema.find({_id: request.params.id}, sortAndFiltering.selectedFields)
    .populate([
        {
            path: 'doctorName', 
            populate: ({path: "specialty", model:"specialties", select: {specialty: 1, _id: 0}}),
            select: { firstName: 1, lastName: 1, specialty: 1, phone: 1}},
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
    
    clinicSchema.findOne({ _id: request.body.clinic })
        .then(clinic => {
            if(clinic) {
                doctorSchema.findOne({ _id: request.body.doctor })
                    .then(doctor => {
                        if(doctor) {
                            patientSchema.findOne({ _id: request.body.patient })
                                .then(patient => {
                                    if(patient) {
                                        appointmentSchema.findOne({ doctorName: request.body.doctor, date: request.body.date, timeFrom: request.body.timeFrom })
                                            .then(existAppointment => {
                                                if(existAppointment) {
                                                    ResponseObject.Success = false;
                                                    ResponseObject.Message = "Doctor cannot have two appointment at same time"
                                                    response.status(201).json(ResponseObject)
                                                    
                                                } 
                                                else {
                                                    let newAppointment = appointmentSchema({
                                                        clinic: request.body.clinic,
                                                        doctorName: request.body.doctor,
                                                        patient: request.body.patient,
                                                        date: request.body.date,
                                                        timeFrom: request.body.timeFrom,
                                                        timeTo: request.body.timeTo
                                                    })
                                                    newAppointment.save()
                                                        .then(result => {
                                                            ResponseObject.Data = [result];
                                                            response.status(201).json(ResponseObject);
                                                        })
                                                        .catch(error => {
                                                            next(error);
                                                        })
                                                }
                                            })
                                    } 
                                    else {
                                        ResponseObject.Success = false;
                                        ResponseObject.Message = "The entered patient does not exist"
                                        response.status(201).json(ResponseObject)
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
    clinicSchema.findOne({ _id: request.body.clinic })
        .then(clinic => {
            if (clinic) {
                doctorSchema.findOne({ _id: request.body.doctor })
                    .then(doctor => {
                        if (doctor) {
                            patientSchema.findOne({ _id: request.body.patient })
                                .then(patient => {
                                    if (patient) {
                                        appointmentSchema.updateOne({
                                            _id: request.params.id
                                        }, {
                                            $set: {
                                                clinic: request.body.clinic,
                                                doctorName: request.body.doctor,
                                                patient: request.body.patient,
                                                date: request.body.date,
                                                timeFrom: request.body.timeFrom,
                                                timeTo: request.body.timeTo
                                            }
                                        })
                                            .then(result => {
                                                response.status(201).json({
                                                    message: "updated successfully"
                                                });
                                            })
                                            .catch(error => {
                                                next(error);
                                            })
                                    } else {
                                        next(new Error('The entered patient does not exist'));
                                    }
                                })
                        } else {
                            next(new Error('The entered doctor does not exist'));
                        }
                    })
            } else {
                next(new Error('The entered clinic does not exist'));
            }
        })
        .catch(error => {
            next(error);
        })
}

exports.deleteAppointmentById = (request, response, next) => {
    appointmentSchema.deleteOne({
        _id: request.params.id
    })
        .then(result => {
            response.status(201).json(result);
        })
        .catch(error => {
            next(error);
        })
}